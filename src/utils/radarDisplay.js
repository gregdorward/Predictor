/** Visual-only stretch for 0-1 strength ratings on radar charts. Not used in predictions. */
export const RADAR_DISPLAY_EXPAND_FACTOR = 1.4;
export const RADAR_DISPLAY_MIDPOINT = 0.5;

export function expandRadarStrength(
  value,
  midpoint = RADAR_DISPLAY_MIDPOINT,
  factor = RADAR_DISPLAY_EXPAND_FACTOR
) {
  const n = Number(value);
  if (Number.isNaN(n)) return 0;
  const expanded = midpoint + (n - midpoint) * factor;
  return Math.max(0, Math.min(1, parseFloat(expanded.toFixed(2))));
}

export function expandRadarStrengthSeries(
  values,
  factor = RADAR_DISPLAY_EXPAND_FACTOR
) {
  if (!Array.isArray(values)) return [];
  return values.map((value) =>
    expandRadarStrength(value, RADAR_DISPLAY_MIDPOINT, factor)
  );
}
