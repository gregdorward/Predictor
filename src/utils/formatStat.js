export function formatStatDisplay(value) {
  if (value === null || value === undefined || value === "") return undefined;
  const n = Number(value);
  if (Number.isNaN(n)) return undefined;
  const fixed = n.toFixed(2);
  return fixed.endsWith(".00") ? String(Math.round(n)) : fixed;
}
