#!/usr/bin/env node
/**
 * Sweep opponent-adjusted volume metrics and xG→xPts (separate variants).
 *
 * Usage:
 *   node scripts/sweep-opp-adj-xpts.mjs --from 2026-07-01 --to 2026-09-15
 */

import { spawnSync } from "child_process";
import { readFileSync, readdirSync, existsSync, statSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");

const VARIANTS = [
  { id: "baseline", label: "Baseline (opp-adj off, xPts off)", env: {} },
  // Experiment 1: opponent-adjust volume metrics
  { id: "opp025", label: "OPP_ADJ=0.25", env: { SCORE_OPP_ADJ_METRICS: "0.25" } },
  { id: "opp05", label: "OPP_ADJ=0.5", env: { SCORE_OPP_ADJ_METRICS: "0.5" } },
  { id: "opp1", label: "OPP_ADJ=1", env: { SCORE_OPP_ADJ_METRICS: "1" } },
  // Experiment 2: xPts draw-band
  {
    id: "xpts_b15_t02",
    label: "xPts band w=0.15 τ=0.2",
    env: {
      SCORE_XPTS_WEIGHT: "0.15",
      SCORE_XPTS_DRAW_BAND: "0.2",
      SCORE_XPTS_MODE: "band",
    },
  },
  {
    id: "xpts_b15_t03",
    label: "xPts band w=0.15 τ=0.3",
    env: {
      SCORE_XPTS_WEIGHT: "0.15",
      SCORE_XPTS_DRAW_BAND: "0.3",
      SCORE_XPTS_MODE: "band",
    },
  },
  {
    id: "xpts_b15_t05",
    label: "xPts band w=0.15 τ=0.5",
    env: {
      SCORE_XPTS_WEIGHT: "0.15",
      SCORE_XPTS_DRAW_BAND: "0.5",
      SCORE_XPTS_MODE: "band",
    },
  },
  {
    id: "xpts_b10_t03",
    label: "xPts band w=0.10 τ=0.3",
    env: {
      SCORE_XPTS_WEIGHT: "0.10",
      SCORE_XPTS_DRAW_BAND: "0.3",
      SCORE_XPTS_MODE: "band",
    },
  },
  // Experiment 2b: poisson xPts
  {
    id: "xpts_p15",
    label: "xPts poisson w=0.15",
    env: { SCORE_XPTS_WEIGHT: "0.15", SCORE_XPTS_MODE: "poisson" },
  },
  {
    id: "xpts_p10",
    label: "xPts poisson w=0.10",
    env: { SCORE_XPTS_WEIGHT: "0.10", SCORE_XPTS_MODE: "poisson" },
  },
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
    drawSharePct: drawShare(summary),
    summaryPath: latestSummaryPath(started),
  });
}

console.log("\n\nOpp-adj / xPts comparison");
console.log(
  [
    "id".padEnd(28),
    "n".padStart(6),
    "ROI%".padStart(8),
    "acc%".padStart(8),
    "exact%".padStart(8),
    "Brier".padStart(10),
    "draw%".padStart(8),
  ].join(" ")
);
console.log("-".repeat(84));

const ranked = [...results]
  .filter((r) => !r.error)
  .sort(
    (a, b) =>
      (b.roi ?? -999) - (a.roi ?? -999) || (a.meanBrier ?? 9) - (b.meanBrier ?? 9)
  );

for (const row of ranked) {
  console.log(
    [
      row.id.padEnd(28),
      String(row.predicted ?? "—").padStart(6),
      fmt(row.roi, 2).padStart(8),
      fmt(row.outcomeAccuracy, 2).padStart(8),
      fmt(row.exactScoreRate, 2).padStart(8),
      fmt(row.meanBrier, 6).padStart(10),
      fmt(row.drawSharePct, 1).padStart(8),
    ].join(" ")
  );
}

const outPath = resolve(projectRoot, "scripts/output/opp-adj-xpts-sweep.json");
writeFileSync(
  outPath,
  JSON.stringify({ generatedAt: new Date().toISOString(), results }, null, 2)
);
console.log(`\nWrote ${outPath}`);
if (ranked[0]) {
  console.log(`Best ROI: ${ranked[0].id} (${fmt(ranked[0].roi, 2)}%)`);
}
