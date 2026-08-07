import { getCompetitionUrl } from "../seo/competitionCatalog";

/** Cadence for Journey-friendly mid-fixture-list content breaks. */
export const FIXTURE_CONTENT_BREAK_CONFIG = {
  firstAfterIndex: 3,
  interval: 8,
};

export function shouldInsertFixtureContentBreak(fixtureIndex) {
  const { firstAfterIndex, interval } = FIXTURE_CONTENT_BREAK_CONFIG;
  if (fixtureIndex < firstAfterIndex) return false;
  return (fixtureIndex - firstAfterIndex) % interval === 0;
}

export function getFixtureContentBreakTip(previousFixture) {
  const competition =
    previousFixture?.leagueName || previousFixture?.leagueDesc;
  const label = competition
    ? `${competition} stats and trends`
    : "Competition stats and trends";
  const href = getCompetitionUrl(previousFixture?.leagueID) || null;

  return { label, href };
}
