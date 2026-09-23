import { getTeamsList } from "../components/competition/competitionUtils";

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

function trimTeam(team) {
  return pickKeys(team, TEAM_KEYS);
}

/**
 * Slim competition payload for __NEXT_DATA__ so CompetitionPage can hydrate
 * without a second API round-trip, without serialising multi‑MB team objects.
 */
export function buildCompetitionClientPayload(data) {
  if (!data) return null;

  const payload = pickKeys(data, COMPETITION_ROOT_KEYS);
  const teams = getTeamsList(data).map(trimTeam);
  if (teams.length) {
    payload.teams = teams;
  }

  return payload;
}
