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
import { Slider } from "../components/Carousel";
import { StyledKofiButton } from "../components/KofiButton";
import {
  getAttackStrength,
  getDefenceStrength,
  getPossessionStrength,
  getXGForStrength,
  getXGAgainstStrength,
  getXGDifferentialStrength,
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

  if (allLeagueResultsArrayOfObjects[game.leagueIndex].fixtures.length > 50) {
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
    let oddsSum = 0;
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
        oddsHome: resultedGame.odds_ft_1,
        oddsAway: resultedGame.odds_ft_2,
        btts:
          resultedGame.homeGoalCount > 0 && resultedGame.awayGoalCount > 0
            ? true
            : false,
      });
      oddsSum = oddsSum + resultedGame.odds_ft_1;
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
        oddsHome: resultedGame.odds_ft_1,
        oddsAway: resultedGame.odds_ft_2,
        btts:
          resultedGame.homeGoalCount > 0 && resultedGame.awayGoalCount > 0
            ? true
            : false,
      });
      oddsSum = oddsSum + resultedGame.odds_ft_2;
    }

    let reversedResultsHome = homeResults;
    let reversedResultsAway = awayResults;

    const allTeamResults = reversedResultsHome
      .concat(reversedResultsAway)
      .sort((a, b) => a.dateRaw - b.dateRaw);

    const averageOdds = oddsSum / allTeamResults.length;

    const teamGoalsHome = reversedResultsHome.map((res) => res.scored);
    const teamGoalsAway = reversedResultsAway.map((res) => res.scored);
    const teamGoalsAll = allTeamResults.map((res) => res.scored);

    const teamConceededHome = reversedResultsHome.map((res) => res.conceeded);
    const teamConceededAway = reversedResultsAway.map((res) => res.conceeded);
    const teamConceededAll = allTeamResults.map((res) => res.conceeded);

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
    const bttsHomePercentage = (bttsHomeCount.length / bttsHome.length) * 100;
    const bttsAwayCount = bttsAway.filter((btts) => btts === true);
    const bttsAwayString = `${bttsAwayCount.length}/${bttsAway.length}`;
    const bttsAwayPercentage = (bttsAwayCount.length / bttsAway.length) * 100;
    const bttsAllCount = bttsAll.filter((btts) => btts === true);
    const bttsAllString = `${bttsAllCount.length}/${bttsAll.length}`;
    const bttsAllPercentage = (bttsAllCount.length / bttsAll.length) * 100;

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

    // console.log(game.game)
    // console.log(reversedResultsHome)
    // console.log(teamGoalsHome)
    // console.log("teamGoalsHomeRollingAverage")
    // console.log(teamGoalsHomeRollingAverage)

    // console.log(reversedResultsAway)
    // console.log(teamGoalsAway)
    // console.log("teamGoalsAwayRollingAverage")
    // console.log(teamGoalsAwayRollingAverage)

    // console.log(allTeamResults)
    // console.log(teamGoalsAll)
    // console.log("teamGoalsAllRollingAverage")
    // console.log(teamGoalsAllRollingAverage)

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

    const sumTwo = teamConceededAll.reduce((a, b) => a + b, 0);
    const avgConceeded = sumTwo / teamConceededAll.length || 0;

    return [
      teamGoalsHomeRollingAverage,
      teamGoalsAwayRollingAverage,
      teamGoalsAllRollingAverage,
      teamConceededHomeRollingAverage,
      teamConceededAwayRollingAverage,
      teamGoalsConceededAllRollingAverage,
      averageOdds,
      avgScored,
      avgConceeded,
      bttsAllString,
      bttsHomeString,
      bttsAwayString,
      bttsAllPercentage,
      bttsHomePercentage,
      bttsAwayPercentage
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

function predictNextWeightedMovingAverage(numbers, windowSize) {
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

export async function compareStat(statOne, statTwo) {
  let stat1 = parseFloat(statOne);
  let stat2 = parseFloat(statTwo);
  let result;

  let statDiff = await diff(stat1, stat2);
  // if (statDiff > 6 || statDiff < -6) {
  //   result = (stat1 - stat2) * 2;
  // } else if (statDiff > 3 || statDiff < -3) {
  //   result = (stat1 - stat2);
  // } else if (statDiff > 2 || statDiff < -2) {
  //   result = (stat1 - stat2) / 2;
  // } else {
  //   result = 0;
  // }
  return statDiff / 4;
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

export async function compareTeams(
  homeForm,
  awayForm,
  formHomeRecent,
  formAwayRecent,
  match
) {
  let homeMultiplier = 1;
  let awayMultiplier = 1;

  let homeAttackStrength = await getAttackStrength(
    homeForm.averageScoredLeague
  );
  let homeDefenceStrength = await getDefenceStrength(
    homeForm.averageConceededLeague
  );
  let homePossessionStrength =
    (await getPossessionStrength(homeForm.AveragePossessionOverall)) *
    homeMultiplier;

  let homeXGForStrength =
    (await getXGForStrength(homeForm.XGOverall)) * homeMultiplier;

  let homeXGAgainstStrength =
    (await getXGAgainstStrength(homeForm.XGAgainstAvgOverall)) * homeMultiplier;

  let homeXGForStrengthRecent =
    (await getXGForStrength(formHomeRecent.XGOverall)) * homeMultiplier;

  let homeXGAgainstStrengthRecent =
    (await getXGAgainstStrength(formHomeRecent.XGAgainstAvgOverall)) *
    homeMultiplier;

  let homeXGDiffStrength =
    (await getXGDifferentialStrength(parseFloat(homeForm.XGdifferential))) *
    homeMultiplier;

  let awayAttackStrength = await getAttackStrength(
    awayForm.averageScoredLeague
  );
  let awayDefenceStrength = await getDefenceStrength(
    awayForm.averageConceededLeague
  );
  let awayPossessionStrength =
    (await getPossessionStrength(awayForm.AveragePossessionOverall)) *
    awayMultiplier;
  let awayXGForStrength =
    (await getXGForStrength(awayForm.XGOverall)) * awayMultiplier;
  let awayXGAgainstStrength =
    (await getXGAgainstStrength(awayForm.XGAgainstAvgOverall)) * awayMultiplier;

  let awayXGForStrengthRecent =
    (await getXGForStrength(formAwayRecent.XGOverall)) * homeMultiplier;

  let awayXGAgainstStrengthRecent =
    (await getXGAgainstStrength(formAwayRecent.XGAgainstAvgOverall)) *
    homeMultiplier;

  let awayXGDiffStrength =
    (await getXGDifferentialStrength(parseFloat(awayForm.XGdifferential))) *
    awayMultiplier;

  let homeXGtoActualDiffStrength =
    (await getXGtoActualDifferentialStrength(
      parseFloat(homeForm.actualToXGDifference)
    )) * homeMultiplier;

  let awayXGtoActualDiffStrength =
    (await getXGtoActualDifferentialStrength(
      parseFloat(awayForm.actualToXGDifference)
    )) * awayMultiplier;

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

  const xgForStrengthComparison = await compareStat(
    homeXGForStrength,
    awayXGAgainstStrength
  );

  const xgAgainstStrengthComparison = await compareStat(
    homeXGAgainstStrength,
    awayXGForStrength
  );

  const xgForStrengthRecentComparison = await compareStat(
    homeXGForStrengthRecent,
    awayXGAgainstStrengthRecent
  );

  const xgAgainstStrengthRecentComparison = await compareStat(
    homeXGAgainstStrengthRecent,
    awayXGForStrengthRecent
  );

  const xgDiffComparison = await compareStat(
    homeXGDiffStrength,
    awayXGDiffStrength
  );

  const xgToActualDiffComparison = await compareStat(
    homeXGtoActualDiffStrength,
    awayXGtoActualDiffStrength
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

  // const cornerComparison = await compareStat(
  //   homeForm.CornersAverage,
  //   awayForm.CornersAverage
  // ) * 5

  // const cardsComparison = await compareStat(
  //   homeForm.CardsTotal,
  //   awayForm.CardsTotal
  // ) * 5

  // if(cornerComparison > 3){
  //   console.log(`Home - ${match.game}`)
  // } else if(cornerComparison < -3){
  //   console.log(`Away - ${match.game}`)
  // }

  let calculation =
    attackStrengthComparison * 1.5 +
    defenceStrengthComparison * 1.5 +
    possessiontrengthComparison * 1 +
    // xgForStrengthComparison * 1 +
    // xgAgainstStrengthComparison * 1 +
    xgToActualDiffComparison * 4 +
    xgDiffComparison * 3 +
    // xgForStrengthRecentComparison * 1 +
    // xgAgainstStrengthRecentComparison * 1 +
    // homeAwayPointAverageComparison * 1 +
    oddsComparison * 3 +
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
      homeForm.last2Points < 2 ||
      awayForm.last2Points > 4 ||
      match.XGdifferentialValueRaw < 0
    ) {
      calculation = calculation / 5;
    }
  } else if (calculation < 0) {
    if (
      awayForm.lastGame === "L" ||
      awayForm.last2Points < 2 ||
      homeForm.last2Points > 4 ||
      match.XGdifferentialValueRaw > 0
    ) {
      calculation = calculation / 5;
    }
  }

  if (homeForm.averageOdds !== null || awayForm.averageOdds !== null) {
    if (calculation > 0 && homeForm.averageOdds < match.homeOdds) {
      calculation = calculation / 2;
    } else if (
      calculation > 0 &&
      homeForm.averageOdds > match.homeOdds * 1.75
    ) {
      calculation = calculation * 1.5;
    } else {
      calculation = calculation * 1;
    }

    if (calculation < 0 && awayForm.averageOdds < match.awayOdds) {
      calculation = calculation / 2;
    } else if (
      calculation < 0 &&
      awayForm.averageOdds > match.awayOdds * 1.75
    ) {
      calculation = calculation * 1.5;
    } else {
      calculation = calculation * 1;
    }
  }

  return calculation;
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

    match.XGdifferentialValue = Math.abs(XGdifferential);
    match.XGdifferentialValueRaw = parseFloat(XGdifferential);

    if (
      allLeagueResultsArrayOfObjects[match.leagueIndex].fixtures.length > 50
    ) {
      [
        formHome.predictedGoalsBasedOnHomeAv,
        formHome.predictedGoalsBasedOnAwayAv,
        formHome.allTeamGoalsBasedOnAverages,
        formHome.predictedGoalsConceededBasedOnHomeAv,
        formHome.predictedGoalsConceededBasedOnAwayAv,
        formHome.allTeamGoalsConceededBasedOnAverages,
        formHome.averageOdds,
        formHome.averageScoredLeague,
        formHome.averageConceededLeague,
        formHome.last10btts,
        formHome.last10bttsHome,
        formHome.last10bttsAway,
        match.bttsAllPercentageHome,
        match.bttsPercentageHomeHome,
        match.bttsPercentageHomeAway,
      ] = await getPastLeagueResults(match.homeTeam, match);

      [
        formAway.predictedGoalsBasedOnHomeAv,
        formAway.predictedGoalsBasedOnAwayAv,
        formAway.allTeamGoalsBasedOnAverages,
        formAway.predictedGoalsConceededBasedOnHomeAv,
        formAway.predictedGoalsConceededBasedOnAwayAv,
        formAway.allTeamGoalsConceededBasedOnAverages,
        formAway.averageOdds,
        formAway.averageScoredLeague,
        formAway.averageConceededLeague,
        formAway.last10btts,
        formAway.last10bttsHome,
        formAway.last10bttsAway,
        match.bttsAllPercentageAway,
        match.bttsPercentageAwayHome,
        match.bttsPercentageAwayAway,
      ] = await getPastLeagueResults(match.awayTeam, match);
    } else {
      formHome.predictedGoalsBasedOnHomeAv = formHome.ScoredAverage;
      formHome.predictedGoalsBasedOnAwayAv = formHome.ConcededAverage;
      formHome.allTeamGoalsBasedOnAverages = formHome.ScoredAverage;
      formHome.predictedGoalsConceededBasedOnHomeAv = formHome.ConcededAverage;
      formHome.predictedGoalsConceededBasedOnAwayAv = formHome.ConcededAverage;
      formHome.allTeamGoalsConceededBasedOnAverages = formHome.ConcededAverage;
      formHome.averageOdds = null;
      formHome.averageScoredLeague = null;
      formHome.averageConceededLeague = null;
      formHome.last10btts = null;
      formHome.last10bttsHome = null;
      formHome.last10bttsAway = null;
      match.bttsAllPercentageHome = null;
      match.bttsPercentageHomeHome = null;
      match.bttsPercentageHomeAway = null;
      formAway.predictedGoalsBasedOnHomeAv = formAway.ScoredAverage;
      formAway.predictedGoalsBasedOnAwayAv = formAway.ConcededAverage;
      formAway.allTeamGoalsBasedOnAverages = formAway.ScoredAverage;
      formAway.predictedGoalsConceededBasedOnHomeAv = formAway.ConcededAverage;
      formAway.predictedGoalsConceededBasedOnAwayAv = formAway.ConcededAverage;
      formAway.allTeamGoalsConceededBasedOnAverages = formAway.ConcededAverage;
      formAway.averageOdds = null;
      formAway.averageScoredLeague = null;
      formAway.averageConceededLeague = null;
      formAway.last10btts = null;
      formAway.last10bttsHome = null;
      formAway.last10bttsAway = null;
      match.bttsAllPercentageAway = null;
      match.bttsPercentageAwayHome = null;
      match.bttsPercentageAwayAway = null;
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

    teamComparisonScore = await compareTeams(
      formHome,
      formAway,
      formHomeRecent,
      formAwayRecent,
      match
    );
    teamComparisonScore = teamComparisonScore * 0.5;

    if (teamComparisonScore > 0.85) {
      teamComparisonScore = 0.85;
    } else if (teamComparisonScore < -0.85) {
      teamComparisonScore = -0.85;
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
        formHome.predictedGoalsBasedOnHomeAv * 0.2 +
        formAway.predictedGoalsConceededBasedOnAwayAv * 0.2 +
        formHome.allTeamGoalsBasedOnAverages * 0.5 +
        formAway.allTeamGoalsConceededBasedOnAverages * 0.5 +
        formHome.XGOverall * 0.5 +
        formAway.XGAgainstAvgOverall * 0.5 +
        last10WeightingHome * 1 +
        last2WeightingHome * 0) /
      3.4;

    factorOneAway =
      (awayLeagueOrAllFormAverageGoals * 1 +
        formAway.predictedGoalsBasedOnAwayAv * 0.2 +
        formHome.predictedGoalsConceededBasedOnHomeAv * 0.2 +
        formAway.allTeamGoalsBasedOnAverages * 0.5 +
        formHome.allTeamGoalsConceededBasedOnAverages * 0.5 +
        formAway.XGOverall * 0.5 +
        formHome.XGAgainstAvgOverall * 0.5 +
        last10WeightingAway * 1 +
        last2WeightingAway * 0) /
      3.4;

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

    let experimentalHomeGoals = factorOneHome * 0.85 * homeComparisonWeighting;

    let experimentalAwayGoals = factorOneAway * 0.85 * awayComparisonWeighting;

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
      formHome.CleanSheetPercentage < 30 &&
      formAway.CleanSheetPercentage < 30
    ) {
      finalHomeGoals = Math.ceil(rawFinalHomeGoals);
      finalAwayGoals = Math.ceil(rawFinalAwayGoals);
    } else if (
      formHome.CleanSheetPercentage < 35 &&
      formAway.CleanSheetPercentage < 35 &&
      rawFinalHomeGoals < 1 &&
      rawFinalAwayGoals < 1
    ) {
      finalHomeGoals = Math.ceil(rawFinalHomeGoals);
      finalAwayGoals = Math.ceil(rawFinalAwayGoals);
    } else {
      finalHomeGoals = Math.floor(rawFinalHomeGoals);
      finalAwayGoals = Math.floor(rawFinalAwayGoals);
    }

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
          case match.leagueID === 6935 || match.leagueID === 7061:
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
