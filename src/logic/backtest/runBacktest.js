import { mkdirSync, writeFileSync } from "fs";
import { resolve } from "path";

import {
  calculateScore,
  isBelowMinMatchesForPrediction,
  setSingleMatchPredictionData,
} from "../getScorePredictions.js";
import {
  allForm,
  allLeagueResultsArrayOfObjects,
} from "../getFixtures.js";
import { loadBacktestEnv } from "./loadEnv.js";
import { fetchGlobalBacktestData, loadDayData } from "./loadDayData.js";
import { evaluateMatch, aggregateResults } from "./evaluateMatch.js";
import {
  buildResultsCsv,
  buildResultsJson,
  buildSummaryJson,
} from "./formatOutput.js";
import { uploadBacktestArtifacts } from "./uploadToS3.js";
import { eachDateInclusive, sleep } from "./dateUtils.js";

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
  };

  if (!params.from || !params.to) {
    throw new Error("Both --from and --to are required (YYYY-MM-DD).");
  }

  const apiOrigin = process.env.NEXT_PUBLIC_EXPRESS_SERVER;
  const runId = new Date().toISOString().replace(/[:.]/g, "-");

  console.log(`Backtest run ${runId}`);
  console.log(`Range: ${params.from} → ${params.to}`);

  const { leagueResults, leagueAveragesFallback } = await fetchGlobalBacktestData(
    apiOrigin
  );

  const allRows = [];
  const skippedDays = [];
  let daysWithDatedAverages = 0;
  let daysWithFallbackAverages = 0;

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

    const leagueAverages = day.leagueAverages ?? leagueAveragesFallback;
    if (day.leagueAverages) {
      daysWithDatedAverages += 1;
    } else if (leagueAveragesFallback) {
      daysWithFallbackAverages += 1;
      console.warn(
        `No dated league averages for ${day.isoDate}; using latest global snapshot (home/away splits may use heuristic).`
      );
    }

    setSingleMatchPredictionData({
      leagueAverages,
      predictedScores: [],
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
  summary.skippedNoForm = skippedDays.length;
  summary.leagueAveragesCoverage = {
    datedDays: daysWithDatedAverages,
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
    `  League averages: ${daysWithDatedAverages} dated snapshot(s), ${daysWithFallbackAverages} global fallback day(s)`
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
