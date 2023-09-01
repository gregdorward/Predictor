import React, { Fragment } from "react";
import ReactDOM from "react-dom";
import { matches, diff } from "./getFixtures";
import { Fixture } from "../components/Fixture";
import { RenderAllFixtures } from "../logic/getFixtures";
import Div from "../components/Div";
import Collapsable from "../components/CollapsableElement";
import { allForm } from "../logic/getFixtures";
import Increment from "../components/Increment";
import { incrementValue } from "../components/Increment";
import { getBTTSPotential } from "../logic/getBTTSPotential";
import { allLeagueResultsArrayOfObjects } from "../logic/getFixtures";
import { Slider } from "../components/Carousel";
import { StyledKofiButton } from "../components/KofiButton";
import {
  calculateAttackingStrength,
  calculateDefensiveStrength,
  calculateMetricStrength,
  getXGtoActualDifferentialStrength,
} from "./getStats";

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
let totalROI = 0;
let totalInvestment = 0;
let totalProfit = 0;
export let formObjectHome;
export let formObjectAway;
export let clicked = false;

export var renderPredictions;

async function convertTimestamp(timestamp) {
  let newDate = new Date(timestamp * 1000);
  let [day, month, year] = newDate.toLocaleDateString("en-US").split("/");

  let converted = `${year}-${day}-${month}`;

  return converted;
}

export function getPointsFromLastX(lastX) {
  let points = 0;
  let pointsAddition;

  try {
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
  } catch (error) {
    console.log(error);
    return "N/A";
  }
}

async function getPastLeagueResults(team, game, hOrA, form) {
  let date = game.date;
  if (allLeagueResultsArrayOfObjects[game.leagueIndex].fixtures.length > 35) {
    let teamsHomeResults = allLeagueResultsArrayOfObjects[
      game.leagueIndex
    ].fixtures.filter((fixture) => fixture.home_name === team);

    teamsHomeResults = teamsHomeResults
      .filter(function (item) {
        return item.date_unix < date;
      })
      .sort((a, b) => a.date_unix - b.date_unix);

    let teamsAwayResults = allLeagueResultsArrayOfObjects[
      game.leagueIndex
    ].fixtures.filter((fixture) => fixture.away_name === team);

    teamsAwayResults = teamsAwayResults
      .filter(function (item) {
        return item.date_unix < date;
      })
      .sort((a, b) => a.date_unix - b.date_unix);

    let homeResults = [];
    let awayResults = [];
    let oddsSumHome = 0;
    let oddsSumAway = 0;
    for (let index = 0; index < teamsHomeResults.length; index++) {
      const resultedGame = teamsHomeResults[index];

      homeResults.push({
        homeTeam: resultedGame.home_name,
        homeGoals: resultedGame.homeGoalCount,
        XG: resultedGame.team_a_xg,
        awayTeam: resultedGame.away_name,
        awayGoals: resultedGame.awayGoalCount,
        XGAgainst: resultedGame.team_b_xg,
        possession: resultedGame.team_a_possession,
        scored: resultedGame.homeGoalCount,
        conceeded: resultedGame.awayGoalCount,
        shots: resultedGame.team_a_shots,
        sot: resultedGame.team_a_shotsOnTarget,
        dangerousAttacks: resultedGame.team_a_dangerous_attacks,
        corners: resultedGame.team_a_corners,
        date: await convertTimestamp(resultedGame.date_unix),
        dateRaw: resultedGame.date_unix,
        oddsHome: resultedGame.odds_ft_1,
        oddsAway: resultedGame.odds_ft_2,
        btts:
          resultedGame.homeGoalCount > 0 && resultedGame.awayGoalCount > 0
            ? true
            : false,
      });
      oddsSumHome = oddsSumHome + resultedGame.odds_ft_1;
    }
    for (let index = 0; index < teamsAwayResults.length; index++) {
      const resultedGame = teamsAwayResults[index];
      awayResults.push({
        homeTeam: resultedGame.home_name,
        homeGoals: resultedGame.homeGoalCount,
        XG: resultedGame.team_b_xg,
        awayTeam: resultedGame.away_name,
        awayGoals: resultedGame.awayGoalCount,
        XGAgainst: resultedGame.team_a_xg,
        possession: resultedGame.team_b_possession,
        scored: resultedGame.awayGoalCount,
        conceeded: resultedGame.homeGoalCount,
        shots: resultedGame.team_b_shots,
        sot: resultedGame.team_b_shotsOnTarget,
        dangerousAttacks: resultedGame.team_b_dangerous_attacks,
        corners: resultedGame.team_b_corners,
        date: await convertTimestamp(resultedGame.date_unix),
        dateRaw: resultedGame.date_unix,
        oddsHome: resultedGame.odds_ft_1,
        oddsAway: resultedGame.odds_ft_2,
        btts:
          resultedGame.homeGoalCount > 0 && resultedGame.awayGoalCount > 0
            ? true
            : false,
      });
      oddsSumAway = oddsSumAway + resultedGame.odds_ft_2;
    }

    let reversedResultsHome = homeResults;
    let reversedResultsAway = awayResults;

    const allTeamResults = reversedResultsHome
      .concat(reversedResultsAway)
      .sort((a, b) => a.dateRaw - b.dateRaw);

    form.allTeamResults = allTeamResults.sort((b, a) => a.dateRaw - b.dateRaw);

    const averageOddsHome = oddsSumHome / teamsHomeResults.length;
    const averageOddsAway = oddsSumAway / teamsAwayResults.length;

    const teamGoalsHome = reversedResultsHome.map((res) => res.scored);

    const teamGoalsAway = reversedResultsAway.map((res) => res.scored);
    const teamGoalsAll = allTeamResults.map((res) => res.scored);

    const teamConceededHome = reversedResultsHome.map((res) => res.conceeded);
    const teamConceededAway = reversedResultsAway.map((res) => res.conceeded);
    const teamConceededAll = allTeamResults.map((res) => res.conceeded);

    const teamXGForAll = allTeamResults.map((res) => res.XG);
    const teamXGAgainstAll = allTeamResults.map((res) => res.XGAgainst);
    const XGSum = teamXGForAll.reduce((a, b) => a + b, 0);
    const avgXGScored = XGSum / teamXGForAll.length || 0;
    const XGAgainstSum = teamXGAgainstAll.reduce((a, b) => a + b, 0);
    const avgXGConceeded = XGAgainstSum / teamXGAgainstAll.length || 0;

    const possession = allTeamResults.map((res) => res.possession);
    const possessionSum = possession.reduce((a, b) => a + b, 0);
    const avgPossession = possessionSum / possession.length || 0;

    const dangerousAttacks = allTeamResults.map((res) => res.dangerousAttacks);
    const dangerousAttacksSum = dangerousAttacks.reduce((a, b) => a + b, 0);
    const avgDangerousAttacks =
      dangerousAttacksSum / dangerousAttacks.length || 0;

    const shots = allTeamResults.map((res) => res.shots);
    const shotsSum = shots.reduce((a, b) => a + b, 0);
    const avgShots = shotsSum / shots.length || 0;

    const shotsOnTarget = allTeamResults.map((res) => res.sot);
    const shotsOnTargetSum = shotsOnTarget.reduce((a, b) => a + b, 0);
    const avgShotsOnTarget = shotsOnTargetSum / shotsOnTarget.length || 0;

    const corners = allTeamResults.map((res) => res.corners);
    const cornersSum = corners.reduce((a, b) => a + b, 0);
    const cornersAv = cornersSum / corners.length || 0;

    const last5XG = teamXGForAll.slice(4);
    const last5XGSum = last5XG.reduce((a, b) => a + b, 0);
    const last5XGAvgFor = last5XGSum / last5XG.length || 0;

    const last5XGAgainst = teamXGAgainstAll.slice(4);
    const last5XGAgainstSum = last5XGAgainst.reduce((a, b) => a + b, 0);
    const last5XGAvgAgainst = last5XGAgainstSum / last5XGAgainst.length || 0;

    form.XGOverall = parseFloat(avgXGScored.toFixed(2));
    form.XGlast5 = parseFloat(last5XGAvgFor.toFixed(2));

    form.XGAgainstAvgOverall = parseFloat(avgXGConceeded.toFixed(2));
    form.XGAgainstlast5 = parseFloat(last5XGAvgAgainst.toFixed(2));

    form.AveragePossessionOverall = parseFloat(avgPossession.toFixed(1));
    form.AverageDangerousAttacksOverall = parseFloat(
      avgDangerousAttacks.toFixed(1)
    );
    form["Average Shots"] = parseFloat(avgShots.toFixed(1));
    form.AverageCorners = parseFloat(cornersAv.toFixed(1));
    form.AverageShotsOnTargetOverall = parseFloat(avgShotsOnTarget.toFixed(1));
    const alpha = 0.3;
    const beta = 0.3;

    let forAndAgainstRollingAv;
    let forAndAgainstRollingAvHomeOrAway;
    if (hOrA === "home") {
      form.allGoalsArrayHome = teamGoalsAll;
      form.allConceededArrayHome = teamConceededAll;
      const sum = teamGoalsHome.reduce((a, b) => a + b, 0);
      const sumTwo = teamConceededHome.reduce((a, b) => a + b, 0);
      form.goalDifferenceHomeOrAway = sum - sumTwo;
      forAndAgainstRollingAv = await predictGoalsWithExponentialSmoothing(
        teamGoalsAll,
        teamConceededAll,
        alpha
      );
      forAndAgainstRollingAvHomeOrAway =
        await predictGoalsWithExponentialSmoothing(
          teamGoalsHome,
          teamConceededHome,
          beta
        );
    } else if (hOrA === "away") {
      form.allGoalsArrayAway = teamGoalsAll;
      form.allConceededArrayAway = teamConceededAll;
      const sum = teamGoalsAway.reduce((a, b) => a + b, 0);
      const sumTwo = teamConceededAway.reduce((a, b) => a + b, 0);
      form.goalDifferenceHomeOrAway = sum - sumTwo;
      forAndAgainstRollingAv = await predictGoalsWithExponentialSmoothing(
        teamGoalsAll,
        teamConceededAll,
        alpha
      );
      forAndAgainstRollingAvHomeOrAway =
        await predictGoalsWithExponentialSmoothing(
          teamGoalsAway,
          teamConceededAway,
          beta
        );
    }

    let bttsHome = reversedResultsHome.map((res) => res.btts);
    if (bttsHome.length > 10) {
      bttsHome = bttsHome.slice(-10);
    }

    let bttsAway = reversedResultsAway.map((res) => res.btts);
    if (bttsAway.length > 10) {
      bttsAway = bttsAway.slice(-10);
    }

    let bttsAll = allTeamResults.map((res) => res.btts);
    if (bttsAll.length > 10) {
      bttsAll = bttsAll.slice(-10);
    }

    const bttsHomeCount = bttsHome.filter((btts) => btts === true);
    const bttsHomeString = `${bttsHomeCount.length}/${bttsHome.length}`;
    const bttsHomePercentage = ((bttsHomeCount.length / bttsHome.length) * 100).toFixed(0);
    const bttsAwayCount = bttsAway.filter((btts) => btts === true);
    const bttsAwayString = `${bttsAwayCount.length}/${bttsAway.length}`;
    const bttsAwayPercentage = ((bttsAwayCount.length / bttsAway.length) * 100).toFixed(0);
    const bttsAllCount = bttsAll.filter((btts) => btts === true);
    const bttsAllString = `${bttsAllCount.length}/${bttsAll.length}`;
    const bttsAllPercentage = ((bttsAllCount.length / bttsAll.length) * 100).toFixed(0);

    let r = 6;
    let x = 4;

    const teamGoalsHomeRollingAverage = await predictNextWeightedMovingAverage(
      teamGoalsHome,
      teamGoalsHome.length < x ? teamGoalsHome.length : x
    );

    const teamGoalsAwayRollingAverage = await predictNextWeightedMovingAverage(
      teamGoalsAway,
      teamGoalsAway.length < x ? teamGoalsAway.length : x
    );

    const teamGoalsAllRollingAverage = await predictNextWeightedMovingAverage(
      teamGoalsAll,
      teamGoalsAll.length < r ? teamGoalsAll.length : r
    );

    const teamConceededHomeRollingAverage =
      await predictNextWeightedMovingAverage(
        teamConceededHome,
        teamConceededHome.length < x ? teamConceededHome.length : x
      );

    const teamConceededAwayRollingAverage =
      await predictNextWeightedMovingAverage(
        teamConceededAway,
        teamConceededAway.length < x ? teamConceededAway.length : x
      );

    const teamGoalsConceededAllRollingAverage =
      await predictNextWeightedMovingAverage(
        teamConceededAll,
        teamConceededAll.length < r ? teamConceededAll.length : r
      );

    const sum = teamGoalsAll.reduce((a, b) => a + b, 0);
    const avgScored = sum / teamGoalsAll.length || 0;

    const last5 = teamGoalsAll.slice(4);
    const last5Sum = last5.reduce((a, b) => a + b, 0);
    const last5AvgScored = last5Sum / last5.length || 0;
    const last10 = teamGoalsAll.slice(9);
    const last10Sum = last10.reduce((a, b) => a + b, 0);
    const last10AvgScored = last10Sum / last10.length || 0;
    form.last5Goals = parseFloat(last5AvgScored.toFixed(2));
    form.last10Goals = parseFloat(last10AvgScored.toFixed(2));

    const sumTwo = teamConceededAll.reduce((a, b) => a + b, 0);
    const avgConceeded = sumTwo / teamConceededAll.length || 0;

    form.goalDifference = sum - sumTwo;


// console.log(teamGoalsHomeRollingAverage)
// console.log(teamGoalsAwayRollingAverage)
// console.log(teamGoalsAllRollingAverage)
// console.log(teamConceededHomeRollingAverage)
// console.log(teamConceededAwayRollingAverage)
// console.log(teamGoalsConceededAllRollingAverage)
// console.log(averageOddsHome)
// console.log(averageOddsAway)
// console.log(avgScored)
// console.log(avgConceeded)
// console.log(bttsAllString)
// console.log(bttsHomeString)
// console.log(bttsAwayString)
// console.log(bttsAllPercentage)
// console.log(bttsHomePercentage)
// console.log(bttsAwayPercentage)
// console.log(forAndAgainstRollingAvHomeOrAway)
// console.log(forAndAgainstRollingAv)

    return [
      teamGoalsHomeRollingAverage,
      teamGoalsAwayRollingAverage,
      teamGoalsAllRollingAverage,
      teamConceededHomeRollingAverage,
      teamConceededAwayRollingAverage,
      teamGoalsConceededAllRollingAverage,
      averageOddsHome,
      averageOddsAway,
      avgScored,
      avgConceeded,
      bttsAllString,
      bttsHomeString,
      bttsAwayString,
      bttsAllPercentage,
      bttsHomePercentage,
      bttsAwayPercentage,
      forAndAgainstRollingAvHomeOrAway,
      forAndAgainstRollingAv,
    ];
  } else {
    return null;
  }
}

var getEMA = (a, r) =>
  a.reduce(
    (p, n, i) =>
      i
        ? p.concat((2 * n) / (r + 1) + (p[p.length - 1] * (r - 1)) / (r + 1))
        : p,
    [a[0]]
  );

async function predictNextWeightedMovingAverage(numbers, windowSize) {
  const startIndex = numbers.length - windowSize;
  const window = numbers.slice(startIndex);
  const weights = Array.from(
    { length: windowSize },
    (_, i) => (i + 1) / ((windowSize * (windowSize + 1)) / 2)
  );
  const sum = window.reduce((acc, num, i) => acc + num * weights[i], 0);
  const movingAverage = sum / weights.reduce((acc, w) => acc + w, 0);
  return parseFloat(movingAverage.toFixed(2));
}

// Function to calculate the weighted average using exponential smoothing
async function calculateWeightedAverage(arr, alpha) {
  let weightedSum = 0;
  let totalWeight = 0;

  for (let i = arr.length - 1; i >= 0; i--) {
    const weight = Math.pow(1 - alpha, arr.length - 1 - i);
    weightedSum += arr[i] * weight;
    totalWeight += weight;
  }

  return weightedSum / totalWeight;
}

// Function to predict goals scored and conceded for a team with exponential smoothing
async function predictGoalsWithExponentialSmoothing(
  teamGoalsFor,
  teamGoalsAgainst,
  alpha
) {
  const lambdaFor = await calculateWeightedAverage(teamGoalsFor, alpha);
  const lambdaAgainst = await calculateWeightedAverage(teamGoalsAgainst, alpha);

  // You can fine-tune these values based on your model and data
  const predictedGoalsFor = lambdaFor;
  const predictedGoalsAgainst = lambdaAgainst;

  return {
    goalsFor: predictedGoalsFor,
    goalsAgainst: predictedGoalsAgainst,
  };
}

export async function compareStat(statOne, statTwo) {
  let stat1 = parseFloat(statOne);
  let stat2 = parseFloat(statTwo);
  let statDiff;
  // console.log( await normalizeValues(12, 2, 0, 1))
  // console.log(await diff(1.8571428571428571, 1.14285714285714285))

  if (statOne !== 0 && statTwo !== 0) {
    const { normalizedValue1, normalizedValue2 } = await normalizeValues(
      stat1,
      stat2,
      0,
      1
    );

    const finalValue1 = normalizedValue1 + 1;
    const finalValue2 = normalizedValue2 + 1;

    statDiff = await diff(finalValue1, finalValue2);

  } else {
    statDiff = 0;
  }

  return statDiff;
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
      pointsDiffWeightingHome = 0.3;
      pointsDiffWeightingAway = -0.3;
      break;
    case pointsDiff >= 2 && pointsDiff < 2.5:
      pointsDiffWeightingHome = 0.2;
      pointsDiffWeightingAway = -0.2;
      break;
    case pointsDiff >= 1.5 && pointsDiff < 2:
      pointsDiffWeightingHome = 0.15;
      pointsDiffWeightingAway = -0.15;
      break;
    case pointsDiff >= 1 && pointsDiff < 1.5:
      pointsDiffWeightingHome = 0.1;
      pointsDiffWeightingAway = -0.1;
      break;
    case pointsDiff >= 0.5 && pointsDiff < 1:
      pointsDiffWeightingHome = 0.05;
      pointsDiffWeightingAway = -0.05;
      break;
    case pointsDiff > -0.5 && pointsDiff < 0.5:
      pointsDiffWeightingHome = 0;
      pointsDiffWeightingAway = 0;
      break;
    case pointsDiff <= -0.5 && pointsDiff > -1:
      pointsDiffWeightingHome = -0.05;
      pointsDiffWeightingAway = 0.05;
      break;
    case pointsDiff <= -1 && pointsDiff > -1.5:
      pointsDiffWeightingHome = -0.1;
      pointsDiffWeightingAway = 0.1;
      break;
    case pointsDiff <= -1.5 && pointsDiff > -2:
      pointsDiffWeightingHome = -0.15;
      pointsDiffWeightingAway = 0.15;
      break;
    case pointsDiff <= -2 && pointsDiff > -2.5:
      pointsDiffWeightingHome = -0.2;
      pointsDiffWeightingAway = 0.2;
      break;
    case pointsDiff <= -2.5:
      pointsDiffWeightingHome = -0.3;
      pointsDiffWeightingAway = 0.3;
      break;
    default:
      pointsDiffWeightingHome = 0;
      pointsDiffWeightingAway = 0;
  }
  return [pointsDiffWeightingHome, pointsDiffWeightingAway];
}

export async function compareFormTrend(recentForm, distantForm) {
  let score;
  let scoreTotal = 0;

  for (let index = 0; index < recentForm.length; index++) {
    const recent = recentForm[index];
    const distant = distantForm[index];

    if (recent > distant) {
      score = 1.05;
    } else if (recent === distant) {
      score = 1;
    } else if (recent < distant) {
      score = 0.95;
    }
    scoreTotal = scoreTotal + score / recentForm.length;
  }

  return scoreTotal;
}

export async function getPointAverage(pointTotal, games) {
  return pointTotal / games;
}

async function getOddsMultiplier(odds, team) {
  let multiplier;
  switch (true) {
    case odds <= 1.2:
      multiplier = 1.4;
      break;
    case odds <= 1.4:
      multiplier = 1.3;
      break;
    case odds <= 1.6:
      multiplier = 1.2;
      break;
    case odds <= 1.8:
      multiplier = 1.1;
      break;
    case odds < 2:
      multiplier = 1.05;
      break;

    // case odds <= 3.5 && odds > 3:
    //   multiplier = 0.975;
    //   break;
    // case odds > 3.5 && odds <= 4:
    //   multiplier = 0.95;
    //   break;
    // case odds > 4 && odds <= 4.5:
    //   multiplier = 0.9;
    //   break;
    // case odds > 4.5 && odds <= 5:
    //   multiplier = 0.8;
    //   break;
    //   case odds > 5:
    //     multiplier = 0.7;
    //     break;
    default:
      multiplier = 1;
      break;
  }

  return multiplier;
}

async function poissonDistribution(lambda, k) {
  const numerator = Math.exp(-lambda) * Math.pow(lambda, k);
  const denominator = factorial(k);
  return numerator / denominator;
}

function factorial(n) {
  if (n === 0 || n === 1) {
    return 1;
  }
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}

async function calculateAverageGoals(goalsFor) {
  const totalGoals = goalsFor.reduce((sum, goals) => sum + goals, 0);
  return totalGoals / goalsFor.length;
}

async function adjustGoalsAvg(goalsAvg, strengthRatio) {
  return goalsAvg * strengthRatio;
}

async function predictScore(
  goalsForTeam1,
  goalsAgainstTeam1,
  goalsForTeam2,
  goalsAgainstTeam2,
  team1Metrics,
  team2Metrics,
  game
) {
  let team1AverageGoalsFor = await calculateAverageGoals(goalsForTeam1);
  let team1AverageGoalsAgainst = await calculateAverageGoals(goalsAgainstTeam1);
  let team2AverageGoalsFor = await calculateAverageGoals(goalsForTeam2);
  let team2AverageGoalsAgainst = await calculateAverageGoals(goalsAgainstTeam2);

  let team1StrengthRatio = team1Metrics.weighting / 1.75;
  let team2StrengthRatio = team2Metrics.weighting / 1.75;

  let adjustedTeam1AverageGoals = await adjustGoalsAvg(
    team1AverageGoalsFor,
    team1StrengthRatio
  );
  let adjustedTeam2AverageGoals = await adjustGoalsAvg(
    team2AverageGoalsFor,
    team2StrengthRatio
  );

  let adjustedTeam1AverageGoalsAgainst = await adjustGoalsAvg(
    team1AverageGoalsAgainst,
    team2StrengthRatio
  );
  let adjustedTeam2AverageGoalsAgainst = await adjustGoalsAvg(
    team2AverageGoalsAgainst,
    team1StrengthRatio
  );

  let maxGoals = 5; // Set the maximum number of goals to predict

  const scores = [];

  for (let i = 0; i <= maxGoals; i++) {
    for (let j = 0; j <= maxGoals; j++) {
      let team1GoalExpectation =
        adjustedTeam1AverageGoals *
        (adjustedTeam2AverageGoalsAgainst / adjustedTeam1AverageGoalsAgainst);
      let team2GoalExpectation =
        adjustedTeam2AverageGoals *
        (adjustedTeam1AverageGoalsAgainst / adjustedTeam2AverageGoalsAgainst);

      if (!isFinite(team1GoalExpectation)) {
        team1GoalExpectation = 0;
      }

      if (!isFinite(team2GoalExpectation)) {
        team2GoalExpectation = 0;
      }

      const probability =
        (await poissonDistribution(team1GoalExpectation, i)) *
        (await poissonDistribution(team2GoalExpectation, j));
      scores.push({
        team1Score: i,
        team2Score: j,
        probability,
      });
    }
  }

  scores.sort((a, b) => b.probability - a.probability); // Sort scores in descending order by probability
  const top5Scores = scores.slice(0, 5); // Get the top 5 scores


  for (const score of top5Scores) {
    console.log(
      `Team 1: ${score.team1Score} - Team 2: ${score.team2Score} (${(
        score.probability * 100
      ).toFixed(2)}%)`
    );
  }
  return top5Scores;
}


async function normalizeValues(value1, value2, minRange, maxRange) {
  if (
    typeof value1 !== "number" ||
    typeof value2 !== "number" ||
    typeof minRange !== "number" ||
    typeof maxRange !== "number"
  ) {
    throw new Error("All arguments must be numbers.");
  }

  // Calculate the absolute values of the inputs
  const absValue1 = Math.abs(value1);
  const absValue2 = Math.abs(value2);

  // Calculate the total sum of the absolute values
  const totalAbs = absValue1 + absValue2;

  // Calculate the normalized values based on the ratio of absolute values
  const normalizedAbsValue1 =
    (absValue1 / totalAbs) * (maxRange - minRange) + minRange;
  const normalizedAbsValue2 =
    (absValue2 / totalAbs) * (maxRange - minRange) + minRange;

  // Adjust the signs of the normalized values based on the original values
  const normalizedValue1 =
    value1 >= 0 ? normalizedAbsValue1 : -normalizedAbsValue1;
  const normalizedValue2 =
    value2 >= 0 ? normalizedAbsValue2 : -normalizedAbsValue2;

  return { normalizedValue1, normalizedValue2 };
}

export async function compareTeams(homeForm, awayForm, match) {
  let homeAttackStrength = homeForm.attackingStrength;
  let homeDefenceStrength = homeForm.defensiveStrength;
  let homePossessionStrength = homeForm.possessionStrength;
  let awayAttackStrength = awayForm.attackingStrength;
  let awayDefenceStrength = awayForm.defensiveStrength;
  let awayPossessionStrength = awayForm.possessionStrength;

  let homeXGtoActualDiffStrength = await getXGtoActualDifferentialStrength(
    parseFloat(homeForm.actualToXGDifference)
  );

  let awayXGtoActualDiffStrength = await getXGtoActualDifferentialStrength(
    parseFloat(awayForm.actualToXGDifference)
  );

  const attackStrengthComparison = await compareStat(
    homeAttackStrength,
    awayAttackStrength
  );

  const defenceStrengthComparison = await compareStat(
    homeDefenceStrength,
    awayDefenceStrength
  );

  const possessiontrengthComparison = await compareStat(
    homePossessionStrength,
    awayPossessionStrength
  );

  const xgActualComparison = await compareStat(
    homeXGtoActualDiffStrength,
    awayXGtoActualDiffStrength
  );

  const xgAgainstComparison = await compareStat(
    homeForm.xgAgainstStrength,
    awayForm.xgAgainstStrength
  );

  const homeAwayPointAverageComparison = await compareStat(
    homeForm.homeOrAwayAverage,
    awayForm.homeOrAwayAverage
  );

  const fiveGameComparison = await compareStat(
    homeForm.last5Points,
    awayForm.last5Points
  );

  const oddsComparison = await compareStat(match.awayOdds, match.homeOdds);

  const homeAdvantage = await compareStat(parseFloat(homeForm.homeAttackAdvantage) / 2, 1);


  const dangerousAttacksWithConverstionComparison = await compareStat(
    homeForm.AverageDangerousAttacksOverall *
      homeForm.dangerousAttackConversion,
    awayForm.AverageDangerousAttacksOverall * awayForm.dangerousAttackConversion
  );

  const goalDiffHomeOrAwayComparison = await compareStat(
    homeForm.goalDifferenceHomeOrAway,
    awayForm.goalDifferenceHomeOrAway
  );

  // console.log(match.game)
  // console.log(attackStrengthComparison)
  // console.log(defenceStrengthComparison)
  // console.log(possessiontrengthComparison)
  // console.log(homeAwayPointAverageComparison)
  // console.log(goalDiffHomeOrAwayComparison)
  // console.log(xgActualComparison)
  // console.log(oddsComparison)
  // console.log(dangerousAttacksWithConverstionComparison)

  let oddsWeighting;

  if(match.game_week > 0 && match.game_week < 5){
    oddsWeighting = 5;
  } else {
    oddsWeighting = 1;
  }

  let calculation =
    attackStrengthComparison * 2 +
    defenceStrengthComparison * 2 +
    possessiontrengthComparison * 2 +
    // xgToActualDiffComparison * 1 +
    // // xgForStrengthRecentComparison * 1 +
    // // xgAgainstStrengthRecentComparison * 1 +
    homeAwayPointAverageComparison * 1 +
    goalDiffHomeOrAwayComparison * 0.5 +
    xgActualComparison * 0 +
    // xgForComparison * 1 +
    // xgAgainstComparison * 1 +
    oddsComparison * oddsWeighting +
    dangerousAttacksWithConverstionComparison * 0 +
    homeAdvantage * 1 +
    fiveGameComparison * 0;

  let homeWinOutcomeProbability =
    match.homeTeamWinPercentage + match.awayTeamLossPercentage;
  let awayWinOutcomeProbability =
    match.homeTeamLossPercentage + match.awayTeamWinPercentage;
  let drawOutcomeProbability =
    match.homeTeamDrawPercentage + match.awayTeamDrawPercentage;


  if (
    drawOutcomeProbability > homeWinOutcomeProbability &&
    drawOutcomeProbability > awayWinOutcomeProbability
  ) {
    switch (true) {
      case drawOutcomeProbability > 100:
        calculation = calculation / 2;
        break;
      default:
        calculation = calculation * 1;
        break;
    }
  } else {
    calculation = calculation * 1;
  }


  if (calculation > 0) {
    if (
      homeForm.lastGame === "L" ||
      homeForm.last2Points < 2 ||
      awayForm.last2Points >= 4 ||
      match.XGdifferentialValueRaw < 0
    ) {
      calculation = calculation / 2;
    }
  } else if (calculation < 0) {
    if (
      awayForm.lastGame === "L" ||
      awayForm.last2Points < 2 ||
      homeForm.last2Points >= 4 ||
      match.XGdifferentialValueRaw > 0
    ) {
      calculation = calculation / 2;
    }
  }

  if (homeForm.averageOddsHome !== null || awayForm.averageOddsAway !== null) {
    if (calculation > 0 && homeForm.averageOddsHome < match.homeOdds) {
      calculation = calculation / 2;
    }
    else if (
      calculation > 0 &&
      homeForm.averageOddsHome > match.homeOdds * 1.5
    ) {
      calculation = calculation * 2.5;
    }
    else {
      calculation = calculation * 1;
    }

    if (calculation < 0 && awayForm.averageOddsAway < match.awayOdds) {
      calculation = calculation / 2;
    }
    else if (
      calculation < 0 &&
      awayForm.averageOddsAway > match.awayOdds * 1.5
    ) {
      calculation = calculation * 2.5;
    }
    else {
      calculation = calculation * 1;
    }
  }
  return calculation;
}

export async function roundCustom(num, form, otherForm) {
  let wholeNumber = Math.floor(num);
  let remainder = num - wholeNumber;
  const DAConversion = form.AverageDangerousAttacksOverall *
  form.dangerousAttackConversion

  
if(DAConversion >= 200){
  return Math.ceil(num);
} else {
  return Math.floor(num);
}
  

  // if (remainder > 0.9 && form.clinicalScore < 0.95) {
  //   return Math.ceil(num);
  // } else {
  // }

  // if (remainder > 0.5) {
  //   return Math.ceil(num);
  // } else {
  //   return Math.floor(num);
  // }
}

//Calculates scores based on prior XG figures, weighted by odds
let i = 0;

export async function calculateScore(match, index, divider, calculate) {
  i++;

  let teams;

  if (
    calculate === true &&
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

      teams[i][index].last5Points = getPointsFromLastX(
        teams[i][index].LastFiveForm
      );

      teams[i][index].last6Points = getPointsFromLastX(
        teams[i][index].LastSixForm
      );

      teams[i][index].last10Points = getPointsFromLastX(
        teams[i][index].LastTenForm
      );

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

      teams[i][0].ScoredAverage = teams[i][0].ScoredOverall / 5;
      teams[i][1].ScoredAverage = teams[i][1].ScoredOverall / 6;
      teams[i][2].ScoredAverage = teams[i][2].ScoredOverall / 10;

      teams[i][0].ConcededAverage = teams[i][0].ConcededOverall / 5;
      teams[i][1].ConcededAverage = teams[i][1].ConcededOverall / 6;
      teams[i][2].ConcededAverage = teams[i][2].ConcededOverall / 10;

      if (teams[i][1].ScoredAverage === 0) {
        teams[i][1].ScoredAverage = teams[i][index].ScoredOverall / 10;
        teams[i][1].ScoredOverall = teams[i][2].ScoredOverall / 2;
      }

      if (teams[i][1].ConcededAverage === 0) {
        teams[i][1].ConcededAverage = teams[i][index].ConcededOverall / 10;
        teams[i][1].ConcededOverall = teams[i][2].ConcededOverall / 2;
      }

      teams[i][index].ScoredAverageShortTerm = teams[i][0].ScoredOverall / 5;
      teams[i][index].ConcededAverageShortTerm =
        teams[i][0].ConcededOverall / 5;

      teams[i][index].longTermAverageGoals = teams[i][2].ScoredOverall / 10;
      teams[i][index].longTermAverageConceeded =
        teams[i][2].ConcededOverall / 10;

      match.GoalsInGamesAverageHome =
        teams[0][0].ScoredAverage + teams[0][0].ConcededAverage;

      match.GoalsInGamesAverageAway =
        teams[1][0].ScoredAverage + teams[1][0].ConcededAverage;

      let recentGoalDiff =
        teams[i][index].ScoredAverageShortTerm -
        teams[i][index].ConcededAverageShortTerm;
      let distantGoalDiff =
        teams[i][index].longTermAverageGoals -
        teams[i][index].longTermAverageConceeded;

      let recentDA = teams[i][0].AverageDangerousAttacksOverall;
      let distantDA = teams[i][2].AverageDangerousAttacksOverall;

      let recentPosession = teams[i][0].AveragePossessionOverall;
      let distantPosession = teams[i][2].AveragePossessionOverall;

      let recentCleanSheet = teams[i][0].CleanSheetPercentage;
      let distantCleanSheet = teams[i][2].CleanSheetPercentage;

      let recentFormArray = [
        recentGoalDiff,
        recentDA,
        recentPosession,
        recentCleanSheet,
      ];
      let distantFormArray = [
        distantGoalDiff,
        distantDA,
        distantPosession,
        distantCleanSheet,
      ];

      teams[i][index].formTrendScore = await compareFormTrend(
        recentFormArray,
        distantFormArray
      );

      teams[i][index].expectedGoals = parseFloat(teams[i][index].XG);

      teams[i][index].ScoredAverageShortAndLongTerm =
        (teams[i][index].ScoredOverall / 10 +
          teams[i][index].ScoredAverageShortTerm) /
        2;

      teams[i][index].conceededAverageShortAndLongTerm =
        (teams[i][index].ConcededOverall / 10 +
          teams[i][index].ConcededAverageShortTerm) /
        2;

      teams[i][index].longTermGoalDifference =
        teams[i][2].ScoredAverage - teams[i][2].ConcededAverage;

      teams[i][index].shortTermGoalDifference =
        teams[i][0].ScoredAverage - teams[i][0].ConcededAverage;

      teams[i][index].XGdifferential = await diff(
        teams[i][index].XGOverall,
        teams[i][index].XGAgainstAvgOverall
      );

      teams[i][index].XGdifferentialRecent = await diff(
        teams[i][0].XGOverall,
        teams[i][0].XGAgainstAvgOverall
      );

      teams[i][index].actualToXGDifference = await diff(
        teams[i][index].XGdifferential,
        teams[i][index].goalDifference
      );

      teams[i][index].actualToXGDifferenceRecent = await diff(
        teams[i][index].shortTermGoalDifference,
        teams[i][index].XGdifferentialRecent
      );

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

    formHome = teams[0][index];
    formAway = teams[1][index];

    let formHomeRecent = teams[0][1];
    let formAwayRecent = teams[1][1];

    let homeTenGameAvg = formHome.last10Points / 10;
    let awayTenGameAvg = formAway.last10Points / 10;

    let homeTwoGameAvg = formHome.last2Points / 2;
    let awayTwoGameAvg = formAway.last2Points / 2;

    let pointsDiff10 = await getPointsDifferential(
      homeTenGameAvg,
      awayTenGameAvg
    );

    let pointsDiff2 = await getPointsDifferential(
      homeTwoGameAvg,
      awayTwoGameAvg
    );

    let [last10WeightingHome, last10WeightingAway] = await getPointWeighting(
      pointsDiff10
    );

    let [last2WeightingHome, last2WeightingAway] = await getPointWeighting(
      pointsDiff2
    );

    formHome.dangerousAttackConversion =
      (formHome.ScoredAverageShortAndLongTerm /
        formHome.AverageDangerousAttacksOverall) *
      100;
    formAway.dangerousAttackConversion =
      (formAway.ScoredAverageShortAndLongTerm /
        formAway.AverageDangerousAttacksOverall) *
      100;

    [formHome.clinicalRating, formHome.clinicalScore] = await getClinicalRating(
      formHome
    );
    [formAway.clinicalRating, formAway.clinicalScore] = await getClinicalRating(
      formAway
    );

    let XGdifferential = await diff(
      formHome.XGdifferential,
      formAway.XGdifferential
    );

    match.XGdifferentialValue = Math.abs(XGdifferential);
    match.XGdifferentialValueRaw = parseFloat(XGdifferential);
    if (
      allLeagueResultsArrayOfObjects[match.leagueIndex].fixtures.length > 35 &&
      match.leagueID !== 7956
    ) {
      [
        formHome.predictedGoalsBasedOnHomeAv,
        formHome.predictedGoalsBasedOnAwayAv,
        formHome.allTeamGoalsBasedOnAverages,
        formHome.predictedGoalsConceededBasedOnHomeAv,
        formHome.predictedGoalsConceededBasedOnAwayAv,
        formHome.allTeamGoalsConceededBasedOnAverages,
        formHome.averageOddsHome,
        formHome.averageOddsAway,
        formHome.averageScoredLeague,
        formHome.averageConceededLeague,
        formHome.last10btts,
        formHome.last10bttsHome,
        formHome.last10bttsAway,
        match.bttsAllPercentageHome,
        match.bttsPercentageHomeHome,
        match.bttsPercentageHomeAway,
        formHome.forAndAgainstRollingAv,
        formHome.forAndAgainstRollingAvHomeOrAway,
      ] = await getPastLeagueResults(match.homeTeam, match, "home", formHome);

      [
        formAway.predictedGoalsBasedOnHomeAv,
        formAway.predictedGoalsBasedOnAwayAv,
        formAway.allTeamGoalsBasedOnAverages,
        formAway.predictedGoalsConceededBasedOnHomeAv,
        formAway.predictedGoalsConceededBasedOnAwayAv,
        formAway.allTeamGoalsConceededBasedOnAverages,
        formAway.averageOddsHome,
        formAway.averageOddsAway,
        formAway.averageScoredLeague,
        formAway.averageConceededLeague,
        formAway.last10btts,
        formAway.last10bttsHome,
        formAway.last10bttsAway,
        match.bttsAllPercentageAway,
        match.bttsPercentageAwayHome,
        match.bttsPercentageAwayAway,
        formAway.forAndAgainstRollingAv,
        formAway.forAndAgainstRollingAvHomeOrAway,
      ] = await getPastLeagueResults(match.awayTeam, match, "away", formAway);
    } else {
      formHome.predictedGoalsBasedOnHomeAv = formHome.ScoredAverage;
      formHome.predictedGoalsBasedOnAwayAv = formHome.ConcededAverage;
      formHome.allTeamGoalsBasedOnAverages = formHome.ScoredAverage;
      formHome.forAndAgainstRollingAv = {
        goalsFor: formHome.ScoredAverage,
        goalsAgainst: formHome.ConcededAverage,
      };
      formHome.forAndAgainstRollingAvHomeOrAway = {
        goalsFor: formHome.ScoredAverage,
        goalsAgainst: formHome.ConcededAverage,
      };
      formHome.predictedGoalsConceededBasedOnHomeAv = formHome.ConcededAverage;
      formHome.predictedGoalsConceededBasedOnAwayAv = formHome.ConcededAverage;
      formHome.allTeamGoalsConceededBasedOnAverages = formHome.ConcededAverage;
      formHome.averageOddsHome = null;
      formHome.averageOddsAway = null;
      formHome.averageScoredLeague = null;
      formHome.averageConceededLeague = null;
      formHome.goalDifference =
        formHome.ScoredOverall - formHome.ConcededOverall;
      formHome.goalDifferenceHomeOrAway =
        formHome.ScoredOverall - formHome.ConcededOverall;
      formHome.last10btts = null;
      formHome.last10bttsHome = null;
      formHome.last10bttsAway = null;
      formHome.allTeamResults = [];
      match.bttsAllPercentageHome = '';
      match.bttsPercentageHomeHome = '';
      match.bttsPercentageHomeAway = '';
      formAway.predictedGoalsBasedOnHomeAv = formAway.ScoredAverage;
      formAway.predictedGoalsBasedOnAwayAv = formAway.ConcededAverage;
      formAway.allTeamGoalsBasedOnAverages = formAway.ScoredAverage;
      formAway.forAndAgainstRollingAv = {
        goalsFor: formAway.ScoredAverage,
        goalsAgainst: formAway.ConcededAverage,
      };
      formAway.forAndAgainstRollingAvHomeOrAway = {
        goalsFor: formAway.ScoredAverage,
        goalsAgainst: formAway.ConcededAverage,
      };
      formAway.predictedGoalsConceededBasedOnHomeAv = formAway.ConcededAverage;
      formAway.predictedGoalsConceededBasedOnAwayAv = formAway.ConcededAverage;
      formAway.allTeamGoalsConceededBasedOnAverages = formAway.ConcededAverage;
      formAway.averageOddsHome = null;
      formAway.averageOddsAway = null;
      formAway.averageScoredLeague = null;
      formAway.averageConceededLeague = null;
      formAway.goalDifference =
        formAway.ScoredOverall - formAway.ConcededOverall;
      formAway.goalDifferenceHomeOrAway =
        formAway.ScoredOverall - formAway.ConcededOverall;

      formAway.last10btts = null;
      formAway.last10bttsHome = null;
      formAway.last10bttsAway = null;
      formAway.allTeamResults = [];
      match.bttsAllPercentageAway = '';
      match.bttsPercentageAwayHome = '';
      match.bttsPercentageAwayAway = '';
    }

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

    formHome.AttackingPotency = (formHome.XG / formHome.AttacksHome) * 100;
    formAway.AttackingPotency = (formAway.XG / formAway.AttacksAverage) * 100;

    let teamComparisonScore;

    const attackingMetricsHome = {
      "Average Dangerous Attacks": formHome.AverageDangerousAttacksOverall,
      "Average Shots": formHome.AverageShots,
      "Average Shots On Target": formHome.AverageShotsOnTarget,
      "Average Expected Goals": formHome.XGOverall,
      "Recent XG": formHome.XGlast5 ? formHome.XGlast5 : formHome.XGOverall,
      "Average Goals":
        formHome.averageScoredLeague !== undefined &&
        formHome.averageScoredLeague !== null
          ? formHome.averageScoredLeague.toFixed(2)
          : (formHome.ScoredOverall / 10).toFixed(2),
    };
    const attackingMetricsAway = {
      "Average Dangerous Attacks": formAway.AverageDangerousAttacksOverall,
      "Average Shots": formAway.AverageShots,
      "Average Shots On Target": formAway.AverageShotsOnTarget,
      "Average Expected Goals": formAway.XGOverall,
      "Recent XG": formAway.XGlast5 ? formAway.XGlast5 : formAway.XGOverall,
      "Average Goals":
        formAway.averageScoredLeague !== undefined &&
        formAway.averageScoredLeague !== null
          ? formAway.averageScoredLeague.toFixed(2)
          : (formAway.ScoredOverall / 10).toFixed(2),
    };

    const defensiveMetricsHome = {
      "Clean Sheet Percentage": 100 - formHome.CleanSheetPercentage,
      "Average XG Against": formHome.XGAgainstAvgOverall,
      "Recent XG Against": formHome.XGAgainstlast5 ? formHome.XGAgainstlast5 : formHome.XGAgainstAvgOverall,
      "Average Goals Against":
        formHome.averageConceededLeague !== null
          ? formHome.averageConceededLeague.toFixed(2)
          : formHome.ConcededAverage.toFixed(2),
    };

    const defensiveMetricsAway = {
      "Clean Sheet Percentage": 100 - formAway.CleanSheetPercentage,
      "Average XG Against": formAway.XGAgainstAvgOverall,
      "Recent XG Against": formAway.XGAgainstlast5 ? formAway.XGAgainstlast5 : formAway.XGAgainstAvgOverall,
      "Average Goals Against":
        formAway.averageConceededLeague !== null
          ? formAway.averageConceededLeague.toFixed(2)
          : formAway.ConcededAverage.toFixed(2),
    };

    formHome.attackingMetrics = attackingMetricsHome
    formHome.defensiveMetrics = defensiveMetricsHome
    formAway.attackingMetrics = attackingMetricsAway
    formAway.defensiveMetrics = defensiveMetricsAway


    formHome.attackingStrength = await calculateAttackingStrength(
      attackingMetricsHome
    );
    formAway.attackingStrength = await calculateAttackingStrength(
      attackingMetricsAway
    );
    formHome.defensiveStrength = await calculateDefensiveStrength(
      defensiveMetricsHome
    );
    formAway.defensiveStrength = await calculateDefensiveStrength(
      defensiveMetricsAway
    );

    formHome.possessionStrength = await calculateMetricStrength(
      "averagePossession",
      formHome.AveragePossessionOverall
    );
    formHome.xgForStrength = await calculateMetricStrength(
      "xgFor",
      formHome.XGOverall
    );
    formHome.xgAgainstStrength = await calculateMetricStrength(
      "xgAgainst",
      3 - formHome.XGAgainstAvgOverall
    );

    formAway.possessionStrength = await calculateMetricStrength(
      "averagePossession",
      formAway.AveragePossessionOverall
    );
    formAway.xgForStrength = await calculateMetricStrength(
      "xgFor",
      formAway.XGOverall
    );
    formAway.xgAgainstStrength = await calculateMetricStrength(
      "xgAgainst",
      3 - formAway.XGAgainstAvgOverall
    );

    teamComparisonScore = await compareTeams(formHome, formAway, match);

    if (teamComparisonScore < 0) {
      formHome.teamStrengthWeighting = 1 + teamComparisonScore / 10;
      formAway.teamStrengthWeighting = 1 - teamComparisonScore / 10;
    } else if (teamComparisonScore >= 0) {
      formHome.teamStrengthWeighting = 1 + teamComparisonScore / 10;
      formAway.teamStrengthWeighting = 1 - teamComparisonScore / 10;
    }
    console.log(teamComparisonScore)
    teamComparisonScore = teamComparisonScore * 0.85;
    // teamComparisonScore = 0;

    if (teamComparisonScore > 1) {
      teamComparisonScore = 1;
    } else if (teamComparisonScore < -1) {
      teamComparisonScore = -1;
    }
    match.teamComparisonScore = teamComparisonScore.toFixed(2);
    // match.goalWeighting = 1 + parseFloat(match.teamComparisonScore)

    let team1Metrics = {
      weighting: formHome.teamStrengthWeighting,
      // Add other relevant metrics here
    };

    let team2Metrics = {
      weighting: formAway.teamStrengthWeighting,
      // Add other relevant metrics here
    };

    // pass arrays of league goals and conceeded
    let scorePredictions;
    if (
      formHome.allConceededArrayHome !== undefined &&
      formAway.allConceededArrayAway !== undefined
    ) {
      scorePredictions = await predictScore(
        formHome.allGoalsArrayHome,
        formHome.allConceededArrayHome,
        formAway.allGoalsArrayAway,
        formAway.allConceededArrayAway,
        team1Metrics,
        team2Metrics,
        match.game
      );
    }

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

    formHome.rollingAverageGoalsDifferential = parseFloat(
      formHome.allTeamGoalsBasedOnAverages -
        formHome.allTeamGoalsConceededBasedOnAverages
    );
    formAway.rollingAverageGoalsDifferential = parseFloat(
      formAway.allTeamGoalsBasedOnAverages -
        formAway.allTeamGoalsConceededBasedOnAverages
    );

    let goalCalcHomeShortTerm =
      (formHome.ScoredAverageShortTerm + formAway.ConcededAverageShortTerm) / 2;
    let goalCalcAwayShortTerm =
      (formAway.ScoredAverageShortTerm + formHome.ConcededAverageShortTerm) / 2;

    let homeLeagueOrAllFormAverageGoals =
      formHome.LeagueAverageGoals !== undefined
        ? (formHome.LeagueAverageGoals + formAway.LeagueAverageConceded) / 2
        : goalCalcHomeShortTerm;
    let awayLeagueOrAllFormAverageGoals =
      formAway.LeagueAverageGoals !== undefined
        ? (formAway.LeagueAverageGoals + formHome.LeagueAverageConceded) / 2
        : goalCalcAwayShortTerm;

    let factorOneHome;
    let factorOneAway;


    factorOneHome =
      (homeLeagueOrAllFormAverageGoals * 1 +
        formHome.forAndAgainstRollingAvHomeOrAway.goalsFor * 1 +
        formAway.forAndAgainstRollingAvHomeOrAway.goalsAgainst * 1 +
        formHome.forAndAgainstRollingAv.goalsFor * 1 +
        formAway.forAndAgainstRollingAv.goalsAgainst * 1 +
        formHome.allTeamGoalsBasedOnAverages * 0 +
        formAway.allTeamGoalsConceededBasedOnAverages * 0 +
        // formHome.XGOverall * 0.5 +
        // formAway.XGAgainstAvgOverall * 0.5 +
        last10WeightingHome * 0 +
        last2WeightingHome * 0) /
      5;


    factorOneAway =
      (awayLeagueOrAllFormAverageGoals * 1 +
        formAway.forAndAgainstRollingAvHomeOrAway.goalsFor * 1 +
        formHome.forAndAgainstRollingAvHomeOrAway.goalsAgainst * 1 +
        formAway.forAndAgainstRollingAv.goalsFor * 1 +
        formHome.forAndAgainstRollingAv.goalsAgainst * 1 +
        formAway.allTeamGoalsBasedOnAverages * 0 +
        formHome.allTeamGoalsConceededBasedOnAverages * 0 +
        // formAway.XGOverall * 0.5 +
        // formHome.XGAgainstAvgOverall * 0.5 +
        last10WeightingAway * 0 +
        last2WeightingAway * 0) /
      5;


    // factorOneHome =
    //   (homeLeagueOrAllFormAverageGoals * 1 +
    //     // formHome.predictedGoalsBasedOnHomeAv * 0.2 +
    //     // formAway.predictedGoalsConceededBasedOnAwayAv * 0.2 +
    //     ((formHome.forAndAgainstRollingAvHomeOrAway.goalsFor +
    //       formAway.forAndAgainstRollingAvHomeOrAway.goalsAgainst) /
    //       2) *
    //       2 +
    //     formHome.allTeamGoalsBasedOnAverages * 1 +
    //     formAway.allTeamGoalsConceededBasedOnAverages * 1 +
    //     // formHome.XGOverall * 0.5 +
    //     // formAway.XGAgainstAvgOverall * 0.5 +
    //     last10WeightingHome * 1 +
    //     last2WeightingHome * 0) /
    //   5;

    // factorOneAway =
    //   (awayLeagueOrAllFormAverageGoals * 1 +
    //     // formAway.predictedGoalsBasedOnAwayAv * 0.2 +
    //     // formHome.predictedGoalsConceededBasedOnHomeAv * 0.2 +
    //     ((formAway.forAndAgainstRollingAvHomeOrAway.goalsFor +
    //       formHome.forAndAgainstRollingAvHomeOrAway.goalsAgainst) /
    //       2) *
    //       2 +
    //     formAway.allTeamGoalsBasedOnAverages * 1 +
    //     formHome.allTeamGoalsConceededBasedOnAverages * 1 +
    //     // formAway.XGOverall * 0.5 +
    //     // formHome.XGAgainstAvgOverall * 0.5 +
    //     last10WeightingAway * 1 +
    //     last2WeightingAway * 0) /
    //   5;

    let factorTwoHome;
    let factorTwoAway;

    if (
      scorePredictions !== undefined &&
      scorePredictions[0].probability !== 1
    ) {
      factorTwoHome = scorePredictions[0].team1Score;
      factorTwoAway = scorePredictions[0].team2Score;
    } else {
      factorTwoHome = factorOneHome;
      factorTwoAway = factorOneAway;
    }

    let homeComparisonWeighting;
    let awayComparisonWeighting;
    match.scoreDiff = await diff(factorOneHome, factorOneAway);

    if (teamComparisonScore > 0) {
      homeComparisonWeighting = 1 + Math.abs(teamComparisonScore);
      awayComparisonWeighting = 1 + -Math.abs(teamComparisonScore);
    } else if (teamComparisonScore < 0) {
      homeComparisonWeighting = 1 + -Math.abs(teamComparisonScore);
      awayComparisonWeighting = 1 + Math.abs(teamComparisonScore);
    } else {
      homeComparisonWeighting = 1;
      awayComparisonWeighting = 1;
    }

    let experimentalHomeGoals =
      (((factorOneHome * homeComparisonWeighting) * 2 + factorTwoHome * 1) / 3) * 0.85;
    // (formHome.forAndAgainstRollingAvHomeOrAway.goalsFor + formAway.forAndAgainstRollingAvHomeOrAway.goalsAgainst) / 2

    let experimentalAwayGoals =
      (((factorOneAway * awayComparisonWeighting) * 2 + factorTwoAway * 1) / 3) * 0.85;
    // (formAway.forAndAgainstRollingAvHomeOrAway.goalsFor + formHome.forAndAgainstRollingAvHomeOrAway.goalsAgainst) / 2

    let rawFinalHomeGoals = experimentalHomeGoals;
    let rawFinalAwayGoals = experimentalAwayGoals;

    match.rawFinalHomeGoals = rawFinalHomeGoals;
    match.rawFinalAwayGoals = rawFinalAwayGoals;

    // if (
    //   formHome.CleanSheetPercentage > 50 &&
    //   formAway.CleanSheetPercentage > 50
    // ) {
    //   rawFinalHomeGoals = rawFinalHomeGoals - 0.5;
    //   rawFinalAwayGoals = rawFinalAwayGoals - 0.5;
    // }

    if (
      formHome.CleanSheetPercentage < 35 &&
      formAway.CleanSheetPercentage < 35
    ) {
      finalHomeGoals = Math.ceil(rawFinalHomeGoals);
      finalAwayGoals = Math.ceil(rawFinalAwayGoals);
    } else if (
      formHome.CleanSheetPercentage < 40 &&
      formAway.CleanSheetPercentage < 40 &&
      rawFinalHomeGoals < 1 &&
      rawFinalAwayGoals < 1
    ) {
      finalHomeGoals = Math.ceil(rawFinalHomeGoals);
      finalAwayGoals = Math.ceil(rawFinalAwayGoals);
    } else {
      finalHomeGoals = Math.floor(rawFinalHomeGoals);
      finalAwayGoals = Math.floor(rawFinalAwayGoals);
    }

    // finalHomeGoals = await roundCustom(rawFinalHomeGoals, formHome)
    // finalAwayGoals = await roundCustom(rawFinalAwayGoals, formAway)

    if (finalHomeGoals > formHome.averageScoredLeague + 1) {
      finalHomeGoals = Math.round(
        (finalHomeGoals + formHome.averageScoredLeague) / 2
      );
    }

    if (finalAwayGoals > formAway.averageScoredLeague + 1) {
      finalAwayGoals = Math.round(
        (finalAwayGoals + formAway.averageScoredLeague) / 2
      );
    }

    if (finalAwayGoals < 0) {
      let difference = Math.abs(
        parseFloat((await diff(0, finalAwayGoals)) / 2)
      );
      rawFinalHomeGoals = rawFinalHomeGoals + difference;
      finalAwayGoals = 0;
    }

    if (finalHomeGoals < 0) {
      let difference = Math.abs(
        parseFloat((await diff(0, finalHomeGoals)) / 2)
      );
      rawFinalAwayGoals = rawFinalAwayGoals + difference;
      finalHomeGoals = 0;
    }

    if (match.status !== "suspended") {
      if (finalHomeGoals > finalAwayGoals) {
        match.prediction = "homeWin";
        homePredictions = homePredictions + 1;
        if (
          formHome.lastGame === "L" ||
          formHome.last2Points < 3 ||
          formAway.last2Points > 3
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
          formAway.last2Points < 3 ||
          formHome.last2Points > 3
        ) {
          match.includeInMultis = false;
        } else {
          match.includeInMultis = true;
        }
      } else if (finalHomeGoals === finalAwayGoals) {
        match.prediction = "draw";
        drawPredictions = drawPredictions + 1;
      }
    }

    console.log(`drawPredictions: ${drawPredictions}`);

    if (
      (XGdifferential > 1 && match.prediction === "homeWin") ||
      (XGdifferential < -1.6 && match.prediction === "awayWin")
    ) {
      match.XGdifferential = true;
    } else {
      match.XGdifferential = false;
    }

    if (
      (pointsDiff10 > 1.2 && match.prediction === "homeWin") ||
      (pointsDiff10 < -1.2 && match.prediction === "awayWin")
    ) {
      match.pointsDifferential = true;
      match.pointsDifferentialValue = Math.abs(pointsDiff10);
      match.pointsDifferentialValueRaw = parseFloat(pointsDiff10);
    } else {
      match.pointsDiff10 = false;
      match.pointsDifferentialValue = Math.abs(pointsDiff10);
      match.pointsDifferentialValueRaw = parseFloat(pointsDiff10);
    }

    let rollingGoalDiffDifferential = await diff(
      formHome.rollingAverageGoalsDifferential,
      formAway.rollingAverageGoalsDifferential
    );

    if (
      (rollingGoalDiffDifferential > 1.5 && match.prediction === "homeWin") ||
      (rollingGoalDiffDifferential < -1.5 && match.prediction === "awayWin")
    ) {
      match.rollingGoalDiff = true;
      match.rollingGoalDiffValue = rollingGoalDiffDifferential;
    } else {
      match.rollingGoalDiff = false;
      match.rollingGoalDiffValue = rollingGoalDiffDifferential;
    }

    let dangerousAttacksDifferential = await diff(
      formHome.AverageDangerousAttacksOverall,
      formAway.AverageDangerousAttacksOverall
    );

    if (
      (dangerousAttacksDifferential > 20 && match.prediction === "homeWin") ||
      (dangerousAttacksDifferential < -20 && match.prediction === "awayWin")
    ) {
      match.dangerousAttacksDiff = true;
      match.dangerousAttacksDiffValue = dangerousAttacksDifferential;
    } else {
      match.dangerousAttacksDiff = false;
      match.dangerousAttacksDiffValue = dangerousAttacksDifferential;
    }

    switch (true) {
      case match.status !== "complete":
        break;
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

    console.log(`allDrawOutcomes: ${allDrawOutcomes}`);

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
      if (match.homeGoals + match.awayGoals > 2) {
        match.over25PredictionOutcome = "Won";
      } else {
        match.over25PredictionOutcome = "Lost";
      }
    }

    if (
      match.status === "complete" &&
      match.homeGoals > 0 &&
      match.awayGoals > 0
    ) {
      match.bttsOutcome = "bttsWon";
    } else {
      match.bttsOutcome = "bttsLost";
    }

    match.formHome = formHome;
    match.formAway = formAway;
    formHome.teamName = match.homeTeam;

    // formObjectHome = formHome;
    // formObjectAway = formAway;

    // console.log(formObjectHome)
    // console.log(formObjectAway)

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

    if (
      match.game_week < 0
      // match.game_week < 3 &&
    ) {
      finalHomeGoals = "-";
      finalAwayGoals = "-";
      match.status = "notEnoughData";
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
    match.status = "notEnoughData";
    match.profit = 0
  }

  return [finalHomeGoals, finalAwayGoals, rawFinalHomeGoals, rawFinalAwayGoals];
}

async function getSuccessMeasure(fixtures) {
  let sumProfit = 0;
  let investment = 0;
  let exactScores = 0;
  let successCount = 0;
  let profit = 0;
  let netProfit = 0;
  for (let i = 0; i < fixtures.length; i++) {
    if (fixtures[i].status === "complete" && fixtures[i].hasOwnProperty('prediction')) {
      sumProfit = sumProfit + fixtures[i].profit;
      investment = investment + 1;
      netProfit = (sumProfit - investment).toFixed(2);
      profit = parseFloat(netProfit)
      if (fixtures[i].exactScore === true) {
        exactScores = exactScores + 1;
      }
      if (fixtures[i].predictionOutcome === "Won") {
        successCount = successCount + 1;
      }
    }
  }

  totalInvestment = totalInvestment + investment
  totalProfit = totalProfit + profit;
  let ROI = (profit / investment) * 100;
  totalROI = (totalProfit / totalInvestment) * 100;
  console.log(`Total Profit : ${totalProfit}`)
  console.log(`Total Investment : ${totalInvestment}`)
  console.log(`Total ROI : ${totalROI}`)
  var operand = ROI >= 0 ? "+" : "";
  var operandTwo = totalROI >= 0 ? "+" : "";
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
        <Div
          className={"SuccessMeasure"}
          text={`Cumalative ROI for 
            all ${totalInvestment} match outcomes: ${operandTwo} ${totalROI.toFixed(2)}%`}
        />
      </Fragment>,
      document.getElementById("successMeasure2")
    );
  } else {
    return;
  }
}

export var tips = [];
export var allTips = [];
let allTipsSorted = [];
var newArray = [];
var bestBets = [];
var price;
var Over25Tips = [];
var XGDiffTips = [];
var rollingDiffTips = [];
var dangerousAttacksDiffTips = [];
var pointsDiffTips = [];
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
  // allTips = [];
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
  clicked = true;
  tips = [];
  bestBets = [];
  // price = 0
  bttsArray = [];
  Over25Tips = [];
  XGDiffTips = [];
  pointsDiffTips = [];
  rollingDiffTips = [];
  dangerousAttacksDiffTips = [];
  allTips = [];

  let index = 2;
  let divider = 10;

  ReactDOM.render(<div></div>, document.getElementById("GeneratePredictions"));

  await Promise.all(
    matches.map(async (match) => {
      // if there are no stored predictions, calculate them based on live data
      if (match) {
        switch (true) {
          case match.status === "canceled":
            match.goalsA = "P";
            match.goalsB = "P";
            await calculateScore(match, index, divider, false);
            break;
          case match.leagueID === 6935 || match.leagueID === 7061 || (match.game_week < 3 && match.game_week !== 0):
            match.goalsA = "x";
            match.goalsB = "x";
            await calculateScore(match, index, divider, false);
            break;
          default:
            [
              match.goalsA,
              match.goalsB,
              match.unroundedGoalsA,
              match.unroundedGoalsB,
            ] = await calculateScore(match, index, divider, true);
            break;
        }
      } else {
        [
          match.goalsA,
          match.goalsB,
          match.unroundedGoalsA,
          match.unroundedGoalsB,
        ] = await calculateScore(match, index, divider, true);
      }

      await getBTTSPotential(
        match,
        match.goalsA,
        match.goalsB,
        match.unroundedGoalsA,
        match.unroundedGoalsB
      );

      let predictionObject;
      let Over25PredictionObject;
      let XGPredictionObject;
      let pointsDiffObject;
      let rollingDiffObject;
      let dangerousAttacksDiffObject;

      if (match.status === "complete" && match.prediction) {
        match.outcomeSymbol =
          match.predictionOutcome === "Won" ? "\u2714" : "\u2718";
        match.over25PredictionOutcomeSymbol =
          match.over25PredictionOutcome === "Won" ? "\u2714" : "\u2718";
        match.bttsOutcomeSymbol =
          match.bttsOutcome === "bttsWon" ? "\u2714" : "\u2718";
      } else {
        match.outcomeSymbol = "";
        match.over25PredictionOutcomeSymbol = "";
        match.bttsOutcomeSymbol = "";
      }

      if (
        match.unroundedGoalsA - match.unroundedGoalsB > 0.75 &&
        match.homeOdds !== 0 &&
        match.fractionHome !== "N/A" &&
        match.includeInMultis !== false
      ) {
        if (
          match.prediction !== "draw" &&
          match.status !== "suspended" &&
          match.status !== "canceled" &&
          match.status !== "notEnoughData" &&
          match.homeOdds < 3
        ) {
          predictionObject = {
            team: `${match.homeTeam} to win`,
            game:
              match.status === "complete"
                ? `${match.homeTeam} ${match.homeGoals} - ${match.awayGoals} ${match.awayTeam}`
                : match.game,
            odds: match.fractionHome,
            rawOdds: match.homeOdds,
            comparisonScore: Math.abs(match.teamComparisonScore),
            rawComparisonScore: match.teamComparisonScore,
            outcome: match.predictionOutcome,
            outcomeSymbol: match.outcomeSymbol,
            goalDifferential: parseFloat(
              await diff(match.unroundedGoalsA, match.unroundedGoalsB)
            ),
            experimentalCalc: (
              (match.unroundedGoalsA - match.unroundedGoalsB) *
              Math.abs(match.teamComparisonScore)
            ).toFixed(2),
            XGdifferentialValue: parseFloat(match.XGdifferentialValue),
          };
          if (
            predictionObject.rawOdds >= 1.25 &&
            match.formHome.clinicalRating !== "awful"
          ) {
            allTips.push(predictionObject);

            if (
              match.unroundedGoalsA - match.unroundedGoalsB >
              incrementValue
            ) {
              bestBets.push(predictionObject);
            }
          }
        }
      } else if (
        match.unroundedGoalsB - match.unroundedGoalsA > 2 &&
        match.awayOdds !== 0 &&
        match.fractionAway !== "N/A" &&
        match.includeInMultis !== false
      ) {
        if (
          match.prediction !== "draw" &&
          match.status !== "suspended" &&
          match.status !== "canceled" &&
          match.status !== "notEnoughData" &&
          match.awayOdds < 3.5
        ) {
          predictionObject = {
            team: `${match.awayTeam} to win`,
            game:
              match.status === "complete"
                ? `${match.homeTeam} ${match.homeGoals} - ${match.awayGoals} ${match.awayTeam}`
                : match.game,
            rawOdds: match.awayOdds,
            odds: match.fractionAway,
            comparisonScore: Math.abs(match.teamComparisonScore),
            rawComparisonScore: match.teamComparisonScore,
            outcome: match.predictionOutcome,
            outcomeSymbol: match.outcomeSymbol,
            goalDifferential:
              parseFloat(
                await diff(match.unroundedGoalsB, match.unroundedGoalsA)
              ) - 1,
            experimentalCalc: (
              (match.unroundedGoalsB - match.unroundedGoalsA) *
              Math.abs(match.teamComparisonScore)
            ).toFixed(2),
            XGdifferentialValue: parseFloat(match.XGdifferentialValue),
          };
          if (
            predictionObject.rawOdds >= 1.25 &&
            match.formAway.clinicalRating !== "awful"
          ) {
            allTips.push(predictionObject);
            if (match.unroundedGoalsB - match.unroundedGoalsA > 2) {
              bestBets.push(predictionObject);
            }
          }
        }
      }

      if (
        match.btts === true &&
        match.status !== "suspended" &&
        match.status !== "canceled" &&
        match.status !== "notEnoughData"
      ) {
        bttsArray.push(match);
      }
      if (
        match.unroundedGoalsA + match.unroundedGoalsB > 2.5 &&
        match.goalsA + match.goalsB > 2 &&
        match.GoalsInGamesAverageHome > 2.5 &&
        match.GoalsInGamesAverageAway > 2.5
      ) {
        Over25PredictionObject = {
          game:
            match.status === "complete"
              ? `${match.homeTeam} ${match.homeGoals} - ${match.awayGoals} ${match.awayTeam}`
              : match.game,
          team: match.homeTeam,
          decimalOdds: match.homeDoubleChance,
          rawOdds: match.over25Odds,
          odds: match.over25Odds,
          comparisonScore: match.teamComparisonScore,
          outcome: match.predictionOutcome,
          outcomeSymbol: match.over25PredictionOutcomeSymbol,
          doubleChanceOutcome: match.over25PredictionOutcome,
          goalTotalUnrounded: match.unroundedGoalsA + match.unroundedGoalsB,
        };
        Over25Tips.push(Over25PredictionObject);
      }

      if (
        match.XGdifferential === true &&
        match.prediction === "homeWin" &&
        match.status !== "notEnoughData" &&
        match.status !== "suspended" &&
        match.status !== "canceled"
      ) {
        XGPredictionObject = {
          game:
            match.status === "complete"
              ? `${match.homeTeam} ${match.homeGoals} - ${match.awayGoals} ${match.awayTeam}`
              : match.game,
          team: `${match.homeTeam} to win`,
          rawOdds: match.homeOdds,
          comparisonScore: Math.abs(match.teamComparisonScore),
          rawComparisonScore: match.teamComparisonScore,
          outcome: match.predictionOutcome,
          outcomeSymbol: match.outcomeSymbol,
          prediction: `${match.homeTeam} to win`,
          odds: match.fractionHome,
          otherTeam: match.awayTeam,
          XGdifferentialValue: match.XGdifferentialValue,
          goalDifferential: parseFloat(
            await diff(match.unroundedGoalsA, match.unroundedGoalsB)
          ),
        };
        XGDiffTips.push(XGPredictionObject);
      } else if (
        match.XGdifferential === true &&
        match.prediction === "awayWin" &&
        match.status !== "notEnoughData" &&
        match.status !== "suspended" &&
        match.status !== "canceled"
      ) {
        XGPredictionObject = {
          game:
            match.status === "complete"
              ? `${match.homeTeam} ${match.homeGoals} - ${match.awayGoals} ${match.awayTeam}`
              : match.game,
          team: `${match.awayTeam} to win`,
          rawOdds: match.awayOdds,
          comparisonScore: Math.abs(match.teamComparisonScore),
          rawComparisonScore: match.teamComparisonScore,
          outcome: match.predictionOutcome,
          outcomeSymbol: match.outcomeSymbol,
          prediction: `${match.awayTeam} to win`,
          odds: match.fractionAway,
          otherTeam: match.homeTeam,
          XGdifferentialValue: match.XGdifferentialValue,
          goalDifferential: parseFloat(
            await diff(match.unroundedGoalsB, match.unroundedGoalsA)
          ),
        };
        XGDiffTips.push(XGPredictionObject);
      }

      if (
        match.pointsDifferential === true &&
        match.prediction === "homeWin" &&
        match.status !== "notEnoughData" &&
        match.status !== "suspended" &&
        match.status !== "canceled"
      ) {
        pointsDiffObject = {
          game:
            match.status === "complete"
              ? `${match.homeTeam} ${match.homeGoals} - ${match.awayGoals} ${match.awayTeam}`
              : match.game,
          team: `${match.homeTeam} to win`,
          rawOdds: match.homeOdds,
          comparisonScore: Math.abs(match.teamComparisonScore),
          rawComparisonScore: match.teamComparisonScore,
          outcome: match.predictionOutcome,
          outcomeSymbol: match.outcomeSymbol,
          prediction: `${match.homeTeam} to win`,
          odds: match.fractionHome,
          otherTeam: match.awayTeam,
          pointsDifferentialValue: match.pointsDifferentialValue,
          goalDifferential: parseFloat(
            await diff(match.unroundedGoalsA, match.unroundedGoalsB)
          ),
        };
        pointsDiffTips.push(pointsDiffObject);
      } else if (
        match.XGdifferential === true &&
        match.prediction === "awayWin" &&
        match.status !== "notEnoughData" &&
        match.status !== "suspended" &&
        match.status !== "canceled"
      ) {
        pointsDiffObject = {
          game:
            match.status === "complete"
              ? `${match.homeTeam} ${match.homeGoals} - ${match.awayGoals} ${match.awayTeam}`
              : match.game,
          team: `${match.awayTeam} to win`,
          rawOdds: match.awayOdds,
          comparisonScore: Math.abs(match.teamComparisonScore),
          rawComparisonScore: match.teamComparisonScore,
          outcome: match.predictionOutcome,
          outcomeSymbol: match.outcomeSymbol,
          prediction: `${match.awayTeam} to win`,
          odds: match.fractionAway,
          otherTeam: match.homeTeam,
          pointsDifferentialValue: match.pointsDifferentialValue,
          goalDifferential: parseFloat(
            await diff(match.unroundedGoalsB, match.unroundedGoalsA)
          ),
        };
        pointsDiffTips.push(pointsDiffObject);
      }

      if (
        match.rollingGoalDiff === true &&
        match.prediction === "homeWin" &&
        match.status !== "notEnoughData" &&
        match.status !== "suspended" &&
        match.status !== "canceled"
      ) {
        rollingDiffObject = {
          game:
            match.status === "complete"
              ? `${match.homeTeam} ${match.homeGoals} - ${match.awayGoals} ${match.awayTeam}`
              : match.game,
          team: `${match.homeTeam} to win`,
          rawOdds: match.homeOdds,
          comparisonScore: Math.abs(match.teamComparisonScore),
          rawComparisonScore: match.teamComparisonScore,
          outcome: match.predictionOutcome,
          outcomeSymbol: match.outcomeSymbol,
          prediction: `${match.homeTeam} to win`,
          odds: match.fractionHome,
          otherTeam: match.awayTeam,
          rollingGoalDiffValue: match.rollingGoalDiffValue,
          goalDifferential: parseFloat(
            await diff(match.unroundedGoalsA, match.unroundedGoalsB)
          ),
        };
        rollingDiffTips.push(rollingDiffObject);
      } else if (
        match.XGdifferential === true &&
        match.prediction === "awayWin" &&
        match.status !== "notEnoughData" &&
        match.status !== "suspended" &&
        match.status !== "canceled"
      ) {
        rollingDiffObject = {
          game:
            match.status === "complete"
              ? `${match.homeTeam} ${match.homeGoals} - ${match.awayGoals} ${match.awayTeam}`
              : match.game,
          team: `${match.awayTeam} to win`,
          rawOdds: match.awayOdds,
          comparisonScore: Math.abs(match.teamComparisonScore),
          rawComparisonScore: match.teamComparisonScore,
          outcome: match.predictionOutcome,
          outcomeSymbol: match.outcomeSymbol,
          prediction: `${match.awayTeam} to win`,
          odds: match.fractionAway,
          otherTeam: match.homeTeam,
          rollingGoalDiffValue: match.rollingGoalDiffValue,
          goalDifferential: parseFloat(
            await diff(match.unroundedGoalsB, match.unroundedGoalsA)
          ),
        };
        rollingDiffTips.push(rollingDiffObject);
      }

      if (
        match.dangerousAttacksDiff === true &&
        match.prediction === "homeWin" &&
        match.status !== "notEnoughData" &&
        match.status !== "suspended" &&
        match.status !== "canceled"
      ) {
        dangerousAttacksDiffObject = {
          game:
            match.status === "complete"
              ? `${match.homeTeam} ${match.homeGoals} - ${match.awayGoals} ${match.awayTeam}`
              : match.game,
          team: `${match.homeTeam} to win`,
          rawOdds: match.homeOdds,
          comparisonScore: Math.abs(match.teamComparisonScore),
          rawComparisonScore: match.teamComparisonScore,
          outcome: match.predictionOutcome,
          outcomeSymbol: match.outcomeSymbol,
          prediction: `${match.homeTeam} to win`,
          odds: match.fractionHome,
          otherTeam: match.awayTeam,
          rollingGoalDiffValue: match.rollingGoalDiffValue,
          goalDifferential: parseFloat(
            await diff(match.unroundedGoalsA, match.unroundedGoalsB)
          ),
        };
        dangerousAttacksDiffTips.push(dangerousAttacksDiffObject);
      } else if (
        match.XGdifferential === true &&
        match.prediction === "awayWin" &&
        match.status !== "notEnoughData" &&
        match.status !== "suspended" &&
        match.status !== "canceled"
      ) {
        dangerousAttacksDiffObject = {
          game:
            match.status === "complete"
              ? `${match.homeTeam} ${match.homeGoals} - ${match.awayGoals} ${match.awayTeam}`
              : match.game,
          team: `${match.awayTeam} to win`,
          rawOdds: match.awayOdds,
          comparisonScore: Math.abs(match.teamComparisonScore),
          rawComparisonScore: match.teamComparisonScore,
          outcome: match.predictionOutcome,
          outcomeSymbol: match.outcomeSymbol,
          prediction: `${match.awayTeam} to win`,
          odds: match.fractionAway,
          otherTeam: match.homeTeam,
          rollingGoalDiffValue: match.rollingGoalDiffValue,
          goalDifferential: parseFloat(
            await diff(match.unroundedGoalsB, match.unroundedGoalsA)
          ),
        };
        dangerousAttacksDiffTips.push(dangerousAttacksDiffObject);
      }

      predictions.push(match);
    })
  );
  ReactDOM.render(
    <RenderAllFixtures matches={matches} result={true} bool={mock} />,
    document.getElementById("FixtureContainer")
  );
  await getSuccessMeasure(matches);
  await getMultis();
  await getNewTips(allTipsSorted);

  // await renderTips();
}

async function getMultis() {
  allTipsSorted = allTips.sort(function (a, b) {
    return b.goalDifferential - a.goalDifferential;
  });

  bestBets.sort(function (a, b) {
    if (a.goalDifferential === b.goalDifferential) {
      return b.comparisonScore - a.comparisonScore;
    } else {
      return b.goalDifferential > a.goalDifferential ? 1 : -1;
    }
  });

  bttsArray.sort(function (a, b) {
    return b.combinedBTTS - a.combinedBTTS;
  });

  Over25Tips.sort(function (a, b) {
    return b.goalTotalUnrounded - a.goalTotalUnrounded;
  });

  XGDiffTips.sort(function (a, b) {
    return Math.abs(b.XGdifferentialValue) - Math.abs(a.XGdifferentialValue);
  });

  pointsDiffTips.sort(function (a, b) {
    return (
      Math.abs(b.pointsDifferentialValue) - Math.abs(a.pointsDifferentialValue)
    );
  });

  rollingDiffTips.sort(function (a, b) {
    return Math.abs(b.rollingGoalDiffValue) - Math.abs(a.rollingGoalDiffValue);
  });

  dangerousAttacksDiffTips.sort(function (a, b) {
    return (
      Math.abs(b.dangerousAttacksDiffValue) -
      Math.abs(a.dangerousAttacksDiffValue)
    );
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
      price = getCoverBetMaxReturns(exoticArray, minimumExotic, exoticStake);
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
      price = getCoverBetMaxReturns(exoticArray, minimumExotic, exoticStake);
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
      price = getCoverBetMaxReturns(exoticArray, minimumExotic, exoticStake);
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
      price = getCoverBetMaxReturns(exoticArray, minimumExotic, exoticStake);
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
      price = getCoverBetMaxReturns(exoticArray, minimumExotic, exoticStake);
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
      price = getCoverBetMaxReturns(exoticArray, minimumExotic, exoticStake);
      break;
    case Over25Tips.length >= 4:
      for (let i = 0; i < 4; i++) {
        let game = Over25Tips[i];
        exoticArray.push(game);
      }
      gamesInExotic = 4;
      minimumExotic = 3;
      exoticStake = 1;
      exoticString = "4 3-folds and 1 4-fold";
      price = getCoverBetMaxReturns(exoticArray, minimumExotic, exoticStake);
      break;
    default:
      break;
  }
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
            element={
              <ul className="BestPredictions" id="BestPredictions">
                <div className="BestPredictionsExplainer">
                  Add or remove a selection using the buttons below. Predictions
                  are ordered by confidence in the outcome.
                </div>
                {newArray.map((tip) => (
                  <li key={`${tip.game}acca`}>
                    <div>
                      {tip.team}: {tip.odds}{" "}
                      <span className={tip.outcome}>{tip.outcomeSymbol}</span>
                    </div>
                    <div className="TipGame">{tip.game}</div>
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
            element={
              <ul className="BestPredictions" id="BestPredictions">
                <h4 className="BestPredictionsExplainer">
                  No games fit the criteria
                </h4>
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
            element={
              <ul className="BestPredictions" id="BestPredictions">
                <h4 className="BestPredictionsExplainer">
                  <NewlineText
                    text={`${gamesInExotic} games: ${exoticString}\nStake per multi: ${exoticStake} units - ${combinations} combinations\nTotal stake: ${(
                      exoticStake * combinations
                    ).toFixed(2)} unit(s)`}
                  />
                  {`Potential winnings: ${price.toFixed(2)} units`}
                </h4>
                {exoticArray.map((tip) => (
                  <li key={tip.team}>
                    {tip.team}: {tip.odds}{" "}
                    <span className={tip.outcome}>{tip.outcomeSymbol}</span>
                    <div>{tip.game}</div>
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
            element={
              <ul className="BestPredictions" id="BestPredictions">
                <h4 className="BestPredictionsExplainer">
                  Not enough games for this feature
                </h4>
              </ul>
            }
          />
        </Fragment>
      </div>,
      document.getElementById("exoticOfTheDay")
    );
  }

  if (Over25Tips.length > 0) {
    ReactDOM.render(
      <div>
        <Fragment>
          <Collapsable
            buttonText={"Over 2.5 goals tips"}
            element={
              <ul className="LongshotPredictions" id="LongshotPredictions">
                <h4>Over 2.5 goals</h4>
                {Over25Tips.map((tip) => (
                  <li key={tip.team}>
                    {tip.game} - Odds: {tip.odds}{" "}
                    <span className={`${tip.doubleChanceOutcome}`}>
                      {tip.outcomeSymbol}
                    </span>
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
            buttonText={"Over 2.5 goals tips"}
            element={
              <ul className="LongshotPredictions" id="LongshotPredictions">
                <h4>No games fit the criteria</h4>
              </ul>
            }
          />
        </Fragment>
      </div>,
      document.getElementById("longShots")
    );
  }

  if (bttsArray.length > 0) {
    ReactDOM.render(
      <div>
        <Fragment>
          <Collapsable
            buttonText={"BTTS games"}
            element={
              <ul className="BTTSGames" id="BTTSGames">
                <h4>Games with highest chance of BTTS</h4>
                {bttsArray.map((game) => (
                  <li key={game.game}>
                    {`${game.game} odds: ${game.bttsFraction}`}{" "}
                    <span className={game.bttsOutcome}>
                      {game.bttsOutcomeSymbol}
                    </span>
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
            buttonText={"BTTS games"}
            element={
              <ul className="BTTSGames" id="BTTSGames">
                <h4>No games fit the criteria</h4>
              </ul>
            }
          />
        </Fragment>
      </div>,
      document.getElementById("BTTS")
    );
  }

  ReactDOM.render(
    <Collapsable
      buttonText={"XG tips"}
      element={
        <Slider
          element={
            XGDiffTips.length > 0 ? (
              <ul className="XGDiffTips" id="XGDiffTips">
                <h4>Games with greatest XG Differentials</h4>
                {XGDiffTips.map((tip) => (
                  <li key={tip.game}>
                    {tip.game} | {tip.prediction} {tip.odds}{" "}
                    <span className={tip.outcome}>{tip.outcomeSymbol}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="XGDiffTips" id="XGDiffTips">
                <h4>Games with greatest XG Differentials</h4>
                <li key={"noPPGDiff"}>
                  Sorry, no games fit this criteria today
                </li>
              </ul>
            )
          }
          element2={
            pointsDiffTips.length > 0 ? (
              <ul className="XGDiffTips" id="XGDiffTips">
                <h4>
                  Games with greatest points per game differentials (last 10)
                </h4>
                {pointsDiffTips.map((game) => (
                  <li key={game.game}>
                    {game.game} | {game.prediction} {game.odds}{" "}
                    <span className={game.outcome}>{game.outcomeSymbol}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="XGDiffTips" id="XGDiffTips">
                <h4>
                  Games with greatest points per game differentials (last 10)
                </h4>
                <li key={"noPPGDiff"}>
                  Sorry, no games fit this criteria today
                </li>
              </ul>
            )
          }
          element3={
            rollingDiffTips.length > 0 ? (
              <ul className="XGDiffTips" id="XGDiffTips">
                <h4>
                  Games with greatest rolling goal difference differentials
                </h4>
                {rollingDiffTips.map((game) => (
                  <li key={game.game}>
                    {game.game} | {game.prediction} {game.odds}{" "}
                    <span className={game.outcome}>{game.outcomeSymbol}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="XGDiffTips" id="XGDiffTips">
                <h4>
                  Games with greatest rolling goal difference differentials
                </h4>
                <li key={"noPPGDiff"}>
                  Sorry, no games fit this criteria today
                </li>
              </ul>
            )
          }
          element4={
            dangerousAttacksDiffTips.length > 0 ? (
              <ul className="XGDiffTips" id="XGDiffTips">
                <h4>
                  Games with greatest average dangerous attacks differentials
                </h4>
                {dangerousAttacksDiffTips.map((game) => (
                  <li key={game.game}>
                    {game.game} | {game.prediction} {game.odds}{" "}
                    <span className={game.outcome}>{game.outcomeSymbol}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="XGDiffTips" id="XGDiffTips">
                <h4>
                  Games with greatest average dangerous attacks differentials
                </h4>
                <li key={"noPPGDiff"}>
                  Sorry, no games fit this criteria today
                </li>
              </ul>
            )
          }
          element5={
            <div className="DonationButton">
              <h2>Help with running costs</h2>
              <h4>
                Monthly costs are rising and each donation helps keep XG Tipping
                free to use
              </h4>
              <StyledKofiButton buttonText="No sign up donation" />
            </div>
          }
        ></Slider>
      }
    ></Collapsable>,
    document.getElementById("insights")
  );
}
