import { buildFixtureHeadToHead } from "./fixturePageH2h";
import { buildMarketsSnapshotRows } from "./fixturePageMetrics";

const MARKET_LABELS = {
  "BTTS % (last 5)": "BTTS",
  "O2.5 % (last 5)": "Over 2.5",
};

function cleanLeague(value) {
  const text = String(value || "").trim();
  if (!text || text === "League" || text === "Unknown League") return "";
  return text;
}

function finiteNumber(value) {
  if (value == null || value === "" || value === "x" || value === "P") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function formatScorePart(value) {
  const n = finiteNumber(value);
  if (n == null) return null;
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

function formatStrength(value) {
  const n = finiteNumber(value);
  if (n == null) return null;
  return Math.abs(n) >= 10 ? n.toFixed(1) : n.toFixed(2);
}

function strengthSentence(homeName, awayName, homeValue, awayValue, metric) {
  const home = finiteNumber(homeValue);
  const away = finiteNumber(awayValue);
  if (home == null || away == null) return null;
  if (Math.abs(home - away) < 0.005) return `${metric} is level.`;
  return `${home > away ? homeName : awayName} are stronger in ${metric}.`;
}

function strengthsCaption(homeName, awayName, chart) {
  const attack = strengthSentence(
    homeName,
    awayName,
    chart?.homeAttack,
    chart?.awayAttack,
    "attack"
  );
  const defence = strengthSentence(
    homeName,
    awayName,
    chart?.homeDefence,
    chart?.awayDefence,
    "defence"
  );
  if (
    attack === `${homeName} are stronger in attack.` &&
    defence === `${homeName} are stronger in defence.`
  ) {
    return `${homeName} are stronger in attack and defence.`;
  }
  if (
    attack === `${awayName} are stronger in attack.` &&
    defence === `${awayName} are stronger in defence.`
  ) {
    return `${awayName} are stronger in attack and defence.`;
  }
  return [attack, defence].filter(Boolean).join(" ");
}

function modelCaption(homeName, awayName, homeWin, draw, awayWin) {
  const outcomes = [
    { winner: homeName || "The home side", value: homeWin, draw: false },
    { winner: null, value: draw, draw: true },
    { winner: awayName || "The away side", value: awayWin, draw: false },
  ].sort((a, b) => b.value - a.value);
  const [first, second] = outcomes;
  if (first.value - second.value < 2) return "The model has this match as close.";
  if (first.draw) return `A draw is the most likely result, at ${first.value.toFixed(1)}%.`;
  return `${first.winner} are the most likely winners, at ${first.value.toFixed(1)}%.`;
}

function buildModel(homeName, awayName, modelOutputs) {
  const homeWin = finiteNumber(modelOutputs?.homeWin);
  const draw = finiteNumber(modelOutputs?.draw);
  const awayWin = finiteNumber(modelOutputs?.awayWin);
  if (homeWin == null || draw == null || awayWin == null) return null;
  if (homeWin + draw + awayWin <= 0) return null;
  return {
    homeWin,
    draw,
    awayWin,
    caption: modelCaption(homeName, awayName, homeWin, draw, awayWin),
  };
}

function buildStrengths(homeName, awayName, chart) {
  const homeAttack = finiteNumber(chart?.homeAttack);
  const awayAttack = finiteNumber(chart?.awayAttack);
  const homeDefence = finiteNumber(chart?.homeDefence);
  const awayDefence = finiteNumber(chart?.awayDefence);
  if ([homeAttack, awayAttack, homeDefence, awayDefence].some((value) => value == null)) {
    return null;
  }
  const [homeAttackShare, awayAttackShare] = pairShare(homeAttack, awayAttack);
  const [homeDefenceShare, awayDefenceShare] = pairShare(homeDefence, awayDefence);
  return {
    homeAttack,
    awayAttack,
    homeDefence,
    awayDefence,
    homeAttackLabel: formatStrength(homeAttack),
    awayAttackLabel: formatStrength(awayAttack),
    homeDefenceLabel: formatStrength(homeDefence),
    awayDefenceLabel: formatStrength(awayDefence),
    homeAttackShare,
    awayAttackShare,
    homeDefenceShare,
    awayDefenceShare,
    caption: strengthsCaption(homeName, awayName, chart),
  };
}

function pairShare(home, away) {
  const homeBar = Math.max(0, home);
  const awayBar = Math.max(0, away);
  const total = homeBar + awayBar;
  if (total <= 0) return [50, 50];
  return [(homeBar / total) * 100, (awayBar / total) * 100];
}

function displayMarket(value) {
  if (value == null || value === "" || value === "—" || value === "–") return "-";
  return value;
}

function buildMarkets(rows) {
  return (rows || [])
    .filter((row) => MARKET_LABELS[row?.label])
    .map((row) => ({
      label: MARKET_LABELS[row.label],
      homeValue: displayMarket(row.homeValue),
      awayValue: displayMarket(row.awayValue),
    }));
}

function buildHeadToHead(homeName, awayName, headToHead) {
  const summary = headToHead?.summary;
  const home = finiteNumber(summary?.homeTeamWins);
  const draw = finiteNumber(summary?.draws);
  const away = finiteNumber(summary?.awayTeamWins);
  if (home == null || draw == null || away == null) return null;
  const total = home + draw + away;
  if (total <= 0) return null;
  return {
    home: (home / total) * 100,
    draw: (draw / total) * 100,
    away: (away / total) * 100,
    homeCount: home,
    drawCount: draw,
    awayCount: away,
    total,
    caption: headToHeadCaption(homeName, awayName, home, draw, away, total),
  };
}

function headToHeadCaption(homeName, awayName, home, draw, away, total) {
  if (total === 1 && draw === 1) return "The only meeting was a draw.";
  if (total === 1 && home === 1) return `${homeName} have won the only meeting.`;
  if (total === 1 && away === 1) return `${awayName} have won the only meeting.`;
  const drawLabel = draw === 0 ? "no draws" : draw === 1 ? "1 draw" : `${draw} draws`;
  return `${homeName} have won ${home} of ${total} meetings. ${awayName} have won ${away}, with ${drawLabel}.`;
}

/**
 * Compact, share-safe summary. Prediction and model fields are included
 * whenever the numbers exist, including when the page itself still gates them.
 */
export function buildFixtureShareCard({
  homeName = "Home",
  awayName = "Away",
  homeBadge = null,
  awayBadge = null,
  league = "",
  kickOff = "",
  predictedHome = null,
  predictedAway = null,
  modelOutputs = null,
  chart = null,
  marketRows = [],
  headToHead = null,
  fixture = null,
} = {}) {
  const homeScore = formatScorePart(predictedHome);
  const awayScore = formatScorePart(predictedAway);
  const resolvedHeadToHead = headToHead || (fixture ? buildFixtureHeadToHead(fixture) : null);

  return {
    homeName,
    awayName,
    homeBadge: homeBadge || null,
    awayBadge: awayBadge || null,
    league: cleanLeague(league),
    kickOff: kickOff || "",
    predictedScore: homeScore && awayScore ? { home: homeScore, away: awayScore } : null,
    model: buildModel(homeName, awayName, modelOutputs),
    strengths: buildStrengths(homeName, awayName, chart),
    markets: buildMarkets(marketRows),
    headToHead: buildHeadToHead(homeName, awayName, resolvedHeadToHead),
  };
}

export function buildFixtureShareCardFromMatch(match, { kickOff = "", league = "" } = {}) {
  if (!match) return null;
  return buildFixtureShareCard({
    homeName: match.homeTeam || match.home_name || "Home",
    awayName: match.awayTeam || match.away_name || "Away",
    homeBadge: match.homeBadge || match.home_image || null,
    awayBadge: match.awayBadge || match.away_image || null,
    league: cleanLeague(league || match.leagueName || match.competition_name || match.league_name || ""),
    kickOff: kickOff || match.time || "",
    predictedHome: match.goalsA,
    predictedAway: match.goalsB,
    modelOutputs: {
      homeWin: match.homeWinProbability,
      draw: match.drawProbability,
      awayWin: match.awayWinProbability,
    },
    chart: {
      homeAttack: match.formHome?.fixtureAttackingStrength ?? match.formHome?.attackingStrength,
      homeDefence: match.formHome?.fixtureDefensiveStrength ?? match.formHome?.defensiveStrength,
      awayAttack: match.formAway?.fixtureAttackingStrength ?? match.formAway?.attackingStrength,
      awayDefence: match.formAway?.fixtureDefensiveStrength ?? match.formAway?.defensiveStrength,
    },
    marketRows: buildMarketsSnapshotRows(match),
    headToHead: match.headToHead || null,
    fixture: match,
  });
}
