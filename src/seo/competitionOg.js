import {
  getCompetitionById,
  getCompetitionBySlug,
} from "./competitionCatalog";

function formatPercent(value) {
  if (value == null || Number.isNaN(Number(value))) return null;
  return `${Number(value).toFixed(1)}%`;
}

function formatNumber(value, decimals = 2) {
  if (value == null || Number.isNaN(Number(value))) return null;
  return Number(value).toFixed(decimals);
}

function readMatchesPlayed(data) {
  const candidates = [
    data?.matches_completed,
    data?.matchesCompleted,
    data?.seasonMatchesPlayed_overall,
    data?.seasonMatchesCompleted,
    data?.games_played,
  ];
  for (const value of candidates) {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

function isSeasonEmpty(data) {
  if (!data) return true;
  const matchesPlayed = readMatchesPlayed(data);
  if (matchesPlayed === 0) return true;

  const avg = Number(data.seasonAVG_overall);
  const btts = Number(data.seasonBTTSPercentage);
  const over25 = Number(data.seasonOver25Percentage_overall);
  const under25 = Number(data.seasonUnder25Percentage_overall);

  return (
    (!Number.isFinite(avg) || avg === 0) &&
    (!Number.isFinite(btts) || btts === 0) &&
    (!Number.isFinite(over25) || over25 === 0) &&
    (!Number.isFinite(under25) || under25 === 0)
  );
}

function getTeams(data) {
  if (Array.isArray(data?.teams)) return data.teams;
  if (Array.isArray(data?.team)) return data.team;
  return [];
}

function topTeamByField(teams, field) {
  const ranked = [...teams]
    .filter((team) => team?.[field] != null && (team?.name || team?.english_name))
    .sort((a, b) => Number(b[field]) - Number(a[field]));
  const team = ranked[0];
  if (!team) return null;
  return {
    name: team.name || team.english_name,
    value: formatPercent(team[field]),
  };
}

/** Resolve slug or numeric season id for competition OG routes. */
export function resolveCompetitionOgParam(param) {
  const raw = String(param || "").trim();
  if (!raw) return null;

  if (/^\d+$/.test(raw)) {
    const catalog = getCompetitionById(Number(raw));
    return {
      seasonId: raw,
      catalog,
      slug: catalog?.slug || raw,
    };
  }

  const catalog = getCompetitionBySlug(raw);
  if (!catalog) return null;
  return {
    seasonId: String(catalog.id),
    catalog,
    slug: catalog.slug,
  };
}

/**
 * Compact, share-friendly model for competition OG cards.
 * Safe to call with partial/missing API data.
 */
export function buildCompetitionOgCardModel(data, catalog) {
  const name =
    data?.english_name || data?.name || catalog?.name || "Competition Stats";
  const country = data?.country || null;
  const season = data?.season || null;
  const empty = isSeasonEmpty(data);
  const teams = getTeams(data);

  const stats = empty
    ? []
    : [
        { label: "Avg goals", value: formatNumber(data?.seasonAVG_overall) },
        { label: "BTTS", value: formatPercent(data?.seasonBTTSPercentage) },
        {
          label: "Over 2.5",
          value: formatPercent(data?.seasonOver25Percentage_overall),
        },
        {
          label: "Under 2.5",
          value: formatPercent(data?.seasonUnder25Percentage_overall),
        },
      ].filter((stat) => stat.value != null);

  const homeWin = empty ? null : formatPercent(data?.homeWinPercentage);
  const draw = empty ? null : formatPercent(data?.drawPercentage);
  const awayWin = empty ? null : formatPercent(data?.awayWinPercentage);
  const resultSplit =
    homeWin && draw && awayWin ? `${homeWin} / ${draw} / ${awayWin}` : null;

  const topOver25 = empty
    ? null
    : topTeamByField(teams, "seasonOver25Percentage_overall");
  const topBtts = empty
    ? null
    : topTeamByField(teams, "seasonBTTSPercentage_overall");

  const highlight =
    topOver25 || topBtts
      ? {
          label: topOver25 ? "Highest Over 2.5" : "Highest BTTS",
          team: (topOver25 || topBtts).name,
          value: (topOver25 || topBtts).value,
        }
      : null;

  const features = empty
    ? ["Standings", "Team rankings", "Player leaders", "Fixture insights"]
    : ["Live market profile", "Standings", "Team rankings", "Fixture insights"];

  let logoUrl = null;
  if (typeof data?.image === "string" && /^https?:\/\//i.test(data.image)) {
    logoUrl = data.image;
  }

  return {
    name,
    country,
    season,
    stats,
    resultSplit,
    highlight,
    features,
    logoUrl,
    seasonStarted: !empty,
  };
}
