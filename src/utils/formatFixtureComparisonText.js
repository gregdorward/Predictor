import { buildMatchShareUrl } from "./shareMatchUrl";

const SITE_URL = "https://www.soccerstatshub.com";

const INJURY_IMPACT_LABELS = {
  1: "Minimal",
  2: "Very low",
  3: "Low",
  4: "Slight",
  5: "Moderate",
  6: "Noticeable",
  7: "Significant",
  8: "High",
  9: "Very high",
  10: "Severe",
};

export const SHARE_COMPARISON_STATS = [
  { key: "leaguePosition", label: "League position" },
  { key: "goals", label: "Goals/game" },
  { key: "conceeded", label: "Conceeded/game" },
  { key: "XG", label: "xG/game" },
  { key: "XGConceded", label: "xG conceeded/game" },
  { key: "goalDifference", label: "Goal difference" },
  { key: "goalDifferenceHomeOrAway", label: "Goal difference (H/A)" },
  { key: "ppg", label: "PPG" },
  { key: "ppgLast5", label: "PPG (last 5)" },
  { key: "ppgHomeOrAway", label: "PPG (home/away)" },
  { key: "sot", label: "Shots on target" },
  { key: "injuryImpact", label: "Injury impact", type: "injury" },
];

const MARKDOWN_SHARE_STATS = [
  { key: "goals", label: "Goals / Game", format: "decimal" },
  { key: "conceeded", label: "Conceded / Game", format: "decimal" },
  { key: "XG", label: "xG / Game", format: "decimal" },
  { key: "XGConceded", label: "xG Conceded / Game", format: "decimal" },
  { key: "goalDifference", label: "Goal Difference", format: "goalDiff" },
  {
    key: "goalDifferenceHomeOrAway",
    label: "Goal Diff (H/A)",
    format: "goalDiff",
  },
  { key: "ppg", label: "PPG (Overall)", format: "decimal" },
  { key: "ppgLast5", label: "PPG (Last 5)", format: "decimal" },
  { key: "ppgHomeOrAway", label: "PPG (Home/Away)", format: "decimal" },
  { key: "sot", label: "Shots on Target", format: "decimal" },
];

export function formatInjuryImpactLabel(value) {
  if (value == null || value === "" || value === "-") {
    return "—";
  }

  const numeric = Math.round(Number(value));
  if (!Number.isFinite(numeric) || numeric < 1) {
    return "—";
  }

  const clamped = Math.min(10, Math.max(1, numeric));
  return INJURY_IMPACT_LABELS[clamped];
}

function formatStatValue(value, type) {
  if (type === "injury") {
    return formatInjuryImpactLabel(value);
  }

  if (value == null || value === "" || value === "-") {
    return "—";
  }
  return String(value);
}

function formatDecimalStat(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return formatStatValue(value);
  }
  return numeric.toFixed(2);
}

function formatGoalDifferenceStat(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return formatStatValue(value);
  }
  if (numeric > 0) {
    return `+${numeric}`;
  }
  return String(numeric);
}

function formatMarkdownStatValue(value, format) {
  if (format === "goalDiff") {
    return formatGoalDifferenceStat(value);
  }
  if (format === "decimal") {
    return formatDecimalStat(value);
  }
  return formatStatValue(value);
}

function formatPrediction(game) {
  if (game?.goalsA == null || game?.goalsB == null) {
    return null;
  }
  return `${game.goalsA}-${game.goalsB}`;
}

function formatProbability(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) {
    return null;
  }
  return `${Math.round(n)}%`;
}

function formatMatchOdds(game) {
  const home = game?.fractionHome;
  const draw = game?.fractionDraw;
  const away = game?.fractionAway;

  if (
    home != null &&
    home !== "N/A" &&
    draw != null &&
    draw !== "N/A" &&
    away != null &&
    away !== "N/A"
  ) {
    return `${home} | ${draw} | ${away}`;
  }

  if (game?.homeOdds != null && game?.drawOdds != null && game?.awayOdds != null) {
    return `${game.homeOdds} | ${game.drawOdds} | ${game.awayOdds}`;
  }

  return null;
}

function getWinnerSide(comparisonMap, key) {
  if (comparisonMap[key] === "better") {
    return "home";
  }
  if (comparisonMap[key] === "worse") {
    return "away";
  }
  return null;
}

function formatComparisonValues(homeValue, awayValue, winner, format) {
  if (format === "markdown") {
    if (winner === "home") {
      return `**${homeValue}** | ${awayValue}`;
    }
    if (winner === "away") {
      return `${homeValue} | **${awayValue}**`;
    }
    return `${homeValue} | ${awayValue}`;
  }

  if (winner === "home") {
    return `${homeValue} ✓ | ${awayValue}`;
  }
  if (winner === "away") {
    return `${homeValue} | ${awayValue} ✓`;
  }
  return `${homeValue} | ${awayValue}`;
}

function formatTableCell(value, isWinner) {
  return isWinner ? `**${value}**` : value;
}

function formatTableHeaderTeamName(name) {
  if (/^Bosnia\s+and\s+Herzegovina$/i.test(name)) {
    return "Bosnia & Herz.";
  }
  return name;
}

function formatMatchLink(game, format) {
  const url = buildMatchShareUrl(game?.id, game?.date, SITE_URL);
  if (!url) {
    return null;
  }

  if (format === "markdown") {
    return `👉 [View match on Soccer Stats Hub](${url})`;
  }

  return `🔗 ${url}`;
}

function shouldSkipStat(homeStats, awayStats, key, type) {
  if (type === "injury") {
    const homeKnown = homeStats[key] != null && homeStats[key] !== "";
    const awayKnown = awayStats[key] != null && awayStats[key] !== "";
    return !homeKnown && !awayKnown;
  }

  const homeValue = formatStatValue(homeStats[key], type);
  const awayValue = formatStatValue(awayStats[key], type);
  return homeValue === "—" && awayValue === "—";
}

function formatMarkdownFixtureComparison({
  game,
  homeStats,
  awayStats,
  comparisonMap,
}) {
  const lines = [];

  lines.push(`## ${game.homeTeam} vs ${game.awayTeam} — *Soccer Stats Hub*`);
  lines.push("");

  const prediction = formatPrediction(game);
  if (prediction) {
    lines.push(`**SSH Prediction:** ${prediction}`);
    lines.push("");
  }

  if (game.homeWinProbability != null) {
    const winChanceParts = [
      `${game.homeTeam} ${formatProbability(game.homeWinProbability)}`,
      `Draw ${formatProbability(game.drawProbability)}`,
      `${game.awayTeam} ${formatProbability(game.awayWinProbability)}`,
    ];
    lines.push(`**Win chance:** ${winChanceParts.join(" • ")}`);
    lines.push("");
  }

  const matchOdds = formatMatchOdds(game);
  if (matchOdds) {
    lines.push(`**Match odds (H/D/A):** ${matchOdds}`);
  }

  const tableRows = MARKDOWN_SHARE_STATS.filter(
    ({ key, type }) => !shouldSkipStat(homeStats, awayStats, key, type)
  ).map(({ key, label, format, type }) => {
    const homeValue = formatMarkdownStatValue(homeStats[key], format);
    const awayValue = formatMarkdownStatValue(awayStats[key], format);
    const winner = getWinnerSide(comparisonMap, key);

    return `| **${label}** | ${formatTableCell(
      homeValue,
      winner === "home"
    )} | ${formatTableCell(awayValue, winner === "away")} |`;
  });

  if (tableRows.length > 0) {
    lines.push("");
    lines.push(
      `| Stat | ${game.homeTeam} | ${formatTableHeaderTeamName(game.awayTeam)} |`
    );
    lines.push("| :--- | :---: | :---: |");
    lines.push(...tableRows);
  }

  const matchLink = formatMatchLink(game, "markdown");
  lines.push("");
  lines.push("---");
  if (matchLink) {
    lines.push(matchLink);
  } else {
    lines.push(`👉 [soccerstatshub.com](${SITE_URL})`);
  }

  return lines.join("\n");
}

function formatPlainFixtureComparison({
  game,
  homeStats,
  awayStats,
  comparisonMap,
}) {
  const lines = [];

  lines.push(`⚽ ${game.homeTeam} vs ${game.awayTeam} | Soccer Stats Hub`);
  if (game.leagueDesc) {
    lines.push(game.leagueDesc);
  }
  if (game.time) {
    lines.push(`Kick-off: ${game.time}`);
  }
  lines.push("");

  const prediction = formatPrediction(game);
  if (prediction) {
    lines.push(`SSH Prediction: ${prediction}`);
  }

  if (game.homeWinProbability != null) {
    lines.push(
      `Win chance: ${game.homeTeam} ${formatProbability(game.homeWinProbability)} | Draw ${formatProbability(game.drawProbability)} | ${game.awayTeam} ${formatProbability(game.awayWinProbability)}`
    );
  }

  const matchOdds = formatMatchOdds(game);
  if (matchOdds) {
    lines.push(`Match odds (H/D/A): ${matchOdds}`);
  }

  lines.push("", "Key stats:", "");

  SHARE_COMPARISON_STATS.forEach(({ key, label, type }) => {
    if (shouldSkipStat(homeStats, awayStats, key, type)) {
      return;
    }

    const homeValue = formatStatValue(homeStats[key], type);
    const awayValue = formatStatValue(awayStats[key], type);
    if (homeValue === "—" && awayValue === "—") {
      return;
    }

    const winner = getWinnerSide(comparisonMap, key);
    const values = formatComparisonValues(homeValue, awayValue, winner, "text");

    lines.push(`${label}: ${values}`);
  });

  const matchLink = formatMatchLink(game, "text");
  if (matchLink) {
    lines.push("", matchLink);
  } else {
    lines.push("", `🔗 ${SITE_URL}`);
  }

  return lines.join("\n");
}

export function formatFixtureComparisonText({
  game,
  homeStats,
  awayStats,
  comparisonMap = {},
  format = "text",
}) {
  if (!game || !homeStats || !awayStats) {
    return "";
  }

  if (format === "markdown") {
    return formatMarkdownFixtureComparison({
      game,
      homeStats,
      awayStats,
      comparisonMap,
    });
  }

  return formatPlainFixtureComparison({
    game,
    homeStats,
    awayStats,
    comparisonMap,
  });
}
