#!/usr/bin/env node
/**
 * Sweep SCORE_MAHER_ITERS (opponent-adjusted Maher fixed-point).
 * Rank primarily by ROI, then Brier.
 *
 * Usage:
 *   NEXT_PUBLIC_EXPRESS_SERVER=http://localhost:5050/ \
 *     node scripts/sweep-maher-iters.mjs --from 2026-07-01 --to 2026-09-15
 */

import { spawnSync } from "child_process";
import { readFileSync, readdirSync, existsSync, statSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");

const VARIANTS = [
  { id: "i0", label: "ITERS=0 (mean rates)", env: { SCORE_MAHER_ITERS: "0" } },
  { id: "i3", label: "ITERS=3", env: { SCORE_MAHER_ITERS: "3" } },
  { id: "i5", label: "ITERS=5", env: { SCORE_MAHER_ITERS: "5" } },
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

console.log("\n\nMaher iters comparison (rank by ROI, then Brier)");
console.log(
  [
    "id".padEnd(6),
    "n".padStart(6),
    "ROI%".padStart(8),
    "Brier".padStart(10),
    "acc%".padStart(8),
    "exact%".padStart(8),
  ].join(" ")
);
console.log("-".repeat(50));

const ranked = [...results]
  .filter((r) => !r.error)
  .sort(
    (a, b) =>
      (b.roi ?? -999) - (a.roi ?? -999) ||
      (a.meanBrier ?? 9) - (b.meanBrier ?? 9)
  );

for (const row of ranked) {
  console.log(
    [
      row.id.padEnd(6),
      String(row.predicted ?? "—").padStart(6),
      fmt(row.roi, 2).padStart(8),
      fmt(row.meanBrier, 6).padStart(10),
      fmt(row.outcomeAccuracy, 2).padStart(8),
      fmt(row.exactScoreRate, 2).padStart(8),
    ].join(" ")
  );
}

const outPath = resolve(projectRoot, "scripts/output/maher-iters-sweep.json");
writeFileSync(
  outPath,
  JSON.stringify({ generatedAt: new Date().toISOString(), results }, null, 2)
);
console.log(`\nWrote ${outPath}`);
if (ranked[0]) {
  console.log(
    `Best ROI: ${ranked[0].id} (${fmt(ranked[0].roi, 2)}%; Brier ${fmt(ranked[0].meanBrier, 6)})`
  );
}
