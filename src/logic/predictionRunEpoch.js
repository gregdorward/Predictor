let predictionRunEpoch = 0;

/** Bump when a new predictions run starts so stale deferred work can no-op. */
export function bumpPredictionRunEpoch() {
  predictionRunEpoch += 1;
  return predictionRunEpoch;
}

export function getPredictionRunEpoch() {
  return predictionRunEpoch;
}

export function isCurrentPredictionRun(epochAtStart) {
  return epochAtStart === predictionRunEpoch;
}
