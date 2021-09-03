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

async function compareStat(statOne, statTwo){
  let result;

  switch (true) {
    case statOne === statTwo:
      result = 0
      break;
    case statOne > statTwo:
      result = 1
      break;
    case statOne < statTwo:
      result = -1
      break;
    default:
      break;
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
          result = "overachievingDrastically";
          correction = -0.4;
          break;
        case overUnderAchievingSum < -0.45 && overUnderAchievingSum > -1.2:
          result = "overachieving";
          correction = -0.2;
          break;
        case overUnderAchievingSum < -0.1 && overUnderAchievingSum >= -0.45:
          result = "overachievingSlightly";
          correction = -0.1;
          break;
        case overUnderAchievingSum > 0.1 && overUnderAchievingSum <= 0.45:
          result = "underachievingSlightly";
          correction = 0.1;
          break;
        case overUnderAchievingSum > 0.45 && overUnderAchievingSum < 1.2:
          result = "underachieving";
          correction = 0.2;
          break;
        case overUnderAchievingSum >= 1.2:
          result = "underachievingDrastically";
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
          result = "overachievingDrastically";
          correction = -0.4;
          break;
        case overUnderAchievingSum < -0.35 && overUnderAchievingSum > -0.9:
          result = "overachieving";
          correction = -0.2;
          break;
        case overUnderAchievingSum < -0.1 && overUnderAchievingSum >= -0.35:
          result = "overachievingSlightly";
          correction = -0.1;
          break;
        case overUnderAchievingSum > 0.1 && overUnderAchievingSum <= 0.35:
          result = "underachievingSlightly";
          correction = 0.1;
          break;
        case overUnderAchievingSum > 0.35 && overUnderAchievingSum < 0.9:
          result = "underachieving";
          correction = 0.2;
          break;
        case overUnderAchievingSum >= 0.9:
          result = "underachievingDrastically";
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
        case overUnderAchievingSum <= -0.6:
          result = "overachievingDrastically";
          correction = -0.4;
          break;
        case overUnderAchievingSum < -0.25 && overUnderAchievingSum > -0.6:
          result = "overachieving";
          correction = -0.2;
          break;
        case overUnderAchievingSum < -0.1 && overUnderAchievingSum >= -0.25:
          result = "overachievingSlightly";
          correction = -0.1;
          break;
        case overUnderAchievingSum > 0.1 && overUnderAchievingSum <= 0.25:
          result = "underachievingSlightly";
          correction = 0.1;
          break;
        case overUnderAchievingSum > 0.25 && overUnderAchievingSum < 0.6:
          result = "underachieving";
          correction = 0.2;
          break;
        case overUnderAchievingSum >= 0.6:
          result = "underachievingDrastically";
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
      creativityScore = 0.8;
      break;
    case score <= 0.2 && score > 0.1:
      creativityScore = 0.85;
      break;
    case score <= 0.3 && score > 0.2:
      creativityScore = 0.9;
      break;
    case score <= 0.4 && score > 0.3:
      creativityScore = 1;
      break;
    case score <= 0.5 && score > 0.4:
      creativityScore = 1.05;
      break;
    case score <= 0.6 && score > 0.5:
      creativityScore = 1.1;
      break;
    case score <= 0.7 && score > 0.6:
      creativityScore = 1.2;
      break;
    case score <= 0.8 && score > 0.7:
      creativityScore = 1.3;
      break;
    case score <= 0.9 && score > 0.8:
      creativityScore = 1.4;
      break;
    case score <= 1 && score > 0.9:
      creativityScore = 1.5;
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
      last5WeightingHome = 0.4;
      last5WeightingAway = -0.4;
      break;
    case pointsDiff >= 10 && pointsDiff < 12:
      last5WeightingHome = 0.25;
      last5WeightingAway = -0.25;
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
      last5WeightingHome = -0.25;
      last5WeightingAway = 0.25;
      break;
    case pointsDiff <= -12:
      last5WeightingHome = -0.4;
      last5WeightingAway = 0.4;
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
      gameTotalWeighting = 1;
      break;
    case divider === 6:
      gameTotalWeighting = 1;
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

      teams[i][index].last5Points = getPointsFromLastX(
        teams[i][index].LastFiveForm
      );

      teams[i][index].last6Points = getPointsFromLastX(
        teams[i][index].LastSixForm
      );

      teams[i][index].last10Points = getPointsFromLastX(
        teams[i][index].LastTenForm
      );

      let last2 = [teams[i][index].lastGame, teams[i][index].previousToLastGame]
      teams[i][index].last2Points = getPointsFromLastX(
        last2
      );

      async function getPointAverage(pointTotal, games){
        return pointTotal / games
      }

      let fiveGameAverage = await getPointAverage(teams[i][index].last5Points, 5)
      let sixGameAverage = await getPointAverage(teams[i][index].last6Points, 6)
      let tenGameAverage = await getPointAverage(teams[i][index].last10Points, 10)

      // console.log(fiveGameAverage)
      // console.log(sixGameAverage)
      // console.log(tenGameAverage)

      async function compareFormTrend(five, six, ten){
        let text;
        let score

        if(five >= 2.5){
          switch (true) {
            case five > ten:
              text = "Outstanding and improving"
              score = 9.5
              break;
              case five === ten:
                text = "Outstanding and consistent"
                score = 10

                break;
                case five < ten:
                  text = "Consistently outstanding"
                  score = 9
                  break;
            default:
              break;
          }
        } else if (five < 2.5 && five >= 2){
          switch (true) {
            case five > ten:
              text = "Very good and improving"
              score = 8.5
              break;
              case five === ten:
                text = "Very good and consistent"
                score = 9
                break;
                case five < ten:
                  text = "Very good but slightly worsening"
                  score = 8
                  break;
            default:
              break;
          }
        } else if (five < 2 && five >= 1.5){
          switch (true) {
            case five > ten:
              text = "Good and improving"
              score = 7.5
              break;
              case five === ten:
                text = "Good and consistent"
                score = 8
                break;
                case five < ten:
                  text = "Good but slightly worsening"
                  score = 7
                  break;
            default:
              break;
          }
        } else if (five < 1.5 && five >= 1){
          switch (true) {
            case five > ten:
              text = "Average and improving"
              score = 6.5
              break;
              case five === ten:
                text = "Average and consistent"
                score = 7
                break;
                case five < ten:
                  text = "Average but slightly worsening"
                  score = 6
                  break;
            default:
              break;
          }
        } else if (five < 1 && five >= 0.5){
          switch (true) {
            case five > ten:
              text = "Poor but improving"
              score = 5.5
              break;
              case five === ten:
                text = "Poor and consistent"
                score = 6
                break;
                case five < ten:
                  text = "Poor and slightly worsening"
                  score = 5
                  break;
            default:
              break;
          }
        } else if (five < 0.5){
          switch (true) {
            case five > ten:
              text = "Terrible but slightly improving"
              score = 4.5
              break;
              case five === ten:
                text = "Consistently terrible"
                score = 5
                break;
                case five < ten:
                  text = "Terrible and worsening"
                  score = 4
                  break;
            default:
              break;
          }
        } 
        return score
      }

      teams[i][index].formTrendScore = await compareFormTrend(fiveGameAverage, sixGameAverage, tenGameAverage)

      // console.log(`${match.homeTeam} form score = ${teams[i][index].formTrendScore}`)


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

      if (teams[0][index].ScoredHome > 0) {
        teams[0][index].finishingScore = parseFloat(
          teams[0][index].expectedGoals - teams[0][index].scoredAverage
        );
      } else {
        teams[0][index].finishingScore = 0;
      }

      if (teams[1][index].ScoredAway > 0) {
        teams[1][index].finishingScore = parseFloat(
          teams[1][index].expectedGoals - teams[1][index].scoredAverage
        );
      } else {
        teams[1][index].finishingScore = 0;
      }

      if (teams[0][index].ConcededHome > 0) {
        teams[0][index].goalieRating = parseFloat(
          teams[0][index].concededAverage -
            teams[0][index].expectedGoalsConceeded
        );
      } else {
        teams[0][index].goalieRating = 0;
      }

      if (teams[1][index].ConcededAway > 0) {
        teams[1][index].goalieRating = parseFloat(
          teams[1][index].concededAverage -
            teams[1][index].expectedGoalsConceeded
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
          teams[i][index].defenceRating = 1.1;
          break;
        case defenceScore > 0 && defenceScore < 20:
          teams[i][index].defenceRating = 1.05;
          break;
        case defenceScore >= 20 && defenceScore < 30:
          teams[i][index].defenceRating = 1.01;
          break;
        case defenceScore >= 30 && defenceScore < 40:
          teams[i][index].defenceRating = 1;
          break;
        case defenceScore >= 40 && defenceScore < 50:
          teams[i][index].defenceRating = 0.99;
          break;
        case defenceScore >= 50 && defenceScore < 60:
          teams[i][index].defenceRating = 0.95;
          break;
        case defenceScore >= 60 && defenceScore < 70:
          teams[i][index].defenceRating = 0.9;
          break;
        case defenceScore >= 70 && defenceScore < 80:
          teams[i][index].defenceRating = 0.85;
          break;
        case defenceScore >= 80:
          teams[i][index].defenceRating = 0.8;
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

      if (teams[i][index].scoredAverage < 0.5) {
        goalOverOrUnderAchieving = goalOverOrUnderAchieving / 4;
      }

      if (teams[i][index].concededAverage < 0.5) {
        concededOverOrUnderAchieving = concededOverOrUnderAchieving / 4;
      }

      teams[i][index].overUnderAchievingSumAttack = goalOverOrUnderAchieving;

      teams[i][index].overUnderAchievingSumDefence =
        concededOverOrUnderAchieving;

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
          (teams[i][index].expectedGoalsShortAndLongTerm -
            teams[i][index].scoredAverageShortAndLongTerm) *
          gameTotalWeighting;
      } else if (
        teams[i][index].scoredAverageShortAndLongTerm < 1 &&
        teams[i][index].scoredAverageShortAndLongTerm >= 0.6
      ) {
        teams[i][index].AverageGoalsWeightedWithXG =
          (await diff(1, teams[i][index].finishingScore)) *
            (gameTotalWeighting / 1) +
          teams[i][index].scoredAverageShortAndLongTerm;

        teams[i][index].trueFormGoalsWeighting =
          (teams[i][index].expectedGoalsShortAndLongTerm -
            teams[i][index].scoredAverageShortAndLongTerm) *
          gameTotalWeighting;
      } else if (
        teams[i][index].scoredAverageShortAndLongTerm < 0.6 &&
        teams[i][index].scoredAverageShortAndLongTerm > 0.3
      ) {
        teams[i][index].AverageGoalsWeightedWithXG =
          (await diff(1, teams[i][index].finishingScore)) *
            (gameTotalWeighting / 2) +
          teams[i][index].scoredAverageShortAndLongTerm;

        teams[i][index].trueFormGoalsWeighting =
          (teams[i][index].expectedGoalsShortAndLongTerm -
            teams[i][index].scoredAverageShortAndLongTerm) *
          gameTotalWeighting;
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
          (teams[i][index].conceededAverageShortAndLongTerm -
            teams[i][index].expectedConceededGoalsShortAndLongTerm) *
          gameTotalWeighting;
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
          (teams[i][index].conceededAverageShortAndLongTerm -
            teams[i][index].expectedConceededGoalsShortAndLongTerm) *
          gameTotalWeighting;
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
          (teams[i][index].conceededAverageShortAndLongTerm -
            teams[i][index].expectedConceededGoalsShortAndLongTerm) *
          gameTotalWeighting;
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

      //can update this for last 10
    let pointsDiff = await getPointsDifferential(
      formHome.last5Points,
      formAway.last5Points
    );

    let [last5WeightingHome, last5WeightingAway] = await getPointWeighting(
      pointsDiff
    );

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


    async function compareTeams(homeForm, awayForm, teamName){
        let sotComparison = await compareStat(homeForm.AverageShotsOnTarget, awayForm.AverageShotsOnTarget)
        let possessionComparison = await compareStat(homeForm.AveragePossession, awayForm.AveragePossession)
        let goalsForComparison = await compareStat(homeForm.scoredAverage, awayForm.scoredAverage)
        let goalsAgainstComparison = await compareStat(awayForm.concededAverage, homeForm.concededAverage)
        let XGForComparison = await compareStat(homeForm.XG, awayForm.XG)
        let XGAgainstComparison = await compareStat(awayForm.XGAgainstAvg, homeForm.XGAgainstAvg)
        let dangerousAttacksComparison = await compareStat(homeForm.AverageDangerousAttacks, awayForm.AverageDangerousAttacks)
        let CleanSheetPercentageComparison = await compareStat(homeForm.CleanSheetPercentage, awayForm.CleanSheetPercentage)
        let clinicalRatingComparison = await compareStat(homeForm.clinicalRating, awayForm.clinicalRating)
        let XGdifferentialComparison = await compareStat(homeForm.XGdifferential, awayForm.XGdifferential)
        let overUnderAchievingSumComparison = await compareStat(homeForm.overUnderAchievingSum, awayForm.overUnderAchievingSum)
        let formTrendScoreComparison = await compareStat(homeForm.formTrendScore, awayForm.formTrendScore)
        let last5PointsComparison = await compareStat(homeForm.last5Points, awayForm.last5Points)
        let last6PointsComparison = await compareStat(homeForm.last6Points, awayForm.last6Points)
        let last10PointsComparison = await compareStat(homeForm.last10Points, awayForm.last10Points)
        let last2PointsComparison = await compareStat(homeForm.last2Points, awayForm.last2Points)
        

        const calculation = (sotComparison * 1) + possessionComparison + (dangerousAttacksComparison * 1) + CleanSheetPercentageComparison + 
        clinicalRatingComparison + (XGdifferentialComparison * 1) + (overUnderAchievingSumComparison * 1) + (formTrendScoreComparison * 1) +
        (last2PointsComparison * 1) + last5PointsComparison + last6PointsComparison + last10PointsComparison

      return calculation
    }


  let teamComparisonScore = await compareTeams(formHome, formAway, match.homeTeam)

  // console.log(`${match.homeTeam} V ${match.awayTeam} ${teamComparisonScore}`)


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

      if (wholeNumber !== 0 && remainder >= 0.75) {
        if (form.overOrUnderAttack === "overachievingDrastically" || form.overOrUnderAttack === "overachieving") {
          return Math.floor(num);
        } else if (form.overOrUnderAttack === "underachievingDrastically" || form.overOrUnderAttack === "underachieving") {
          return Math.ceil(num);
        } else if (
            form.clinicalRating === "excellent" ||
            form.clinicalRating === "great" ||
            form.clinicalRating === "very good" ||
            form.clinicalRating === "good"
          ) {
            return Math.ceil(num);
          } else if (
            form.clinicalRating === "awful" ||
            form.clinicalRating === "terrible" ||
            form.clinicalRating === "very poor" ||
            form.clinicalRating === "poor"
          ) {
            return Math.floor(num);
          } else {
            return Math.round(num)
          }
          
          // else if (remainder >= 0.65){
          //   return Math.ceil(num)
          // }
        } else if (wholeNumber !== 0 && remainder < 0.75) {
          if (form.overOrUnderAttack === "overachievingDrastically" || form.overOrUnderAttack === "overachieving" || form.overOrUnderAttack === "overachievingSlightly") {

            return Math.floor(num);
          } else if (form.overOrUnderAttack === "underachievingDrastically") {

            return Math.ceil(num);
          } else if (
              form.clinicalRating === "excellent" ||
              form.clinicalRating === "great" 
            ) {
              return Math.ceil(num);
            } else if (
              form.clinicalRating !== "excellent" ||
              form.clinicalRating !== "great"
            ) {
              return Math.floor(num);
            } else {
              return Math.round(num);
            }
      } else if (
        wholeNumber === 0 && form.overOrUnderAttack === "underachievingDrastically" 
        // form.overOrUnderAttack === "overachieving"
      ) {

        return Math.ceil(num);
      }else if (
        wholeNumber === 0 && form.overOrUnderAttack === "overachievingDrastically" 
        // form.overOrUnderAttack === "overachieving"
      ) {
        return Math.floor(num);
      } else if (
        form.clinicalRating === "excellent" ||
        form.clinicalRating === "great" ||
        form.clinicalRating === "very good" 
        // form.clinicalRating === "good"
      ) {
        console.log("rounding up")
        return Math.ceil(num);
      } else if (
        form.clinicalRating === "awful" ||
        form.clinicalRating === "terrible" ||
        form.clinicalRating === "very poor" ||
        form.clinicalRating === "poor"
      ) {
        console.log("rounding down")
        return Math.floor(num);
      } else if (wholeNumber === 0 && remainder < 0.75) {
        console.log("rounding normally")
        return Math.floor(num)
      } else if (wholeNumber === 0 && remainder >= 0.75) {
        console.log("rounding normally")
        return Math.ceil(num)
      } else {
        return Math.round(num)
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
      parseFloat(await diff(homeGoalDiff, awayGoalDiff)) / 10;
    formAway.goalsDifferential =
      parseFloat(await diff(awayGoalDiff, homeGoalDiff)) / 10;

    // console.log(
    //   `${match.game} home goalsDifferential = ${formHome.goalsDifferential} away goalsDifferential = ${formAway.goalsDifferential}`
    // );

    let goalsBasedOnHomeXG =
      (formHome.expectedGoals + formAway.expectedGoalsConceeded) / 2 *
      1 + last5WeightingHome

    let goalsBasedOnAwayXG =
      (formAway.expectedGoals + formHome.expectedGoalsConceeded) / 2 *
      1 + last5WeightingAway

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
      (goalCalcHome) +
      PPGweightingHome * 1 +
      last5WeightingHome * 1;

      // console.log(match.homeTeam)
      // console.log(`${goalCalcHome} * ${formAway.defenceRating} * ${formHome.attackQualityMultiplier} +
      //   ${formHome.goalsDifferential} + 
      //   ${PPGweightingHome} + 
      //   ${last5WeightingHome}`)
      // console.log(`factor 1 home ${factorOneHome}`)

    let factorTwoHome =
      (formHome.trueFormGoalsWeighting + formAway.trueFormConceededWeighting) /
        2 +
      1;

    let factorOneAway =
      (goalCalcAway) +
      PPGweightingAway * 1 +
      last5WeightingAway * 1;

      // console.log(match.awayTeam)
      // console.log(`${goalCalcAway} * ${formHome.defenceRating} * ${formAway.attackQualityMultiplier} +
      //   ${formAway.goalsDifferential} + 
      //   ${PPGweightingAway} + 
      //   ${last5WeightingAway}`)
      // console.log(`factor 1 home ${factorOneAway}`)

    let factorTwoAway =
      (formAway.trueFormGoalsWeighting + formHome.trueFormConceededWeighting) /
        2 +
      1;

    // console.log("FACTOR 2 HOME");
    // console.log(factorTwoHome);

    // console.log("formHome.trueFormAttack");
    // console.log(formHome.trueFormAttack);
    // console.log(`${match.awayTeam} defence perf = ${formAway.trueFormDefence}`);

    // console.log("FACTOR 2 AWAY");
    // console.log(factorTwoAway);

    // console.log("formAway.trueFormAttack");
    // console.log(formAway.trueFormAttack);
    // console.log(`${match.homeTeam} defence perf = ${formHome.trueFormDefence}`);

    let homeComparisonWeighting;
    let awayComparisonWeighting;
    let scoreDiff = await diff(factorOneHome, factorOneAway)
    let split = scoreDiff / 2

    switch (true) {
      case teamComparisonScore  < 1 && teamComparisonScore  > -1 && scoreDiff >= 0:
          homeComparisonWeighting = 0;
          awayComparisonWeighting = Math.abs(scoreDiff);
        break;
      case teamComparisonScore  < 1 && teamComparisonScore  > -1 && scoreDiff < 0:
        homeComparisonWeighting = Math.abs(scoreDiff);
        awayComparisonWeighting = 0;
        break;
      case teamComparisonScore  > 1 && teamComparisonScore <= 3:
        homeComparisonWeighting = 0;
        awayComparisonWeighting = -0; 
        break;
      case teamComparisonScore > 3 && teamComparisonScore <= 6:
        homeComparisonWeighting = 0.4;
        awayComparisonWeighting = -0.4; 
        break;
      case teamComparisonScore > 6 && teamComparisonScore <= 9:
        homeComparisonWeighting = 0.6;
        awayComparisonWeighting = -0.6; 
        break;  
      case teamComparisonScore > 9 && teamComparisonScore <= 12:
        homeComparisonWeighting = 0.8;
        awayComparisonWeighting = -0.8; 
        break;    
      case teamComparisonScore > 12:
        homeComparisonWeighting = 1;
        awayComparisonWeighting = -1; 
        break;  
      
      case teamComparisonScore  < 0 && teamComparisonScore >= -3:
        homeComparisonWeighting = 0;
        awayComparisonWeighting = 0; 
        break;
      case teamComparisonScore < -3 && teamComparisonScore >= -6:
        homeComparisonWeighting = -0.4;
        awayComparisonWeighting = 0.4; 
        break;
      case teamComparisonScore < -6 && teamComparisonScore >= -9:
        homeComparisonWeighting = -0.6;
        awayComparisonWeighting = 0.6; 
        break;  
      case teamComparisonScore < -9 && teamComparisonScore >= -12:
        homeComparisonWeighting = -0.8;
        awayComparisonWeighting = 0.8; 
        break;    
      case teamComparisonScore < -12:
        homeComparisonWeighting = -1;
        awayComparisonWeighting = 1; 
        break; 
      default:
        homeComparisonWeighting = 0;
        awayComparisonWeighting = 0; 
        break;
    }

    let experimentalHomeGoals =
      factorOneHome * homeCalculation +
      homeComparisonWeighting;

    let experimentalAwayGoals =
      factorOneAway * awayCalculation +
      awayComparisonWeighting;

    let XGGoalsHome =
      (formHome.AverageGoalsWeightedWithXG +
        formAway.AverageGoalsConceededWeightedWithXG) /
      2;

    let XGGoalsAway =
      (formAway.AverageGoalsWeightedWithXG +
        formHome.AverageGoalsConceededWeightedWithXG) /
      2;

  



    let rawFinalHomeGoals = parseFloat(
      (experimentalHomeGoals * 1 +
        XGGoalsHome * 0 +
        homeGoalsBasedOnDA * 0 +
        formHome.expectedGoals * 0) /
        1
    );

    let rawFinalAwayGoals = parseFloat(
      (experimentalAwayGoals * 1 +
        XGGoalsAway * 0 +
        awayGoalsBasedOnDA * 0 +
        formAway.expectedGoals * 0) /
        1
    );

    switch (true) {
      case formHome.overOrUnderAttack === "overachievingDrastically":
        rawFinalHomeGoals = rawFinalHomeGoals - 0.35;
        break;
      case formAway.overOrUnderAttack === "overachievingDrastically":
        rawFinalAwayGoals = rawFinalAwayGoals - 0.35;
        break;
      // case formHome.overOrUnderAttack === "overachieving":
      //   rawFinalHomeGoals = rawFinalHomeGoals - 0.2;
      //   break;
      // case formAway.overOrUnderAttack === "overachieving":
      //   rawFinalAwayGoals = rawFinalAwayGoals - 0.2;
      //   break;
      // case formHome.overOrUnderAttack === "overachievingSlightly":
      //   rawFinalHomeGoals = rawFinalHomeGoals - 0.1;
      //   break;
      // case formAway.overOrUnderAttack === "overachievingSlightly":
      //   rawFinalAwayGoals = rawFinalAwayGoals - 0.1;
      //   break;
      case formHome.overOrUnderAttack === "underachievingDrastically":
        rawFinalHomeGoals = rawFinalHomeGoals + 0.35;
        break;
      case formAway.overOrUnderAttack === "underachievingDrastically":
        rawFinalAwayGoals = rawFinalAwayGoals + 0.35;
        break;
      // case formHome.overOrUnderAttack === "underachieving":
      //   rawFinalHomeGoals = rawFinalHomeGoals + 0.2;
      //   break;
      // case formAway.overOrUnderAttack === "underachieving":
      //   rawFinalAwayGoals = rawFinalAwayGoals + 0.2;
      //   break;
      // case formHome.overOrUnderAttack === "underachievingSlightly":
      //   rawFinalHomeGoals = rawFinalHomeGoals + 0.1;
      //   break;
      // case formAway.overOrUnderAttack === "underachievingSlightly":
      //   rawFinalAwayGoals = rawFinalAwayGoals + 0.1;
      //   break;
      default:
        break;
    }

    switch (true) {
      case formHome.overOrUnderDefence === "overachievingDrastically":
        rawFinalAwayGoals = rawFinalAwayGoals + 0.35;
        break;
      case formAway.overOrUnderDefence === "overachievingDrastically":
        rawFinalHomeGoals = rawFinalHomeGoals + 0.35;
        break;
      // case formHome.overOrUnderDefence === "overachieving":
      //   rawFinalAwayGoals = rawFinalAwayGoals + 0.2;
      //   break;
      // case formAway.overOrUnderDefence === "overachieving":
      //   rawFinalHomeGoals = rawFinalHomeGoals + 0.2;
      //   break;
      // case formHome.overOrUnderDefence === "overachievingSlightly":
      //   rawFinalAwayGoals = rawFinalAwayGoals + 0.1;
      //   break;
      // case formAway.overOrUnderDefence === "overachievingSlightly":
      //   rawFinalHomeGoals = rawFinalHomeGoals + 0.1;
      //   break;
      case formHome.overOrUnderDefence === "underachievingDrastically":
        rawFinalAwayGoals = rawFinalAwayGoals - 0.35;
        break;
      case formAway.overOrUnderDefence === "underachievingDrastically":
        rawFinalHomeGoals = rawFinalHomeGoals - 0.35;
        break;
      // case formHome.overOrUnderDefence === "underachieving":
      //   rawFinalAwayGoals = rawFinalAwayGoals - 0.2;
      //   break;
      // case formAway.overOrUnderDefence === "underachieving":
      //   rawFinalHomeGoals = rawFinalHomeGoals - 0.2;
      //   break;
      // case formHome.overOrUnderDefence === "underachievingSlightly":
      //   rawFinalAwayGoals = rawFinalAwayGoals - 0.1;
      //   break;
      // case formAway.overOrUnderDefence === "underachievingSlightly":
      //   rawFinalHomeGoals = rawFinalHomeGoals - 0.1;
      //   break;
      default:
        break;
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
      sumProfit = sumProfit + fixtures[i].profit;
      investment = investment + 1;
      netProfit = (sumProfit - investment).toFixed(2);
    }
  }

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
        match.unroundedGoalsA - match.unroundedGoalsB > incrementValue &&
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
        match.unroundedGoalsB - match.unroundedGoalsA > incrementValue &&
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
          // console.log("predictionObjectAWAY");
          // console.log(predictionObject);
          // console.log(match);
          tips.push(predictionObject);
        }
      }

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

  tips.sort((a, b) => b.goalDifferential - a.goalDifferential);
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
                Increase or decrease the size of the multi using the buttons
                below. Predictions are ordered by confidence in the outcome.
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
