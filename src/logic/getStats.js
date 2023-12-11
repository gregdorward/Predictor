import ReactDOM from "react-dom";
import { Button } from "../components/Button";
import Stats from "../components/createStatsDiv";
import Div from "../components/Div";
import { allForm, allLeagueResultsArrayOfObjects } from "../logic/getFixtures";
import { getTeamStats } from "../logic/getTeamStats";
import { getPointsFromLastX } from "../logic/getScorePredictions";
import { CreateBadge } from "../components/createBadge";
import { Fragment } from "react";
import GenerateFormSummary from "../logic/compareFormTrend";
import { Chart, RadarChart, BarChart } from "../components/Chart";
import Collapsable from "../components/CollapsableElement";
import { clicked } from "../logic/getScorePredictions";

export async function calculateAttackingStrength(stats) {
  // Define weights for each metric (you can adjust these based on your preference)
  const weights = {
    // averagePossession: 0.15,
    "Average Dangerous Attacks": 0.15,
    "Average Shots": 0.1,
    "Average Shots On Target": 0.15,
    "Average Expected Goals": 0.15,
    "Recent XG": 0.15,
    "Average Goals": 0.3,
  };

  // Define the ranges for normalization
  const ranges = {
    // averagePossession: { min: 25, max: 75 },
    "Average Dangerous Attacks": { min: 30, max: 75 }, // Adjust the max value as needed
    "Average Shots": { min: 5, max: 17 }, // Adjust the max value as needed
    "Average Shots On Target": { min: 2, max: 9 }, // Adjust the max value as needed
    "Average Expected Goals": { min: 0, max: 3 }, // Adjust the max value as needed
    "Recent XG": { min: 0, max: 3 }, // Adjust the max value as needed
    "Average Goals": { min: 0, max: 3 }, // Adjust the max value as needed
  };

  // Normalize each metric value and calculate the weighted sum
  let weightedSum = 0;
  for (const metric in stats) {
    if (
      stats.hasOwnProperty(metric) &&
      weights.hasOwnProperty(metric) &&
      ranges.hasOwnProperty(metric)
    ) {
      const normalizedValue =
        (stats[metric] - ranges[metric].min) /
        (ranges[metric].max - ranges[metric].min);
      weightedSum += normalizedValue * weights[metric];
    } else {
      console.log(metric);
    }
  }

  return parseFloat(weightedSum.toFixed(2));
}

export async function calculateDefensiveStrength(stats) {
  // Define weights for each metric (you can adjust these based on your preference)
  const weights = {
    "Clean Sheet Percentage": 0.3,
    "Average XG Against": 0.2,
    "Recent XG Against": 0.2,
    "Average Goals Against": 0.3,
  };

  // Define the ranges for normalization
  const ranges = {
    "Clean Sheet Percentage": { min: 0, max: 100 },
    "Average XG Against": { min: 0, max: 3 }, // Adjust the max value as needed
    "Recent XG Against": { min: 0, max: 3 },
    "Average Goals Against": { min: 0, max: 3 }, // Adjust the max value as needed
  };

  // Normalize each metric value and calculate the weighted sum
  let weightedSum = 0;
  for (const metric in stats) {
    if (
      stats.hasOwnProperty(metric) &&
      weights.hasOwnProperty(metric) &&
      ranges.hasOwnProperty(metric)
    ) {
      const normalizedValue =
        1 -
        (stats[metric] - ranges[metric].min) /
          (ranges[metric].max - ranges[metric].min);
      weightedSum += normalizedValue * weights[metric];
    }
  }

  return parseFloat(weightedSum.toFixed(2));
}

export async function calculateMetricStrength(metricName, metricValue) {
  // Define weights for each metric (you can adjust these based on your preference)
  const weights = {
    averagePossession: 1,
    xgFor: 1,
    xgAgainst: 1,
    directnessOverall: 1,
    accuracyOverall: 1,
  };

  // Define the ranges for normalization
  const ranges = {
    averagePossession: { min: 20, max: 80 },
    xgFor: { min: 0.1, max: 3 },
    xgAgainst: { min: 0.1, max: 3 },
    directnessOverall: { min: 0.5, max: 4 },
    accuracyOverall: {min: 2, max: 10},
  };


  // Ensure the metric is valid and exists in the weights and ranges objects
  if (
    !weights.hasOwnProperty(metricName) ||
    !ranges.hasOwnProperty(metricName)
  ) {
    throw new Error("Invalid metric name or missing normalization range.");
  }

  // Normalize the metric value
  const normalizedValue =
    (metricValue - ranges[metricName].min) /
    (ranges[metricName].max - ranges[metricName].min);

  // Calculate the weighted score
  const weightedScore = normalizedValue * weights[metricName];

  return parseFloat(weightedScore.toFixed(2));
}

// export async function getDefenceStrength(goalsAgainst) {
//   let strength;
//   switch (true) {
//     case goalsAgainst >= 2.8:
//       strength = 1;
//       break;
//     case goalsAgainst >= 2.5 && goalsAgainst < 2.8:
//       strength = 2;
//       break;
//     case goalsAgainst >= 2.2 && goalsAgainst < 2.5:
//       strength = 3;
//       break;
//     case goalsAgainst >= 1.9 && goalsAgainst < 2.2:
//       strength = 4;
//       break;
//     case goalsAgainst >= 1.6 && goalsAgainst < 1.9:
//       strength = 5;
//       break;
//     case goalsAgainst >= 1.3 && goalsAgainst < 1.6:
//       strength = 6;
//       break;
//     case goalsAgainst >= 1 && goalsAgainst < 1.3:
//       strength = 7;
//       break;
//     case goalsAgainst >= 0.7 && goalsAgainst < 1:
//       strength = 8;
//       break;
//     case goalsAgainst >= 0.4 && goalsAgainst < 0.7:
//       strength = 9;
//       break;
//     case goalsAgainst < 0.4:
//       strength = 10;
//       break;
//     default:
//       break;
//   }
//   return strength;
// }

// export async function getPossessionStrength(possession) {
//   let strength;
//   switch (true) {
//     case possession >= 68:
//       strength = 10;
//       break;
//     case possession >= 64 && possession < 68:
//       strength = 9;
//       break;
//     case possession >= 60 && possession < 64:
//       strength = 8;
//       break;
//     case possession >= 56 && possession < 60:
//       strength = 7;
//       break;
//     case possession >= 52 && possession < 56:
//       strength = 6;
//       break;
//     case possession >= 48 && possession < 52:
//       strength = 5;
//       break;
//     case possession >= 44 && possession < 48:
//       strength = 4;
//       break;
//     case possession >= 40 && possession < 44:
//       strength = 3;
//       break;
//     case possession >= 35 && possession < 40:
//       strength = 2;
//       break;
//     case possession < 35:
//       strength = 1;
//       break;
//     default:
//       break;
//   }
//   return strength;
// }

// export async function getShotsStrength(Shots) {
//   let strength;
//   switch (true) {
//     case Shots >= 15:
//       strength = 10;
//       break;
//     case Shots >= 14.25 && Shots < 15:
//       strength = 9;
//       break;
//     case Shots >= 13.5 && Shots < 14.25:
//       strength = 8;
//       break;
//     case Shots >= 12.75 && Shots < 13.5:
//       strength = 7;
//       break;
//     case Shots >= 12 && Shots < 12.75:
//       strength = 6;
//       break;
//     case Shots >= 11.25 && Shots < 12:
//       strength = 5;
//       break;
//     case Shots >= 10.5 && Shots < 11.25:
//       strength = 4;
//       break;
//     case Shots >= 9.75 && Shots < 10.5:
//       strength = 3;
//       break;
//     case Shots >= 9 && Shots < 9.75:
//       strength = 2;
//       break;
//     case Shots < 9:
//       strength = 1;
//       break;
//     default:
//       break;
//   }
//   return strength;
// }

// export async function getShotsStrengthHorA(Shots) {
//   let strength;
//   switch (true) {
//     case Shots >= 19.5:
//       strength = 10;
//       break;
//     case Shots >= 18 && Shots < 19.5:
//       strength = 9;
//       break;
//     case Shots >= 17 && Shots < 18:
//       strength = 8;
//       break;
//     case Shots >= 15.5 && Shots < 17:
//       strength = 7;
//       break;
//     case Shots >= 14 && Shots < 15.5:
//       strength = 6;
//       break;
//     case Shots >= 12.5 && Shots < 14:
//       strength = 5;
//       break;
//     case Shots >= 11 && Shots < 12.5:
//       strength = 4;
//       break;
//     case Shots >= 9.5 && Shots < 11:
//       strength = 3;
//       break;
//     case Shots >= 8 && Shots < 9.5:
//       strength = 2;
//       break;
//     case Shots < 8:
//       strength = 1;
//       break;
//     default:
//       break;
//   }
//   return strength;
// }

// export async function getXGForStrength(XG) {
//   let strength;
//   switch (true) {
//     case XG >= 2.9:
//       strength = 10;
//       break;
//     case XG >= 2.6 && XG < 2.9:
//       strength = 9;
//       break;
//     case XG >= 2.3 && XG < 2.6:
//       strength = 8;
//       break;
//     case XG >= 2 && XG < 2.3:
//       strength = 7;
//       break;
//     case XG >= 1.7 && XG < 2:
//       strength = 6;
//       break;
//     case XG >= 1.4 && XG < 1.7:
//       strength = 5;
//       break;
//     case XG >= 1.1 && XG < 1.4:
//       strength = 4;
//       break;
//     case XG >= 0.8 && XG < 1.1:
//       strength = 3;
//       break;
//     case XG >= 0.5 && XG < 0.8:
//       strength = 2;
//       break;
//     case XG < 0.5:
//       strength = 1;
//       break;
//     default:
//       break;
//   }
//   return strength;
// }

// export async function getXGAgainstStrength(XGAgainst) {
//   let strength;
//   switch (true) {
//     case XGAgainst >= 2.9:
//       strength = 1;
//       break;
//     case XGAgainst >= 2.6 && XGAgainst < 2.9:
//       strength = 2;
//       break;
//     case XGAgainst >= 2.3 && XGAgainst < 2.6:
//       strength = 3;
//       break;
//     case XGAgainst >= 2 && XGAgainst < 2.3:
//       strength = 4;
//       break;
//     case XGAgainst >= 1.7 && XGAgainst < 2:
//       strength = 5;
//       break;
//     case XGAgainst >= 1.4 && XGAgainst < 1.7:
//       strength = 6;
//       break;
//     case XGAgainst >= 1.1 && XGAgainst < 1.4:
//       strength = 7;
//       break;
//     case XGAgainst >= 0.8 && XGAgainst < 1.1:
//       strength = 8;
//       break;
//     case XGAgainst >= 0.5 && XGAgainst < 0.8:
//       strength = 9;
//       break;
//     case XGAgainst < 0.5:
//       strength = 10;
//       break;
//     default:
//       break;
//   }
//   return strength;
// }

// export async function getXGDifferentialStrength(XGDiff) {
//   let strength;
//   switch (true) {
//     case XGDiff >= 1.5:
//       strength = 10;
//       break;
//     case XGDiff >= 1 && XGDiff < 1.5:
//       strength = 9;
//       break;
//     case XGDiff >= 0.5 && XGDiff < 1:
//       strength = 8;
//       break;
//     case XGDiff >= 0.25 && XGDiff < 0.5:
//       strength = 7;
//       break;
//     case XGDiff > 0 && XGDiff < 0.25:
//       strength = 6;
//       break;
//     case XGDiff <= 0 && XGDiff > -0.25:
//       strength = 5;
//       break;
//     case XGDiff <= -0.25 && XGDiff > -0.5:
//       strength = 4;
//       break;
//     case XGDiff <= -0.5 && XGDiff > -1:
//       strength = 3;
//       break;
//     case XGDiff <= -1 && XGDiff > -1.5:
//       strength = 2;
//       break;
//     case XGDiff <= -1.5:
//       strength = 1;
//       break;
//     default:
//       console.log("default clause triggered");
//       break;
//   }
//   return strength;
// }

export async function getXGtoActualDifferentialStrength(XGDiff) {
  let strength;
  switch (true) {
    case XGDiff >= 1.5:
      strength = 1;
      break;
    case XGDiff >= 1 && XGDiff < 1.5:
      strength = 2;
      break;
    case XGDiff >= 0.5 && XGDiff < 1:
      strength = 3;
      break;
    case XGDiff >= 0.25 && XGDiff < 0.5:
      strength = 4;
      break;
    case XGDiff > 0 && XGDiff < 0.25:
      strength = 5;
      break;
    case XGDiff <= 0 && XGDiff > -0.25:
      strength = 6;
      break;
    case XGDiff <= -0.25 && XGDiff > -0.5:
      strength = 7;
      break;
    case XGDiff <= -0.5 && XGDiff > -1:
      strength = 8;
      break;
    case XGDiff <= -1 && XGDiff > -1.5:
      strength = 9;
      break;
    case XGDiff <= -1.5:
      strength = 10;
      break;
    default:
      console.log("default clause triggered");
      break;
  }
  return strength;
}

async function diff(a, b) {
  return parseFloat(a - b).toFixed(2);
}

let rollingGoalDiffTotalHome = [];
let rollingGoalDiffTotalAway = [];

export async function createStatsDiv(game, displayBool) {
  console.log(displayBool);
  if (game.status !== "void") {
    // takes the displayBool boolean from the fixture onClick and sets the styling of the stats div from there
    function styling(testBool) {
      let bool = testBool;
      if (bool === true && clicked === true) {
        // set stats element to display flex
        return { display: "block" };
      } else {
        // set stats element to display none
        return { display: "none" };
      }
    }
    let style = styling(displayBool);

    if (clicked === false) {
      alert("Tap Get Predictions to fetch all game stats first");
    } else {
      let index = 2;
      let divider = 10;

      let gameStats = allForm.find((match) => match.id === game.id);
      const gameArrayHome = [];
      const gameArrayAway = [];
      const gameArrayHomeTeamHomeGames = [];
      const gameArrayAwayTeamAwayGames = [];
      let goalDiffArrayHome;
      let goalDiffArrayAway;
      let goalDiffHomeMovingAv = [];
      let goalDiffAwayMovingAv = [];
      let latestHomeGoalDiff;
      let latestAwayGoalDiff;

      var getEMA = (a, r) =>
        a.reduce(
          (p, n, i) =>
            i
              ? p.concat(
                  (2 * n) / (r + 1) + (p[p.length - 1] * (r - 1)) / (r + 1)
                )
              : p,
          [a[0]]
        );

      if (displayBool === true) {
        let fixtures = await fetch(
          `${process.env.REACT_APP_EXPRESS_SERVER}leagueFixtures/${gameStats.leagueId}`
        );

        await fixtures.json().then((matches) => {
          const resultHome = matches.data.filter(
            (game) =>
              (game.homeID === gameStats.teamIDHome ||
                game.awayID === gameStats.teamIDHome) &&
              game.status === "complete"
          );

          const resultHomeOnly = matches.data.filter(
            (game) =>
              game.homeID === gameStats.teamIDHome && game.status === "complete"
          );

          resultHomeOnly.sort((a, b) => b.date_unix - a.date_unix);

          for (let i = 0; i < resultHome.length; i++) {
            let unixTimestamp = resultHome[i].date_unix;
            let milliseconds = unixTimestamp * 1000;
            let dateObject = new Date(milliseconds).toLocaleString("en-GB", {
              timeZone: "UTC",
            });

            let won;
            let goalsScored;
            let goalsConceeded;

            if (resultHome[i].winningTeam === gameStats.teamIDHome) {
              won = "W";
              if (resultHome[i].homeGoalCount > resultHome[i].awayGoalCount) {
                goalsScored = resultHome[i].homeGoalCount;
                goalsConceeded = resultHome[i].awayGoalCount;
              } else {
                goalsScored = resultHome[i].awayGoalCount;
                goalsConceeded = resultHome[i].homeGoalCount;
              }
            } else if (resultHome[i].winningTeam === -1) {
              won = "D";
              goalsScored = resultHome[i].awayGoalCount;
              goalsConceeded = resultHome[i].awayGoalCount;
            } else {
              won = "L";
              if (resultHome[i].homeGoalCount > resultHome[i].awayGoalCount) {
                goalsScored = resultHome[i].awayGoalCount;
                goalsConceeded = resultHome[i].homeGoalCount;
              } else {
                goalsScored = resultHome[i].homeGoalCount;
                goalsConceeded = resultHome[i].awayGoalCount;
              }
            }

            gameArrayHome.push({
              id: resultHome[i].id,
              date: dateObject,
              homeTeam: resultHome[i].home_name,
              homeGoals: resultHome[i].homeGoalCount,
              homeXG: resultHome[i].team_a_xg,
              homeOdds: resultHome[i].odds_ft_1,
              awayTeam: resultHome[i].away_name,
              awayGoals: resultHome[i].awayGoalCount,
              awayXG: resultHome[i].team_b_xg,
              awayOdds: resultHome[i].odds_ft_2,
              won: won,
              homeShots: resultHome[i].team_a_shots,
              awayShots: resultHome[i].team_b_shots,
              homeSot: resultHome[i].team_a_shotsOnTarget,
              awaySot: resultHome[i].team_b_shotsOnTarget,
              homeRed: resultHome[i].team_a_red_cards,
              awayRed: resultHome[i].team_b_red_cards,
              homePossession: resultHome[i].team_a_possession,
              awayPossession: resultHome[i].team_b_possession,
              homeDangerousAttacks: resultHome[i].team_a_dangerous_attacks,
              awayDangerousAttacks: resultHome[i].team_b_dangerous_attacks,
              homePPG: resultHome[i].pre_match_teamA_overall_ppg,
              awayPPG: resultHome[i].pre_match_teamB_overall_ppg,
              unixTimestamp: resultHome[i].date_unix,
              goalsFor: goalsScored,
              goalsAgainst: goalsConceeded,
              btts: resultHome[i].btts === true ? "\u2714" : "\u2718",
            });
          }

          for (let i = 0; i < resultHomeOnly.length; i++) {
            let wonHomeOrAwayOnly;

            if (resultHomeOnly[i].winningTeam === gameStats.teamIDHome) {
              wonHomeOrAwayOnly = "W";
              gameArrayHomeTeamHomeGames.push(wonHomeOrAwayOnly);
            } else if (resultHomeOnly[i].winningTeam === -1) {
              wonHomeOrAwayOnly = "D";
              gameArrayHomeTeamHomeGames.push(wonHomeOrAwayOnly);
            } else {
              wonHomeOrAwayOnly = "L";
              gameArrayHomeTeamHomeGames.push(wonHomeOrAwayOnly);
            }
          }

          goalDiffArrayHome = gameArrayHome.map(
            (a) => a.goalsFor - a.goalsAgainst
          );

          let r = 5;

          goalDiffHomeMovingAv = getEMA(
            goalDiffArrayHome,
            goalDiffArrayHome.length < 5 ? goalDiffArrayHome.length : r
          );

          const cumulativeSumHome = (
            (sum) => (value) =>
              (sum += value)
          )(0);

          gameArrayHome.sort((a, b) => b.unixTimestamp - a.unixTimestamp);

          rollingGoalDiffTotalHome = goalDiffArrayHome.map(cumulativeSumHome);

          const resultAway = matches.data.filter(
            (game) =>
              (game.homeID === gameStats.teamIDAway ||
                game.awayID === gameStats.teamIDAway) &&
              game.status === "complete"
          );

          const resultAwayOnly = matches.data.filter(
            (game) =>
              game.awayID === gameStats.teamIDAway && game.status === "complete"
          );

          resultAwayOnly.sort((a, b) => b.date_unix - a.date_unix);

          for (let i = 0; i < resultAway.length; i++) {
            let unixTimestamp = resultAway[i].date_unix;
            let milliseconds = unixTimestamp * 1000;
            let dateObject = new Date(milliseconds).toLocaleString("en-GB", {
              timeZone: "UTC",
            });

            let won;
            let goalsScored;
            let goalsConceeded;
            let wonHomeOrAwayOnly;
            let goalsScoredHomeOrAwayOnly;
            let goalsConceededHomeOrAwayOnly;

            if (resultAway[i].winningTeam === gameStats.teamIDAway) {
              won = "W";
              if (resultAway[i].homeGoalCount > resultAway[i].awayGoalCount) {
                goalsScored = resultAway[i].homeGoalCount;
                goalsConceeded = resultAway[i].awayGoalCount;
              } else {
                goalsScored = resultAway[i].awayGoalCount;
                goalsConceeded = resultAway[i].homeGoalCount;
              }
            } else if (resultAway[i].winningTeam === -1) {
              won = "D";
              goalsScored = resultAway[i].awayGoalCount;
              goalsConceeded = resultAway[i].awayGoalCount;
            } else {
              won = "L";
              if (resultAway[i].homeGoalCount > resultAway[i].awayGoalCount) {
                goalsScored = resultAway[i].awayGoalCount;
                goalsConceeded = resultAway[i].homeGoalCount;
              } else {
                goalsScored = resultAway[i].homeGoalCount;
                goalsConceeded = resultAway[i].awayGoalCount;
              }
            }

            gameArrayAway.push({
              id: resultAway[i].id,
              date: dateObject,
              homeTeam: resultAway[i].home_name,
              homeGoals: resultAway[i].homeGoalCount,
              homeXG: resultAway[i].team_a_xg,
              homeOdds: resultAway[i].odds_ft_1,
              awayTeam: resultAway[i].away_name,
              awayGoals: resultAway[i].awayGoalCount,
              awayXG: resultAway[i].team_b_xg,
              awayOdds: resultAway[i].odds_ft_2,
              won: won,
              homeShots: resultAway[i].team_a_shots,
              awayShots: resultAway[i].team_b_shots,
              homeSot: resultAway[i].team_a_shotsOnTarget,
              awaySot: resultAway[i].team_b_shotsOnTarget,
              homeRed: resultAway[i].team_a_red_cards,
              awayRed: resultAway[i].team_b_red_cards,
              homePossession: resultAway[i].team_a_possession,
              awayPossession: resultAway[i].team_b_possession,
              homeDangerousAttacks: resultAway[i].team_a_dangerous_attacks,
              awayDangerousAttacks: resultAway[i].team_b_dangerous_attacks,
              homePPG: resultAway[i].pre_match_teamA_overall_ppg,
              awayPPG: resultAway[i].pre_match_teamB_overall_ppg,
              unixTimestamp: resultAway[i].date_unix,
              goalsFor: goalsScored,
              goalsAgainst: goalsConceeded,
              btts: resultAway[i].btts === true ? "\u2714" : "\u2718",
            });
          }

          for (let i = 0; i < resultAwayOnly.length; i++) {
            let wonHomeOrAwayOnly;

            if (resultAwayOnly[i].winningTeam === gameStats.teamIDAway) {
              wonHomeOrAwayOnly = "W";
              gameArrayAwayTeamAwayGames.push(wonHomeOrAwayOnly);
            } else if (resultAwayOnly[i].winningTeam === -1) {
              wonHomeOrAwayOnly = "D";
              gameArrayAwayTeamAwayGames.push(wonHomeOrAwayOnly);
            } else {
              wonHomeOrAwayOnly = "L";
              gameArrayAwayTeamAwayGames.push(wonHomeOrAwayOnly);
            }
          }

          goalDiffArrayAway = gameArrayAway.map(
            (a) => a.goalsFor - a.goalsAgainst
          );

          goalDiffAwayMovingAv = getEMA(
            goalDiffArrayAway,
            goalDiffArrayAway.length < 5 ? goalDiffArrayAway.length : r
          );

          const cumulativeSumAway = (
            (sum) => (value) =>
              (sum += value)
          )(0);

          gameArrayAway.sort((a, b) => b.unixTimestamp - a.unixTimestamp);

          rollingGoalDiffTotalAway = goalDiffArrayAway.map(cumulativeSumAway);

          latestHomeGoalDiff =
            goalDiffHomeMovingAv[goalDiffHomeMovingAv.length - 1];
          latestAwayGoalDiff =
            goalDiffAwayMovingAv[goalDiffAwayMovingAv.length - 1];
        });
      }

      const bttsArrayHome = Array.from(gameArrayHome, (x) => x.btts);
      const bttsArrayAway = Array.from(gameArrayAway, (x) => x.btts);
      const resultsArrayHome = Array.from(gameArrayHome, (x) => x.won);
      const resultsArrayAway = Array.from(gameArrayAway, (x) => x.won);

      let homeTeam = gameStats.home.teamName;
      let awayTeam = gameStats.away.teamName;

      let time = game.time;

      const homeForm = gameStats.home[index];
      const awayForm = gameStats.away[index];

      if (homeForm.last3Points === undefined) {
        homeForm.last3Points = getPointsFromLastX(homeForm.lastThreeForm);

        homeForm.last5Points = getPointsFromLastX(homeForm.LastFiveForm);

        homeForm.last6Points = getPointsFromLastX(homeForm.LastSixForm);

        homeForm.last10Points = getPointsFromLastX(homeForm.LastTenForm);

        awayForm.last3Points = getPointsFromLastX(awayForm.lastThreeForm);

        awayForm.last5Points = getPointsFromLastX(awayForm.LastFiveForm);

        awayForm.last6Points = getPointsFromLastX(awayForm.LastSixForm);

        awayForm.last10Points = getPointsFromLastX(awayForm.LastTenForm);
      }

      async function getPointAverage(pointTotal, games) {
        return pointTotal / games;
      }

      // let homeThreeGameAverage = await getPointAverage(
      //   homeForm.last3Points,
      //   3
      // );

      let homeFiveGameAverage = await getPointAverage(homeForm.last5Points, 5);

      let homeSixGameAverage = await getPointAverage(homeForm.last6Points, 6);

      let homeTenGameAverage = await getPointAverage(homeForm.last10Points, 10);

      // let awayThreeGameAverage = await getPointAverage(
      //   awayForm.last3Points,
      //   3
      // );

      let awayFiveGameAverage = await getPointAverage(awayForm.last5Points, 5);

      let awaySixGameAverage = await getPointAverage(awayForm.last6Points, 6);

      let awayTenGameAverage = await getPointAverage(awayForm.last10Points, 10);

      async function getPointsFromGames(formArr) {
        const pairings = {
          W: 3,
          D: 1,
          L: 0,
        };
        let newArr = [];
        let arrayOfIndividualPoints = [];
        let sum = 0;

        for (let i = 0; i < formArr.length; i++) {
          sum = sum + pairings[formArr[i]];
          newArr.push(sum);
          arrayOfIndividualPoints.push(pairings[formArr[i]]);
        }
        return [newArr, arrayOfIndividualPoints];
      }

      async function getLastGameResult(lastGame) {
        let text;
        switch (true) {
          case lastGame === "L":
            text = "Lost";
            break;
          case lastGame === "D":
            text = "Drew";
            break;
          case lastGame === "W":
            text = "Won";
            break;
          default:
            break;
        }
        return text;
      }

      let homeFormTrend = [
        homeFiveGameAverage.toFixed(2),
        homeTenGameAverage.toFixed(2),
      ];

      let awayFormTrend = [
        awayFiveGameAverage.toFixed(2),
        awayTenGameAverage.toFixed(2),
      ];

      let formTextStringHome;
      let formTextStringAway;

      if (displayBool === true && gameStats.home[2].LeagueOrAll === "League") {
        formTextStringHome = await GenerateFormSummary(
          gameStats.home[2],
          homeFormTrend,
          gameStats.home[0]
        );
        formTextStringAway = await GenerateFormSummary(
          gameStats.away[2],
          awayFormTrend,
          gameStats.away[0]
        );
      } else {
        formTextStringHome = "";
        formTextStringAway = "";
      }

      let homeLastGame = await getLastGameResult(homeForm.LastFiveForm[4]);
      let awayLastGame = await getLastGameResult(awayForm.LastFiveForm[4]);

      // let homeAttackStrength = await getAttackStrength(
      //   homeForm.ScoredOverall / 10
      // );

      const attackingMetricsHome = {
        // averagePossession: homeForm.AveragePossessionOverall,
        "Average Dangerous Attacks": homeForm.AverageDangerousAttacksOverall,
        "Average Shots": homeForm.AverageShots,
        "Average Shots On Target": homeForm.AverageShotsOnTargetOverall,
        "Average Expected Goals": homeForm.XGOverall,
        "Recent XG": homeForm.XGlast5 ? homeForm.XGlast5 : homeForm.XGOverall,
        "Average Goals":
          homeForm.averageScoredLeague !== undefined &&
          homeForm.averageScoredLeague !== null
            ? homeForm.averageScoredLeague
            : homeForm.ScoredOverall / 10,
      };
      const attackingMetricsAway = {
        // averagePossession: awayForm.AveragePossessionOverall,
        "Average Dangerous Attacks": awayForm.AverageDangerousAttacksOverall,
        "Average Shots": awayForm.AverageShots,
        "Average Shots On Target": awayForm.AverageShotsOnTargetOverall,
        "Average Expected Goals": awayForm.XGOverall,
        "Recent XG": awayForm.XGlast5 ? awayForm.XGlast5 : awayForm.XGOverall,
        "Average Goals":
          awayForm.averageScoredLeague !== undefined &&
          awayForm.averageScoredLeague !== null
            ? awayForm.averageScoredLeague
            : awayForm.ScoredOverall / 10,
      };

      const defensiveMetricsHome = {
        "Clean Sheet Percentage": 100 - homeForm.CleanSheetPercentage,
        "Average XG Against": homeForm.XGAgainstAvgOverall,
        "Recent XG Against": homeForm.XGAgainstlast5
          ? homeForm.XGAgainstlast5
          : homeForm.XGAgainstAvgOverall,
        "Average Goals Against":
          homeForm.averageConceededLeague !== undefined &&
          homeForm.averageConceededLeague !== null
            ? homeForm.averageConceededLeague
            : homeForm.ConcededOverall / 10,
      };

      const defensiveMetricsAway = {
        "Clean Sheet Percentage": 100 - awayForm.CleanSheetPercentage,
        "Average XG Against": awayForm.XGAgainstAvgOverall,
        "Recent XG Against": awayForm.XGAgainstlast5
          ? awayForm.XGAgainstlast5
          : awayForm.XGAgainstAvgOverall,
        "Average Goals Against":
          awayForm.averageConceededLeague !== undefined &&
          awayForm.averageConceededLeague !== null
            ? awayForm.averageConceededLeague
            : awayForm.ConcededOverall / 10,
      };

      let homeAttackStrength;
      let homeDefenceStrength;
      let homePossessionStrength;
      let homeXGForStrength;
      let homeXGAgainstStrength;
      let awayAttackStrength;
      let awayDefenceStrength;
      let awayPossessionStrength;
      let awayXGForStrength;
      let awayXGAgainstStrength;
      let homeDirectnessStrength;
      let awayDirectnessStrength;
      let homeAccuracyOverallStrength;
      let awayAccuracyOverallStrength;

      if (homeForm.xgForStrength) {
        console.log("not calculating");
        homeAttackStrength = homeForm.attackingStrength;
        homeDefenceStrength = homeForm.defensiveStrength;
        homePossessionStrength = homeForm.possessionStrength;
        homeXGForStrength = homeForm.xgForStrength;
        homeXGAgainstStrength = homeForm.xgAgainstStrength;
        homeDirectnessStrength = homeForm.directnessOverallStrength;
        homeAccuracyOverallStrength = homeForm.accuracyOverallStrength;

        awayAttackStrength = awayForm.attackingStrength;
        awayDefenceStrength = awayForm.defensiveStrength;
        awayPossessionStrength = awayForm.possessionStrength;
        awayXGForStrength = awayForm.xgForStrength;
        awayXGAgainstStrength = awayForm.xgAgainstStrength;
        awayDirectnessStrength = awayForm.directnessOverallStrength;
        awayAccuracyOverallStrength = awayForm.accuracyOverallStrength;
      } else {
        homeAttackStrength = await calculateAttackingStrength(
          attackingMetricsHome
        );

        homeDefenceStrength = await calculateDefensiveStrength(
          defensiveMetricsHome
        );

        homePossessionStrength = await calculateMetricStrength(
          "averagePossession",
          homeForm.AveragePossessionOverall
        );

        homeXGForStrength = await calculateMetricStrength(
          "xgFor",
          gameStats.home[2].XGOverall
        );

        homeXGAgainstStrength = await calculateMetricStrength(
          "xgAgainst",
          3 - gameStats.home[2].XGAgainstAvgOverall
        );
        homeDirectnessStrength = await calculateMetricStrength(
          "directnessOverall",
          homeForm.directnessOverall
        );
        homeAccuracyOverallStrength = await calculateMetricStrength(
          "accuracyOverall",
          homeForm.shootingAccuracy
        );

        awayAttackStrength = await calculateAttackingStrength(
          attackingMetricsAway
        );
        awayDefenceStrength = await calculateDefensiveStrength(
          defensiveMetricsAway
        );
        awayPossessionStrength = await calculateMetricStrength(
          "averagePossession",
          awayForm.AveragePossessionOverall
        );
        awayXGForStrength = await calculateMetricStrength(
          "xgFor",
          gameStats.away[2].XGOverall
        );

        awayXGAgainstStrength = await calculateMetricStrength(
          "xgAgainst",
          3 - gameStats.away[2].XGAgainstAvgOverall
        );
        awayDirectnessStrength = await calculateMetricStrength(
          "directnessOverall",
          awayForm.directnessOverall
        );
        awayAccuracyOverallStrength = await calculateMetricStrength(
          "accuracyOverall",
          awayForm.shootingAccuracy
        );
      }

      let [formPointsHome, testArrayHome] = await getPointsFromGames(
        gameStats.home[2].WDLRecord
      );
      let [formPointsAway, testArrayAway] = await getPointsFromGames(
        gameStats.away[2].WDLRecord
      );

      let rollingGoalDiffHome = [
        (gameStats.home[0].ScoredOverall - gameStats.home[0].ConcededOverall) /
          10,
        (gameStats.home[1].ScoredOverall - gameStats.home[1].ConcededOverall) /
          6,
        (gameStats.home[2].ScoredOverall - gameStats.home[2].ConcededOverall) /
          5,
      ];

      let rollingGoalDiffAway = [
        (gameStats.away[0].ScoredOverall - gameStats.away[0].ConcededOverall) /
          10,
        (gameStats.away[1].ScoredOverall - gameStats.away[1].ConcededOverall) /
          6,
        (gameStats.away[2].ScoredOverall - gameStats.away[2].ConcededOverall) /
          5,
      ];

      const formDataMatch = [];

      formDataMatch.push({
        btts: game.btts_potential,
      });

      const formDataHome = [];

      formDataHome.push({
        name: game.homeTeam,
        Last5: gameStats.home[2].LastFiveForm,
        LeagueOrAll: gameStats.home[2].LeagueOrAll,
        AverageGoals: homeForm.ScoredOverall / 10,
        AverageConceeded: homeForm.ConcededOverall / 10,
        AverageXG: homeForm.XGOverall,
        AverageXGConceded: homeForm.XGAgainstAvgOverall,
        AveragePossession: homeForm.AveragePossessionOverall,
        AverageShotsOnTarget: homeForm.AverageShotsOnTargetOverall,
        AverageDangerousAttacks: homeForm.AverageDangerousAttacksOverall,
        homeOrAway: "Home",
        leaguePosition: homeForm.LeaguePosition,
        Last5PPG: homeForm.PPG,
        SeasonPPG: homeForm.SeasonPPG,
        lastGame: homeLastGame,
        formRun: homeForm.formRun,
        goalDifference: homeForm.goalDifference,
        goalDifferenceHomeOrAway: homeForm.goalDifferenceHomeOrAway,
        // BttsPercentage: homeForm.BttsPercentage || "-",
        // BttsPercentageHomeOrAway: homeForm.BttsPercentageHomeOrAway || "-",
        CardsTotal: homeForm.CardsTotal || "-",
        CornersAverage: homeForm.AverageCorners || "-",
        FormTextStringHome: formTextStringHome,
        BTTSArray: bttsArrayHome,
        Results: resultsArrayHome,
        // BTTSAll: homeForm.last10btts,
        // BTTSHorA: homeForm.last10bttsHome,
      });

      const formDataAway = [];

      formDataAway.push({
        name: game.awayTeam,
        Last5: gameStats.away[2].LastFiveForm,
        LeagueOrAll: gameStats.away[2].LeagueOrAll,
        AverageGoals: awayForm.ScoredOverall / 10,
        AverageConceeded: awayForm.ConcededOverall / 10,
        AverageXG: awayForm.XGOverall,
        AverageXGConceded: awayForm.XGAgainstAvgOverall,
        AveragePossession: awayForm.AveragePossessionOverall,
        AverageShotsOnTarget: awayForm.AverageShotsOnTargetOverall,
        AverageDangerousAttacks: awayForm.AverageDangerousAttacksOverall,
        homeOrAway: "Away",
        leaguePosition: awayForm.LeaguePosition,
        Last5PPG: awayForm.PPG,
        SeasonPPG: awayForm.SeasonPPG,
        lastGame: awayLastGame,
        formRun: awayForm.formRun,
        goalDifference: awayForm.goalDifference,
        goalDifferenceHomeOrAway: awayForm.goalDifferenceHomeOrAway,
        // BttsPercentage: awayForm.BttsPercentage || "-",
        // BttsPercentageHomeOrAway: awayForm.BttsPercentageHomeOrAway || "-",
        CardsTotal: awayForm.CardsTotal || "-",
        CornersAverage: awayForm.AverageCorners || "-",
        FormTextStringAway: formTextStringAway,
        BTTSArray: bttsArrayAway,
        Results: resultsArrayAway,
        ResultsHomeOrAway: resultsArrayAway,
        // BTTSAll: awayForm.last10btts,
        // BTTSHorA: awayForm.last10bttsAway,
      });

      let formArrayHome;
      let formArrayAway;
      let chartType;

      if (formPointsHome.length > 1) {
        formArrayHome = formPointsHome;
        formArrayAway = formPointsAway;
        chartType = "Points over time";
      } else {
        formArrayHome = [
          homeTenGameAverage,
          homeSixGameAverage,
          homeFiveGameAverage,
        ];
        formArrayAway = [
          awayTenGameAverage,
          awaySixGameAverage,
          awayFiveGameAverage,
        ];
        chartType = "Rolling average points over last 10";
      }

      ReactDOM.render(
        <div style={style}>
          <div className="H2HStats" id={`H2HStats${game.id}`}></div>
          <div className="TrendsHome" id={`TrendsHome${game.id}`}></div>
          <div className="TrendsAway" id={`TrendsAway${game.id}`}></div>
        </div>,
        document.getElementById("history" + homeTeam)
      );

      //This tournament does not have league positions
      if (game.leagueName === "Europe UEFA Women's Euro") {
        game.homeTeamHomePosition = "N/A";
        game.awayTeamAwayPosition = "N/A";
      }

      function singleResult(game) {
        return (
          <div>
            <div className="ResultRowSmall">
              <span className="column">{game.homeXG}</span>
              <span className="column">XG</span>
              <span className="column">{game.awayXG}</span>
            </div>
            <div className="ResultRowSmall">
              <span className="column">{game.homeShots}</span>
              <span className="column">Shots</span>
              <span className="column">{game.awayShots}</span>
            </div>
            <div className="ResultRowSmall">
              <span className="column">{game.homeSot}</span>
              <span className="column">SOT</span>
              <span className="column">{game.awaySot}</span>
            </div>
            <div className="ResultRowSmall">
              <span className="column">{game.homeDangerousAttacks}</span>
              <span className="column">Dangerous Attacks</span>
              <span className="column">{game.awayDangerousAttacks}</span>
            </div>
            <div className="ResultRowSmall">
              <span className="column">{game.homePossession}%</span>
              <span className="column">Possession</span>
              <span className="column">{game.awayPossession}%</span>
            </div>
            <div className="ResultRowSmall">
              <span className="column">{game.homeRed}</span>
              <span className="column">Red cards</span>
              <span className="column">{game.awayRed}</span>
            </div>
            <div className="ResultRowSmall">
              <span className="column">{game.homePPG}</span>
              <span className="column">PPG (pre-match)</span>
              <span className="column">{game.awayPPG}</span>
            </div>
          </div>
        );
      }

      const overviewHome = gameArrayHome.slice(0, 10).map((game) => (
        <div>
          <Collapsable
            classNameButton="ResultButton"
            buttonText={
              <div className="ResultRowOverviewSmall">
                <div className="columnOverviewHomeSmall">{game.homeTeam}</div>
                <span className="columnOverviewScoreSmall">
                  {game.homeGoals} : {game.awayGoals}
                </span>
                <div className="columnOverviewAwaySmall">{game.awayTeam}</div>
              </div>
            }
            element={singleResult(game)}
          />
        </div>
      ));

      const overviewAway = gameArrayAway.slice(0, 10).map((game) => (
        <div>
          <Collapsable
            classNameButton="ResultButton"
            buttonText={
              <div className="ResultRowOverviewSmall">
                <div className="columnOverviewHomeSmall">{game.homeTeam}</div>
                <span className="columnOverviewScoreSmall">
                  {game.homeGoals} : {game.awayGoals}
                </span>
                <div className="columnOverviewAwaySmall">{game.awayTeam}</div>
              </div>
            }
            element={singleResult(game)}
          />
        </div>
      ));

      function StatsHome() {
        return (
          <div className="flex-childOne">
            <ul style={style}>
              <Stats
                style={style}
                homeOrAway="Home"
                gameCount={divider}
                key={formDataHome[0].name}
                last5={formDataHome[0].Last5}
                homeOrAwayResults={gameArrayHomeTeamHomeGames}
                LeagueOrAll={formDataHome[0].LeagueOrAll}
                className={"KeyStatsHome"}
                name={formDataHome[0].name}
                goals={
                  homeForm.averageScoredLeague !== undefined &&
                  homeForm.averageScoredLeague !== null
                    ? homeForm.averageScoredLeague.toFixed(2)
                    : formDataHome[0].AverageGoals
                }
                conceeded={
                  homeForm.averageConceededLeague !== undefined &&
                  homeForm.averageConceededLeague !== null
                    ? homeForm.averageConceededLeague.toFixed(2)
                    : formDataHome[0].AverageConceeded
                }
                XG={formDataHome[0].AverageXG}
                XGConceded={formDataHome[0].AverageXGConceded}
                possession={formDataHome[0].AveragePossession}
                sot={formDataHome[0].AverageShotsOnTarget}
                dangerousAttacks={formDataHome[0].AverageDangerousAttacks}
                leaguePosition={
                  formDataHome[0].leaguePosition
                    ? formDataHome[0].leaguePosition
                    : 0
                }
                rawPosition={game.homeRawPosition ? game.homeRawPosition : 0}
                homeOrAwayLeaguePosition={
                  game.homeTeamHomePosition ? game.homeTeamHomePosition : 0
                }
                winPercentage={
                  game.homeTeamWinPercentage ? game.homeTeamWinPercentage : 0
                }
                lossPercentage={
                  game.homeTeamLossPercentage ? game.homeTeamLossPercentage : 0
                }
                drawPercentage={
                  game.homeTeamDrawPercentage ? game.homeTeamDrawPercentage : 0
                }
                ppg={formDataHome[0].SeasonPPG}
                formTrend={[
                  homeTenGameAverage.toFixed(2),
                  homeSixGameAverage.toFixed(2),
                  homeFiveGameAverage.toFixed(2),
                ]}
                lastGame={homeLastGame}
                formRun={formDataHome[0].formRun}
                goalDifference={formDataHome[0].goalDifference}
                goalDifferenceHomeOrAway={
                  formDataHome[0].goalDifferenceHomeOrAway
                }
                BttsPercentage={formDataHome[0].BttsPercentage}
                BttsPercentageHomeOrAway={
                  formDataHome[0].BttsPercentageHomeOrAway
                }
                // BTTSAll={
                //   formDataHome[0].BTTSAll
                //     ? formDataHome[0].BTTSAll
                //     : '"Get Predictions" first'
                // }
                // BTTSHorA={
                //   formDataHome[0].BTTSHorA
                //     ? formDataHome[0].BTTSHorA
                //     : '"Get Predictions" first'
                // }
                BTTSArray={formDataHome[0].BTTSArray}
                Results={formDataHome[0].Results}
                ResultsHomeOrAway={formDataHome[0].wonHomeOrAwayOnly}
                CardsTotal={formDataHome[0].CardsTotal}
                CornersAverage={formDataHome[0].CornersAverage}
                ScoredBothHalvesPercentage={
                  formDataHome[0].ScoredBothHalvesPercentage
                }
                FormTextString={formDataHome[0].FormTextStringHome}
              />
            </ul>
          </div>
        );
      }

      function StatsAway() {
        return (
          <div className="flex-childTwo">
            <ul style={style}>
              <Stats
                style={style}
                homeOrAway="Away"
                gameCount={divider}
                key={formDataAway[0].name}
                last5={formDataAway[0].Last5}
                homeOrAwayResults={gameArrayAwayTeamAwayGames}
                LeagueOrAll={formDataAway[0].LeagueOrAll}
                className={"KeyStatsAway"}
                name={formDataAway[0].name}
                goals={
                  awayForm.averageScoredLeague !== undefined &&
                  awayForm.averageScoredLeague !== null
                    ? awayForm.averageScoredLeague.toFixed(2)
                    : formDataAway[0].AverageGoals
                }
                conceeded={
                  awayForm.averageConceededLeague !== undefined &&
                  awayForm.averageConceededLeague !== null
                    ? awayForm.averageConceededLeague.toFixed(2)
                    : formDataAway[0].AverageConceeded
                }
                XG={formDataAway[0].AverageXG}
                XGConceded={formDataAway[0].AverageXGConceded}
                //todo add goal diff and btts percentages
                possession={formDataAway[0].AveragePossession}
                rawPosition={game.awayRawPosition ? game.awayRawPosition : 0}
                sot={formDataAway[0].AverageShotsOnTarget}
                dangerousAttacks={formDataAway[0].AverageDangerousAttacks}
                leaguePosition={
                  formDataAway[0].leaguePosition
                    ? formDataAway[0].leaguePosition
                    : 0
                }
                homeOrAwayLeaguePosition={
                  game.awayTeamAwayPosition ? game.awayTeamAwayPosition : 0
                }
                winPercentage={
                  game.awayTeamWinPercentage ? game.awayTeamWinPercentage : 0
                }
                lossPercentage={
                  game.awayTeamLossPercentage ? game.awayTeamLossPercentage : 0
                }
                drawPercentage={
                  game.awayTeamDrawPercentage ? game.awayTeamDrawPercentage : 0
                }
                ppg={formDataAway[0].SeasonPPG}
                formTrend={[
                  awayTenGameAverage.toFixed(2),
                  awaySixGameAverage.toFixed(2),
                  awayFiveGameAverage.toFixed(2),
                ]}
                lastGame={awayLastGame}
                formRun={formDataAway[0].formRun}
                goalDifference={formDataAway[0].goalDifference}
                goalDifferenceHomeOrAway={
                  formDataAway[0].goalDifferenceHomeOrAway
                }
                BttsPercentage={formDataAway[0].BttsPercentage}
                BttsPercentageHomeOrAway={
                  formDataAway[0].BttsPercentageHomeOrAway
                }
                // BTTSAll={
                //   formDataAway[0].BTTSAll
                //     ? formDataAway[0].BTTSAll
                //     : '"Get Predictions" first'
                // }
                // BTTSHorA={
                //   formDataAway[0].BTTSHorA
                //     ? formDataAway[0].BTTSHorA
                //     : '"Get Predictions" first'
                // }
                BTTSArray={formDataAway[0].BTTSArray}
                Results={formDataAway[0].Results}
                CardsTotal={formDataAway[0].CardsTotal}
                CornersAverage={formDataAway[0].CornersAverage}
                ScoredBothHalvesPercentage={
                  formDataAway[0].ScoredBothHalvesPercentage
                }
                FormTextString={formDataAway[0].FormTextStringAway}
              />
            </ul>
          </div>
        );
      }

      const pointsHome = getPointsFromLastX(formDataHome[0].Last5)
      const pointsHomeAv = await getPointAverage(pointsHome, 5)
      const pointsAway = getPointsFromLastX(formDataAway[0].Last5)
      const pointsAwayAv = await getPointAverage(pointsAway, 5)

      ReactDOM.render(
        <div style={style}>
          <div className="Chart" id={`Chart${game.id}`} style={style}>
            <RadarChart
              data={[
                homeAttackStrength,
                homeDefenceStrength,
                homePossessionStrength,
                homeXGForStrength,
                homeXGAgainstStrength,
                homeDirectnessStrength,
                homeAccuracyOverallStrength,
              ]}
              data2={[
                awayAttackStrength,
                awayDefenceStrength,
                awayPossessionStrength,
                awayXGForStrength,
                awayXGAgainstStrength,
                awayDirectnessStrength,
                awayAccuracyOverallStrength,
              ]}
              team1={game.homeTeam}
              team2={game.awayTeam}
            ></RadarChart>
            <BarChart
              data1={[
                homeForm.averageScoredLeague !== undefined &&
                homeForm.averageScoredLeague !== null
                  ? homeForm.averageScoredLeague.toFixed(2)
                  : formDataHome[0].AverageGoals,
                awayForm.averageConceededLeague !== undefined &&
                awayForm.averageConceededLeague !== null
                  ? awayForm.averageConceededLeague.toFixed(2)
                  : formDataAway[0].AverageConceeded,
                pointsHomeAv,
                formDataHome[0].AverageXG,
                formDataAway[0].AverageXGConceded,
                formDataHome[0].AverageShotsOnTarget,
                formDataHome[0].AverageDangerousAttacks / 7.5,
                formDataHome[0].AveragePossession / 7.5,
                formDataHome[0].goalDifferenceHomeOrAway / 5,
                formDataHome[0].CornersAverage,
              ]}
              data2={[
                awayForm.averageScoredLeague !== undefined &&
                awayForm.averageScoredLeague !== null
                  ? awayForm.averageScoredLeague.toFixed(2)
                  : formDataAway[0].AverageGoals,
                homeForm.averageConceededLeague !== undefined &&
                homeForm.averageConceededLeague !== null
                  ? homeForm.averageConceededLeague.toFixed(2)
                  : formDataHome[0].AverageConceeded,
                pointsAwayAv,
                formDataAway[0].AverageXG,
                formDataHome[0].AverageXGConceded,
                formDataAway[0].AverageShotsOnTarget,
                formDataAway[0].AverageDangerousAttacks / 7.5,
                formDataAway[0].AveragePossession / 7.5,
                formDataAway[0].goalDifferenceHomeOrAway / 5,
                formDataAway[0].CornersAverage,
              ]}
            ></BarChart>
            <Chart
              height={3}
              depth={0}
              data1={formArrayHome}
              data2={formArrayAway}
              team1={game.homeTeam}
              team2={game.awayTeam}
              type={chartType}
              tension={0}
            ></Chart>
            <Chart
              height={
                Math.max(
                  rollingGoalDiffTotalHome[rollingGoalDiffTotalHome.length - 1],
                  rollingGoalDiffTotalAway[rollingGoalDiffTotalAway.length - 1]
                ) > 2
                  ? Math.max(
                      rollingGoalDiffTotalHome[
                        rollingGoalDiffTotalHome.length - 1
                      ],
                      rollingGoalDiffTotalAway[
                        rollingGoalDiffTotalAway.length - 1
                      ]
                    )
                  : 2
              }
              depth={
                Math.min(
                  rollingGoalDiffTotalHome[rollingGoalDiffTotalHome.length - 1],
                  rollingGoalDiffTotalAway[rollingGoalDiffTotalAway.length - 1]
                ) < -2
                  ? Math.min(
                      rollingGoalDiffTotalHome[
                        rollingGoalDiffTotalHome.length - 1
                      ],
                      rollingGoalDiffTotalAway[
                        rollingGoalDiffTotalAway.length - 1
                      ]
                    )
                  : -2
              }
              data1={rollingGoalDiffTotalHome}
              data2={rollingGoalDiffTotalAway}
              team1={game.homeTeam}
              team2={game.awayTeam}
              type={"Goal difference over time"}
              tension={0.3}
            ></Chart>
          </div>
          <div style={style}>
            <Div className="MatchTime" text={`Kick off: ${time} GMT`}></Div>
            <Div
              text={`Last league games (most recent first)`}
              className={"LastGameHeader"}
            ></Div>
          </div>
          <div className="flex-container">
            <div className="flex-childOneOverviewSmall">{overviewHome}</div>
            <div className="flex-childTwoOverviewSmall">{overviewAway}</div>
          </div>
          {/* <Collapsable
            className={"Detail"}
            classNameTwo={"flex-childOneOverview"}
            classNameThree={"flex-childTwoOverview"}
            classNameFlex={"flex-element"}
            classNameButton={"DetailedFixtures"}
            buttonText={"Detailed results"}
            newText={"Detailed results"}
            element={contentHome}
            elementTwo={contentAway}
            // style={style}
          /> */}
          <div className="flex-container">
            <StatsHome />
            <StatsAway />
          </div>
          <input type="hidden" name="IL_IN_ARTICLE" />
          <Button
            className="MoreStats"
            onClickEvent={() =>
              getTeamStats(
                game.id,
                game.homeTeam,
                game.awayTeam,
                formDataHome[0].BttsPercentage,
                formDataHome[0].BttsPercentageHomeOrAway,
                formDataAway[0].BttsPercentage,
                formDataAway[0].BttsPercentageHomeOrAway
              )
            }
            text={"Fixture trends"}
          ></Button>
        </div>,
        document.getElementById("stats" + homeTeam)
      );
    }

    // ReactDOM.render(
    //   <Button
    //     className="MoreStats"
    //     style={style}
    //     onClickEvent={() =>
    //       getTeamStats(
    //         game.id,
    //         game.homeTeam,
    //         game.awayTeam,
    //         formDataHome[0].BttsPercentage,
    //         formDataHome[0].BttsPercentageHomeOrAway,
    //         formDataAway[0].BttsPercentage,
    //         formDataAway[0].BttsPercentageHomeOrAway
    //       )
    //     }
    //     text={"Fixture trends"}
    //   ></Button>,
    //   document.getElementById(`H2HStats${game.id}`)
    // );
  }
}
