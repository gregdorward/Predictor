import { apiGetUrl } from "./apiUrl";
import { isCompleteLeagueHistoryFixture } from "./leagueResultsAccess";

/** FootyStats / form cache key format: MMDDYYYY (no zero-padding). */
export function toFormDateKeyFromIso(isoDate) {
  const [year, month, day] = String(isoDate).split("-").map(Number);
  if (!year || !month || !day) {
    return null;
  }
  return `${month}${day}${year}`;
}

export function toIsoDateFromLocal(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return null;
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function isIsoDateToday(isoDate, now = new Date()) {
  const [year, month, day] = String(isoDate).split("-").map(Number);
  if (!year || !month || !day) return false;
  return (
    now.getFullYear() === year &&
    now.getMonth() + 1 === month &&
    now.getDate() === day
  );
}

/** Start of the calendar day (UTC) as FootyStats `date_unix` seconds. */
export function isoDateToStartUnix(isoDate) {
  const [year, month, day] = String(isoDate).split("-").map(Number);
  if (!year || !month || !day) return null;
  return Math.floor(Date.UTC(year, month - 1, day) / 1000);
}

/**
 * Season-to-date goal rates from cached league results, excluding the
 * selected day and later. Used when a dated S3 snapshot is missing.
 */
export function buildLeagueAveragesAsOf(leagueResults, isoDate) {
  const cutoff = isoDateToStartUnix(isoDate);
  if (!Array.isArray(leagueResults) || cutoff == null) {
    return [];
  }

  const rows = [];
  for (const entry of leagueResults) {
    if (entry?.id == null) continue;
    const fixtures = Array.isArray(entry.fixtures) ? entry.fixtures : [];
    let homeSum = 0;
    let awaySum = 0;
    let games = 0;

    for (const fixture of fixtures) {
      if (!isCompleteLeagueHistoryFixture(fixture)) continue;
      const kickoff = Number(fixture.date_unix);
      if (!Number.isFinite(kickoff) || kickoff >= cutoff) continue;
      const homeGoals = Number(fixture.homeGoalCount);
      const awayGoals = Number(fixture.awayGoalCount);
      if (!Number.isFinite(homeGoals) || !Number.isFinite(awayGoals)) continue;
      homeSum += homeGoals;
      awaySum += awayGoals;
      games += 1;
    }

    if (games === 0) continue;
    rows.push({
      id: entry.id,
      averageGoals: (homeSum + awaySum) / games,
      averageGoalsHome: homeSum / games,
      averageGoalsAway: awaySum / games,
    });
  }

  return rows;
}

export async function persistLeagueAveragesForDate(
  formDateKey,
  averages,
  origin = process.env.NEXT_PUBLIC_EXPRESS_SERVER
) {
  if (!formDateKey || !Array.isArray(averages) || averages.length === 0) {
    return false;
  }
  if (!origin) return false;

  const base = origin.endsWith("/") ? origin : `${origin}/`;
  try {
    const response = await fetch(`${base}league-averages/${formDateKey}`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(averages),
    });
    return response.ok;
  } catch (error) {
    console.warn(
      `Failed to persist league averages for ${formDateKey}:`,
      error
    );
    return false;
  }
}

async function fetchDatedLeagueAverages(formDateKey) {
  if (!formDateKey) return null;
  try {
    const datedResponse = await fetch(
      apiGetUrl(`league-averages/${formDateKey}`)
    );
    if (!datedResponse.ok) return null;
    const dated = await datedResponse.json();
    if (Array.isArray(dated) && dated.length > 0) {
      return dated;
    }
  } catch (error) {
    console.warn(
      `Dated league averages unavailable for ${formDateKey}:`,
      error
    );
  }
  return null;
}

async function fetchGlobalLeagueAverages() {
  const globalResponse = await fetch(apiGetUrl("league-averages"));
  if (!globalResponse.ok) {
    throw new Error(
      `Failed to load league averages (${globalResponse.status}).`
    );
  }
  return globalResponse.json();
}

/**
 * Prefer a dated league-averages snapshot (point-in-time safe), then fall back
 * to the latest global cache.
 */
export async function fetchLeagueAveragesForDate(formDateKey) {
  const dated = await fetchDatedLeagueAverages(formDateKey);
  if (dated) return dated;
  return fetchGlobalLeagueAverages();
}

/**
 * Dated snapshot, else goal rates from results before that day, else global.
 * Persists a snapshot so the next visit does not pick up later results.
 */
export async function resolveLeagueAveragesForDate({
  formDateKey,
  isoDate,
  leagueResults,
  persist = true,
} = {}) {
  const dated = await fetchDatedLeagueAverages(formDateKey);
  if (dated) {
    return { averages: dated, source: "dated" };
  }

  const asOf = buildLeagueAveragesAsOf(leagueResults, isoDate);
  if (asOf.length > 0) {
    if (persist) {
      await persistLeagueAveragesForDate(formDateKey, asOf);
    }
    return { averages: asOf, source: "results-as-of" };
  }

  const global = await fetchGlobalLeagueAverages();
  const list = Array.isArray(global) ? global : [];
  if (persist && isoDate && isIsoDateToday(isoDate) && list.length > 0) {
    await persistLeagueAveragesForDate(formDateKey, list);
  }
  return { averages: list, source: "global" };
}
