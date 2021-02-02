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

  let defenceHome = parseFloat(formHome.defenceRating);
  let goalieHome = formHome.finalGoalieRating;
  let defenceScoreHome = (defenceHome + goalieHome) / 2;

  let defenceAway = parseFloat(formAway.defenceRating);
  let goalieAway = formAway.finalGoalieRating;

  let defenceScoreAway = (defenceAway + goalieAway) / 2;

  let oddsWeightingHome = parseFloat(homeRaw);
  let oddsWeightingAway = parseFloat(awayRaw);

  let homeWeighting = (
    (await diff(oddsWeightingHome, oddsWeightingAway)) * 1
  ).toFixed(2);
  let awayWeighting = (
    (await diff(oddsWeightingAway, oddsWeightingHome)) * 1
  ).toFixed(2);

  let homeCalculation = parseFloat(homeWeighting) - defenceScoreAway;
  let awayCalculation = parseFloat(awayWeighting) - defenceScoreHome;

  //if home calculation is less than 0 -> add this value to the away team goals and vice versa.
  //also set a baseline calculation score so it cannot go below 0

  if (homeCalculation < 0) {
    homeCalculation = 0;
  }

  if (awayCalculation < 0) {
    awayCalculation = 0;
  }

  let homeGoals = Math.round(parseFloat(match.homeXG) + homeCalculation);
  let awayGoals = Math.round(parseFloat(match.awayXG) + awayCalculation);

  let finalHomeGoals;
  let finalAwayGoals;

  // round the predicted goals up or down depending on the teams' finishing ability
  if (formHome.finishingScore >= 1) {
    finalHomeGoals = Math.ceil(
      parseFloat(homeGoals + formHome.averageGoals) / 2
    );
  } else {
    finalHomeGoals = Math.floor(
      parseFloat(homeGoals + formHome.averageGoals) / 2
    );
  }

  if (formAway.finishingScore >= 1) {
    finalAwayGoals = Math.ceil(
      parseFloat(awayGoals + formAway.averageGoals) / 2
    );
  } else {
    finalAwayGoals = Math.floor(
      parseFloat(awayGoals + formAway.averageGoals) / 2
    );
  }

  return [finalHomeGoals, finalAwayGoals];
}

export async function getScorePrediction() {
  await Promise.all(
    matches.map(async (match) => {
      let [goalsA, goalsB] = await calculateScore(match);
      match.goalsA = goalsA;
      match.goalsB = goalsB;
      if (match.status === "suspended") {
        match.goalsA = "P";
        match.goalsB = "P";
      }

      ReactDOM.render(
        <FixtureList fixture={match} fixtures={matches} result={true}/>,
        document.getElementById("FixtureContainer")
      );
    })
  );
}
