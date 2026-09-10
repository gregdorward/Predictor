import { predictMatchById } from "../src/logic/predictMatchById.js";

const matchId = Number(process.argv[2]);
if (!matchId) {
  console.error("Usage: node scripts/diagnose-match-predict.mjs <matchId>");
  process.exit(1);
}

const match = await predictMatchById(matchId);
const implied = (odds) => Number(((1 / Number(odds)) * 100).toFixed(2));

let homeFromMatrix = null;
let drawFromMatrix = null;
let awayFromMatrix = null;
if (match.scoreMatrix?.length) {
  let hw = 0;
  let dr = 0;
  let aw = 0;
  for (const { home, away, probability } of match.scoreMatrix) {
    if (home > away) hw += probability;
    else if (home === away) dr += probability;
    else aw += probability;
  }
  homeFromMatrix = Number((hw * 100).toFixed(2));
  drawFromMatrix = Number((dr * 100).toFixed(2));
  awayFromMatrix = Number((aw * 100).toFixed(2));
}

console.log(
  JSON.stringify(
    {
      match: match.game,
      scoreline: `${match.goalsA}-${match.goalsB}`,
      prediction: match.prediction,
      winValue: match.winValue,
      storedProbs: {
        home: match.homeWinProbability,
        draw: match.drawProbability,
        away: match.awayWinProbability,
      },
      matrixProbs: {
        home: homeFromMatrix,
        draw: drawFromMatrix,
        away: awayFromMatrix,
      },
      edgeFromStored: {
        home: Number((match.homeWinProbability - implied(match.homeOdds)).toFixed(2)),
      },
      edgeFromMatrix: homeFromMatrix
        ? {
            home: Number((homeFromMatrix - implied(match.homeOdds)).toFixed(2)),
          }
        : null,
      bttsYes: match.bttsYesProbability,
      bttsNo: match.bttsNoProbability,
      over25: match.over25Probability,
      lambdas: {
        home: match.formHome?.teamGoalsCalc,
        away: match.formAway?.teamGoalsCalc,
      },
    },
    null,
    2
  )
);
