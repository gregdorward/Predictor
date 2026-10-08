import { getPointsFromLastX } from "../../utils/getPointsFromLastX";
import {
  transformGroupStageTables,
  flattenGroupTables,
  GROUP_STAGE_LEAGUE_IDS,
} from "../../utils/groupStageTables";

export const MLS_SEASON_ID = 16504;
export const CONFERENCE_SCOPE_OVERALL = "overall";
export const CONFERENCE_SCOPE_EAST = "east";
export const CONFERENCE_SCOPE_WEST = "west";
export const CONFERENCE_SCOPES = [
  CONFERENCE_SCOPE_OVERALL,
  CONFERENCE_SCOPE_EAST,
  CONFERENCE_SCOPE_WEST,
];

const MLS_EAST_TEAM_IDS = new Set([
  1, // Montreal Impact
  2, // New York City FC
  4, // New York Red Bulls
  7, // Chicago Fire
  9, // Columbus Crew
  11, // New England Revolution
  16, // Philadelphia Union
  17, // Orlando City SC
  19, // Toronto FC
  8043, // FC Cincinnati
  1016, // Atlanta United FC
  13401, // DC United
  677446, // Inter Miami
  677447, // Nashville SC
  711351, // Charlotte FC
]);

const MLS_WEST_TEAM_IDS = new Set([
  5, // Vancouver Whitecaps
  6, // Houston Dynamo
  8, // Sporting Kansas City
  10, // LA Galaxy
  12, // Colorado Rapids
  13, // FC Dallas
  14, // Real Salt Lake
  15, // San Jose Earthquakes
  18, // Seattle Sounders
  20, // Portland Timbers
  1015, // Minnesota United
  6490, // Los Angeles FC
  698284, // Austin FC
  945555, // St. Louis City
  1398748, // San Diego FC
]);

const MLS_EAST_TEAM_NAMES = new Set([
  "atlanta united fc",
  "charlotte",
  "charlotte fc",
  "chicago fire",
  "club internacional de futbol miami",
  "club internacional de fútbol miami",
  "columbus crew",
  "dc united",
  "fc cincinnati",
  "inter miami",
  "montreal impact",
  "nashville sc",
  "nashville sc mls",
  "new england revolution",
  "new york city",
  "new york city fc",
  "new york rb",
  "new york red bulls",
  "orlando city",
  "orlando city sc",
  "philadelphia union",
  "toronto",
  "toronto fc",
]);

const MLS_WEST_TEAM_NAMES = new Set([
  "austin",
  "austin fc",
  "colorado rapids",
  "fc dallas",
  "houston dynamo",
  "la galaxy",
  "los angeles fc",
  "minnesota united",
  "minnesota united fc",
  "portland timbers",
  "real salt lake",
  "san diego",
  "san diego fc",
  "san jose earthquakes",
  "seattle sounders",
  "seattle sounders fc",
  "sj earthquakes",
  "sporting kansas city",
  "sporting kc",
  "st louis city",
  "st louis city sc",
  "vancouver whitecaps",
  "vancouver whitecaps fc",
]);

export function isMlsSeason(seasonId) {
  return Number(seasonId) === MLS_SEASON_ID;
}

export function normaliseMlsConferenceName(name) {
  const normalized = String(name || "").toLowerCase();
  if (normalized.includes("east")) return CONFERENCE_SCOPE_EAST;
  if (normalized.includes("west")) return CONFERENCE_SCOPE_WEST;
  return CONFERENCE_SCOPE_OVERALL;
}

export function conferenceScopeLabel(scope) {
  if (scope === CONFERENCE_SCOPE_EAST) return "Eastern Conference";
  if (scope === CONFERENCE_SCOPE_WEST) return "Western Conference";
  return "Overall";
}

function normaliseLookupValue(value) {
  if (value == null || value === "") return null;
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function mlsConferenceScopeForTeam(team) {
  const id = Number(team?.id ?? team?.ID);
  if (MLS_EAST_TEAM_IDS.has(id)) return CONFERENCE_SCOPE_EAST;
  if (MLS_WEST_TEAM_IDS.has(id)) return CONFERENCE_SCOPE_WEST;

  const names = [
    team?.name,
    team?.Name,
    team?.english_name,
    team?.cleanName,
  ]
    .map(normaliseLookupValue)
    .filter(Boolean);

  if (names.some((name) => MLS_EAST_TEAM_NAMES.has(name))) {
    return CONFERENCE_SCOPE_EAST;
  }
  if (names.some((name) => MLS_WEST_TEAM_NAMES.has(name))) {
    return CONFERENCE_SCOPE_WEST;
  }
  return CONFERENCE_SCOPE_OVERALL;
}

function teamLookupKeys(team) {
  const keys = [];
  const ids = [team?.id, team?.ID];
  const names = [
    team?.name,
    team?.Name,
    team?.english_name,
    team?.cleanName,
  ];

  ids.forEach((id) => {
    if (id != null && id !== "") keys.push(`id:${String(id)}`);
  });

  names.forEach((name) => {
    const normalized = normaliseLookupValue(name);
    if (normalized) keys.push(`name:${normalized}`);
  });

  return [...new Set(keys)];
}

export function buildTeamConferenceLookup(views) {
  const lookup = new Map();
  const teams =
    views?.mode === "grouped" && Array.isArray(views.teams) ? views.teams : [];

  teams.forEach((team) => {
    const scope = normaliseMlsConferenceName(team.GroupName);
    if (scope === CONFERENCE_SCOPE_OVERALL) return;
    teamLookupKeys(team).forEach((key) => lookup.set(key, scope));
  });

  return lookup;
}

export function getTeamConferenceScope(team, lookup) {
  if (!lookup?.size) return CONFERENCE_SCOPE_OVERALL;
  for (const key of teamLookupKeys(team)) {
    const scope = lookup.get(key);
    if (scope) return scope;
  }
  return CONFERENCE_SCOPE_OVERALL;
}

export function conferenceScopeIsAvailable(views, scope) {
  if (scope === CONFERENCE_SCOPE_OVERALL) return true;
  const lookup = buildTeamConferenceLookup(views);
  for (const value of lookup.values()) {
    if (value === scope) return true;
  }
  return false;
}

export function filterTeamsByConference(teams, scope, lookup) {
  if (scope === CONFERENCE_SCOPE_OVERALL || !Array.isArray(teams)) {
    return teams || [];
  }

  const filtered = teams.filter(
    (team) => getTeamConferenceScope(team, lookup) === scope
  );

  return filtered.length ? filtered : teams;
}

function getLast5(wdlRecord) {
  if (!wdlRecord?.length) {
    return "N/A";
  }
  if (wdlRecord.length < 5) {
    return wdlRecord.slice(-wdlRecord.length).toUpperCase();
  }
  return wdlRecord.slice(-5).toUpperCase();
}

export function teamRowHasHomeAwaySplit(currentTeam) {
  return (
    currentTeam?.seasonWins_home != null &&
    currentTeam?.seasonWins_away != null &&
    currentTeam?.seasonGoals_home != null &&
    currentTeam?.seasonGoals_away != null
  );
}

function finitePositive(value) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function mapTeamRow(currentTeam, leagueId, index, groupName) {
  const last5 = getLast5(currentTeam.wdl_record);
  const team = {
    LeagueID: leagueId,
    Position:
      finitePositive(currentTeam.position) ||
      finitePositive(currentTeam.leaguePosition_overall) ||
      index + 1,
    Name: currentTeam.cleanName || currentTeam.name,
    ID: currentTeam.id,
    Played: currentTeam.matchesPlayed,
    Wins: currentTeam.seasonWins_overall,
    Draws: currentTeam.seasonDraws_overall,
    Losses: currentTeam.seasonLosses_overall,
    For: currentTeam.seasonGoals,
    Against:
      currentTeam.seasonConceded_home + currentTeam.seasonConceded_away,
    GoalDifference: currentTeam.seasonGoalDifference,
    Form: last5,
    LastXPoints: getPointsFromLastX(last5 === "N/A" ? [] : last5.split("")),
    Points: currentTeam.points,
    wdl: currentTeam.wdl_record,
    seasonGoals: currentTeam.seasonGoals,
    seasonConceded: currentTeam.seasonConceded,
    zone: currentTeam.zone?.name ?? "mid-table",
  };

  if (teamRowHasHomeAwaySplit(currentTeam)) {
    team.HomeWins = currentTeam.seasonWins_home;
    team.HomeDraws = currentTeam.seasonDraws_home;
    team.HomeLosses = currentTeam.seasonLosses_home;
    team.HomeFor = currentTeam.seasonGoals_home;
    team.HomeAgainst = currentTeam.seasonConceded_home;
    team.AwayWins = currentTeam.seasonWins_away;
    team.AwayDraws = currentTeam.seasonDraws_away;
    team.AwayLosses = currentTeam.seasonLosses_away;
    team.AwayFor = currentTeam.seasonGoals_away;
    team.AwayAgainst = currentTeam.seasonConceded_away;
  }

  if (groupName) {
    team.GroupName = groupName;
  }

  return team;
}

function viewsSupportClassicTable(teams) {
  return Array.isArray(teams) && teams.some((team) => team.HomeWins != null);
}

function withClassicTableFlag(view) {
  if (!view) {
    return null;
  }

  if (view.mode === "divisions") {
    const divisions = view.divisions.map((division) => ({
      ...division,
      teams: division.teams,
    }));
    const supportsClassicTable = divisions.some((division) =>
      viewsSupportClassicTable(division.teams)
    );
    return { ...view, divisions, supportsClassicTable };
  }

  return {
    ...view,
    supportsClassicTable: viewsSupportClassicTable(view.teams),
  };
}

function mapTableRows(source, leagueId, groupName) {
  if (!source?.length) {
    return [];
  }

  return source.map((currentTeam, index) =>
    mapTeamRow(currentTeam, leagueId, index, groupName)
  );
}

function sortMlsStandingsRows(rows) {
  return [...rows].sort((a, b) => {
    const points = (Number(b.points) || 0) - (Number(a.points) || 0);
    if (points !== 0) return points;
    const gd =
      (Number(b.seasonGoalDifference) || 0) -
      (Number(a.seasonGoalDifference) || 0);
    if (gd !== 0) return gd;
    return (Number(a.position) || 0) - (Number(b.position) || 0);
  });
}

function mergeMlsFallbackRows(data) {
  const leagueTable = Array.isArray(data.league_table) ? data.league_table : [];
  const specificTable = Array.isArray(data.specific_tables?.[0]?.table)
    ? data.specific_tables[0].table
    : [];
  const teamsList = Array.isArray(data.teams)
    ? data.teams
    : Array.isArray(data.team)
      ? data.team
      : [];

  const formById = new Map();
  [...specificTable, ...leagueTable, ...teamsList].forEach((team) => {
    const id = Number(team?.id ?? team?.ID);
    if (!Number.isFinite(id) || !team?.wdl_record) return;
    if (!formById.has(id)) formById.set(id, team.wdl_record);
  });

  const source = leagueTable.length
    ? leagueTable
    : specificTable.length
      ? specificTable
      : teamsList;

  return source.map((team) => {
    const id = Number(team?.id ?? team?.ID);
    const wdl = team.wdl_record || formById.get(id);
    return wdl ? { ...team, wdl_record: wdl } : team;
  });
}

function buildMlsConferenceViews(leagueId, data) {
  const groups = data.specific_tables?.[0]?.groups;
  if (!isMlsSeason(leagueId)) {
    return null;
  }

  if (groups?.length) {
    const teams = groups.flatMap((group) =>
      mapTableRows(group.table, leagueId, group.name || group.round)
    );

    return teams.length ? { mode: "grouped", teams } : null;
  }

  const source = mergeMlsFallbackRows(data);
  if (!source.length) {
    return null;
  }

  const east = [];
  const west = [];
  source.forEach((team) => {
    const scope = mlsConferenceScopeForTeam(team);
    if (scope === CONFERENCE_SCOPE_EAST) east.push(team);
    if (scope === CONFERENCE_SCOPE_WEST) west.push(team);
  });

  const teams = [
    ...mapTableRows(
      sortMlsStandingsRows(east),
      leagueId,
      conferenceScopeLabel(CONFERENCE_SCOPE_EAST)
    ),
    ...mapTableRows(
      sortMlsStandingsRows(west),
      leagueId,
      conferenceScopeLabel(CONFERENCE_SCOPE_WEST)
    ),
  ];

  return teams.length ? { mode: "grouped", teams } : null;
}

/**
 * Resolve homepage/fixture table rows for leagues with conference tables (e.g. MLS).
 * Prefers pre-built bespoke divisions; falls back to raw league payload.
 */
export function resolveConferenceLeagueTeams(
  seasonId,
  bespokeDivisions = [],
  leaguePayload = null
) {
  const id = Number(seasonId);
  const fromBespoke = bespokeDivisions.filter(
    (entry) => Number(entry.id) === id && entry.table?.length
  );

  if (fromBespoke.length > 0) {
    return fromBespoke.flatMap((division) =>
      division.table.map((team) => ({
        ...team,
        GroupName: team.GroupName || division.group,
      }))
    );
  }

  const views = leaguePayload
    ? buildCompetitionLeagueTableViews(seasonId, leaguePayload)
    : null;

  if (views?.mode === "grouped" || views?.mode === "standard") {
    return views.teams;
  }

  return [];
}

/**
 * Build LeagueTable-compatible team rows from a single league tables API response.
 * Mirrors generateTables() in getFixtures.js for one competition.
 */
export function buildCompetitionLeagueTableViews(seasonId, league) {
  const leagueId = Number(seasonId);
  const data = league?.data;
  if (!data) {
    return null;
  }

  if (GROUP_STAGE_LEAGUE_IDS.includes(leagueId)) {
    const groupTables = transformGroupStageTables(league, leagueId);
    if (!groupTables.length) {
      return null;
    }

    return withClassicTableFlag({
      mode: "grouped",
      teams: flattenGroupTables(groupTables),
    });
  }

  const mlsViews = buildMlsConferenceViews(leagueId, data);
  if (mlsViews) {
    return withClassicTableFlag(mlsViews);
  }

  const specificTable = data.specific_tables?.[0]?.table;

  if (specificTable?.length && leagueId !== 12933) {
    return withClassicTableFlag({
      mode: "standard",
      teams: mapTableRows(specificTable, leagueId),
    });
  }

  if (Array.isArray(data.league_table) && data.league_table.length) {
    return withClassicTableFlag({
      mode: "standard",
      teams: mapTableRows(data.league_table, leagueId),
    });
  }

  if (data.league_table === null && data.all_matches_table_overall?.length) {
    return withClassicTableFlag({
      mode: "standard",
      teams: mapTableRows(data.all_matches_table_overall, leagueId),
    });
  }

  return null;
}
