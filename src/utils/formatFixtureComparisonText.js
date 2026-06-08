const SITE_URL = "https://www.soccerstatshub.com";

export const SHARE_COMPARISON_STATS = [
  { key: "leaguePosition", label: "League position" },
  { key: "goals", label: "Goals/game" },
  { key: "conceeded", label: "Conceeded/game" },
  { key: "XG", label: "xG/game" },
  { key: "XGConceded", label: "xG conceeded" },
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

  const isMarkdown = format === "markdown";
  const lines = [];

  if (isMarkdown) {
    lines.push(`## ${game.homeTeam} vs ${game.awayTeam}`);
    lines.push("*Soccer Stats Hub*");
    if (game.leagueDesc) {
      lines.push(`**${game.leagueDesc}**`);
    }
    if (game.time) {
      lines.push(`Kick-off: ${game.time}`);
    }
    lines.push("");
  } else {
    lines.push(`⚽ ${game.homeTeam} vs ${game.awayTeam} | Soccer Stats Hub`);
    if (game.leagueDesc) {
      lines.push(game.leagueDesc);
    }
    if (game.time) {
      lines.push(`Kick-off: ${game.time}`);
    }
    lines.push("");
  }

  const prediction = formatPrediction(game);
  if (prediction) {
    lines.push(
      isMarkdown
        ? `**SSH Prediction:** ${prediction}`
        : `SSH Prediction: ${prediction}`
    );
  }

  if (game.homeWinProbability != null) {
    lines.push(
      `Win chance: ${game.homeTeam} ${formatProbability(game.homeWinProbability)} | Draw ${formatProbability(game.drawProbability)} | ${game.awayTeam} ${formatProbability(game.awayWinProbability)}`
    );
  }

  lines.push("", isMarkdown ? "### Key stats (season)" : "Key stats (season):", "");

  SHARE_COMPARISON_STATS.forEach(({ key, label }) => {
    const homeValue = formatStatValue(homeStats[key]);
    const awayValue = formatStatValue(awayStats[key]);
    if (homeValue === "—" && awayValue === "—") {
      return;
    }

    const winner = getWinnerSide(comparisonMap, key);
    const values = formatComparisonValues(homeValue, awayValue, winner, format);

    lines.push(
      isMarkdown ? `- **${label}:** ${values}` : `${label}: ${values}`
    );
  });

  if (isMarkdown) {
    lines.push("", `[soccerstatshub.com](${SITE_URL})`);
  } else {
    lines.push("", `🔗 ${SITE_URL}`);
  }

  return lines.join("\n");
}
