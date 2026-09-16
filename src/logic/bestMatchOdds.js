/**
 * Best-price helpers from FootyStats `odds_comparison`.
 *
 * League/todays match lists expose average `odds_ft_*` only.
 * Per-bookmaker prices live on match details as:
 *   odds_comparison["FT Result"][1|X|2] = { BookmakerName: decimalOdds, ... }
 */

import { selectedOdds } from "../components/OddsRadio.js";
import {
  DECIMAL_ODDS,
  FRACTIONAL_ODDS,
  readOddsPreference,
} from "../utils/oddsPreference.js";
import { decimalToFractional } from "../utils/oddsFormat.js";

function toFiniteOdds(value) {
  const n = Number(value);
  return Number.isFinite(n) && n > 1 ? n : null;
}

function pickBestFromBookieMap(bookieMap) {
  if (!bookieMap || typeof bookieMap !== "object") {
    return null;
  }
  let bestOdds = null;
  let bestBookmaker = null;
  for (const [bookmaker, raw] of Object.entries(bookieMap)) {
    const odds = toFiniteOdds(raw);
    if (odds == null) continue;
    if (bestOdds == null || odds > bestOdds) {
      bestOdds = odds;
      bestBookmaker = bookmaker;
    }
  }
  if (bestOdds == null) return null;
  return { odds: bestOdds, bookmaker: bestBookmaker };
}

function ftResultMarket(oddsComparison) {
  if (!oddsComparison || typeof oddsComparison !== "object") return null;
  return (
    oddsComparison["FT Result"] ||
    oddsComparison["FT result"] ||
    oddsComparison.ft_result ||
    null
  );
}

function sideMap(ftResult, keys) {
  if (!ftResult || typeof ftResult !== "object") return null;
  for (const key of keys) {
    if (ftResult[key] != null) return ftResult[key];
  }
  return null;
}

/** Local calendar YYYY-MM-DD (site UX / GB viewing day). */
export function toLocalIsoDate(input = new Date()) {
  const d = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function resolveMatchKickoffUnix(match) {
  if (!match || typeof match !== "object") return null;
  const raw = match.date ?? match.date_unix ?? match.dateRaw;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/**
 * Best bookmaker prices are only used on match day or later.
 * Future fixtures keep average odds_ft_* (FootyStats comparison can be stale).
 */
export function isBestOddsEligible(match, now = new Date()) {
  if (!match) return false;
  if (match.status === "complete") return true;

  const unix = resolveMatchKickoffUnix(match);
  if (unix == null) return false;

  const kickoffDay = toLocalIsoDate(new Date(unix * 1000));
  const today = toLocalIsoDate(now);
  if (!kickoffDay || !today) return false;
  return kickoffDay <= today;
}

/**
 * Format a decimal price for the Odds Options preference (fractional | decimal).
 */
function currentOddsPreference() {
  // Prefer live Options selection (same source createFixture uses).
  if (selectedOdds === DECIMAL_ODDS || selectedOdds === FRACTIONAL_ODDS) {
    return selectedOdds;
  }
  return readOddsPreference();
}

export function formatOddsForDisplay(
  decimalOdds,
  preference = currentOddsPreference()
) {
  const n = Number(decimalOdds);
  if (!Number.isFinite(n) || n <= 1) return "N/A";

  if (preference === DECIMAL_ODDS) {
    return n.toFixed(2);
  }

  return decimalToFractional(n);
}

export function syncMatchDisplayOdds(
  match,
  preference = currentOddsPreference()
) {
  if (!match) return;
  if (match.homeOdds != null && match.homeOdds !== "-") {
    match.fractionHome = formatOddsForDisplay(match.homeOdds, preference);
  }
  if (match.drawOdds != null && match.drawOdds !== "-") {
    match.fractionDraw = formatOddsForDisplay(match.drawOdds, preference);
  }
  if (match.awayOdds != null && match.awayOdds !== "-") {
    match.fractionAway = formatOddsForDisplay(match.awayOdds, preference);
  }
}

/**
 * @param {object|null|undefined} oddsComparison FootyStats odds_comparison
 * @param {{ home?: number|string, draw?: number|string, away?: number|string }} [fallback]
 */
export function resolveBestFtOdds(oddsComparison, fallback = {}) {
  const ft = ftResultMarket(oddsComparison);
  const homeBest = pickBestFromBookieMap(sideMap(ft, ["1", 1, "home", "Home"]));
  const drawBest = pickBestFromBookieMap(
    sideMap(ft, ["X", "x", "Draw", "draw"])
  );
  const awayBest = pickBestFromBookieMap(sideMap(ft, ["2", 2, "away", "Away"]));

  const homeFallback = toFiniteOdds(fallback.home);
  const drawFallback = toFiniteOdds(fallback.draw);
  const awayFallback = toFiniteOdds(fallback.away);

  const home =
    homeBest ||
    (homeFallback != null ? { odds: homeFallback, bookmaker: null } : null);
  const draw =
    drawBest ||
    (drawFallback != null ? { odds: drawFallback, bookmaker: null } : null);
  const away =
    awayBest ||
    (awayFallback != null ? { odds: awayFallback, bookmaker: null } : null);

  if (!home && !draw && !away) return null;

  return {
    home: home || { odds: homeFallback ?? 0, bookmaker: null },
    draw: draw || { odds: drawFallback ?? 0, bookmaker: null },
    away: away || { odds: awayFallback ?? 0, bookmaker: null },
    source: homeBest || drawBest || awayBest ? "comparison" : "fallback",
  };
}

/**
 * Mutate match 1X2 odds to best available prices and attach bookmaker labels.
 * @returns {boolean} true when comparison prices were applied
 */
export function applyBestFtOddsToMatch(
  match,
  oddsComparison,
  {
    oddsPreference = currentOddsPreference(),
    now = new Date(),
    ignoreMatchDayGate = false,
  } = {}
) {
  if (!match) return false;
  if (!ignoreMatchDayGate && !isBestOddsEligible(match, now)) {
    return false;
  }
  const resolved = resolveBestFtOdds(oddsComparison, {
    home: match.homeOdds,
    draw: match.drawOdds,
    away: match.awayOdds,
  });
  if (!resolved || resolved.source !== "comparison") {
    return false;
  }

  if (resolved.home?.odds > 1) {
    match.homeOdds = Number(resolved.home.odds).toFixed(2);
    match.homeOddsBookmaker = resolved.home.bookmaker;
  }
  if (resolved.draw?.odds > 1) {
    match.drawOdds = Number(resolved.draw.odds).toFixed(2);
    match.drawOddsBookmaker = resolved.draw.bookmaker;
  }
  if (resolved.away?.odds > 1) {
    match.awayOdds = Number(resolved.away.odds).toFixed(2);
    match.awayOddsBookmaker = resolved.away.bookmaker;
  }

  syncMatchDisplayOdds(match, oddsPreference);
  match.bestOddsSource = "comparison";
  return true;
}

export { FRACTIONAL_ODDS, DECIMAL_ODDS };
