#!/usr/bin/env node
import { spawnSync } from "child_process";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");
const outputRoot = resolve(projectRoot, "scripts/output/backtest-experiments-kickoff-v3");

const FROM = "2026-08-17";
const TO = "2026-09-06";

function compositeScore(summary) {
  const acc = Number(summary.outcomeAccuracy) || 0;
  const roi = Number(summary.roi) || 0;
  return acc + roi * 0.5;
}

function latestBacktestDir() {
  const outputDir = resolve(projectRoot, "scripts/output");
  if (!existsSync(outputDir)) return null;
  const dirs = readdirSync(outputDir)
    .filter((name) => name.startsWith("backtest-"))
    .map((name) => resolve(outputDir, name))
    .filter((path) => existsSync(resolve(path, "summary.json")))
    .sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs);
  return dirs[0] ?? null;
}

function runExperiment(name, env, { replayModel = false } = {}) {
  const args = [
    "run",
    "backtest",
    "--",
    "--from",
    FROM,
    "--to",
    TO,
    "--no-upload",
    "--delay-ms",
    "0",
  ];
  if (replayModel) args.push("--replay-model");

  console.log(`\n=== ${name} ===`);
  const result = spawnSync("npm", args, {
    cwd: projectRoot,
    env: { ...process.env, ...env },
    stdio: "inherit",
    shell: true,
  });

  if (result.status !== 0) {
    throw new Error(`Backtest failed for ${name}`);
  }

  const backtestDir = latestBacktestDir();
  if (!backtestDir) {
    throw new Error(`No summary.json found after ${name}`);
  }

  const summaryPath = resolve(backtestDir, "summary.json");
  const summary = JSON.parse(readFileSync(summaryPath, "utf8"));
  const destPath = resolve(outputRoot, `${name}.json`);
  copyFileSync(summaryPath, destPath);

  return {
    name,
    env,
    replayModel,
    summary,
    composite: compositeScore(summary),
    destPath,
  };
}

function buildRound1() {
  const experiments = [];
  for (let margin = 8; margin <= 20; margin += 2) {
    for (const blend of [0, 0.1, 0.15, 0.2, 0.25]) {
      experiments.push({
        name: `r1_clear_m${margin}_b${String(blend).replace(".", "p")}`,
        env: {
          SCORE_MODEL_OUTCOME: "clear",
          SCORE_MODEL_MARGIN: String(margin),
          SCORE_MODEL_BLEND: String(blend),
        },
      });
    }
  }
  return experiments;
}

function buildRound2(baseEnv) {
  const flags = [
    { suffix: "f1_form_trend", env: { SCORE_MODEL_FORM_TREND: "1" } },
    { suffix: "f2_last5_blend", env: { SCORE_MODEL_LAST5_BLEND: "0.5" } },
    { suffix: "f3_venue_blend", env: { SCORE_MODEL_VENUE_BLEND: "1" } },
    { suffix: "f4_rest_haircut", env: { SCORE_MODEL_REST_HAIRCUT: "0.95" } },
    { suffix: "f5_sos_damp", env: { SCORE_MODEL_SOS_DAMP: "1" } },
    { suffix: "f6_clinical", env: { SCORE_MODEL_CLINICAL: "1" } },
    { suffix: "f7_scouting", env: { SCORE_MODEL_SCOUTING: "0.05" } },
    { suffix: "f8_xg_damp", env: { SCORE_MODEL_XG_DAMP: "0.02" } },
  ];

  const experiments = [];
  for (const flag of flags) {
    experiments.push({
      name: `r2_${flag.suffix}`,
      env: { ...baseEnv, ...flag.env },
    });
    experiments.push({
      name: `r2_${flag.suffix}_replay`,
      env: { ...baseEnv, ...flag.env },
      replayModel: true,
    });
  }
  return experiments;
}

function buildRound3(baseEnv) {
  const variants = [
    { suffix: "inj_005", env: { SCORE_MODEL_INJURY_SENS: "0.005" } },
    { suffix: "inj_020", env: { SCORE_MODEL_INJURY_SENS: "0.02" } },
    { suffix: "mgr_020", env: { SCORE_MODEL_MANAGER_BOOST: "0.2" } },
    { suffix: "mgr_040", env: { SCORE_MODEL_MANAGER_BOOST: "0.4" } },
    { suffix: "eff_tight", env: { SCORE_MODEL_EFF_CLAMP: "0.99,1.01" } },
    { suffix: "eff_wide", env: { SCORE_MODEL_EFF_CLAMP: "0.95,1.05" } },
    { suffix: "alpha_090", env: { SCORE_MODEL_LEAGUE_ALPHA: "0.9" } },
    { suffix: "alpha_080", env: { SCORE_MODEL_LEAGUE_ALPHA: "0.8" } },
  ];

  const experiments = [];
  for (const variant of variants) {
    experiments.push({
      name: `r3_${variant.suffix}`,
      env: { ...baseEnv, ...variant.env },
    });
    experiments.push({
      name: `r3_${variant.suffix}_replay`,
      env: { ...baseEnv, ...variant.env },
      replayModel: true,
    });
  }
  return experiments;
}

function buildRound4(baseEnv) {
  const experiments = [];
  const strengths = [
    "default",
    "xg_heavy",
    "sot_heavy",
    "goals_heavy",
    "clean_sheet",
  ];
  const rhos = [0, 0.015, 0.025];
  const alphas = [0.65, 0.75, 0.85];

  for (const strength of strengths) {
    experiments.push({
      name: `r4_${strength}`,
      env: { ...baseEnv, SCORE_MODEL_STRENGTH: strength },
    });
  }

  for (const rho of rhos) {
    experiments.push({
      name: `r4_rho_${String(rho).replace(".", "p")}`,
      env: { ...baseEnv, SCORE_MODEL_RHO: String(rho) },
    });
  }

  for (const alpha of alphas) {
    experiments.push({
      name: `r4_alpha_${String(alpha).replace(".", "p")}`,
      env: { ...baseEnv, SCORE_MODEL_ALPHA: String(alpha) },
    });
  }

  return experiments;
}

function buildRound5(baseEnv, winners) {
  const combos = [
    {
      name: "r5_combo_a",
      env: {
        ...baseEnv,
        ...winners,
      },
    },
  ];

  if (winners.SCORE_MODEL_FORM_TREND) {
    combos.push({
      name: "r5_combo_form_last5",
      env: {
        ...baseEnv,
        SCORE_MODEL_FORM_TREND: winners.SCORE_MODEL_FORM_TREND,
        SCORE_MODEL_LAST5_BLEND: winners.SCORE_MODEL_LAST5_BLEND || "0.3",
      },
    });
  }

  return combos;
}

function rankResults(results) {
  return [...results].sort((a, b) => b.composite - a.composite);
}

function pickBestEnv(results, prefix) {
  const filtered = results.filter((row) => row.name.startsWith(prefix));
  if (!filtered.length) return {};
  const best = rankResults(filtered)[0];
  const picked = {};
  for (const [key, value] of Object.entries(best.env || {})) {
    if (key.startsWith("SCORE_MODEL_")) picked[key] = value;
  }
  return picked;
}

function parseArgs(argv) {
  const args = { round: "all", skipBuild: false };
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--round") args.round = argv[++i];
    else if (token === "--skip-build") args.skipBuild = true;
    else if (token === "--help" || token === "-h") {
      console.log(`Usage: node scripts/run-backtest-sweep.mjs [--round 1|2|3|4|5|6|all] [--skip-build]`);
      process.exit(0);
    }
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  mkdirSync(outputRoot, { recursive: true });

  if (!args.skipBuild) {
    console.log("Building backtest bundle...");
    const build = spawnSync("npm", ["run", "backtest:build"], {
      cwd: projectRoot,
      stdio: "inherit",
      shell: true,
    });
    if (build.status !== 0) process.exit(build.status ?? 1);
  }

  const allResults = [];
  const manifest = {
    from: FROM,
    to: TO,
    generatedAt: new Date().toISOString(),
    rounds: {},
  };

  let bestBaseEnv = {
    SCORE_MODEL_OUTCOME: "clear",
    SCORE_MODEL_MARGIN: "12",
    SCORE_MODEL_BLEND: "0.2",
  };

  if (args.round === "all" || args.round === "1") {
    const round1 = buildRound1();
    const round1Results = [];
    for (const experiment of round1) {
      round1Results.push(runExperiment(experiment.name, experiment.env));
    }
    allResults.push(...round1Results);
    manifest.rounds.round1 = rankResults(round1Results).slice(0, 10);
    const best = manifest.rounds.round1[0];
    if (best?.env) {
      bestBaseEnv = {
        SCORE_MODEL_OUTCOME: best.env.SCORE_MODEL_OUTCOME || "clear",
        SCORE_MODEL_MARGIN: best.env.SCORE_MODEL_MARGIN || "12",
        SCORE_MODEL_BLEND: best.env.SCORE_MODEL_BLEND || "0.2",
      };
    }
  }

  if (args.round === "all" || args.round === "2") {
    const round2 = buildRound2(bestBaseEnv);
    const round2Results = [];
    for (const experiment of round2) {
      round2Results.push(
        runExperiment(experiment.name, experiment.env, {
          replayModel: experiment.replayModel === true,
        })
      );
    }
    allResults.push(...round2Results);
    manifest.rounds.round2 = rankResults(
      round2Results.filter((row) => !row.replayModel)
    );
  }

  if (args.round === "all" || args.round === "3") {
    const round3 = buildRound3(bestBaseEnv);
    const round3Results = [];
    for (const experiment of round3) {
      round3Results.push(
        runExperiment(experiment.name, experiment.env, {
          replayModel: experiment.replayModel === true,
        })
      );
    }
    allResults.push(...round3Results);
    manifest.rounds.round3 = rankResults(
      round3Results.filter((row) => !row.replayModel)
    );
  }

  const formWinners = pickBestEnv(allResults, "r2_");
  const lambdaWinners = pickBestEnv(allResults, "r3_");

  if (args.round === "all" || args.round === "4") {
    const round4 = buildRound4({
      ...bestBaseEnv,
      ...formWinners,
      ...lambdaWinners,
    });
    const round4Results = [];
    for (const experiment of round4) {
      round4Results.push(runExperiment(experiment.name, experiment.env));
    }
    allResults.push(...round4Results);
    manifest.rounds.round4 = rankResults(round4Results);
  }

  if (args.round === "all" || args.round === "5") {
    const strengthWinners = pickBestEnv(allResults, "r4_");
    const round5 = buildRound5(bestBaseEnv, {
      ...formWinners,
      ...lambdaWinners,
      ...strengthWinners,
    });
    const round5Results = [];
    for (const experiment of round5) {
      round5Results.push(runExperiment(experiment.name, experiment.env));
    }
    allResults.push(...round5Results);
    manifest.rounds.round5 = rankResults(round5Results);
  }

  if (args.round === "all" || args.round === "6") {
    const edgeEnv = {
      ...bestBaseEnv,
      ...formWinners,
      ...lambdaWinners,
    };
    const edgeResult = runExperiment("r6_edge_curve", edgeEnv);
    const edgeRun = spawnSync(
      "npm",
      [
        "run",
        "backtest",
        "--",
        "--from",
        FROM,
        "--to",
        TO,
        "--no-upload",
        "--delay-ms",
        "0",
        "--edge-curve",
      ],
      {
        cwd: projectRoot,
        env: { ...process.env, ...edgeEnv },
        stdio: "inherit",
        shell: true,
      }
    );
    if (edgeRun.status !== 0) {
      throw new Error("Edge curve backtest failed");
    }
    const edgeDir = latestBacktestDir();
    const edgeSummary = JSON.parse(
      readFileSync(resolve(edgeDir, "summary.json"), "utf8")
    );
    copyFileSync(
      resolve(edgeDir, "summary.json"),
      resolve(outputRoot, "r6_edge_curve.json")
    );
    manifest.rounds.round6 = edgeSummary.edgeCurve || [];
    allResults.push({
      ...edgeResult,
      summary: edgeSummary,
      composite: compositeScore(edgeSummary),
    });
  }

  const ranked = rankResults(allResults).map((row) => ({
    name: row.name,
    replayModel: row.replayModel === true,
    outcomeAccuracy: row.summary.outcomeAccuracy,
    roi: row.summary.roi,
    exactScoreRate: row.summary.exactScoreRate,
    predicted: row.summary.predicted,
    composite: row.composite,
    env: row.env,
    byPrediction: row.summary.byPrediction,
  }));

  writeFileSync(
    resolve(outputRoot, "ranked.json"),
    JSON.stringify(ranked, null, 2)
  );
  writeFileSync(
    resolve(outputRoot, "manifest.json"),
    JSON.stringify(manifest, null, 2)
  );

  console.log("\nSweep complete.");
  console.log(`Results: ${outputRoot}`);
  console.log("Top 5:");
  for (const row of ranked.slice(0, 5)) {
    console.log(
      `  ${row.name}: ${row.outcomeAccuracy}% 1X2, ${row.roi}% ROI (composite ${row.composite.toFixed(2)})`
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
