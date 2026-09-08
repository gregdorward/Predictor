import { applyScoreModelFromEnv } from "../src/logic/getScorePredictions.js";
import { runBacktest } from "../src/logic/backtest/runBacktest.js";
import { parseBacktestArgs } from "./backtest-predictions.mjs";

async function main() {
  try {
    applyScoreModelFromEnv();
    const args = parseBacktestArgs();
    await runBacktest(args);
  } catch (error) {
    console.error(error.message || error);
    process.exit(1);
  }
}

main();
