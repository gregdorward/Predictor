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

function formatMatchLink(game, format) {
  const url = buildMatchShareUrl(game?.id, game?.date, SITE_URL);
  if (!url) {
    return null;
  }

  if (format === "markdown") {
    return `[View match on Soccer Stats Hub](${url})`;
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

  const matchOdds = formatMatchOdds(game);
  if (matchOdds) {
    lines.push(
      isMarkdown
        ? `**Match odds (H/D/A):** ${matchOdds}`
        : `Match odds (H/D/A): ${matchOdds}`
    );
  }

  lines.push("", isMarkdown ? "### Key stats" : "Key stats:", "");

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
    const values = formatComparisonValues(homeValue, awayValue, winner, format);

    lines.push(
      isMarkdown ? `- **${label}:** ${values}` : `${label}: ${values}`
    );
  });

  const matchLink = formatMatchLink(game, format);
  if (matchLink) {
    lines.push("", matchLink);
  } else {
    lines.push(
      "",
      format === "markdown"
        ? `[soccerstatshub.com](${SITE_URL})`
        : `🔗 ${SITE_URL}`
    );
  }

  return lines.join("\n");
}
