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
let drawPredictions = 0;
let homePredictions = 0;
let awayPredictions = 0;
let drawOutcomes = 0;
let homeOutcomes = 0;
let awayOutcomes = 0;
let winAmount = 0
let lossAmount = 0


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

  let stat1 = parseFloat(statOne)
  let stat2 = parseFloat(statTwo)
  let result;
  let gap;
  let applyStat;
  let statOneNotZero = stat1 + 0.1
  let statTwoNotZero = stat2 + 0.1

  if(stat1 > stat2){
    gap = statOneNotZero / statTwoNotZero
  } else if (stat1 < stat2) {
    gap = statTwoNotZero / statOneNotZero
  } else{
    gap = 0
  }

  if(gap > 1.5){
    switch (true) {
      case stat1 === stat2:
        result = 0
        break;
      case stat1 > stat2:
        result = 1
        break;
      case stat1 < stat2:
        result = -1
        break;
      default:
        break;
    }
  } else {
    result = 0
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

async function getPointsDifferential(pointsHomeAvg, pointsAwayAvg) {
  const differential = await diff(pointsHomeAvg, pointsAwayAvg);
  return differential;
}

async function getPointWeighting(pointsDiff) {
  let pointsDiffWeightingHome;
  let pointsDiffWeightingAway;

  switch (true) {
    case pointsDiff >= 2.5:
      pointsDiffWeightingHome = 0.5;
      pointsDiffWeightingAway = -0.5;
      break;
    case pointsDiff >= 2 && pointsDiff < 2.5:
      pointsDiffWeightingHome = 0.3;
      pointsDiffWeightingAway = -0.3;
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
      pointsDiffWeightingHome = -0.3;
      pointsDiffWeightingAway = 0.3;
      break;
    case pointsDiff <= -2.5:
      pointsDiffWeightingHome = -0.5;
      pointsDiffWeightingAway = 0.5;
      break;
    default:
      pointsDiffWeightingHome = 0;
      pointsDiffWeightingAway = -0; 
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

      teams[i][index].last5Points = getPointsFromLastX(
        teams[i][index].LastFiveForm
      );

      teams[i][index].last6Points = getPointsFromLastX(
        teams[i][index].LastSixForm
      );

      teams[i][index].last10Points = getPointsFromLastX(
        teams[i][index].LastTenForm
      );

      let last3 = [teams[i][index].lastGame, teams[i][index].previousToLastGame, teams[i][index].LastFiveForm[2]]
      teams[i][index].last3Points = getPointsFromLastX(
        last3
      );

      async function getPointAverage(pointTotal, games){
        return pointTotal / games
      }

      teams[i][index].threeGameAverage = await getPointAverage(teams[i][index].last3Points, 3)
      teams[i][index].fiveGameAverage = await getPointAverage(teams[i][index].last5Points, 5)
      teams[i][index].sixGameAverage = await getPointAverage(teams[i][index].last6Points, 6)
      teams[i][index].tenGameAverage = await getPointAverage(teams[i][index].last10Points, 10)

      // console.log(fiveGameAverage)
      // console.log(sixGameAverage)
      // console.log(tenGameAverage)

      async function compareFormTrend(five, six, ten, lastGame){
        let text;
        let score
        let improving;
        if(five >= 2.5){
          switch (true) {
            case five > ten:
              text = "Outstanding and improving"
              score = 9.5
              improving = true;
              break;
              case five === ten:
                text = "Outstanding and consistent"
                score = 10
                improving = false;
                break;
                case five < ten:
                  text = "Consistently outstanding"
                  score = 9
                  improving = false;
                  break;
            default:
              break;
          }
        } else if (five < 2.5 && five >= 2){
          switch (true) {
            case five > ten:
              text = "Very good and improving"
              score = 8.5
              improving = true;
              break;
              case five === ten:
                text = "Very good and consistent"
                score = 9
                improving = false;
                break;
                case five < ten:
                  text = "Very good but slightly worsening"
                  score = 8
                  improving = false;
                  break;
            default:
              break;
          }
        } else if (five < 2 && five >= 1.5){
          switch (true) {
            case five > ten:
              text = "Good and improving"
              score = 7.5
              improving = true;
              break;
              case five === ten:
                text = "Good and consistent"
                score = 8
                improving = false;
                break;
                case five < ten:
                  text = "Good but slightly worsening"
                  score = 7
                  improving = false;
                  break;
            default:
              break;
          }
        } else if (five < 1.5 && five >= 1){
          switch (true) {
            case five > ten:
              text = "Average and improving"
              score = 6.5
              improving = true;
              break;
              case five === ten:
                text = "Average and consistent"
                score = 7
                improving = false;
                break;
                case five < ten:
                  text = "Average but slightly worsening"
                  score = 6
                  improving = false;
                  break;
            default:
              break;
          }
        } else if (five < 1 && five >= 0.5){
          switch (true) {
            case five > ten:
              text = "Poor but improving"
              score = 5.5
              improving = true;
              break;
              case five === ten:
                text = "Poor and consistent"
                score = 6
                improving = false;
                break;
                case five < ten:
                  text = "Poor and slightly worsening"
                  score = 5
                  improving = false;
                  break;
            default:
              break;
          }
        } else if (five < 0.5){
          switch (true) {
            case five > ten:
              text = "Terrible but slightly improving"
              score = 4.5
              improving = true;
              break;
              case five === ten:
                text = "Consistently terrible"
                score = 5
                improving = false;
                break;
                case five < ten:
                  text = "Terrible and worsening"
                  score = 4
                  improving = false;
                  break;
            default:
              break;
          }
        } 

        if(lastGame === "L"){
          score = score - 0
        }
       
        return [score, improving]
      }

      [teams[i][index].formTrendScore, teams[i][index].improving]= await compareFormTrend(teams[i][index].fiveGameAverage, teams[i][index].sixGameAverage, teams[i][index].tenGameAverage, teams[i][index].lastGame)

      // console.log(`${match.homeTeam} form score = ${teams[i][index].formTrendScore}`)

      teams[i][index].ScoredAverageShortTerm = (teams[i][0].ScoredOverall / 5)
      teams[i][index].ConcededAverageShortTerm = (teams[i][0].ConcededOverall / 5)


      teams[i][index].expectedGoals = parseFloat(teams[i][index].XG);
      teams[i][index].expectedGoalsConceeded = parseFloat(
        teams[i][index].XGAgainstAverage
      );
      teams[i][index].longTermAverageGoals = teams[i][2].ScoredAverage;
      teams[i][index].longTermAverageConceeded = teams[i][2].ConcededAverage;

      teams[i][index].expectedGoalsLongTerm = parseFloat(teams[i][2].XG);

      teams[i][index].expectedConceededGoalsLongTerm = parseFloat(
        teams[i][index].XGAgainstAverage
      );


      teams[i][index].ScoredAverageShortAndLongTerm =
        ((teams[i][index].ScoredOverall / 10) + teams[i][index].ScoredAverageShortTerm) /
        2;

      teams[i][index].expectedGoalsShortAndLongTerm =
        (teams[i][index].expectedGoalsLongTerm +
          teams[i][index].expectedGoals) /
        2;

      teams[i][index].conceededAverageShortAndLongTerm =
        ((teams[i][index].ConcededOverall / 10) +
          teams[i][index].ConcededAverageShortTerm) /
        2;


      // if (teams[i][index].ScoredAverage > 0) {
        teams[i][index].finishingScore = parseFloat(
          teams[i][index].XG - teams[i][index].ScoredAverage
        );
      // } else {
      //   teams[i][index].finishingScore = 0;
      // }


      // if (teams[i][index].ConcededAverage > 0) {
        teams[i][index].goalieRating = parseFloat(
          teams[i][index].ConcededAverage -
            teams[i][index].XGAgainstAverage
        );
      // } else {
      //   teams[i][index].goalieRating = 0;
      // }

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

      // if (teams[i][index].ScoredAverage < 0.5) {
      //   goalOverOrUnderAchieving = goalOverOrUnderAchieving / 4;
      // }

      // if (teams[i][index].ConcededAverage < 0.5) {
      //   concededOverOrUnderAchieving = concededOverOrUnderAchieving / 4;
      // }

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
        teams[i][index].XG - teams[i][index].XGAgainstAverage;

      teams[i][index].attackPotency = teams[i][index].AverageShotsOnTargetOverall / teams[i][index].ScoredAverage


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

      let homeFiveGameAvg = formHome.last5Points / 5
      let awayFiveGameAvg = formAway.last5Points / 5
  
      let homeThreeGameAvg = formHome.last3Points / 3
      let awayThreeGameAvg = formAway.last3Points / 3

      //can update this for last 10
    let pointsDiff = await getPointsDifferential(
      homeFiveGameAvg,
      awayFiveGameAvg
    );

    let pointsDiff3 = await getPointsDifferential(
      homeThreeGameAvg,
      awayThreeGameAvg
    );




    let [last5WeightingHome, last5WeightingAway] = await getPointWeighting(
      pointsDiff
    );

    let [last3WeightingHome, last3WeightingAway] = await getPointWeighting(
      pointsDiff3
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

    homeWeighting = weightingSplitHome * 0.25;
    awayWeighting = weightingSplitAway * 0.25;

    let homeCalculation;
    let awayCalculation;

    homeCalculation = parseFloat(1 + homeWeighting);
    awayCalculation = parseFloat(1 + awayWeighting);


    async function compareTeams(homeForm, awayForm, teamName){
        // let sotComparison = await compareStat(homeForm.AverageShotsOnTarget, awayForm.AverageShotsOnTarget)
        // let possessionComparison = await compareStat(homeForm.AveragePossession, awayForm.AveragePossession)
        let goalsForComparison = await compareStat(homeForm.ScoredAverage, awayForm.ScoredAverage)
        let goalsAgainstComparison = await compareStat(awayForm.ConcededAverage, homeForm.ConcededAverage)
        // let XGForComparison = await compareStat(homeForm.XG, awayForm.XG)
        // let XGAgainstComparison = await compareStat(awayForm.XGAgainstAverage, homeForm.XGAgainstAverage)
        let dangerousAttacksComparison = await compareStat(homeForm.AverageDangerousAttacks, awayForm.AverageDangerousAttacks)
        // let CleanSheetPercentageComparison = await compareStat(homeForm.CleanSheetPercentage, awayForm.CleanSheetPercentage)
        // let clinicalScoreComparison = await compareStat(homeForm.clinicalScore, awayForm.clinicalScore)
        let XGdifferentialComparison = await compareStat(homeForm.XGWeighting, awayForm.XGWeighting)
        let overUnderAchievingSumComparison = await compareStat(homeForm.overUnderAchievingSum, awayForm.overUnderAchievingSum)

        let formTrendScoreComparison = await compareStat(homeForm.formTrendScore, awayForm.formTrendScore)
        let last5PointsComparison = await compareStat(homeForm.last5Points, awayForm.last5Points)
        // let last6PointsComparison = await compareStat(homeForm.last6Points, awayForm.last6Points)
        let last10PointsComparison = await compareStat(homeForm.last10Points, awayForm.last10Points)
        let last3PointsComparison = await compareStat(homeForm.last3Points, awayForm.last3Points)
        let threeGameAverageComparison = await compareStat(homeForm.threeGameAverage, awayForm.threeGameAverage)
        let fiveGameAverageComparison = await compareStat(homeForm.fiveGameAverage, awayForm.fiveGameAverage)
        let tenGameAverageComparison = await compareStat(homeForm.tenGameAverage, awayForm.tenGameAverage)

        let seasonPPGComparison
        if(homeForm.SeasonPPG !== "N/A" || awayForm.SeasonPPG !== "N/A"){
          seasonPPGComparison = await compareStat(parseFloat(homeForm.SeasonPPG), parseFloat(awayForm.SeasonPPG))
        } else seasonPPGComparison = last10PointsComparison

        // let attackingPotencyComparison = await compareStat(homeForm.attackPotency, awayForm.attackPotency)

        // console.log("sotComparison")
        // console.log(homeForm.AverageShotsOnTarget)
        // console.log("possessionComparison")
        // console.log(homeForm.AveragePossession)
        // console.log("goalsForComparison")
        // console.log(homeForm.ScoredAverage)
        // console.log("goalsAgainstComparison")
        // console.log(awayForm.ConcededAverage)
        // console.log("dangerousAttacksComparison")
        // console.log(homeForm.AverageDangerousAttacks)
        // console.log("CleanSheetPercentageComparison")
        // console.log(homeForm.CleanSheetPercentage)
        // console.log("clinicalScoreComparison")
        // console.log(homeForm.clinicalScore)
        // console.log("XGdifferentialComparison")
        // console.log(homeForm.XGdifferential)
        // console.log("overUnderAchievingSumComparison")
        // console.log(homeForm.overUnderAchievingSum)
        // console.log("formTrendScoreComparison")
        // console.log(homeForm.formTrendScore)
        // console.log("last5PointsComparison")
        // console.log(homeForm.last5Points)
        // console.log("last6PointsComparison")
        // console.log(homeForm.last6Points)
        // console.log("last10PointsComparison")
        // console.log(homeForm.last10Points)
        // console.log("last2PointsComparison")
        // console.log(homeForm.last2Points)
        // console.log("seasonPPGComparison")
        // console.log(homeForm.SeasonPPG)
        // console.log("attackingPotencyComparison")
        // console.log(homeForm.attackPotency)

        let calculation = 
        (formTrendScoreComparison * 3) +
        (threeGameAverageComparison * 2) + 
        (fiveGameAverageComparison * 1) + 
        (tenGameAverageComparison * 0) + 
        (seasonPPGComparison * 2) +
        (XGdifferentialComparison * 1) +
        (goalsForComparison * 0) + 
        (goalsAgainstComparison * 0)

        // if(overUnderAchievingSumComparison < 0 && calculation > 0){
        //   calculation = calculation / 4
        //   console.log(`${match.game} calculation: ${calculation}`)
        // } else if(overUnderAchievingSumComparison > 2){
        //   console.log(`${match.game} calculation: ${calculation}`)
        //   calculation = calculation / 4
        // }

      return calculation
    }


  let teamComparisonScore = await compareTeams(formHome, formAway, match.homeTeam)
  match.teamComparisonScore = teamComparisonScore


  // console.log(`${match.homeTeam} V ${match.awayTeam} ${teamComparisonScore}`)


    teams[0][index].predictedDA =
      teams[0][index].AverageDangerousAttacks * homeCalculation;
    teams[1][index].predictedDA =
      teams[1][index].AverageDangerousAttacks * awayCalculation;

    formHome.homeGoalWeighting = parseFloat(
      1 + formHome.homeAttackAdvantage / 100
    );
    formHome.homeDefenceWeighting = parseFloat(
      1 + formHome.homeDefenceAdvantage / 100
    );

    const homeGoalsUnweighted = parseFloat(
      (formHome.expectedGoals + formHome.ScoredAverage) / 2
    );

    const awayGoalsUnweighted = parseFloat(
      (formAway.expectedGoals + formAway.ScoredAverage) / 2
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
      formHome.AverageDangerousAttacks / formHome.expectedGoals;
    formAway.creationToConversionScore =
      formAway.AverageDangerousAttacks / formAway.expectedGoals;

    formHome.creationToConversionScoreV2 =
      formHome.AttacksAverage /
      formHome.AverageDangerousAttacks /
      formHome.AverageShotsOnTarget /
      formHome.expectedGoals;
    formAway.creationToConversionScoreV2 =
      formAway.AttacksAverage /
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

      if (wholeNumber !== 0 && remainder >= 0.65) {
        // if (form.overOrUnderAttack === "Overachieving drastically") {
        //   return Math.floor(num);
        // } else if (form.overOrUnderAttack === "Underachieving drastically") {
        //   return Math.ceil(num);
        // } 
        if(
            form.clinicalRating === "excellent" ||
            form.clinicalRating === "great" ||
            form.clinicalRating === "very good" ||
            form.clinicalRating === "good"
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
          } else {
            console.log("rounding down")
            return Math.floor(num)
          }
          
          // else if (remainder >= 0.65){
          //   return Math.ceil(num)
          // }
        } else if (wholeNumber !== 0 && remainder < 0.65) {
          // if (form.overOrUnderAttack === "Overachieving drastically" || form.overOrUnderAttack === "Overachieving") {

          //   return Math.floor(num);
          // } else if (form.overOrUnderAttack === "Underachieving drastically") {

          //   return Math.ceil(num);
          // } 
          if (
              form.clinicalRating === "excellent" ||
              form.clinicalRating === "great" 
            ) {
              console.log("rounding up")
              return Math.ceil(num);
            } else if (
              form.clinicalRating !== "excellent" ||
              form.clinicalRating !== "great"
            ) {
              console.log("rounding down")
              return Math.floor(num);
            } else {
              console.log("rounding down")
              return Math.floor(num);
            }
      } else if (wholeNumber === 0 && remainder >= 0.65) {
        if (
          form.clinicalRating === "excellent" ||
          form.clinicalRating === "great" ||
          form.clinicalRating === "very good" ||
          form.clinicalRating === "good"
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
        } else {
          console.log("rounding down")
          return Math.floor(num);
        }
      } else if (wholeNumber === 0 && remainder < 0.65) {
        // if (form.overOrUnderAttack === "Overachieving drastically" || form.overOrUnderAttack === "Overachieving") {

        //   return Math.floor(num);
        // } else if (form.overOrUnderAttack === "Underachieving drastically") {

        //   return Math.ceil(num);
        // } 
        if (
            form.clinicalRating === "excellent" ||
            form.clinicalRating === "great" 
          ) {
            console.log("rounding up")
            return Math.ceil(num);
          } else if (
            form.clinicalRating !== "excellent" ||
            form.clinicalRating !== "great"
          ) {
            console.log("rounding down")
            return Math.floor(num);
          } else {
            console.log("rounding down")
            return Math.floor(num);
          }
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

    const homeGoalDiff = formHome.ScoredAverageShortAndLongTerm - formHome.conceededAverageShortAndLongTerm;
    const awayGoalDiff = formAway.ScoredAverageShortAndLongTerm - formAway.conceededAverageShortAndLongTerm;

    formHome.goalsDifferential =
      parseFloat(await diff(homeGoalDiff, awayGoalDiff)) / 1;
    formAway.goalsDifferential =
      parseFloat(await diff(awayGoalDiff, homeGoalDiff)) / 1;

    // console.log(
    //   `${match.game} home goalsDifferential = ${formHome.goalsDifferential} away goalsDifferential = ${formAway.goalsDifferential}`
    // );

    let goalsBasedOnHomeXG =
      (formHome.expectedGoals + formAway.expectedGoalsConceeded) / 2 *
      1 + last5WeightingHome

    let goalsBasedOnAwayXG =
      (formAway.expectedGoals + formHome.expectedGoalsConceeded) / 2 *
      1 + last5WeightingAway

    let goalCalcHome = (formHome.ScoredAverage + formAway.ConcededAverage) / 2;
    let goalCalcAway = (formAway.ScoredAverage + formHome.ConcededAverage) / 2;

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
      last3WeightingHome * 1 +
      formHome.goalsDifferential * 0

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
      last3WeightingAway * 1 +
      formAway.goalsDifferential * 0


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
    match.scoreDiff = await diff(factorOneHome, factorOneAway)
    let split = match.scoreDiff / 2
    console.log(`Team comparison score: ${teamComparisonScore}`)

    switch (true) {
      case teamComparisonScore  === 0 && match.scoreDiff >= 0:
          homeComparisonWeighting = -split
          awayComparisonWeighting = split
        break;
      case teamComparisonScore  >= 1 && teamComparisonScore <= 2:
        homeComparisonWeighting = 0;
        awayComparisonWeighting = -0.1; 
        break;
      case teamComparisonScore > 2 && teamComparisonScore <= 4:
        homeComparisonWeighting = 0.2;
        awayComparisonWeighting = -0.2; 
        break;
      case teamComparisonScore > 4 && teamComparisonScore <= 5:
        homeComparisonWeighting = 0.3;
        awayComparisonWeighting = -0.3; 
        break;  
      case teamComparisonScore > 5 && teamComparisonScore <= 7:
        homeComparisonWeighting = 0.4;
        awayComparisonWeighting = -0.4; 
        break;    
        case teamComparisonScore > 7 && teamComparisonScore < 9:
          homeComparisonWeighting = 0.5;
          awayComparisonWeighting = -0.5; 
          break;  
          case teamComparisonScore >= 9:
            homeComparisonWeighting = 0.6;
            awayComparisonWeighting = -0.6; 
            break;   

      
      case teamComparisonScore  <= -1 && teamComparisonScore >= -2:
        homeComparisonWeighting = -0.1;
        awayComparisonWeighting = 0; 
        break;
      case teamComparisonScore < -2 && teamComparisonScore >= -4:
        homeComparisonWeighting = -0.2;
        awayComparisonWeighting = 0.2; 
        break;
      case teamComparisonScore < -4 && teamComparisonScore >= -5:
        homeComparisonWeighting = -0.3;
        awayComparisonWeighting = 0.3; 
        break;  
      case teamComparisonScore < -5 && teamComparisonScore >= -7:
        homeComparisonWeighting = -0.4;
        awayComparisonWeighting = 0.4; 
        break;
        case teamComparisonScore < -7 && teamComparisonScore > -9:
          homeComparisonWeighting = -0.5;
          awayComparisonWeighting = 0.5 
          break;      
          case teamComparisonScore < -9:
            homeComparisonWeighting = -0.6;
            awayComparisonWeighting = 0.6 
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

  



    let rawFinalHomeGoals = experimentalHomeGoals


    let rawFinalAwayGoals = experimentalAwayGoals


    switch (true) {
      case formHome.overOrUnderAttack === "Overachieving drastically":
        rawFinalHomeGoals = rawFinalHomeGoals - 0.3
        break;
      case formHome.overOrUnderAttack === "Underachieving drastically":
        rawFinalHomeGoals = rawFinalHomeGoals + 0.3
        break;
      case formHome.overOrUnderAttack === "Overachieving":
        rawFinalHomeGoals = rawFinalHomeGoals - 0.2
        break;
      case formHome.overOrUnderAttack === "Underachieving":
        rawFinalHomeGoals = rawFinalHomeGoals + 0.2
        break;
      case formAway.overOrUnderAttack === "Overachieving drastically":
        rawFinalAwayGoals = rawFinalAwayGoals - 0.3
        break;
      case formAway.overOrUnderAttack === "Underachieving drastically":
        rawFinalAwayGoals = rawFinalAwayGoals + 0.3
        break;
      case formAway.overOrUnderAttack === "Overachieving":
        rawFinalAwayGoals = rawFinalAwayGoals - 0.2
        break;
      case formAway.overOrUnderAttack === "Underachieving":
        rawFinalAwayGoals = rawFinalAwayGoals + 0.2
        break;
      case formHome.overOrUnderAttack === "Overachieving slightly":
        rawFinalHomeGoals = rawFinalHomeGoals - 0.1;
        break;
      case formAway.overOrUnderAttack === "Overachieving slightly":
        rawFinalAwayGoals = rawFinalAwayGoals - 0.1;
        break;
      case formHome.overOrUnderAttack === "Underachieving slightly":
        rawFinalHomeGoals = rawFinalHomeGoals + 0.1;
        break;
      case formAway.overOrUnderAttack === "Underachieving slightly":
        rawFinalAwayGoals = rawFinalAwayGoals + 0.1;
        break;
      default:
        break;
    }

    switch (true) {
      case formHome.overOrUnderDefence === "Overachieving drastically":
        rawFinalAwayGoals = rawFinalAwayGoals + 0.3
        break;
      case formHome.overOrUnderDefence === "Underachieving drastically":
        rawFinalAwayGoals = rawFinalAwayGoals - 0.3
        break;
      case formHome.overOrUnderDefence === "Overachieving":
        rawFinalAwayGoals = rawFinalAwayGoals + 0.2
        break;
      case formHome.overOrUnderDefence === "Underachieving":
        rawFinalAwayGoals = rawFinalAwayGoals - 0.2
        break;
      case formAway.overOrUnderDefence === "Overachieving drastically":
        rawFinalHomeGoals = rawFinalHomeGoals + 0.3;
        break;
      case formAway.overOrUnderDefence === "Underachieving drastically":
        rawFinalHomeGoals = rawFinalHomeGoals - 0.3;
        break;
      case formAway.overOrUnderDefence === "Overachieving":
        rawFinalHomeGoals = rawFinalHomeGoals + 0.2;
        break;
      case formAway.overOrUnderDefence === "Underachieving":
        rawFinalHomeGoals = rawFinalHomeGoals - 0.2;
        break;
      case formHome.overOrUnderDefence === "Overachieving slightly":
        rawFinalAwayGoals = rawFinalAwayGoals + 0.1;
        break;
      case formAway.overOrUnderDefence === "Overachieving slightly":
        rawFinalHomeGoals = rawFinalHomeGoals + 0.1;
        break;
      case formHome.overOrUnderDefence === "Underachieving slightly":
        rawFinalAwayGoals = rawFinalAwayGoals - 0.1;
        break;
      case formAway.overOrUnderDefence === "Underachieving slightly":
        rawFinalHomeGoals = rawFinalHomeGoals - 0.1;
        break;
      default:
        break;
    }

    // switch (true) {
    //   case formHome.overUnderAchievingSum <= -2:
    //     rawFinalHomeGoals = rawFinalHomeGoals - 1
    //     break;
    //   case formHome.overUnderAchievingSum < -1.5 && formHome.overUnderAchievingSum > -2:
    //     rawFinalHomeGoals = rawFinalHomeGoals - 0.5
    //     break;
    //   case formHome.overUnderAchievingSum < -1 && formHome.overUnderAchievingSum > -1.5:
    //     rawFinalHomeGoals = rawFinalHomeGoals - 0.25
    //     break;
    //   case formHome.overUnderAchievingSum < -0.5 && formHome.overUnderAchievingSum > -1:
    //     rawFinalHomeGoals = rawFinalHomeGoals - 0.15
    //     break;

    //   case formHome.overUnderAchievingSum >= 2:
    //     rawFinalHomeGoals = rawFinalHomeGoals + 1
    //     break;
    //   case formHome.overUnderAchievingSum > 1.5 && formHome.overUnderAchievingSum < 2:
    //     rawFinalHomeGoals = rawFinalHomeGoals + 0.5
    //     break;
    //   case formHome.overUnderAchievingSum > 1 && formHome.overUnderAchievingSum < 1.5:
    //     rawFinalHomeGoals = rawFinalHomeGoals + 0.25
    //     break;
    //   case formHome.overUnderAchievingSum > 0.5 && formHome.overUnderAchievingSum < 1:
    //     rawFinalHomeGoals = rawFinalHomeGoals + 0.15
    //     break;
    //   default:
    //     break;
    // }


    // switch (true) {
    //   case formAway.overUnderAchievingSum <= -2:
    //     rawFinalAwayGoals = rawFinalAwayGoals - 1
    //     break;
    //   case formAway.overUnderAchievingSum < -1.5 && formAway.overUnderAchievingSum > -2:
    //     rawFinalAwayGoals = rawFinalAwayGoals - 0.5
    //     break;
    //   case formAway.overUnderAchievingSum < -1 && formAway.overUnderAchievingSum > -1.5:
    //     rawFinalAwayGoals = rawFinalAwayGoals - 0.25
    //     break;
    //   case formAway.overUnderAchievingSum < -0.5 && formAway.overUnderAchievingSum > -1:
    //     rawFinalAwayGoals = rawFinalAwayGoals - 0.15
    //     break;

    //   case formAway.overUnderAchievingSum >= 2:
    //     rawFinalAwayGoals = rawFinalAwayGoals + 1
    //     break;
    //   case formAway.overUnderAchievingSum > 1.5 && formAway.overUnderAchievingSum < 2:
    //     rawFinalAwayGoals = rawFinalAwayGoals + 0.5
    //     break;
    //   case formAway.overUnderAchievingSum > 1 && formAway.overUnderAchievingSum < 1.5:
    //     rawFinalAwayGoals = rawFinalAwayGoals + 0.25
    //     break;
    //   case formAway.overUnderAchievingSum > 0.5 && formAway.overUnderAchievingSum < 1:
    //     rawFinalAwayGoals = rawFinalAwayGoals + 0.15
    //     break;
    //   default:
    //     break;
    // }

switch (true) {
  case formHome.overUnderAchievingSum > 2 && formAway.overUnderAchievingSum < -2:
    rawFinalHomeGoals = rawFinalHomeGoals * 2.5
    rawFinalAwayGoals = rawFinalAwayGoals / 2.5
    break;
  case formHome.overUnderAchievingSum > 1.5 && formAway.overUnderAchievingSum < -1.5:
    rawFinalHomeGoals = rawFinalHomeGoals * 2
    rawFinalAwayGoals = rawFinalAwayGoals / 2
    break;
  case formHome.overUnderAchievingSum > 1 && formAway.overUnderAchievingSum < -1:
    rawFinalHomeGoals = rawFinalHomeGoals * 1.75
    rawFinalAwayGoals = rawFinalAwayGoals / 1.75
    break;
  case formHome.overUnderAchievingSum > 0.5 && formAway.overUnderAchievingSum < -0.5:
    rawFinalHomeGoals = rawFinalHomeGoals * 1.4
    rawFinalAwayGoals = rawFinalAwayGoals / 1.4
    break;
  case formHome.overUnderAchievingSum > 0.2 && formAway.overUnderAchievingSum < -0.2:
    rawFinalHomeGoals = rawFinalHomeGoals * 1.2
    rawFinalAwayGoals = rawFinalAwayGoals / 1.2
  break;

  case formHome.overUnderAchievingSum < -2 && formAway.overUnderAchievingSum > 2:
    rawFinalHomeGoals = rawFinalHomeGoals / 2.5
    rawFinalAwayGoals = rawFinalAwayGoals * 2.5
    break;
  case formHome.overUnderAchievingSum < -1.5 && formAway.overUnderAchievingSum > 1.5:
    rawFinalHomeGoals = rawFinalHomeGoals / 2
    rawFinalAwayGoals = rawFinalAwayGoals * 2
    break;
  case formHome.overUnderAchievingSum < -1 && formAway.overUnderAchievingSum > 1:
    rawFinalHomeGoals = rawFinalHomeGoals / 1.75
    rawFinalAwayGoals = rawFinalAwayGoals * 1.75
    break;
  case formHome.overUnderAchievingSum < -0.5 && formAway.overUnderAchievingSum > 0.5:
    rawFinalHomeGoals = rawFinalHomeGoals / 1.4
    rawFinalAwayGoals = rawFinalAwayGoals * 1.4
    break;
  case formHome.overUnderAchievingSum < -0.2 && formAway.overUnderAchievingSum > 0.2:
    rawFinalHomeGoals = rawFinalHomeGoals / 1.2
    rawFinalAwayGoals = rawFinalAwayGoals * 1.2
  break;






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
    console.log(rawFinalHomeGoals)

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

    // finalHomeGoals = homeComparisonWeighting
    // finalAwayGoals = awayComparisonWeighting


    if (finalHomeGoals > finalAwayGoals) {
      match.prediction = "homeWin";
      homePredictions = homePredictions + 1
      console.log(`homePredictions: ${homePredictions}`)
      if (formHome.overUnderAchievingSum < -1.9) {
        match.includeInMultis = false;
      } else {
        match.includeInMultis = true;
      }
    } else if (finalAwayGoals > finalHomeGoals) {
      match.prediction = "awayWin";
      awayPredictions = awayPredictions + 1
      console.log(`awayPredictions: ${awayPredictions}`)
      if (formAway.overUnderAchievingSum < 1.9) {
        match.includeInMultis = false;
      } else {
        match.includeInMultis = true;
      }
    } else if (finalHomeGoals === finalAwayGoals) {
      match.prediction = "draw";
      drawPredictions = drawPredictions + 1
      console.log(`drawPredictions: ${drawPredictions}`)
      console.log(match)
    }

    switch (true) {
      case match.homeGoals > match.awayGoals:
        match.winner = match.homeTeam;
        match.outcome = "homeWin";
        homeOutcomes = homeOutcomes + 1
        console.log(`homeOutcomes: ${homeOutcomes}`)
        break;
      case match.homeGoals === match.awayGoals:
        match.winner = "draw";
        match.outcome = "draw";
        drawOutcomes = drawOutcomes + 1
        console.log(`drawOutcomes: ${drawOutcomes}`)
        break;
      case match.homeGoals < match.awayGoals:
        match.winner = match.awayTeam;
        match.outcome = "awayWin";
        awayOutcomes = awayOutcomes + 1
        console.log(`awayOutcomes: ${awayOutcomes}`)
        break;
      default:
        break;
    }

    if (match.status === "complete") {
      if (match.prediction === match.outcome) {
        match.predictionOutcome = "Won";
        winAmount = winAmount + 1
        if(match.outcome === "draw"){
          console.log("DRAW WON")
        }
      } else if (match.prediction !== match.outcome) {
        match.predictionOutcome = "Lost";
        lossAmount = lossAmount + 1
        if(match.outcome === "draw"){
          console.log("DRAW LOST")
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

    match.formHome = formHome
    match.formAway = formAway



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
var drawTips = [];
var bttsArray = [];
var accumulatedOdds = 1;
let predictions = [];

export async function getScorePrediction(day, mocked) {
  let radioSelected = parseInt(selectedOption);
  let mock = mocked;
  tips = [];
  bttsArray = [];
  longShotTips = [];
  drawTips = [];
  accumulatedOdds = 1;

  let index = 2;
  let divider = 10
  
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
            rawOdds: match.homeOdds,
            comparisonScore: Math.abs(match.teamComparisonScore),
            formTrend: match.formHome.improving, 
            outcome: match.predictionOutcome,
            goalDifferential: parseFloat(
              await diff(match.unroundedGoalsA, match.unroundedGoalsB)
            ) + match.formHome.overUnderAchievingSum,
          };
          if(!(predictionObject.rawOdds <= 1.4 && predictionObject.comparisonScore < 7)){
            tips.push(predictionObject);
          }       
        }
      } else if (
        (match.unroundedGoalsB - 1) - match.unroundedGoalsA > incrementValue &&
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
            rawOdds: match.awayOdds,
            odds: match.fractionAway,
            comparisonScore: Math.abs(match.teamComparisonScore),
            formTrend: match.formAway.improving,
            outcome: match.predictionOutcome,
            goalDifferential: parseFloat(
              await diff((match.unroundedGoalsB - 1), match.unroundedGoalsA)
            ) + match.formAway.overUnderAchievingSum,
          };
          // console.log("predictionObjectAWAY");
          // console.log(predictionObject);
          // console.log(match);
          if(!(predictionObject.rawOdds <= 1.4 && predictionObject.comparisonScore < 7)){
            tips.push(predictionObject);
          }     
        }
      }


      tips.sort(
        function(a, b) {          
           if (a.comparisonScore === b.comparisonScore) {
              // Price is only important when cities are the same
              return b.goalDifferential - a.goalDifferential;
           }
           return b.comparisonScore > a.comparisonScore ? 1 : -1;
        });


      // tips.sort((a, b) => b.comparisonScore - a.comparisonScore);

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
        match.unroundedGoalsA - 0.85 > match.unroundedGoalsB &&
        match.homeDoubleChance >= 1.4 &&
        match.goalsA > match.goalsB
      ) {
        longShotPredictionObject = {
          team: match.homeTeam,
          odds: match.homeDoubleChance,
          outcome: match.doubleChancePredictionOutcome,
          goalDifferential: parseFloat(
            await diff(match.unroundedGoalsA, match.unroundedGoalsB)
          ),
        };
        if (match.prediction !== "draw") {
          longShotTips.push(longShotPredictionObject);
        }
      } else if (
        match.unroundedGoalsA < match.unroundedGoalsB - 1.3 &&
        match.awayDoubleChance >= 1.4 &&
        match.goalsB > match.goalsA
      ) {
        longShotPredictionObject = {
          team: match.awayTeam,
          odds: match.awayDoubleChance,
          outcome: match.doubleChancePredictionOutcome,
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

      let formTrendScoreComparison = match.formAway.formTrendScore - match.formHome.formTrendScore


      if (
        match.prediction === "draw" && match.homeOdds > 1.8 && match.teamComparisonScore < 5 && match.teamComparisonScore > -5 && formTrendScoreComparison > 0 && formTrendScoreComparison < 3)
          {
          drawPredictionObject = {
          team: match.game,
          odds: match.drawOdds,
          outcome: match.predictionOutcome,
          goalDifferential: Math.abs(parseFloat(
            await diff(match.unroundedGoalsA, match.unroundedGoalsB))
          ),
        };
        if (match.prediction === "draw" && drawPredictionObject.goalDifferential < 0.5) {
          drawTips.push(drawPredictionObject);
          console.log(drawPredictionObject.goalDifferential)
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

  await renderTips();
}

async function renderTips() {

  if(tips.length > 0){
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


  if(longShotTips.length > 0){
    ReactDOM.render(
      <div>
        <Fragment>
          <Collapsable
            buttonText={"Double chance tips"}
            text={
              <ul className="LongshotPredictions">
                <lh>Double chance (Win or Draw - decimal odds only)</lh>
                {longShotTips.map((tip) => (
                  <li className={`${tip.outcome}1`} key={tip.team}>
                    {tip.team} to win or draw: {tip.odds}
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


  if(drawTips.length > 0){
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

if(bttsArray.length > 0){
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
}

