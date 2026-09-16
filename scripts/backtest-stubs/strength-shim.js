/** Minimal strength helpers for offline league-comparison generation. */

const DOMESTIC_ATTACK_RANGES = {
  overall: {
    "Average Dangerous Attacks": { min: 28.1, max: 72.53 },
    "Average Shots": { min: 6.32, max: 18.69 },
    "Average Shots On Target": { min: 0.6, max: 8.5 },
    "Average Expected Goals": { min: 0.8, max: 2.15 },
    "Average Goals": { min: 0.85, max: 2.01 },
    "Average Shot Value": { min: 3.42, max: 29.08 },
    "Injury impact": { min: 1.4, max: 8.6 },
  },
  last5: {
    "Average Dangerous Attacks": { min: 22.41, max: 76.97 },
    "Average Shots": { min: 4.06, max: 20.95 },
    "Average Shots On Target": { min: 0.2, max: 9.0 },
    "Average Expected Goals": { min: 0.5, max: 2.4 },
    "Average Goals": { min: 0.58, max: 2.27 },
    "Average Shot Value": { min: 3.02, max: 30.48 },
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
    "Average XG Against": { min: 0.8, max: 2.15 },
    "Average Goals Against": { min: 0.85, max: 2.01 },
    "Average SOT Against": { min: 0.6, max: 8.5 },
    "Average Dangerous Attacks Against": { min: 28.1, max: 72.53 },
    "Clean Sheet Percentage": { min: 8.44, max: 47.81 },
    "Average Shots Against": { min: 6.32, max: 18.69 },
    "Injury impact": { min: 1.4, max: 8.6 },
  },
  last5: {
    "Average XG Against": { min: 0.5, max: 2.4 },
    "Average Goals Against": { min: 0.58, max: 2.27 },
    "Average SOT Against": { min: 0.2, max: 9.0 },
    "Average Dangerous Attacks Against": { min: 22.41, max: 76.97 },
    "Clean Sheet Percentage": { min: 8.44, max: 47.81 },
    "Average Shots Against": { min: 4.06, max: 20.95 },
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
