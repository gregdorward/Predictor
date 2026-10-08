/** Shared Prediction League helpers (home app + public leaderboard page). */

export const PREDICTION_LEAGUE_STARTING_BUDGET = 50;

export function getMonthKey(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function getMonthLabel(monthKey) {
  const [year, month] = monthKey.split("-").map(Number);
  if (!year || !month) return monthKey;
  const date = new Date(year, month - 1, 1);
  return `${date.toLocaleString("default", { month: "long" })} ${year}`;
}

export function getStartOfMonthMs(monthKey) {
  const [year, month] = monthKey.split("-").map(Number);
  return new Date(year, month - 1, 1).getTime();
}

/**
 * Flatten tipsNEW payload into slips submitted in the given calendar month.
 */
export function slipsFromTipsNewPayload(data, { monthKey }) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return [];
  }

  const startOfMonth = getStartOfMonthMs(monthKey);

  const allSlips = Object.entries(data).flatMap(([uid, userSlips]) => {
    if (!Array.isArray(userSlips)) return [];

    return userSlips
      .map((slip) => {
        const validDates = (slip.selections || [])
          .map((leg) => Number(leg.date))
          .filter((date) => !Number.isNaN(date) && date > 0);

        const earliestUnix =
          validDates.length > 0
            ? Math.min(...validDates)
            : Math.floor(Date.now() / 1000);

        return {
          ...slip,
          tipper: slip.tipper || `User_${uid.substring(0, 5)}`,
          uid,
          earliestGameDate: earliestUnix,
        };
      })
      .filter((slip) => {
        const submissionTime = new Date(slip.submittedAt).getTime();
        return submissionTime >= startOfMonth;
      });
  });

  return [...allSlips].sort(
    (a, b) =>
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  );
}

/** Attach slips, ROI, and sort by monthly profit (matches home leaderboard). */
export function mergeLeaderboardRows(leaderboard, slips) {
  if (!Array.isArray(leaderboard)) return [];

  return leaderboard
    .map((user) => {
      const userSlips = slips.filter((s) => s.uid === user.uid);
      const totalStaked = userSlips.reduce(
        (sum, s) => sum + (Number(s.stake) || 0),
        0
      );
      const roiValue =
        totalStaked > 0 ? (user.monthlyProfit / totalStaked) * 100 : 0;

      const sortedUserSlips = [...userSlips].sort(
        (a, b) =>
          new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      );

      return {
        ...user,
        userSlips: sortedUserSlips,
        roi: Number.isFinite(roiValue) ? roiValue : 0,
      };
    })
    .filter((user) => user.userSlips.length > 0)
    .sort((a, b) => b.monthlyProfit - a.monthlyProfit);
}

/** Pending selections ranked by how often they appear on open slips. */
export function getTrendingSelections(slips, { limit = 5 } = {}) {
  const counts = {};

  slips.forEach((slip) => {
    if (slip.status !== "PENDING") return;

    (slip.selections || []).forEach((sel) => {
      const key = `${sel.gameId}_${sel.tipString}`;
      if (!counts[key]) {
        counts[key] = {
          game: sel.game,
          tip: sel.tipString,
          count: 0,
          odds: sel.odds,
        };
      }
      counts[key].count += 1;
    });
  });

  return Object.values(counts)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export function formatTrendingTipLabel(tip) {
  return tip
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase());
}

export async function fetchTipsNewPayload() {
  const base = process.env.NEXT_PUBLIC_EXPRESS_SERVER || "";
  if (!base) return null;

  try {
    const response = await fetch(`${base}tipsNEW`);
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

export async function fetchLeaderboardRows(monthKey) {
  const base = process.env.NEXT_PUBLIC_EXPRESS_SERVER || "";
  if (!base) return [];

  try {
    const response = await fetch(`${base}leaderboard/${monthKey}`);
    if (!response.ok) return [];
    const json = await response.json();
    return Array.isArray(json) ? json : [];
  } catch {
    return [];
  }
}
