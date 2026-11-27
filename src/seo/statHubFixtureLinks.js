import { buildFixtureUrl } from "./fixtureSlug";

const ORIGIN =
  process.env.NEXT_PUBLIC_EXPRESS_SERVER || "https://api.soccerstatshub.com/";

const COVERED_DAY_TTL_MS = 60_000;
const coveredDayCache = new Map();

function originUrl(path) {
  const base = ORIGIN.endsWith("/") ? ORIGIN : `${ORIGIN}/`;
  return `${base}${String(path).replace(/^\//, "")}`;
}

/** UTC day key used by /matches/{date}. */
export function fixtureDateKey(dateUnix) {
  const date = new Date(Number(dateUnix) * 1000);
  if (Number.isNaN(date.getTime())) return null;
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

async function loadCoveredDay(dateStr) {
  const cached = coveredDayCache.get(dateStr);
  if (cached && Date.now() - cached.at < COVERED_DAY_TTL_MS) return cached.promise;

  const promise = (async () => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch(originUrl(`matches/${dateStr}`), {
        headers: { accept: "application/json" },
        signal: controller.signal,
      });
      if (!response.ok) return [];
      const json = await response.json();
      if (Array.isArray(json?.data)) return json.data;
      if (Array.isArray(json)) return json;
      return [];
    } catch {
      return [];
    } finally {
      clearTimeout(timer);
    }
  })();

  coveredDayCache.set(dateStr, { at: Date.now(), promise });
  return promise;
}

/**
 * Link a hub row only when its match id is in the fixtures we publish.
 * Fixture rows use matchId. Team rows use nextMatchId.
 */
export function attachFixtureLinks(rows, coveredMatches) {
  const byId = new Map();
  for (const match of coveredMatches || []) {
    if (match?.id == null) continue;
    byId.set(String(match.id), match);
  }

  return rows.map((row) => {
    const id = row.matchId ?? row.nextMatchId;
    const match = id == null ? null : byId.get(String(id));
    const home = match?.home_name || match?.homeTeam;
    const away = match?.away_name || match?.awayTeam;
    const href = home && away ? buildFixtureUrl(home, away, id) : null;
    return { ...row, href };
  });
}

export async function withCoveredFixtureLinks(rows) {
  if (!Array.isArray(rows) || rows.length === 0) return [];
  const dates = [
    ...new Set(rows.map((row) => fixtureDateKey(row.dateUnix)).filter(Boolean)),
  ];
  const lists = await Promise.all(dates.map((dateStr) => loadCoveredDay(dateStr)));
  return attachFixtureLinks(rows, lists.flat());
}
