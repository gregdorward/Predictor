import { getTeamsList } from "../components/competition/competitionUtils";
import { MLS_SEASON_ID } from "../components/competition/competitionLeagueTable";

/** League-level fields used by CompetitionPage charts and summaries (not full API blobs). */
const COMPETITION_ROOT_KEYS = [
  "id",
  "english_name",
  "name",
  "country",
  "season",
  "image",
  "matchesCompleted",
  "totalMatches",
  "game_week",
  "total_game_week",
  "progress",
  "seasonAVG_overall",
  "seasonAVG_home",
  "seasonAVG_away",
  "seasonBTTSPercentage",
  "seasonOver25Percentage_overall",
  "seasonUnder25Percentage_overall",
  "cornersAVG_overall",
  "cardsAVG_overall",
  "homeWinPercentage",
  "drawPercentage",
  "awayWinPercentage",
  "homeAttackAdvantagePercentage",
  "homeDefenceAdvantagePercentage",
  "homeOverallAdvantage",
  "foulsAVG_overall",
  "offsidesAVG_overall",
  "goalTimingDisabled",
  "seasonOver05Percentage_overall",
  "seasonOver15Percentage_overall",
  "seasonOver35Percentage_overall",
  "seasonOver45Percentage_overall",
  "over75CornersPercentage_overall",
  "over85CornersPercentage_overall",
  "over95CornersPercentage_overall",
  "over105CornersPercentage_overall",
  "over115CornersPercentage_overall",
  "over125CornersPercentage_overall",
  "over25CardsPercentage_overall",
  "over35CardsPercentage_overall",
  "over45CardsPercentage_overall",
  "over05_fhg_percentage",
  "over15_fhg_percentage",
  "over05_2hg_percentage",
  "over15_2hg_percentage",
  "goals_min_0_to_10",
  "goals_min_11_to_20",
  "goals_min_21_to_30",
  "goals_min_31_to_40",
  "goals_min_41_to_50",
  "goals_min_51_to_60",
  "goals_min_61_to_70",
  "goals_min_71_to_80",
  "goals_min_76_to_90",
  "top_scorers",
  "top_assists",
  "top_clean_sheets",
];

const TEAM_KEYS = [
  "id",
  "ID",
  "name",
  "english_name",
  "Name",
  "cleanName",
  "badge",
  "image",
  "seasonOver25Percentage_overall",
  "seasonBTTSPercentage_overall",
  "seasonUnder25Percentage_overall",
  "seasonAVG_overall",
  "seasonCSPercentage_overall",
  "xg_for_avg_overall",
  "xg_against_avg_overall",
  "seasonMatchesPlayed_overall",
];

const CONFERENCE_TABLE_TEAM_KEYS = [
  "id",
  "ID",
  "name",
  "english_name",
  "Name",
  "cleanName",
  "matchesPlayed",
  "seasonWins_overall",
  "seasonDraws_overall",
  "seasonLosses_overall",
  "seasonGoals",
  "seasonConceded_home",
  "seasonConceded_away",
  "seasonGoalDifference",
  "wdl_record",
  "points",
  "position",
  "zone",
];

function pickKeys(source, keys) {
  if (!source || typeof source !== "object") return {};
  const out = {};
  keys.forEach((key) => {
    if (source[key] !== undefined) {
      out[key] = source[key];
    }
  });
  return out;
}

function trimTeam(team, keys = TEAM_KEYS) {
  return pickKeys(team, keys);
}

function trimConferenceTableGroups(data) {
  if (Number(data?.id) !== MLS_SEASON_ID) return null;
  const groups = data?.specific_tables?.[0]?.groups;
  if (!Array.isArray(groups) || groups.length === 0) return null;

  const trimmedGroups = groups
    .map((group) => ({
      name: group.name || null,
      round: group.round || null,
      table: Array.isArray(group.table)
        ? group.table.map((team) => pickKeys(team, CONFERENCE_TABLE_TEAM_KEYS))
        : [],
    }))
    .filter((group) => group.table.length > 0);

  if (!trimmedGroups.length) return null;
  return [{ groups: trimmedGroups }];
}

function trimMlsLeagueTable(data) {
  if (Number(data?.id) !== MLS_SEASON_ID) return null;
  const leagueTable = Array.isArray(data?.league_table) ? data.league_table : [];
  const specificTable = Array.isArray(data?.specific_tables?.[0]?.table)
    ? data.specific_tables[0].table
    : [];
  const table = leagueTable.length ? leagueTable : specificTable;
  if (!table.length) return null;

  const formById = new Map();
  specificTable.forEach((team) => {
    const id = Number(team?.id ?? team?.ID);
    if (!Number.isFinite(id) || !team?.wdl_record) return;
    formById.set(id, team.wdl_record);
  });

  return table.map((team) => {
    const trimmed = pickKeys(team, CONFERENCE_TABLE_TEAM_KEYS);
    const id = Number(team?.id ?? team?.ID);
    if (!trimmed.wdl_record && formById.has(id)) {
      trimmed.wdl_record = formById.get(id);
    }
    return trimmed;
  });
}

/**
 * Slim competition payload for __NEXT_DATA__ so CompetitionPage can hydrate
 * without a second API round-trip, without serialising multi‑MB team objects.
 */
export function buildCompetitionClientPayload(data) {
  if (!data) return null;

  const payload = pickKeys(data, COMPETITION_ROOT_KEYS);
  const teamKeys =
    Number(data?.id) === MLS_SEASON_ID
      ? [...new Set([...TEAM_KEYS, ...CONFERENCE_TABLE_TEAM_KEYS])]
      : TEAM_KEYS;
  const teams = getTeamsList(data).map((team) => trimTeam(team, teamKeys));
  if (teams.length) {
    payload.teams = teams;
  }

  const specificTables = trimConferenceTableGroups(data);
  if (specificTables) {
    payload.specific_tables = specificTables;
  }

  const leagueTable = trimMlsLeagueTable(data);
  if (leagueTable) {
    payload.league_table = leagueTable;
  }

  return payload;
}
