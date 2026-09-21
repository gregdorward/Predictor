/** Free predicted score / 1X2 unlocks per calendar day (local timezone). */
export const FREE_DAILY_PREDICTION_LIMIT = 10;

const STORAGE_KEY_PREFIX = "ssh-free-predictions:";

function todayKey(now = new Date()) {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function storageKey(now = new Date()) {
  return `${STORAGE_KEY_PREFIX}${todayKey(now)}`;
}

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function normalizeId(fixtureId) {
  if (fixtureId == null || fixtureId === "") return null;
  return String(fixtureId);
}

/**
 * Read unlocked fixture ids for today. Returns a new Set.
 * @param {Date} [now]
 * @returns {Set<string>}
 */
export function getUnlockedFixtureIds(now = new Date()) {
  if (!canUseStorage()) return new Set();
  try {
    const raw = window.localStorage.getItem(storageKey(now));
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.map(String).filter(Boolean));
  } catch {
    return new Set();
  }
}

function persistUnlockedIds(ids, now = new Date()) {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(storageKey(now), JSON.stringify([...ids]));
  } catch {
    // Quota / private mode — ignore; unlocks stay in-memory for the session via callers.
  }
}

/**
 * How many free unlocks remain today (0 if paid — they have unlimited).
 * @param {boolean} isPaidUser
 * @param {Date} [now]
 */
export function getRemainingFreeUnlocks(isPaidUser, now = new Date()) {
  if (isPaidUser) return Infinity;
  const used = getUnlockedFixtureIds(now).size;
  return Math.max(0, FREE_DAILY_PREDICTION_LIMIT - used);
}

/**
 * Whether this fixture's predicted score / 1X2 is visible.
 * Paid users always true. Free users if the id was unlocked today.
 * @param {boolean} isPaidUser
 * @param {string|number} fixtureId
 * @param {Date} [now]
 */
export function isFixturePredictionUnlocked(isPaidUser, fixtureId, now = new Date()) {
  if (isPaidUser) return true;
  const id = normalizeId(fixtureId);
  if (!id) return false;
  return getUnlockedFixtureIds(now).has(id);
}

/**
 * Attempt to unlock a fixture for free predictions today.
 * Already unlocked → success without consuming an extra slot.
 * At limit → { unlocked: false, remaining: 0 }.
 *
 * @param {boolean} isPaidUser
 * @param {string|number} fixtureId
 * @param {Date} [now]
 * @returns {{ unlocked: boolean, remaining: number }}
 */
export function tryUnlockFixture(isPaidUser, fixtureId, now = new Date()) {
  if (isPaidUser) {
    return { unlocked: true, remaining: Infinity };
  }

  const id = normalizeId(fixtureId);
  if (!id) {
    return { unlocked: false, remaining: getRemainingFreeUnlocks(false, now) };
  }

  const ids = getUnlockedFixtureIds(now);
  if (ids.has(id)) {
    return {
      unlocked: true,
      remaining: Math.max(0, FREE_DAILY_PREDICTION_LIMIT - ids.size),
    };
  }

  if (ids.size >= FREE_DAILY_PREDICTION_LIMIT) {
    return { unlocked: false, remaining: 0 };
  }

  ids.add(id);
  persistUnlockedIds(ids, now);
  return {
    unlocked: true,
    remaining: Math.max(0, FREE_DAILY_PREDICTION_LIMIT - ids.size),
  };
}

/** Test helper — clear today's unlocks. */
export function clearFreePredictionAllowance(now = new Date()) {
  if (!canUseStorage()) return;
  try {
    window.localStorage.removeItem(storageKey(now));
  } catch {
    // ignore
  }
}
