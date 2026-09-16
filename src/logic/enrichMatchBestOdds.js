import {
  applyBestFtOddsToMatch,
  resolveMatchKickoffUnix,
  syncMatchDisplayOdds,
} from "./bestMatchOdds.js";
import { applyOddsTimelineToMatch } from "./oddsTimeline.js";
import { getUseBestMatchOdds } from "./scoreModelConfig.js";

/** In-memory cache of timeline sync responses by match id (session). */
const oddsTimelineCache = new Map();

export function clearBestOddsComparisonCache() {
  oddsTimelineCache.clear();
}

function originOddsTimelineUrl(matchId) {
  const origin = process.env.NEXT_PUBLIC_EXPRESS_SERVER || "";
  const base = origin.endsWith("/") ? origin : `${origin}/`;
  return `${base}odds-timeline/${matchId}/sync`;
}

/**
 * Prefer best bookmaker prices via odds-timeline sync (one store per KO window).
 * Falls back to in-memory odds_comparison / averages when sync unavailable.
 * Node backtests may still attach odds_comparison from disk before calling this.
 */
export async function enrichMatchWithBestOdds(match) {
  if (!match || !getUseBestMatchOdds()) return false;
  if (match.bestOddsResolved) {
    return (
      match.bestOddsSource === "timeline" ||
      match.bestOddsSource === "comparison"
    );
  }

  const matchId = match.id;
  const kickoffUnix = resolveMatchKickoffUnix(match);

  if (matchId != null && kickoffUnix != null) {
    const cacheKey = String(matchId);
    let syncPayload = oddsTimelineCache.get(cacheKey);

    if (syncPayload === undefined) {
      try {
        // POST must hit Express origin (not the GET-only edge proxy).
        const response = await fetch(originOddsTimelineUrl(matchId), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ kickoffUnix }),
        });
        if (response.ok) {
          syncPayload = await response.json();
          oddsTimelineCache.set(cacheKey, syncPayload ?? null);
        } else {
          oddsTimelineCache.set(cacheKey, null);
          syncPayload = null;
        }
      } catch {
        oddsTimelineCache.set(cacheKey, null);
        syncPayload = null;
      }
    }

    if (syncPayload?.display) {
      const applied = applyOddsTimelineToMatch(match, syncPayload);
      if (applied) {
        syncMatchDisplayOdds(match);
        match.bestOddsResolved = true;
        match.bestOddsSource = "timeline";
        return true;
      }
    }
  }

  // Fallbacks: embedded comparison (backtest cache) or leave averages.
  if (match.odds_comparison) {
    const applied = applyBestFtOddsToMatch(match, match.odds_comparison, {
      ignoreMatchDayGate: true,
    });
    match.bestOddsResolved = true;
    return applied;
  }

  match.bestOddsResolved = true;
  match.bestOddsSource = match.bestOddsSource || "average";
  return false;
}
