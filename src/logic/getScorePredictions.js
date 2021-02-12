import React, { Fragment } from "react";
import ReactDOM from "react-dom";
import { matches, diff } from "./getFixtures";
import { Fixture } from "../components/Fixture";
import { selectedOption } from "../components/radio";
import Div from "../components/Div";
import Collapsable from "../components/CollapsableElement";

//Calculates scores based on prior XG figures, weighted by odds
export async function calculateScore(match, index, divider) {
  console.log("Calculate score called");
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
        teams[i].defenceRating = 0.3;
        break;
      case defenceScore >= 40 && defenceScore < 60:
        teams[i].defenceRating = 0.7;
        break;
      case defenceScore >= 60 && defenceScore < 80:
        teams[i].defenceRating = 1.1;
        break;
      case defenceScore >= 80:
        teams[i].defenceRating = 1.5;
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

  // let defenceHome = parseFloat(formHome.defenceRating);
  let goalieHome = formHome.finalGoalieRating;

  let defenceScoreHome = (formHome.defenceScore + goalieHome) / 2;

  // let defenceAway = parseFloat(formAway.defenceRating);
  let goalieAway = formAway.finalGoalieRating;

  let defenceScoreAway = (formAway.defenceScore + goalieAway) / 2;

  let oddsWeightingHome = parseFloat(homeRaw);
  let oddsWeightingAway = parseFloat(awayRaw);

  let homeWeighting = (
    (await diff(oddsWeightingHome, oddsWeightingAway)) * 2
  ).toFixed(2);
  let awayWeighting = (
    (await diff(oddsWeightingAway, oddsWeightingHome)) * 2
  ).toFixed(2);

  let homeXGConceded = parseFloat(formHome.xg_against_avg_overall);
  let awayXGConceded = parseFloat(formAway.xg_against_avg_overall);

  let homeCalculation;
  let awayCalculation;
  if (defenceScoreAway > 0) {
    homeCalculation =
      parseFloat(homeWeighting - defenceScoreAway / 10 + 0.5) + awayXGConceded;
  } else {
    homeCalculation =
      parseFloat(homeWeighting + defenceScoreAway / 10 + 0.5) + awayXGConceded;
  }
  if (defenceScoreHome > 0) {
    awayCalculation =
      parseFloat(awayWeighting - defenceScoreHome / 10 + 0.5) + homeXGConceded;
  } else {
    awayCalculation =
      parseFloat(awayWeighting + defenceScoreHome / 10 + 0.5) + homeXGConceded;
  }

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
      homeGoals * 3 +
        formHome.seasonScoredNum_overall / divider +
        formHome.forecastedXG +
        formAway.seasonConcededNum_overall / divider
    ) / 6
  );

  finalAwayGoals = Math.round(
    parseFloat(
      awayGoals * 3 +
        formAway.seasonScoredNum_overall / divider +
        formAway.forecastedXG +
        formHome.seasonConcededNum_overall / divider
    ) / 6
  );

  console.log("DIVIDER")
  console.log(divider)

  console.log(match.homeTeam);
  console.log("homeOdds")
  console.log(match.homeOdds)

  console.log("homeGoals");
  console.log(homeGoals);
  console.log("seasonScoredNum_overall");
  console.log(formHome.seasonScoredNum_overall);
  console.log("forecastedXG");
  console.log(formHome.forecastedXG);
  console.log("seasonConcededNum_overall");
  console.log(formAway.seasonConcededNum_overall);
  console.log("homeCalculation");
  console.log(homeCalculation);
  console.log("defenceScoreHome");
  console.log(defenceScoreHome);
  console.log("homeWeighting");
  console.log(homeWeighting);

  console.log(match.awayTeam);
  console.log("awayOdds")
  console.log(match.awayOdds)
  console.log("awayGoals");
  console.log(awayGoals);
  console.log("seasonScoredNum_overall");
  console.log(formAway.seasonScoredNum_overall);
  console.log("forecastedXG");
  console.log(formAway.forecastedXG);
  console.log("seasonConcededNum_overall");
  console.log(formHome.seasonConcededNum_overall);
  console.log("awayCalculation");
  console.log(awayCalculation);
  console.log("defenceScoreAway");
  console.log(defenceScoreAway);
  console.log("awayWeighting");
  console.log(awayWeighting);

  console.log("FINAL HOME GOALS");
  console.log(finalHomeGoals);

  console.log("FINAL AWAY GOALS");
  console.log(finalAwayGoals);
  match.homePrediction = finalHomeGoals;
  match.awayPrediction = finalAwayGoals;

  return [finalHomeGoals, finalAwayGoals];
}

function getSuccessMeasure(fixtures) {
  let sum = -1;
  let roundedFigure = -1;
  let gameCount = 0;
  for (let i = 0; i < fixtures.length; i++) {
    if (fixtures[i].profit) {
      const profit = parseFloat(fixtures[i].profit);
      sum = parseFloat(sum + profit);
      roundedFigure = sum.toFixed(2);
      gameCount = gameCount + 1;
    } else {
      sum = parseFloat(sum + 0);
      roundedFigure = sum.toFixed(2);
    }
  }

  if (gameCount > 0) {
    ReactDOM.render(
      <Fragment>
        <Div
          className={"SuccessMeasure"}
          text={`accumulated profit/loss if £1 was staked on each of the  ${gameCount} games: £${roundedFigure}`}
        />
      </Fragment>,
      document.getElementById("successMeasure")
    );
  } else {
    return;
  }
}

var tips = [];
var accumulatedOdds = 1;
const predictions = [];

export async function getScorePrediction(day) {
  let radioSelected = parseInt(selectedOption);
  tips = [];
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
  let predictionArray = []
  let storedPredictions = await fetch(`${process.env.REACT_APP_EXPRESS_SERVER}${day}Predictions${divider}`);


  console.log(predictionArray.length)
  console.log(storedPredictions.status)
  if(storedPredictions.status === 200){
    await storedPredictions.json().then((predictions) => {
      predictionArray = predictions.fixtures.predictions;
    });
  }
  let i = 0
  let stored;

  await Promise.all(
    matches.map(async (match) => {
      let goalsA;
      let goalsB;
      // if there are no stored predictions, calculate them based on live data
      if (predictionArray.length > 0) {
        console.log(match.game)
        stored = true;

        if(!predictionArray[i]){
          [goalsA, goalsB] = await calculateScore(match, index, divider);
          console.log("no prediction")
          match.goalsA = goalsA;
          match.goalsB = goalsB;
        } else {
          match.goalsA = predictionArray[i].match.goalsA
          match.goalsB = predictionArray[i].match.goalsB
        }


      } else {
        [goalsA, goalsB] = await calculateScore(match, index, divider);
        stored = false;

        match.goalsA = goalsA;
        match.goalsB = goalsB;
      }

      if (match.status === "suspended") {
        match.goalsA = "P";
        match.goalsB = "P";
      }


      match.predictionOutcome = "unknown";
      let predictionObject;

      if (match.goalsA - 1 > match.goalsB && match.homeOdds !== 0) {
        if (match.status === "complete" && match.homeTeam === match.winner) {
          match.predictionOutcome = "Won";
        } else if (
          match.status === "complete" &&
          match.homeTeam !== match.winner
        ) {
          match.predictionOutcome = "Lost";
        }
        accumulatedOdds =
          parseFloat(accumulatedOdds) * parseFloat(match.homeOdds);
        predictionObject = {
          team: match.homeTeam,
          odds: match.homeOdds,
          outcome: match.predictionOutcome,
        };
        tips.push(predictionObject);
      } else if (match.goalsB - 1 > match.goalsA && match.awayOdds !== 0) {
        if (match.status === "complete" && match.awayTeam === match.winner) {
          match.predictionOutcome = "Won";
        } else if (
          match.status === "complete" &&
          match.awayTeam !== match.winner
        ) {
          match.predictionOutcome = "Lost";
        }
        accumulatedOdds =
          parseFloat(accumulatedOdds) * parseFloat(match.awayOdds);
        predictionObject = {
          team: match.awayTeam,
          odds: match.awayOdds,
          outcome: match.predictionOutcome,
        };
        tips.push(predictionObject);
      }

      ReactDOM.render(
        <Fixture
          fixtures={matches}
          result={true}
          className={"individualFixture"}
        />,
        document.getElementById("FixtureContainer")
      );

      if (tips.length > 0) {
        ReactDOM.render(
          <div>
            <Fragment>
              <Collapsable
                buttonText={"Predictions of the day"}
                text={
                  <ul className="BestPredictions">
                    <lh>To win</lh>
                    {tips.map((tip) => (
                      <li className={tip.outcome} key={tip.team}>
                        {tip.team} odds: {tip.odds}
                      </li>
                    ))}
                    <div className="AccumulatedOdds">{`Accumulator odds: ${accumulatedOdds.toFixed(
                      2
                    )} / 1`}</div>
                  </ul>
                }
              />
            </Fragment>
          </div>,
          document.getElementById("bestPredictions")
        );
      }
      predictions.push({
        match: match,
      });
      i = i+1
    })
  );

  if(day !== "yesterdaysFixtures" && stored === false){
    postFixedPredictions(predictions, divider, day);
  }

  await getSuccessMeasure(matches);
}

async function postFixedPredictions(predictions, divider, day) {
  await fetch(`${process.env.REACT_APP_EXPRESS_SERVER}postPredictions${divider}${day}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ predictions }),
  });
}

var now = new Date();
var hour = now.getHours();

console.log("hour");
console.log(hour);
