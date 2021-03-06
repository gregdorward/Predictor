import React, { Fragment } from "react";
import ReactDOM from "react-dom";
import { matches, diff } from "./getFixtures";
import { Fixture } from "../components/Fixture";
import { selectedOption } from "../components/radio";
import Div from "../components/Div";
import Collapsable from "../components/CollapsableElement";
import { allForm } from "../logic/getFixtures";

var myHeaders = new Headers();
myHeaders.append("Origin", "https://gregdorward.github.io");

var requestOptions = {
  method: "GET",
  headers: myHeaders,
  redirect: "follow",
};

let finalHomeGoals;
let finalAwayGoals;
let totalGoals = 0;
let numberOfGames = 0;
let averageGoals = totalGoals / numberOfGames;

//Calculates scores based on prior XG figures, weighted by odds
export async function calculateScore(match, index, divider, id, allLeagueData) {
  
  let homeRaw;
  let awayRaw;

  let teams;
  let calculate = true;

  let gameTotalWeighting;

  switch (true) {
    case divider === 5:
      gameTotalWeighting = 5;
      break;
    case divider === 6:
      gameTotalWeighting = 5;
      break;
    case divider === 10:
      gameTotalWeighting = 4;
      break;
    default:
      break;
  }

  if (allForm.find((game) => game.id === id)) {
    teams = [
      allForm.find((game) => game.id === id).home,
      allForm.find((game) => game.id === id).away,
    ];
  } else {
    calculate = false;
  }

  if (calculate) {



    for (let i = 0; i < teams.length; i++) {

      teams[i][index].lastGame = teams[i][index].LastFiveForm[4];
      teams[i][index].previousToLastGame = teams[i][index].LastFiveForm[3];

      teams[i][index].generalOffensiveRating =
        (teams[i][index].ScoredOverall / divider + teams[i][index].XG) / 2;
      teams[i][index].homeOffensiveRating =
        (teams[i][index].ScoredHome / teams[i][index].PlayedHome +
          teams[i][index].XGHome) /
        2;
      teams[i][index].awayOffensiveRating =
        (teams[i][index].ScoredAway / teams[i][index].PlayedAway +
          teams[i][index].XGAway) /
        2;

      teams[i][index].generalDefensiveRating =
        (teams[i][index].ConcededOverall / divider +
          teams[i][index].XGAgainstAvg) /
        2;

      teams[i][index].homeDefensiveRating =
        (teams[i][index].ConcededHome / teams[i][index].PlayedHome +
          teams[i][index].XGAgainstHome) /
        2;
      teams[i][index].awayDefensiveRating =
        (teams[i][index].ConcededAway / teams[i][index].PlayedAway +
          teams[i][index].XGAgainstAway) /
        2;

      if (parseFloat(teams[i][2].ScoredOverall) > 0) {
        teams[i][index].finishingScore = parseFloat(
          (teams[i][2].XG / (teams[i][2].ScoredOverall / 10)).toFixed(2) - 1
        );
      } else {
        teams[i][index].finishingScore = 0.0;
      }

      if (teams[i][2].ConcededOverall > 0) {
        teams[i][index].goalieRating = parseFloat(
          (
            teams[i][2].XGAgainstAvg /
            (teams[i][2].ConcededOverall / 10)
          ).toFixed(2) - 1
        );
      } else {
        teams[i][index].goalieRating = 0.0;
      }

      teams[i][index].defenceScore = parseInt(
        teams[i][index].CleanSheetPercentage
      );

      let defenceScore;
      defenceScore = teams[i][index].defenceScore;

      teams[i][index].scoredAverage = teams[i][index].ScoredOverall / divider;
      teams[i][index].concededAverage =
        teams[i][index].ConcededOverall / divider;

      switch (true) {
        case defenceScore === 0:
          teams[i][index].defenceRating = 1.4;
          break;
        case defenceScore > 0 && defenceScore < 20:
          teams[i][index].defenceRating = 1.3;
          break;
        case defenceScore >= 20 && defenceScore < 30:
          teams[i][index].defenceRating = 1.2;
          break;
        case defenceScore >= 30 && defenceScore < 40:
          teams[i][index].defenceRating = 1.1;
          break;
        case defenceScore >= 40 && defenceScore < 50:
          teams[i][index].defenceRating = 0.9;
          break;
        case defenceScore >= 50 && defenceScore < 60:
          teams[i][index].defenceRating = 0.8;
          break;
        case defenceScore >= 60 && defenceScore < 70:
          teams[i][index].defenceRating = 0.7;
          break;
        case defenceScore >= 70 && defenceScore < 80:
          teams[i][index].defenceRating = 0.6;
          break;
        case defenceScore >= 80:
          teams[i][index].defenceRating = 0.5;
          break;
        default:
          break;
      }

      teams[i][index].finalFinishingScore = parseFloat(
        teams[i][index].finishingScore / gameTotalWeighting + 1
      );

      teams[i][index].XGConcededAdjustment = parseFloat(
        teams[i][index].goalieRating / gameTotalWeighting + 1
      );

      teams[i][index].forecastedXG = parseFloat(teams[i][index].scoredAverage);

      teams[i][index].forecastedXGConceded = parseFloat(
        teams[i][index].concededAverage
      );

      teams[0][index].goalsBasedOnAverages = Math.round(
        parseFloat(
          (teams[0][index].forecastedXG +
            teams[1][index].forecastedXGConceded) /
            2
        )
      );

      teams[1][index].goalsBasedOnAverages = Math.round(
        parseFloat(
          (teams[1][index].forecastedXG +
            teams[0][index].forecastedXGConceded) /
            2
        )
      );
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

    formHome.averageGoalDifferential =
      formHome.generalOffensiveRating - formAway.generalOffensiveRating;
    formHome.averageConcededDifferential =
      formHome.generalDefensiveRating - formAway.generalDefensiveRating;

    formAway.averageGoalDifferential =
      formAway.generalOffensiveRating - formHome.generalOffensiveRating;
    formAway.averageConcededDifferential =
      formAway.generalDefensiveRating - formHome.generalDefensiveRating;

    let oddsWeightingHome;
    let oddsWeightingAway;
    let homeWeighting;
    let awayWeighting;

    if (homeRaw > 0) {
      oddsWeightingHome = homeRaw - awayRaw;
      oddsWeightingAway = awayRaw - homeRaw;

      let weighting = (await diff(oddsWeightingHome, oddsWeightingAway)) * 1.5;
      let weightingSplitHome;
      let weightingSplitAway;

      if (weighting >= 0) {
        if (oddsWeightingHome > oddsWeightingAway) {
          weightingSplitHome = Math.abs(weighting) / 2;
          weightingSplitAway = -Math.abs(weighting) / 2;
        } else {
          weightingSplitHome = -Math.abs(weighting) / 2;
          weightingSplitAway = Math.abs(weighting) / 2;
        }

        homeWeighting = weightingSplitHome;
        awayWeighting = weightingSplitAway;
      } else {
        awayWeighting = 0;
        homeWeighting = 0;
      }
    } else {
      //if no odds are returned set them to a 0 default
      homeWeighting = 0;
      awayWeighting = 0;
    }

    let homeCalculation;
    let awayCalculation;

    homeCalculation = parseFloat(homeWeighting);
    awayCalculation = parseFloat(awayWeighting);

    let averageLeageGoals = allLeagueData.find(
      ({ competitionId }) => competitionId === match.competition_id
    ).averageGoals;

    let leagueName = allLeagueData.find(
      ({ competitionId }) => competitionId === match.competition_id
    ).name;

    let homeAttackAdvantagePercentage = allLeagueData.find(
      ({ competitionId }) => competitionId === match.competition_id
    ).homeAttackAdvantagePercentage;

    let homeDefenceAdvantagePercentage = allLeagueData.find(
      ({ competitionId }) => competitionId === match.competition_id
    ).homeDefenceAdvantagePercentage;

    const homeGoalWeighting = homeAttackAdvantagePercentage / 100;
    const HomeDefenceWeighting = homeDefenceAdvantagePercentage / 100;

    const homeGoalsUnweighted = parseFloat(
      (formHome.XG + formHome.scoredAverage) / 2
    );

    const awayGoalsUnweighted = parseFloat(
      (formAway.XG + formAway.scoredAverage) / 2
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

    let homeGoalswithHomeWeighting = parseFloat(
      homeGoalsWithAwayDefenceWeighting * (1 + homeGoalWeighting)
    );

    let awayGoalswithAwayWeighting = parseFloat(
      awayGoalsWithHomeDefenceWeighting * (1 - HomeDefenceWeighting)
    );

    let goalTotal = parseFloat(
      homeGoalswithHomeWeighting + awayGoalswithAwayWeighting
    );

    if (homeGoalswithHomeWeighting < 0) {
      homeGoalswithHomeWeighting = 0;
    }

    if (awayGoalswithAwayWeighting < 0) {
      awayGoalswithAwayWeighting = 0;
    }

    let finalHomeGoals;
    let finalAwayGoals;


    // console.log("formHome.forecastedXG");
    // console.log(formHome.forecastedXG);

    // console.log("formAway.forecastedXG");
    // console.log(formAway.forecastedXG);

    // console.log("formHome.ConcededOverall")
    // console.log(formHome.ConcededOverall)
    // console.log("formAway.ConcededOverall")
    // console.log(formAway.ConcededOverall)

    // console.log("formHome.XGAgainstAvg")
    // console.log(formHome.XGAgainstAvg)
    // console.log("formAway.XGAgainstAvg")
    // console.log(formAway.XGAgainstAvg)

    // console.log("formHome.forecastedXGConceded")
    // console.log(formHome.forecastedXGConceded)
    // console.log("formAway.forecastedXGConceded")
    // console.log(formAway.forecastedXGConceded)

    // console.log("Finishing score experiment");
    // console.log(match.game);
    // console.log(formHome.finalFinishingScore);
    // console.log(formAway.finalFinishingScore);

    // console.log("XG Conceded experiment");
    // console.log(match.game);
    // console.log(formHome.XGConcededAdjustment);
    // console.log(formAway.XGConcededAdjustment);

    // console.log("Scores before adjusting");
    // console.log("home");
    // console.log(
    //   Math.round(
    //     parseFloat(homeGoals * 5 + formHome.goalsBasedOnAverages * 5) / 10
    //   )
    // );
    // console.log("away");
    // console.log(
    //   Math.round(
    //     parseFloat(awayGoalswithAwayWeighting* 5 + formAway.goalsBasedOnAverages * 5) / 10
    //   )
    // );

    async function roundCustom(num, form) {
      if (form.finalFinishingScore < 1) {
        return Math.ceil(num);
      } else {
        return Math.floor(num);
      }
    }

    const XGForAdjustedHomeGoals =
      homeGoalswithHomeWeighting * formHome.finalFinishingScore;
    const XGForAdjustedAwayGoals =
      awayGoalswithAwayWeighting * formAway.finalFinishingScore;
    const XGAgainstAdjustedHomeGoals =
      homeGoalswithHomeWeighting * formAway.XGConcededAdjustment;
    const XGAgainstAdjustedAwayGoals =
      awayGoalswithAwayWeighting * formHome.XGConcededAdjustment;

    const XGAdjustedHomeGoals =
      (XGForAdjustedHomeGoals + XGAgainstAdjustedHomeGoals) / 2;
    const XGAdjustedAwayGoals =
      (XGForAdjustedAwayGoals + XGAgainstAdjustedAwayGoals) / 2;

    let gameHomeAttackAdvantage =
      formHome.averageGoalDifferential - formAway.averageGoalDifferential;

    let gameHomeDefenceAdvantage =
      formAway.averageConcededDifferential -
      formHome.averageConcededDifferential;

    // console.log(match.game);
    // console.log("gameHomeAttackAdvantage");
    // console.log(gameHomeAttackAdvantage);
    // console.log("gameHomeDefenceAdvantage");
    // console.log(gameHomeDefenceAdvantage);

    let goalsDifferential = gameHomeAttackAdvantage + gameHomeDefenceAdvantage;

    const generalformHomeGoals =
      // (1.685 + oddsDiff) * 0.6375 + (1.2 * 0.875) + (1 + homeDefenceRating) / 2

      ((formHome.generalOffensiveRating + homeCalculation) +
        formAway.defenceRating * formAway.generalDefensiveRating +
        1 +
        homeGoalWeighting) /
      2;

      console.log(generalformHomeGoals)

    const generalformAwayGoals =
      ((formAway.generalOffensiveRating + awayCalculation)  +
        formHome.defenceRating * formHome.generalDefensiveRating +
        1 -
        HomeDefenceWeighting) /
      2;

    let calculatedDifferential = generalformHomeGoals - generalformAwayGoals;


    let differentialWeighting = await diff(
      goalsDifferential,
      calculatedDifferential
    );




    let homeGoalDifferentialWeighting;
    let awayGoalDifferentialWeighting;

    if (differentialWeighting >= 0) {
      homeGoalDifferentialWeighting = differentialWeighting / 2;
      awayGoalDifferentialWeighting = -Math.abs(differentialWeighting) / 2;
    } else if (differentialWeighting < 0) {
      homeGoalDifferentialWeighting = -Math.abs(differentialWeighting) / 2;
      awayGoalDifferentialWeighting = differentialWeighting / 2;
    }

    console.log("EXPERIMENTAL SCORE...")
    console.log(match.game)
    let experimentalHomeGoals = formHome.XG + homeGoalDifferentialWeighting
    let experimentalAwayGoals = formAway.XG + awayGoalDifferentialWeighting
    // console.log(`Home - ${formHome.XG + homeGoalDifferentialWeighting}`)
    // console.log(`Away - ${formAway.XG + awayGoalDifferentialWeighting}`)


    const homeformHomeGoals =
      (formHome.homeOffensiveRating + homeCalculation) *
      formHome.finalFinishingScore *
      formAway.defenceRating *
      formAway.XGConcededAdjustment *
      (1 + homeGoalWeighting);
    const awayformAwayGoals =
      (formAway.awayOffensiveRating + awayCalculation) *
      formAway.finalFinishingScore *
      formHome.defenceRating *
      formHome.XGConcededAdjustment *
      (1 - HomeDefenceWeighting);
    // console.log(`Home goals - ${generalformHomeGoals}`);
    // console.log(`Away goals - ${generalformAwayGoals}`);

    // console.log(`Home goals based on home form - ${homeformHomeGoals}`);
    // console.log(`Away goals based on away form - ${awayformAwayGoals}`);

    finalHomeGoals = await roundCustom(
      parseFloat(
        // XGAdjustedHomeGoals
        // formHome.goalsBasedOnAverages

        (experimentalHomeGoals + generalformHomeGoals + homeformHomeGoals + formHome.goalsBasedOnAverages) / 4
      

        // (XGAdjustedHomeGoals * 0 +
        //   formHome.goalsBasedOnAverages * 0 +
        //   homeformHomeGoals * 0 +
        //   generalformHomeGoals * 1) /
        //   1
      ), formHome
    );

    finalAwayGoals = await roundCustom(
      parseFloat(
        // XGAdjustedAwayGoals
        // formAway.goalsBasedOnAverages

        (experimentalAwayGoals + generalformAwayGoals + awayformAwayGoals + formAway.goalsBasedOnAverages) / 4

        // (XGAdjustedAwayGoals * 0 +
        //   formAway.goalsBasedOnAverages * 0 +
        //   awayformAwayGoals * 0 +
        //   generalformAwayGoals * 1) /
        //   1
      ), formAway
    );

    let total = parseInt(finalHomeGoals + finalAwayGoals);
    totalGoals = totalGoals + total;

    numberOfGames = numberOfGames + 1;

    if (finalHomeGoals < 0) {
      finalHomeGoals = 0;
    }

    if (finalAwayGoals < 0) {
      finalAwayGoals = 0;
    }
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
    // console.log(formHome.ConcededOverall);
    // console.log("homeCalculation");
    // console.log(homeCalculation);
    // console.log("defenceHome");
    // console.log("homeWeighting");
    // console.log(homeWeighting);
    // console.log("finalFinishingScoreHome");
    // console.log(formHome.finalFinishingScore);
    // console.log("XG conceded adjustment");
    // console.log(formHome.XGConcededAdjustment);

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
    // console.log(formAway.ConcededOverall);
    // console.log("awayCalculation");
    // console.log(awayCalculation);

    // console.log("awayWeighting");
    // console.log(awayWeighting);
    // console.log("finalFinishingScoreAway");
    // console.log(formAway.finalFinishingScore);
    // console.log("XG conceded adjustment");
    // console.log(formAway.XGConcededAdjustment);

    // console.log("FINAL HOME GOALS");
    // console.log(finalHomeGoals);

    // console.log("FINAL AWAY GOALS");
    // console.log(finalAwayGoals);

    // match.homePrediction = finalHomeGoals;
    // match.awayPrediction = finalAwayGoals;
    if (match.status === "suspended") {
      finalHomeGoals = "P";
      finalAwayGoals = "P";
    }
    return [finalHomeGoals, finalAwayGoals];
  } else {
    finalHomeGoals = "-";
    finalAwayGoals = "-";
  }

  return [finalHomeGoals, finalAwayGoals];
}

function getSuccessMeasure(fixtures) {
  let sum = 0;
  let roundedFigure;
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
var longShotTips = [];
var accumulatedOdds = 1;
let predictions = [];

export async function getScorePrediction(day, allLeagueData) {
  let radioSelected = parseInt(selectedOption);
  tips = [];
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

  let makePostRequest = false;

  await Promise.all(
    matches.map(async (match) => {
      // if there are no stored predictions, calculate them based on live data

      if (match) {
        switch (true) {
          case match.status === "!suspended":
            [match.goalsA, match.goalsB] = await calculateScore(
              match,
              index,
              divider,
              match.id,
              allLeagueData
            );
            makePostRequest = true;

            break;
          case match.status === "suspended" || match.status === "cancelled":
            match.goalsA = "P";
            match.goalsB = "P";
            break;
          default:
            [match.goalsA, match.goalsB] = await calculateScore(
              match,
              index,
              divider,
              match.id,
              allLeagueData
            );
            makePostRequest = true;
            break;
        }
      } else {
        [match.goalsA, match.goalsB] = await calculateScore(
          match,
          index,
          divider,
          match.id,
          allLeagueData
        );
      }

      match.predictionOutcome = "unknown";
      let predictionObject;
      let longShotPredictionObject;

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

      if (match.goalsA > match.goalsB && match.homeOdds >= 2.5) {
        if (match.status === "complete" && match.homeTeam === match.winner) {
          match.predictionOutcome = "Won";
        } else if (
          match.status === "complete" &&
          match.homeTeam !== match.winner
        ) {
          match.predictionOutcome = "Lost";
        }
        longShotPredictionObject = {
          team: match.homeTeam,
          odds: match.homeOdds,
          outcome: match.predictionOutcome,
        };
        longShotTips.push(longShotPredictionObject);
      } else if (match.goalsA < match.goalsB && match.awayOdds >= 2.5) {
        if (match.status === "complete" && match.awayTeam === match.winner) {
          match.predictionOutcome = "Won";
        } else if (
          match.status === "complete" &&
          match.awayTeam !== match.winner
        ) {
          match.predictionOutcome = "Lost";
        }
        longShotPredictionObject = {
          team: match.awayTeam,
          odds: match.awayOdds,
          outcome: match.predictionOutcome,
        };
        longShotTips.push(longShotPredictionObject);
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

      if (longShotTips.length > 0) {
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
      }
      predictions.push(match);
    })
  );

  await getSuccessMeasure(matches);
}

// async function postFixedPredictions(predictions, divider, day) {
//   await fetch(
//     `${process.env.REACT_APP_EXPRESS_SERVER}postPredictions${divider}${day}`, {
//       method: "POST",
//       headers: {
//         Accept: "application/json",
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ predictions }),
//     });
// }
