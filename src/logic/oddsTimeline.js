/**
 * Odds timeline helpers (hours-to-KO phases + movement vs opening).
 * Server phase machine lives in footballServer/lib/oddsTimeline.js — keep in sync.
 */

export const MOVEMENT_EPSILON = 0.01;

export function hoursToKickoff(kickoffUnix, now = new Date()) {
  const unix = Number(kickoffUnix);
  if (!Number.isFinite(unix) || unix <= 0) return null;
  const nowMs = now instanceof Date ? now.getTime() : Number(now);
  return (unix * 1000 - nowMs) / (1000 * 60 * 60);
}

/** @returns {"soft"|"mid"|"lock"|"frozen"} */
export function resolveOddsPhase(hoursToKo) {
  if (!Number.isFinite(hoursToKo) || hoursToKo <= 1) return "frozen";
  if (hoursToKo <= 3) return "lock";
  if (hoursToKo <= 24) return "mid";
  return "soft";
}

function toFiniteOdds(value) {
  const n = Number(value);
  return Number.isFinite(n) && n > 1 ? n : null;
}

function sideMovement(openingOdds, currentOdds) {
  const open = toFiniteOdds(openingOdds);
  const cur = toFiniteOdds(currentOdds);
  if (open == null || cur == null) return "stable";
  const delta = cur - open;
  if (delta < -MOVEMENT_EPSILON) return "shortening";
  if (delta > MOVEMENT_EPSILON) return "drifting";
  return "stable";
}

export function movementFromOpening(opening, display) {
  if (!opening || !display) {
    return { home: "stable", draw: "stable", away: "stable" };
  }
  return {
    home: sideMovement(opening.home, display.home),
    draw: sideMovement(opening.draw, display.draw),
    away: sideMovement(opening.away, display.away),
  };
}

/**
 * Apply timeline sync display + movement onto a match for UI / ROI.
 * Preserves existing bookmaker labels when the sync payload omits them.
 */
export function applyOddsTimelineToMatch(match, syncPayload) {
  if (!match || !syncPayload?.display) return false;

  const { display, movement, phase } = syncPayload;
  let applied = false;

  if (toFiniteOdds(display.home) != null) {
    match.homeOdds = Number(display.home).toFixed(2);
    if (display.bookmakers?.home) {
      match.homeOddsBookmaker = display.bookmakers.home;
    }
    applied = true;
  }
  if (toFiniteOdds(display.draw) != null) {
    match.drawOdds = Number(display.draw).toFixed(2);
    if (display.bookmakers?.draw) {
      match.drawOddsBookmaker = display.bookmakers.draw;
    }
    applied = true;
  }
  if (toFiniteOdds(display.away) != null) {
    match.awayOdds = Number(display.away).toFixed(2);
    if (display.bookmakers?.away) {
      match.awayOddsBookmaker = display.bookmakers.away;
    }
    applied = true;
  }

  match.homeOddsMovement = movement?.home || "stable";
  match.drawOddsMovement = movement?.draw || "stable";
  match.awayOddsMovement = movement?.away || "stable";
  match.oddsTimelinePhase = phase || null;
  if (applied) {
    match.bestOddsSource = "timeline";
  }

  return applied;
}
