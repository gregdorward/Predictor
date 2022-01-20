import React, { Fragment } from "react";
import ReactDOM from "react-dom";
import { matches, diff } from "./getFixtures";
import { Fixture } from "../components/Fixture";
import { selectedOption } from "../components/radio";
import Div from "../components/Div";
import Collapsable from "../components/CollapsableElement";
import { allForm } from "../logic/getFixtures";
import Increment from "../components/Increment";
import { incrementValue } from "../components/Increment";
import { getBTTSPotential } from "../logic/getBTTSPotential";

var myHeaders = new Headers();
myHeaders.append("Origin", "https://gregdorward.github.io");

let finalHomeGoals;
let finalAwayGoals;
let rawFinalHomeGoals;
let rawFinalAwayGoals;
let homeOdds;
let awayOdds;
let totalGoals = 0;
let totalGoals2 = 0;
let numberOfGames = 0;
let drawPredictions = 0;
let homePredictions = 0;
let awayPredictions = 0;
let allOutcomes = 0;
let drawOutcomes = 0;
let homeOutcomes = 0;
let awayOutcomes = 0;
let winAmount = 0;
let lossAmount = 0;
let sumStatDAWin = 0;
let sumStatDALoss = 0;
let sumStatPossessionWin = 0;
let sumStatPossessionLoss = 0;
let sumStatSOTWin = 0;
let sumStatSOTLoss = 0;
let sumStatPPGLast10Win = 0;
let sumStatPPGLast10Loss = 0;
let sumOddsWin = 0;
let sumOddsLoss = 0;
let sumXGForWin = 0;
let sumXGForLoss = 0;
let sumXGAgainstWin = 0;
let sumXGAgainstLoss = 0;
let allWinOutcomes = 0;
let allLossOutcomes = 0;
let allDrawOutcomes = 0;
let winDAAverage;
let lossDAAverage;
let winOddsAverage;
let lossOddsAverage;
let winPossessionAverage;
let lossPossessionAverage;
let winLast10PPGAverage;
let lossLast10PPGAverage;
let winSOTAverage;
let lossSOTAverage;
let winXGForAverage;
let lossXGForAverage;
let winXGAgainstAverage;
let lossXGAgainstAverage;

export var renderPredictions;

export function getPointsFromLastX(lastX) {
  let points = 0;
  let pointsAddition;

  lastX.forEach((game) => {
    switch (true) {
      case game === "W":
        pointsAddition = 3;
        break;
      case game === "D":
        pointsAddition = 1;
        break;
      case game === "L":
        pointsAddition = 0;
        break;
      default:
        break;
    }

    points = points + pointsAddition;
  });
  return points;
}

async function compareStat(statOne, statTwo) {
  let stat1 = parseFloat(statOne);
  let stat2 = parseFloat(statTwo);
  let result;
  let gap;
  let statOneNotZero = stat1 + 0.1;
  let statTwoNotZero = stat2 + 0.1;

  if (stat1 > stat2) {
    gap = await diff(statOneNotZero, statTwoNotZero);
  } else if (stat1 < stat2) {
    gap = await diff(statTwoNotZero, statOneNotZero);
  } else {
    gap = 0;
  }

  if (gap > 2.25) {
    switch (true) {
      case stat1 === stat2:
        result = 0;
        break;
      case stat1 > stat2:
        result = 1;
        break;
      case stat1 < stat2:
        result = -1;
        break;
      default:
        break;
    }
  } else {
    result = 0;
  }

  return result;
}

async function getOverOrUnderAchievingResult(index, overUnderAchievingSum) {
  let result;
  let correction;

  switch (true) {
    case index === 0:
      switch (true) {
        case overUnderAchievingSum <= -1.2:
          result = "Overachieving drastically";
          correction = -0.4;
          break;
        case overUnderAchievingSum < -0.45 && overUnderAchievingSum > -1.2:
          result = "Overachieving";
          correction = -0.2;
          break;
        case overUnderAchievingSum < -0.1 && overUnderAchievingSum >= -0.45:
          result = "Overachieving slightly";
          correction = -0.1;
          break;
        case overUnderAchievingSum > 0.1 && overUnderAchievingSum <= 0.45:
          result = "Underachieving slightly";
          correction = 0.1;
          break;
        case overUnderAchievingSum > 0.45 && overUnderAchievingSum < 1.2:
          result = "Underachieving";
          correction = 0.2;
          break;
        case overUnderAchievingSum >= 1.2:
          result = "Underachieving drastically";
          correction = 0.4;
          break;
        default:
          result = "onPar";
          correction = 0;
          break;
      }

      break;

    case index === 1:
      switch (true) {
        case overUnderAchievingSum <= -0.9:
          result = "Overachieving drastically";
          correction = -0.4;
          break;
        case overUnderAchievingSum < -0.45 && overUnderAchievingSum > -0.9:
          result = "Overachieving";
          correction = -0.2;
          break;
        case overUnderAchievingSum < -0.1 && overUnderAchievingSum >= -0.45:
          result = "Overachieving slightly";
          correction = -0.1;
          break;
        case overUnderAchievingSum > 0.1 && overUnderAchievingSum <= 0.45:
          result = "Underachieving slightly";
          correction = 0.1;
          break;
        case overUnderAchievingSum > 0.45 && overUnderAchievingSum < 0.9:
          result = "Underachieving";
          correction = 0.2;
          break;
        case overUnderAchievingSum >= 0.9:
          result = "Underachieving drastically";
          correction = 0.4;
          break;
        default:
          result = "onPar";
          correction = 0;
          break;
      }

      break;

    case index === 2:
      switch (true) {
        case overUnderAchievingSum <= -1:
          result = "Overachieving drastically";
          correction = -0.4;
          break;
        case overUnderAchievingSum < -0.45 && overUnderAchievingSum > -1:
          result = "Overachieving";
          correction = -0.2;
          break;
        case overUnderAchievingSum < -0.2 && overUnderAchievingSum >= -0.45:
          result = "Overachieving slightly";
          correction = -0.1;
          break;
        case overUnderAchievingSum > 0.2 && overUnderAchievingSum <= 0.45:
          result = "Underachieving slightly";
          correction = 0.1;
          break;
        case overUnderAchievingSum > 0.45 && overUnderAchievingSum < 1:
          result = "Underachieving";
          correction = 0.2;
          break;
        case overUnderAchievingSum >= 1:
          result = "Underachieving drastically";
          correction = 0.4;
          break;
        default:
          result = "onPar";
          correction = 0;
          break;
      }

      break;
    default:
      break;
  }
  return [result, correction];
}

async function getClinicalRating(form) {
  let rating;
  let score;
  switch (true) {
    case form.dangerousAttackConversion <= 15:
      rating = "excellent";
      score = 0.8;
      break;

    case form.dangerousAttackConversion > 15 &&
      form.dangerousAttackConversion <= 20:
      rating = "great";
      score = 0.9;
      break;

    case form.dangerousAttackConversion > 20 &&
      form.dangerousAttackConversion <= 25:
      rating = "very good";
      score = 0.95;
      break;

    case form.dangerousAttackConversion > 25 &&
      form.dangerousAttackConversion <= 32.5:
      rating = "good";
      score = 0.98;
      break;

    case form.dangerousAttackConversion > 30 &&
      form.dangerousAttackConversion <= 35:
      rating = "above average";
      score = 0.99;
      break;

    case form.dangerousAttackConversion > 35 &&
      form.dangerousAttackConversion <= 40:
      rating = "average";
      score = 1;
      break;

    case form.dangerousAttackConversion > 40 &&
      form.dangerousAttackConversion <= 45:
      rating = "below average";
      score = 1.01;
      break;

    case form.dangerousAttackConversion > 45 &&
      form.dangerousAttackConversion <= 50:
      rating = "poor";
      score = 1.05;
      break;

    case form.dangerousAttackConversion > 50 &&
      form.dangerousAttackConversion <= 55:
      rating = "very poor";
      score = 1.1;
      break;

    case form.dangerousAttackConversion > 55 &&
      form.dangerousAttackConversion <= 60:
      rating = "terrible";
      score = 1.2;
      break;

    case form.dangerousAttackConversion > 60:
      rating = "awful";
      score = 1.3;
      break;

    default:
      break;
  }

  return [rating, score];
}

async function getPointsDifferential(pointsHomeAvg, pointsAwayAvg) {
  const differential = await diff(pointsHomeAvg, pointsAwayAvg);
  return differential;
}

async function getPointWeighting(pointsDiff) {
  let pointsDiffWeightingHome;
  let pointsDiffWeightingAway;

  switch (true) {
    case pointsDiff >= 2.5:
      pointsDiffWeightingHome = 0.6;
      pointsDiffWeightingAway = -0.1;
      break;
    case pointsDiff >= 2 && pointsDiff < 2.5:
      pointsDiffWeightingHome = 0.4;
      pointsDiffWeightingAway = -0.1;
      break;
    case pointsDiff >= 1.5 && pointsDiff < 2:
      pointsDiffWeightingHome = 0.3;
      pointsDiffWeightingAway = -0.1;
      break;
    case pointsDiff >= 1 && pointsDiff < 1.5:
      pointsDiffWeightingHome = 0.2;
      pointsDiffWeightingAway = 0;
      break;
    case pointsDiff >= 0.5 && pointsDiff < 1:
      pointsDiffWeightingHome = 0.1;
      pointsDiffWeightingAway = 0;
      break;
    case pointsDiff > -0.5 && pointsDiff < 0.5:
      pointsDiffWeightingHome = 0;
      pointsDiffWeightingAway = 0;
      break;
    case pointsDiff <= -0.5 && pointsDiff > -1:
      pointsDiffWeightingHome = 0;
      pointsDiffWeightingAway = 0.1;
      break;
    case pointsDiff <= -1 && pointsDiff > -1.5:
      pointsDiffWeightingHome = 0;
      pointsDiffWeightingAway = 0.2;
      break;
    case pointsDiff <= -1.5 && pointsDiff > -2:
      pointsDiffWeightingHome = -0.1;
      pointsDiffWeightingAway = 0.3;
      break;
    case pointsDiff <= -2 && pointsDiff > -2.5:
      pointsDiffWeightingHome = -0.1;
      pointsDiffWeightingAway = 0.4;
      break;
    case pointsDiff <= -2.5:
      pointsDiffWeightingHome = -0.1;
      pointsDiffWeightingAway = 0.6;
      break;
    default:
      pointsDiffWeightingHome = 0;
      pointsDiffWeightingAway = 0;
  }
  return [pointsDiffWeightingHome, pointsDiffWeightingAway];
}

async function getDAPrediction(odds) {
  let multiplier;
  switch (true) {
    case odds <= 1.1:
      multiplier = 1.5;
      break;
    case odds <= 1.2 && odds > 1.1:
      multiplier = 1.4;
      break;
    case odds <= 1.4 && odds > 1.2:
      multiplier = 1.3;
      break;
    case odds <= 1.6 && odds > 1.4:
      multiplier = 1.2;
      break;
    case odds <= 1.8 && odds > 1.6:
      multiplier = 1.1;
      break;
    case odds <= 2 && odds > 1.8:
      multiplier = 1;
      break;
    case odds <= 2.2 && odds > 2:
      multiplier = 1;
      break;
    case odds <= 3 && odds > 2.2:
      multiplier = 1;
      break;
    case odds <= 3.5 && odds > 3:
      multiplier = 0.9;
      break;
    case odds <= 4 && odds > 3.5:
      multiplier = 0.8;
      break;
    case odds <= 5 && odds > 4:
      multiplier = 0.7;
      break;
    case odds <= 6 && odds > 5:
      multiplier = 0.6;
      break;
    case odds <= 8 && odds > 6:
      multiplier = 0.5;
      break;
    case odds > 8:
      multiplier = 0.4;
      break;
    default:
      break;
  }
  return multiplier;
}

async function getAttackingIntent(possession, sot) {
  let score = possession / sot;
  let finalScore;

  switch (true) {
    case score > 20:
      finalScore = "Very cautious";
      break;
    case score >= 10 && score <= 20:
      finalScore = "Cautious";
      break;
    case score < 10:
      finalScore = "Direct";
      break;
    default:
      break;
  }
  return finalScore;
}

//Calculates scores based on prior XG figures, weighted by odds
export async function calculateScore(match, index, divider, id) {
  let homeRaw;
  let awayRaw;

  let teams;
  let calculate = true;

  if (
    allForm.find(
      (game) =>
        game.home.teamName === match.homeTeam &&
        game.away.teamName === match.awayTeam
    )
  ) {
    teams = [
      allForm.find((game) => game.home.teamName === match.homeTeam).home,
      allForm.find((game) => game.away.teamName === match.awayTeam).away,
    ];
  } else {
    calculate = false;
  }

  let formHome;
  let formAway;

  if (calculate) {
    for (let i = 0; i < teams.length; i++) {
      if (teams[0][index].PlayedHome <= 1 || teams[1][index].PlayedAway <= 1) {
        index = 2;
        divider = 10;
      }

      teams[i][index].lastGame = teams[i][index].LastFiveForm[4];
      teams[i][index].previousToLastGame = teams[i][index].LastFiveForm[3];

      let last2 = [
        teams[i][index].lastGame,
        teams[i][index].previousToLastGame,
      ];
      let last3 = [
        teams[i][index].lastGame,
        teams[i][index].previousToLastGame,
        teams[i][index].LastFiveForm[2],
      ];

      teams[i][index].last5Points = getPointsFromLastX(
        teams[i][index].LastFiveForm
      );

      teams[i][index].last6Points = getPointsFromLastX(
        teams[i][index].LastSixForm
      );

      teams[i][index].last10Points = getPointsFromLastX(
        teams[i][index].LastTenForm
      );

      teams[i][index].last3Points = getPointsFromLastX(last3);

      teams[i][index].last2Points = getPointsFromLastX(last2);

      async function getPointAverage(pointTotal, games) {
        return pointTotal / games;
      }

      teams[i][index].twoGameAverage = await getPointAverage(
        teams[i][index].last2Points,
        2
      );
      teams[i][index].threeGameAverage = await getPointAverage(
        teams[i][index].last3Points,
        3
      );
      teams[i][index].fiveGameAverage = await getPointAverage(
        teams[i][index].last5Points,
        5
      );
      teams[i][index].sixGameAverage = await getPointAverage(
        teams[i][index].last6Points,
        6
      );
      teams[i][index].tenGameAverage = await getPointAverage(
        teams[i][index].last10Points,
        10
      );

      teams[i][index].AttackingIntentScore = await getAttackingIntent(
        teams[i][index].AveragePossession,
        teams[i][index].AverageShotsOnTarget
      );

      async function compareFormTrend(
        three,
        five,
        six,
        ten,
        lastGame,
        recent,
        distant
      ) {
        let text;
        let score;
        let improving;
        let declining;
        if (five >= 2.5) {
          switch (true) {
            case five > ten:
              text = "Outstanding and improving";
              score = 12.5;
              break;
            case five === ten:
              text = "Outstanding and consistent";
              score = 12;
              break;
            case five < ten:
              text = "Consistently outstanding";
              score = 11;
              break;
            default:
              break;
          }
        } else if (five < 2.5 && five >= 2) {
          switch (true) {
            case five > ten:
              text = "Very good and improving";
              score = 10.5;
              break;
            case five === ten:
              text = "Very good and consistent";
              score = 10;
              break;
            case five < ten:
              text = "Very good but slightly worsening";
              score = 9;
              break;
            default:
              break;
          }
        } else if (five < 2 && five >= 1.5) {
          switch (true) {
            case five > ten:
              text = "Good and improving";
              score = 8.5;
              break;
            case five === ten:
              text = "Good and consistent";
              score = 8;
              break;
            case five < ten:
              text = "Good but slightly worsening";
              score = 7;
              break;
            default:
              break;
          }
          if (five + 1 < ten) {
            score = score - 2;
          }
        } else if (five < 1.5 && five >= 1) {
          switch (true) {
            case five > ten:
              text = "Average and improving";
              score = 6.5;
              break;
            case five === ten:
              text = "Average and consistent";
              score = 6;
              break;
            case five < ten:
              text = "Average but slightly worsening";
              score = 5;
              break;
            default:
              break;
          }
          if (five + 1 < ten) {
            score = score - 2;
          }
        } else if (five < 1 && five >= 0.5) {
          switch (true) {
            case five > ten:
              text = "Poor but improving";
              score = 4.5;
              break;
            case five === ten:
              text = "Poor and consistent";
              score = 4;
              break;
            case five < ten:
              text = "Poor and slightly worsening";
              score = 3;
              break;
            default:
              break;
          }
          if (five + 1 < ten) {
            score = score - 2;
          }
        } else if (five < 0.5) {
          switch (true) {
            case five > ten:
              text = "Terrible but slightly improving";
              score = 2.5;
              break;
            case five === ten:
              text = "Consistently terrible";
              score = 2;
              break;
            case five < ten:
              text = "Terrible and worsening";
              score = 1;
              break;
            default:
              break;
          }
          if (five + 1 < ten) {
            score = 1;
          }
        }

        if (five > 1) {
          if (three >= six && six >= ten) {
            improving = true;
          } else if (recent < distant) {
            improving = false;
          } else if (recent - 1 > distant) {
            improving = true;
          } else {
            improving = false;
          }
        }

        // if (lastGame === "L") {
        //   score = score - 1;
        // } else if (lastGame === "W") {
        //   score = score + 1;
        // }

        return [score, improving];
      }
      teams[i][index].ScoredAverageShortTerm = teams[i][0].ScoredOverall / 5;
      teams[i][index].ScoredAverageShortTermHomeOrAway =
        teams[i][1].ScoredAverage;
      teams[i][index].ConcededAverageShortTerm =
        teams[i][0].ConcededOverall / 5;
      teams[i][index].ConcededAverageShortTermHomeOrAway =
        teams[i][1].ConcededAverage;

      teams[i][index].longTermAverageGoals = teams[i][2].ScoredAverage;
      teams[i][index].longTermAverageConceeded = teams[i][2].ConcededAverage;

      let recentGoalDiff =
        teams[i][index].ScoredAverageShortTerm -
        teams[i][index].ConcededAverageShortTerm;
      let distantGoalDiff =
        teams[i][index].longTermAverageGoals -
        teams[i][index].longTermAverageConceeded;

      [teams[i][index].formTrendScore, teams[i][index].improving] =
        await compareFormTrend(
          teams[i][index].threeGameAverage,
          teams[i][index].fiveGameAverage,
          teams[i][index].sixGameAverage,
          teams[i][index].tenGameAverage,
          teams[i][index].lastGame,
          recentGoalDiff,
          distantGoalDiff
        );

      teams[i][index].expectedGoals = parseFloat(teams[i][index].XG);
      teams[i][index].expectedGoalsConceeded = parseFloat(
        teams[i][index].XGAgainstAverage
      );

      teams[i][index].expectedGoalsLongTerm = parseFloat(teams[i][2].XG);

      teams[i][index].expectedConceededGoalsLongTerm = parseFloat(
        teams[i][index].XGAgainstAverage
      );

      teams[i][index].ScoredAverageShortAndLongTerm =
        (teams[i][index].ScoredOverall / 10 +
          teams[i][index].ScoredAverageShortTerm) /
        2;

      teams[i][index].expectedGoalsShortAndLongTerm =
        (teams[i][index].expectedGoalsLongTerm +
          teams[i][index].expectedGoals) /
        2;

      teams[i][index].conceededAverageShortAndLongTerm =
        (teams[i][index].ConcededOverall / 10 +
          teams[i][index].ConcededAverageShortTerm) /
        2;

      teams[i][index].finishingScore = parseFloat(
        teams[i][index].XG - teams[i][index].ScoredAverage
      );

      teams[i][index].goalieRating = parseFloat(
        teams[i][index].ConcededAverage - teams[i][index].XGAgainstAverage
      );

      teams[i][index].defenceScore = parseInt(
        teams[i][index].CleanSheetPercentage
      );

      let defenceScore;
      defenceScore = teams[i][index].defenceScore;

      switch (true) {
        case defenceScore === 0:
          teams[i][index].defenceRating = 1.05;
          break;
        case defenceScore > 0 && defenceScore < 20:
          teams[i][index].defenceRating = 1;
          break;
        case defenceScore >= 20 && defenceScore < 30:
          teams[i][index].defenceRating = 1;
          break;
        case defenceScore >= 30 && defenceScore < 40:
          teams[i][index].defenceRating = 1;
          break;
        case defenceScore >= 40 && defenceScore < 50:
          teams[i][index].defenceRating = 0.95;
          break;
        case defenceScore >= 50 && defenceScore < 60:
          teams[i][index].defenceRating = 0.9;
          break;
        case defenceScore >= 60 && defenceScore < 70:
          teams[i][index].defenceRating = 0.8;
          break;
        case defenceScore >= 70 && defenceScore < 80:
          teams[i][index].defenceRating = 0.75;
          break;
        case defenceScore >= 80:
          teams[i][index].defenceRating = 0.6;
          break;
        default:
          break;
      }

      let goalOverOrUnderAchieving = parseFloat(
        await diff(teams[i][index].finishingScore, 0)
      );

      let concededOverOrUnderAchieving = parseFloat(
        await diff(teams[i][index].goalieRating, 0)
      );

      teams[i][index].overUnderAchievingSumAttack = goalOverOrUnderAchieving;

      teams[i][index].overUnderAchievingSumDefence =
        concededOverOrUnderAchieving;

      teams[i][index].overUnderAchievingSum = (
        goalOverOrUnderAchieving + concededOverOrUnderAchieving
      ).toFixed(2);

      teams[i][index].forecastedXG = parseFloat(teams[i][index].ScoredAverage);

      teams[i][index].forecastedXGConceded = parseFloat(
        teams[i][index].ConcededAverage
      );

      teams[0][index].goalsBasedOnAverages = parseFloat(
        (teams[0][index].forecastedXG + teams[1][index].forecastedXGConceded) /
          2
      );

      teams[1][index].goalsBasedOnAverages = parseFloat(
        (teams[1][index].forecastedXG + teams[0][index].forecastedXGConceded) /
          2
      );

      teams[i][index].XGdifferential =
        teams[i][index].XG - teams[i][index].XGAgainstAverage;

      // teams[i][index].attackPotency =
      //   teams[i][index].AverageShotsOnTargetOverall /
      //   teams[i][index].ScoredAverage;

      teams[0][index].DAmultiplier = await getDAPrediction(match.homeOdds);
      teams[1][index].DAmultiplier = await getDAPrediction(match.awayOdds);

      switch (true) {
        case teams[i][index].XGdifferential > 1:
          teams[i][index].XGWeighting = 6;
          break;
        case teams[i][index].XGdifferential <= 1 &&
          teams[i][index].XGdifferential > 0.5:
          teams[i][index].XGWeighting = 5;
          break;
        case teams[i][index].XGdifferential <= 0.5 &&
          teams[i][index].XGdifferential > 0:
          teams[i][index].XGWeighting = 4;
          break;
        case teams[i][index].XGdifferential >= -0.5 &&
          teams[i][index].XGdifferential < 0:
          teams[i][index].XGWeighting = 3;
          break;
        case teams[i][index].XGdifferential >= -1 &&
          teams[i][index].XGdifferential < -0.5:
          teams[i][index].XGWeighting = 2;
          break;
        case teams[i][index].XGdifferential < -1:
          teams[i][index].XGWeighting = 1;
          break;
        default:
          teams[i][index].XGWeighting = 1;
          break;
      }
    }

    homeOdds = match.homeOdds;
    awayOdds = match.awayOdds;

    if (
      (match.homeOdds === 0 && match.awayOdds === 0) ||
      (match.homeOdds === "N/A" && match.awayOdds === "N/A")
    ) {
      homeRaw = 1.0;
      awayRaw = 1.0;
    } else {
      homeRaw = (1 / match.homeOdds).toFixed(2);
      awayRaw = (1 / match.awayOdds).toFixed(2);
    }

    formHome = teams[0][index];
    formAway = teams[1][index];
    let homePosition;
    let awayPosition;

    let homePositionHomeOnly;
    let awayPositionAwayOnly;

    [formHome.overOrUnderAttack, formHome.trueFormAttack] =
      await getOverOrUnderAchievingResult(
        index,
        formHome.overUnderAchievingSumAttack
      );

    [formHome.overOrUnderDefence, formHome.trueFormDefence] =
      await getOverOrUnderAchievingResult(
        index,
        formHome.overUnderAchievingSumDefence
      );

    [formAway.overOrUnderAttack, formAway.trueFormAttack] =
      await getOverOrUnderAchievingResult(
        index,
        formAway.overUnderAchievingSumAttack
      );

    [formAway.overOrUnderDefence, formAway.trueFormDefence] =
      await getOverOrUnderAchievingResult(
        index,
        formAway.overUnderAchievingSumDefence
      );

    let homeTenGameAvg = formHome.last10Points / 10;
    let awayTenGameAvg = formAway.last10Points / 10;

    let homeFiveGameAvg = formHome.last5Points / 5;
    let awayFiveGameAvg = formAway.last5Points / 5;

    let homeThreeGameAvg = formHome.last3Points / 3;
    let awayThreeGameAvg = formAway.last3Points / 3;

    let homeTwoGameAvg = formHome.last2Points / 2;
    let awayTwoGameAvg = formAway.last2Points / 2;

    //can update this for last 10
    let pointsDiff = await getPointsDifferential(
      homeFiveGameAvg,
      awayFiveGameAvg
    );

    let pointsDiff3 = await getPointsDifferential(
      homeThreeGameAvg,
      awayThreeGameAvg
    );

    let pointsDiff2 = await getPointsDifferential(
      homeTwoGameAvg,
      awayTwoGameAvg
    );

    let pointsDiff10 = await getPointsDifferential(
      homeTenGameAvg,
      awayTenGameAvg
    );

    let [last10WeightingHome, last10WeightingAway] = await getPointWeighting(
      pointsDiff10
    );

    let [last5WeightingHome, last5WeightingAway] = await getPointWeighting(
      pointsDiff
    );

    let [last3WeightingHome, last3WeightingAway] = await getPointWeighting(
      pointsDiff3
    );

    let [last2WeightingHome, last2WeightingAway] = await getPointWeighting(
      pointsDiff2
    );

    formHome.dangerousAttackConversion =
      formHome.AverageDangerousAttacks / formHome.ScoredAverageShortAndLongTerm;
    formAway.dangerousAttackConversion =
      formAway.AverageDangerousAttacks / formAway.ScoredAverageShortAndLongTerm;

    formHome.goalsPerDangerousAttack =
      formHome.ScoredAverageShortAndLongTerm / formHome.AverageDangerousAttacks;
    formAway.goalsPerDangerousAttack =
      formAway.ScoredAverageShortAndLongTerm / formAway.AverageDangerousAttacks;

    [formHome.clinicalRating, formHome.clinicalScore] = await getClinicalRating(
      formHome
    );
    [formAway.clinicalRating, formAway.clinicalScore] = await getClinicalRating(
      formAway
    );

    let oddsWeightingHome;
    let oddsWeightingAway;
    let homeWeighting;
    let awayWeighting;

    let weightingSplitHome;
    let weightingSplitAway;
    let weighting;

    if (homeRaw > 0) {
      oddsWeightingHome = homeRaw - awayRaw;
      oddsWeightingAway = awayRaw - homeRaw;

      weighting = await diff(oddsWeightingHome, oddsWeightingAway);

      if (weighting >= 0) {
        weightingSplitHome = Math.abs(weighting) / 2;
        weightingSplitAway = -Math.abs(weighting) / 2;
      } else if (weighting < 0) {
        weightingSplitHome = -Math.abs(weighting) / 2;
        weightingSplitAway = Math.abs(weighting) / 2;
      } else {
        weightingSplitHome = 1;
        weightingSplitAway = 1;
      }
    } else {
      weightingSplitHome = 1;
      weightingSplitAway = 1;
    }

    homeWeighting = weightingSplitHome * 0.5;
    awayWeighting = weightingSplitAway * 0.5;

    let homeCalculation;
    let awayCalculation;

    if (
      typeof formHome.homeTeamHomePositionRaw === "number" &&
      typeof formAway.awayTeamAwayPositionRaw === "number"
    ) {
      homePositionHomeOnly = parseFloat(formHome.homeTeamHomePositionRaw);
      awayPositionAwayOnly = parseFloat(formAway.awayTeamAwayPositionRaw);
      homePosition = parseFloat(formHome.homeRawPosition);
      awayPosition = parseFloat(formAway.awayRawPosition);
    }

    console.log(match.game);
    console.log(`homePositionHomeOnly ${homePositionHomeOnly}`);
    console.log(`homePosition ${homePosition}`);
    console.log(`awayPositionHomeOnly ${awayPositionAwayOnly}`);
    console.log(`awayPosition ${awayPosition}`);

    if (homeWeighting > 0.25) {
      homeCalculation = 1.15;
      awayCalculation = 0.85;
    } else if (homeWeighting < -0.25) {
      homeCalculation = 0.15;
      awayCalculation = 1.85;
    } else {
      homeCalculation = parseFloat(1 + homeWeighting);
      awayCalculation = parseFloat(1 + awayWeighting);
    }

    formHome.AttackingPotency = (formHome.XG / formHome.AttacksHome) * 100;

    formAway.AttackingPotency = (formAway.XG / formAway.AttacksAverage) * 100;

    async function compareTeams(homeForm, awayForm, teamName, match) {
      console.log("sotComparison");
      let sotComparison = await compareStat(
        homeForm.AverageShotsOnTarget * 10,
        awayForm.AverageShotsOnTarget * 10
      );

      let goalsForComparison = await compareStat(
        homeForm.ScoredAverage * 2,
        awayForm.ScoredAverage * 2
      );

      let goalsAgainstComparison = await compareStat(
        awayForm.ConcededAverage * 2,
        homeForm.ConcededAverage * 2
      );

      let dangerousAttacksComparison = await compareStat(
        homeForm.AverageDangerousAttacks / 5,
        awayForm.AverageDangerousAttacks / 5
      );

      let XGdifferentialComparison = await compareStat(
        homeForm.XGWeighting * 10,
        awayForm.XGWeighting * 10
      );

      let overUnderAchievingSumComparison = await compareStat(
        homeForm.overUnderAchievingSum * 2,
        awayForm.overUnderAchievingSum * 2
      );

      let formTrendScoreComparison = await compareStat(
        homeForm.formTrendScore,
        awayForm.formTrendScore
      );

      let last10PointsComparison = await compareStat(
        homeForm.last10Points / 2,
        awayForm.last10Points / 2
      );

      let twoGameAverageComparison = await compareStat(
        homeForm.twoGameAverage * 5,
        awayForm.twoGameAverage * 5
      );

      let fiveGameAverageComparison = await compareStat(
        homeForm.fiveGameAverage * 5,
        awayForm.fiveGameAverage * 5
      );

      let sixGameAverageComparison = await compareStat(
        homeForm.sixGameAverage * 5,
        awayForm.sixGameAverage * 5
      );

      let tenGameAverageComparison = await compareStat(
        homeForm.tenGameAverage * 5,
        awayForm.tenGameAverage * 5
      );

      let seasonPPGComparison;
      if (homeForm.SeasonPPG !== "N/A" && awayForm.SeasonPPG !== "N/A") {
        seasonPPGComparison = await compareStat(
          parseFloat(homeForm.SeasonPPG) * 4,
          parseFloat(awayForm.SeasonPPG) * 4
        );
      } else seasonPPGComparison = last10PointsComparison;

      let attackingPotencyComparison = await compareStat(
        homeForm.AttackingPotency * 5,
        awayForm.AttackingPotency * 5
      );

      let AveragePossessionComparison = await compareStat(
        homeForm.AveragePossession / 5,
        awayForm.AveragePossession / 5
      );

      let clinicalScoreComparison = await compareStat(
        formHome.clinicalScore * 10,
        formAway.clinicalScore * 10
      );

      let positionComparison;
      if (
        awayPositionAwayOnly !== undefined &&
        homePositionHomeOnly !== undefined
      ) {
        positionComparison = await compareStat(
          (awayPositionAwayOnly + awayPosition) * 2,
          (homePositionHomeOnly + homePosition) * 2
        );
      } else {
        positionComparison = await compareStat(
          homeForm.tenGameAverage * 5,
          awayForm.tenGameAverage * 5
        );
      }

      let winPercentageComparison = await compareStat(
        match.homeTeamWinPercentage / 7.5,
        match.awayTeamWinPercentage / 7.5
      );

      let calculation =
        formTrendScoreComparison * 2 +
        twoGameAverageComparison * 0 +
        sixGameAverageComparison * 0 +
        fiveGameAverageComparison * 0 +
        dangerousAttacksComparison * 0 +
        XGdifferentialComparison * 1 +
        sotComparison * 1 +
        attackingPotencyComparison * 0 +
        seasonPPGComparison * 0 +
        tenGameAverageComparison * 0 +
        AveragePossessionComparison * 0 +
        positionComparison * 4 +
        winPercentageComparison * 3;
      return calculation;
    }

    let teamComparisonScore =
      (await compareTeams(formHome, formAway, match.homeTeam, match)) / 18;
    match.teamComparisonScore = teamComparisonScore;

    let finalHomeGoals;
    let finalAwayGoals;

    async function roundCustom(num, form, otherTeamForm) {
      // if(form.ScoredAverageShortTerm >= num){
      //   num = num + 0.25
      // } else {
      //   num = num - 0.25
      // }
      let wholeNumber = Math.floor(num);
      let remainder = num - wholeNumber;

      // if (form.clinicalScore === 1.3) {
      //   num = num - 0.25;
      // } else if (form.clinicalScore === 0.8) {
      //   num = num + 0.25;
      // }

      if (wholeNumber !== 0) {
        if (remainder > 0.9) {
          return Math.ceil(num);
        } else {
          return Math.floor(num);
        }
      } else if (wholeNumber === 0) {
        if (remainder > 0.9) {
          return Math.ceil(num);
        } else {
          return Math.floor(num);
        }
      } else {
        return Math.floor(num);
      }
    }

    const homeGoalDiff =
      formHome.ScoredAverageShortAndLongTerm -
      formHome.conceededAverageShortAndLongTerm;
    const awayGoalDiff =
      formAway.ScoredAverageShortAndLongTerm -
      formAway.conceededAverageShortAndLongTerm;

    formHome.goalsDifferential =
      parseFloat(await diff(homeGoalDiff, awayGoalDiff)) / 1;
    formAway.goalsDifferential =
      parseFloat(await diff(awayGoalDiff, homeGoalDiff)) / 1;

    let goalCalcHomeOnly =
      (formHome.ScoredAverageShortTermHomeOrAway +
        formAway.ConcededAverageShortTermHomeOrAway) /
      2;
    let goalCalcAwayOnly =
      (formAway.ScoredAverageShortTermHomeOrAway +
        formHome.ConcededAverageShortTermHomeOrAway) /
      2;

    let goalCalcHomeShortTerm =
      (formHome.ScoredAverageShortTerm + formAway.ConcededAverageShortTerm) / 2;
    let goalCalcAwayShortTerm =
      (formAway.ScoredAverageShortTerm + formHome.ConcededAverageShortTerm) / 2;

    let goalCalcHomeShortAndLongTerm =
      (formHome.ScoredAverageShortAndLongTerm +
        formAway.conceededAverageShortAndLongTerm) /
      2;
    let goalCalcAwayShortAndLongTerm =
      (formAway.ScoredAverageShortAndLongTerm +
        formHome.conceededAverageShortAndLongTerm) /
      2;

    let factorOneHome =
      (goalCalcHomeShortTerm * 0 +
        goalCalcHomeShortAndLongTerm * 2 +
        goalCalcHomeOnly * 0 +
        formAway.expectedConceededGoalsLongTerm +
        formHome.expectedGoalsLongTerm +
        formAway.ConcededAverageShortTerm * 1 +
        // last5WeightingHome * 1 +
        // last2WeightingHome * 1 +
        last10WeightingHome * 1 +
        formHome.goalsDifferential * 0) /
      5;

    console.log(match.game);
    console.log(formHome);
    console.log(formAway);

    console.log(match);

    console.log(
      `${goalCalcHomeShortTerm} goalCalcHomeShortTerm
        ${goalCalcHomeShortAndLongTerm} goalCalcHomeShortAndLongTerm 
        ${formAway.expectedConceededGoalsLongTerm} formAway.expectedConceededGoalsLongTerm 
        ${last5WeightingHome} last5WeightingHome 
        ${last2WeightingHome} last2WeightingHome
        `
    );
    let factorOneAway =
      (goalCalcAwayShortTerm * 0 +
        goalCalcAwayShortAndLongTerm * 2 +
        goalCalcAwayOnly * 0 +
        formHome.expectedConceededGoalsLongTerm +
        formAway.expectedGoalsLongTerm +
        formHome.ConcededAverageShortTerm * 1 +
        // last5WeightingAway * 1 +
        // last2WeightingAway * 1 +
        last10WeightingAway * 1 +
        formAway.goalsDifferential * 0) /
      5;

    console.log(
      `${goalCalcAwayShortTerm} goalCalcAwayShortTerm
        ${goalCalcAwayShortAndLongTerm} goalCalcAwayShortAndLongTerm 
        ${formHome.expectedConceededGoalsLongTerm} formHome.expectedConceededGoalsLongTerm 
        ${goalCalcAwayOnly} goalCalcAwayOnly
        ${last5WeightingAway} last5WeightingAway 
        ${last2WeightingAway} last2WeightingAway
        `
    );

    let homeComparisonWeighting;
    let awayComparisonWeighting;
    match.scoreDiff = await diff(factorOneHome, factorOneAway);
    let split = match.scoreDiff / 2;

    // switch (true) {
    //   case teamComparisonScore === 0 && match.scoreDiff > 0:
    //     homeComparisonWeighting = -split;
    //     awayComparisonWeighting = split;
    //     break;
    //   case teamComparisonScore === 0 && match.scoreDiff < 0:
    //     homeComparisonWeighting = split;
    //     awayComparisonWeighting = -split;
    //     break;
    //   case teamComparisonScore >= 1 && teamComparisonScore <= 2:
    //     homeComparisonWeighting = 0.05;
    //     awayComparisonWeighting = 0;
    //     break;
    //   case teamComparisonScore > 2 && teamComparisonScore <= 4:
    //     homeComparisonWeighting = 0.05;
    //     awayComparisonWeighting = -0.1;
    //     break;
    //   case teamComparisonScore > 4 && teamComparisonScore <= 6:
    //     homeComparisonWeighting = 0.1;
    //     awayComparisonWeighting = -0.1;
    //     break;
    //   case teamComparisonScore > 6 && teamComparisonScore <= 9:
    //     homeComparisonWeighting = 0.15;
    //     awayComparisonWeighting = -0.1;
    //     break;
    //   case teamComparisonScore > 9 && teamComparisonScore <= 12:
    //     homeComparisonWeighting = 0.2;
    //     awayComparisonWeighting = -0.1;
    //     break;
    //   case teamComparisonScore > 12 && teamComparisonScore <= 15:
    //     homeComparisonWeighting = 0.25;
    //     awayComparisonWeighting = -0.1;
    //     break;
    //   case teamComparisonScore > 15:
    //     homeComparisonWeighting = 0.3;
    //     awayComparisonWeighting = -0.1;
    //     break;
    //   case teamComparisonScore <= -1 && teamComparisonScore >= -2:
    //     homeComparisonWeighting = split;
    //     awayComparisonWeighting = -split;
    //     break;
    //   case teamComparisonScore < -2 && teamComparisonScore >= -4:
    //     homeComparisonWeighting = -0.1;
    //     awayComparisonWeighting = 0.05;
    //     break;
    //   case teamComparisonScore < -4 && teamComparisonScore >= -6:
    //     homeComparisonWeighting = -0.1;
    //     awayComparisonWeighting = 0.1;
    //     break;
    //   case teamComparisonScore < -6 && teamComparisonScore >= -9:
    //     homeComparisonWeighting = -0.1;
    //     awayComparisonWeighting = 0.15;
    //     break;
    //   case teamComparisonScore < -9 && teamComparisonScore >= -12:
    //     homeComparisonWeighting = -0.1;
    //     awayComparisonWeighting = 0.2;
    //     break;
    //   case teamComparisonScore < -12 && teamComparisonScore >= -15:
    //     homeComparisonWeighting = -0.1;
    //     awayComparisonWeighting = 0.25;
    //     break;
    //   case teamComparisonScore < -15:
    //     homeComparisonWeighting = -0.1;
    //     awayComparisonWeighting = 0.3;
    //     break;
    //   default:
    //     homeComparisonWeighting = 0;
    //     awayComparisonWeighting = 0;
    //     break;
    // }

    if (teamComparisonScore > 0) {
      homeComparisonWeighting = 1 + teamComparisonScore;
      awayComparisonWeighting = 1 - teamComparisonScore;
    } else if (teamComparisonScore < 0) {
      homeComparisonWeighting = 1 + teamComparisonScore;
      awayComparisonWeighting = 1 - teamComparisonScore;
    } else {
      homeComparisonWeighting = 1;
      awayComparisonWeighting = 1;
    }

    console.log(match.game);
    console.log(homeComparisonWeighting);

    let isHomeTeamBetterHomeOrAway = await diff(
      match.homeRawPosition,
      match.homeTeamHomePositionRaw
    );
    let isAwayTeamBetterHomeOrAway = await diff(
      match.awayRawPosition,
      match.awayTeamAwayPositionRaw
    );

    let homeAdvantage, awayAdvantage;

    switch (true) {
      case isHomeTeamBetterHomeOrAway > 4 && isAwayTeamBetterHomeOrAway < -4:
        homeAdvantage = 1.02;
        awayAdvantage = 0.98;
        break;
      case isHomeTeamBetterHomeOrAway >= 1 && isAwayTeamBetterHomeOrAway <= -1:
        homeAdvantage = 1.01;
        awayAdvantage = 0.99;
        break;
      // case isHomeTeamBetterHomeOrAway < -4 && isAwayTeamBetterHomeOrAway > 4:
      //   homeAdvantage = 0.98;
      //   awayAdvantage = 1.05;
      //   break;
      // case isHomeTeamBetterHomeOrAway < 0 && isAwayTeamBetterHomeOrAway > 0:
      //   homeAdvantage = 1;
      //   awayAdvantage = 1;
      //   break;
      default:
        homeAdvantage = 1;
        awayAdvantage = 1;
        break;
    }

    // console.log(match.game);
    // console.log(match);

    // console.log(isHomeTeamBetterHomeOrAway);
    // console.log(homeAdvantage);
    // console.log(isAwayTeamBetterHomeOrAway);
    // console.log(awayAdvantage);

    let experimentalHomeGoals =
      factorOneHome * homeCalculation * homeComparisonWeighting * homeAdvantage;

    let experimentalAwayGoals =
      factorOneAway * awayCalculation * awayComparisonWeighting * awayAdvantage;

    let rawFinalHomeGoals = experimentalHomeGoals;
    let rawFinalAwayGoals = experimentalAwayGoals;

    // switch (true) {
    //   case formHome.overOrUnderAttack === "Overachieving drastically":
    //     rawFinalHomeGoals = rawFinalHomeGoals - 0.2;
    //     break;
    //   case formHome.overOrUnderAttack === "Underachieving drastically":
    //     rawFinalHomeGoals = rawFinalHomeGoals + 0.2;
    //     break;
    //   case formHome.overOrUnderAttack === "Overachieving":
    //     rawFinalHomeGoals = rawFinalHomeGoals - 0.1;
    //     break;
    //   case formHome.overOrUnderAttack === "Underachieving":
    //     rawFinalHomeGoals = rawFinalHomeGoals + 0.1;
    //     break;
    //   case formAway.overOrUnderAttack === "Overachieving drastically":
    //     rawFinalAwayGoals = rawFinalAwayGoals - 0.2;
    //     break;
    //   case formAway.overOrUnderAttack === "Underachieving drastically":
    //     rawFinalAwayGoals = rawFinalAwayGoals + 0.2;
    //     break;
    //   case formAway.overOrUnderAttack === "Overachieving":
    //     rawFinalAwayGoals = rawFinalAwayGoals - 0.1;
    //     break;
    //   case formAway.overOrUnderAttack === "Underachieving":
    //     rawFinalAwayGoals = rawFinalAwayGoals + 0.1;
    //     break;
    //   case formHome.overOrUnderAttack === "Overachieving slightly":
    //     rawFinalHomeGoals = rawFinalHomeGoals - 0.05;
    //     break;
    //   case formAway.overOrUnderAttack === "Overachieving slightly":
    //     rawFinalAwayGoals = rawFinalAwayGoals - 0.05;
    //     break;
    //   case formHome.overOrUnderAttack === "Underachieving slightly":
    //     rawFinalHomeGoals = rawFinalHomeGoals + 0.05;
    //     break;
    //   case formAway.overOrUnderAttack === "Underachieving slightly":
    //     rawFinalAwayGoals = rawFinalAwayGoals + 0.05;
    //     break;
    //   default:
    //     break;
    // }

    // switch (true) {
    //   case formHome.overOrUnderDefence === "Overachieving drastically":
    //     rawFinalAwayGoals = rawFinalAwayGoals + 0.2;
    //     break;
    //   case formHome.overOrUnderDefence === "Underachieving drastically":
    //     rawFinalAwayGoals = rawFinalAwayGoals - 0.2;
    //     break;
    //   case formHome.overOrUnderDefence === "Overachieving":
    //     rawFinalAwayGoals = rawFinalAwayGoals + 0.1;
    //     break;
    //   case formHome.overOrUnderDefence === "Underachieving":
    //     rawFinalAwayGoals = rawFinalAwayGoals - 0.1;
    //     break;
    //   case formAway.overOrUnderDefence === "Overachieving drastically":
    //     rawFinalHomeGoals = rawFinalHomeGoals + 0.2;
    //     break;
    //   case formAway.overOrUnderDefence === "Underachieving drastically":
    //     rawFinalHomeGoals = rawFinalHomeGoals - 0.2;
    //     break;
    //   case formAway.overOrUnderDefence === "Overachieving":
    //     rawFinalHomeGoals = rawFinalHomeGoals + 0.1;
    //     break;
    //   case formAway.overOrUnderDefence === "Underachieving":
    //     rawFinalHomeGoals = rawFinalHomeGoals - 0.1;
    //     break;
    //   case formHome.overOrUnderDefence === "Overachieving slightly":
    //     rawFinalAwayGoals = rawFinalAwayGoals + 0.05;
    //     break;
    //   case formAway.overOrUnderDefence === "Overachieving slightly":
    //     rawFinalHomeGoals = rawFinalHomeGoals + 0.05;
    //     break;
    //   case formHome.overOrUnderDefence === "Underachieving slightly":
    //     rawFinalAwayGoals = rawFinalAwayGoals - 0.05;
    //     break;
    //   case formAway.overOrUnderDefence === "Underachieving slightly":
    //     rawFinalHomeGoals = rawFinalHomeGoals - 0.05;
    //     break;
    //   default:
    //     break;
    // }

    let formTrendScoreComparison;

    if (formAway) {
      formTrendScoreComparison =
        formAway.formTrendScore - formHome.formTrendScore;
    } else {
      formTrendScoreComparison = 0;
    }

    let trueFormDiffHome = await diff(
      formHome.overUnderAchievingSum,
      formAway.overUnderAchievingSum
    );
    let trueFormDiffAway = await diff(
      formAway.overUnderAchievingSum,
      formHome.overUnderAchievingSum
    );

    if (trueFormDiffHome > 1) {
      rawFinalHomeGoals = rawFinalHomeGoals + trueFormDiffHome / 5;
      rawFinalAwayGoals = rawFinalAwayGoals + -Math.abs(trueFormDiffAway / 5);
    }

    if (trueFormDiffAway > 1) {
      rawFinalHomeGoals = rawFinalHomeGoals + -Math.abs(trueFormDiffHome / 5);
      rawFinalAwayGoals = rawFinalAwayGoals + trueFormDiffAway / 5;
    }

    if (rawFinalAwayGoals < 0) {
      let difference = parseFloat((await diff(0, rawFinalAwayGoals)) / 10);
      rawFinalHomeGoals = rawFinalHomeGoals + difference;
      rawFinalAwayGoals = 0;
    }

    if (rawFinalHomeGoals < 0) {
      let difference = parseFloat((await diff(0, rawFinalHomeGoals)) / 10);
      rawFinalAwayGoals = rawFinalAwayGoals + difference;
      rawFinalHomeGoals = 0;
    }

    if (formHome.improving === true) {
      rawFinalHomeGoals = rawFinalHomeGoals + 0.1;
    }

    if (formAway.improving === true) {
      rawFinalAwayGoals = rawFinalAwayGoals + 0.1;
    }

    if (rawFinalHomeGoals / formHome.ScoredAverage > 2) {
      rawFinalHomeGoals = (rawFinalHomeGoals + formHome.ScoredAverage) / 2;
    }

    if (rawFinalAwayGoals / formAway.ScoredAverage > 2) {
      rawFinalAwayGoals = (rawFinalAwayGoals + formAway.ScoredAverage) / 2;
    }

    finalHomeGoals = await roundCustom(rawFinalHomeGoals, formHome, formAway);
    finalAwayGoals = await roundCustom(rawFinalAwayGoals, formAway, formHome);

    if (finalHomeGoals > 5) {
      finalHomeGoals = Math.round(
        (finalHomeGoals + formHome.expectedGoals) / 2
      );
    }

    if (finalAwayGoals > 5) {
      finalAwayGoals = Math.round(
        (finalAwayGoals + formAway.expectedGoals) / 2
      );
    }

    if (finalHomeGoals > finalAwayGoals) {
      match.prediction = "homeWin";
      homePredictions = homePredictions + 1;
      if (
        formHome.overUnderAchievingSum < -2.5 ||
        formHome.overUnderAchievingSum > 2.5 ||
        formTrendScoreComparison >= 0
      ) {
        match.includeInMultis = false;
      } else {
        match.includeInMultis = true;
      }
    } else if (finalAwayGoals > finalHomeGoals) {
      match.prediction = "awayWin";
      awayPredictions = awayPredictions + 1;
      if (
        formAway.overUnderAchievingSum > 2.5 ||
        formAway.overUnderAchievingSum < -2.5 ||
        formTrendScoreComparison <= 0
      ) {
        match.includeInMultis = false;
      } else {
        match.includeInMultis = true;
      }
    } else if (finalHomeGoals === finalAwayGoals) {
      match.prediction = "draw";
      drawPredictions = drawPredictions + 1;
    }

    switch (true) {
      case match.homeGoals > match.awayGoals:
        match.winner = match.homeTeam;
        match.outcome = "homeWin";
        homeOutcomes = homeOutcomes + 1;
        allWinOutcomes = allWinOutcomes + 1;
        allLossOutcomes = allLossOutcomes + 1;
        sumStatDAWin = sumStatDAWin += formHome.AverageDangerousAttacksOverall;
        sumStatDALoss = sumStatDALoss +=
          formAway.AverageDangerousAttacksOverall;
        sumStatPossessionWin = sumStatPossessionWin +=
          formHome.AveragePossessionOverall;
        sumStatPossessionLoss = sumStatPossessionLoss +=
          formAway.AveragePossessionOverall;
        sumStatPPGLast10Win = sumStatPPGLast10Win += formHome.last10Points / 10;
        sumStatPPGLast10Loss = sumStatPPGLast10Loss +=
          formAway.last10Points / 10;
        sumStatSOTWin = sumStatSOTWin += formHome.AverageShotsOnTargetOverall;
        sumStatSOTLoss = sumStatSOTLoss += formAway.AverageShotsOnTargetOverall;
        sumOddsWin = sumOddsWin += homeOdds;
        sumOddsLoss = sumOddsLoss += awayOdds;

        sumXGForWin = sumXGForWin += formHome.XGOverall;
        sumXGForLoss = sumXGForLoss += formAway.XGOverall;
        sumXGAgainstWin = sumXGAgainstWin += formHome.XGAgainstAvgOverall;
        sumXGAgainstLoss = sumXGAgainstLoss += formAway.XGAgainstAvgOverall;

        break;
      case match.homeGoals === match.awayGoals:
        match.winner = "draw";
        match.outcome = "draw";
        allOutcomes = allOutcomes + 1;
        allDrawOutcomes = allDrawOutcomes + 1;
        break;
      case match.homeGoals < match.awayGoals:
        match.winner = match.awayTeam;
        match.outcome = "awayWin";
        allOutcomes = allOutcomes + 1;
        awayOutcomes = awayOutcomes + 1;
        allWinOutcomes = allWinOutcomes + 1;
        allLossOutcomes = allLossOutcomes + 1;
        sumStatDAWin = sumStatDAWin += formAway.AverageDangerousAttacksOverall;
        sumStatDALoss = sumStatDALoss +=
          formHome.AverageDangerousAttacksOverall;
        sumStatPossessionWin = sumStatPossessionWin +=
          formAway.AveragePossessionOverall;
        sumStatPossessionLoss = sumStatPossessionLoss +=
          formHome.AveragePossessionOverall;
        sumStatPPGLast10Win = sumStatPPGLast10Win += formAway.last10Points / 10;
        sumStatPPGLast10Loss = sumStatPPGLast10Loss +=
          formHome.last10Points / 10;
        sumStatSOTWin = sumStatSOTWin += formAway.AverageShotsOnTargetOverall;
        sumStatSOTLoss = sumStatSOTLoss += formHome.AverageShotsOnTargetOverall;
        sumOddsWin = sumOddsWin += awayOdds;
        sumOddsLoss = sumOddsLoss += homeOdds;

        sumXGForWin = sumXGForWin += formAway.XGOverall;
        sumXGForLoss = sumXGForLoss += formHome.XGOverall;
        sumXGAgainstWin = sumXGAgainstWin += formAway.XGAgainstAvgOverall;
        sumXGAgainstLoss = sumXGAgainstLoss += formHome.XGAgainstAvgOverall;
        break;
      default:
        break;
    }

    winDAAverage = (sumStatDAWin / allWinOutcomes).toFixed(2);
    lossDAAverage = (sumStatDALoss / allLossOutcomes).toFixed(2);
    winPossessionAverage = (sumStatPossessionWin / allWinOutcomes).toFixed(2);
    lossPossessionAverage = (sumStatPossessionLoss / allLossOutcomes).toFixed(
      2
    );
    winLast10PPGAverage = (sumStatPPGLast10Win / allWinOutcomes).toFixed(2);
    lossLast10PPGAverage = (sumStatPPGLast10Loss / allLossOutcomes).toFixed(2);
    winSOTAverage = (sumStatSOTWin / allWinOutcomes).toFixed(2);
    lossSOTAverage = (sumStatSOTLoss / allLossOutcomes).toFixed(2);
    winOddsAverage = (sumOddsWin / allWinOutcomes).toFixed(2);
    lossOddsAverage = (sumOddsLoss / allLossOutcomes).toFixed(2);
    winXGForAverage = (sumXGForWin / allWinOutcomes).toFixed(2);
    lossXGForAverage = (sumXGForLoss / allLossOutcomes).toFixed(2);
    winXGAgainstAverage = (sumXGAgainstWin / allWinOutcomes).toFixed(2);
    lossXGAgainstAverage = (sumXGAgainstLoss / allLossOutcomes).toFixed(2);

    if (match.status === "complete") {
      if (match.prediction === match.outcome) {
        match.predictionOutcome = "Won";
        winAmount = winAmount + 1;
        if (match.outcome === "draw") {
        }
      } else if (match.prediction !== match.outcome) {
        match.predictionOutcome = "Lost";
        lossAmount = lossAmount + 1;
        if (match.outcome === "draw") {
        }
      }
    }

    if (match.status === "complete") {
      if (match.predictionOutcome === "Won" || match.outcome === "draw") {
        match.doubleChancePredictionOutcome = "Won";
      } else if (match.prediction !== "Won" && match.outcome !== "draw") {
        match.doubleChancePredictionOutcome = "Lost";
      }
    }

    match.formHome = formHome;
    match.formAway = formAway;

    let total = parseInt(finalHomeGoals + finalAwayGoals);
    totalGoals = totalGoals + total;

    let total2 = parseInt(match.homeGoals + match.awayGoals);
    totalGoals2 = totalGoals2 + total2;

    numberOfGames = numberOfGames + 1;

    if (finalHomeGoals < 0) {
      finalHomeGoals = 0;
    }

    if (finalAwayGoals < 0) {
      finalAwayGoals = 0;
    }

    if (match.status === "suspended") {
      finalHomeGoals = "P";
      finalAwayGoals = "P";
    }

    return [
      finalHomeGoals,
      finalAwayGoals,
      rawFinalHomeGoals,
      rawFinalAwayGoals,
    ];
  } else {
    finalHomeGoals = "";
    finalAwayGoals = "";
    rawFinalHomeGoals = "";
    rawFinalAwayGoals = "";
    match.status = "void";
  }

  return [finalHomeGoals, finalAwayGoals, rawFinalHomeGoals, rawFinalAwayGoals];
}

async function getSuccessMeasure(fixtures) {
  let sumProfit = 0;
  let investment = 0;
  let exactScores = 0;
  let successCount = 0;
  let netProfit;

  for (let i = 0; i < fixtures.length; i++) {
    if (fixtures[i].status === "complete") {
      sumProfit = sumProfit + fixtures[i].profit;
      investment = investment + 1;
      netProfit = (sumProfit - investment).toFixed(2);
      if (fixtures[i].exactScore === true) {
        exactScores = exactScores + 1;
      }
      if (fixtures[i].predictionOutcome === "Won") {
        successCount = successCount + 1;
      }
    }
  }

  let ROI = (netProfit / investment) * 100;
  var operand = ROI >= 0 ? "+" : "";
  let exactScoreHitRate = ((exactScores / investment) * 100).toFixed(1);
  let successRate = ((successCount / investment) * 100).toFixed(1);

  if (investment > 0) {
    ReactDOM.render(
      <Fragment>
        <Div
          className={"SuccessMeasure"}
          text={`ROI for 
            all ${investment} W/D/W 
            outcomes: ${operand} ${ROI.toFixed(2)}%`}
        />
        <p>{`Correct W/D/W predictions: ${successCount} (${successRate}%)`}</p>
        <p>{`Exact scores predicted: ${exactScores} (${exactScoreHitRate}%)`}</p>
      </Fragment>,
      document.getElementById("successMeasure")
    );
  } else {
    return;
  }
}

export var tips = [];
export var allTips = [];
var newArray = [];
var bestBets = [];
var price;
var longShotTips = [];
var drawTips = [];
var combinations;
var exoticArray = [];
var gamesInExotic;
var minimumExotic;
var exoticStake;
var exoticString;
var bttsArray = [];
var accumulatedOdds = 1;
let predictions = [];

export async function getNewTips(array) {
  newArray = [];
  accumulatedOdds = 1;

  if (array.length > 1 && incrementValue > 0) {
    array.forEach((tip) => {
      if (
        array.indexOf(tip) < incrementValue
        // tip.goalDifferential >= incrementValue && tip.comparisonScore > 0
      ) {
        newArray.push(tip);
        accumulatedOdds = parseFloat(accumulatedOdds) * parseFloat(tip.rawOdds);
      }
    });
  }
  await renderTips(newArray);
}

export async function getScorePrediction(day, mocked) {
  let radioSelected = parseInt(selectedOption);
  let mock = mocked;
  tips = [];
  bestBets = [];
  // price = 0
  bttsArray = [];
  longShotTips = [];
  drawTips = [];

  let index = 2;
  let divider = 10;

  // if (radioSelected === 5) {
  //   index = 0;
  //   divider = 5;
  // } else if (radioSelected === 6) {
  //   index = 1;
  //   divider = 6;
  // } else if (radioSelected === 10) {
  //   index = 2;
  //   divider = 10;
  // } else if (radioSelected === 0) {
  //   index = 2;
  //   divider = 10;
  // }

  await Promise.all(
    matches.map(async (match) => {
      // if there are no stored predictions, calculate them based on live data
      if (match) {
        switch (true) {
          case match.status === "canceled":
            match.goalsA = "P";
            match.goalsB = "P";
            break;
          default:
            [
              match.goalsA,
              match.goalsB,
              match.unroundedGoalsA,
              match.unroundedGoalsB,
            ] = await calculateScore(match, index, divider, match.id);
            break;
        }
      } else {
        [
          match.goalsA,
          match.goalsB,
          match.unroundedGoalsA,
          match.unroundedGoalsB,
        ] = await calculateScore(match, index, divider, match.id);
      }

      await getBTTSPotential(allForm, match, index, match.goalsA, match.goalsB);

      let predictionObject;
      let longShotPredictionObject;
      let drawPredictionObject;

      if (
        match.unroundedGoalsA - match.unroundedGoalsB > 1 &&
        match.homeOdds !== 0 &&
        match.fractionHome !== "N/A"
      ) {
        if (
          match.prediction !== "draw" &&
          match.status !== "suspended" &&
          match.status !== "canceled" &&
          match.homeOdds < 3 &&
          // match.homePpg > 1 &&
          match.includeInMultis === true
        ) {
          predictionObject = {
            team: `${match.homeTeam} to win`,
            odds: match.fractionHome,
            rawOdds: match.homeOdds,
            comparisonScore: Math.abs(match.teamComparisonScore),
            rawComparisonScore: match.teamComparisonScore,
            formTrend: match.formHome.improving,
            outcome: match.predictionOutcome,
            goalDifferential: parseFloat(
              await diff(match.unroundedGoalsA, match.unroundedGoalsB)
            ),
            experimentalCalc:
              (match.unroundedGoalsA - match.unroundedGoalsB) *
              Math.abs(match.teamComparisonScore),
          };
          if (
            predictionObject.rawOdds >= 1.25 &&
            match.formHome.clinicalRating !== "awful"
          ) {
            allTips.push(predictionObject);

            if (
              match.unroundedGoalsA - match.unroundedGoalsB > incrementValue &&
              match.formHome.improving === true &&
              match.formAway.improving === false &&
              predictionObject.rawComparisonScore > 11
            ) {
              bestBets.push(predictionObject);
            }
          }
        }
      } else if (
        match.unroundedGoalsB - match.unroundedGoalsA > 2 &&
        match.awayOdds !== 0 &&
        match.fractionAway !== "N/A"
      ) {
        if (
          match.prediction !== "draw" &&
          match.status !== "suspended" &&
          match.status !== "canceled" &&
          match.awayOdds < 3.5 &&
          match.includeInMultis === true
        ) {
          predictionObject = {
            team: `${match.awayTeam} to win`,
            rawOdds: match.awayOdds,
            odds: match.fractionAway,
            comparisonScore: Math.abs(match.teamComparisonScore),
            rawComparisonScore: match.teamComparisonScore,
            formTrend: match.formAway.improving,
            outcome: match.predictionOutcome,
            goalDifferential: parseFloat(
              await diff(match.unroundedGoalsB, match.unroundedGoalsA)
            ),
            experimentalCalc:
              (match.unroundedGoalsB - match.unroundedGoalsA) *
              Math.abs(match.teamComparisonScore),
          };
          if (
            predictionObject.rawOdds >= 1.25 &&
            match.formAway.clinicalRating !== "awful"
          ) {
            allTips.push(predictionObject);
            if (
              match.unroundedGoalsB - match.unroundedGoalsA > 2 &&
              match.formHome.improving === false &&
              match.formAway.improving === true &&
              predictionObject.rawComparisonScore < -11
            ) {
              bestBets.push(predictionObject);
            }
          }
        }
      }

      allTips.sort(function (a, b) {
        if (a.goalDifferential === b.goalDifferential) {
          return b.comparisonScore - a.comparisonScore;
        } else {
          return b.goalDifferential > a.goalDifferential ? 1 : -1;
        }
      });

      bestBets.sort(function (a, b) {
        if (a.goalDifferential === b.goalDifferential) {
          return b.comparisonScore - a.comparisonScore;
        } else {
          return b.goalDifferential > a.goalDifferential ? 1 : -1;
        }
      });

      if (
        match.btts === true &&
        match.status !== "suspended" &&
        match.status !== "canceled"
      ) {
        bttsArray.push(match);

        bttsArray.sort(function (a, b) {
          return b.combinedBTTS - a.combinedBTTS;
        });
      }

      if (
        match.unroundedGoalsA > match.unroundedGoalsB &&
        match.homeDoubleChance >= 1.4 &&
        match.goalsA > match.goalsB
      ) {
        longShotPredictionObject = {
          team: match.homeTeam,
          decimalOdds: match.homeDoubleChance,
          rawOdds: match.homeOdds,
          odds: match.fractionHome,
          comparisonScore: match.teamComparisonScore,
          outcome: match.predictionOutcome,
          doubleChanceOutcome: match.doubleChancePredictionOutcome,
          goalDifferential: parseFloat(
            await diff(match.unroundedGoalsA, match.unroundedGoalsB)
          ),
        };
        if (
          match.prediction !== "draw" &&
          longShotPredictionObject.comparisonScore > 0.1
        ) {
          longShotTips.push(longShotPredictionObject);
        }
      } else if (
        match.unroundedGoalsA < match.unroundedGoalsB &&
        match.awayDoubleChance >= 1.4 &&
        match.goalsB > match.goalsA
      ) {
        longShotPredictionObject = {
          team: match.awayTeam,
          decimalOdds: match.awayDoubleChance,
          rawOdds: match.awayOdds,
          odds: match.fractionAway,
          comparisonScore: match.teamComparisonScore,
          outcome: match.predictionOutcome,
          doubleChanceOutcome: match.doubleChancePredictionOutcome,
          goalDifferential: parseFloat(
            await diff(match.unroundedGoalsB, match.unroundedGoalsA)
          ),
        };
        if (
          match.prediction !== "draw" &&
          longShotPredictionObject.comparisonScore < -0.1
        ) {
          longShotTips.push(longShotPredictionObject);
        }
      }

      longShotTips.sort(function (a, b) {
        return b.goalDifferential - a.goalDifferential;
      });

      exoticArray = [];
      gamesInExotic = 0;
      exoticStake = 0;
      exoticString = "";

      switch (true) {
        case allTips.length >= 10:
          for (let i = 0; i < 10; i++) {
            let game = allTips[i];
            exoticArray.push(game);
          }
          gamesInExotic = 10;
          minimumExotic = 8;
          exoticStake = 0.1;
          exoticString = "45 8-folds, 10 9-folds and 1 10-fold";
          price = getCoverBetMaxReturns(
            exoticArray,
            minimumExotic,
            exoticStake
          );
          break;
        case allTips.length >= 9:
          for (let i = 0; i < 9; i++) {
            let game = allTips[i];
            exoticArray.push(game);
          }
          gamesInExotic = 9;
          minimumExotic = 7;
          exoticStake = 0.1;
          exoticString = "36 7-folds, 9 8-folds and 1 9-fold";
          price = getCoverBetMaxReturns(
            exoticArray,
            minimumExotic,
            exoticStake
          );
          break;
        case allTips.length >= 8:
          for (let i = 0; i < 8; i++) {
            let game = allTips[i];
            exoticArray.push(game);
          }
          gamesInExotic = 8;
          minimumExotic = 6;
          exoticStake = 0.1;
          exoticString = "28 6-folds, 8 7-folds and 1 8-fold";
          price = getCoverBetMaxReturns(
            exoticArray,
            minimumExotic,
            exoticStake
          );
          break;
        case allTips.length >= 7:
          for (let i = 0; i < 7; i++) {
            let game = allTips[i];
            exoticArray.push(game);
          }
          gamesInExotic = 7;
          minimumExotic = 6;
          exoticStake = 1;
          exoticString = "7 6-folds and 1 7-fold";
          price = getCoverBetMaxReturns(
            exoticArray,
            minimumExotic,
            exoticStake
          );
          break;
        case allTips.length >= 5:
          for (let i = 0; i < 5; i++) {
            let game = allTips[i];
            exoticArray.push(game);
          }
          gamesInExotic = 6;
          minimumExotic = 5;
          exoticStake = 1;
          exoticString = "6 5-folds and 1 6-fold";
          price = getCoverBetMaxReturns(
            exoticArray,
            minimumExotic,
            exoticStake
          );
          break;
        case allTips.length >= 4:
          for (let i = 0; i < 4; i++) {
            let game = allTips[i];
            exoticArray.push(game);
          }
          gamesInExotic = 5;
          minimumExotic = 4;
          exoticStake = 1;
          exoticString = "5 4-folds and 1 5-fold";
          price = getCoverBetMaxReturns(
            exoticArray,
            minimumExotic,
            exoticStake
          );
          break;
        case longShotTips.length >= 4:
          for (let i = 0; i < 4; i++) {
            let game = longShotTips[i];
            exoticArray.push(game);
          }
          gamesInExotic = 4;
          minimumExotic = 3;
          exoticStake = 1;
          exoticString = "4 3-folds and 1 4-fold";
          price = getCoverBetMaxReturns(
            exoticArray,
            minimumExotic,
            exoticStake
          );
          break;
        default:
          break;
      }

      let formTrendScoreComparison;
      if (match.formAway) {
        formTrendScoreComparison =
          match.formAway.formTrendScore - match.formHome.formTrendScore;
      } else {
        formTrendScoreComparison = 0;
      }

      if (
        match.prediction === "draw" &&
        match.homeOdds > 1.8 &&
        match.teamComparisonScore < 0.1 &&
        match.teamComparisonScore > -0.1
        // formTrendScoreComparison > 0 &&
        // formTrendScoreComparison < 3
      ) {
        drawPredictionObject = {
          team: match.game,
          odds: match.drawOdds,
          outcome: match.predictionOutcome,
          goalDifferential: Math.abs(
            parseFloat(await diff(match.unroundedGoalsA, match.unroundedGoalsB))
          ),
        };
        if (
          match.prediction === "draw" &&
          drawPredictionObject.goalDifferential < 0.5
        ) {
          drawTips.push(drawPredictionObject);
        }
      }

      drawTips.sort(function (a, b) {
        return a.goalDifferential - b.goalDifferential;
      });

      if (mock !== true) {
        ReactDOM.render(
          <Fixture
            fixtures={matches}
            result={true}
            mock={mock}
            className={"individualFixture"}
          />,
          document.getElementById("FixtureContainer")
        );
      } else if (mock === true) {
        ReactDOM.render(
          <Fixture
            fixtures={matches}
            result={true}
            mock={mock}
            className={"individualFixture"}
          />,
          document.getElementById("FixtureContainer")
        );
      }

      predictions.push(match);
    })
  );
  await getSuccessMeasure(matches);

  await getNewTips(allTips);

  // await renderTips();
}

function getAccumulatorPrice(priceArray) {
  var result = 1;

  for (var i = 0; i < priceArray.length; i++)
    result = result * priceArray[i].rawOdds;

  return result;
}

function getCoverBetMaxReturns(priceArray, minAccSize, stake) {
  var total = 0;
  combinations = 0;

  for (var i = minAccSize; i <= priceArray.length; i++) {
    var perms = getUniquePermutations(priceArray, i);
    combinations = combinations + perms.length;

    for (var j = 0; j < perms.length; j++)
      total += getAccumulatorPrice(perms[j]) * stake;
  }
  return total;
}

function getUniquePermutations(arr, permLength) {
  if (arr.length <= permLength) return [arr];

  var permutations = [];
  var newArr = [];

  newArr = arr.slice(0);

  for (var i = 0; i < arr.length; i++) {
    newArr = arr.slice(0);
    newArr.splice(i, 1);
    permutations = twoDimArrayUnion(
      permutations,
      getUniquePermutations(newArr, permLength)
    );
  }
  return permutations;
}

function twoDimArrayUnion(arr1, arr2) {
  for (var i = 0; i < arr2.length; i++) {
    var duplicate = false;

    for (var j = 0; j < arr1.length; j++)
      if (arr1[j].length === arr2[i].length)
        for (var k = 0; k < arr1[j].length; k++)
          if (arr1[j][k] !== arr2[i][k]) break;
          else if (k === arr1[j].length - 1) duplicate = true;

    if (!duplicate) arr1.push(arr2[i]);
  }

  return arr1;
}

function NewlineText(props) {
  const text = props.text;
  const newText = text.split("\n").map((str) => <p>{str}</p>);

  return newText;
}

async function renderTips() {
  if (newArray.length > 0) {
    ReactDOM.render(
      <div className="PredictionContainer">
        <Fragment>
          <Increment />
          <Collapsable
            buttonText={"Build a multi"}
            className={"PredictionsOfTheDay"}
            text={
              <ul className="BestPredictions">
                <div className="BestPredictionsExplainer">
                  Add or remove a selection using the buttons below. Predictions
                  are ordered by confidence in the outcome.
                </div>
                {newArray.map((tip) => (
                  <li className={tip.outcome} key={tip.team}>
                    {tip.team}: {tip.odds}
                  </li>
                ))}
                <div className="AccumulatedOdds">{`Accumulator odds ~ : ${
                  Math.round(accumulatedOdds) - 1
                }/1`}</div>
              </ul>
            }
          />
        </Fragment>
      </div>,
      document.getElementById("bestPredictions")
    );
  } else {
    ReactDOM.render(
      <div className="PredictionContainer">
        <Fragment>
          <Increment />
          <Collapsable
            buttonText={"Build a multi"}
            className={"PredictionsOfTheDay"}
            text={
              <ul className="BestPredictions">
                <div className="BestPredictionsExplainer">
                  No games fit the criteria (try tapping the + button)
                </div>
                <div className="AccumulatedOdds">{`Accumulator odds ~ : ${
                  Math.round(accumulatedOdds) - 1
                }/1`}</div>
              </ul>
            }
          />
        </Fragment>
      </div>,
      document.getElementById("bestPredictions")
    );
  }

  if (exoticArray.length > 4) {
    ReactDOM.render(
      <div className="PredictionContainer">
        <Fragment>
          <Collapsable
            buttonText={"Build me an exotic bet"}
            className={"PredictionsOfTheDay"}
            text={
              <ul className="BestPredictions">
                <div className="BestPredictionsExplainer">
                  <NewlineText
                    text={`${gamesInExotic} games: ${exoticString}\nStake per multi: ${exoticStake} units - ${combinations} combinations\nTotal stake: ${(
                      exoticStake * combinations
                    ).toFixed(2)} unit(s)`}
                  />
                  {`Potential winnings: ${price.toFixed(2)} units`}
                </div>
                {exoticArray.map((tip) => (
                  <li className={tip.outcome} key={tip.team}>
                    {tip.team}: {tip.odds}
                  </li>
                ))}
              </ul>
            }
          />
        </Fragment>
      </div>,
      document.getElementById("exoticOfTheDay")
    );
  } else {
    ReactDOM.render(
      <div className="PredictionContainer">
        <Fragment>
          <Collapsable
            buttonText={"Build me an exotic bet"}
            className={"PredictionsOfTheDay"}
            text={
              <ul className="BestPredictions">
                <div className="BestPredictionsExplainer">
                  Not enough games for this feature
                </div>
              </ul>
            }
          />
        </Fragment>
      </div>,
      document.getElementById("exoticOfTheDay")
    );
  }

  if (longShotTips.length > 0) {
    ReactDOM.render(
      <div>
        <Fragment>
          <Collapsable
            buttonText={"Double chance tips"}
            text={
              <ul className="LongshotPredictions">
                <lh>Double chance (Win or Draw - decimal odds only)</lh>
                {longShotTips.map((tip) => (
                  <li className={`${tip.doubleChanceOutcome}1`} key={tip.team}>
                    {tip.team} to win or draw: {tip.decimalOdds}
                  </li>
                ))}
              </ul>
            }
          />
        </Fragment>
      </div>,
      document.getElementById("longShots")
    );
  } else {
    ReactDOM.render(
      <div>
        <Fragment>
          <Collapsable
            buttonText={"Double chance tips"}
            text={
              <ul className="LongshotPredictions">
                <lh>No games fit the criteria</lh>
              </ul>
            }
          />
        </Fragment>
      </div>,
      document.getElementById("longShots")
    );
  }

  if (drawTips.length > 0) {
    ReactDOM.render(
      <div>
        <Fragment>
          <Collapsable
            buttonText={"Draw tips"}
            text={
              <ul className="DrawTips">
                <lh>Best draw predictions</lh>
                {drawTips.map((tip) => (
                  <li className={`${tip.outcome}1`} key={tip.team}>
                    {tip.team}
                  </li>
                ))}
              </ul>
            }
          />
        </Fragment>
      </div>,
      document.getElementById("draws")
    );
  } else {
    ReactDOM.render(
      <div>
        <Fragment>
          <Collapsable
            buttonText={"Draw tips"}
            text={
              <ul className="DrawTips">
                <lh>No games fit the criteria</lh>
              </ul>
            }
          />
        </Fragment>
      </div>,
      document.getElementById("draws")
    );
  }

  if (bttsArray.length > 0) {
    ReactDOM.render(
      <div>
        <Fragment>
          <Collapsable
            className={"BTTSGames"}
            buttonText={"BTTS games"}
            text={
              <ul className="BTTSGames">
                <lh>Games with highest chance of BTTS</lh>
                {bttsArray.map((game) => (
                  <li className={game.bttsOutcome} key={game.game}>
                    {`${game.game} odds: ${game.bttsFraction}`}
                  </li>
                ))}
              </ul>
            }
          />
        </Fragment>
      </div>,
      document.getElementById("BTTS")
    );
  } else {
    ReactDOM.render(
      <div>
        <Fragment>
          <Collapsable
            className={"BTTSGames"}
            buttonText={"BTTS games"}
            text={
              <ul className="BTTSGames">
                <lh>No games fit the criteria</lh>
              </ul>
            }
          />
        </Fragment>
      </div>,
      document.getElementById("BTTS")
    );
  }

  if (allWinOutcomes > 0) {
    ReactDOM.render(
      <div>
        <Fragment>
          <Collapsable
            buttonText={"Insights"}
            text={
              <div>
                <lh className="InsightsExplainer">
                  Average stats for winning/losing teams prior to this gameweek
                </lh>
                <div className="InsightsContainer">
                  <ul className="InsightsHome">
                    <lh className="WinningTeams">Winning teams</lh>
                    <li>{winOddsAverage} odds</li>
                    <li>{winXGForAverage} XG For</li>
                    <li>{winXGAgainstAverage} XG Against</li>
                    <li>{winLast10PPGAverage} ppg (last 10)</li>
                    <li>{winPossessionAverage}% possession</li>
                    <li>{winSOTAverage} shots on target</li>
                    <li>{winDAAverage} dangerous attacks</li>
                  </ul>
                  <ul className="InsightsAway">
                    <lh className="LosingTeams">Losing teams</lh>
                    <li>{lossOddsAverage} odds</li>
                    <li>{lossXGForAverage} XG For</li>
                    <li>{lossXGAgainstAverage} XG Against</li>
                    <li>{lossLast10PPGAverage} ppg (last 10)</li>
                    <li>{lossPossessionAverage}% possession</li>
                    <li>{lossSOTAverage} shots on target</li>
                    <li>{lossDAAverage} dangerous attacks</li>
                  </ul>
                </div>
              </div>
            }
          />
        </Fragment>
      </div>,
      document.getElementById("insights")
    );
  }
}
