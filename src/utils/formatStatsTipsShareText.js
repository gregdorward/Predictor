const SITE_URL = "https://www.soccerstatshub.com";

export const STATS_TIP_SECTIONS = [
  {
    id: "xg",
    label: "xG diff",
    title: "xG differential (last 5)",
    metricColumn: "xG diff",
    getMetricValue: (tip) => tip.XGdifferentialValue,
    formatMetric: (value) => formatDecimalMagnitude(value, 2),
  },
  {
    id: "points",
    label: "Points",
    title: "Points-per-game differential (last 6)",
    metricColumn: "PPG diff",
    getMetricValue: (tip) => tip.pointsDifferentialValue,
    formatMetric: (value) => formatDecimalMagnitude(value, 2),
  },
  {
    id: "goals",
    label: "Goals",
    title: "Goal differential (last 5)",
    metricColumn: "Goal diff",
    getMetricValue: (tip) => tip.rollingGoalDiffValue,
    formatMetric: (value) => formatIntegerMagnitude(value),
  },
  {
    id: "attacks",
    label: "Attacks",
    title: "Dangerous-attacks differential (last 5)",
    metricColumn: "DA diff",
    getMetricValue: (tip) => tip.dangerousAttacksDiffValue,
    formatMetric: (value) => formatIntegerMagnitude(value),
  },
  {
    id: "sot",
    label: "SOT",
    title: "Shots-on-target differential (last 5)",
    metricColumn: "SOT diff",
    getMetricValue: (tip) => tip.shotsOnTargetDiffValue,
    formatMetric: (value) => formatDecimalMagnitude(value, 1),
  },
];

export function formatStatsTipsShareDate(date = new Date()) {
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function formatShareDate(date) {
  return formatStatsTipsShareDate(date);
}

function formatDecimalMagnitude(value, decimals) {
  const n = Number(value);
  if (!Number.isFinite(n)) {
    return "—";
  }
  return Math.abs(n).toFixed(decimals);
}

function formatIntegerMagnitude(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) {
    return "—";
  }
  return String(Math.round(Math.abs(n)));
}

export function getStatsTipSection(sectionId) {
  return STATS_TIP_SECTIONS.find((section) => section.id === sectionId) || STATS_TIP_SECTIONS[0];
}

export function formatStatsTipMetric(tip, sectionId) {
  const section = getStatsTipSection(sectionId);
  const raw = section.getMetricValue(tip);
  return section.formatMetric(raw);
}

function formatFixtureLine(tip) {
  const competition = tip.competition ? ` (${tip.competition})` : "";
  return `${tip.game}${competition}`;
}

function escapeMarkdownTableCell(text) {
  return String(text ?? "")
    .replace(/\|/g, "\\|")
    .replace(/\n/g, " ");
}

function buildHeaderLines(section, format) {
  const dateLine = formatShareDate();
  if (format === "markdown") {
    return [
      `### Stats-based tips — ${section.title}`,
      `*${dateLine} · Soccer Stats Hub*`,
      "",
    ];
  }
  return [
    `⚽ Stats-based tips — ${section.title}`,
    dateLine,
    "",
  ];
}

function buildFooterLines(format) {
  if (format === "markdown") {
    return ["", "---", "", `[soccerstatshub.com](${SITE_URL})`];
  }
  return ["", `🔗 ${SITE_URL}`];
}

export function formatStatsTipsShareText({ sectionId, tips, format = "text" }) {
  if (!tips?.length) {
    return "";
  }

  const section = getStatsTipSection(sectionId);
  const lines = [...buildHeaderLines(section, format)];

  if (format === "markdown") {
    lines.push(
      `| Fixture | Pick | ${section.metricColumn} | Odds |`,
      "| --- | --- | ---: | ---: |"
    );

    for (const tip of tips) {
      const outcome =
        tip.outcomeSymbol && tip.outcome !== "Pending"
          ? ` ${tip.outcomeSymbol}`
          : "";
      lines.push(
        `| ${escapeMarkdownTableCell(formatFixtureLine(tip))} | ${escapeMarkdownTableCell(tip.prediction)} | ${formatStatsTipMetric(tip, sectionId)} | ${escapeMarkdownTableCell(`${tip.odds}${outcome}`)} |`
      );
    }
  } else {
    lines.push(
      `Fixture | Pick | ${section.metricColumn} | Odds`,
      "—".repeat(48)
    );

    tips.forEach((tip, index) => {
      const outcome =
        tip.outcomeSymbol && tip.outcome !== "Pending"
          ? ` ${tip.outcomeSymbol}`
          : "";
      lines.push(
        `${index + 1}. ${formatFixtureLine(tip)}`,
        `   ${tip.prediction} · ${section.metricColumn} ${formatStatsTipMetric(tip, sectionId)} · ${tip.odds}${outcome}`
      );
    });
  }

  lines.push(...buildFooterLines(format));
  return lines.join("\n");
}
