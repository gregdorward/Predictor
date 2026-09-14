#!/usr/bin/env node
/**
 * Run the same backtest window once per score-distribution family and
 * print mean Brier / log-loss / accuracy / ROI for comparison.
 *
 * Usage:
 *   node scripts/sweep-score-families.mjs --from YYYY-MM-DD --to YYYY-MM-DD [--no-upload]
 *
 * Extra args are forwarded to the backtest CLI. SCORE_MODEL_FAMILY is set
 * by this script for each run.
 */

import { spawnSync } from "child_process";
import { readFileSync, readdirSync, existsSync, statSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");
const FAMILIES = ["poisson", "poisson_indep", "negbin", "bivariate", "zip"];

function parseForwardArgs(argv) {
  const args = [];
  for (let i = 2; i < argv.length; i += 1) {
    args.push(argv[i]);
  }
  if (!args.includes("--no-upload") && !args.includes("--upload")) {
    args.push("--no-upload");
  }
  return args;
}

function latestSummaryPath(beforeMs) {
  const outputRoot = resolve(projectRoot, "scripts/output");
  if (!existsSync(outputRoot)) return null;
  const dirs = readdirSync(outputRoot, { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name.startsWith("backtest-"))
    .map((d) => {
      const dir = resolve(outputRoot, d.name);
      const summary = resolve(dir, "summary.json");
      if (!existsSync(summary)) return null;
      const { mtimeMs } = statSync(summary);
      return { summary, mtimeMs };
    })
    .filter(Boolean)
    .filter((entry) => entry.mtimeMs >= beforeMs - 50)
    .sort((a, b) => b.mtimeMs - a.mtimeMs);
  return dirs[0]?.summary ?? null;
}

function readSummary(path) {
  if (!path) return null;
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return null;
  }
}

function fmt(value, digits = 4) {
  if (value == null || !Number.isFinite(Number(value))) return "—";
  return Number(value).toFixed(digits);
}

const forwardArgs = parseForwardArgs(process.argv);
const results = [];

console.log(
  `Sweeping score families over: npm run backtest -- ${forwardArgs.join(" ")}\n`
);

for (const family of FAMILIES) {
  console.log(`\n=== SCORE_MODEL_FAMILY=${family} ===`);
  const started = Date.now();
  const run = spawnSync("npm", ["run", "backtest", "--", ...forwardArgs], {
    cwd: projectRoot,
    env: { ...process.env, SCORE_MODEL_FAMILY: family },
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  if (run.status !== 0) {
    console.error(`Family ${family} failed with exit ${run.status}`);
    results.push({ family, error: true });
    continue;
  }

  const summaryPath = latestSummaryPath(started);
  const summary = readSummary(summaryPath);
  results.push({
    family,
    error: false,
    predicted: summary?.predicted ?? null,
    meanBrier: summary?.meanBrier ?? null,
    meanLogLoss: summary?.meanLogLoss ?? null,
    outcomeAccuracy: summary?.outcomeAccuracy ?? null,
    exactScoreRate: summary?.exactScoreRate ?? null,
    roi: summary?.roi ?? null,
    summaryPath,
  });
}

console.log("\n\nScore-family comparison (lower Brier / log-loss is better)");
console.log(
  [
    "family".padEnd(14),
    "n".padStart(6),
    "Brier".padStart(10),
    "logLoss".padStart(10),
    "acc%".padStart(8),
    "exact%".padStart(8),
    "ROI%".padStart(8),
  ].join(" ")
);
console.log("-".repeat(70));

for (const row of results) {
  if (row.error) {
    console.log(`${row.family.padEnd(14)} FAILED`);
    continue;
  }
  console.log(
    [
      row.family.padEnd(14),
      String(row.predicted ?? "—").padStart(6),
      fmt(row.meanBrier, 6).padStart(10),
      fmt(row.meanLogLoss, 6).padStart(10),
      fmt(row.outcomeAccuracy, 2).padStart(8),
      fmt(row.exactScoreRate, 2).padStart(8),
      fmt(row.roi, 2).padStart(8),
    ].join(" ")
  );
}

const ok = results.filter((r) => !r.error && r.meanBrier != null);
if (ok.length) {
  const best = [...ok].sort((a, b) => a.meanBrier - b.meanBrier)[0];
  console.log(
    `\nLowest mean Brier: ${best.family} (${fmt(best.meanBrier, 6)}). Leave production on poisson unless a challenger wins on holdout.`
  );
}
