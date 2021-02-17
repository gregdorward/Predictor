import React, { Fragment } from "react";
import ReactDOM from "react-dom";
import { matches, diff } from "./getFixtures";
import { Fixture } from "../components/Fixture";
import { selectedOption } from "../components/radio";
import Div from "../components/Div";
import Collapsable from "../components/CollapsableElement";
import { allForm } from "../logic/getFixtures";

//Calculates scores based on prior XG figures, weighted by odds
export async function calculateScore(match, index, divider, id) {
  let homeRaw;
  let awayRaw;
  console.log("allForm");
  console.log(typeof allForm);
  console.log(allForm);

  console.log(allForm.find((game) => game.id === id).home);

  let teams = [
    allForm.find((game) => game.id === id).home,
    allForm.find((game) => game.id === id).away,
  ];
  for (let i = 0; i < teams.length; i++) {
    if (parseFloat(teams[i][index].ScoredOverall) !== 0) {
      teams[i][index].finishingScore = parseFloat(
        (teams[i][index].ScoredOverall / divider / teams[i][index].XG).toFixed(
          2
        )
      );
    } else {
      teams[i][index].finishingScore = 0.0;
    }

    if (parseFloat(teams[i][index].ConcededOverall) !== 0) {
      teams[i][index].goalieRating = parseFloat(
        (
          teams[i][index].XGAgainstAvg /
          (teams[i][index].ConcededOverall / divider)
        ).toFixed(2)
      );
    } else {
      teams[i].goalieRating = 0;
    }

    teams[i][index].defenceScore = parseInt(
      teams[i][index].CleanSheetPercentage
    );

    let defenceScore;
    defenceScore = teams[i][index].defenceScore;

    switch (true) {
      case defenceScore < 20:
        teams[i][index].defenceRating = 0;
        break;
      case defenceScore >= 20 && defenceScore < 40:
        teams[i][index].defenceRating = 0.3;
        break;
      case defenceScore >= 40 && defenceScore < 60:
        teams[i][index].defenceRating = 0.7;
        break;
      case defenceScore >= 60 && defenceScore < 80:
        teams[i][index].defenceRating = 1.1;
        break;
      case defenceScore >= 80:
        teams[i][index].defenceRating = 1.5;
        break;
      default:
        break;
    }

    teams[i][index].finalFinishingScore = parseFloat(
      await diff(teams[i][index].finishingScore, 1)
    );

    teams[i][index].finalGoalieRating = parseFloat(
      await diff(teams[i][index].goalieRating, 1)
    );

    teams[i][index].forecastedXG = parseFloat(
      teams[i][index].XG + parseFloat(teams[i][index].finalFinishingScore)
    );
  }

  if (match.homeOdds.toFixed(1) === 0.0 && match.awayOdds.toFixed(1) === 0.0) {
    homeRaw = 0.0;
    awayRaw = 0.0;
  } else {
    homeRaw = (1 / match.homeOdds).toFixed(2);
    awayRaw = (1 / match.awayOdds).toFixed(2);
  }

  let formHome = teams[0][index];
  let formAway = teams[1][index];

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

  let homeXGConceded = parseFloat(formHome.XGAgainstAvg);
  let awayXGConceded = parseFloat(formAway.XGAgainstAvg);

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

  //TODO try form.home.XG in place of this
  let homeGoals = Math.round(parseFloat(formHome.XG) + homeCalculation);
  let awayGoals = Math.round(parseFloat(formAway.XG) + awayCalculation);

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
        formHome.ScoredOverall / divider +
        formHome.forecastedXG +
        formAway.ConcededOverall / divider
    ) / 6
  );

  finalAwayGoals = Math.round(
    parseFloat(
      awayGoals * 3 +
        formAway.ScoredOverall / divider +
        formAway.forecastedXG +
        formHome.ConcededOverall / divider
    ) / 6
  );

  // console.log("DIVIDER");
  // console.log(divider);

  // console.log(match.homeTeam);
  // console.log("homeOdds");
  // console.log(match.homeOdds);

  // console.log("homeGoals");
  // console.log(homeGoals);
  // console.log("seasonScoredNum_overall");
  // console.log(formHome.ScoredOverall);
  // console.log("forecastedXG");
  // console.log(formHome.forecastedXG);
  // console.log("seasonConcededNum_overall");
  // console.log(formAway.ConcededOverall);
  // console.log("homeCalculation");
  // console.log(homeCalculation);
  // console.log("defenceScoreHome");
  // console.log(defenceScoreHome);
  // console.log("homeWeighting");
  // console.log(homeWeighting);

  // console.log(match.awayTeam);
  // console.log("awayOdds");
  // console.log(match.awayOdds);
  // console.log("awayGoals");
  // console.log(awayGoals);
  // console.log("seasonScoredNum_overall");
  // console.log(formAway.ScoredOverall);
  // console.log("forecastedXG");
  // console.log(formAway.forecastedXG);
  // console.log("seasonConcededNum_overall");
  // console.log(formHome.ConcededOverall);
  // console.log("awayCalculation");
  // console.log(awayCalculation);
  // console.log("defenceScoreAway");
  // console.log(defenceScoreAway);
  // console.log("awayWeighting");
  // console.log(awayWeighting);

  // console.log("FINAL HOME GOALS");
  // console.log(finalHomeGoals);

  // console.log("FINAL AWAY GOALS");
  // console.log(finalAwayGoals);
  match.homePrediction = finalHomeGoals;
  match.awayPrediction = finalAwayGoals;
  if (match.status === "suspended") {
    finalHomeGoals = "P";
    finalAwayGoals = "P";
  }

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
let predictions = [];

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
  let predictionArray = [];
  let storedPredictions = await fetch(
    `${process.env.REACT_APP_EXPRESS_SERVER}${day}Predictions${divider}`
  );

  predictions = [];

  if (storedPredictions.status === 200) {
    await storedPredictions.json().then((predictions) => {
      console.log("these are the predictions")
      console.log(predictions);
      predictionArray = predictions.fixtures.predictions;
    });
  }
  let i = 0;
  let makePostRequest = false;

  await Promise.all(
    matches.map(async (match) => {
      // if there are no stored predictions, calculate them based on live data
      let thisPrediction = predictionArray.find((game) => game.id === match.id)
      console.log(thisPrediction)
      console.log(predictionArray);
      if (thisPrediction) {
        switch (true) {
          case match.status === "complete":
            console.log(thisPrediction.game);
            match.goalsA = thisPrediction.goalsA;
            match.goalsB = thisPrediction.goalsB;
            console.log("fetching stored prediction - complete");
            break;
          case match.status === "incomplete":
            [match.goalsA, match.goalsB] = await calculateScore(
              match,
              index,
              divider,
              match.id
            );
            makePostRequest = true;
            console.log(match.game);
            console.log("fetching new prediction - incomplete");
            break;
          case match.status === "suspended":
            match.goalsA = "P";
            match.goalsB = "P";
            console.log(match.game);
            console.log("game postponed");
            break;
          default:
            [match.goalsA, match.goalsB] = await calculateScore(
              match,
              index,
              divider,
              match.id
            );
            makePostRequest = true;
            console.log(match.game);
            console.log("default - fetching stored prediction");
            break;
        }
      } else {
        [match.goalsA, match.goalsB] = await calculateScore(
          match,
          index,
          divider,
          match.id
        );
        makePostRequest = true;
        console.log(match.game);
        console.log("else clause triggered");
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
      console.log(match);
      predictions.push(match);
      console.log("pushed");
      console.log("current state of predictions...");
      console.log("TYPE");
      console.log(typeof predictions);
      console.log(predictions);
      i = i + 1;
    })
  );
  console.log("Node env");
  console.log(process.env.NODE_ENV);
  if (makePostRequest === true && day !== "yesterdaysFixtures") {
    postFixedPredictions(predictions, divider, day);
  }

  await getSuccessMeasure(matches);
}

async function postFixedPredictions(predictions, divider, day) {
  await fetch(
    `${process.env.REACT_APP_EXPRESS_SERVER}postPredictions${divider}${day}`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ predictions }),
    }
  );
}
