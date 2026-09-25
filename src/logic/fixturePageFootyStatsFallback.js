import { hydrateFormFromFootyStatsApi } from "./getScorePredictions";

export const FOOTYSTATS_FIXTURE_DISCLAIMER =
  "These stats are supplied directly from FootyStats. We don't have full match-by-match history for this fixture in our system. Averages and form include the teams' broader recent record (including friendlies) and may not reflect this competition only.";

export function hasDetailedAllTeamResults(formSide) {
  const list = formSide?.allTeamResults;
  if (!Array.isArray(list) || list.length === 0) {
    return false;
  }
  return list.some(
    (row) => row && (row.dateRaw != null || (row.date != null && row.date !== ""))
  );
}

/** True when the dedicated fixture page should use the FootyStats API template. */
export function shouldUseFootyStatsFixtureTemplate(match) {
  if (match?.apiFormOnly || match?.formHome?.apiFormOnly) {
    return false;
  }
  const homeHas = hasDetailedAllTeamResults(match?.formHome);
  const awayHas = hasDetailedAllTeamResults(match?.formAway);
  return !homeHas || !awayHas;
}

/** Snapshot form windows before calculateScore mutates or clears them. */
export function preserveFormEntryWindows(formEntry) {
  if (!formEntry?.home?.[2] || !formEntry?.away?.[2]) {
    return null;
  }

  const cloneSide = (side) => ({
    0: { ...(side[0] ?? {}) },
    1: { ...(side[1] ?? {}) },
    2: { ...(side[2] ?? {}) },
  });

  return {
    home: cloneSide(formEntry.home),
    away: cloneSide(formEntry.away),
  };
}

export function buildFootyStatsPrematch(fixture, match) {
  if (!fixture && !match) {
    return null;
  }

  const formatOdd = (value) => {
    if (value == null || value === "" || value === "-") {
      return null;
    }
    const n = Number(value);
    return Number.isFinite(n) ? n.toFixed(2) : value;
  };

  return {
    homeXg: fixture?.team_a_xg_prematch ?? null,
    awayXg: fixture?.team_b_xg_prematch ?? null,
    homePpg:
      fixture?.pre_match_home_ppg ??
      fixture?.pre_match_teamA_overall_ppg ??
      null,
    awayPpg:
      fixture?.pre_match_away_ppg ??
      fixture?.pre_match_teamB_overall_ppg ??
      null,
    avgGoals: fixture?.avg_potential ?? null,
    o25Potential: fixture?.o25_potential ?? null,
    bttsPotential: fixture?.btts_potential ?? match?.btts_potential ?? null,
    homeOdds: formatOdd(match?.homeOdds ?? fixture?.odds_ft_1),
    drawOdds: formatOdd(match?.drawOdds ?? fixture?.odds_ft_x),
    awayOdds: formatOdd(match?.awayOdds ?? fixture?.odds_ft_2),
  };
}

function ensureFormSide(match, sideKey, preservedSide) {
  if (!preservedSide?.[2]) {
    return null;
  }
  if (!match[sideKey] || typeof match[sideKey] !== "object") {
    match[sideKey] = { ...preservedSide[2] };
  } else {
    Object.assign(match[sideKey], preservedSide[2]);
  }
  return match[sideKey];
}

/**
 * Re-hydrate display form from preserved FootyStats windows (fixture page only).
 * @returns {boolean} whether fallback was applied
 */
export function applyFixturePageFootyStatsFallback({
  match,
  preservedFormEntry,
  fixture,
}) {
  if (!match || !preservedFormEntry) {
    return false;
  }
  if (!shouldUseFootyStatsFixtureTemplate(match)) {
    return false;
  }

  const formHome = ensureFormSide(match, "formHome", preservedFormEntry.home);
  const formAway = ensureFormSide(match, "formAway", preservedFormEntry.away);
  if (!formHome || !formAway) {
    return false;
  }

  hydrateFormFromFootyStatsApi(
    preservedFormEntry.home,
    formHome,
    "home",
    match.homeTeam,
    match,
    { competitionFixtures: false }
  );
  hydrateFormFromFootyStatsApi(
    preservedFormEntry.away,
    formAway,
    "away",
    match.awayTeam,
    match,
    { competitionFixtures: false }
  );

  match.fixtureStatsSource = "footystats-api";
  match.footyStatsPrematch = buildFootyStatsPrematch(fixture, match);
  return true;
}
