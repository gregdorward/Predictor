function getOutcome(home, away) {
  const h = Number(home);
  const a = Number(away);
  if (h > a) return "homeWin";
  if (h === a) return "draw";
  return "awayWin";
}

function getProfit(fixture, outcome) {
  if (Number(fixture.homeOdds) === 0) return 1;

  switch (outcome) {
    case "homeWin":
      return parseFloat(fixture.homeOdds);
    case "draw":
      return parseFloat(fixture.drawOdds);
    case "awayWin":
      return parseFloat(fixture.awayOdds);
    default:
      return 0;
  }
}

function isPredictableScore(goalsA, goalsB) {
  const home = Number(goalsA);
  const away = Number(goalsB);
  return Number.isFinite(home) && Number.isFinite(away);
}

/**
 * Compare a predicted match to actual result (flat 1-unit stake on predicted outcome).
 */
export function evaluateMatch(match, dateIso, formSource) {
  const predHome = match.goalsA;
  const predAway = match.goalsB;
  const actualHome = Number(match.homeGoals);
  const actualAway = Number(match.awayGoals);

  const row = {
    matchId: match.id,
    date: dateIso,
    league: match.leagueDesc,
    homeTeam: match.homeTeam,
    awayTeam: match.awayTeam,
    predHome,
    predAway,
    actualHome,
    actualAway,
    prediction: match.prediction ?? null,
    outcomeCorrect: null,
    exactScore: null,
    profit: null,
    homeWinProb: match.homeWinProbability ?? null,
    drawProb: match.drawProbability ?? null,
    awayWinProb: match.awayWinProbability ?? null,
    over25Prob: match.over25Probability ?? null,
    bttsYesProb: match.bttsYesProbability ?? null,
    completeData: match.completeData ?? false,
    formSource,
    skippedReason: null,
  };

  if (!isPredictableScore(predHome, predAway)) {
    row.skippedReason =
      predHome === "x" ? "insufficient_season_games" : "no_prediction";
    return row;
  }

  const actualOutcome = getOutcome(actualHome, actualAway);
  const predictedOutcome = getOutcome(predHome, predAway);
  const isCorrectOutcome = actualOutcome === predictedOutcome;

  row.outcomeCorrect = isCorrectOutcome;
  row.exactScore = actualHome === Number(predHome) && actualAway === Number(predAway);
  row.profit = isCorrectOutcome ? getProfit(match, predictedOutcome) : 0;
  row.prediction = predictedOutcome;

  return row;
}

export function aggregateResults(rows) {
  const scored = rows.filter(
    (row) => row.skippedReason == null && row.outcomeCorrect != null
  );

  let investment = 0;
  let sumProfit = 0;
  let exactScores = 0;
  let successCount = 0;
  const byLeague = {};

  for (const row of scored) {
    investment += 1;
    const gameResult =
      row.outcomeCorrect === true ? Number(row.profit) - 1 : -1;
    sumProfit += gameResult;

    if (row.exactScore) exactScores += 1;
    if (row.outcomeCorrect) successCount += 1;

    const leagueName = row.league || "Unknown League";
    if (!byLeague[leagueName]) {
      byLeague[leagueName] = {
        totalMatches: 0,
        outcomeCorrect: 0,
        exactScores: 0,
        investment: 0,
        sumProfit: 0,
        roi: 0,
      };
    }

    const league = byLeague[leagueName];
    league.totalMatches += 1;
    league.investment += 1;
    league.sumProfit += gameResult;
    if (row.exactScore) league.exactScores += 1;
    if (row.outcomeCorrect) league.outcomeCorrect += 1;
    league.roi =
      league.investment > 0
        ? Number(((league.sumProfit / league.investment) * 100).toFixed(2))
        : 0;
  }

  const roi =
    investment > 0 ? Number(((sumProfit / investment) * 100).toFixed(2)) : 0;

  return {
    totalMatches: rows.length,
    predicted: scored.length,
    skippedNoPrediction: rows.filter((row) => row.skippedReason != null).length,
    outcomeCorrect: successCount,
    outcomeAccuracy:
      scored.length > 0
        ? Number(((successCount / scored.length) * 100).toFixed(2))
        : 0,
    exactScores,
    exactScoreRate:
      scored.length > 0
        ? Number(((exactScores / scored.length) * 100).toFixed(2))
        : 0,
    investment,
    netProfit: Number(sumProfit.toFixed(2)),
    roi,
    byLeague,
  };
}
