import { getPointsFromLastX } from "../../utils/getPointsFromLastX";
import { isCompleteLeagueHistoryFixture } from "../../utils/leagueResultsAccess";
import { normalizeTeamKey } from "../../utils/competitionTeamLabels";
import { GROUP_STAGE_LEAGUE_IDS } from "../../utils/groupStageTables";
/** Scope key for the full competition roster (all phases). */
export const CUP_PHASE_SCOPE_ALL = "all-teams";

const MLS_SEASON_ID = 16504;

const LEAGUE_STAGE_LABEL = /league\s*stage/i;

function finiteRoundId(value) {
  const id = Number(value);
  return Number.isFinite(id) && id > 0 ? id : null;
}

export function normalizeCupPhaseScope(value) {
  if (value === CUP_PHASE_SCOPE_ALL) return value;
  const id = finiteRoundId(value);
  return id ?? value;
}

export function cupPhaseScopesMatch(a, b) {
  return normalizeCupPhaseScope(a) === normalizeCupPhaseScope(b);
}

export function fixtureRoundId(fixture) {
  return finiteRoundId(fixture?.roundID ?? fixture?.round_id);
}

export function parseCupPhasesFromTables(tablesData) {
  const rounds = tablesData?.specific_tables;
  if (!Array.isArray(rounds)) return [];

  return rounds
    .map((entry, index) => {
      const roundId = finiteRoundId(entry?.round_id);
      const label = String(entry?.round || "").trim();
      if (!roundId || !label) return null;
      return { roundId, label, sortKey: index };
    })
    .filter(Boolean);
}

export function isCupPhaseTablesData(tablesData, seasonId) {
  const leagueId = Number(seasonId);
  if (leagueId === MLS_SEASON_ID || GROUP_STAGE_LEAGUE_IDS.includes(leagueId)) {
    return false;
  }

  const phases = parseCupPhasesFromTables(tablesData);
  if (phases.length < 2) return false;

  const first = tablesData?.specific_tables?.[0];
  if (Array.isArray(first?.table) && first.table.length > 0) {
    return false;
  }

  return true;
}

export function isCupPhaseCompetition(seasonId, tablesData) {
  return isCupPhaseTablesData(tablesData, seasonId);
}

export function collectTeamIdsForRound(fixtures, roundId) {
  const target = finiteRoundId(roundId);
  if (!target) return new Set();

  const ids = new Set();
  (fixtures || []).forEach((fixture) => {
    if (fixtureRoundId(fixture) !== target) return;
    const homeId = finiteRoundId(fixture.homeID);
    const awayId = finiteRoundId(fixture.awayID);
    if (homeId) ids.add(homeId);
    if (awayId) ids.add(awayId);
  });
  return ids;
}

function rememberFixtureTeamName(namesById, teamId, name) {
  const id = finiteRoundId(teamId);
  const label = String(name || "").trim();
  if (!id || !label) return;
  if (!namesById.has(id)) {
    namesById.set(id, label);
  }
}

/**
 * Full phase roster from fixtures (ids + names). Merges competition API
 * team objects when present; FootyStats league-teams often omits early-round
 * sides that are still active in a later phase.
 */
export function buildCupPhaseRosterTeams(
  fixtures,
  roundId,
  competitionTeams = []
) {
  const ids = collectTeamIdsForRound(fixtures, roundId);
  if (!ids.size) return [];

  const byId = new Map();
  (competitionTeams || []).forEach((team) => {
    const id = finiteRoundId(team?.id ?? team?.ID);
    if (id) byId.set(id, team);
  });

  const namesById = new Map();
  (fixtures || []).forEach((fixture) => {
    if (fixtureRoundId(fixture) !== finiteRoundId(roundId)) return;
    rememberFixtureTeamName(namesById, fixture.homeID, fixture.home_name);
    rememberFixtureTeamName(namesById, fixture.awayID, fixture.away_name);
    rememberFixtureTeamName(namesById, fixture.homeID, fixture.homeTeam);
    rememberFixtureTeamName(namesById, fixture.awayID, fixture.awayTeam);
  });

  return [...ids]
    .sort((a, b) => a - b)
    .map((id) => {
      if (byId.has(id)) return byId.get(id);
      const name = namesById.get(id) || `Team ${id}`;
      return {
        id,
        ID: id,
        name,
        cleanName: name,
        english_name: name,
      };
    });
}

export function countTeamsPerRound(fixtures, phases) {
  const counts = new Map();
  (phases || []).forEach((phase) => {
    counts.set(phase.roundId, collectTeamIdsForRound(fixtures, phase.roundId).size);
  });
  return counts;
}

export function pickDefaultPhase(phases, fixtures) {
  if (!Array.isArray(phases) || phases.length === 0) return null;

  const leagueStage = phases.find((phase) => LEAGUE_STAGE_LABEL.test(phase.label));
  if (leagueStage) return leagueStage;

  const counts = countTeamsPerRound(fixtures, phases);
  let best = phases[0];
  let bestCount = counts.get(best.roundId) || 0;

  phases.forEach((phase) => {
    const count = counts.get(phase.roundId) || 0;
    if (count > bestCount) {
      best = phase;
      bestCount = count;
    }
  });

  if (bestCount > 0) return best;
  return phases[phases.length - 1];
}

export function filterTeamsByCupPhase(competitionTeams, teamIds) {
  if (!teamIds?.size) return competitionTeams || [];
  return (competitionTeams || []).filter((team) => {
    const id = Number(team?.id ?? team?.ID);
    return Number.isFinite(id) && teamIds.has(id);
  });
}

function rosterKeysFromCompetitionTeams(competitionTeams) {
  const ids = new Set();
  const names = new Set();

  (competitionTeams || []).forEach((team) => {
    const id = Number(team?.id ?? team?.ID);
    if (Number.isFinite(id)) ids.add(id);

    [team?.name, team?.english_name, team?.cleanName, team?.Name].forEach(
      (label) => {
        const key = normalizeTeamKey(label);
        if (key) names.add(key);
      }
    );
  });

  return { ids, names };
}

function comparisonTeamMatchesRoster(team, roster) {
  if (!team || !roster) return false;
  const id = Number(team?.id ?? team?.ID);
  if (Number.isFinite(id) && roster.ids.has(id)) return true;

  const key = normalizeTeamKey(team?.name);
  return Boolean(key && roster.names.has(key));
}

/**
 * Limit league-comparison profiles to the current competition roster
 * (cup phase, MLS conference, etc.).
 */
export function filterComparisonTeamsByRoster(
  comparisonTeams,
  competitionTeams
) {
  if (!Array.isArray(comparisonTeams) || comparisonTeams.length === 0) {
    return [];
  }
  if (!Array.isArray(competitionTeams) || competitionTeams.length === 0) {
    return competitionTeams;
  }

  const roster = rosterKeysFromCompetitionTeams(competitionTeams);
  if (!roster.ids.size && !roster.names.size) {
    return comparisonTeams;
  }

  const filtered = comparisonTeams.filter((team) =>
    comparisonTeamMatchesRoster(team, roster)
  );

  return filtered.length > 0 ? filtered : comparisonTeams;
}

function comparisonProfileForCompetitionTeam(competitionTeam, comparisonByKey) {
  const candidates = [
    competitionTeam?.cleanName,
    competitionTeam?.name,
    competitionTeam?.english_name,
    competitionTeam?.Name,
  ].filter(Boolean);

  for (const label of candidates) {
    const key = normalizeTeamKey(label);
    if (key && comparisonByKey.has(key)) {
      return comparisonByKey.get(key);
    }
  }

  return null;
}

/**
 * One row per competition roster team, merged with league-comparison profiles
 * when names align. Unmatched roster teams still appear (metrics may be null).
 */
export function mergeComparisonTeamsForRoster(
  competitionTeams,
  comparisonTeams
) {
  if (!Array.isArray(competitionTeams) || competitionTeams.length === 0) {
    return comparisonTeams || [];
  }
  if (!Array.isArray(comparisonTeams) || comparisonTeams.length === 0) {
    return competitionTeams.map((team) => ({
      name: team.cleanName || team.name || team.english_name || "Team",
      id: team.id ?? team.ID ?? null,
    }));
  }

  const comparisonByKey = new Map();
  comparisonTeams.forEach((team) => {
    const key = normalizeTeamKey(team?.name);
    if (key && !comparisonByKey.has(key)) {
      comparisonByKey.set(key, team);
    }
  });

  return competitionTeams.map((team) => {
    const label = team.cleanName || team.name || team.english_name || "Team";
    const profile = comparisonProfileForCompetitionTeam(team, comparisonByKey);
    if (profile) {
      return profile;
    }
    return {
      name: label,
      id: team.id ?? team.ID ?? null,
    };
  });
}

function sortFixturesChronologically(fixtures) {
  return [...fixtures].sort((a, b) => {
    const dateA = Number(a?.date_unix) || 0;
    const dateB = Number(b?.date_unix) || 0;
    if (dateA !== dateB) return dateA - dateB;
    const gwA = Number(a?.game_week) || 0;
    const gwB = Number(b?.game_week) || 0;
    return gwA - gwB;
  });
}

function ensureTeamRow(stats, id, name) {
  if (!stats.has(id)) {
    stats.set(id, {
      id,
      name,
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      gf: 0,
      ga: 0,
      homeWins: 0,
      homeDraws: 0,
      homeLosses: 0,
      homeFor: 0,
      homeAgainst: 0,
      awayWins: 0,
      awayDraws: 0,
      awayLosses: 0,
      awayFor: 0,
      awayAgainst: 0,
      results: [],
    });
  }
  const row = stats.get(id);
  if (name && !row.name) row.name = name;
  return row;
}

function applyMatchResult(row, scored, conceded, venue) {
  row.played += 1;
  row.gf += scored;
  row.ga += conceded;

  let code;
  if (scored > conceded) {
    row.wins += 1;
    code = "W";
  } else if (scored === conceded) {
    row.draws += 1;
    code = "D";
  } else {
    row.losses += 1;
    code = "L";
  }

  if (venue === "home") {
    row.homeFor += scored;
    row.homeAgainst += conceded;
    if (code === "W") row.homeWins += 1;
    else if (code === "D") row.homeDraws += 1;
    else row.homeLosses += 1;
  } else {
    row.awayFor += scored;
    row.awayAgainst += conceded;
    if (code === "W") row.awayWins += 1;
    else if (code === "D") row.awayDraws += 1;
    else row.awayLosses += 1;
  }

  row.results.push(code);
}

function buildFormString(results) {
  if (!results?.length) return "N/A";
  return results.slice(-5).join("").toUpperCase();
}

function mapStatsRowToTableTeam(row, leagueId, position, groupName) {
  const last5 = buildFormString(row.results);
  const team = {
    LeagueID: leagueId,
    Position: position,
    Name: row.name,
    ID: row.id,
    Played: row.played,
    Wins: row.wins,
    Draws: row.draws,
    Losses: row.losses,
    For: row.gf,
    Against: row.ga,
    GoalDifference: row.gf - row.ga,
    Form: last5,
    LastXPoints: getPointsFromLastX(last5 === "N/A" ? [] : last5.split("")),
    Points: row.wins * 3 + row.draws,
    wdl: row.results.join(""),
    HomeWins: row.homeWins,
    HomeDraws: row.homeDraws,
    HomeLosses: row.homeLosses,
    HomeFor: row.homeFor,
    HomeAgainst: row.homeAgainst,
    AwayWins: row.awayWins,
    AwayDraws: row.awayDraws,
    AwayLosses: row.awayLosses,
    AwayFor: row.awayFor,
    AwayAgainst: row.awayAgainst,
    zone: "mid-table",
  };

  if (groupName) {
    team.GroupName = groupName;
  }

  return team;
}

function buildTeamsFromRoundGroups(roundEntry, leagueId) {
  const groups = roundEntry?.groups;
  if (!Array.isArray(groups) || groups.length === 0) return null;

  const teams = [];
  groups.forEach((group) => {
    const groupName = group.name || group.round || "Group";
    (group.table || []).forEach((currentTeam, index) => {
      teams.push({
        raw: currentTeam,
        groupName,
        index,
      });
    });
  });

  if (!teams.length) return null;

  return {
    mode: "grouped",
    teams: teams.map(({ raw, groupName, index }) =>
      mapProviderTeamToViewRow(raw, leagueId, index, groupName)
    ),
    supportsClassicTable: teams.some((entry) =>
      entry.raw?.seasonWins_home != null && entry.raw?.seasonWins_away != null
    ),
  };
}

function mapProviderTeamToViewRow(currentTeam, leagueId, index, groupName) {
  const last5 = (currentTeam.wdl_record || "").slice(-5).toUpperCase() || "N/A";
  const team = {
    LeagueID: leagueId,
    Position:
      Number(currentTeam.position) > 0
        ? Number(currentTeam.position)
        : Number(currentTeam.leaguePosition_overall) > 0
          ? Number(currentTeam.leaguePosition_overall)
          : index + 1,
    Name: currentTeam.cleanName || currentTeam.name,
    ID: currentTeam.id,
    Played: currentTeam.matchesPlayed,
    Wins: currentTeam.seasonWins_overall,
    Draws: currentTeam.seasonDraws_overall,
    Losses: currentTeam.seasonLosses_overall,
    For: currentTeam.seasonGoals,
    Against:
      (Number(currentTeam.seasonConceded_home) || 0) +
      (Number(currentTeam.seasonConceded_away) || 0),
    GoalDifference: currentTeam.seasonGoalDifference,
    Form: last5,
    LastXPoints: getPointsFromLastX(last5 === "N/A" ? [] : last5.split("")),
    Points: currentTeam.points,
    wdl: currentTeam.wdl_record,
    zone: currentTeam.zone?.name ?? "mid-table",
    GroupName: groupName,
  };

  if (
    currentTeam.seasonWins_home != null &&
    currentTeam.seasonWins_away != null
  ) {
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

  return team;
}

export function buildStandingsViewsFromFixtures({
  seasonId,
  fixtures,
  roundId,
  roundLabel,
}) {
  const leagueId = Number(seasonId);
  const targetRound = finiteRoundId(roundId);
  if (!targetRound) return null;

  const roundFixtures = sortFixturesChronologically(
    (fixtures || []).filter(
      (fixture) =>
        fixtureRoundId(fixture) === targetRound &&
        isCompleteLeagueHistoryFixture(fixture)
    )
  );

  if (!roundFixtures.length) return null;

  const stats = new Map();

  roundFixtures.forEach((fixture) => {
    const homeId = finiteRoundId(fixture.homeID);
    const awayId = finiteRoundId(fixture.awayID);
    const homeName = fixture.home_name || fixture.homeTeam || "Home";
    const awayName = fixture.away_name || fixture.awayTeam || "Away";
    const homeGoals = Number(fixture.homeGoalCount);
    const awayGoals = Number(fixture.awayGoalCount);
    if (!homeId || !awayId) return;
    if (!Number.isFinite(homeGoals) || !Number.isFinite(awayGoals)) return;

    const homeRow = ensureTeamRow(stats, homeId, homeName);
    const awayRow = ensureTeamRow(stats, awayId, awayName);
    applyMatchResult(homeRow, homeGoals, awayGoals, "home");
    applyMatchResult(awayRow, awayGoals, homeGoals, "away");
  });

  const ranked = [...stats.values()].sort(
    (a, b) =>
      b.wins * 3 + b.draws - (a.wins * 3 + a.draws) ||
      b.gf - b.ga - (a.gf - a.ga) ||
      b.gf - a.gf ||
      String(a.name).localeCompare(String(b.name))
  );

  const groupName = roundLabel || null;
  const teams = ranked.map((row, index) =>
    mapStatsRowToTableTeam(row, leagueId, index + 1, groupName)
  );

  const hasGroups = teams.some((team) => team.GroupName);
  return {
    mode: hasGroups ? "grouped" : "standard",
    teams,
    supportsClassicTable: teams.length > 0 && teams[0].HomeWins != null,
  };
}

export function buildCupPhaseTableViews(
  seasonId,
  tablesData,
  fixtures,
  roundId
) {
  const phases = parseCupPhasesFromTables(tablesData);
  const target = finiteRoundId(roundId);
  const roundEntry = tablesData?.specific_tables?.find(
    (entry) => finiteRoundId(entry?.round_id) === target
  );

  const fromGroups = roundEntry
    ? buildTeamsFromRoundGroups(roundEntry, Number(seasonId))
    : null;
  if (fromGroups) return fromGroups;

  const phase = phases.find((entry) => entry.roundId === target);
  return buildStandingsViewsFromFixtures({
    seasonId,
    fixtures,
    roundId: target,
    roundLabel: phase?.label || roundEntry?.round || null,
  });
}

export function filterFixturesByRound(fixtures, roundId) {
  const target = finiteRoundId(roundId);
  if (!target) return fixtures || [];
  return (fixtures || []).filter((fixture) => fixtureRoundId(fixture) === target);
}

function cupFixtureRowForSerialization(fixture) {
  const row = {
    roundID: fixture.roundID ?? fixture.round_id,
    homeID: fixture.homeID,
    awayID: fixture.awayID,
    home_name: fixture.home_name,
    away_name: fixture.away_name,
    homeTeam: fixture.homeTeam,
    awayTeam: fixture.awayTeam,
    homeGoalCount: fixture.homeGoalCount,
    awayGoalCount: fixture.awayGoalCount,
    status: fixture.status,
    date_unix: fixture.date_unix,
    game_week: fixture.game_week,
  };
  return Object.fromEntries(
    Object.entries(row).filter(([, value]) => value !== undefined)
  );
}

/** Slim leagueFixtures rows for __NEXT_DATA__ cup hydration. */
export function trimCupCompetitionFixtures(fixtures) {
  if (!Array.isArray(fixtures) || fixtures.length === 0) return null;
  return fixtures.map((fixture) => cupFixtureRowForSerialization(fixture));
}

function rowForSerialization(row) {
  return Object.fromEntries(
    Object.entries(row).filter(([, value]) => value !== undefined)
  );
}

/** League-table views for cup phase SSR hydration (form + standings). */
export function trimCupPhaseTableViewsForClient(views) {
  if (!views?.teams?.length) return null;
  return rowForSerialization({
    mode: views.mode,
    teams: views.teams.map((team) => rowForSerialization(team)),
    supportsClassicTable: views.supportsClassicTable ?? false,
  });
}
