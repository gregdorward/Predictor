import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

export function bestOddsCacheDir(cwd = process.cwd()) {
  return resolve(cwd, "scripts/output/backtest-cache/odds-comparison");
}

export function bestOddsCachePath(matchId, cwd = process.cwd()) {
  return resolve(bestOddsCacheDir(cwd), `${matchId}.json`);
}

/**
 * @returns {{ odds_comparison: object|null, fetchedAt?: string } | null}
 */
export function readBestOddsCache(matchId, cwd = process.cwd()) {
  const path = bestOddsCachePath(matchId, cwd);
  if (!existsSync(path)) return null;
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8"));
    if (parsed && typeof parsed === "object") {
      if ("odds_comparison" in parsed) return parsed;
      // Raw comparison object saved without wrapper.
      return { odds_comparison: parsed };
    }
  } catch {
    /* ignore corrupt cache */
  }
  return null;
}

export function writeBestOddsCache(
  matchId,
  oddsComparison,
  cwd = process.cwd()
) {
  mkdirSync(bestOddsCacheDir(cwd), { recursive: true });
  const path = bestOddsCachePath(matchId, cwd);
  writeFileSync(
    path,
    JSON.stringify(
      {
        matchId: String(matchId),
        fetchedAt: new Date().toISOString(),
        odds_comparison: oddsComparison ?? null,
      },
      null,
      0
    )
  );
  return path;
}

export function hasBestOddsCache(matchId, cwd = process.cwd()) {
  return existsSync(bestOddsCachePath(matchId, cwd));
}

/** Node-only: copy disk-cached odds_comparison onto the match before calculateScore. */
export function attachCachedOddsComparison(match, cwd = process.cwd()) {
  if (!match || match.id == null || match.odds_comparison) return false;
  const cached = readBestOddsCache(match.id, cwd);
  if (!cached || cached.odds_comparison == null) return false;
  match.odds_comparison = cached.odds_comparison;
  return true;
}
