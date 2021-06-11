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
import { ThreeDots } from "react-loading-icons";

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

async function getOverOrUnderAchievingResult(index, overUnderAchievingSum) {
  let result;
  let multiplier;

  switch (true) {
    case index === 0:
      switch (true) {
        case overUnderAchievingSum <= -0.6:
          result = "overachievingDrastically";
          multiplier = -0.4;
          break;
        case overUnderAchievingSum < -0.3 && overUnderAchievingSum > -0.6:
          result = "overachieving";
          multiplier = -0.2;
          break;
        case overUnderAchievingSum < -0.1 && overUnderAchievingSum >= -0.3:
          result = "overachievingSlightly";
          multiplier = -0.1;
          break;
        case overUnderAchievingSum > 0.1 && overUnderAchievingSum <= 0.3:
          result = "underachievingSlightly";
          multiplier = 0.1;
          break;
        case overUnderAchievingSum > 0.3 && overUnderAchievingSum < 0.6:
          result = "underachieving";
          multiplier = 0.2;
          break;
        case overUnderAchievingSum >= 0.6:
          result = "underachievingDrastically";
          multiplier = 0.4;
          break;
        default:
          result = "onPar";
          multiplier = 0;
          break;
      }

      break;

    case index === 1:
      switch (true) {
        case overUnderAchievingSum <= -0.5:
          result = "overachievingDrastically";
          multiplier = -0.4;
          break;
        case overUnderAchievingSum < -0.25 && overUnderAchievingSum > -0.5:
          result = "overachieving";
          multiplier = -0.2;
          break;
        case overUnderAchievingSum < -0.1 && overUnderAchievingSum >= -0.25:
          result = "overachievingSlightly";
          multiplier = -0.1;
          break;
        case overUnderAchievingSum > 0.1 && overUnderAchievingSum <= 0.25:
          result = "underachievingSlightly";
          multiplier = 0.1;
          break;
        case overUnderAchievingSum > 0.25 && overUnderAchievingSum < 0.5:
          result = "underachieving";
          multiplier = 0.2;
          break;
        case overUnderAchievingSum >= 0.5:
          result = "underachievingDrastically";
          multiplier = 0.4;
          break;
        default:
          result = "onPar";
          multiplier = 0;
          break;
      }

      break;

    case index === 2:
      switch (true) {
        case overUnderAchievingSum <= -0.4:
          result = "overachievingDrastically";
          multiplier = -0.4;
          break;
        case overUnderAchievingSum < -0.2 && overUnderAchievingSum > -0.4:
          result = "overachieving";
          multiplier = -0.2;
          break;
        case overUnderAchievingSum < -0.1 && overUnderAchievingSum >= -0.2:
          result = "overachievingSlightly";
          multiplier = -0.1;
          break;
        case overUnderAchievingSum > 0.1 && overUnderAchievingSum <= 0.2:
          result = "underachievingSlightly";
          multiplier = 0.1;
          break;
        case overUnderAchievingSum > 0.2 && overUnderAchievingSum < 0.4:
          result = "underachieving";
          multiplier = 0.2;
          break;
        case overUnderAchievingSum >= 0.4:
          result = "underachievingDrastically";
          multiplier = 0.4;
          break;
        default:
          result = "onPar";
          multiplier = 0;
          break;
      }

      break;
    default:
      break;
  }
  return [result, multiplier];
}

async function getClinicalRating(form) {
  let rating;
  let score;
  switch (true) {
    case form.dangerousAttackConversion <= 15:
      rating = "excellent";
      score = 1.3;
      break;

    case form.dangerousAttackConversion > 15 &&
      form.dangerousAttackConversion <= 20:
      rating = "great";
      score = 1.2;
      break;

    case form.dangerousAttackConversion > 20 &&
      form.dangerousAttackConversion <= 25:
      rating = "very good";
      score = 1.15;
      break;

    case form.dangerousAttackConversion > 25 &&
      form.dangerousAttackConversion <= 30:
      rating = "good";
      score = 1.1;
      break;

    case form.dangerousAttackConversion > 30 &&
      form.dangerousAttackConversion <= 35:
      rating = "above average";
      score = 1.05;
      break;

    case form.dangerousAttackConversion > 35 &&
      form.dangerousAttackConversion <= 40:
      rating = "average";
      score = 1;
      break;

    case form.dangerousAttackConversion > 40 &&
      form.dangerousAttackConversion <= 45:
      rating = "below average";
      score = 0.95;
      break;

    case form.dangerousAttackConversion > 45 &&
      form.dangerousAttackConversion <= 50:
      rating = "poor";
      score = 0.9;
      break;

    case form.dangerousAttackConversion > 50 &&
      form.dangerousAttackConversion <= 55:
      rating = "very poor";
      score = 0.85;
      break;

    case form.dangerousAttackConversion > 55 &&
      form.dangerousAttackConversion <= 60:
      rating = "terrible";
      score = 0.8;
      break;

    case form.dangerousAttackConversion > 60:
      rating = "awful";
      score = 0.7;
      break;

    default:
      break;
  }

  return [rating, score];
}

async function getQualityOfAttacksScore(score) {
  let creativityScore;

  switch (true) {
    case score <= 0.1:
      creativityScore = 0.7;
      break;
    case score <= 0.2 && score > 0.1:
      creativityScore = 0.8;
      break;
    case score <= 0.3 && score > 0.2:
      creativityScore = 0.9;
      break;
    case score <= 0.4 && score > 0.3:
      creativityScore = 1;
      break;
    case score <= 0.5 && score > 0.4:
      creativityScore = 1.1;
      break;
    case score <= 0.6 && score > 0.5:
      creativityScore = 1.2;
      break;
    case score <= 0.7 && score > 0.6:
      creativityScore = 1.3;
      break;
    case score <= 0.8 && score > 0.7:
      creativityScore = 1.4;
      break;
    case score <= 0.9 && score > 0.8:
      creativityScore = 1.5;
      break;
    case score <= 1 && score > 0.9:
      creativityScore = 1.6;
      break;
    default:
      creativityScore = 1;
      break;
  }
  return creativityScore;
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
      last5WeightingHome = 0.3;
      last5WeightingAway = -0.3;
      break;
    case pointsDiff >= 10 && pointsDiff < 12:
      last5WeightingHome = 0.2;
      last5WeightingAway = -0.2;
      break;
    case pointsDiff >= 8 && pointsDiff < 10:
      last5WeightingHome = 0.15;
      last5WeightingAway = -0.15;
      break;
    case pointsDiff >= 6 && pointsDiff < 8:
      last5WeightingHome = 0.1;
      last5WeightingAway = -0.1;
      break;
    case pointsDiff >= 4 && pointsDiff < 6:
      last5WeightingHome = 0.05;
      last5WeightingAway = -0.05;
      break;
    case pointsDiff >= 2 && pointsDiff < 4:
      last5WeightingHome = 0.01;
      last5WeightingAway = -0.01;
      break;
    case pointsDiff >= 0 && pointsDiff < 2:
      last5WeightingHome = 0.005;
      last5WeightingAway = -0.005;
      break;
    case pointsDiff < 0 && pointsDiff > -2:
      last5WeightingHome = -0.005;
      last5WeightingAway = 0.005;
      break;
    case pointsDiff <= -2 && pointsDiff > -4:
      last5WeightingHome = -0.01;
      last5WeightingAway = 0.01;
      break;
    case pointsDiff <= -4 && pointsDiff > -6:
      last5WeightingHome = -0.05;
      last5WeightingAway = 0.05;
      break;
    case pointsDiff <= -6 && pointsDiff > -8:
      last5WeightingHome = -0.1;
      last5WeightingAway = 0.1;
      break;
    case pointsDiff <= -8 && pointsDiff > -10:
      last5WeightingHome = -0.15;
      last5WeightingAway = 0.15;
      break;
    case pointsDiff <= -10 && pointsDiff > -12:
      last5WeightingHome = -0.2;
      last5WeightingAway = 0.2;
      break;
    case pointsDiff <= -12:
      last5WeightingHome = -0.3;
      last5WeightingAway = 0.3;
      break;
    default:
      last5WeightingHome = 0;
      last5WeightingAway = 0;
      break;
  }
  return [last5WeightingHome, last5WeightingAway];
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

//Calculates scores based on prior XG figures, weighted by odds
export async function calculateScore(match, index, divider, id) {
  let homeRaw;
  let awayRaw;

  let teams;
  let calculate = true;

  let gameTotalWeighting;

  switch (true) {
    case divider === 5:
      gameTotalWeighting = 0.5;
      break;
    case divider === 6:
      gameTotalWeighting = 0.5;
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
      allForm.find((game) => game.away.teamName === match.awayTeam).away,
    ];
    // console.log(`teams:`);
    // console.log(teams[0]);
    // console.log(teams[1]);
    // console.log(match.homeTeam);
    // console.log(match.awayTeam);
  } else {
    calculate = false;
  }

  if (calculate) {
    for (let i = 0; i < teams.length; i++) {
      if (teams[0][index].PlayedHome <= 1 || teams[1][index].PlayedAway <= 1) {
        index = 2;
        divider = 10;
      }

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
      teams[i][index].longTermAverageGoals = teams[i][2].ScoredOverall / 10;
      teams[i][index].longTermAverageConceeded =
        teams[i][2].ConcededOverall / 10;

      teams[0][index].expectedGoalsLongTerm = parseFloat(teams[0][2].XGHome);
      teams[1][index].expectedGoalsLongTerm = parseFloat(teams[1][2].XGAway);

      teams[0][index].expectedConceededGoalsLongTerm = parseFloat(
        teams[0][2].XGAgainstHome
      );
      teams[1][index].expectedConceededGoalsLongTerm = parseFloat(
        teams[1][2].XGAgainstAway
      );

      teams[i][index].scoredAverageShortAndLongTerm =
        (teams[i][index].longTermAverageGoals + teams[i][index].scoredAverage) /
        2;

      teams[i][index].expectedGoalsShortAndLongTerm =
        (teams[i][index].expectedGoalsLongTerm +
          teams[i][index].expectedGoals) /
        2;

      teams[i][index].conceededAverageShortAndLongTerm =
        (teams[i][index].longTermAverageConceeded +
          teams[i][index].concededAverage) /
        2;

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

      if (teams[0][index].ScoredHome > 0) {
        teams[0][index].finishingScore = parseFloat(
          teams[0][index].expectedGoalsShortAndLongTerm -
            teams[0][index].scoredAverageShortAndLongTerm

          // teams[0][index].scoredAverageShortAndLongTerm /
          //   teams[0][index].expectedGoalsShortAndLongTerm
        );
      } else {
        teams[0][index].finishingScore = 0;
      }

      if (teams[1][index].ScoredAway > 0) {
        teams[1][index].finishingScore = parseFloat(
          teams[1][index].expectedGoalsShortAndLongTerm -
            teams[1][index].scoredAverageShortAndLongTerm

          // teams[1][index].scoredAverageShortAndLongTerm /
          //   teams[1][index].expectedGoalsShortAndLongTerm
        );
      } else {
        teams[1][index].finishingScore = 0;
      }

      if (teams[0][index].ConcededHome > 0) {
        teams[0][index].goalieRating = parseFloat(
          teams[0][index].conceededAverageShortAndLongTerm -
            teams[0][index].expectedConceededGoalsShortAndLongTerm

          // teams[0][index].conceededAverageShortAndLongTerm /
          //   teams[0][index].expectedConceededGoalsShortAndLongTerm
        );
      } else {
        teams[0][index].goalieRating = 0;
      }

      if (teams[1][index].ConcededAway > 0) {
        teams[1][index].goalieRating = parseFloat(
          teams[1][index].conceededAverageShortAndLongTerm -
            teams[1][index].expectedConceededGoalsShortAndLongTerm

          // teams[1][index].conceededAverageShortAndLongTerm /
          //   teams[1][index].expectedConceededGoalsShortAndLongTerm
        );
      } else {
        teams[1][index].goalieRating = 0;
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

      let goalOverOrUnderAchieving = parseFloat(
        await diff(teams[i][index].finishingScore, 0)
      );

      if (teams[i][index].scoredAverage < 0.5) {
        goalOverOrUnderAchieving = goalOverOrUnderAchieving / 4;
      }

      let concededOverOrUnderAchieving = parseFloat(
        await diff(teams[i][index].goalieRating, 0)
      );

      if (teams[i][index].concededAverage < 0.5) {
        concededOverOrUnderAchieving = concededOverOrUnderAchieving / 4;
      }



      teams[i][index].overUnderAchievingSumAttack = goalOverOrUnderAchieving;

      teams[i][
        index
      ].overUnderAchievingSumDefence = concededOverOrUnderAchieving;

      teams[i][index].overUnderAchievingSum =
        goalOverOrUnderAchieving + concededOverOrUnderAchieving;

      if (
        teams[i][index].finishingScore !== "N/A" &&
        teams[i][index].scoredAverageShortAndLongTerm >= 1
      ) {
        teams[i][index].AverageGoalsWeightedWithXG =
          (await diff(1, teams[i][index].finishingScore)) * gameTotalWeighting +
          teams[i][index].scoredAverageShortAndLongTerm;

        teams[i][index].trueFormGoalsWeighting =
          // (await diff(1, teams[i][index].finishingScore)) * gameTotalWeighting +
          teams[i][index].scoredAverageShortAndLongTerm +
          goalOverOrUnderAchieving * gameTotalWeighting;
      } else if (
        teams[i][index].scoredAverageShortAndLongTerm < 1 &&
        teams[i][index].scoredAverageShortAndLongTerm >= 0.6
      ) {
        teams[i][index].AverageGoalsWeightedWithXG =
          (await diff(1, teams[i][index].finishingScore)) *
            (gameTotalWeighting / 1) +
          teams[i][index].scoredAverageShortAndLongTerm;

        teams[i][index].trueFormGoalsWeighting =
          // (await diff(1, teams[i][index].finishingScore)) * gameTotalWeighting +
          teams[i][index].scoredAverageShortAndLongTerm +
          goalOverOrUnderAchieving * gameTotalWeighting;
      } else if (
        teams[i][index].scoredAverageShortAndLongTerm < 0.6 &&
        teams[i][index].scoredAverageShortAndLongTerm > 0.3
      ) {
        teams[i][index].AverageGoalsWeightedWithXG =
          (await diff(1, teams[i][index].finishingScore)) *
            (gameTotalWeighting / 2) +
          teams[i][index].scoredAverageShortAndLongTerm;

        teams[i][index].trueFormGoalsWeighting =
          // (await diff(1, teams[i][index].finishingScore)) *
          //   (gameTotalWeighting / 2) +
          teams[i][index].scoredAverageShortAndLongTerm +
          goalOverOrUnderAchieving * gameTotalWeighting;
      } else {
        teams[i][index].AverageGoalsWeightedWithXG =
          teams[i][index].scoredAverageShortAndLongTerm;

        teams[i][index].trueFormGoalsWeighting = teams[i][index].scoredAverage;
      }

      if (
        teams[i][index].conceededAverageShortAndLongTerm >= 1 &&
        teams[i][index].concededAverage > 0
      ) {
        teams[i][index].AverageGoalsConceededWeightedWithXG =
          (await diff(teams[i][index].goalieRating, 1)) * gameTotalWeighting +
          teams[i][index].conceededAverageShortAndLongTerm;

        teams[i][index].trueFormConceededWeighting =
          // (await diff(1, teams[i][index].goalieRating)) * gameTotalWeighting +
          teams[i][index].conceededAverageShortAndLongTerm -
          concededOverOrUnderAchieving * gameTotalWeighting;
      } else if (
        teams[i][index].conceededAverageShortAndLongTerm < 1 &&
        teams[i][index].conceededAverageShortAndLongTerm >= 0.6 &&
        teams[i][index].concededAverage > 0
      ) {
        teams[i][index].AverageGoalsConceededWeightedWithXG =
          (await diff(1, teams[i][index].goalieRating)) *
            (gameTotalWeighting / 1) +
          teams[i][index].conceededAverageShortAndLongTerm;

        teams[i][index].trueFormConceededWeighting =
          // (await diff(1, teams[i][index].goalieRating)) * gameTotalWeighting +
          teams[i][index].conceededAverageShortAndLongTerm -
          concededOverOrUnderAchieving * gameTotalWeighting;
      } else if (
        teams[i][index].conceededAverageShortAndLongTerm < 0.6 &&
        teams[i][index].conceededAverageShortAndLongTerm >= 0.3 &&
        teams[i][index].concededAverage > 0
      ) {
        teams[i][index].AverageGoalsConceededWeightedWithXG =
          (await diff(1, teams[i][index].goalieRating)) *
            (gameTotalWeighting / 2) +
          teams[i][index].conceededAverageShortAndLongTerm;

        teams[i][index].trueFormConceededWeighting =
          // (await diff(1, teams[i][index].goalieRating)) *
          //   (gameTotalWeighting / 2) +
          teams[i][index].conceededAverageShortAndLongTerm -
          concededOverOrUnderAchieving * gameTotalWeighting;
      } else {
        teams[i][index].AverageGoalsConceededWeightedWithXG =
          teams[i][index].conceededAverageShortAndLongTerm;

        teams[i][index].trueFormConceededWeighting =
          teams[i][index].concededAverage;
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

      teams[0][index].DAmultiplier = await getDAPrediction(match.homeOdds);
      teams[1][index].DAmultiplier = await getDAPrediction(match.awayOdds);

      switch (true) {
        case teams[i][index].XGdifferential > 1:
          teams[i][index].XGWeighting = 1.2;
          break;
        case teams[i][index].XGdifferential <= 1 &&
          teams[i][index].XGdifferential > 0.5:
          teams[i][index].XGWeighting = 1.1;
          break;
        case teams[i][index].XGdifferential <= 0.5 &&
          teams[i][index].XGdifferential > 0:
          teams[i][index].XGWeighting = 1.05;
          break;
        case teams[i][index].XGdifferential >= -0.5 &&
          teams[i][index].XGdifferential < 0:
          teams[i][index].XGWeighting = -0.95;
          break;
        case teams[i][index].XGdifferential >= -1 &&
          teams[i][index].XGdifferential < -0.5:
          teams[i][index].XGWeighting = 0.9;
          break;
        case teams[i][index].XGdifferential < -1:
          teams[i][index].XGWeighting = 0.8;
          break;
        default:
          teams[i][index].XGWeighting = 1;
          break;
      }
    }

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

    let formHome = teams[0][index];
    let formAway = teams[1][index];

    [
      formHome.overOrUnderAttack,
      formHome.trueFormAttack,
    ] = await getOverOrUnderAchievingResult(
      index,
      formHome.overUnderAchievingSumAttack
    );

    [
      formHome.overOrUnderDefence,
      formHome.trueFormDefence,
    ] = await getOverOrUnderAchievingResult(
      index,
      formHome.overUnderAchievingSumDefence
    );

    [
      formAway.overOrUnderAttack,
      formAway.trueFormAttack,
    ] = await getOverOrUnderAchievingResult(
      index,
      formAway.overUnderAchievingSumAttack
    );

    [
      formAway.overOrUnderDefence,
      formAway.trueFormDefence,
    ] = await getOverOrUnderAchievingResult(
      index,
      formAway.overUnderAchievingSumDefence
    );

    let pointsDiff = await getPointsDifferential(
      formHome.last5Points,
      formAway.last5Points
    );

    let [last5WeightingHome, last5WeightingAway] = await getPointWeighting(
      pointsDiff
    );

    // let gameValue;

    // if (divider === 5) {
    //   gameValue = 2;
    // } else if (divider === 6) {
    //   gameValue = 1.8;
    // } else if (divider === 10) {
    //   gameValue = 1;
    // }

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

    formHome.dangerousAttackConversion =
      formHome.AverageDangerousAttacks / formHome.scoredAverageShortAndLongTerm;
    formAway.dangerousAttackConversion =
      formAway.AverageDangerousAttacks / formAway.scoredAverageShortAndLongTerm;

    formHome.goalsPerDangerousAttack =
      formHome.scoredAverageShortAndLongTerm / formHome.AverageDangerousAttacks;
    formAway.goalsPerDangerousAttack =
      formAway.scoredAverageShortAndLongTerm / formAway.AverageDangerousAttacks;

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

    homeWeighting = weightingSplitHome * 1;
    awayWeighting = weightingSplitAway * 1;

    let homeCalculation;
    let awayCalculation;

    homeCalculation = parseFloat(1 + homeWeighting);
    awayCalculation = parseFloat(1 + awayWeighting);

    // console.log(`homeCalculation ${homeCalculation}`);

    // console.log(`awayCalculation ${awayCalculation}`);

    teams[0][index].predictedDA =
      teams[0][index].DangerousAttacksHome * homeCalculation;
    teams[1][index].predictedDA =
      teams[1][index].DangerousAttacksAway * awayCalculation;

    formHome.homeGoalWeighting = parseFloat(
      1 + formHome.homeAttackAdvantage / 100
    );
    formHome.homeDefenceWeighting = parseFloat(
      1 + formHome.homeDefenceAdvantage / 100
    );

    formHome.homeAdv = parseFloat(
      (formAway.homeGoalWeighting + formHome.homeDefenceWeighting) / 2
    );

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

    formHome.creationToConversionScore =
      formHome.DangerousAttacksHome / formHome.expectedGoals;
    formAway.creationToConversionScore =
      formAway.DangerousAttacksAway / formAway.expectedGoals;

    formHome.creationToConversionScoreV2 =
      formHome.AttacksHome /
      formHome.AverageDangerousAttacks /
      formHome.AverageShotsOnTarget /
      formHome.expectedGoals;
    formAway.creationToConversionScoreV2 =
      formAway.AttacksAway /
      formAway.AverageDangerousAttacks /
      formAway.AverageShotsOnTarget /
      formAway.expectedGoals;

    formHome.attackQualityMultiplier = await getQualityOfAttacksScore(
      formHome.creationToConversionScoreV2
    );
    formAway.attackQualityMultiplier = await getQualityOfAttacksScore(
      formAway.creationToConversionScoreV2
    );

    let finalHomeGoals;
    let finalAwayGoals;

    async function roundCustom(num, form, otherTeamForm) {
      let wholeNumber = Math.floor(num);
      let remainder = num - wholeNumber;

      // if(form.dangerousAttackConversion === "excellent" || form.dangerousAttackConversion === "great" || form.dangerousAttackConversion === "very good" || form.dangerousAttackConversion === "good" || form.dangerousAttackConversion === "above average"){
      //   return Math.ceil(num)
      // } else if(form.dangerousAttackConversion === "awful" || form.dangerousAttackConversion === "terrible" || form.dangerousAttackConversion === "very poor" || form.dangerousAttackConversion === "poor" || form.dangerousAttackConversion === "below average"){
      //   return Math.ceil(num)
      // } else {
      //   return Math.round(num)
      // }

      if (wholeNumber === 0) {
        if (
          form.overOrUnderAttack === "overachievingDrastically" ||
          form.overOrUnderAttack === "overachieving"
        ) {
          return Math.floor(num);
        } else if (
          form.overOrUnderAttack === "underachievingDrastically" ||
          form.overOrUnderAttack === "underachieving"
        ) {
          return Math.ceil(num);
        } else {
          return Math.round(num);
        }
      } else if (remainder > 0.8) {
        return Math.ceil(num);
      } else if (remainder <= 0.8) {
        return Math.floor(num);
      }

      // return Math.round(num)

      // if (
      //   form.AverageGoalsWeightedWithXG > num &&
      //   otherTeamForm.AverageGoalsConceededWeightedWithXG < num
      // ) {
      //   return Math.ceil(num);
      // } else if (
      //   form.AverageGoalsWeightedWithXG > num &&
      //   otherTeamForm.AverageGoalsConceededWeightedWithXG > num
      // ) {
      //   return Math.floor(num);
      // } else if (
      //   form.AverageGoalsWeightedWithXG < num &&
      //   otherTeamForm.AverageGoalsConceededWeightedWithXG < num
      // ) {
      //   return Math.floor(num);
      // } else if (
      //   form.AverageGoalsWeightedWithXG < num &&
      //   otherTeamForm.AverageGoalsConceededWeightedWithXG > num
      // ) {
      //   return Math.floor(num);
      // } else {
      //   return Math.round(num);
      // }
      // if (remainder > 0.8) {
      //   return Math.ceil(num);
      // }

      // if (form.overOrUnder === "overachievingDrastically") {
      //   return Math.floor(num);
      // } else if (form.overOrUnder === "underachievingDrastically") {
      //   return Math.ceil(num);
      // } else if (remainder < 0.7) {
      //   return Math.floor(num);
      // } else if (
      //   form.overOrUnder === "underachieving" &&
      //   otherTeamForm.overOrUnder === "overachieving"
      // ) {
      //   // console.log("INCREASING");
      //   return Math.ceil(num);
      // } else if (
      //   form.overOrUnder === "underachieving" &&
      //   otherTeamForm.overOrUnder === "onPar"
      // ) {
      //   return Math.round(num);
      // } else if (
      //   form.overOrUnder === "overachieving" &&
      //   otherTeamForm.overOrUnder === "underachieving"
      // ) {
      //   // console.log("DECREASING");
      //   return Math.floor(num);
      // } else if (
      //   form.overOrUnder === "overachieving" &&
      //   otherTeamForm.overOrUnder === "overachieving"
      // ) {
      //   // console.log("DECREASING");
      //   return Math.round(num);
      // }
      // else if (num < 0.9 && num < form.scoredAverage) {
      //   return Math.floor(num);
      // } else {
      //   return Math.round(num);
      // }

      // if (form.last5Points > 12) {
      //   return Math.ceil(num);
      // } else if (form.last5Points <= 6) {
      //   return Math.floor(num);
      // } else {
      //   return Math.round(num);
      // }
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
      parseFloat(await diff(homeGoalDiff, awayGoalDiff)) / 4;
    formAway.goalsDifferential =
      parseFloat(await diff(awayGoalDiff, homeGoalDiff)) / 4;

    // console.log(
    //   `${match.game} home goalsDifferential = ${formHome.goalsDifferential} away goalsDifferential = ${formAway.goalsDifferential}`
    // );

    let goalsBasedOnHomeXG =
      ((formHome.expectedGoals + formAway.expectedGoalsConceeded) / 2) *
      (1 + last5WeightingHome);

    let goalsBasedOnAwayXG =
      ((formAway.expectedGoals + formHome.expectedGoalsConceeded) / 2) *
      (1 + last5WeightingAway);

    let goalCalcHome = (formHome.scoredAverage + formAway.concededAverage) / 2;
    let goalCalcAway = (formAway.scoredAverage + formHome.concededAverage) / 2;

    let homeGoalsBasedOnOdds = parseFloat(
      formHome.goalsFromOdds * formHome.clinicalScore
    );
    let awayGoalsBasedOnOdds = parseFloat(
      formAway.goalsFromOdds * formAway.clinicalScore
    );

    let homeGoalsBasedOnDA = parseFloat(
      formHome.goalsPerDangerousAttack * formHome.predictedDA
    );
    let awayGoalsBasedOnDA = parseFloat(
      formAway.goalsPerDangerousAttack * formAway.predictedDA
    );

    let factorOneHome =
      goalCalcHome +
      formHome.goalsDifferential * 1 +
      PPGweightingHome * 1 +
      last5WeightingHome * 2;

    let factorTwoHome =
      (formHome.trueFormGoalsWeighting + formAway.trueFormConceededWeighting) /
      2;

    let factorOneAway =
      goalCalcAway +
      formAway.goalsDifferential * 1 +
      PPGweightingAway * 1 +
      last5WeightingAway * 2;

    let factorTwoAway =
      (formAway.trueFormGoalsWeighting + formHome.trueFormConceededWeighting) /
      2;


    let experimentalHomeGoals =
      ((factorOneHome + factorTwoHome) / 2) *
        homeCalculation *
        // formHome.clinicalScore *
        // formHome.attackQualityMultiplier *
        formHome.homeGoalWeighting +
      formHome.trueFormAttack +
      formAway.trueFormDefence;

    // let experimentalHomeGoals =
    //   (factorTwoHome) *
    //   homeCalculation *
    //   // formHome.clinicalScore *
    //   formHome.attackQualityMultiplier *
    //   formHome.homeGoalWeighting;

    let experimentalAwayGoals =
      ((factorOneAway + factorTwoAway) / 2) * awayCalculation +
      formAway.trueFormAttack +
      formHome.trueFormDefence;

    // let experimentalAwayGoals =
    //   (factorTwoAway) *
    //   awayCalculation *
    //   // formAway.clinicalScore *
    //   formAway.attackQualityMultiplier;

    let XGGoalsHome =
      (formHome.AverageGoalsWeightedWithXG +
        formAway.AverageGoalsConceededWeightedWithXG) /
      2;

    let XGGoalsAway =
      (formAway.AverageGoalsWeightedWithXG +
        formHome.AverageGoalsConceededWeightedWithXG) /
      2;

    // let conversionPredictionHome = formHome.HomePredictionBasedOnShotConversion * oddsWeightingHome
    // let conversionPredictionAway = formAway.AwayPredictionBasedOnShotConversion * oddsWeightingAway

    // console.log(match.game);
    // console.log(`index ${index}`)
    // console.log(`home goals: ${XGGoalsHome}`);
    // console.log("formHome");
    // console.log(formHome);
    // console.log(`Goals home = ${experimentalHomeGoals}`)

    // console.log(`Weighted goals home =  ${formHome.AverageGoalsWeightedWithXG}`)
    // console.log(`Average goals conceeded weighted = ${formHome.AverageGoalsConceededWeightedWithXG}`)
    // // console.log(last5WeightingHome);

    // console.log("formAway");
    // console.log(`away goals: ${XGGoalsAway}`);
    // console.log(formAway);
    // console.log(`Goals away = ${experimentalAwayGoals}`)
    // console.log(`awayCalculation ${awayCalculation}`)
    // console.log(`factorOneAway ${factorOneAway}`)
    // console.log(`factorTwoAway ${factorTwoAway}`)
    // console.log(`formAway.trueFormGoalsWeighting ${formAway.trueFormGoalsWeighting}`)
    // console.log(`formHome.trueFormConceededWeighting ${formHome.trueFormConceededWeighting}`)

    // console.log(`Weighted goals away =  ${formAway.AverageGoalsWeightedWithXG}`)
    // console.log(`Average goals conceeded weighted = ${formAway.AverageGoalsConceededWeightedWithXG}`)

    // console.log(last5WeightingAway);

    // console.log("EXPERIMENTAL HOME GOALS");
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

    // console.log("EXPERIMENTAL AWAY GOALS");
    // console.log(`${match.awayTeam}`);
    // console.log(
    //   `formAway.scoredAverage ${formAway.scoredAverage} + formHome.concededAverage ${formHome.concededAverage} / 2`
    // );

    // console.log(`PPGweightingAway ${PPGweightingAway}`);
    // console.log(`formAway.XGWeighting ${formAway.XGWeighting}`);
    // console.log(`last5WeightingAway ${last5WeightingAway}`);

    // console.log(teams[1][index].XGdifferential)

    // console.log(experimentalAwayGoals);

    // console.log(
    //   `${match.homeTeam} experimental goals ${experimentalHomeGoals}`
    // );

    // console.log(
    //   `${match.homeTeam} AverageGoalsWeightedWithXG ${formHome.AverageGoalsWeightedWithXG}`
    // );

    // console.log(
    //   `${match.awayTeam} AverageGoalsConceededWeightedWithXG ${formAway.AverageGoalsConceededWeightedWithXG}`
    // );


    let rawFinalHomeGoals = parseFloat(
      // (experimentalHomeGoals + formHome.expectedGoals) / 2

      (experimentalHomeGoals * 1 +
        XGGoalsHome * 0 +
        // conversionPredictionHome +
        homeGoalsBasedOnDA * 0 +
        formHome.expectedGoals * 0) /
        1

      // homeGoalsBasedOnDA
      // ((formHome.AverageGoalsWeightedWithXG + formAway.AverageGoalsConceededWeightedWithXG) / 2)
    );

    let rawFinalAwayGoals = parseFloat(
      // (experimentalAwayGoals + formAway.expectedGoals) / 2

      (experimentalAwayGoals * 1 +
        XGGoalsAway * 0 +
        // conversionPredictionAway +
        awayGoalsBasedOnDA * 0 +
        formAway.expectedGoals * 0) /
        1

      // awayGoalsBasedOnDA
      // ((formAway.AverageGoalsWeightedWithXG + formHome.AverageGoalsConceededWeightedWithXG) / 2)
    );

    switch (true) {
      case formHome.overOrUnderAttack === "overachievingDrastically":
        rawFinalHomeGoals = rawFinalHomeGoals - 0.3;
        break;
      case formAway.overOrUnderAttack === "overachievingDrastically":
        rawFinalAwayGoals = rawFinalAwayGoals - 0.3;
        break;
      case formHome.overOrUnderAttack === "overachievingSlightly":
        rawFinalHomeGoals = rawFinalHomeGoals - 0.1;
        break;
      case formAway.overOrUnderAttack === "overachievingSlightly":
        rawFinalAwayGoals = rawFinalAwayGoals - 0.1;
        break;
      case formHome.overOrUnderAttack === "underachievingDrastically":
        rawFinalHomeGoals = rawFinalHomeGoals + 0.3;
        break;
      case formAway.overOrUnderAttack === "underachievingDrastically":
        rawFinalAwayGoals = rawFinalAwayGoals + 0.3;
        break;
      case formHome.overOrUnderAttack === "underachievingSlightly":
        rawFinalHomeGoals = rawFinalHomeGoals + 0.1;
        break;
      case formAway.overOrUnderAttack === "underachievingSlightly":
        rawFinalAwayGoals = rawFinalAwayGoals + 0.1;
        break;
      default:
        break;
    }

    switch (true) {
      case formHome.overOrUnderDefence === "overachievingDrastically":
        rawFinalAwayGoals = rawFinalAwayGoals + 0.3;
        break;
      case formAway.overOrUnderDefence === "overachievingDrastically":
        rawFinalHomeGoals = rawFinalHomeGoals + 0.3;
        break;
      case formHome.overOrUnderDefence === "overachievingSlightly":
        rawFinalAwayGoals = rawFinalAwayGoals + 0.1;
        break;
      case formAway.overOrUnderDefence === "overachievingSlightly":
        rawFinalHomeGoals = rawFinalHomeGoals + 0.1;
        break;
      case formHome.overOrUnderDefence === "underachievingDrastically":
        rawFinalAwayGoals = rawFinalAwayGoals - 0.3;
        break;
      case formAway.overOrUnderDefence === "underachievingDrastically":
        rawFinalHomeGoals = rawFinalHomeGoals - 0.3;
        break;
      case formHome.overOrUnderDefence === "underachievingSlightly":
        rawFinalAwayGoals = rawFinalAwayGoals - 0.1;
        break;
      case formAway.overOrUnderDefence === "underachievingSlightly":
        rawFinalHomeGoals = rawFinalHomeGoals - 0.1;
        break;
      default:
        break;
    }

    // console.log(match.game);
    // console.log(formHome);
    // console.log(`${formHome.teamName} ${formHome.overOrUnder}`);
    // console.log(formAway);
    // console.log(`${formAway.teamName} ${formAway.overOrUnder}`);

    // console.log(`rawFinalHomeGoals: ${rawFinalHomeGoals}`);
    // console.log(`rawFinalAwayGoals: ${rawFinalAwayGoals}`);

    // console.log(`experimentalHomeGoals: ${experimentalHomeGoals}`);

    // console.log(`experimentalAwayGoals: ${experimentalAwayGoals}`);

    // console.log(`XGGoalsHome: ${XGGoalsHome}`);

    // console.log(`XGGoalsAway: ${XGGoalsAway}`);

    // console.log(`homeGoalsBasedOnDA: ${homeGoalsBasedOnDA}`);

    // console.log(`awayGoalsBasedOnDA: ${awayGoalsBasedOnDA}`);

    // console.log(`homeAdvantageAttackAdjustment ${homeAdvantageAttackAdjustment}`)
    // console.log(`home homeDefenceAdvantageWeighted ${formHome.homeDefenceAdvantageWeighted}`)
    // console.log(`homeAdvantageDefenceAdjustment ${homeAdvantageDefenceAdjustment}`)

    // console.log(`${match.homeTeam} raw goals ${rawFinalHomeGoals}`);

    if (rawFinalAwayGoals < 0) {
      let difference = parseFloat((await diff(0, rawFinalAwayGoals)) / 10);
      rawFinalHomeGoals = rawFinalHomeGoals + difference;
    }

    if (rawFinalHomeGoals < 0) {
      let difference = parseFloat((await diff(0, rawFinalHomeGoals)) / 10);
      rawFinalAwayGoals = rawFinalAwayGoals + difference;
    }

    finalHomeGoals = await roundCustom(rawFinalHomeGoals, formHome, formAway);

    // finalHomeGoals = Math.round(rawFinalHomeGoals);

    // finalHomeGoals = rawFinalHomeGoals.toFixed(1)

    finalAwayGoals = await roundCustom(rawFinalAwayGoals, formAway, formHome);

    // finalAwayGoals = Math.round(rawFinalAwayGoals);

    if (finalHomeGoals > 5) {
      finalHomeGoals = Math.round((finalHomeGoals + formHome.expectedGoals) / 2);
    }

    if (finalAwayGoals > 5) {
      finalAwayGoals = Math.round((finalAwayGoals + formAway.expectedGoals) / 2);
    }

    // finalAwayGoals = rawFinalAwayGoals.toFixed(1)

    if (finalHomeGoals > finalAwayGoals) {
      match.prediction = "homeWin";
      if (formHome.overUnderAchievingSum < -1) {
        match.includeInMultis = false;
      } else {
        match.includeInMultis = true;
      }
    } else if (finalAwayGoals > finalHomeGoals) {
      match.prediction = "awayWin";
      if (formAway.overUnderAchievingSum < -1) {
        match.includeInMultis = false;
      } else {
        match.includeInMultis = true;
      }
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
    finalHomeGoals = 0;
    finalAwayGoals = 0;
    rawFinalHomeGoals = 0;
    rawFinalAwayGoals = 0;
  }

  return [finalHomeGoals, finalAwayGoals, rawFinalHomeGoals, rawFinalAwayGoals];
}

async function getSuccessMeasure(fixtures) {
  let sumProfit = 0;
  let sumLoss = 0;
  let investment = 0;
  let netProfit;

  for (let i = 0; i < fixtures.length; i++) {
    if (fixtures[i].status === "complete") {
      // console.log(fixtures[i].game)
      // console.log(fixtures[i].netProfit)
      sumProfit = sumProfit + fixtures[i].profit;

      // if(fixtures[i].profit === 0){
      //   sumLoss = sumLoss - 1;
      // }

      investment = investment + 1;
      netProfit = (sumProfit - investment).toFixed(2);
    }
  }

  // let ROI = ((netProfit + stake) / stake) * 100;

  let ROI = (netProfit / investment) * 100;
  var operand = ROI >= 0 ? "+" : "";

  if (investment > 0) {
    ReactDOM.render(
      <Fragment>
        <Div
          className={"SuccessMeasure"}
          text={`ROI for all ${investment} W/D/W outcomes: ${operand} ${ROI.toFixed(
            2
          )}%`}
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

export async function getScorePrediction(day, mocked) {
  let radioSelected = parseInt(selectedOption);
  let mock = mocked;
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
  } else if (radioSelected === 0) {
    index = 2;
    divider = 10;
  }

  await Promise.all(
    matches.map(async (match) => {
      // if there are no stored predictions, calculate them based on live data
      if (match) {
        switch (true) {
          // case match.status === "!suspended":
          //   [
          //     match.goalsA,
          //     match.goalsB,
          //     match.unroundedGoalsA,
          //     match.unroundedGoalsB,
          //   ] = await calculateScore(match, index, divider, match.id);

          //   break;
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
          match.homePpg > 1 &&
          match.includeInMultis === true
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
        match.unroundedGoalsB - incrementValue > match.unroundedGoalsA &&
        match.awayOdds !== 0 &&
        match.fractionAway !== "N/A"
      ) {
        if (
          match.prediction !== "draw" &&
          match.status !== "suspended" &&
          match.status !== "canceled" &&
          match.awayOdds < 3.5 &&
          match.awayPpg > 1 &&
          match.includeInMultis === true
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

      if (match.bttsChosen === true) {
        accumulatedOdds =
          parseFloat(accumulatedOdds) * parseFloat(match.bttsOdds);

        predictionObject = {
          team: `${match.game} btts`,
          odds: match.bttsFraction,
          outcome: match.bttsOutcome,
        };
        tips.push(predictionObject);
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
        match.unroundedGoalsA - 0.5 > match.unroundedGoalsB &&
        match.homeOdds >= 2.5 &&
        match.goalsA > match.goalsB
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
        match.unroundedGoalsA < match.unroundedGoalsB - 0.5 &&
        match.awayOdds >= 2.5 &&
        match.goalsB > match.goalsA
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
