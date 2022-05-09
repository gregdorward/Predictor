import React, { Fragment } from "react";
import ReactDOM from "react-dom";
import { matches, diff } from "./getFixtures";
import { Fixture } from "../components/Fixture";
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

export async function compareStat(statOne, statTwo) {
  let stat1 = parseFloat(statOne);
  let stat2 = parseFloat(statTwo);
  let result;
  let tooCloseToCall;
  let gap;
  let statOneNotZero = stat1 + 0.1;
  let statTwoNotZero = stat2 + 0.1;

  if (stat1 > stat2) {
    gap = statOneNotZero / statTwoNotZero;
  } else if (stat1 < stat2) {
    gap = statTwoNotZero / statOneNotZero;
  } else {
    gap = 0;
  }

  if (gap >= 2) {
    switch (true) {
      case stat1 === stat2:
        result = 0;
        tooCloseToCall = 1;
        break;
      case stat1 > stat2:
        result = 0.25;
        tooCloseToCall = 0;
        break;
      case stat1 < stat2:
        result = -0.25;
        tooCloseToCall = 0;
        break;
      default:
        break;
    }
  } else if (gap >= 1.6 && gap < 2) {
    switch (true) {
      case stat1 === stat2:
        result = 0;
        tooCloseToCall = 1;
        break;
      case stat1 > stat2:
        result = 0.15;
        tooCloseToCall = 0;
        break;
      case stat1 < stat2:
        result = -0.15;
        tooCloseToCall = 0;
        break;
      default:
        break;
    }
  } else if (gap >= 1.3 && gap < 1.6) {
    switch (true) {
      case stat1 === stat2:
        result = 0;
        tooCloseToCall = 1;
        break;
      case stat1 > stat2:
        result = 0.1;
        tooCloseToCall = 0;
        break;
      case stat1 < stat2:
        result = -0.1;
        tooCloseToCall = 0;
        break;
      default:
        break;
    }
  } else if (gap >= 1.1 && gap < 1.3) {
    switch (true) {
      case stat1 === stat2:
        result = 0;
        tooCloseToCall = 1;
        break;
      case stat1 > stat2:
        result = 0.05;
        tooCloseToCall = 0;
        break;
      case stat1 < stat2:
        result = -0.05;
        tooCloseToCall = 0;
        break;
      default:
        break;
    }
  } else if (gap >= 1 && gap < 1.1) {
    switch (true) {
      case stat1 === stat2:
        result = 0;
        tooCloseToCall = 0.1;
        break;
      case stat1 > stat2:
        result = 0.02;
        tooCloseToCall = 0.1;
        break;
      case stat1 < stat2:
        result = -0.02;
        tooCloseToCall = 0.1;
        break;
      default:
        break;
    }
  }
  // else if (gap > 1.2 && gap < 1.3) {
  //   switch (true) {
  //     case stat1 === stat2:
  //       result = 0;
  //       tooCloseToCall = 0;
  //       awayPoints = 0;
  //       break;
  //     case stat1 > stat2:
  //       result = 0.5;
  //       tooCloseToCall = 0.2;
  //       awayPoints = 0.1;
  //       break;
  //     case stat1 < stat2:
  //       result = -0.5;
  //       tooCloseToCall = 0.1;
  //       awayPoints = 0.2;
  //       break;
  //     default:
  //       break;
  //   }
  // }
  else {
    result = 0;
    tooCloseToCall = 0;
  }

  return [result, tooCloseToCall];
}

export async function getOverOrUnderAchievingResult(
  index,
  overUnderAchievingSum
) {
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

export async function getClinicalRating(form) {
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

export async function getPointsDifferential(pointsHomeAvg, pointsAwayAvg) {
  const differential = await diff(pointsHomeAvg, pointsAwayAvg);
  return parseFloat(differential);
}

export async function getPointWeighting(pointsDiff) {
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

export async function compareFormTrend(
  threeGameAverage,
  fiveGameAverage,
  sixGameAverage,
  tenGameAverage,
  recentGoalDiff,
  distantGoalDiff
) {
  let score;

  if (fiveGameAverage > 2.5) {
    switch (true) {
      case fiveGameAverage > tenGameAverage:
        score = 20;
        break;
      case fiveGameAverage === tenGameAverage:
        score = 19;
        break;
      case fiveGameAverage < tenGameAverage:
        score = 15;
        break;
      default:
        break;
    }
  } else if (fiveGameAverage <= 2.5 && fiveGameAverage > 2) {
    switch (true) {
      case fiveGameAverage > tenGameAverage:
        score = 17;
        break;
      case fiveGameAverage === tenGameAverage:
        score = 16;
        break;
      case fiveGameAverage < tenGameAverage:
        score = 14;
        break;
      default:
        break;
    }
  } else if (fiveGameAverage <= 2 && fiveGameAverage > 1.5) {
    switch (true) {
      case fiveGameAverage > tenGameAverage:
        score = 14;
        break;
      case fiveGameAverage === tenGameAverage:
        score = 13;
        break;
      case fiveGameAverage < tenGameAverage:
        score = 11;
        break;
      default:
        break;
    }
    if (fiveGameAverage + 1 < tenGameAverage) {
      score = score - 2;
    }
  } else if (fiveGameAverage <= 1.5 && fiveGameAverage > 1) {
    switch (true) {
      case fiveGameAverage > tenGameAverage:
        score = 11;
        break;
      case fiveGameAverage === tenGameAverage:
        score = 10;
        break;
      case fiveGameAverage < tenGameAverage:
        score = 8;
        break;
      default:
        break;
    }
    if (fiveGameAverage + 1 < tenGameAverage) {
      score = score - 2;
    }
  } else if (fiveGameAverage <= 1 && fiveGameAverage > 0.5) {
    switch (true) {
      case fiveGameAverage > tenGameAverage:
        score = 8;
        break;
      case fiveGameAverage === tenGameAverage:
        score = 7;
        break;
      case fiveGameAverage < tenGameAverage:
        score = 3;
        break;
      default:
        break;
    }
    if (fiveGameAverage + 1 < tenGameAverage) {
      score = score - 2;
    }
  } else if (fiveGameAverage <= 0.5) {
    switch (true) {
      case fiveGameAverage > tenGameAverage:
        score = 3;
        break;
      case fiveGameAverage === tenGameAverage:
        score = 2;
        break;
      case fiveGameAverage < tenGameAverage:
        score = 1;
        break;
      default:
        break;
    }
    // if (fiveGameAverage + 1 < tenGameAverage) {
    //   score = 1;
    // }
  }

  // if (fiveGameAverage > 1) {
  //   if (
  //     threeGameAverage >= sixGameAverage &&
  //     sixGameAverage >= tenGameAverage
  //   ) {
  //     improving = true;
  //   } else if (recentGoalDiff < distantGoalDiff) {
  //     improving = false;
  //   } else if (recentGoalDiff - 1 > distantGoalDiff) {
  //     improving = true;
  //   } else {
  //     improving = false;
  //   }
  // }

  return score;
}

export async function getPointAverage(pointTotal, games) {
  return pointTotal / games;
}

export async function compareTeams(homeForm, awayForm, match) {
  let sotComparisonHOrA;
  let sotComparison;
  let CleanSheetPercentageComparison;
  let dangerousAttackConversionComparison;
  let goalsPerDangerousAttackComparison;
  let dangerousAttacksComparisonHOrA;
  let dangerousAttacksComparison;
  let XGdifferentialComparison;
  let formTrendScoreComparison;
  let last10PointsComparison;
  let twoGameAverageComparison;
  let fiveGameAverageComparison;
  let tenGameAverageComparison;
  let seasonPPGComparison;
  let attackingPotencyComparison;
  let AveragePossessionComparisonHOrA;
  let AveragePossessionComparison;
  let positionComparison;
  let winPercentageComparison;
  let lossPercentageComparison;
  let OddsComparison;
  let homeOrAwayAverageComparison;
  let overUnderAchievingSumComparison;
  let goalDiffComparison;
  let goalDiffHOrAComparison;

  let tooCloseToCall = 0;
  let awayPoints = 0;
  let toCloseToCallCount;

  if (
    homeForm.overUnderAchievingSum < -0.5 ||
    awayForm.overUnderAchievingSum < -0.5 ||
    homeForm.overUnderAchievingSum > 0.5 ||
    awayForm.overUnderAchievingSum > 0.5
  ) {
    [overUnderAchievingSumComparison, toCloseToCallCount] = await compareStat(
      parseFloat(homeForm.overUnderAchievingSum),
      parseFloat(awayForm.overUnderAchievingSum)
    );
    tooCloseToCall = tooCloseToCall + toCloseToCallCount;
  } else {
    overUnderAchievingSumComparison = 0;
  }

  [sotComparisonHOrA, toCloseToCallCount] = await compareStat(
    homeForm.AverageShotsOnTarget,
    awayForm.AverageShotsOnTarget
  );

  tooCloseToCall = tooCloseToCall + toCloseToCallCount;

  [sotComparison, toCloseToCallCount] = await compareStat(
    homeForm.AverageShotsOnTargetOverall,
    awayForm.AverageShotsOnTargetOverall
  );

  tooCloseToCall = tooCloseToCall + toCloseToCallCount;

  [CleanSheetPercentageComparison, toCloseToCallCount] = await compareStat(
    homeForm.CleanSheetPercentage,
    awayForm.CleanSheetPercentage
  );

  tooCloseToCall = tooCloseToCall + toCloseToCallCount;

  [dangerousAttackConversionComparison, toCloseToCallCount] = await compareStat(
    awayForm.dangerousAttackConversion,
    homeForm.dangerousAttackConversion
  );

  tooCloseToCall = tooCloseToCall + toCloseToCallCount;

  [goalsPerDangerousAttackComparison, toCloseToCallCount] = await compareStat(
    homeForm.goalsPerDangerousAttack,
    awayForm.goalsPerDangerousAttack
  );

  tooCloseToCall = tooCloseToCall + toCloseToCallCount;

  [dangerousAttacksComparisonHOrA, toCloseToCallCount] = await compareStat(
    homeForm.AverageDangerousAttacks,
    awayForm.AverageDangerousAttacks
  );

  tooCloseToCall = tooCloseToCall + toCloseToCallCount;

  [dangerousAttacksComparison, toCloseToCallCount] = await compareStat(
    homeForm.AverageDangerousAttacksOverall,
    awayForm.AverageDangerousAttacksOverall
  );

  tooCloseToCall = tooCloseToCall + toCloseToCallCount;

  [XGdifferentialComparison, toCloseToCallCount] = await compareStat(
    homeForm.XGdifferential,
    awayForm.XGdifferential
  );

  tooCloseToCall = tooCloseToCall + toCloseToCallCount;

  [formTrendScoreComparison, toCloseToCallCount] = await compareStat(
    homeForm.formTrendScore,
    awayForm.formTrendScore
  );

  tooCloseToCall = tooCloseToCall + toCloseToCallCount;

  [last10PointsComparison, toCloseToCallCount] = await compareStat(
    homeForm.last10Points,
    awayForm.last10Points
  );

  tooCloseToCall = tooCloseToCall + toCloseToCallCount;

  [twoGameAverageComparison, toCloseToCallCount] = await compareStat(
    homeForm.twoGameAverage,
    awayForm.twoGameAverage
  );

  tooCloseToCall = tooCloseToCall + toCloseToCallCount;

  [fiveGameAverageComparison, toCloseToCallCount] = await compareStat(
    homeForm.fiveGameAverage,
    awayForm.fiveGameAverage
  );

  tooCloseToCall = tooCloseToCall + toCloseToCallCount;

  [tenGameAverageComparison, toCloseToCallCount] = await compareStat(
    homeForm.tenGameAverage,
    awayForm.tenGameAverage
  );

  tooCloseToCall = tooCloseToCall + toCloseToCallCount;

  if (homeForm.SeasonPPG !== "N/A" && awayForm.SeasonPPG !== "N/A") {
    [seasonPPGComparison, toCloseToCallCount] = await compareStat(
      parseFloat(homeForm.SeasonPPG),
      parseFloat(awayForm.SeasonPPG)
    );
  } else seasonPPGComparison = last10PointsComparison;

  tooCloseToCall = tooCloseToCall + toCloseToCallCount;

  [attackingPotencyComparison, toCloseToCallCount] = await compareStat(
    homeForm.AttackingPotency,
    awayForm.AttackingPotency
  );

  tooCloseToCall = tooCloseToCall + toCloseToCallCount;

  [AveragePossessionComparisonHOrA, toCloseToCallCount] = await compareStat(
    homeForm.AveragePossession - 10,
    awayForm.AveragePossession - 10
  );

  tooCloseToCall = tooCloseToCall + toCloseToCallCount;

  console.log(homeForm.goalDifference + " & " + awayForm.goalDifference);

  [goalDiffComparison, toCloseToCallCount] = await compareStat(
    homeForm.goalDifference + 20,
    awayForm.goalDifference + 20
  );

  tooCloseToCall = tooCloseToCall + toCloseToCallCount;

  [goalDiffHOrAComparison, toCloseToCallCount] = await compareStat(
    homeForm.goalDifferenceHomeOrAway + 20,
    awayForm.goalDifferenceHomeOrAway + 20
  );

  tooCloseToCall = tooCloseToCall + toCloseToCallCount;

  [AveragePossessionComparison, toCloseToCallCount] = await compareStat(
    homeForm.AveragePossessionOverall - 10,
    awayForm.AveragePossessionOverall - 10
  );

  tooCloseToCall = tooCloseToCall + toCloseToCallCount;

  if (
    typeof awayForm.awayPositionAwayOnly === "number" &&
    typeof homeForm.homePositionHomeOnly === "number"
  ) {
    [positionComparison, toCloseToCallCount] = await compareStat(
      awayForm.awayPositionAwayOnly + awayForm.awayPosition + 10,
      homeForm.homePositionHomeOnly + homeForm.homePosition + 10
    );
  } else {
    [positionComparison, toCloseToCallCount] = await compareStat(
      homeForm.tenGameAverage,
      awayForm.tenGameAverage
    );
  }

  tooCloseToCall = tooCloseToCall + toCloseToCallCount;

  let winPercH;
  let winPercA;
  let drawPercH;
  let drawPercA;
  let lossPercH;
  let lossPercA;

  if (homeForm.WinPercentage !== undefined) {
    [winPercentageComparison, toCloseToCallCount] = await compareStat(
      homeForm.WinPercentage + 40,
      awayForm.WinPercentage + 40
    );
    winPercH = homeForm.WinPercentage;
    winPercA = awayForm.WinPercentage;
    drawPercH = homeForm.DrawPercentage;
    drawPercA = awayForm.DrawPercentage;
  } else {
    [winPercentageComparison, toCloseToCallCount] = await compareStat(
      match.homeTeamWinPercentage + 40,
      match.awayTeamWinPercentage + 40
    );
    winPercH = match.homeTeamWinPercentage;
    winPercA = match.awayTeamWinPercentage;
    drawPercH = match.homeTeamDrawPercentage;
    drawPercA = match.awayTeamDrawPercentage;
  }

  if (homeForm.LossPercentage !== undefined) {
    [lossPercentageComparison, toCloseToCallCount] = await compareStat(
      awayForm.LossPercentage + 40,
      homeForm.LossPercentage + 40
    );
    lossPercA = awayForm.LossPercentage;
    lossPercH = homeForm.LossPercentage;
  } else {
    [lossPercentageComparison, toCloseToCallCount] = await compareStat(
      match.awayTeamLossPercentage + 40,
      match.homeTeamLossPercentage + 40
    );
    lossPercA = match.awayTeamLossPercentage;
    lossPercH = match.homeTeamLossPercentage;
  }

  [OddsComparison, toCloseToCallCount] = await compareStat(
    match.awayOdds,
    match.homeOdds
  );

  tooCloseToCall = tooCloseToCall + toCloseToCallCount;

  if (homeForm.homeOrAwayAverage) {
    [homeOrAwayAverageComparison, toCloseToCallCount] = await compareStat(
      homeForm.homeOrAwayAverage + 1,
      awayForm.homeOrAwayAverage + 1
    );

    tooCloseToCall = tooCloseToCall + toCloseToCallCount;
  } else {
    [homeOrAwayAverageComparison, toCloseToCallCount] = await compareStat(1, 1);

    tooCloseToCall = tooCloseToCall + toCloseToCallCount;
  }

  let calculation =
    OddsComparison * 0 +
    positionComparison * 2 +
    twoGameAverageComparison * 3 +
    tenGameAverageComparison * 4 +
    XGdifferentialComparison * 8 +
    seasonPPGComparison * 0 +
    formTrendScoreComparison * 0 +
    fiveGameAverageComparison * 3 +
    dangerousAttacksComparisonHOrA * 0 +
    dangerousAttacksComparison * 1 +
    sotComparison * 0 +
    sotComparisonHOrA * 1 +
    CleanSheetPercentageComparison * 1 +
    dangerousAttackConversionComparison * 0 +
    goalsPerDangerousAttackComparison * 0 +
    attackingPotencyComparison * 0 +
    AveragePossessionComparison * 0 +
    AveragePossessionComparisonHOrA * 0 +
    winPercentageComparison * 2 +
    lossPercentageComparison * 2 +
    homeOrAwayAverageComparison * 1 +
    overUnderAchievingSumComparison * 4 +
    goalDiffComparison * 5 +
    goalDiffHOrAComparison * 3;

  match.tooCloseToCall = tooCloseToCall;

  console.log(tooCloseToCall);

  // if ((calculation > 0) && homeForm.overUnderAchievingSum < 0) {
  //   calculation = -Math.abs(calculation)
  // } else if((calculation < 0) && awayForm.overUnderAchievingSum < 0){
  //   calculation = Math.abs(calculation)
  // }

  // adjust calculation based on worse team's win and draw percentages
  if (calculation > 0) {
    switch (true) {
      case winPercA + drawPercA === 100:
        // console.log(match.game)
        // console.log(match)
        // console.log(homeForm)
        // console.log(awayForm)
        calculation = calculation / 9;
        break;
      case winPercA + drawPercA >= 90 && winPercA + drawPercA < 100:
        calculation = calculation / 8;
        break;
      case winPercA + drawPercA >= 80 && winPercA + drawPercA < 90:
        calculation = calculation / 7;
        break;
      case winPercA + drawPercA >= 70 && winPercA + drawPercA < 80:
        calculation = calculation / 6;
        break;
      case winPercA + drawPercA >= 60 && winPercA + drawPercA < 70:
        calculation = calculation / 5;
        break;
      case winPercA + drawPercA >= 50 && winPercA + drawPercA < 60:
        calculation = calculation / 4;
        break;
      case winPercA + drawPercA >= 40 && winPercA + drawPercA < 50:
        calculation = calculation / 1.5;
        break;
      case winPercA + drawPercA >= 30 && winPercA + drawPercA < 40:
        calculation = calculation / 1.25;
        break;
      case winPercA + drawPercA >= 20 && winPercA + drawPercA < 30:
        calculation = calculation / 1;
        break;
      case winPercA + drawPercA >= 10 && winPercA + drawPercA < 20:
        calculation = calculation * 2;
        break;
      case winPercA + drawPercA >= 0 && winPercA + drawPercA < 10:
        calculation = calculation * 3;
        break;
      default:
        break;
    }
  } else if (calculation < 0) {
    switch (true) {
      case winPercH + drawPercH === 100:
        calculation = calculation / 9;
        break;
      case winPercH + drawPercH >= 90 && winPercH + drawPercH < 100:
        calculation = calculation / 8;
        break;
      case winPercH + drawPercH >= 80 && winPercH + drawPercH < 90:
        calculation = calculation / 7;
        break;
      case winPercH + drawPercH >= 70 && winPercH + drawPercH < 80:
        calculation = calculation / 6;
        break;
      case winPercH + drawPercH >= 60 && winPercH + drawPercH < 70:
        calculation = calculation / 5;
        break;
      case winPercH + drawPercH >= 50 && winPercH + drawPercH < 60:
        calculation = calculation / 4;
        break;
      case winPercH + drawPercH >= 40 && winPercH + drawPercH < 50:
        calculation = calculation / 1.5;
        break;
      case winPercH + drawPercH >= 30 && winPercH + drawPercH < 40:
        calculation = calculation / 1.25;
        break;
      case winPercH + drawPercH >= 20 && winPercH + drawPercH < 30:
        calculation = calculation * 1;
        break;
      case winPercH + drawPercH >= 10 && winPercH + drawPercH < 20:
        calculation = calculation * 2;
        break;
      case winPercH + drawPercH >= 0 && winPercH + drawPercH < 10:
        calculation = calculation * 3;
        break;
      default:
        break;
    }
  }

  // adjust calculation based on better team's win and draw percentages
  if (calculation > 0) {
    switch (true) {
      case winPercH >= 90 && winPercH <= 100:
        calculation = calculation * 4;
        break;
      case winPercH >= 80 && winPercH < 90:
        calculation = calculation * 3.5;
        break;
      case winPercH >= 70 && winPercH < 80:
        calculation = calculation * 3;
        break;
      case homeForm.homeOrAwayAverage > 2.5:
        calculation = calculation * 2.5;
        break;
      case winPercH >= 60 && winPercH < 70:
        calculation = calculation * 2;
        break;
      case winPercH >= 50 && winPercH < 60:
        calculation = calculation * 1.5;
        break;
      case winPercH >= 40 && winPercH < 50:
        calculation = calculation * 1.25;
        break;
      case winPercH >= 30 && winPercH < 40:
        calculation = calculation * 1;
        break;
      case winPercH >= 20 && winPercH < 30:
        calculation = calculation * 0.75;
        break;
      case winPercH >= 10 && winPercH < 20:
        calculation = calculation * 0.5;
        break;
      case winPercH >= 0 && winPercH < 10:
        calculation = calculation * 0.25;
        break;
      default:
        break;
    }
  } else if (calculation < 0) {
    switch (true) {
      case winPercA >= 90 && winPercA <= 100:
        calculation = calculation * 4;
        break;
      case winPercA >= 80 && winPercA < 90:
        calculation = calculation * 3.5;
        break;
      case winPercA >= 70 && winPercA < 80:
        calculation = calculation * 3;
        break;
      case awayForm.homeOrAwayAverage > 2.5:
        calculation = calculation * 2.5;
        break;
      case winPercA >= 60 && winPercA < 70:
        calculation = calculation * 2;
        break;
      case winPercA >= 50 && winPercA < 60:
        calculation = calculation * 1.5;
        break;
      case winPercA >= 40 && winPercA < 50:
        calculation = calculation * 1.25;
        break;
      case winPercA >= 30 && winPercA < 40:
        calculation = calculation * 1;
        break;
      case winPercA >= 20 && winPercA < 30:
        calculation = calculation * 0.75;
        break;
      case winPercA >= 10 && winPercA < 20:
        calculation = calculation * 0.5;
        break;
      case winPercA >= 0 && winPercA < 10:
        calculation = calculation * 0.25;
        break;
      default:
        break;
    }
  }

  if (calculation > 0) {
    switch (true) {
      case homeForm.last2Points < 1:
        calculation = calculation / 7.5;
        break;
      case homeForm.homeOrAwayAverage < 1:
        calculation = calculation / 3;
        break;
      case awayForm.homeOrAwayAverage > 2.5:
        calculation = calculation / 2;
        break;
      default:
        break;
    }
  } else if (calculation < 0) {
    switch (true) {
      case awayForm.last2Points < 1:
        calculation = calculation / 7.5;
        break;
      case awayForm.homeOrAwayAverage < 1:
        calculation = calculation / 3;
        break;
      case homeForm.homeOrAwayAverage > 2.5:
        calculation = calculation / 2;
        break;
      default:
        break;
    }
  }

  if (calculation > 0 && tooCloseToCall > 0.6) {
    calculation = calculation / 2;
  } else if (calculation < 0 && tooCloseToCall > 0.6) {
    calculation = calculation / 2;
  }

  return [calculation, tooCloseToCall, awayPoints];
}

export async function roundCustom(num, form, otherForm) {
  let wholeNumber = Math.floor(num);
  let remainder = num - wholeNumber;

  if (wholeNumber !== 0) {
    // if (form.clinicalScore < 1) {
    //   return Math.round(num);
    // }
    if (
      form.overUnderAchievingSumAttack > 0.25 &&
      otherForm.overUnderAchievingSumDefence < -0.25
    ) {
      return Math.ceil(num);
    } else if (
      form.overUnderAchievingSumAttack < -0.25 &&
      otherForm.overUnderAchievingSumDefence > 0.25
    ) {
      return Math.floor(num);
    } else if (remainder > 0.75) {
      return Math.ceil(num);
    } else {
      return Math.floor(num);
    }
  } else if (wholeNumber === 0) {
    // if (form.clinicalScore < 1) {
    //   return Math.round(num);
    // }
    if (
      form.overUnderAchievingSumAttack > 0.25 &&
      otherForm.overUnderAchievingSumDefence < -0.25
    ) {
      return Math.ceil(num);
    } else if (
      form.overUnderAchievingSumAttack < -0.25 &&
      otherForm.overUnderAchievingSumDefence > 0.25
    ) {
      return Math.floor(num);
    } else if (remainder > 0.75) {
      return Math.ceil(num);
    } else {
      return Math.floor(num);
    }
  } else {
    return Math.floor(num);
  }
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

      if (teams[i][index].formRun) {
        teams[i][index].lastHomeOrAwayPoints = getPointsFromLastX(
          teams[i][index].formRun
        );

        teams[i][index].homeOrAwayAverage = await getPointAverage(
          teams[i][index].lastHomeOrAwayPoints,
          teams[i][index].formRun.length
        );
      }

      let scoredAverageNotZero = 0.01;
      let conceededAverageNotZero = 0.01;

      if (teams[i][index].ScoredAverage === 0) {
        teams[i][index].ScoredAverage = scoredAverageNotZero;
        teams[i][0].ScoredOverall = scoredAverageNotZero;
      }

      if (teams[i][index].ConcededAverage === 0) {
        teams[i][index].ConcededAverage = conceededAverageNotZero;
        teams[i][0].ConcededOverall = conceededAverageNotZero;
      }

      teams[i][index].ScoredAverageShortTerm = teams[i][0].ScoredOverall / 5;
      teams[i][index].ScoredAverageLongTermHomeOrAway =
        teams[i][2].ScoredAverage;
      teams[i][index].ConcededAverageShortTerm =
        teams[i][0].ConcededOverall / 5;
      teams[i][index].ConcededAverageLongTermHomeOrAway =
        teams[i][2].ConcededAverage;

      teams[i][index].longTermAverageGoals = teams[i][2].ScoredAverage;
      teams[i][index].longTermAverageConceeded = teams[i][2].ConcededAverage;

      let recentGoalDiff =
        teams[i][index].ScoredAverageShortTerm -
        teams[i][index].ConcededAverageShortTerm;
      let distantGoalDiff =
        teams[i][index].longTermAverageGoals -
        teams[i][index].longTermAverageConceeded;

      teams[i][index].formTrendScore = await compareFormTrend(
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

      let goalOverOrUnderAchieving = parseFloat(
        await diff(teams[i][index].finishingScore, 0)
      );

      let concededOverOrUnderAchieving = parseFloat(
        await diff(teams[i][index].goalieRating, 0)
      );

      teams[i][index].overUnderAchievingSumAttack = goalOverOrUnderAchieving;

      teams[i][index].overUnderAchievingSumDefence =
        concededOverOrUnderAchieving;

      teams[i][index].overUnderAchievingSum =
        goalOverOrUnderAchieving + concededOverOrUnderAchieving;

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
        teams[i][index].XGOverall - teams[i][index].XGAgainstAvgOverall;

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

      if (
        teams[i][0].XGOverall > teams[i][2].XGOverall &&
        teams[i][0].XGAgainstAvgOverall < teams[i][2].XGAgainstAvgOverall
      ) {
        teams[i][index].improving = true;
      }

      if (
        teams[i][0].XGOverall < teams[i][2].XGOverall &&
        teams[i][0].XGAgainstAvgOverall > teams[i][2].XGAgainstAvgOverall
      ) {
        teams[i][index].improving = false;
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

    let pointsDiff10 = await getPointsDifferential(
      homeTenGameAvg,
      awayTenGameAvg
    );

    let [last10WeightingHome, last10WeightingAway] = await getPointWeighting(
      pointsDiff10
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

    homeWeighting = weightingSplitHome * 0;
    awayWeighting = weightingSplitAway * 0;

    let homeCalculation;
    let awayCalculation;

    let XGdifferential = await diff(
      formHome.XGdifferential,
      formAway.XGdifferential
    );

    if (
      typeof formHome.homeTeamHomePositionRaw === "number" &&
      typeof formAway.awayTeamAwayPositionRaw === "number"
    ) {
      formHome.homePositionHomeOnly = parseFloat(
        formHome.homeTeamHomePositionRaw
      );
      formAway.awayPositionAwayOnly = parseFloat(
        formAway.awayTeamAwayPositionRaw
      );
      formHome.homePosition = parseFloat(formHome.homeRawPosition);
      formAway.awayPosition = parseFloat(formAway.awayRawPosition);
    } else {
      formHome.homePositionHomeOnly = "N/A";
      formAway.awayPositionAwayOnly = "N/A";
      formHome.homePosition = "N/A";
      formAway.awayPosition = "N/A";
    }

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

    let teamComparisonScore;
    let tooCloseToCall;
    let awayPoints;

    [teamComparisonScore, tooCloseToCall, awayPoints] = await compareTeams(
      formHome,
      formAway,
      match
    );
    teamComparisonScore = teamComparisonScore * 1;
    if (teamComparisonScore > 1.8) {
      teamComparisonScore = 1.8;
    } else if (teamComparisonScore < -1.8) {
      teamComparisonScore = -1.8;
    }

    console.log(teamComparisonScore);

    match.teamComparisonScore = teamComparisonScore;

    let finalHomeGoals;
    let finalAwayGoals;

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
      (formHome.ScoredAverageLongTermHomeOrAway +
        formAway.ConcededAverageLongTermHomeOrAway) /
      2;
    let goalCalcAwayOnly =
      (formAway.ScoredAverageLongTermHomeOrAway +
        formHome.ConcededAverageLongTermHomeOrAway) /
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
      (goalCalcHomeShortTerm * 1 +
        goalCalcHomeShortAndLongTerm * 1 +
        goalCalcHomeOnly * 1 +
        formAway.expectedConceededGoalsLongTerm * 0.5 +
        formHome.expectedGoalsLongTerm * 0.5 +
        formAway.ConcededAverageShortTerm * 0 +
        last10WeightingHome * 0 +
        formHome.goalsDifferential * 0) /
      4;

    let factorOneAway =
      (goalCalcAwayShortTerm * 1 +
        goalCalcAwayShortAndLongTerm * 1 +
        goalCalcAwayOnly * 1 +
        formHome.expectedConceededGoalsLongTerm * 0.5 +
        formAway.expectedGoalsLongTerm * 0.5 +
        formHome.ConcededAverageShortTerm * 0 +
        last10WeightingAway * 0 +
        formAway.goalsDifferential * 0) /
      4;

    let homeComparisonWeighting;
    let awayComparisonWeighting;
    match.scoreDiff = await diff(factorOneHome, factorOneAway);

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

    let isHomeTeamBetterHomeOrAway = await diff(
      formHome.homePosition,
      formHome.homeTeamHomePositionRaw
    );
    let isAwayTeamBetterHomeOrAway = await diff(
      formAway.awayPosition,
      formAway.awayTeamAwayPositionRaw
    );

    let homeAdvantage, awayAdvantage;

    switch (true) {
      // case isHomeTeamBetterHomeOrAway > 4 && isAwayTeamBetterHomeOrAway < -4:
      //   homeAdvantage = 1.04;
      //   awayAdvantage = 0.96;
      //   break;
      // case isHomeTeamBetterHomeOrAway >= 1 && isAwayTeamBetterHomeOrAway <= -1:
      //   homeAdvantage = 1.02;
      //   awayAdvantage = 0.98;
      //   break;
      default:
        homeAdvantage = 1;
        awayAdvantage = 1;
        break;
    }

    let experimentalHomeGoals =
      factorOneHome * 0.85 * homeComparisonWeighting * homeAdvantage;

    let experimentalAwayGoals =
      factorOneAway * 0.85 * awayComparisonWeighting * awayAdvantage;

    let rawFinalHomeGoals = experimentalHomeGoals;
    let rawFinalAwayGoals = experimentalAwayGoals;

    match.rawFinalHomeGoals = rawFinalHomeGoals;
    match.rawFinalAwayGoals = rawFinalAwayGoals;

    if (
      formHome.CleanSheetPercentage < 30 &&
      formAway.CleanSheetPercentage < 30
    ) {
      rawFinalHomeGoals = rawFinalHomeGoals + 0.5;
      rawFinalAwayGoals = rawFinalAwayGoals + 0.5;
    } else if (
      formHome.CleanSheetPercentage > 60 &&
      formAway.CleanSheetPercentage > 60
    ) {
      rawFinalHomeGoals = rawFinalHomeGoals - 0.5;
      rawFinalAwayGoals = rawFinalAwayGoals - 0.5;
    }

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

    // if (trueFormDiffHome > 2) {
    //   rawFinalHomeGoals =
    //     rawFinalHomeGoals + formHome.expectedGoalsShortAndLongTerm / 4;
    //   rawFinalAwayGoals = rawFinalAwayGoals + -Math.abs(trueFormDiffAway / 4);
    // }

    // if (trueFormDiffAway > 2) {
    //   rawFinalHomeGoals = rawFinalHomeGoals + -Math.abs(trueFormDiffHome / 4);
    //   rawFinalAwayGoals = rawFinalAwayGoals + trueFormDiffAway / 4;
    // }

    if (rawFinalAwayGoals < 0) {
      let difference = parseFloat((await diff(0, rawFinalAwayGoals)) / 5);
      rawFinalHomeGoals = rawFinalHomeGoals + difference;
      rawFinalAwayGoals = 0;
    }

    if (rawFinalHomeGoals < 0) {
      let difference = parseFloat((await diff(0, rawFinalHomeGoals)) / 5);
      rawFinalAwayGoals = rawFinalAwayGoals + difference;
      rawFinalHomeGoals = 0;
    }

    if (formHome.improving === true && formAway.improving === false) {
      rawFinalHomeGoals = rawFinalHomeGoals + 0.5;
      rawFinalAwayGoals = rawFinalAwayGoals - 0.5;
    } else if (formAway.improving === true && formHome.improving === false) {
      rawFinalHomeGoals = rawFinalHomeGoals - 0.5;
      rawFinalAwayGoals = rawFinalAwayGoals + 0.5;
    }

    if (
      (rawFinalHomeGoals + 1) / (formHome.ScoredAverage + 1) > 1.2 &&
      (rawFinalHomeGoals + 1) / (formAway.ConcededAverage + 1) > 1.2
    ) {
      rawFinalHomeGoals = rawFinalHomeGoals - 1;
    } else if (
      (rawFinalHomeGoals + 1) / (formHome.ScoredAverage + 1) < 0.8 &&
      (rawFinalHomeGoals + 1) / (formAway.ConcededAverage + 1) < 0.8
    ) {
      rawFinalHomeGoals = rawFinalHomeGoals + 1;
    }

    if (
      (rawFinalAwayGoals + 1) / (formAway.ScoredAverage + 1) > 1.2 &&
      (rawFinalAwayGoals + 1) / (formHome.ConcededAverage + 1) > 1.2
    ) {
      rawFinalAwayGoals = rawFinalAwayGoals - 1;
    } else if (
      (finalAwayGoals + 1) / (formAway.ScoredAverage + 1) < 0.8 &&
      (finalAwayGoals + 1) / (formHome.ConcededAverage + 1) < 0.8
    ) {
      rawFinalAwayGoals = rawFinalAwayGoals + 1;
    }

    finalHomeGoals = await roundCustom(rawFinalHomeGoals, formHome, formAway);
    finalAwayGoals = await roundCustom(rawFinalAwayGoals, formAway, formHome);

    // if ((finalHomeGoals + 1) / (formHome.ScoredAverage + 1) > 1.5 && (finalHomeGoals + 1) / (formAway.ConcededAverage + 1) > 1.5) {
    //   finalHomeGoals = finalHomeGoals - 1;
    // }
    // else if ((finalHomeGoals + 1) / (formHome.ScoredAverage + 1) < 0.25 && (finalHomeGoals + 1) / (formAway.ConcededAverage + 1) < 0.25){
    //   finalHomeGoals = finalHomeGoals + 1;
    // }

    // if ((finalAwayGoals + 1) / (formAway.ScoredAverage + 1) > 1.5 && (finalAwayGoals + 1) / (formHome.ConcededAverage + 1) > 1.5) {
    //   finalAwayGoals = finalAwayGoals - 1;
    // }
    // else if ((finalAwayGoals + 1) / (formAway.ScoredAverage + 1) < 0.25 && (finalAwayGoals + 1) / (formHome.ConcededAverage + 1) < 0.25){
    //   finalAwayGoals = finalAwayGoals + 1;
    // }

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
        formHome.lastGame === "L" ||
        formHome.last3Points < 3 ||
        formAway.lastGame === "W" ||
        match.XGdifferentialValueRaw < 0
      ) {
        match.includeInMultis = false;
      } else {
        match.includeInMultis = true;
      }
    } else if (finalAwayGoals > finalHomeGoals) {
      match.prediction = "awayWin";
      awayPredictions = awayPredictions + 1;
      if (
        formAway.lastGame === "L" ||
        formAway.last3Points < 3 ||
        formHome.lastGame === "W" ||
        match.XGdifferentialValueRaw > 0
      ) {
        match.includeInMultis = false;
      } else {
        match.includeInMultis = true;
      }
    } else if (finalHomeGoals === finalAwayGoals) {
      match.prediction = "draw";
      drawPredictions = drawPredictions + 1;
    }

    if (
      (XGdifferential > 0.85 && match.prediction === "homeWin") ||
      (XGdifferential < -1.6 && match.prediction === "awayWin")
    ) {
      match.XGdifferential = true;
      match.XGdifferentialValue = Math.abs(XGdifferential);
      match.XGdifferentialValueRaw = parseFloat(XGdifferential);
    } else {
      match.XGdifferential = false;
      match.XGdifferentialValue = Math.abs(XGdifferential);
      match.XGdifferentialValueRaw = parseFloat(XGdifferential);
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

    console.log(`Predicted: ${totalGoals}`);

    let total2 = parseInt(match.homeGoals + match.awayGoals);
    totalGoals2 = totalGoals2 + total2;

    console.log(`Actual: ${totalGoals2}`);

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
let allTipsSorted;
var newArray = [];
var bestBets = [];
var price;
var longShotTips = [];
var XGDiffTips = [];
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
  let mock = mocked;
  tips = [];
  bestBets = [];
  // price = 0
  bttsArray = [];
  longShotTips = [];
  XGDiffTips = [];

  let index = 2;
  let divider = 10;

  ReactDOM.render(<div />, document.getElementById("Buttons"));

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
      let XGPredictionObject;

      if (
        (match.unroundedGoalsA - match.unroundedGoalsB > 0.75 &&
          match.homeOdds !== 0 &&
          match.fractionHome !== "N/A" &&
          match.includeInMultis !== false) ||
        (match.XGdifferentialValueRaw > 1.2 && match.includeInMultis !== false)
      ) {
        if (
          match.prediction !== "draw" &&
          match.status !== "suspended" &&
          match.status !== "canceled" &&
          match.homeOdds < 3
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
            XGdifferentialValue: parseFloat(match.XGdifferentialValue),
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
        (match.unroundedGoalsB - match.unroundedGoalsA > 1.75 &&
          match.awayOdds !== 0 &&
          match.fractionAway !== "N/A" &&
          match.includeInMultis !== false) ||
        (match.XGdifferentialValueRaw < -1.2 && match.includeInMultis !== false)
      ) {
        if (
          match.prediction !== "draw" &&
          match.status !== "suspended" &&
          match.status !== "canceled" &&
          match.awayOdds < 3.5
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
            XGdifferentialValue: parseFloat(match.XGdifferentialValue),
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

      allTipsSorted = allTips.sort(function (a, b) {
        let sortByCalcA = a.comparisonScore * a.XGdifferentialValue;
        let sortByCalcB = b.comparisonScore * b.XGdifferentialValue;

        if (sortByCalcA === sortByCalcB) {
          return b.XGdifferentialValue - a.XGdifferentialValue;
        } else {
          return sortByCalcB > sortByCalcA ? 1 : -1;
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
          return b.totalGoals - a.totalGoals;
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
        case XGDiffTips.length >= 10:
          for (let i = 0; i < 10; i++) {
            let game = XGDiffTips[i];
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
        case XGDiffTips.length >= 9:
          for (let i = 0; i < 9; i++) {
            let game = XGDiffTips[i];
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

        case XGDiffTips.length >= 8:
          for (let i = 0; i < 8; i++) {
            let game = XGDiffTips[i];
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
        case XGDiffTips.length >= 7:
          for (let i = 0; i < 7; i++) {
            let game = XGDiffTips[i];
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
        case allTips.length >= 6:
          for (let i = 0; i < 6; i++) {
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
        case allTips.length >= 5:
          for (let i = 0; i < 5; i++) {
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

      if (match.XGdifferential === true && match.prediction === "homeWin") {
        XGPredictionObject = {
          game: match.game,
          team: `${match.homeTeam} to win`,
          rawOdds: match.homeOdds,
          comparisonScore: Math.abs(match.teamComparisonScore),
          formTrend: match.formHome.improving,
          rawComparisonScore: match.teamComparisonScore,
          outcome: match.predictionOutcome,
          prediction: `${match.homeTeam} to win`,
          odds: match.fractionHome,
          otherTeam: match.awayTeam,
          XGdifferentialValue: match.XGdifferentialValue,
          goalDifferential: parseFloat(
            await diff(match.unroundedGoalsA, match.unroundedGoalsB)
          ),
          experimentalCalc:
            (match.unroundedGoalsA - match.unroundedGoalsB) *
            Math.abs(match.teamComparisonScore),
        };
        XGDiffTips.push(XGPredictionObject);
      } else if (
        match.XGdifferential === true &&
        match.prediction === "awayWin"
      ) {
        XGPredictionObject = {
          game: match.game,
          team: `${match.awayTeam} to win`,
          rawOdds: match.awayOdds,
          comparisonScore: Math.abs(match.teamComparisonScore),
          formTrend: match.formAway.improving,
          rawComparisonScore: match.teamComparisonScore,
          outcome: match.predictionOutcome,
          prediction: `${match.awayTeam} to win`,
          odds: match.fractionAway,
          otherTeam: match.homeTeam,
          XGdifferentialValue: match.XGdifferentialValue,
          goalDifferential: parseFloat(
            await diff(match.unroundedGoalsB, match.unroundedGoalsA)
          ),
          experimentalCalc:
            (match.unroundedGoalsB - match.unroundedGoalsA) *
            Math.abs(match.teamComparisonScore),
        };
        XGDiffTips.push(XGPredictionObject);
      }

      XGDiffTips.sort(function (a, b) {
        return b.XGdifferentialValue - a.XGdifferentialValue;
      });

      if (mock !== true) {
        ReactDOM.render(
          <Fixture
            fixtures={matches}
            result={true}
            mock={mock}
            className={`individualFixture`}
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

  await getNewTips(allTipsSorted);

  // await renderTips();
}

export function getAccumulatorPrice(priceArray) {
  var result = 1;
  for (var i = 0; i < priceArray.length; i++)
    result = result * priceArray[i].rawOdds;

  return result;
}

export function getCoverBetMaxReturns(priceArray, minAccSize, stake) {
  var total = 0;
  combinations = 0;

  for (var i = minAccSize; i <= priceArray.length; i++) {
    var perms = getUniquePermutations(priceArray, i);
    combinations = combinations + perms.length;

    for (var j = 0; j < perms.length; j++)
      total += getAccumulatorPrice(perms[j]) * stake;
  }
  return parseFloat(total.toFixed(2));
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
            buttonText={"Exotic of the day"}
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
            buttonText={"Exotic of the day"}
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

  if (XGDiffTips.length > 0) {
    ReactDOM.render(
      <div>
        <Fragment>
          <Collapsable
            buttonText={"XG Tips"}
            text={
              <ul className="XGDiffTips">
                <lh>Games with greatest XG Differentials</lh>
                {XGDiffTips.map((tip) => (
                  <li className={tip.outcome} key={tip.game}>
                    {tip.game} | {tip.prediction} {tip.odds}
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
            buttonText={"XG Tips"}
            text={
              <ul className="XGDiffTips">
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

  // ReactDOM.render(
  //   <div className="pointsGapExplainer">
  //     * games with greatest XG differentials
  //   </div>,
  //   document.getElementById("XGDiff")
  // );
}
