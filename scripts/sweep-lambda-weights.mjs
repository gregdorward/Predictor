#!/usr/bin/env node
/**
 * Sweep lambda-weight knobs over a fixed window.
 * Builds the backtest bundle once, then runs each variant with --delay-ms 0
 * against the warm matches cache (no FootyStats hits).
 *
 * Usage:
 *   node scripts/sweep-lambda-weights.mjs --from 2026-07-01 --to 2026-09-15
 */

import { spawnSync } from "child_process";
import { readFileSync, readdirSync, existsSync, statSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");

const VARIANTS = [
  { id: "baseline", label: "Baseline (current defaults)", env: {} },
  { id: "venue0", label: "VENUE_FORM_WEIGHT=0", env: { VENUE_FORM_WEIGHT: "0" } },
  { id: "xg002", label: "SCORE_XG_DAMP=0.02", env: { SCORE_XG_DAMP: "0.02" } },
  { id: "xg0025", label: "SCORE_XG_DAMP=0.025", env: { SCORE_XG_DAMP: "0.025" } },
  { id: "eff1", label: "SCORE_EFFICIENCY=1", env: { SCORE_EFFICIENCY: "1" } },
  { id: "trend1", label: "SCORE_FORM_TREND=1", env: { SCORE_FORM_TREND: "1" } },
  { id: "clin1", label: "SCORE_CLINICAL=1", env: { SCORE_CLINICAL: "1" } },
  {
    id: "rest095",
    label: "SCORE_REST_HAIRCUT=0.95",
    env: { SCORE_REST_HAIRCUT: "0.95" },
  },
  { id: "sos1", label: "SCORE_SOS_DAMP=1", env: { SCORE_SOS_DAMP: "1" } },
  { id: "cs005", label: "SCORE_CS_WEIGHT=0.05", env: { SCORE_CS_WEIGHT: "0.05" } },
];

function parseArgs(argv) {
  const args = [];
  for (let i = 2; i < argv.length; i += 1) {
    args.push(argv[i]);
  }
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

function drawShare(summary) {
  const by = summary?.byPrediction;
  if (!by) return null;
  const total =
    (by.homeWin?.predicted ?? 0) +
    (by.draw?.predicted ?? 0) +
    (by.awayWin?.predicted ?? 0);
  if (!total) return null;
  return ((by.draw?.predicted ?? 0) / total) * 100;
}

const forwardArgs = parseArgs(process.argv);
const results = [];

console.log("Building backtest bundle once…");
const build = spawnSync("node", ["scripts/build-backtest-bundle.mjs"], {
  cwd: projectRoot,
  stdio: "inherit",
  shell: process.platform === "win32",
});
if (build.status !== 0) {
  console.error("Bundle build failed");
  process.exit(1);
}

console.log(
  `Sweeping lambda weights over: node scripts/.backtest-bundle.mjs ${forwardArgs.join(" ")}\n`
);

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
    console.error(`Variant ${variant.id} failed with exit ${run.status}`);
    results.push({ ...variant, error: true });
    continue;
  }

  const summaryPath = latestSummaryPath(started);
  const summary = readSummary(summaryPath);
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
    drawSharePct: drawShare(summary),
    byPrediction: summary?.byPrediction ?? null,
    summaryPath,
  });
}

// Combo phase: take singles that beat baseline ROI without exploding draw share
const baseline = results.find((r) => r.id === "baseline" && !r.error);
const keepers = results.filter((r) => {
  if (r.error || r.id === "baseline" || baseline == null) return false;
  if (r.roi == null || baseline.roi == null) return false;
  if (r.roi <= baseline.roi) return false;
  const drawDelta =
    r.drawSharePct != null && baseline.drawSharePct != null
      ? r.drawSharePct - baseline.drawSharePct
      : 0;
  // Reject draw-dump wins (>8pp more draws)
  if (drawDelta > 8) return false;
  return true;
});

keepers.sort((a, b) => b.roi - a.roi || a.meanBrier - b.meanBrier);
const top = keepers.slice(0, 3);

if (top.length >= 2) {
  const comboEnv = {};
  for (const k of top) {
    Object.assign(comboEnv, k.env);
  }
  const comboId = `combo_${top.map((t) => t.id).join("+")}`;
  console.log(`\n=== ${comboId} (best singles combined) ===`);
  const started = Date.now();
  const run = spawnSync(
    "node",
    ["scripts/.backtest-bundle.mjs", ...forwardArgs],
    {
      cwd: projectRoot,
      env: { ...process.env, ...comboEnv },
      stdio: "inherit",
      shell: process.platform === "win32",
    }
  );
  if (run.status === 0) {
    const summaryPath = latestSummaryPath(started);
    const summary = readSummary(summaryPath);
    results.push({
      id: comboId,
      label: `Combo: ${top.map((t) => t.label).join(" + ")}`,
      env: comboEnv,
      error: false,
      predicted: summary?.predicted ?? null,
      meanBrier: summary?.meanBrier ?? null,
      meanLogLoss: summary?.meanLogLoss ?? null,
      outcomeAccuracy: summary?.outcomeAccuracy ?? null,
      exactScoreRate: summary?.exactScoreRate ?? null,
      roi: summary?.roi ?? null,
      drawSharePct: drawShare(summary),
      byPrediction: summary?.byPrediction ?? null,
      summaryPath,
    });
  }
}

console.log("\n\nLambda-weight comparison (higher ROI better; lower Brier bonus)");
console.log(
  [
    "id".padEnd(28),
    "n".padStart(6),
    "ROI%".padStart(8),
    "acc%".padStart(8),
    "exact%".padStart(8),
    "Brier".padStart(10),
    "logLoss".padStart(10),
    "draw%".padStart(8),
  ].join(" ")
);
console.log("-".repeat(96));

const ranked = [...results]
  .filter((r) => !r.error)
  .sort((a, b) => (b.roi ?? -999) - (a.roi ?? -999) || (a.meanBrier ?? 9) - (b.meanBrier ?? 9));

for (const row of ranked) {
  console.log(
    [
      row.id.padEnd(28),
      String(row.predicted ?? "—").padStart(6),
      fmt(row.roi, 2).padStart(8),
      fmt(row.outcomeAccuracy, 2).padStart(8),
      fmt(row.exactScoreRate, 2).padStart(8),
      fmt(row.meanBrier, 6).padStart(10),
      fmt(row.meanLogLoss, 6).padStart(10),
      fmt(row.drawSharePct, 1).padStart(8),
    ].join(" ")
  );
}

const outPath = resolve(projectRoot, "scripts/output/lambda-weight-sweep.json");
writeFileSync(outPath, JSON.stringify({ generatedAt: new Date().toISOString(), results }, null, 2));
console.log(`\nWrote ${outPath}`);

if (ranked.length) {
  const best = ranked[0];
  console.log(
    `\nBest ROI: ${best.id} (${fmt(best.roi, 2)}%). Prefer venue=0 when close.`
  );
}
