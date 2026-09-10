import {
  applyScoreModelFromEnv,
  resetClearOutcomeMargin,
  resetUseResultSnapshots,
} from "../src/logic/getScorePredictions.js";
import { resetMaxOutcomeEdge } from "../src/logic/scoreModelConfig.js";
import { resetTipFilters } from "../src/logic/tipFilters.js";
import { runBacktest } from "../src/logic/backtest/runBacktest.js";
import { parseBacktestArgs } from "./backtest-predictions.mjs";

async function main() {
  try {
    resetClearOutcomeMargin();
    resetUseResultSnapshots();
    resetMaxOutcomeEdge();
    resetTipFilters();
    applyScoreModelFromEnv();
    const args = parseBacktestArgs();
    await runBacktest(args);
  } catch (error) {
    console.error(error.message || error);
    process.exit(1);
  }
}

main();
