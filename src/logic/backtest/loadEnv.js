import { readFileSync } from "fs";
import { resolve } from "path";

export function loadEnvFile(path) {
  const env = {};
  try {
    for (const line of readFileSync(path, "utf8").split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      env[trimmed.slice(0, eq).trim()] = trimmed
        .slice(eq + 1)
        .trim()
        .replace(/^['"]|['"]$/g, "");
    }
  } catch {
    /* ignore */
  }
  return env;
}

/** Load Predictor + footballServer env for local backtest runs. */
export function loadBacktestEnv() {
  const predictorRoot = process.cwd();
  const predictorEnv = loadEnvFile(resolve(predictorRoot, ".env.local"));
  const predictorEnvFallback = loadEnvFile(resolve(predictorRoot, ".env"));
  const predictorDev = loadEnvFile(resolve(predictorRoot, ".env.development"));
  const predictorProd = loadEnvFile(resolve(predictorRoot, ".env.production"));
  const serverEnv = loadEnvFile(resolve(predictorRoot, "../footballServer/.env"));

  const merged = {
    ...serverEnv,
    ...predictorProd,
    ...predictorDev,
    ...predictorEnvFallback,
    ...predictorEnv,
  };

  for (const [key, value] of Object.entries(merged)) {
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }

  return merged;
}
