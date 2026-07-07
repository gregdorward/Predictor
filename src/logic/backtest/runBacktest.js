import { mkdirSync, writeFileSync } from "fs";
import { resolve } from "path";

import {
  calculateScore,
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

  const { leagueResults, leagueAverages } = await fetchGlobalBacktestData(
    apiOrigin
  );

  const allRows = [];
  const skippedDays = [];

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

    setSingleMatchPredictionData({
      leagueAverages,
      predictedScores: [],
    });

    let dayPredicted = 0;

    for (const match of day.matches) {
      if (match.status === "canceled") {
        continue;
      }

      if (match.matches_completed_minimum < 3) {
        allRows.push(
          evaluateMatch(
            { ...match, goalsA: "x", goalsB: "x", completeData: false },
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
      `Processed ${day.isoDate}: ${day.matches.length} completed fixtures, ${dayPredicted} predicted`
    );

    await sleep(params.delayMs);
  }

  const summary = aggregateResults(allRows);
  summary.skippedNoForm = skippedDays.length;

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
  console.log(`  Days skipped (no cached form): ${skippedDays.length}`);
  console.log(`  Local output: ${outputDir}`);

  let uploaded = [];
  if (params.upload) {
    if (!process.env.ID || !process.env.SECRET) {
      console.warn("AWS credentials missing — skipping S3 upload.");
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
