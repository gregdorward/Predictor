export const FRACTIONAL_ODDS = "Fractional odds";
export const DECIMAL_ODDS = "Decimal odds";

const STORAGE_KEY = "oddsMode";

export function oddsModeToSelected(mode) {
  return mode === "decimal" ? DECIMAL_ODDS : FRACTIONAL_ODDS;
}

export function selectedToOddsMode(selected) {
  return selected === DECIMAL_ODDS ? "decimal" : "fractional";
}

export function readOddsPreference() {
  if (typeof window === "undefined") {
    return FRACTIONAL_ODDS;
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "decimal") return DECIMAL_ODDS;
  if (stored === "fractional") return FRACTIONAL_ODDS;
  return FRACTIONAL_ODDS;
}

export function writeOddsPreference(selected) {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.setItem(STORAGE_KEY, selectedToOddsMode(selected));
}
