/** Strip score/probability outputs after a form-only calculateScore pass. */
export function clearMatchPredictionFields(match) {
  if (!match) return;
  delete match.scoreMatrix;
  match.homeWinProbability = undefined;
  match.drawProbability = undefined;
  match.awayWinProbability = undefined;
  match.bttsYesProbability = undefined;
  match.bttsNoProbability = undefined;
  match.over25Probability = undefined;
  match.under25Probability = undefined;
  match.winValue = undefined;
  match.drawValue = undefined;
  match.O25Value = undefined;
  match.BTTSValue = undefined;
  match.prediction = undefined;
}
