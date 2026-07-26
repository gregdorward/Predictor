/**
 * Server-safe fetchers for stat hub pages.
 * Unlike getStatsInsights.js, these do NOT short-circuit when window is undefined.
 */

const ORIGIN =
  process.env.NEXT_PUBLIC_EXPRESS_SERVER || "https://api.soccerstatshub.com/";

const STAT_FETCH_TIMEOUT_MS = 8000;

export const STAT_HUB_ALLOWED_COUNTRIES = [
  "England",
  "Scotland",
  "Italy",
  "Spain",
  "Germany",
  "France",
  "USA",
  "Denmark",
  "Greece",
  "Turkey",
  "Switzerland",
  "Austria",
  "Norway",
  "Mexico",
  "Poland",
  "Brazil",
  "Argentina",
  "Sweden",
  "Netherlands",
  "Portugal",
  "Belgium",
];

function originUrl(path) {
  const base = ORIGIN.endsWith("/") ? ORIGIN : `${ORIGIN}/`;
  return `${base}${String(path).replace(/^\//, "")}`;
}

async function fetchEndpoint(path) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), STAT_FETCH_TIMEOUT_MS);
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

function formatTimestamp(timestamp) {
  if (timestamp == null) return "N/A";
  const newDate = new Date(Number(timestamp) * 1000);
  if (Number.isNaN(newDate.getTime())) return "N/A";
  const [day, month, year] = newDate.toLocaleDateString("en-GB").split("/");
  const time = newDate.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${year}-${day}-${month} ${time}`;
}

/** Next.js cannot serialize `undefined` in getServerSideProps props. */
function jsonSafe(value) {
  return JSON.parse(JSON.stringify(value, (_key, v) => (v === undefined ? null : v)));
}

function nil(value) {
  return value === undefined ? null : value;
}

export async function fetchOver25Payload() {
  return fetchEndpoint("over25");
}

export async function fetchUnder25Payload() {
  return fetchEndpoint("under25");
}

export async function fetchBttsPayload() {
  return fetchEndpoint("btts");
}

export function mapHighestScoringLeagues(payload) {
  const list = payload?.data?.top_leagues?.data;
  if (!Array.isArray(list)) return [];
  return list.map((league) => ({
    league: nil(league.name),
    leagueCountry: nil(league.country),
    averageGoals: nil(league.seasonAVG_overall),
    over25Percentage: nil(league.seasonOver25Percentage_overall),
    division: nil(league.division),
    leagueId: nil(league.id),
    domestic_scale: nil(league.domestic_scale),
  }));
}

export function mapLowestScoringLeagues(payload) {
  const list = payload?.data?.top_leagues?.data;
  if (!Array.isArray(list)) return [];
  return list.map((league) => ({
    league: nil(league.name),
    leagueCountry: nil(league.country),
    averageGoals: nil(league.seasonAVG_overall),
    under25Percentage: nil(league.seasonUnder25Percentage_overall),
    division: nil(league.division),
    leagueId: nil(league.id),
  }));
}

export function mapHighestScoringTeams(payload) {
  const list = payload?.data?.top_teams?.data;
  if (!Array.isArray(list)) return [];
  return list.map((team) => ({
    team: nil(team.full_name),
    next_match_team: nil(team.next_match_team),
    teamCountry: nil(team.country),
    averageGoals: nil(team.seasonAVG_overall),
    over25Percentage: nil(team.seasonOver25Percentage_overall),
    division: nil(team.division),
    leagueId: nil(team.id),
  }));
}

export function mapHighestScoringFixtures(payload) {
  const list = payload?.data?.top_fixtures?.data;
  if (!Array.isArray(list)) return [];
  const fixtures = [...list].sort((a, b) => a.date_unix - b.date_unix);
  return fixtures.map((fixture) => ({
    date: fixture.date_unix ? formatTimestamp(fixture.date_unix) : "N/A",
    country: nil(fixture.country),
    odds: nil(fixture.odds_ft_over25),
    avgGoals: nil(fixture.avg_potential),
    match: nil(fixture.name),
    progress: nil(fixture.progress),
  }));
}

export function mapBttsFixtures(payload) {
  const list = payload?.data?.top_fixtures?.data;
  if (!Array.isArray(list)) return [];
  const fixtures = [...list].sort((a, b) => a.date_unix - b.date_unix);
  return fixtures.map((fixture) => ({
    date: fixture.date_unix ? formatTimestamp(fixture.date_unix) : "N/A",
    country: nil(fixture.country),
    odds: nil(fixture.odds_btts_yes),
    avgGoals: nil(fixture.avg_potential),
    match: nil(fixture.name),
    progress: nil(fixture.progress),
  }));
}

export function mapBttsTeams(payload) {
  const list = payload?.data?.top_teams?.data;
  if (!Array.isArray(list)) return [];
  const teams = [...list].sort(
    (a, b) => b.seasonBTTSPercentage_overall - a.seasonBTTSPercentage_overall
  );
  return teams.map((team) => ({
    date: team.next_match_date
      ? formatTimestamp(team.next_match_date)
      : "N/A",
    country: nil(team.country),
    odds: nil(team.odds_btts_yes),
    played: nil(team.seasonMatchesPlayed_overall),
    bttsPercentage: nil(team.seasonBTTSPercentage_overall),
    name: nil(team.name),
    opponent: nil(team.next_match_team),
    progress: nil(team.progress),
  }));
}

export function filterLeagueRows(rows, { limit = 50 } = {}) {
  return rows
    .filter(
      (league) =>
        STAT_HUB_ALLOWED_COUNTRIES.includes(league.leagueCountry) &&
        league.division > 0 &&
        league.division < 5
    )
    .slice(0, limit);
}

export function filterTeamCountryRows(rows) {
  return rows.filter((row) =>
    STAT_HUB_ALLOWED_COUNTRIES.includes(row.teamCountry || row.country)
  );
}

export async function loadU25Rows() {
  const payload = await fetchUnder25Payload();
  return jsonSafe(
    filterLeagueRows(mapLowestScoringLeagues(payload), { limit: 50 }).sort(
      (a, b) => Number(a.averageGoals) - Number(b.averageGoals)
    )
  );
}

export async function loadO25TeamRows() {
  const payload = await fetchOver25Payload();
  return jsonSafe(filterTeamCountryRows(mapHighestScoringTeams(payload)));
}

export async function loadHighestScoringLeagueRows() {
  const payload = await fetchOver25Payload();
  return jsonSafe(
    filterLeagueRows(mapHighestScoringLeagues(payload), { limit: 50 }).sort(
      (a, b) => Number(b.averageGoals) - Number(a.averageGoals)
    )
  );
}

export async function loadO25FixtureRows() {
  const payload = await fetchOver25Payload();
  return jsonSafe(
    mapHighestScoringFixtures(payload)
      .filter(
        (game) =>
          STAT_HUB_ALLOWED_COUNTRIES.includes(game.country) &&
          game.progress > 50 &&
          game.avgGoals > 2.5
      )
      .slice(0, 30)
  );
}

export async function loadBttsFixtureRows() {
  const payload = await fetchBttsPayload();
  return jsonSafe(
    mapBttsFixtures(payload)
      .filter(
        (game) =>
          STAT_HUB_ALLOWED_COUNTRIES.includes(game.country) &&
          game.progress > 30 &&
          game.avgGoals > 3
      )
      .slice(0, 30)
  );
}

export async function loadBttsTeamRows() {
  const payload = await fetchBttsPayload();
  return jsonSafe(
    filterTeamCountryRows(mapBttsTeams(payload))
      .filter((game) => game.played > 10)
      .slice(0, 30)
  );
}

export async function loadBttsNoTeamRows() {
  const payload = await fetchBttsPayload();
  return jsonSafe(
    mapBttsTeams(payload)
      .filter(
        (game) =>
          STAT_HUB_ALLOWED_COUNTRIES.includes(game.country) && game.played > 10
      )
      .sort((a, b) => a.bttsPercentage - b.bttsPercentage)
      .slice(0, 30)
  );
}
