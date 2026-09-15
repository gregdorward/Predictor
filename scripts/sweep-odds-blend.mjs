#!/usr/bin/env node
/**
 * Sweep SCORE_ODDS_BLEND (market 1X2 into model probs; λ unchanged).
 * Rank primarily by Brier, then ROI.
 *
 * Usage:
 *   node scripts/sweep-odds-blend.mjs --from 2026-07-01 --to 2026-09-15
 */

import { spawnSync } from "child_process";
import { readFileSync, readdirSync, existsSync, statSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");

const VARIANTS = [
  { id: "blend0", label: "ODDS_BLEND=0 (pure model)", env: { SCORE_ODDS_BLEND: "0" } },
  { id: "blend15", label: "ODDS_BLEND=0.15", env: { SCORE_ODDS_BLEND: "0.15" } },
  { id: "blend25", label: "ODDS_BLEND=0.25", env: { SCORE_ODDS_BLEND: "0.25" } },
  { id: "blend35", label: "ODDS_BLEND=0.35", env: { SCORE_ODDS_BLEND: "0.35" } },
  { id: "blend50", label: "ODDS_BLEND=0.50", env: { SCORE_ODDS_BLEND: "0.5" } },
  { id: "blend75", label: "ODDS_BLEND=0.75", env: { SCORE_ODDS_BLEND: "0.75" } },
];

function parseArgs(argv) {
  const args = [];
  for (let i = 2; i < argv.length; i += 1) args.push(argv[i]);
  if (!args.includes("--no-upload") && !args.includes("--upload")) {
    args.push("--no-upload");
  }
  if (!args.includes("--replay-model") && !args.includes("--use-snapshots")) {
    args.push("--replay-model");
  }
  if (!args.includes("--delay-ms")) {
    args.push("--delay-ms", "0");
  }
  return args;
}

function latestSummaryPath(beforeMs) {
  const outputRoot = resolve(projectRoot, "scripts/output");
  if (!existsSync(outputRoot)) return null;
  return readdirSync(outputRoot, { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name.startsWith("backtest-"))
    .map((d) => {
      const summary = resolve(outputRoot, d.name, "summary.json");
      if (!existsSync(summary)) return null;
      return { summary, mtimeMs: statSync(summary).mtimeMs };
    })
    .filter(Boolean)
    .filter((e) => e.mtimeMs >= beforeMs - 50)
    .sort((a, b) => b.mtimeMs - a.mtimeMs)[0]?.summary ?? null;
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

const forwardArgs = parseArgs(process.argv);
const results = [];

console.log("Building backtest bundle once…");
const build = spawnSync("node", ["scripts/build-backtest-bundle.mjs"], {
  cwd: projectRoot,
  stdio: "inherit",
  shell: process.platform === "win32",
});
if (build.status !== 0) process.exit(1);

for (const variant of VARIANTS) {
  console.log(`\n=== ${variant.id}: ${variant.label} ===`);
  const started = Date.now();
  const run = spawnSync(
    "node",
    ["scripts/.backtest-bundle.mjs", ...forwardArgs],
    {
      cwd: projectRoot,
      env: { ...process.env, ...variant.env },
      stdio: "inherit",
      shell: process.platform === "win32",
    }
  );
  if (run.status !== 0) {
    results.push({ ...variant, error: true });
    continue;
  }
  const summary = readSummary(latestSummaryPath(started));
  results.push({
    id: variant.id,
    label: variant.label,
    env: variant.env,
    error: false,
    predicted: summary?.predicted ?? null,
    meanBrier: summary?.meanBrier ?? null,
    meanLogLoss: summary?.meanLogLoss ?? null,
    outcomeAccuracy: summary?.outcomeAccuracy ?? null,
    exactScoreRate: summary?.exactScoreRate ?? null,
    roi: summary?.roi ?? null,
  });
}

console.log("\n\nOdds-blend comparison (rank by Brier, then ROI)");
console.log(
  [
    "id".padEnd(12),
    "n".padStart(6),
    "Brier".padStart(10),
    "logloss".padStart(10),
    "ROI%".padStart(8),
    "acc%".padStart(8),
    "exact%".padStart(8),
  ].join(" ")
);
console.log("-".repeat(66));

const ranked = [...results]
  .filter((r) => !r.error)
  .sort(
    (a, b) =>
      (a.meanBrier ?? 9) - (b.meanBrier ?? 9) ||
      (b.roi ?? -999) - (a.roi ?? -999)
  );

for (const row of ranked) {
  console.log(
    [
      row.id.padEnd(12),
      String(row.predicted ?? "—").padStart(6),
      fmt(row.meanBrier, 6).padStart(10),
      fmt(row.meanLogLoss, 6).padStart(10),
      fmt(row.roi, 2).padStart(8),
      fmt(row.outcomeAccuracy, 2).padStart(8),
      fmt(row.exactScoreRate, 2).padStart(8),
    ].join(" ")
  );
}

const outPath = resolve(projectRoot, "scripts/output/odds-blend-sweep.json");
writeFileSync(
  outPath,
  JSON.stringify({ generatedAt: new Date().toISOString(), results }, null, 2)
);
console.log(`\nWrote ${outPath}`);
if (ranked[0]) {
  console.log(
    `Best Brier: ${ranked[0].id} (${fmt(ranked[0].meanBrier, 6)}; ROI ${fmt(ranked[0].roi, 2)}%)`
  );
}
