let fixturesEpoch = 0;

/** Bump when fixtures are reloaded so stale prediction results cannot overwrite. */
export function bumpFixturesEpoch() {
  fixturesEpoch += 1;
  return fixturesEpoch;
}

export function getFixturesEpoch() {
  return fixturesEpoch;
}

export function shouldApplyPredictionFixtures(epochAtStart) {
  return epochAtStart === fixturesEpoch;
}
