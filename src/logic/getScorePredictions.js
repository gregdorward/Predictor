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
let totalGoals = 0;
let numberOfGames = 0;
export var renderPredictions;

function getPointsFromLastFive(last5) {
  let points = 0;
  let pointsAddition;

  last5.forEach((game) => {
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

async function getPointsDifferential(pointsHome, pointsAway) {
  const differential = await diff(pointsHome, pointsAway);
  return differential;
}

async function getPointWeighting(pointsDiff) {
  let last5WeightingHome;
  let last5WeightingAway;

  switch (true) {
    case pointsDiff >= 12:
      last5WeightingHome = 0.7;
      last5WeightingAway = -0.7;
      break;
    case pointsDiff >= 10 && pointsDiff < 12:
      last5WeightingHome = 0.4;
      last5WeightingAway = -0.4;
      break;
    case pointsDiff >= 8 && pointsDiff < 10:
      last5WeightingHome = 0.3;
      last5WeightingAway = -0.3;
      break;
    case pointsDiff >= 6 && pointsDiff < 8:
      last5WeightingHome = 0.2;
      last5WeightingAway = -0.2;
      break;
    case pointsDiff >= 4 && pointsDiff < 6:
      last5WeightingHome = 0.1;
      last5WeightingAway = -0.1;
      break;
    case pointsDiff >= 2 && pointsDiff < 4:
      last5WeightingHome = 0.05;
      last5WeightingAway = -0.05;
      break;
    case pointsDiff >= 0 && pointsDiff < 2:
      last5WeightingHome = 0.02;
      last5WeightingAway = -0.02;
      break;
    case pointsDiff < 0 && pointsDiff > -2:
      last5WeightingHome = -0.02;
      last5WeightingAway = 0.02;
      break;
    case pointsDiff <= -2 && pointsDiff > -4:
      last5WeightingHome = -0.05;
      last5WeightingAway = 0.05;
      break;
    case pointsDiff <= -4 && pointsDiff > -6:
      last5WeightingHome = -0.1;
      last5WeightingAway = 0.1;
      break;
    case pointsDiff <= -6 && pointsDiff > -8:
      last5WeightingHome = -0.2;
      last5WeightingAway = 0.2;
      break;
    case pointsDiff <= -8 && pointsDiff > -10:
      last5WeightingHome = -0.3;
      last5WeightingAway = 0.3;
      break;
    case pointsDiff <= -10 && pointsDiff > -12:
      last5WeightingHome = -0.4;
      last5WeightingAway = 0.4;
      break;
    case pointsDiff <= -12:
      last5WeightingHome = -0.7;
      last5WeightingAway = 0.7;
      break;
    default:
      last5WeightingHome = 0;
      last5WeightingAway = 0;
      break;
  }
  return [last5WeightingHome, last5WeightingAway];
}

//Calculates scores based on prior XG figures, weighted by odds
export async function calculateScore(match, index, divider, id) {
  let homeRaw;
  let awayRaw;

  let teams;
  let calculate = true;

  let gameTotalWeighting;

  switch (true) {
    case divider === 5:
      gameTotalWeighting = 2;
      break;
    case divider === 6:
      gameTotalWeighting = 2;
      break;
    case divider === 10:
      gameTotalWeighting = 1;
      break;
    default:
      break;
  }

  if (
    allForm.find(
      (game) =>
        game.home.teamName === match.homeTeam &&
        game.away.teamName === match.awayTeam
    )
  ) {
    teams = [
      allForm.find((game) => game.home.teamName === match.homeTeam).home,
      allForm.find((game) => game.home.teamName === match.homeTeam).away,
    ];
  } else {
    calculate = false;
  }

  if (calculate) {
    for (let i = 0; i < teams.length; i++) {
      teams[i][index].lastGame = teams[i][index].LastFiveForm[4];
      teams[i][index].previousToLastGame = teams[i][index].LastFiveForm[3];

      teams[i][index].last5Points = getPointsFromLastFive(
        teams[i][index].LastFiveForm
      );

      teams[i][index].scoredAverage = teams[i][index].ScoredOverall / divider;
      teams[i][index].concededAverage =
        teams[i][index].ConcededOverall / divider;

      teams[0][index].expectedGoals = parseFloat(teams[0][index].XGHome);
      teams[1][index].expectedGoals = parseFloat(teams[1][index].XGAway);
      teams[0][index].expectedGoalsConceeded = parseFloat(
        teams[0][index].XGAgainstHome
      );
      teams[1][index].expectedGoalsConceeded = parseFloat(
        teams[1][index].XGAgainstAway
      );
      let longTermAverageGoals = teams[i][2].ScoredOverall / 10;
      let longTermAverageConceeded = teams[i][2].ConcededOverall / 10;

      teams[0][index].expectedGoalsLongTerm = parseFloat(teams[0][2].XGHome);
      teams[1][index].expectedGoalsLongTerm = parseFloat(teams[1][2].XGAway);

      teams[0][index].expectedConceededGoalsLongTerm = parseFloat(
        teams[0][2].XGAgainstHome
      );
      teams[1][index].expectedConceededGoalsLongTerm = parseFloat(
        teams[1][2].XGAgainstAway
      );

      teams[i][index].scoredAverageShortAndLongTerm =
        (longTermAverageGoals + teams[i][index].scoredAverage) / 2;

      teams[i][index].expectedGoalsShortAndLongTerm =
        (teams[i][index].expectedGoalsLongTerm +
          teams[i][index].expectedGoals) /
        2;

      teams[i][index].conceededAverageShortAndLongTerm =
        (longTermAverageConceeded + teams[i][index].concededAverage) / 2;

      teams[i][index].expectedConceededGoalsShortAndLongTerm =
        (teams[i][index].expectedConceededGoalsLongTerm +
          teams[i][index].expectedGoalsConceeded) /
        2;

      teams[i][index].generalOffensiveRating =
        (teams[i][2].ScoredOverall / 10 +
          teams[i][2].XG +
          teams[i][2].AverageShotsOnTarget / 3.5 +
          teams[i][2].AverageDangerousAttacks / 42.5) /
        3;
      teams[i][index].homeOffensiveRating =
        (teams[i][2].ScoredHome / teams[i][2].PlayedHome +
          teams[i][2].XGHome +
          teams[i][2].DangerousAttacksHome / 45) /
        3;
      teams[i][index].awayOffensiveRating =
        (teams[i][2].ScoredAway / teams[i][2].PlayedAway +
          teams[i][2].XGAway +
          teams[i][2].DangerousAttacksAway / 40) /
        3;

      teams[i][index].generalDefensiveRating =
        (teams[i][2].ConcededOverall / 10 + teams[i][2].XGAgainstAvg) / 2;

      teams[i][index].homeDefensiveRating =
        (teams[i][2].ConcededHome / teams[i][2].PlayedHome +
          teams[i][2].XGAgainstHome) /
        2;
      teams[i][index].awayDefensiveRating =
        (teams[i][2].ConcededAway / teams[i][2].PlayedAway +
          teams[i][2].XGAgainstAway) /
        2;

      teams[i][index].recentGeneralOffensiveRating =
        (teams[i][index].ScoredOverall / divider +
          teams[i][index].XG +
          teams[i][index].AverageShotsOnTarget / 3.5 +
          teams[i][index].AverageDangerousAttacks / 42.5) /
        3;
      teams[i][index].recentHomeOffensiveRating =
        (teams[i][index].ScoredHome / teams[i][index].PlayedHome +
          teams[i][index].XGHome +
          teams[i][index].DangerousAttacksHome / 45) /
        3;
      teams[i][index].recentAwayOffensiveRating =
        (teams[i][index].ScoredAway / teams[i][index].PlayedAway +
          teams[i][index].XGAway +
          teams[i][index].DangerousAttacksAway / 40) /
        3;

      teams[i][index].recentGeneralDefensiveRating =
        (teams[i][index].ConcededOverall / divider +
          teams[i][index].XGAgainstAvg) /
        2;

      teams[i][index].recentHomeDefensiveRating =
        (teams[i][index].ConcededHome / teams[i][index].PlayedHome +
          teams[i][index].XGAgainstHome) /
        2;
      teams[i][index].recentAwayDefensiveRating =
        teams[i][index].ConcededAway / teams[i][index].PlayedAway +
        teams[i][index].XGAgainstAway / 2;

      teams[i][index].finishingScore = parseFloat(
        teams[i][index].expectedGoalsShortAndLongTerm /
          teams[i][index].scoredAverageShortAndLongTerm
      );

      if (teams[i][index].ConcededOverall > 0) {
        teams[i][index].goalieRating = parseFloat(
          teams[i][index].expectedConceededGoalsShortAndLongTerm /
            teams[i][index].conceededAverageShortAndLongTerm
        );
      } else {
        teams[0][index].goalieRating = 1;
      }

      teams[i][index].defenceScore = parseInt(
        teams[i][index].CleanSheetPercentage
      );

      let defenceScore;
      defenceScore = teams[i][index].defenceScore;

      switch (true) {
        case defenceScore === 0:
          teams[i][index].defenceRating = 1.2;
          break;
        case defenceScore > 0 && defenceScore < 20:
          teams[i][index].defenceRating = 1.1;
          break;
        case defenceScore >= 20 && defenceScore < 30:
          teams[i][index].defenceRating = 1.05;
          break;
        case defenceScore >= 30 && defenceScore < 40:
          teams[i][index].defenceRating = 1.01;
          break;
        case defenceScore >= 40 && defenceScore < 50:
          teams[i][index].defenceRating = 1;
          break;
        case defenceScore >= 50 && defenceScore < 60:
          teams[i][index].defenceRating = 0.99;
          break;
        case defenceScore >= 60 && defenceScore < 70:
          teams[i][index].defenceRating = 0.95;
          break;
        case defenceScore >= 70 && defenceScore < 80:
          teams[i][index].defenceRating = 0.9;
          break;
        case defenceScore >= 80:
          teams[i][index].defenceRating = 0.8;
          break;
        default:
          break;
      }

      teams[0][index].homeAttackAdvantageWeighted = parseFloat(
        teams[0][index].homeAttackAdvantage / 1
      );
      teams[0][index].homeDefenceAdvantageWeighted = parseFloat(
        teams[0][index].homeDefenceAdvantage / 1
      );

      if (
        teams[i][index].finishingScore !== "N/A" &&
        teams[i][index].scoredAverageShortAndLongTerm >= 1
      ) {
        teams[i][index].AverageGoalsWeightedWithXG =
          (await diff(teams[i][index].finishingScore, 1)) * gameTotalWeighting +
          teams[i][index].scoredAverageShortAndLongTerm;
      } else if (
        teams[i][index].scoredAverageShortAndLongTerm < 1 &&
        teams[i][index].scoredAverageShortAndLongTerm >= 0.6
      ) {
        teams[i][index].AverageGoalsWeightedWithXG =
          (await diff(teams[i][index].finishingScore, 1)) *
            (gameTotalWeighting / 1) +
          teams[i][index].scoredAverageShortAndLongTerm;
      } else if (
        teams[i][index].scoredAverageShortAndLongTerm < 0.6 &&
        teams[i][index].scoredAverageShortAndLongTerm > 0.3
      ) {
        teams[i][index].AverageGoalsWeightedWithXG =
          (await diff(teams[i][index].finishingScore, 1)) *
            (gameTotalWeighting / 2) +
          teams[i][index].scoredAverageShortAndLongTerm;
      } else {
        teams[i][index].AverageGoalsWeightedWithXG =
          teams[i][index].scoredAverageShortAndLongTerm;
      }

      if (teams[i][index].conceededAverageShortAndLongTerm >= 1  && teams[i][index].concededAverage > 0) {
        teams[i][index].AverageGoalsConceededWeightedWithXG =
          (await diff(teams[i][index].goalieRating, 1)) * gameTotalWeighting +
          teams[i][index].conceededAverageShortAndLongTerm;
      } else if (
        teams[i][index].conceededAverageShortAndLongTerm < 1 &&
        teams[i][index].conceededAverageShortAndLongTerm >= 0.6 && teams[i][index].concededAverage > 0
      ) {
        teams[i][index].AverageGoalsConceededWeightedWithXG =
          (await diff(teams[i][index].goalieRating, 1)) *
            (gameTotalWeighting / 1) +
          teams[i][index].conceededAverageShortAndLongTerm;
      } else if (
        teams[i][index].conceededAverageShortAndLongTerm < 0.6 &&
        teams[i][index].conceededAverageShortAndLongTerm >= 0.3 && teams[i][index].concededAverage > 0
      ) {
        teams[i][index].AverageGoalsConceededWeightedWithXG =
          (await diff(teams[i][index].goalieRating, 1)) *
            (gameTotalWeighting / 2) +
          teams[i][index].conceededAverageShortAndLongTerm;
      } else {
        teams[i][index].AverageGoalsConceededWeightedWithXG =
          teams[i][index].conceededAverageShortAndLongTerm;
      }

      teams[i][index].forecastedXG = parseFloat(teams[i][index].scoredAverage);

      teams[i][index].forecastedXGConceded = parseFloat(
        teams[i][index].concededAverage
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
        parseFloat(teams[i][index].expectedGoals) -
        parseFloat(teams[i][index].expectedGoalsConceeded);

      switch (true) {
        case teams[i][index].XGdifferential > 1:
          teams[i][index].XGWeighting = 0.25;
          break;
        case teams[i][index].XGdifferential <= 1 &&
          teams[i][index].XGdifferential > 0.5:
          teams[i][index].XGWeighting = 0.125;
          break;
        case teams[i][index].XGdifferential <= 0.5 &&
          teams[i][index].XGdifferential > 0:
          teams[i][index].XGWeighting = 0.075;
          break;
        case teams[i][index].XGdifferential >= -0.5 &&
          teams[i][index].XGdifferential < 0:
          teams[i][index].XGWeighting = -0.075;
          break;
        case teams[i][index].XGdifferential >= -1 &&
          teams[i][index].XGdifferential < -0.5:
          teams[i][index].XGWeighting = -0.125;
          break;
        case teams[i][index].XGdifferential < -1:
          teams[i][index].XGWeighting = -0.25;
          break;
        default:
          teams[i][index].XGWeighting = 0;
          break;
      }
    }

    if (match.homeOdds === 0 && match.awayOdds === 0) {
      homeRaw = 0.0;
      awayRaw = 0.0;
    } else {
      homeRaw = (1 / match.homeOdds).toFixed(2);
      awayRaw = (1 / match.awayOdds).toFixed(2);
    }

    let formHome = teams[0][index];
    let formAway = teams[1][index];

    let pointsDiff = await getPointsDifferential(
      formHome.last5Points,
      formAway.last5Points
    );

    let [last5WeightingHome, last5WeightingAway] = await getPointWeighting(
      pointsDiff
    );

    let gameValue;

    if (divider === 5) {
      gameValue = 2;
    } else if (divider === 6) {
      gameValue = 1.8;
    } else if (divider === 10) {
      gameValue = 1;
    }

    // formHome.averageGoalDifferential =
    //   ((formHome.homeOffensiveRating - formAway.awayOffensiveRating) *
    //     gameValue +
    //     (formHome.recentHomeOffensiveRating -
    //       formAway.recentHomeOffensiveRating)) /
    //   (gameValue + 1);
    // formHome.averageConcededDifferential =
    //   ((formHome.homeDefensiveRating - formAway.awayDefensiveRating) *
    //     gameValue +
    //     (formHome.recentHomeDefensiveRating -
    //       formAway.recentAwayDefensiveRating)) /
    //   (gameValue + 1);

    // formAway.averageGoalDifferential =
    //   ((formAway.awayOffensiveRating - formHome.homeOffensiveRating) *
    //     gameValue +
    //     (formAway.recentAwayOffensiveRating -
    //       formHome.recentHomeOffensiveRating)) /
    //   (gameValue + 1);
    // formAway.averageConcededDifferential =
    //   ((formAway.awayDefensiveRating - formHome.homeDefensiveRating) *
    //     gameValue +
    //     (formAway.recentAwayDefensiveRating -
    //       formHome.recentHomeDefensiveRating)) /
    //   (gameValue + 1);

    let PPGweightingHome;
    let PPGweightingAway;

    if (formHome.SeasonPPG !== "N/A" && formAway.SeasonPPG !== "N/A") {
      let homePPG = formHome.SeasonPPG;
      let awayPPG = formAway.SeasonPPG;
      let PPGdiff = await diff(homePPG, awayPPG);

      switch (true) {
        case PPGdiff >= 2:
          PPGweightingHome = 0.3;
          PPGweightingAway = -0.3;
          break;
        case PPGdiff >= 1.5 && PPGdiff < 2:
          PPGweightingHome = 0.2;
          PPGweightingAway = -0.2;
          break;
        case PPGdiff >= 1 && PPGdiff < 1.5:
          PPGweightingHome = 0.1;
          PPGweightingAway = -0.1;
          break;
        case PPGdiff >= 0.5 && PPGdiff < 1:
          PPGweightingHome = 0.05;
          PPGweightingAway = -0.05;
          break;
        case PPGdiff > 0 && PPGdiff < 0.5:
          PPGweightingHome = 0.02;
          PPGweightingAway = -0.02;
          break;
        case PPGdiff < 0 && PPGdiff > -0.5:
          PPGweightingHome = -0.02;
          PPGweightingAway = 0.02;
          break;
        case PPGdiff <= -0.5 && PPGdiff > -1:
          PPGweightingHome = -0.05;
          PPGweightingAway = 0.05;
          break;
        case PPGdiff <= -1 && PPGdiff > -1.5:
          PPGweightingHome = -0.1;
          PPGweightingAway = 0.1;
          break;
        case PPGdiff <= -1.5 && PPGdiff > -2:
          PPGweightingHome = -0.2;
          PPGweightingAway = 0.2;
          break;
        case PPGdiff <= -2:
          PPGweightingHome = -0.3;
          PPGweightingAway = 0.3;
          break;
        default:
          PPGweightingHome = 0;
          PPGweightingAway = 0;
          break;
      }
    } else {
      PPGweightingHome = 0;
      PPGweightingAway = 0;
    }

    let oddsWeightingHome;
    let oddsWeightingAway;
    let homeWeighting;
    let awayWeighting;

    let weightingSplitHome;
    let weightingSplitAway;
    let weighting;

    if (homeRaw > 0) {
      oddsWeightingHome = awayRaw - homeRaw;
      oddsWeightingAway = homeRaw - awayRaw;

      weighting = await diff(oddsWeightingHome, oddsWeightingAway);

      if (weighting >= 0) {
        weightingSplitHome = Math.abs(weighting) / 2;
        weightingSplitAway = -Math.abs(weighting) / 2;
      } else if (weighting < 0) {
        weightingSplitHome = -Math.abs(weighting) / 2;
        weightingSplitAway = Math.abs(weighting) / 2;
      } else {
        weightingSplitHome = 0;
        weightingSplitAway = 0;
      }
    } else {
      weightingSplitHome = 0;
      weightingSplitAway = 0;
    }

    homeWeighting = weightingSplitHome * 1;
    awayWeighting = weightingSplitAway * 1;

    let homeCalculation;
    let awayCalculation;

    homeCalculation = parseFloat(homeWeighting);
    awayCalculation = parseFloat(awayWeighting);

    const homeGoalWeighting = formHome.homeAttackAdvantageWeighted / 100;
    const HomeDefenceWeighting = formHome.homeDefenceAdvantageWeighted / 100;

    const homeGoalsUnweighted = parseFloat(
      (formHome.expectedGoals + formHome.scoredAverage) / 2
    );

    const awayGoalsUnweighted = parseFloat(
      (formAway.expectedGoals + formAway.scoredAverage) / 2
    );

    const homeGoalsWithOddsWeighting = parseFloat(
      homeGoalsUnweighted + homeCalculation
    );

    const awayGoalsWithOddsWeighting = parseFloat(
      awayGoalsUnweighted + awayCalculation
    );

    const homeGoalsWithAwayDefenceWeighting = parseFloat(
      homeGoalsWithOddsWeighting * formAway.defenceRating
    );

    const awayGoalsWithHomeDefenceWeighting = parseFloat(
      awayGoalsWithOddsWeighting * formHome.defenceRating
    );

    let homeAdvantageAttackAdjustment = 1 + homeGoalWeighting / 10;
    let homeAdvantageDefenceAdjustment;

    if (HomeDefenceWeighting >= 0) {
      homeAdvantageDefenceAdjustment = 1 - HomeDefenceWeighting / 10;
    } else if (HomeDefenceWeighting < 0) {
      homeAdvantageDefenceAdjustment = 1 - HomeDefenceWeighting / 10;
    }

    let homeGoalswithHomeWeighting;
    let awayGoalswithAwayWeighting;

    homeGoalswithHomeWeighting = parseFloat(homeGoalsWithAwayDefenceWeighting);

    awayGoalswithAwayWeighting = parseFloat(awayGoalsWithHomeDefenceWeighting);

    if (homeGoalswithHomeWeighting < 0) {
      homeGoalswithHomeWeighting = 0;
    }

    if (awayGoalswithAwayWeighting < 0) {
      awayGoalswithAwayWeighting = 0;
    }


    let finalHomeGoals;
    let finalAwayGoals;

    async function roundCustom(num, form) {
      let wholeNumber = Math.floor(num);
      let remainder = num - wholeNumber;

      if (form.last5Points > 12) {
        return Math.ceil(num);
      } else if (form.last5Points <= 6) {
        return Math.floor(num);
      } else {
        return Math.round(num);
      }
    }

    const XGAgainstAdjustedHomeGoals =
      homeGoalswithHomeWeighting * formAway.AverageGoalsConceededWeightedWithXG;
    const XGAgainstAdjustedAwayGoals =
      awayGoalswithAwayWeighting * formHome.AverageGoalsConceededWeightedWithXG;

    const XGAdjustedHomeGoals =
      (homeGoalswithHomeWeighting + XGAgainstAdjustedHomeGoals) / 2;
    const XGAdjustedAwayGoals =
      (awayGoalswithAwayWeighting + XGAgainstAdjustedAwayGoals) / 2;

    const homeGoalDiff = formHome.scoredAverage - formHome.concededAverage;
    const awayGoalDiff = formAway.scoredAverage - formAway.concededAverage;

    formHome.goalsDifferential =
      parseFloat(await diff(homeGoalDiff, awayGoalDiff)) / 2;
    formAway.goalsDifferential =
      parseFloat(await diff(awayGoalDiff, homeGoalDiff)) / 2;

    // console.log(
    //   `${match.game} home goalsDifferential = ${formHome.goalsDifferential} away goalsDifferential = ${formAway.goalsDifferential}`
    // );

    let goalsBasedOnHomeXG =
      ((formHome.expectedGoals + formAway.expectedGoalsConceeded) / 2) *
      (1 + last5WeightingHome);

    let goalsBasedOnAwayXG =
      ((formAway.expectedGoals + formHome.expectedGoalsConceeded) / 2) *
      (1 + last5WeightingAway);

    let goalCalcHome = formHome.scoredAverage + formAway.concededAverage;
    let goalCalcAway = formAway.scoredAverage + formHome.concededAverage;

    let experimentalHomeGoals =
      goalCalcHome / 2 +
      formHome.goalsDifferential * 1.4 +
      PPGweightingHome * 2 +
      // formHome.XGWeighting * 0.5 +
      last5WeightingHome * 1.4;

    let experimentalAwayGoals =
      goalCalcAway / 2 +
      formAway.goalsDifferential * 1.4 +
      PPGweightingAway * 2 +
      // formAway.XGWeighting * 0.5 +
      last5WeightingAway * 1.4;

    console.log(match.game)

    console.log("formHome");
    console.log(formHome);
    // console.log(`Goals home = ${experimentalHomeGoals}`)
    // console.log(`Weighted goals home =  ${formHome.AverageGoalsWeightedWithXG}`)
    // console.log(`Average goals conceeded weighted = ${formHome.AverageGoalsConceededWeightedWithXG}`)
    // // console.log(last5WeightingHome);

    console.log("formAway");
    console.log(formAway);
    // console.log(`Goals away = ${experimentalAwayGoals}`)
    // console.log(`Weighted goals away =  ${formAway.AverageGoalsWeightedWithXG}`)
    // console.log(`Average goals conceeded weighted = ${formAway.AverageGoalsConceededWeightedWithXG}`)

    // console.log(last5WeightingAway);

    // console.log("EXPERIMENTAL HOME GOALS CALC");
    // console.log(`${match.homeTeam}`);
    // console.log(
    //   `formHome.scoredAverage ${formHome.scoredAverage} + formAway.concededAverage ${formAway.concededAverage} / 2`
    // );
    // console.log(
    //   `formHome.goalsDifferential ${formHome.goalsDifferential} * 1.4`
    // );

    // console.log(`PPGweightingHome ${PPGweightingHome}`);
    // console.log(`formHome.XGWeighting ${formHome.XGWeighting}`);
    // console.log(`last5WeightingHome ${last5WeightingHome}`);

    // console.log(teams[0][index].XGdifferential)

    // console.log(experimentalHomeGoals);

    // console.log("EXPERIMENTAL AWAY GOALS CALC");
    // console.log(`${match.awayTeam}`);
    // console.log(
    //   `formAway.scoredAverage ${formAway.scoredAverage} + formHome.concededAverage ${formHome.concededAverage} / 2`
    // );

    // console.log(`PPGweightingAway ${PPGweightingAway}`);
    // console.log(`formAway.XGWeighting ${formAway.XGWeighting}`);
    // console.log(`last5WeightingAway ${last5WeightingAway}`);

    // console.log(teams[1][index].XGdifferential)

    // console.log(experimentalAwayGoals);

    console.log(`${match.homeTeam} experimental goals ${experimentalHomeGoals}`)

    console.log(`${match.homeTeam} AverageGoalsWeightedWithXG ${formHome.AverageGoalsWeightedWithXG}`)

    console.log(`${match.awayTeam} AverageGoalsConceededWeightedWithXG ${formAway.AverageGoalsConceededWeightedWithXG}`)

    console.log(formAway)



    let rawFinalHomeGoals = parseFloat(
      (experimentalHomeGoals * 1 +
        ((formHome.AverageGoalsWeightedWithXG +
          formAway.AverageGoalsConceededWeightedWithXG) /
          2) *
          1) /
        2
      // ((formHome.AverageGoalsWeightedWithXG + formAway.AverageGoalsConceededWeightedWithXG) / 2)
    );

    let rawFinalAwayGoals = parseFloat(
      (experimentalAwayGoals * 1 +
        ((formAway.AverageGoalsWeightedWithXG +
          formHome.AverageGoalsConceededWeightedWithXG) /
          2) *
          1) /
        2
      // ((formAway.AverageGoalsWeightedWithXG + formHome.AverageGoalsConceededWeightedWithXG) / 2)
    );

    // console.log(`homeAdvantageAttackAdjustment ${homeAdvantageAttackAdjustment}`)
    // console.log(`home homeDefenceAdvantageWeighted ${formHome.homeDefenceAdvantageWeighted}`)
    // console.log(`homeAdvantageDefenceAdjustment ${homeAdvantageDefenceAdjustment}`)

    console.log(`${match.homeTeam} raw goals ${rawFinalHomeGoals}`)

    if (rawFinalAwayGoals < 0) {
      let difference = parseFloat((await diff(0, rawFinalAwayGoals)) / 10);
      rawFinalHomeGoals = rawFinalHomeGoals + difference;
    }

    if (rawFinalHomeGoals < 0) {
      let difference = parseFloat((await diff(0, rawFinalHomeGoals)) / 10);
      rawFinalAwayGoals = rawFinalAwayGoals + difference;
    }

    finalHomeGoals = await roundCustom(rawFinalHomeGoals, formHome);

    // finalHomeGoals = Math.floor(rawFinalHomeGoals);

    // finalHomeGoals = rawFinalHomeGoals.toFixed(1)

    finalAwayGoals = await roundCustom(rawFinalAwayGoals, formAway);

    // finalAwayGoals = Math.floor(rawFinalAwayGoals);

    // finalAwayGoals = rawFinalAwayGoals.toFixed(1)

    if (finalHomeGoals > finalAwayGoals) {
      match.prediction = "homeWin";
    } else if (finalAwayGoals > finalHomeGoals) {
      match.prediction = "awayWin";
    } else if (finalHomeGoals === finalAwayGoals) {
      match.prediction = "draw";
    }

    switch (true) {
      case match.homeGoals > match.awayGoals:
        match.winner = match.homeTeam;
        match.outcome = "homeWin";
        break;
      case match.homeGoals === match.awayGoals:
        match.winner = "draw";
        match.outcome = "draw";

        break;
      case match.homeGoals < match.awayGoals:
        match.winner = match.awayTeam;
        match.outcome = "awayWin";
        break;
      default:
        break;
    }

    if (match.status === "complete") {
      if (match.prediction === match.outcome) {
        match.predictionOutcome = "Won";
      } else if (match.prediction !== match.outcome) {
        match.predictionOutcome = "Lost";
      }
    }

    let total = parseInt(finalHomeGoals + finalAwayGoals);
    totalGoals = totalGoals + total;

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
    finalHomeGoals = "-";
    finalAwayGoals = "-";
    rawFinalHomeGoals = "-";
    rawFinalAwayGoals = "-";
  }

  return [finalHomeGoals, finalAwayGoals, rawFinalHomeGoals, rawFinalAwayGoals];
}

async function getSuccessMeasure(fixtures) {
  let sum = 0;
  let gameCount = 0;
  let profit;

  console.log(fixtures);

  for (let i = 0; i < fixtures.length; i++) {
    if (fixtures[i].status === "complete") {
      sum = sum + fixtures[i].profit;

      profit = sum.toFixed(2);

      gameCount = gameCount + 1;
    }
  }

  if (gameCount > 0) {
    ReactDOM.render(
      <Fragment>
        <Div
          className={"SuccessMeasure"}
          text={`£1 staked on each ${gameCount} games returns: £${profit}`}
        />
      </Fragment>,
      document.getElementById("successMeasure")
    );
  } else {
    return;
  }
}

var tips = [];
var longShotTips = [];
var bttsArray = [];
var accumulatedOdds = 1;
let predictions = [];

export async function getScorePrediction(day) {
  let radioSelected = parseInt(selectedOption);
  tips = [];
  bttsArray = [];
  longShotTips = [];
  accumulatedOdds = 1;

  let index;
  let divider;
  if (radioSelected === 5) {
    index = 0;
    divider = 5;
  } else if (radioSelected === 6) {
    index = 1;
    divider = 6;
  } else if (radioSelected === 10) {
    index = 2;
    divider = 10;
  }

  

  await Promise.all(
    matches.map(async (match) => {


      // if there are no stored predictions, calculate them based on live data
      if (match) {
        switch (true) {
          case match.status === "!suspended":
            [
              match.goalsA,
              match.goalsB,
              match.unroundedGoalsA,
              match.unroundedGoalsB,
            ] = await calculateScore(match, index, divider, match.id);

            break;
          case match.status === "suspended" || match.status === "canceled":
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

      await getBTTSPotential(allForm, match, index);


      let predictionObject;
      let longShotPredictionObject;

      if (
        match.unroundedGoalsA - incrementValue > match.unroundedGoalsB &&
        match.homeOdds !== 0 &&
        match.fractionHome !== "N/A"
      ) {
        if (
          match.prediction !== "draw" &&
          match.status !== "suspended" &&
          match.status !== "canceled" &&
          match.homeOdds < 3 &&
          match.homePpg > 1
        ) {
          accumulatedOdds =
            parseFloat(accumulatedOdds) * parseFloat(match.homeOdds);

          predictionObject = {
            team: `${match.homeTeam} to win`,
            odds: match.fractionHome,
            outcome: match.predictionOutcome,
            goalDifferential: parseFloat(
              await diff(match.unroundedGoalsA, match.unroundedGoalsB)
            ),
          };
          tips.push(predictionObject);
        }  
      } else if (
        match.unroundedGoalsB - (incrementValue + 2.5) > match.unroundedGoalsA &&
        match.awayOdds !== 0 &&
        match.fractionAway !== "N/A"
      ) {
        if (
          match.prediction !== "draw" &&
          match.status !== "suspended" &&
          match.status !== "canceled" &&
          match.awayOdds < 3.5 &&
          match.awayPpg > 1
        ) {
          accumulatedOdds =
            parseFloat(accumulatedOdds) * parseFloat(match.awayOdds);

          predictionObject = {
            team: `${match.awayTeam} to win`,
            odds: match.fractionAway,
            outcome: match.predictionOutcome,
            goalDifferential: parseFloat(
              await diff(match.unroundedGoalsB, match.unroundedGoalsA)
            ),
          };
          tips.push(predictionObject);
        }
      }
      
      if(match.bttsChosen === true){
        accumulatedOdds =
        parseFloat(accumulatedOdds) * parseFloat(match.bttsOdds);

        predictionObject = {
          team: `${match.game} btts`,
          odds: match.bttsFraction,
          outcome: match.bttsOutcome,
        }
        tips.push(predictionObject)
      }


      tips.sort(function (a, b) {
        return b.goalDifferential - a.goalDifferential;
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
        match.unroundedGoalsA - 1 > match.unroundedGoalsB &&
        match.homeOdds >= 2.5
      ) {
        longShotPredictionObject = {
          team: match.homeTeam,
          odds: match.fractionHome,
          outcome: match.predictionOutcome,
          goalDifferential: parseFloat(
            await diff(match.unroundedGoalsA, match.unroundedGoalsB)
          ),
        };
        if (match.prediction !== "draw") {
          longShotTips.push(longShotPredictionObject);
        }
      } else if (
        match.unroundedGoalsA < match.unroundedGoalsB - 1 &&
        match.awayOdds >= 2.5
      ) {
        longShotPredictionObject = {
          team: match.awayTeam,
          odds: match.fractionAway,
          outcome: match.predictionOutcome,
          goalDifferential: parseFloat(
            await diff(match.unroundedGoalsB, match.unroundedGoalsA)
          ),
        };
        if (match.prediction !== "draw") {
          longShotTips.push(longShotPredictionObject);
        }
      }

      longShotTips.sort(function (a, b) {
        return b.goalDifferential - a.goalDifferential;
      });

      ReactDOM.render(
        <Fixture
          fixtures={matches}
          result={true}
          className={"individualFixture"}
        />,
        document.getElementById("FixtureContainer")
      );

      predictions.push(match);
    })
  );
  await getSuccessMeasure(matches);

  await renderTips();
}

async function renderTips() {
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
                Increase or decrease the size of the multi
              </div>
              {tips.map((tip) => (
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

  ReactDOM.render(
    <div>
      <Fragment>
        <Collapsable
          buttonText={"Longshot predictions"}
          text={
            <ul className="LongshotPredictions">
              <lh>To win</lh>
              {longShotTips.map((tip) => (
                <li className={tip.outcome} key={tip.team}>
                  {tip.team} odds: {tip.odds}
                </li>
              ))}
            </ul>
          }
        />
      </Fragment>
    </div>,
    document.getElementById("longShots")
  );

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
}
