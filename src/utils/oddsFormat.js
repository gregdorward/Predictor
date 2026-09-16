/**
 * Decimal → fractional display using familiar UK board prices.
 * Prefers common fractions (e.g. 8/15, 6/1) over oddslib oddities like 7/13, 97/16.
 */

/** Standard UK fractional prices as "n/d" (evens = 1/1). */
const COMMON_FRACTIONS = [
  "1/10",
  "1/9",
  "1/8",
  "1/7",
  "1/6",
  "1/5",
  "2/9",
  "1/4",
  "2/7",
  "3/10",
  "1/3",
  "4/11",
  "2/5",
  "4/9",
  "1/2",
  "8/15",
  "4/7",
  "8/13",
  "4/6", // shown as 4/6 on many boards; equals 2/3
  "5/8",
  "8/11",
  "4/5",
  "5/6",
  "10/11",
  "1/1",
  "21/20",
  "11/10",
  "6/5",
  "5/4",
  "11/8",
  "6/4", // board style; equals 3/2
  "13/8",
  "7/4",
  "9/5",
  "15/8",
  "2/1",
  "85/40",
  "11/5",
  "9/4",
  "12/5",
  "5/2",
  "11/4",
  "3/1",
  "10/3",
  "7/2",
  "4/1",
  "9/2",
  "5/1",
  "11/2",
  "6/1",
  "13/2",
  "7/1",
  "15/2",
  "8/1",
  "17/2",
  "9/1",
  "10/1",
  "11/1",
  "12/1",
  "14/1",
  "16/1",
  "18/1",
  "20/1",
  "22/1",
  "25/1",
  "28/1",
  "33/1",
  "40/1",
  "50/1",
  "66/1",
  "80/1",
  "100/1",
];

const COMMON_PRICES = COMMON_FRACTIONS.map((fraction) => {
  const [num, den] = fraction.split("/").map(Number);
  return { fraction, decimal: 1 + num / den };
});

function maxSnapError(decimal) {
  // Tighter on short prices; a little looser as odds lengthen.
  return Math.max(0.03, 0.012 * decimal);
}

function nearestCommonFraction(decimal) {
  let best = null;
  let bestErr = Infinity;
  for (const price of COMMON_PRICES) {
    const err = Math.abs(price.decimal - decimal);
    if (err < bestErr) {
      bestErr = err;
      best = price;
    }
  }
  return best ? { ...best, err: bestErr } : null;
}

/**
 * Convert decimal odds to a display fractional string.
 */
export function decimalToFractional(decimalOdds) {
  const n = Number(decimalOdds);
  if (!Number.isFinite(n) || n <= 1) return "N/A";

  const rounded = Number(Math.max(n, 1.01).toFixed(2));
  const nearest = nearestCommonFraction(rounded);
  if (nearest && nearest.err <= maxSnapError(rounded)) {
    return nearest.fraction;
  }

  // Far from the board ladder — still prefer nearest common over exotic fractions.
  if (nearest) return nearest.fraction;
  return "N/A";
}
