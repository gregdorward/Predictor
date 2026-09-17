/**
 * Odds timeline helpers (hours-to-KO phases + movement vs previous window).
 * Server phase machine lives in footballServer/lib/oddsTimeline.js — keep in sync.
 */

export const MOVEMENT_EPSILON = 0.01;

/** Hours-to-KO phase boundaries (keep in sync with footballServer/lib/oddsTimeline.js). */
export const LOCK_WINDOW_HOURS = 45 / 60; // last store when < 45 minutes to KO
export const MID_WINDOW_MAX_HOURS = 12; // mid when >= 45 min and <= 12 h

export function hoursToKickoff(kickoffUnix, now = new Date()) {
  const unix = Number(kickoffUnix);
  if (!Number.isFinite(unix) || unix <= 0) return null;
  const nowMs = now instanceof Date ? now.getTime() : Number(now);
  return (unix * 1000 - nowMs) / (1000 * 60 * 60);
}

/** @returns {"soft"|"mid"|"lock"|"frozen"} */
export function resolveOddsPhase(hoursToKo) {
  if (!Number.isFinite(hoursToKo) || hoursToKo <= 0) return "frozen";
  if (hoursToKo < LOCK_WINDOW_HOURS) return "lock";
  if (hoursToKo <= MID_WINDOW_MAX_HOURS) return "mid";
  return "soft";
}

function toFiniteOdds(value) {
  const n = Number(value);
  return Number.isFinite(n) && n > 1 ? n : null;
}

function sideMovement(baselineOdds, currentOdds) {
  const base = toFiniteOdds(baselineOdds);
  const cur = toFiniteOdds(currentOdds);
  if (base == null || cur == null) return "stable";
  const delta = cur - base;
  if (delta < -MOVEMENT_EPSILON) return "shortening";
  if (delta > MOVEMENT_EPSILON) return "drifting";
  return "stable";
}

/** Decimal-odds % change vs baseline, or null when stable / missing. */
export function sideMovementPct(baselineOdds, currentOdds) {
  const base = toFiniteOdds(baselineOdds);
  const cur = toFiniteOdds(currentOdds);
  if (base == null || cur == null) return null;
  const delta = cur - base;
  if (Math.abs(delta) < MOVEMENT_EPSILON) return null;
  return Math.round(((cur - base) / base) * 1000) / 10;
}

/** locked → mid ?? opening; mid → opening; opening alone → null */
export function previousSample(timeline) {
  if (!timeline) return null;
  if (timeline.locked) return timeline.mid || timeline.opening || null;
  if (timeline.mid) return timeline.opening || null;
  return null;
}

export function movementFromPrevious(timeline, display) {
  const baseline = previousSample(timeline);
  if (!baseline || !display) {
    return { home: "stable", draw: "stable", away: "stable" };
  }
  return {
    home: sideMovement(baseline.home, display.home),
    draw: sideMovement(baseline.draw, display.draw),
    away: sideMovement(baseline.away, display.away),
  };
}

/** Percent change vs previous window; null per side when no baseline / stable. */
export function movementPctFromPrevious(timeline, display) {
  const baseline = previousSample(timeline);
  if (!baseline || !display) {
    return { home: null, draw: null, away: null };
  }
  return {
    home: sideMovementPct(baseline.home, display.home),
    draw: sideMovementPct(baseline.draw, display.draw),
    away: sideMovementPct(baseline.away, display.away),
  };
}

/** Format pct for UI label; null → empty slot content. */
export function formatOddsMovementPctLabel(pct) {
  if (pct == null || !Number.isFinite(pct)) return null;
  const arrow = pct > 0 ? "↑" : "↓";
  const abs = Math.abs(pct);
  const text = Number.isInteger(abs) ? String(abs) : abs.toFixed(1);
  return `${arrow} ${text}%`;
}

/** @deprecated prefer movementFromPrevious */
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

  const { display, movement, movementPct, phase } = syncPayload;
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
  match.homeOddsMovementPct =
    movementPct?.home != null && Number.isFinite(movementPct.home)
      ? movementPct.home
      : null;
  match.drawOddsMovementPct =
    movementPct?.draw != null && Number.isFinite(movementPct.draw)
      ? movementPct.draw
      : null;
  match.awayOddsMovementPct =
    movementPct?.away != null && Number.isFinite(movementPct.away)
      ? movementPct.away
      : null;
  match.oddsTimelinePhase = phase || null;
  if (applied) {
    match.bestOddsSource = "timeline";
  }

  return applied;
}

function slotForPhase(phase) {
  if (phase === "soft") return "opening";
  if (phase === "mid") return "mid";
  if (phase === "lock") return "locked";
  return null;
}

/**
 * Unix seconds when the client should next sync for a new window.
 * Returns 0 when the current phase slot is missing (fetch now).
 */
export function nextPhaseAtUnix(kickoffUnix, timeline, now = new Date()) {
  const ko = Number(kickoffUnix);
  if (!Number.isFinite(ko) || ko <= 0) return 0;

  const hours = hoursToKickoff(ko, now);
  if (hours == null) return 0;
  if (hours <= 0) {
    return timeline?.locked ? ko : 0;
  }

  const phase = resolveOddsPhase(hours);
  const slot = slotForPhase(phase);
  const doc = timeline || {};

  if (slot && doc[slot] == null) return 0;

  if (phase === "soft" && doc.opening) {
    return Math.floor(ko - MID_WINDOW_MAX_HOURS * 3600);
  }
  if (phase === "mid" && doc.mid) {
    return Math.floor(ko - LOCK_WINDOW_HOURS * 3600);
  }
  if (phase === "lock" && doc.locked) {
    return ko;
  }
  if (phase === "frozen") {
    return ko;
  }
  return 0;
}

/** Compact allForm display cache from a sync response. */
export function snapshotFromSyncResponse(sync, kickoffUnix, now = new Date()) {
  if (!sync?.display) return null;
  const ko =
    Number(kickoffUnix) ||
    Number(sync.timeline?.kickoffUnix) ||
    null;
  return {
    phase: sync.phase || null,
    kickoffUnix: Number.isFinite(ko) && ko > 0 ? ko : null,
    nextPhaseAt: nextPhaseAtUnix(ko, sync.timeline, now),
    display: sync.display,
    movement: sync.movement || {
      home: "stable",
      draw: "stable",
      away: "stable",
    },
    movementPct: sync.movementPct || {
      home: null,
      draw: null,
      away: null,
    },
  };
}

export function isOddsTimelineBakeFresh(snapshot, now = new Date()) {
  if (!snapshot?.display) return false;
  const next = Number(snapshot.nextPhaseAt);
  if (!Number.isFinite(next) || next <= 0) return false;
  const nowUnix = Math.floor(
    (now instanceof Date ? now.getTime() : Number(now)) / 1000
  );
  return nowUnix < next;
}
