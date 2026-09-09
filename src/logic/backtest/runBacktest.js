import { mkdirSync, writeFileSync } from "fs";
import { resolve } from "path";

import {
  calculateScore,
  isBelowMinMatchesForPrediction,
  setSingleMatchPredictionData,
  setSshSnapshotPersistEnabled,
  resetSshSnapshotState,
} from "../getScorePredictions.js";
import {
  allForm,
  allLeagueResultsArrayOfObjects,
} from "../getFixtures.js";
import { getStoredSshScoreline } from "../freezePredictedScoreline.js";
import { loadBacktestEnv } from "./loadEnv.js";
import { fetchGlobalBacktestData, loadDayData } from "./loadDayData.js";
import {
  evaluateMatch,
  aggregateResults,
  aggregateSelectiveResults,
  aggregateEdgeCurve,
} from "./evaluateMatch.js";
import {
  buildResultsCsv,
  buildResultsJson,
  buildSummaryJson,
} from "./formatOutput.js";
import { uploadBacktestArtifacts } from "./uploadToS3.js";
import { eachDateInclusive, sleep } from "./dateUtils.js";
import {
  buildLeagueAveragesAsOf,
  persistLeagueAveragesForDate,
} from "../../utils/leagueAverages.js";

function attachCachedForm(match) {
  const fixtureForm = allForm.find(
    (game) =>
      game.id === match.id ||
      (game.home?.teamName === match.homeTeam &&
        game.away?.teamName === match.awayTeam)
  );
  if (fixtureForm?.home?.[2]) {
    match.formHome = fixtureForm.home[2];
  }
  if (fixtureForm?.away?.[2]) {
    match.formAway = fixtureForm.away[2];
  }
  return match;
}

export async function runBacktest(cliArgs = {}) {
  loadBacktestEnv();

  const params = {
    from: cliArgs.from,
    to: cliArgs.to,
    format: cliArgs.format ?? "both",
    upload: cliArgs.upload !== false,
    delayMs: Number(cliArgs.delayMs ?? 500),
    replayModel: cliArgs.replayModel === true,
    minEdge: cliArgs.minEdge != null ? Number(cliArgs.minEdge) : null,
    edgeCurve: cliArgs.edgeCurve === true,
  };

  if (!params.from || !params.to) {
    throw new Error("Both --from and --to are required (YYYY-MM-DD).");
  }

  const apiOrigin = process.env.NEXT_PUBLIC_EXPRESS_SERVER;
  const runId = new Date().toISOString().replace(/[:.]/g, "-");

  console.log(`Backtest run ${runId}`);
  console.log(`Range: ${params.from} → ${params.to}`);

  setSshSnapshotPersistEnabled(false);
  resetSshSnapshotState();

  const {
    leagueResults,
    leagueAveragesFallback,
    predictedScores: storedPredictedScores,
  } = await fetchGlobalBacktestData(apiOrigin);

  const kickoffPredictedScores = params.replayModel
    ? []
    : storedPredictedScores || [];

  if (params.replayModel) {
    console.log(
      "Scorelines: replay current model (ignoring kickoff snapshots)"
    );
  } else {
    console.log(
      `Scorelines: kickoff snapshots (${kickoffPredictedScores.length} stored rows)`
    );
    if (kickoffPredictedScores.length === 0) {
      console.warn(
        "No predictedScores2 snapshots loaded; falling back to live model replay."
      );
    }
  }

  const allRows = [];
  const skippedDays = [];
  let daysWithDatedAverages = 0;
  let daysWithAsOfAverages = 0;
  let daysWithFallbackAverages = 0;
  let usedKickoffSnapshot = 0;
  let usedLiveReplay = 0;

  for (const date of eachDateInclusive(params.from, params.to)) {
    const day = await loadDayData(date, apiOrigin);

    if (day.skipped) {
      console.warn(`Skipping ${day.isoDate}: ${day.reason}`);
      skippedDays.push({
        date: day.isoDate,
        formKey: day.formKey,
        reason: day.reason,
      });
      await sleep(params.delayMs);
      continue;
    }

    allForm.length = 0;
    allForm.push(...day.allForm);

    allLeagueResultsArrayOfObjects.length = 0;
    allLeagueResultsArrayOfObjects.push(...leagueResults);

    let leagueAverages = day.leagueAverages;
    if (day.leagueAverages) {
      daysWithDatedAverages += 1;
    } else {
      const asOf = buildLeagueAveragesAsOf(leagueResults, day.isoDate);
      if (asOf.length > 0) {
        leagueAverages = asOf;
        daysWithAsOfAverages += 1;
        await persistLeagueAveragesForDate(day.formKey, asOf, apiOrigin);
      } else if (leagueAveragesFallback) {
        leagueAverages = leagueAveragesFallback;
        daysWithFallbackAverages += 1;
        console.warn(
          `No dated league averages for ${day.isoDate}; using latest global snapshot (home/away splits may use heuristic).`
        );
      }
    }

    setSingleMatchPredictionData({
      leagueAverages,
      predictedScores: kickoffPredictedScores,
      applyOverlay: false,
    });

    let dayPredicted = 0;
    let daySkippedEarly = 0;

    for (const match of day.matches) {
      if (match.status === "canceled") {
        continue;
      }

      attachCachedForm(match);

      // Same gate as the live site: MCM < 3 OR either side has < 3 season games
      // (FootyStats MCM can be inflated early season).
      if (isBelowMinMatchesForPrediction(match)) {
        daySkippedEarly += 1;
        allRows.push(
          evaluateMatch(
            {
              ...match,
              goalsA: "x",
              goalsB: "x",
              completeData: false,
              predictionsUnavailable: true,
            },
            day.isoDate,
            "cached"
          )
        );
        continue;
      }

      try {
        const result = await calculateScore(match, 2, 10, true, [], []);
        [
          match.goalsA,
          match.goalsB,
          match.unroundedGoalsA,
          match.unroundedGoalsB,
        ] = result;
        match.completeData = true;

        // Belt-and-suspenders: if calc still marks the fixture thin, don't score it.
        if (
          isBelowMinMatchesForPrediction(match) ||
          match.predictionsUnavailable === true ||
          match.goalsA === "x" ||
          match.goalsB === "x"
        ) {
          daySkippedEarly += 1;
          allRows.push(
            evaluateMatch(
              {
                ...match,
                goalsA: "x",
                goalsB: "x",
                completeData: false,
                predictionsUnavailable: true,
              },
              day.isoDate,
              "cached"
            )
          );
          continue;
        }

        dayPredicted += 1;
        if (getStoredSshScoreline(kickoffPredictedScores, match.id)) {
          usedKickoffSnapshot += 1;
        } else {
          usedLiveReplay += 1;
        }
      } catch (error) {
        console.error(`Prediction failed for match ${match.id}:`, error);
        allRows.push({
          ...evaluateMatch(match, day.isoDate, "cached"),
          skippedReason: "prediction_error",
        });
        continue;
      }

      allRows.push(evaluateMatch(match, day.isoDate, "cached"));
    }

    console.log(
      `Processed ${day.isoDate}: ${day.matches.length} completed fixtures, ${dayPredicted} predicted, ${daySkippedEarly} skipped (early season)`
    );

    await sleep(params.delayMs);
  }

  const summary = aggregateResults(allRows);
  if (params.minEdge != null && Number.isFinite(params.minEdge)) {
    summary.selective = aggregateSelectiveResults(allRows, params.minEdge);
  }
  if (params.edgeCurve) {
    summary.edgeCurve = aggregateEdgeCurve(allRows);
  }
  summary.skippedNoForm = skippedDays.length;
  summary.scorelineSource = params.replayModel
    ? "replay_model"
    : "kickoff_snapshot";
  summary.usedKickoffSnapshot = usedKickoffSnapshot;
  summary.usedLiveReplay = usedLiveReplay;
  summary.leagueAveragesCoverage = {
    datedDays: daysWithDatedAverages,
    asOfDays: daysWithAsOfAverages,
    fallbackDays: daysWithFallbackAverages,
  };

  const resultsJson = buildResultsJson(allRows);
  const summaryJson = buildSummaryJson({
    runId,
    params,
    summary,
    skippedDays,
  });
  const resultsCsv = buildResultsCsv(allRows);

  const outputDir = resolve(
    process.cwd(),
    "scripts/output",
    `backtest-${runId}`
  );
  mkdirSync(outputDir, { recursive: true });
  writeFileSync(
    resolve(outputDir, "results.json"),
    JSON.stringify(resultsJson, null, 2)
  );
  writeFileSync(
    resolve(outputDir, "summary.json"),
    JSON.stringify(summaryJson, null, 2)
  );
  writeFileSync(resolve(outputDir, "results.csv"), resultsCsv);

  console.log("\nSummary");
  console.log(`  Matches in report: ${summary.totalMatches}`);
  console.log(`  Predicted: ${summary.predicted}`);
  console.log(`  Outcome accuracy: ${summary.outcomeAccuracy}%`);
  console.log(`  Exact score rate: ${summary.exactScoreRate}%`);
  console.log(`  ROI (flat 1-unit): ${summary.roi}%`);
  console.log("\nBy predicted outcome");
  for (const [outcome, label] of [
    ["homeWin", "Home win"],
    ["draw", "Draw"],
    ["awayWin", "Away win"],
  ]) {
    const bucket = summary.byPrediction[outcome];
    console.log(
      `  ${label}: ${bucket.predicted} predicted, ${bucket.correct} correct (${bucket.accuracy}%), ROI ${bucket.roi}%`
    );
  }
  console.log(`\n  Days skipped (no cached form): ${skippedDays.length}`);
  console.log(
    `  Scorelines used: ${usedKickoffSnapshot} kickoff snapshot(s), ${usedLiveReplay} live replay(s)`
  );
  console.log(
    `  League averages: ${daysWithDatedAverages} dated snapshot(s), ${daysWithAsOfAverages} as-of day(s), ${daysWithFallbackAverages} global fallback day(s)`
  );
  console.log(`  Local output: ${outputDir}`);

  let uploaded = [];
  if (params.upload) {
    if (!process.env.ID || !process.env.SECRET) {
      console.warn("AWS credentials missing - skipping S3 upload.");
    } else {
      uploaded = await uploadBacktestArtifacts({
        runId,
        resultsJson,
        summaryJson,
        resultsCsv,
        format: params.format,
      });
      console.log("Uploaded:");
      uploaded.forEach((key) => console.log(`  ${key}`));
    }
  }

  return {
    runId,
    outputDir,
    uploaded,
    summary: summaryJson,
  };
}
