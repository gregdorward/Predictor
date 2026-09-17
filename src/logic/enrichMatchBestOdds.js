import {
  applyBestFtOddsToMatch,
  resolveMatchKickoffUnix,
  syncMatchDisplayOdds,
} from "./bestMatchOdds.js";
import { allForm, dynamicFormDateKey } from "./getFixtures.js";
import {
  applyOddsTimelineToMatch,
  isOddsTimelineBakeFresh,
  snapshotFromSyncResponse,
} from "./oddsTimeline.js";
import { getUseBestMatchOdds } from "./scoreModelConfig.js";

/** In-memory cache of timeline sync responses by match id (session). */
const oddsTimelineCache = new Map();

/** Snapshots written this predictions run — one batched POST at the end. */
const pendingOddsTimelineUpdates = new Map();

export function clearBestOddsComparisonCache() {
  oddsTimelineCache.clear();
  pendingOddsTimelineUpdates.clear();
}

export function takePendingOddsTimelineUpdates() {
  const updates = Array.from(pendingOddsTimelineUpdates.entries()).map(
    ([id, oddsTimeline]) => ({ id, oddsTimeline })
  );
  pendingOddsTimelineUpdates.clear();
  return updates;
}

function originOddsTimelineUrl(matchId) {
  const origin = process.env.NEXT_PUBLIC_EXPRESS_SERVER || "";
  const base = origin.endsWith("/") ? origin : `${origin}/`;
  return `${base}odds-timeline/${matchId}/sync`;
}

function originAllFormOddsTimelineUrl(dateKey) {
  const origin = process.env.NEXT_PUBLIC_EXPRESS_SERVER || "";
  const base = origin.endsWith("/") ? origin : `${origin}/`;
  return `${base}allForm/${dateKey}/odds-timeline`;
}

function writeOddsTimelineToAllForm(matchId, snapshot) {
  if (!snapshot?.display || matchId == null) return;
  const entry = allForm.find((game) => String(game.id) === String(matchId));
  if (entry) {
    entry.oddsTimeline = snapshot;
  }
  pendingOddsTimelineUpdates.set(String(matchId), snapshot);
}

/**
 * Prefer best bookmaker prices via odds-timeline sync (one store per KO window).
 * Uses baked allForm.oddsTimeline when still before nextPhaseAt (no HTTP).
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

  // Warm allForm bake: apply locally until nextPhaseAt.
  if (
    matchId != null &&
    isOddsTimelineBakeFresh(match.oddsTimeline)
  ) {
    const applied = applyOddsTimelineToMatch(match, match.oddsTimeline);
    if (applied) {
      syncMatchDisplayOdds(match);
      match.bestOddsResolved = true;
      match.bestOddsSource = "timeline";
      return true;
    }
  }

  if (matchId != null && kickoffUnix != null) {
    const cacheKey = String(matchId);
    // Stale or missing bake must not reuse an older in-memory sync payload.
    if (
      match.oddsTimeline &&
      !isOddsTimelineBakeFresh(match.oddsTimeline)
    ) {
      oddsTimelineCache.delete(cacheKey);
    }
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
        const snapshot = snapshotFromSyncResponse(syncPayload, kickoffUnix);
        if (snapshot) {
          match.oddsTimeline = snapshot;
          writeOddsTimelineToAllForm(matchId, snapshot);
        }
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

/**
 * One batched write of oddsTimeline snapshots touched this predictions run.
 * No-op when nothing was synced (warm bake-only runs).
 */
export async function persistPendingOddsTimelineUpdates() {
  const updates = takePendingOddsTimelineUpdates();
  if (updates.length === 0 || !dynamicFormDateKey) {
    return false;
  }

  try {
    const response = await fetch(
      originAllFormOddsTimelineUrl(dynamicFormDateKey),
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ updates }),
      }
    );
    return response.ok;
  } catch (error) {
    console.warn("Failed to batch-persist allForm oddsTimeline:", error);
    return false;
  }
}
