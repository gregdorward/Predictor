export const STAT_FALLBACK = "-";

export function formatStatDisplay(value) {
  if (value === null || value === undefined || value === "") return undefined;
  const n = Number(value);
  if (Number.isNaN(n)) return undefined;
  const fixed = n.toFixed(2);
  return fixed.endsWith(".00") ? String(Math.round(n)) : fixed;
}

// Treats empty, NaN, N/A, and other junk values as missing.
export function isMissingStat(value) {
  if (value === null || value === undefined || value === "") return true;
  if (value === "N/A" || value === "NaN" || value === "-%" || value === STAT_FALLBACK) {
    return true;
  }
  if (typeof value === "number" && Number.isNaN(value)) return true;
  const asString = String(value);
  if (asString === "NaN" || asString.includes("NaN")) return true;
  return false;
}

// Formats a numeric stat or returns "-" when data is unavailable.
export function statOrDash(value) {
  if (isMissingStat(value)) return STAT_FALLBACK;
  const formatted = formatStatDisplay(value);
  if (formatted === undefined || isMissingStat(formatted)) return STAT_FALLBACK;
  return formatted;
}

export function formatStatOrDash(value) {
  return statOrDash(value);
}

// For UI labels in createStatsDiv - never appends "%" to a missing value.
export function statDisplay(value) {
  return isMissingStat(value) ? STAT_FALLBACK : value;
}

export function statPercentDisplay(value, decimals = null) {
  if (isMissingStat(value)) return STAT_FALLBACK;
  const n = Number(value);
  if (!Number.isFinite(n)) return STAT_FALLBACK;
  const formatted =
    decimals != null ? n.toFixed(decimals) : statOrDash(value);
  if (formatted === STAT_FALLBACK) return STAT_FALLBACK;
  return `${formatted}%`;
}

export function ratioPercentOrDash(numerator, denominator, decimals = 2) {
  const num = Number(numerator);
  const den = Number(denominator);
  if (!Number.isFinite(num) || !Number.isFinite(den) || den === 0) {
    return STAT_FALLBACK;
  }
  const result = (num / den) * 100;
  if (!Number.isFinite(result)) return STAT_FALLBACK;
  return result.toFixed(decimals);
}

export function ratioOrDash(numerator, denominator, decimals = 2) {
  const num = Number(numerator);
  const den = Number(denominator);
  if (!Number.isFinite(num) || !Number.isFinite(den) || den === 0) {
    return STAT_FALLBACK;
  }
  const result = num / den;
  if (!Number.isFinite(result)) return STAT_FALLBACK;
  return result.toFixed(decimals);
}

export function fixedStatOrDash(value, decimals = 2) {
  const n = Number(value);
  if (!Number.isFinite(n)) return STAT_FALLBACK;
  return n.toFixed(decimals);
}

// Coerces fixture/model probabilities to a safe 0-100 number for bar widths.
export function getProbabilityNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

// Formats a probability for display; returns "" when data is missing (not "undefined%").
export function formatProbabilityPercent(value, decimals = 1) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return "";
  return `${n.toFixed(decimals)}%`;
}
