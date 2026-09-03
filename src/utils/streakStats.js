const STREAK_CATEGORY_KEYS = new Set(["general", "head2head"]);

/**
 * True when payload looks like SofaScore streak categories (arrays of streak rows).
 * Rejects API error bodies like `{ error: "..." }` and other non-streak shapes.
 */
export function hasValidStreaks(stats) {
  if (!stats || typeof stats !== "object" || Array.isArray(stats)) {
    return false;
  }
  if (stats.error != null) {
    return false;
  }

  return Object.entries(stats).some(
    ([key, value]) =>
      Array.isArray(value) &&
      value.length > 0 &&
      value.every(
        (item) => item && typeof item === "object" && !Array.isArray(item)
      ) &&
      (STREAK_CATEGORY_KEYS.has(key) || value.some((item) => "name" in item))
  );
}

/** Categories safe to render in StreakStats (array values only). */
export function getStreakCategories(stats) {
  if (!hasValidStreaks(stats)) {
    return [];
  }

  return Object.entries(stats).filter(
    ([, streakList]) =>
      Array.isArray(streakList) &&
      streakList.every(
        (item) => item && typeof item === "object" && !Array.isArray(item)
      )
  );
}
