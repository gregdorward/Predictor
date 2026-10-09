import { resolveFootyStatsLeagueId } from "../seo/competitionCatalog";
import { isFixturePredictionUnlocked } from "./freePredictionAllowance";

function normalizeId(fixtureId) {
  if (fixtureId == null || fixtureId === "") return null;
  return String(fixtureId);
}

/**
 * Same league-major order as getFixtures when building the homepage list.
 * @param {Array<{ id?: string|number, competition_id?: string|number }>} rawFixtures
 * @param {Array<{ element?: { id?: string|number } }>} orderedLeagues
 */
export function orderFixturesLikeHomepage(rawFixtures, orderedLeagues) {
  if (!Array.isArray(rawFixtures) || !rawFixtures.length) {
    return [];
  }
  if (!Array.isArray(orderedLeagues) || !orderedLeagues.length) {
    return [...rawFixtures];
  }

  const ordered = [];
  const seen = new Set();

  for (const leagueEntry of orderedLeagues) {
    const leagueId = leagueEntry?.element?.id;
    if (leagueId == null) continue;

    const leagueGames = rawFixtures.filter(
      (game) =>
        resolveFootyStatsLeagueId(game.competition_id) === leagueId ||
        resolveFootyStatsLeagueId(game.leagueID) === leagueId ||
        String(game.competition_id) === String(leagueId) ||
        String(game.leagueID) === String(leagueId)
    );

    for (const fixture of leagueGames) {
      const id = normalizeId(fixture.id);
      if (!id || seen.has(id)) continue;
      seen.add(id);
      ordered.push(fixture);
    }
  }

  for (const fixture of rawFixtures) {
    const id = normalizeId(fixture.id);
    if (!id || seen.has(id)) continue;
    seen.add(id);
    ordered.push(fixture);
  }

  return ordered;
}

export function getFeaturedFixtureId(rawFixtures, orderedLeagues) {
  const ordered = orderFixturesLikeHomepage(rawFixtures, orderedLeagues);
  return normalizeId(ordered[0]?.id);
}

export function isFeaturedFreeFixture(fixtureId, featuredFixtureId) {
  const id = normalizeId(fixtureId);
  const featured = normalizeId(featuredFixtureId);
  if (!id || !featured) return false;
  return id === featured;
}

/**
 * Full stats + predictions visible (paid, featured daily pick, or daily unlock).
 */
export function hasFixtureFullAccess(
  isPaidUser,
  fixtureId,
  featuredFixtureId,
  now = new Date()
) {
  if (isPaidUser) return true;
  if (isFeaturedFreeFixture(fixtureId, featuredFixtureId)) return true;
  return isFixturePredictionUnlocked(false, fixtureId, now);
}
