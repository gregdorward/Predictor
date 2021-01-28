import React from "react";
import ReactDOM from "react-dom";
import { diff } from "./getForm";
import { matches } from "./getFixtures";
import { FixtureList } from "../components/FixtureList";

//Calculates scores based on prior XG figures, weighted by odds
export async function calculateScore(match) {
  let homeRaw;
  let awayRaw;
  if (match.homeOdds == 0 && match.awayOdds == 0) {
    homeRaw = 0.0;
    awayRaw = 0.0;
  } else {
    homeRaw = (1 / match.homeOdds).toFixed(2);
    awayRaw = (1 / match.awayOdds).toFixed(2);
  }

  let formHome = match.homeTeamForm;
  let formAway = match.awayTeamForm;

  let accuracyHome = formHome.finalFinishingScore;
  let defenceHome = parseFloat(formHome.defenceRating);
  let goalieHome = formHome.finalGoalieRating;
  let forecastedXGHome = formHome.forecastedXG;
  let defenceScoreHome = (defenceHome + goalieHome) / 2;

  let accuracyAway = formAway.finalFinishingScore;
  let defenceAway = parseFloat(formAway.defenceRating);
  let goalieAway = formAway.finalGoalieRating;
  let forecastedXGAway = formAway.forecastedXG;

  let defenceScoreAway = (defenceAway + goalieAway) / 2;

  let expectedHomeGoals = parseFloat(match.homeXG);
  let expectedAwayGoals = parseFloat(match.awayXG);

  let calculatedXGHome = (forecastedXGHome + expectedHomeGoals) / 2;
  let calculatedXGAway = (forecastedXGAway + expectedAwayGoals) / 2;

  let oddsWeightingHome = parseFloat(homeRaw);
  let oddsWeightingAway = parseFloat(awayRaw);

  let homeWeighting = (
    (await diff(oddsWeightingHome, oddsWeightingAway)) * 1
  ).toFixed(2);
  let awayWeighting = (
    (await diff(oddsWeightingAway, oddsWeightingHome)) * 1
  ).toFixed(2);

  let homeCalculation =
    parseFloat(homeWeighting + accuracyHome) - defenceScoreAway;
  let awayCalculation =
    parseFloat(awayWeighting + accuracyAway) - defenceScoreHome;

  //if home calculation is less than 0 -> add this value to the away team goals and vice versa.
  //also set a baseline calculation score so it cannot go below 0

  if (homeCalculation < -1) {
    awayCalculation -= homeCalculation / 2;
    homeCalculation = -1;
  }

  if (awayCalculation < -1) {
    homeCalculation -= awayCalculation / 2;
    awayCalculation = -1;
  }

  let homeGoals = Math.round(parseFloat(calculatedXGHome) + homeCalculation);
  let awayGoals = Math.round(parseFloat(calculatedXGAway) + awayCalculation);

  return [homeGoals, awayGoals];
}

export async function getScorePrediction() {
  await Promise.all(
    matches.map(async (match) => {
      let [goalsA, goalsB] = await calculateScore(match);
      match.goalsA = goalsA;
      match.goalsB = goalsB;
      if (match.status === "suspended") {
        goalsA = "P";
        goalsB = "P";
      }

      ReactDOM.render(
        <FixtureList match={match} matches={matches} result={true} />,
        document.getElementById("FixtureContainer")
      );
    })
  );
}
