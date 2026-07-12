/** @typedef {{ label: string, value: * }} FixtureStatRow */
/** @typedef {{ id: string, title: string, home: FixtureStatRow[], away: FixtureStatRow[] }} FixturePageSection */

function formatPercent(value) {
  if (value == null || value === "") {
    return null;
  }
  const n = Number(value);
  if (!Number.isFinite(n)) {
    return null;
  }
  return `${n}%`;
}

function formatLastFiveForm(formRun) {
  if (formRun == null) {
    return null;
  }
  if (Array.isArray(formRun)) {
    return formRun.length ? formRun.join("-") : null;
  }
  if (typeof formRun === "string") {
    return formRun.length ? formRun.split("").join("-") : null;
  }
  return null;
}

function getOrdinalSuffix(position) {
  if ([1, 21, 31, 41].includes(position)) return "st";
  if ([2, 22, 32, 42].includes(position)) return "nd";
  if ([3, 23, 33, 43].includes(position)) return "rd";
  return "th";
}

export function formatLeaguePosition(position) {
  if (position == null || position === "" || position === "N/A") {
    return position ?? null;
  }

  const asNumber = Number(position);
  if (!Number.isFinite(asNumber)) {
    return position;
  }

  const rounded = Math.round(asNumber);
  return `${rounded}${getOrdinalSuffix(rounded)}`;
}

function roundToTwoDecimals(value) {
  if (value == null || value === "") {
    return null;
  }
  const n = Number(value);
  if (!Number.isFinite(n)) {
    return value;
  }
  return parseFloat(n.toFixed(2));
}

export function computeCleanSheetPercentage(allTeamResults) {
  if (!Array.isArray(allTeamResults) || allTeamResults.length === 0) {
    return null;
  }
  const cleanSheets = allTeamResults.filter(
    (result) => Number(result.conceeded) === 0
  ).length;
  const percentage = (cleanSheets / allTeamResults.length) * 100;
  return `${percentage.toFixed(2)}%`;
}

function buildRows(definitions, getValue) {
  return definitions.map(({ label, key }) => ({
    label,
    value: getValue(key),
  }));
}

function getAttackingValue(form, key) {
  const injuryImpact = form?.attackingMetrics?.["Injury impact"] ?? 4;
  const values = {
    averageGoals: form?.avgScored,
    averageExpectedGoals: form?.XGOverall,
    weightedXg: roundToTwoDecimals(form?.weightedXGAvgFor ?? form?.XGOverall),
    averageShots: roundToTwoDecimals(form?.avgShots),
    averageShotsOnTarget: form?.AverageShotsOnTargetOverall,
    averageShotValue: Number.isFinite(form?.avgShotValueChart)
      ? form.avgShotValueChart.toFixed(2)
      : form?.avgShotValueChart,
    averageDangerousAttacks: form?.AverageDangerousAttacksOverall,
    corners: form?.AverageCorners,
    injuryImpact,
  };
  return values[key] ?? null;
}

function getDefensiveValue(form, key) {
  const injuryImpact = form?.defensiveMetrics?.["Injury impact"] ?? 4;
  const values = {
    cleanSheetPercentage: computeCleanSheetPercentage(form?.allTeamResults),
    averageGoalsAgainst: form?.avgConceeded,
    averageXgAgainst: form?.XGAgainstAvgOverall,
    weightedXgAgainst: roundToTwoDecimals(
      form?.weightedXGAvgAgainst ?? form?.XGAgainstAvgOverall
    ),
    averageShotsAgainst: roundToTwoDecimals(form?.avgShotsAgainst),
    averageSotAgainst: form?.AverageShotsOnTargetAgainstOverall,
    averageShotValueAgainst: Number.isFinite(form?.avgShotValueAgainstChart)
      ? form.avgShotValueAgainstChart.toFixed(2)
      : form?.avgShotValueAgainstChart,
    averageDangerousAttacksAgainst: Number.isFinite(
      form?.avgDangerousAttacksAgainst
    )
      ? form.avgDangerousAttacksAgainst.toFixed(2)
      : form?.avgDangerousAttacksAgainst,
    injuryImpact,
  };
  return values[key] ?? null;
}

const ATTACKING_ROW_DEFS = [
  { label: "Average Goals", key: "averageGoals" },
  { label: "Average Expected Goals", key: "averageExpectedGoals" },
  { label: "Weighted XG", key: "weightedXg" },
  { label: "Average Shots", key: "averageShots" },
  { label: "Average Shots On Target", key: "averageShotsOnTarget" },
  { label: "Average Shot Value", key: "averageShotValue" },
  { label: "Average Dangerous Attacks", key: "averageDangerousAttacks" },
  { label: "Corners", key: "corners" },
  { label: "Injury impact", key: "injuryImpact" },
];

const DEFENSIVE_ROW_DEFS = [
  { label: "Clean Sheet Percentage", key: "cleanSheetPercentage" },
  { label: "Average Goals Against", key: "averageGoalsAgainst" },
  { label: "Average XG Against", key: "averageXgAgainst" },
  { label: "Weighted XG Against", key: "weightedXgAgainst" },
  { label: "Average Shots Against", key: "averageShotsAgainst" },
  { label: "Average SOT Against", key: "averageSotAgainst" },
  { label: "Average Shot Value Against", key: "averageShotValueAgainst" },
  { label: "Average Dangerous Attacks Against", key: "averageDangerousAttacksAgainst" },
  { label: "Injury impact", key: "injuryImpact" },
];

/** Plain league-match averages for strength calculation (not rolling). */
export function buildFixturePageAttackingMetrics(form) {
  const rows = buildRows(ATTACKING_ROW_DEFS, (key) => getAttackingValue(form, key));
  return Object.fromEntries(rows.map(({ label, value }) => [label, value]));
}

/** Plain league-match averages for strength calculation (not rolling). */
export function buildFixturePageDefensiveMetrics(form) {
  const rows = buildRows(DEFENSIVE_ROW_DEFS, (key) => getDefensiveValue(form, key));
  return Object.fromEntries(rows.map(({ label, value }) => [label, value]));
}

function buildContextRows(form, match, side) {
  const isHome = side === "home";
  const venuePosition = isHome
    ? match?.homeTeamHomePosition
    : match?.awayTeamAwayPosition;
  const lastFiveForm = isHome ? match?.lastFiveFormHome : match?.lastFiveFormAway;
  const context = form?.contextMetrics;
  const rest = context?.rest;
  const sos = context?.strengthOfSchedule;
  const variance = context?.scoringVariance;

  return [
    {
      label: "Competition Ranking",
      value: formatLeaguePosition(isHome ? form?.homePosition : form?.awayPosition),
    },
    {
      label: isHome ? "Competition Ranking (home)" : "Competition Ranking (away)",
      value: formatLeaguePosition(venuePosition),
    },
    {
      label: "Last 5 form",
      value: formatLastFiveForm(lastFiveForm),
    },
    {
      label: "PPG (last 5 avg)",
      value: form?.avPoints5 ?? null,
    },
    {
      label: "Goal difference",
      value: form?.goalDifference ?? null,
    },
    {
      label: "Days since last match",
      value: rest?.daysSinceLastMatch ?? null,
    },
    {
      label: "Rest / congestion",
      value:
        rest?.restLabel && rest?.congestionLabel
          ? `${rest.restLabel} · ${rest.congestionLabel}`
          : rest?.restLabel ?? null,
    },
    {
      label: "Matches in last 7 days",
      value: rest?.matchesInLast7Days ?? null,
    },
    {
      label: "Recent schedule",
      value: sos?.scheduleLabel ?? null,
    },
    {
      label: "Opp PPG last 5 / all",
      value:
        sos?.avOppositionPPGLast5 != null && sos?.avOppositionPPGAll != null
          ? `${sos.avOppositionPPGLast5} / ${sos.avOppositionPPGAll}`
          : null,
    },
    {
      label: "Scoring profile",
      value: variance?.varianceLabel ?? null,
    },
  ];
}

function buildTendenciesRows(form) {
  const overUnder = form?.contextMetrics?.overUnder;
  const gameState = form?.contextMetrics?.gameState;
  const variance = form?.contextMetrics?.scoringVariance;

  return [
    {
      label: "BTTS % (last 10)",
      value: formatPercent(form?.bttsAllPercentage),
    },
    {
      label: "BTTS % (last 5)",
      value: formatPercent(form?.bttsLast5Percentage),
    },
    {
      label: "BTTS % (home venue)",
      value: formatPercent(form?.bttsHomePercentage),
    },
    {
      label: "BTTS % (away venue)",
      value: formatPercent(form?.bttsAwayPercentage),
    },
    {
      label: "O2.5 % (last 5)",
      value: formatPercent(overUnder?.over25Last5Percentage),
    },
    {
      label: "O2.5 % (last 10)",
      value: formatPercent(overUnder?.over25Last10Percentage),
    },
    {
      label: "U2.5 % (last 5)",
      value: formatPercent(overUnder?.under25Last5Percentage),
    },
    {
      label: "Scored first %",
      value: gameState?.hasData
        ? formatPercent(gameState.scoredFirstPercentage)
        : null,
    },
    {
      label: "Late goals scored %",
      value: gameState?.hasData
        ? formatPercent(gameState.lateGoalsScoredPercentage)
        : null,
    },
    {
      label: "One-goal games %",
      value: formatPercent(variance?.oneGoalGamePercentage),
    },
    {
      label: "Draw % (season sample)",
      value: formatPercent(variance?.drawPercentage),
    },
  ];
}

export function buildFixtureModelOutputs(match) {
  const homeWin = Number(match?.homeWinProbability);
  const draw = Number(match?.drawProbability);
  const awayWin = Number(match?.awayWinProbability);

  if (
    !Number.isFinite(homeWin) &&
    !Number.isFinite(draw) &&
    !Number.isFinite(awayWin)
  ) {
    return null;
  }

  return {
    homeWin: Number.isFinite(homeWin) ? homeWin : 0,
    draw: Number.isFinite(draw) ? draw : 0,
    awayWin: Number.isFinite(awayWin) ? awayWin : 0,
  };
}

export function buildFixturePageSections(match) {
  const formHome = match?.formHome ?? {};
  const formAway = match?.formAway ?? {};

  return [
    {
      id: "context",
      title: "Form & Context",
      home: buildContextRows(formHome, match, "home"),
      away: buildContextRows(formAway, match, "away"),
    },
    {
      id: "attacking",
      title: "Attacking",
      home: buildRows(ATTACKING_ROW_DEFS, (key) => getAttackingValue(formHome, key)),
      away: buildRows(ATTACKING_ROW_DEFS, (key) => getAttackingValue(formAway, key)),
    },
    {
      id: "defensive",
      title: "Defensive",
      home: buildRows(DEFENSIVE_ROW_DEFS, (key) => getDefensiveValue(formHome, key)),
      away: buildRows(DEFENSIVE_ROW_DEFS, (key) => getDefensiveValue(formAway, key)),
    },
    {
      id: "tendencies",
      title: "Match Tendencies",
      home: buildTendenciesRows(formHome),
      away: buildTendenciesRows(formAway),
    },
  ];
}

/** Legacy localStorage path: attacking + defensive only from stored metric objects. */
export function buildLegacyFixtureSections(homeForm, homeFormDef, awayForm, awayFormDef) {
  const toRows = (metrics) =>
    Object.entries(metrics ?? {}).map(([label, value]) => ({ label, value }));

  return [
    {
      id: "attacking",
      title: "Attacking",
      home: toRows(homeForm),
      away: toRows(awayForm),
    },
    {
      id: "defensive",
      title: "Defensive",
      home: toRows(homeFormDef),
      away: toRows(awayFormDef),
    },
  ];
}
