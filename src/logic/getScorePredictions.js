import React from "react";
import ReactDOM from "react-dom";
import { matches, diff } from "./getFixtures";
import { FixtureList } from "../components/FixtureList";
import { selectedOption } from "../components/radio";

//Calculates scores based on prior XG figures, weighted by odds
export async function calculateScore(match, index, divider) {
  let homeRaw;
  let awayRaw;
  let teams = [
    match.form.allHomeForm[index].stats,
    match.form.allAwayForm[index].stats,
  ];
  for (let i = 0; i < teams.length; i++) {
    if (parseFloat(teams[i].xg_for_avg_overall).toFixed(2) != 0.0) {
      teams[i].finishingScore = parseFloat(
        (
          teams[i].seasonScoredNum_overall /
          divider /
          teams[i].xg_for_avg_overall
        ).toFixed(2)
      );
    } else {
      teams[i].finishingScore = 0.0;
    }

    if (
      parseFloat(teams[i].seasonConcededNum_overall / divider).toFixed(2) != 0.0
    ) {
      teams[i].goalieRating = parseFloat(
        (
          teams[i].xg_against_avg_overall /
          (teams[i].seasonConcededNum_overall / divider)
        ).toFixed(2)
      );
    } else {
      teams[i].goalieRating = 2;
    }

    teams[i].defenceScore = parseInt(teams[i].seasonCSPercentage_overall);

    let defenceScore;
    defenceScore = teams[i].defenceScore;

    switch (true) {
      case defenceScore < 20:
        teams[i].defenceRating = 0;
        break;
      case defenceScore >= 20 && defenceScore < 40:
        teams[i].defenceRating = 0.4;
        break;
      case defenceScore >= 40 && defenceScore < 60:
        teams[i].defenceRating = 0.8;
        break;
      case defenceScore >= 60 && defenceScore < 80:
        teams[i].defenceRating = 1.2;
        break;
      case defenceScore >= 80:
        teams[i].defenceRating = 1.6;
        break;
      default:
        break;
    }

    teams[i].finalFinishingScore = parseFloat(
      await diff(teams[i].finishingScore, 1)
    );

    teams[i].finalGoalieRating = parseFloat(
      await diff(teams[i].goalieRating, 1)
    );

    teams[i].forecastedXG = parseFloat(
      teams[i].xg_for_avg_overall + teams[i].finalFinishingScore
    );
  }

  if (match.homeOdds == 0 && match.awayOdds == 0) {
    homeRaw = 0.0;
    awayRaw = 0.0;
  } else {
    homeRaw = (1 / match.homeOdds).toFixed(2);
    awayRaw = (1 / match.awayOdds).toFixed(2);
  }

  let formHome = match.form.allHomeForm[index].stats;
  let formAway = match.form.allAwayForm[index].stats;

  let defenceHome = parseFloat(formHome.defenceRating);
  let goalieHome = formHome.finalGoalieRating;
  let defenceScoreHome = (defenceHome + goalieHome) / 2;

  let defenceAway = parseFloat(formAway.defenceRating);
  let goalieAway = formAway.finalGoalieRating;

  let defenceScoreAway = (defenceAway + goalieAway) / 2;

  let oddsWeightingHome = parseFloat(homeRaw);
  let oddsWeightingAway = parseFloat(awayRaw);

  let homeWeighting = (
    (await diff(oddsWeightingHome, oddsWeightingAway)) * 2
  ).toFixed(2);
  let awayWeighting = (
    (await diff(oddsWeightingAway, oddsWeightingHome)) * 2
  ).toFixed(2);

  let homeXGConceded = formHome.xg_against_avg_overall - 1;
  let awayXGConceded = formAway.xg_against_avg_overall - 1;

  let homeCalculation =
    parseFloat(homeWeighting) - (defenceScoreAway + awayXGConceded);
  let awayCalculation =
    parseFloat(awayWeighting) - (defenceScoreHome + homeXGConceded);

  let homeGoals = Math.round(parseFloat(match.homeXG) + homeCalculation);
  let awayGoals = Math.round(parseFloat(match.awayXG) + awayCalculation);

  if (homeGoals < 0) {
    homeGoals = 0;
  }

  if (awayGoals < 0) {
    awayGoals = 0;
  }

  let finalHomeGoals;
  let finalAwayGoals;

  finalHomeGoals = Math.round(
    parseFloat(
      homeGoals +
        formHome.seasonScoredNum_overall / divider +
        formHome.forecastedXG
    ) / 3
  );

  finalAwayGoals = Math.round(
    parseFloat(
      awayGoals +
        formAway.seasonScoredNum_overall / divider +
        formAway.forecastedXG
    ) / 3
  );

  return [finalHomeGoals, finalAwayGoals];
}

export async function getScorePrediction() {
  let radioSelected = parseInt(selectedOption);

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
      let [goalsA, goalsB] = await calculateScore(match, index, divider);
      match.goalsA = goalsA;
      match.goalsB = goalsB;
      if (match.status === "suspended") {
        match.goalsA = "P";
        match.goalsB = "P";
      }

      ReactDOM.render(
        <FixtureList fixture={match} fixtures={matches} result={true} />,
        document.getElementById("FixtureContainer")
      );
    })
  );
}
