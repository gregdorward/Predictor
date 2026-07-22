/** Minimal strength helpers for offline league-comparison generation. */

const DOMESTIC_ATTACK_RANGES = {
  overall: {
    "Average Dangerous Attacks": { min: 31.8, max: 68.83 },
    "Average Shots": { min: 7.35, max: 17.66 },
    "Average Shots On Target": { min: 3.39, max: 5.71 },
    "Average Expected Goals": { min: 1.03, max: 1.92 },
    "Average Goals": { min: 0.95, max: 1.91 },
    "Average Shot Value": { min: 5.56, max: 26.94 },
    "Injury impact": { min: 2, max: 8 },
  },
  last5: {
    "Average Dangerous Attacks": { min: 26.96, max: 72.42 },
    "Average Shots": { min: 5.47, max: 19.54 },
    "Average Shots On Target": { min: 2.65, max: 6.55 },
    "Average Expected Goals": { min: 0.77, max: 2.13 },
    "Average Goals": { min: 0.72, max: 2.13 },
    "Average Shot Value": { min: 5.31, max: 28.19 },
  },
};

const INTERNATIONAL_ATTACK_RANGES = {
  overall: {
    "Average Dangerous Attacks": { min: 24, max: 70 },
    "Average Shots": { min: 6, max: 18 },
    "Average Shots On Target": { min: 2.2, max: 6.5 },
    "Average Expected Goals": { min: 0.7, max: 2.2 },
    "Weighted XG": { min: 0.7, max: 2.2 },
    "Average Goals": { min: 0.6, max: 2.2 },
    "Average Shot Value": { min: 5, max: 28 },
    "Injury impact": { min: 2, max: 8 },
  },
  last5: {
    "Average Dangerous Attacks": { min: 22, max: 72 },
    "Average Shots": { min: 5, max: 20 },
    "Average Shots On Target": { min: 2, max: 7 },
    "Average Expected Goals": { min: 0.5, max: 2.4 },
    "Weighted XG": { min: 0.5, max: 2.4 },
    "Average Goals": { min: 0.4, max: 2.4 },
    "Average Shot Value": { min: 5, max: 30 },
  },
};

const DOMESTIC_DEFENCE_RANGES = {
  overall: {
    "Average XG Against": { min: 1.03, max: 1.92 },
    "Average Goals Against": { min: 0.95, max: 1.91 },
    "Average SOT Against": { min: 3.39, max: 5.71 },
    "Average Dangerous Attacks Against": { min: 31.8, max: 68.83 },
    "Clean Sheet Percentage": { min: 11.72, max: 44.53 },
    "Average Shots Against": { min: 7.35, max: 17.66 },
    "Injury impact": { min: 2, max: 8 },
  },
  last5: {
    "Average XG Against": { min: 0.77, max: 2.13 },
    "Average Goals Against": { min: 0.72, max: 2.13 },
    "Average SOT Against": { min: 2.65, max: 6.55 },
    "Average Dangerous Attacks Against": { min: 26.96, max: 72.42 },
    "Clean Sheet Percentage": { min: 11.72, max: 44.53 },
    "Average Shots Against": { min: 5.47, max: 19.54 },
  },
};

const INTERNATIONAL_DEFENCE_RANGES = {
  overall: {
    "Average XG Against": { min: 0.55, max: 2.3 },
    "Weighted XG Against": { min: 0.55, max: 2.3 },
    "Average Goals Against": { min: 0.5, max: 2.3 },
    "Average SOT Against": { min: 2.2, max: 6.5 },
    "Average Dangerous Attacks Against": { min: 24, max: 70 },
    "Clean Sheet Percentage": { min: 11.72, max: 44.53 },
    "Average Shots Against": { min: 6, max: 18 },
    "Injury impact": { min: 2, max: 8 },
  },
  last5: {
    "Average XG Against": { min: 0.45, max: 2.4 },
    "Weighted XG Against": { min: 0.45, max: 2.4 },
    "Average Goals Against": { min: 0.4, max: 2.4 },
    "Average SOT Against": { min: 2, max: 7 },
    "Average Dangerous Attacks Against": { min: 22, max: 72 },
    "Clean Sheet Percentage": { min: 11.72, max: 44.53 },
    "Average Shots Against": { min: 5, max: 20 },
  },
};

function parseStrengthMetricValue(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function applyStrengthSpread(weightedSum, spreadIntensity) {
  if (spreadIntensity === 1) {
    return Math.max(0, Math.min(1, weightedSum));
  }
  return (
    0.5 +
    Math.sign(weightedSum - 0.5) *
      Math.pow(Math.abs(weightedSum - 0.5), 1 / spreadIntensity)
  );
}

export async function calculateAttackingStrength(
  stats,
  last5 = false,
  options = {}
) {
  const weights = {
    "Average Dangerous Attacks": 0.15,
    "Average Shots": 0.0,
    "Average Shots On Target": 0.15,
    "Average Expected Goals": 0.15,
    "Weighted XG": 0.3,
    "Average Goals": 0.25,
    Corners: 0,
    "Average Shot Value": 0,
    Possession: 0,
    "Injury impact": 0,
  };

  const rangeSet = options.international
    ? INTERNATIONAL_ATTACK_RANGES
    : DOMESTIC_ATTACK_RANGES;
  const ranges = last5 ? rangeSet.last5 : rangeSet.overall;
  const spreadIntensity = options.international ? 1 : 1.05;

  let weightedSum = 0;
  for (const metric in stats) {
    if (
      Object.prototype.hasOwnProperty.call(stats, metric) &&
      Object.prototype.hasOwnProperty.call(weights, metric) &&
      Object.prototype.hasOwnProperty.call(ranges, metric)
    ) {
      const metricValue = parseStrengthMetricValue(stats[metric]);
      if (metricValue === null) continue;
      const normalizedValue = Math.max(
        0,
        Math.min(
          1,
          (metricValue - ranges[metric].min) /
            (ranges[metric].max - ranges[metric].min)
        )
      );
      weightedSum += normalizedValue * weights[metric];
    }
  }

  weightedSum = applyStrengthSpread(weightedSum, spreadIntensity);
  return parseFloat(weightedSum.toFixed(2));
}

export async function calculateDefensiveStrength(
  stats,
  last5 = false,
  options = {}
) {
  const weights = {
    "Average XG Against": 0.15,
    "Weighted XG Against": 0.3,
    "Average Goals Against": 0.25,
    "Average SOT Against": 0.15,
    "Average Dangerous Attacks Against": 0.15,
    "Injury impact": 0,
  };

  const rangeSet = options.international
    ? INTERNATIONAL_DEFENCE_RANGES
    : DOMESTIC_DEFENCE_RANGES;
  const ranges = last5 ? rangeSet.last5 : rangeSet.overall;
  const spreadIntensity = options.international ? 1 : 1.05;

  let weightedSum = 0;
  for (const metric in stats) {
    if (
      Object.prototype.hasOwnProperty.call(stats, metric) &&
      Object.prototype.hasOwnProperty.call(weights, metric) &&
      Object.prototype.hasOwnProperty.call(ranges, metric)
    ) {
      const metricValue = parseStrengthMetricValue(stats[metric]);
      if (metricValue === null) continue;
      const normalizedValueRaw =
        (metricValue - ranges[metric].min) /
        (ranges[metric].max - ranges[metric].min);
      const normalizedValueClamped = Math.max(0, Math.min(1, normalizedValueRaw));
      weightedSum += (1 - normalizedValueClamped) * weights[metric];
    }
  }

  weightedSum = applyStrengthSpread(weightedSum, spreadIntensity);
  return parseFloat(weightedSum.toFixed(2));
}
