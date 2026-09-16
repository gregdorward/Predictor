import { apiGetUrl } from "../utils/apiUrl";
import {
  applyBestFtOddsToMatch,
  isBestOddsEligible,
} from "./bestMatchOdds.js";
import { getUseBestMatchOdds } from "./scoreModelConfig.js";

/** In-memory cache of odds_comparison by match id (session / backtest process). */
const oddsComparisonCache = new Map();

export function clearBestOddsComparisonCache() {
  oddsComparisonCache.clear();
}

function extractOddsComparison(payload) {
  if (!payload || typeof payload !== "object") return null;
  if (payload.odds_comparison) return payload.odds_comparison;
  if (payload.data?.odds_comparison) return payload.data.odds_comparison;
  return null;
}

/**
 * Prefer best bookmaker prices when USE_BEST_MATCH_ODDS is on.
 * Only on match day or later — future fixtures keep average odds_ft_*.
 * Browser-safe: fixture.odds_comparison → in-memory → match-snapshot fetch.
 * Node backtests should attach odds_comparison from disk before calling this
 * (see attachCachedOddsComparison in bestOddsCache.js).
 */
export async function enrichMatchWithBestOdds(match) {
  if (!match || !getUseBestMatchOdds()) return false;
  if (match.bestOddsResolved) return match.bestOddsSource === "comparison";

  if (!isBestOddsEligible(match)) {
    match.bestOddsResolved = true;
    match.bestOddsSource = "average";
    return false;
  }

  if (match.odds_comparison) {
    const applied = applyBestFtOddsToMatch(match, match.odds_comparison);
    match.bestOddsResolved = true;
    return applied;
  }

  const matchId = match.id;
  if (matchId == null) {
    match.bestOddsResolved = true;
    return false;
  }

  let comparison = oddsComparisonCache.get(String(matchId));

  if (comparison === undefined) {
    try {
      const url = apiGetUrl(`match-snapshot/${matchId}`);
      const response = await fetch(url);
      if (!response.ok) {
        oddsComparisonCache.set(String(matchId), null);
        match.bestOddsResolved = true;
        return false;
      }
      const payload = await response.json();
      comparison = extractOddsComparison(payload);
      oddsComparisonCache.set(String(matchId), comparison ?? null);
    } catch {
      oddsComparisonCache.set(String(matchId), null);
      match.bestOddsResolved = true;
      return false;
    }
  }

  const applied = applyBestFtOddsToMatch(match, comparison);
  match.bestOddsResolved = true;
  return applied;
}
