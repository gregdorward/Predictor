const SITE_URL = "https://www.soccerstatshub.com";

export const SHARE_COMPARISON_STATS = [
  { key: "leaguePosition", label: "League position" },
  { key: "goals", label: "Goals/game" },
  { key: "conceeded", label: "Conceded/game" },
  { key: "XG", label: "xG/game" },
  { key: "XGConceded", label: "xG conceded" },
  { key: "goalDifference", label: "Goal difference" },
  { key: "ppg", label: "PPG" },
  { key: "dangerousAttacks", label: "Dangerous attacks" },
  { key: "sot", label: "Shots on target" },
];

function formatStatValue(value) {
  if (value == null || value === "" || value === "-") {
    return "—";
  }
  return String(value);
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

export function formatFixtureComparisonText({
  game,
  homeStats,
  awayStats,
  comparisonMap = {},
}) {
  if (!game || !homeStats || !awayStats) {
    return "";
  }

  const lines = [
    `⚽ ${game.homeTeam} vs ${game.awayTeam} | Soccer Stats Hub`,
    game.leagueDesc ? game.leagueDesc : "",
    game.time ? `Kick-off: ${game.time}` : "",
    "",
  ].filter(Boolean);

  const prediction = formatPrediction(game);
  if (prediction) {
    lines.push(`SSH Prediction: ${prediction}`);
  }

  if (game.homeWinProbability != null) {
    lines.push(
      `Win chance: ${game.homeTeam} ${formatProbability(game.homeWinProbability)} | Draw ${formatProbability(game.drawProbability)} | ${game.awayTeam} ${formatProbability(game.awayWinProbability)}`
    );
  }

  lines.push("", "Key stats (season):", "");

  SHARE_COMPARISON_STATS.forEach(({ key, label }) => {
    const homeValue = formatStatValue(homeStats[key]);
    const awayValue = formatStatValue(awayStats[key]);
    if (homeValue === "—" && awayValue === "—") {
      return;
    }

    const edge =
      comparisonMap[key] === "better"
        ? `→ ${homeStats.name}`
        : comparisonMap[key] === "worse"
          ? `→ ${awayStats.name}`
          : "";

    lines.push(`${label}: ${homeValue} | ${awayValue}${edge ? ` ${edge}` : ""}`);
  });

  lines.push("", `🔗 ${SITE_URL}`);
  return lines.join("\n");
}
