import { sofaScoreIds } from "../../constants/sofaScoreIds";

export function getSofaScoreIdForSeason(seasonId) {
  const found = sofaScoreIds.find((obj) => obj[seasonId] !== undefined);
  return found ? found[seasonId] : null;
}

export function formatPercent(value) {
  if (value == null || value === "") return "-";
  return `${Number(value).toFixed(1)}%`;
}

export function formatNumber(value, decimals = 2) {
  if (value == null || value === "") return "-";
  return Number(value).toFixed(decimals);
}

export function getTeamsList(data) {
  if (Array.isArray(data?.teams)) return data.teams;
  if (Array.isArray(data?.team)) return data.team;
  return [];
}

export function sortTeamsByField(teams, field, limit = 10) {
  return [...teams]
    .filter((team) => team?.[field] != null && team?.name)
    .sort((a, b) => Number(b[field]) - Number(a[field]))
    .slice(0, limit);
}

/** Derive season-total xG difference (avg for − avg against) × matches played. */
export function withXgDiff(teams) {
  return (teams || []).map((team) => {
    const xgFor = Number(team?.xg_for_avg_overall);
    const xgAgainst = Number(team?.xg_against_avg_overall);
    const played = Number(team?.seasonMatchesPlayed_overall);
    const hasXg =
      Number.isFinite(xgFor) &&
      Number.isFinite(xgAgainst) &&
      Number.isFinite(played) &&
      played > 0;

    return {
      ...team,
      xg_diff_overall: hasXg ? (xgFor - xgAgainst) * played : null,
    };
  });
}

export function resolveScorerTeam(scorer, teams) {
  const teamId = scorer?.club_team_id;
  if (teamId == null || teamId === -1 || teamId === "-1") {
    return (
      scorer.club_team_name ||
      scorer.team_name ||
      scorer.club_name ||
      "-"
    );
  }

  const found = (teams || []).find(
    (team) =>
      team.id == teamId ||
      team.ID == teamId ||
      String(team.id) === String(teamId) ||
      String(team.ID) === String(teamId)
  );

  return (
    found?.name ||
    found?.Name ||
    found?.cleanName ||
    scorer.club_team_name ||
    scorer.team_name ||
    scorer.club_name ||
    "-"
  );
}
