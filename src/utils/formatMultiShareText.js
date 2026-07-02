const SITE_URL = "https://www.soccerstatshub.com";

function formatShareDate(date = new Date()) {
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function formatAccaOdds(accumulatedOdds) {
  const decimal = Number(accumulatedOdds);
  if (!Number.isFinite(decimal) || decimal <= 1) {
    return null;
  }
  return `${Math.round(decimal) - 1}/1`;
}

function buildHeader(title) {
  return [`⚽ ${title} — ${formatShareDate()}`, ""];
}

function buildFooter() {
  return ["", `🔗 ${SITE_URL}`];
}

export function formatBuildMultiText(tips, accumulatedOdds) {
  if (!tips?.length) {
    return "";
  }

  const lines = [
    ...buildHeader("SoccerStatsHub Multi"),
    ...tips.flatMap((tip, index) => {
      const kickOff = tip.time ? ` — ${tip.time}` : "";
      const competition = tip.competition ? ` (${tip.competition})` : "";
      return [
        `${index + 1}. ${tip.game}${competition}${kickOff}`,
        `   ${tip.team} @ ${tip.odds}`,
      ];
    }),
  ];

  const accaOdds = formatAccaOdds(accumulatedOdds);
  if (accaOdds) {
    lines.push("", `Acca odds ~ ${accaOdds}`);
  }

  lines.push(...buildFooter());
  return lines.join("\n");
}

export function formatExoticMultiText({
  tips,
  gamesInExotic,
  exoticString,
  exoticStake,
  combinations,
  price,
}) {
  if (!tips?.length) {
    return "";
  }

  const totalStake =
    exoticStake != null && combinations != null
      ? (exoticStake * combinations).toFixed(2)
      : null;

  const lines = [
    ...buildHeader("SSH Exotic of the Day"),
    gamesInExotic ? `${gamesInExotic} games: ${exoticString}` : null,
    exoticStake != null && combinations != null
      ? `Stake: ${exoticStake} units x ${combinations} combinations${
          totalStake ? ` (${totalStake} units total)` : ""
        }`
      : null,
    price != null ? `Potential return: ${Number(price).toFixed(2)} units` : null,
    "",
    ...tips.flatMap((tip, index) => [
      `${index + 1}. ${tip.team} @ ${tip.odds}`,
      `   ${tip.game}`,
    ]),
    ...buildFooter(),
  ].filter((line) => line != null);

  return lines.join("\n");
}

export function formatOver25MultiText(tips) {
  if (!tips?.length) {
    return "";
  }

  const lines = [
    ...buildHeader("SSH Over 2.5 Goals Picks"),
    ...tips.map(
      (tip, index) =>
        `${index + 1}. ${tip.game} — Over 2.5 @ ${tip.odds}${
          tip.outcomeSymbol ? ` ${tip.outcomeSymbol}` : ""
        }`
    ),
    ...buildFooter(),
  ];

  return lines.join("\n");
}

export function formatBttsMultiText(tips) {
  if (!tips?.length) {
    return "";
  }

  const lines = [
    ...buildHeader("SSH BTTS Picks"),
    ...tips.map(
      (tip, index) =>
        `${index + 1}. ${tip.bttsGame} — BTTS @ ${tip.bttsFraction}${
          tip.bttsOutcomeSymbol ? ` ${tip.bttsOutcomeSymbol}` : ""
        }`
    ),
    ...buildFooter(),
  ];

  return lines.join("\n");
}
