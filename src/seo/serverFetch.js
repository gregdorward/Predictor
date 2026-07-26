import { resolveFixtureLeagueName } from "./competitionCatalog";
import {
  buildFixtureUrl,
  FIXTURE_SITEMAP_WINDOW_DAYS,
  isFixtureFinished,
} from "./fixtureSlug";

const ORIGIN = process.env.NEXT_PUBLIC_EXPRESS_SERVER || "https://api.soccerstatshub.com/";

/** Default budget for sitemap / SEO server fetches (ms). */
export const SEO_FETCH_TIMEOUT_MS = 4000;

function originUrl(path) {
  const base = ORIGIN.endsWith("/") ? ORIGIN : `${ORIGIN}/`;
  return `${base}${String(path).replace(/^\//, "")}`;
}

async function fetchJson(path, { timeoutMs = SEO_FETCH_TIMEOUT_MS } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(originUrl(path), {
      headers: { accept: "application/json" },
      signal: controller.signal,
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchCompetitionData(seasonId) {
  try {
    const json = await fetchJson(`competition/${seasonId}`, {
      timeoutMs: 8000,
    });
    if (!json?.success || !json?.data) return null;
    return json.data;
  } catch {
    return null;
  }
}

export async function fetchMatchSnapshot(matchId) {
  try {
    const json = await fetchJson(`match/snapshot/${matchId}`, {
      timeoutMs: 6000,
    });
    return json?.data ?? null;
  } catch {
    return null;
  }
}

export async function fetchMatchesForDate(dateStr, { timeoutMs = SEO_FETCH_TIMEOUT_MS } = {}) {
  const json = await fetchJson(`matches/${dateStr}`, { timeoutMs });
  if (!json) return [];
  const list = Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : [];
  return list;
}

export function formatApiDate(date) {
  const d = date instanceof Date ? date : new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export async function fetchUpcomingFixtureIds(days = 3) {
  const ids = new Set();
  const today = new Date();

  const dateStrings = [];
  for (let offset = 0; offset < days; offset += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() + offset);
    dateStrings.push(formatApiDate(date));
  }

  const results = await Promise.all(
    dateStrings.map((dateStr) => fetchMatchesForDate(dateStr))
  );

  for (const matches of results) {
    for (const match of matches) {
      if (match?.id != null) ids.add(String(match.id));
    }
  }

  return [...ids];
}

function formatFixtureDate(match) {
  const dateUnix = match?.date_unix ?? match?.date;
  if (dateUnix == null) return "";
  const date = new Date(Number(dateUnix) * 1000);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function matchToFixtureLink(match) {
  if (!match?.id) return null;
  const home = match.home_name || match.homeTeam || "Home";
  const away = match.away_name || match.awayTeam || "Away";
  return {
    label: `${home} vs ${away}`,
    href: buildFixtureUrl(home, away, match.id),
    league: resolveFixtureLeagueName(match),
    homeTeam: home,
    awayTeam: away,
    date: formatFixtureDate(match),
  };
}

/**
 * Upcoming fixture links for sitemaps / index pages.
 * Fetches date windows in parallel with per-request timeouts so one slow day
 * cannot hang the whole response.
 */
export async function fetchUpcomingFixtureLinks({
  excludeMatchId = null,
  limit = 150,
  days = FIXTURE_SITEMAP_WINDOW_DAYS,
  timeoutMs = SEO_FETCH_TIMEOUT_MS,
} = {}) {
  const today = new Date();
  const dateStrings = [];
  for (let offset = 0; offset < days; offset += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() + offset);
    dateStrings.push(formatApiDate(date));
  }

  const settled = await Promise.allSettled(
    dateStrings.map((dateStr) => fetchMatchesForDate(dateStr, { timeoutMs }))
  );

  const links = [];
  for (const result of settled) {
    const matches = result.status === "fulfilled" ? result.value : [];
    for (const match of matches) {
      if (excludeMatchId != null && String(match.id) === String(excludeMatchId)) {
        continue;
      }
      if (isFixtureFinished(match)) continue;

      const link = matchToFixtureLink(match);
      if (!link) continue;

      links.push(link);
      if (links.length >= limit) return links;
    }
  }

  return links;
}
