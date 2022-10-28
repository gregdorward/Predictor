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
import { allLeagueResultsArrayOfObjects } from "../logic/getFixtures";
import {
  getAttackStrength,
  getDefenceStrength,
  getPossessionStrength,
  getXGForStrength,
  getXGAgainstStrength,
  getXGDifferentialStrength,
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
    return "N/A";
  }
}

async function getPastLeagueResults(team, game) {
  let date = game.date;

  if (allLeagueResultsArrayOfObjects.length > 4) {
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

    for (let index = 0; index < teamsHomeResults.length; index++) {
      const resultedGame = teamsHomeResults[index];
      homeResults.push({
        homeTeam: resultedGame.home_name,
        homeGoals: resultedGame.homeGoalCount,
        awayTeam: resultedGame.away_name,
        awayGoals: resultedGame.awayGoalCount,
        scored: resultedGame.homeGoalCount,
        conceeded: resultedGame.awayGoalCount,
        date: await convertTimestamp(resultedGame.date_unix),
        dateRaw: resultedGame.date_unix,
      });
    }
    for (let index = 0; index < teamsAwayResults.length; index++) {
      const resultedGame = teamsAwayResults[index];
      awayResults.push({
        homeTeam: resultedGame.home_name,
        homeGoals: resultedGame.homeGoalCount,
        awayTeam: resultedGame.away_name,
        awayGoals: resultedGame.awayGoalCount,
        scored: resultedGame.awayGoalCount,
        conceeded: resultedGame.homeGoalCount,
        date: await convertTimestamp(resultedGame.date_unix),
        dateRaw: resultedGame.date_unix,
      });
    }

    homeResults.reverse();
    awayResults.reverse();

    const allTeamResults = homeResults
      .concat(awayResults)
      .sort((a, b) => b.dateRaw - a.dateRaw);

    const teamGoalsHome = homeResults.map((res) => res.scored);
    const teamGoalsAway = awayResults.map((res) => res.scored);
    const teamGoalsAll = allTeamResults.map((res) => res.scored);

    const teamConceededHome = homeResults.map((res) => res.conceeded);
    const teamConceededAway = awayResults.map((res) => res.conceeded);
    const teamConceededAll = allTeamResults.map((res) => res.conceeded);

    const teamGoalsHomeRollingAverage = getEMA(
      teamGoalsHome,
      teamGoalsHome.length
    );

    const teamGoalsAwayRollingAverage = getEMA(
      teamGoalsAway,
      teamGoalsAway.length
    );

    const teamGoalsAllRollingAverage = getEMA(
      teamGoalsAll,
      teamGoalsAll.length
    );

    const teamConceededHomeRollingAverage = getEMA(
      teamConceededHome,
      teamConceededHome.length
    );

    const teamConceededAwayRollingAverage = getEMA(
      teamConceededAway,
      teamConceededAway.length
    );

    const teamGoalsConceededAllRollingAverage = getEMA(
      teamConceededAll,
      teamConceededAll.length
    );

    return [
      teamGoalsHomeRollingAverage[1] !== undefined
        ? teamGoalsHomeRollingAverage[1]
        : teamGoalsHomeRollingAverage[0],
      teamGoalsAwayRollingAverage[1] !== undefined
        ? teamGoalsAwayRollingAverage[1]
        : teamGoalsAwayRollingAverage[0],
      teamGoalsAllRollingAverage[1] !== undefined
        ? teamGoalsAllRollingAverage[1]
        : teamGoalsAllRollingAverage[0],
      teamConceededHomeRollingAverage[1] !== undefined
        ? teamConceededHomeRollingAverage[1]
        : teamConceededHomeRollingAverage[0],
      teamConceededAwayRollingAverage[1] !== undefined
        ? teamConceededAwayRollingAverage[1]
        : teamConceededAwayRollingAverage[0],
      teamGoalsConceededAllRollingAverage[1] !== undefined
        ? teamGoalsConceededAllRollingAverage[1]
        : teamGoalsConceededAllRollingAverage[0],
    ];
  } else {
    return null;
  }
}

const getEMA = (a, r) =>
  a.reduce(
    (p, n, i) =>
      i
        ? p.concat((2 * n) / (r + 1) + (p[p.length - 1] * (r - 1)) / (r + 1))
        : p,
    [a[0]]
  );

function simpleMovingAverage(goals, lengthOfArray) {
  if (!goals || goals.length < lengthOfArray) {
    return [];
  }

  let index = lengthOfArray - 1;
  const length = goals.length + 1;

  const simpleMovingAverages = [];

  while (++index < length) {
    const arraySlice = goals.slice(index - lengthOfArray, index);
    const sum = arraySlice.reduce((prev, curr) => prev + curr, 0);
    simpleMovingAverages.push(sum / lengthOfArray);
  }

  return simpleMovingAverages;
}

export async function compareStat(statOne, statTwo) {
  let stat1 = parseFloat(statOne);
  let stat2 = parseFloat(statTwo);
  let result;

  result = stat1 - stat2;

  return result;
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
      pointsDiffWeightingAway = -0.1;
      break;
    case pointsDiff >= 0.5 && pointsDiff < 1:
      pointsDiffWeightingHome = 0.1;
      pointsDiffWeightingAway = -0.1;
      break;
    case pointsDiff > -0.5 && pointsDiff < 0.5:
      pointsDiffWeightingHome = 0;
      pointsDiffWeightingAway = 0;
      break;
    case pointsDiff <= -0.5 && pointsDiff > -1:
      pointsDiffWeightingHome = -0.1;
      pointsDiffWeightingAway = 0.1;
      break;
    case pointsDiff <= -1 && pointsDiff > -1.5:
      pointsDiffWeightingHome = -0.1;
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

export async function compareFormTrend(recentForm, distantForm) {
  let score;
  let scoreTotal = 0;

  for (let index = 0; index < recentForm.length; index++) {
    const recent = recentForm[index];
    const distant = distantForm[index];

    if (recent > distant) {
      score = 1;
    } else if (recent === distant) {
      score = 0.9;
    } else if (recent < distant) {
      score = 0.8;
    }
    scoreTotal = scoreTotal + score;
  }

  return scoreTotal / recentForm.length;
}

export async function getPointAverage(pointTotal, games) {
  return pointTotal / games;
}

export async function compareTeams(homeForm, awayForm, match) {
  let homeAttackStrength = await getAttackStrength(homeForm.ScoredOverall / 10);
  let homeDefenceStrength = await getDefenceStrength(
    homeForm.ConcededOverall / 10
  );
  let homePossessionStrength = await getPossessionStrength(
    homeForm.AveragePossessionOverall
  );
  let homeXGForStrength = await getXGForStrength(homeForm.XGOverall);

  let homeXGAgainstStrength = await getXGAgainstStrength(
    homeForm.XGAgainstAvgOverall
  );
  let homeXGDiffStrength = await getXGDifferentialStrength(parseFloat(homeForm.XGdifferential))

  let awayAttackStrength = await getAttackStrength(awayForm.ScoredOverall / 10);
  let awayDefenceStrength = await getDefenceStrength(
    awayForm.ConcededOverall / 10
  );
  let awayPossessionStrength = await getPossessionStrength(
    awayForm.AveragePossessionOverall
  );
  let awayXGForStrength = await getXGForStrength(awayForm.XGOverall);
  let awayXGAgainstStrength = await getXGAgainstStrength(
    awayForm.XGAgainstAvgOverall
  );

  let awayXGDiffStrength = await getXGDifferentialStrength(parseFloat(awayForm.XGdifferential))


  const attackStrengthComparison = await compareStat(
    homeAttackStrength,
    awayDefenceStrength
  );

  const defenceStrengthComparison = await compareStat(
    homeDefenceStrength,
    awayAttackStrength
  );

  const possessiontrengthComparison = await compareStat(
    homePossessionStrength,
    awayPossessionStrength
  );

  const xgForStrengthComparison = await compareStat(
    homeXGForStrength,
    awayXGAgainstStrength
  );

  const xgAgainstStrengthComparison = await compareStat(
    homeXGAgainstStrength,
    awayXGForStrength
  );

  const oddsComparison = await compareStat(match.awayOdds, match.homeOdds);

  const xgDiffComparison = await compareStat(homeXGDiffStrength, awayXGDiffStrength)

  let calculation =
    attackStrengthComparison * 1 +
    defenceStrengthComparison * 1 +
    possessiontrengthComparison * 1 +
    xgForStrengthComparison * 1.5 +
    xgAgainstStrengthComparison * 1 +
    xgDiffComparison * 0.25 +
    oddsComparison * 1;

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
        calculation = calculation / 4;
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
      homeForm.last2Points < 3 ||
      awayForm.last2Points > 4 ||
      match.XGdifferentialValueRaw < 0
    ) {
      calculation = calculation / 5;
    }
  } else if (calculation < 0) {
    if (
      awayForm.lastGame === "L" ||
      awayForm.last2Points < 3 ||
      homeForm.last2Points > 4 ||
      match.XGdifferentialValueRaw > 0
    ) {
      calculation = calculation / 5;
    }
  }

  return calculation;
}

export async function wdlRecordComparison(win, loss, game) {
  let result;

  if (win !== 0 && loss !== 0) {
    if (win === 0) {
      result = 0.5;
    } else if (loss === 0) {
      result = 1.5;
    } else {
      switch (true) {
        case win / loss > 2.5:
          result = 1.2;
          break;
        case win / loss > 1.5:
          result = 1.05;
          break;
        case win / loss > 1:
          result = 1.01;
          break;
        case win / loss === 1:
          result = 1;
          break;
        case win / loss < 0.4:
          result = 0.83;
          break;
        case win / loss < 0.67:
          result = 0.952;
          break;
        case win / loss < 1:
          result = 0.99;
          break;
        default:
          break;
      }
    }
  } else result = 1;

  return result;
}

export async function adjustForDefenceForm(csPercentage, rawGoals, name) {
  let goals;
  if (rawGoals < 2.5) {
    switch (true) {
      case csPercentage >= 80:
        goals = rawGoals * 0.6;
        break;
      case csPercentage < 80 && csPercentage >= 60:
        goals = rawGoals * 0.8;
        break;
      case csPercentage < 60 && csPercentage >= 40:
        goals = rawGoals * 0.9;
        break;
      case csPercentage < 40 && csPercentage >= 20:
        goals = rawGoals * 1;
        break;
      case csPercentage < 20 && csPercentage >= 10:
        goals = rawGoals * 1.1;
        break;
      case csPercentage < 10 && csPercentage >= 0:
        goals = rawGoals * 1.5;
        break;
      default:
        goals = rawGoals;
        break;
    }
  } else {
    goals = rawGoals;
  }

  return goals;
}

export async function roundCustom(num, form, otherForm) {
  let wholeNumber = Math.floor(num);
  let remainder = num - wholeNumber;

  // if (remainder > 0.9 && form.clinicalScore < 0.95) {
  //   return Math.ceil(num);
  // } else {
  return Math.floor(num);
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
  console.log(match)
  console.log(calculate)

  if (
    calculate === true && allForm.find(
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

      teams[i][index].finishingScore = parseFloat(
        teams[i][index].XG + 0.5 - teams[i][index].ScoredAverage
      );

      teams[i][index].goalieRating = parseFloat(
        teams[i][index].ConcededAverage -
          (teams[i][index].XGAgainstAverage + 0.5)
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
        teams[i][index].longTermGoalDifference,
        teams[i][index].XGdifferential
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

    let homeTenGameAvg = formHome.last2Points / 2;
    let awayTenGameAvg = formAway.last2Points / 2;

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
      formHome.AverageDangerousAttacks / formHome.ScoredAverageShortAndLongTerm;
    formAway.dangerousAttackConversion =
      formAway.AverageDangerousAttacks / formAway.ScoredAverageShortAndLongTerm;

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

    if (allLeagueResultsArrayOfObjects.length > 4) {
      [
        formHome.predictedGoalsBasedOnHomeAv,
        formHome.predictedGoalsBasedOnAwayAv,
        formHome.allTeamGoalsBasedOnAverages,
        formHome.predictedGoalsConceededBasedOnHomeAv,
        formHome.predictedGoalsConceededBasedOnAwayAv,
        formHome.allTeamGoalsConceededBasedOnAverages,
      ] = await getPastLeagueResults(match.homeTeam, match);

      [
        formAway.predictedGoalsBasedOnHomeAv,
        formAway.predictedGoalsBasedOnAwayAv,
        formAway.allTeamGoalsBasedOnAverages,
        formAway.predictedGoalsConceededBasedOnHomeAv,
        formAway.predictedGoalsConceededBasedOnAwayAv,
        formAway.allTeamGoalsConceededBasedOnAverages,
      ] = await getPastLeagueResults(match.awayTeam, match);
    } else {
      formHome.predictedGoalsBasedOnHomeAv = formHome.ScoredAverage;
      formHome.predictedGoalsBasedOnAwayAv = formHome.ConcededAverage;
      formHome.allTeamGoalsBasedOnAverages = formHome.ScoredAverage;
      formHome.predictedGoalsConceededBasedOnHomeAv = formHome.ConcededAverage;
      formHome.predictedGoalsConceededBasedOnAwayAv = formHome.ConcededAverage;
      formHome.allTeamGoalsConceededBasedOnAverages = formHome.ConcededAverage;

      formAway.predictedGoalsBasedOnHomeAv = formAway.ScoredAverage;
      formAway.predictedGoalsBasedOnAwayAv = formAway.ConcededAverage;
      formAway.allTeamGoalsBasedOnAverages = formAway.ScoredAverage;
      formAway.predictedGoalsConceededBasedOnHomeAv = formAway.ConcededAverage;
      formAway.predictedGoalsConceededBasedOnAwayAv = formAway.ConcededAverage;
      formAway.allTeamGoalsConceededBasedOnAverages = formAway.ConcededAverage;
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

    teamComparisonScore = await compareTeams(formHome, formAway, match);
    teamComparisonScore = teamComparisonScore * 0.09;

    console.log(match.game)
    console.log(teamComparisonScore)

    if (teamComparisonScore > 0.5) {
      teamComparisonScore = 0.5;
    } else if (teamComparisonScore < -0.5) {
      teamComparisonScore = -0.5;
    }
    match.teamComparisonScore = teamComparisonScore.toFixed(2);

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

    let factorOneHome =
      (homeLeagueOrAllFormAverageGoals * 2 +
        formHome.predictedGoalsBasedOnHomeAv * 0.5 +
        formAway.predictedGoalsConceededBasedOnAwayAv * 0.5 +
        formHome.XGOverall * 0.1 +
        formAway.XGAgainstAvgOverall * 0.1 +
        last10WeightingHome * 1 +
        last2WeightingHome * 1) /
      3.2;

    let factorOneAway =
      (awayLeagueOrAllFormAverageGoals * 2 +
        formAway.predictedGoalsBasedOnAwayAv * 0.5 +
        formHome.predictedGoalsConceededBasedOnHomeAv * 0.5 +
        formAway.XGOverall * 0.1 +
        formHome.XGAgainstAvgOverall * 0.1 +
        last10WeightingAway * 1 +
        last2WeightingAway * 1) /
      3.2;

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

    let experimentalHomeGoals = factorOneHome * 0.875 * homeComparisonWeighting;

    let experimentalAwayGoals = factorOneAway * 0.875 * awayComparisonWeighting;

    let rawFinalHomeGoals = experimentalHomeGoals;
    let rawFinalAwayGoals = experimentalAwayGoals;

    match.rawFinalHomeGoals = rawFinalHomeGoals;
    match.rawFinalAwayGoals = rawFinalAwayGoals;

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

    // if (
    //   (rawFinalHomeGoals + 1) / (formHome.ScoredAverage + 1) > 1.5 &&
    //   (rawFinalHomeGoals + 1) / (formAway.ConcededAverage + 1) > 1.5
    // ) {
    //   rawFinalHomeGoals = (rawFinalHomeGoals + formHome.ScoredAverage) / 1.75;
    // } else if (
    //   (rawFinalHomeGoals + 1) / (formHome.ScoredAverage + 1) < 0.66 &&
    //   (rawFinalHomeGoals + 1) / (formAway.ConcededAverage + 1) < 0.66
    // ) {
    //   rawFinalHomeGoals = (rawFinalHomeGoals + formHome.ScoredAverage) / 1.75;
    // }

    // if (
    //   (rawFinalAwayGoals + 1) / (formAway.ScoredAverage + 1) > 1.5 &&
    //   (rawFinalAwayGoals + 1) / (formHome.ConcededAverage + 1) > 1.5
    // ) {
    //   rawFinalAwayGoals = (rawFinalAwayGoals + formAway.ScoredAverage) / 1.75;
    // } else if (
    //   (finalAwayGoals + 1) / (formAway.ScoredAverage + 1) < 0.66 &&
    //   (finalAwayGoals + 1) / (formHome.ConcededAverage + 1) < 0.66
    // ) {
    //   rawFinalAwayGoals = (rawFinalAwayGoals + formAway.ScoredAverage) / 1.75;
    // }

    // let rawFinalHomeGoalsAdjusted;
    // let rawFinalAwayGoalsAdjusted;

    // rawFinalHomeGoalsAdjusted = await adjustForDefenceForm(
    //   formAway.CleanSheetPercentage,
    //   rawFinalHomeGoals,
    //   match.awayTeam
    // );

    // rawFinalAwayGoalsAdjusted = await adjustForDefenceForm(
    //   formHome.CleanSheetPercentage,
    //   rawFinalAwayGoals,
    //   match.homeTeam
    // );

    finalHomeGoals = Math.floor(rawFinalHomeGoals)
    finalAwayGoals = Math.floor(rawFinalAwayGoals);

    // finalHomeGoals = await roundCustom(rawFinalHomeGoals, formHome, formAway);

    // finalAwayGoals = await roundCustom(rawFinalAwayGoals, formAway, formHome);

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
        formHome.last2Points < 3 ||
        formAway.last2Points > 3 ||
        match.XGdifferentialValueRaw < 0 ||
        formAway.actualToXGDifference < -1 ||
        formHome.actualToXGDifference > 1
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
        formHome.last2Points > 3 ||
        match.XGdifferentialValueRaw > 0 ||
        formHome.actualToXGDifference < -1 ||
        formAway.actualToXGDifference > 1
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
      (XGdifferential > 1 && match.prediction === "homeWin") ||
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

    if (
      match.game_week > 0 &&
      match.game_week < 3 &&
      match.competition_id !== 4340
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
    if (fixtures[i].status === "complete" && fixtures[i].prediction) {
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
  tips = [];
  bestBets = [];
  // price = 0
  bttsArray = [];
  Over25Tips = [];
  XGDiffTips = [];
  allTips = [];

  let index = 2;
  let divider = 10;

  ReactDOM.render(<div></div>, document.getElementById("GeneratePredictions"));

  await Promise.all(
    matches.map(async (match) => {
      // if there are no stored predictions, calculate them based on live data
      if (match) {
        console.log(match)
        switch (true) {
          case match.status === "canceled":
            match.goalsA = "P";
            match.goalsB = "P";
            await calculateScore(match, index, divider, false);
            break;
          case match.leagueID === 6935 || match.leagueID === 7061 || (match.game_week > 0 && match.game_week < 5):
            match.goalsA = "-";
            match.goalsB = "-";
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
        allForm,
        match,
        index,
        match.goalsA,
        match.goalsB,
        match.unroundedGoalsA,
        match.unroundedGoalsB
      );

      let predictionObject;
      let Over25PredictionObject;
      let XGPredictionObject;

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
        match.unroundedGoalsB - match.unroundedGoalsA > 1.75 &&
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
            goalDifferential: parseFloat(
              await diff(match.unroundedGoalsB, match.unroundedGoalsA)
            ),
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

      if (
        match.btts === true &&
        match.status !== "suspended" &&
        match.status !== "canceled" &&
        match.status !== "notEnoughData"
      ) {
        bttsArray.push(match);
      }
      if (
        match.unroundedGoalsA + match.unroundedGoalsB > 3.7 &&
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
          experimentalCalc: (
            (match.unroundedGoalsA - match.unroundedGoalsB) *
            Math.abs(match.teamComparisonScore)
          ).toFixed(2),
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
          experimentalCalc: (
            (match.unroundedGoalsB - match.unroundedGoalsA) *
            Math.abs(match.teamComparisonScore)
          ).toFixed(2),
        };
        XGDiffTips.push(XGPredictionObject);
      }

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
    return b.totalGoals - a.totalGoals;
  });

  Over25Tips.sort(function (a, b) {
    return b.goalTotalUnrounded - a.goalTotalUnrounded;
  });

  XGDiffTips.sort(function (a, b) {
    return b.XGdifferentialValue - a.XGdifferentialValue;
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
                <div className="BestPredictionsExplainer">
                  No games fit the criteria
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
            element={
              <ul className="BestPredictions" id="BestPredictions">
                <div className="BestPredictionsExplainer">
                  <NewlineText
                    text={`${gamesInExotic} games: ${exoticString}\nStake per multi: ${exoticStake} units - ${combinations} combinations\nTotal stake: ${(
                      exoticStake * combinations
                    ).toFixed(2)} unit(s)`}
                  />
                  {`Potential winnings: ${price.toFixed(2)} units`}
                </div>
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

  if (Over25Tips.length > 0) {
    ReactDOM.render(
      <div>
        <Fragment>
          <Collapsable
            buttonText={"Over 2.5 goals tips"}
            element={
              <ul className="LongshotPredictions" id="LongshotPredictions">
                <lh>Over 2.5 goals</lh>
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
            element={
              <ul className="XGDiffTips" id="XGDiffTips">
                <lh>Games with greatest XG Differentials</lh>
                {XGDiffTips.map((tip) => (
                  <li key={tip.game}>
                    {tip.game} | {tip.prediction} {tip.odds}{" "}
                    <span className={tip.outcome}>{tip.outcomeSymbol}</span>
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
            element={
              <ul className="XGDiffTips" id="XGDiffTips">
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
            buttonText={"BTTS games"}
            element={
              <ul className="BTTSGames" id="BTTSGames">
                <lh>Games with highest chance of BTTS</lh>
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
                <lh>No games fit the criteria</lh>
              </ul>
            }
          />
        </Fragment>
      </div>,
      document.getElementById("BTTS")
    );
  }
}
