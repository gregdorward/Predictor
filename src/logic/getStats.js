import ReactDOM from "react-dom";
import { allForm } from "../logic/getFixtures";
import { getPointsFromLastX } from "../logic/getScorePredictions";
import { allLeagueResultsArrayOfObjects } from "../logic/getFixtures";
import GenerateFormSummary from "../logic/compareFormTrend";
import Collapsable from "../components/CollapsableElement";
import { clicked } from "../logic/getScorePredictions";
import { userDetail } from "../logic/authProvider";
import { checkUserPaidStatus } from "../logic/hasUserPaid";

export async function getPointAverage(pointTotal, games) {
  return pointTotal / games;
}


export async function calculateAttackingStrength(stats) {
  // Define weights for each metric (you can adjust these based on your preference)
  const weights = {
    // averagePossession: 0.15,
    "Average Dangerous Attacks": 0.1,
    "Average Shots": 0.05,
    "Average Shots On Target": 0.15,
    "Average Expected Goals": 0.15,
    "Recent XG": 0.15,
    "Average Goals": 0.3,
    Corners: 0,
    "Average Shot Value": 0.1,
  };

  // Define the ranges for normalization
  const ranges = {
    // averagePossession: { min: 25, max: 75 },
    "Average Dangerous Attacks": { min: 25, max: 75 }, // Adjust the max value as needed
    "Average Shots": { min: 4, max: 25 }, // Adjust the max value as needed
    "Average Shots On Target": { min: 3, max: 7 }, // Adjust the max value as needed
    "Average Expected Goals": { min: 0.75, max: 2.25 }, // Adjust the max value as needed
    "Recent XG": { min: 0.5, max: 2.25 }, // Adjust the max value as needed
    "Average Goals": { min: 0, max: 3 }, // Adjust the max value as needed
    Corners: { min: 2, max: 9 },
    "Average Shot Value": { min: 3, max: 35 },
  };

  // Normalize each metric value and calculate the weighted sum
  let weightedSum = 0;
  for (const metric in stats) {
    if (
      stats.hasOwnProperty(metric) &&
      weights.hasOwnProperty(metric) &&
      ranges.hasOwnProperty(metric)
    ) {
      const normalizedValue = Math.max(
        0,
        Math.min(
          1,
          (stats[metric] - ranges[metric].min) /
            (ranges[metric].max - ranges[metric].min)
        )
      );
      weightedSum += normalizedValue * weights[metric];
    } else {
      console.log(metric);
    }
  }

  return parseFloat(weightedSum.toFixed(2));
}

export async function calculateDefensiveStrength(stats, normalizedValue = 1) {
  let normValue = normalizedValue;
  // Define weights for each metric (you can adjust these based on your preference)
  const weights = {
    "Average XG Against": 0.2,
    "Recent XG Against": 0.3,
    "Average Goals Against": 0.4,
    "Average SOT Against": 0.1,
  };

  // Define the ranges for normalization
  const ranges = {
    "Average XG Against": { min: 0.5, max: 2.25 }, // Adjust the max value as needed
    "Recent XG Against": { min: 0.75, max: 2.25 },
    "Average Goals Against": { min: 0, max: 3 }, // Adjust the max value as needed
    "Average SOT Against": { min: 3, max: 7 },
  };

  // Normalize each metric value and calculate the weighted sum
  let weightedSum = 0;
  for (const metric in stats) {
    if (
      stats.hasOwnProperty(metric) &&
      weights.hasOwnProperty(metric) &&
      ranges.hasOwnProperty(metric)
    ) {
      // Normalize the value and clamp it between 0 and 1
      let normalizedValue =
        (stats[metric] - ranges[metric].min) /
        (ranges[metric].max - ranges[metric].min);
      normalizedValue = Math.max(0, Math.min(1, normalizedValue));

      // Reverse logic for defensive strength: better defense, lower metric value
      let val = normValue - normalizedValue;

      // Add the weighted value to the weightedSum
      weightedSum += val * weights[metric];
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
    xgFor: { min: 0.25, max: 2.75 },
    xgAgainst: { min: 0.25, max: 2.75 },
    directnessOverall: { min: 0.5, max: 7 },
    accuracyOverall: { min: 3, max: 40 },
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
      strength = 10;
      break;
    case XGDiff >= 1 && XGDiff < 1.5:
      strength = 9;
      break;
    case XGDiff >= 0.5 && XGDiff < 1:
      strength = 8;
      break;
    case XGDiff >= 0.25 && XGDiff < 0.5:
      strength = 7;
      break;
    case XGDiff > 0 && XGDiff < 0.25:
      strength = 6;
      break;
    case XGDiff <= 0 && XGDiff > -0.25:
      strength = 5;
      break;
    case XGDiff <= -0.25 && XGDiff > -0.5:
      strength = 4;
      break;
    case XGDiff <= -0.5 && XGDiff > -1:
      strength = 3;
      break;
    case XGDiff <= -1 && XGDiff > -1.5:
      strength = 2;
      break;
    case XGDiff <= -1.5:
      strength = 1;
      break;
    default:
      strength = 1;
      break;
  }
  return strength;
}

let rollingGoalDiffTotalHome = [];
let rollingGoalDiffTotalAway = [];
let rollingXGDiffTotalHome = [];
let rollingXGDiffTotalAway = [];
let rollingSOTDiffTotalHome = [];
let rollingSOTDiffTotalAway = [];

export async function createStatsDiv(game, displayBool) {
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
      let xgDiffArrayHome;
      let xgDiffArrayAway;
      let sotDiffArrayHome;
      let sotDiffArrayAway;
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

      const homeForm = gameStats.home[index];
      const awayForm = gameStats.away[index];

      if (displayBool === true) {
        // let fixtures = await fetch(
        //   `${process.env.REACT_APP_EXPRESS_SERVER}leagueFixtures/${gameStats.leagueId}`
        // );

        const pos = allLeagueResultsArrayOfObjects
          .map((i) => i.id)
          .indexOf(gameStats.leagueId);
        let matches = allLeagueResultsArrayOfObjects[pos];
        // await fixtures.json().then((matches) => {
        const resultHome = matches.fixtures.filter(
          (game) =>
            game.home_name === gameStats.home.teamName ||
            game.away_name === gameStats.home.teamName
        );

        const resultHomeOnly = matches.fixtures.filter(
          (game) => game.home_name === gameStats.home.teamName
        );

        resultHome.sort((a, b) => b.date_unix - a.date_unix);
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

          switch (true) {
            case resultHome[i].home_name === gameStats.home.teamName:
              switch (true) {
                case resultHome[i].homeGoalCount > resultHome[i].awayGoalCount:
                  won = "W";
                  goalsScored = resultHome[i].homeGoalCount;
                  goalsConceeded = resultHome[i].awayGoalCount;
                  break;
                case resultHome[i].homeGoalCount ===
                  resultHome[i].awayGoalCount:
                  won = "D";
                  goalsScored = resultHome[i].homeGoalCount;
                  goalsConceeded = resultHome[i].awayGoalCount;
                  break;
                case resultHome[i].homeGoalCount < resultHome[i].awayGoalCount:
                  won = "L";
                  goalsScored = resultHome[i].homeGoalCount;
                  goalsConceeded = resultHome[i].awayGoalCount;
                  break;
                default:
                  break;
              }
              break;
            case resultHome[i].away_name === gameStats.home.teamName:
              switch (true) {
                case resultHome[i].homeGoalCount > resultHome[i].awayGoalCount:
                  won = "L";
                  goalsScored = resultHome[i].homeGoalCount;
                  goalsConceeded = resultHome[i].awayGoalCount;
                  break;
                case resultHome[i].homeGoalCount ===
                  resultHome[i].awayGoalCount:
                  won = "D";
                  goalsScored = resultHome[i].homeGoalCount;
                  goalsConceeded = resultHome[i].awayGoalCount;
                  break;
                case resultHome[i].homeGoalCount < resultHome[i].awayGoalCount:
                  won = "W";
                  goalsScored = resultHome[i].homeGoalCount;
                  goalsConceeded = resultHome[i].awayGoalCount;
                  break;
                default:
                  break;
              }
              break;
            default:
              break;
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
            btts:
              resultHome[i].homeGoalCount > 0 && resultHome[i].awayGoalCount > 0
                ? "\u2714"
                : "\u2718",
          });
        }

        for (let i = 0; i < resultHomeOnly.length; i++) {
          let wonHomeOrAwayOnly;

          switch (true) {
            case resultHomeOnly[i].home_name === gameStats.home.teamName:
              switch (true) {
                case resultHomeOnly[i].homeGoalCount >
                  resultHomeOnly[i].awayGoalCount:
                  wonHomeOrAwayOnly = "W";
                  gameArrayHomeTeamHomeGames.push(wonHomeOrAwayOnly);
                  break;
                case resultHomeOnly[i].homeGoalCount ===
                  resultHomeOnly[i].awayGoalCount:
                  wonHomeOrAwayOnly = "D";
                  gameArrayHomeTeamHomeGames.push(wonHomeOrAwayOnly);
                  break;
                case resultHomeOnly[i].homeGoalCount <
                  resultHomeOnly[i].awayGoalCount:
                  wonHomeOrAwayOnly = "L";
                  gameArrayHomeTeamHomeGames.push(wonHomeOrAwayOnly);
                  break;
                default:
                  break;
              }
              break;

            default:
              break;
          }
        }

        goalDiffArrayHome = homeForm.allTeamResults.map(
          (a) => a.scored - a.conceeded
        );
        goalDiffArrayHome = goalDiffArrayHome.reverse();
        xgDiffArrayHome = homeForm.allTeamResults.map(
          (a) => a.XG - a.XGAgainst
        );
        xgDiffArrayHome = xgDiffArrayHome.reverse();

        sotDiffArrayHome = homeForm.allTeamResults.map(
          (a) => a.sot - a.sotAgainst
        );
        sotDiffArrayHome = sotDiffArrayHome.reverse();

        gameArrayHome.sort((a, b) => b.unixTimestamp - a.unixTimestamp);

        rollingGoalDiffTotalHome = goalDiffArrayHome.map(
          (
            (sum) => (value) =>
              (sum += value)
          )(0)
        );
        rollingXGDiffTotalHome = xgDiffArrayHome.map(
          (
            (sum) => (value) =>
              (sum += value)
          )(0)
        );
        rollingSOTDiffTotalHome = sotDiffArrayHome.map(
          (
            (sum) => (value) =>
              (sum += value)
          )(0)
        );

        const resultAway = matches.fixtures.filter(
          (game) =>
            game.away_name === gameStats.away.teamName ||
            game.home_name === gameStats.away.teamName
        );

        const resultAwayOnly = matches.fixtures.filter(
          (game) => game.away_name === gameStats.away.teamName
        );

        resultAway.sort((a, b) => b.date_unix - a.date_unix);
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

          switch (true) {
            case resultAway[i].home_name === gameStats.away.teamName:
              switch (true) {
                case resultAway[i].homeGoalCount > resultAway[i].awayGoalCount:
                  won = "W";
                  goalsScored = resultAway[i].awayGoalCount;
                  goalsConceeded = resultAway[i].homeGoalCount;
                  break;
                case resultAway[i].awayGoalCount ===
                  resultAway[i].homeGoalCount:
                  won = "D";
                  goalsScored = resultAway[i].awayGoalCount;
                  goalsConceeded = resultAway[i].homeGoalCount;
                  break;
                case resultAway[i].homeGoalCount < resultAway[i].awayGoalCount:
                  won = "L";
                  goalsScored = resultAway[i].awayGoalCount;
                  goalsConceeded = resultAway[i].homeGoalCount;
                  break;
                default:
                  break;
              }
              break;

            case resultAway[i].away_name === gameStats.away.teamName:
              switch (true) {
                case resultAway[i].homeGoalCount > resultAway[i].awayGoalCount:
                  won = "L";
                  goalsScored = resultAway[i].awayGoalCount;
                  goalsConceeded = resultAway[i].homeGoalCount;
                  break;
                case resultAway[i].homeGoalCount ===
                  resultAway[i].awayGoalCount:
                  won = "D";
                  goalsScored = resultAway[i].awayGoalCount;
                  goalsConceeded = resultAway[i].homeGoalCount;
                  break;
                case resultAway[i].homeGoalCount < resultAway[i].awayGoalCount:
                  won = "W";
                  goalsScored = resultAway[i].awayGoalCount;
                  goalsConceeded = resultAway[i].homeGoalCount;
                  break;
                default:
                  break;
              }
              break;
            default:
              break;
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
            btts:
              resultAway[i].homeGoalCount > 0 && resultAway[i].awayGoalCount > 0
                ? "\u2714"
                : "\u2718",
          });
        }

        for (let i = 0; i < resultAwayOnly.length; i++) {
          let wonAwayOrAwayOnly;

          switch (true) {
            case resultAwayOnly[i].away_name === gameStats.away.teamName:
              switch (true) {
                case resultAwayOnly[i].awayGoalCount >
                  resultAwayOnly[i].homeGoalCount:
                  wonAwayOrAwayOnly = "W";
                  gameArrayAwayTeamAwayGames.push(wonAwayOrAwayOnly);
                  break;
                case resultAwayOnly[i].awayGoalCount ===
                  resultAwayOnly[i].homeGoalCount:
                  wonAwayOrAwayOnly = "D";
                  gameArrayAwayTeamAwayGames.push(wonAwayOrAwayOnly);
                  break;
                case resultAwayOnly[i].awayGoalCount <
                  resultAwayOnly[i].homeGoalCount:
                  wonAwayOrAwayOnly = "L";
                  gameArrayAwayTeamAwayGames.push(wonAwayOrAwayOnly);
                  break;
                default:
                  break;
              }
              break;

            default:
              break;
          }
        }

        goalDiffArrayAway = awayForm.allTeamResults.map(
          (a) => a.scored - a.conceeded
        );
        goalDiffArrayAway = goalDiffArrayAway.reverse();
        xgDiffArrayAway = awayForm.allTeamResults.map(
          (a) => a.XG - a.XGAgainst
        );
        xgDiffArrayAway = xgDiffArrayAway.reverse();

        sotDiffArrayAway = awayForm.allTeamResults.map(
          (a) => a.sot - a.sotAgainst
        );
        sotDiffArrayAway = sotDiffArrayAway.reverse();

        gameArrayAway.sort((a, b) => b.unixTimestamp - a.unixTimestamp);

        rollingGoalDiffTotalAway = goalDiffArrayAway.map(
          (
            (sum) => (value) =>
              (sum += value)
          )(0)
        );
        rollingXGDiffTotalAway = xgDiffArrayAway.map(
          (
            (sum) => (value) =>
              (sum += value)
          )(0)
        );
        rollingSOTDiffTotalAway = sotDiffArrayAway.map(
          (
            (sum) => (value) =>
              (sum += value)
          )(0)
        );
        // });
      }

      const bttsArrayHome = Array.from(gameArrayHome, (x) => x.btts);
      const bttsArrayHomeOnly = Array.from(gameArrayHomeTeamHomeGames, (x) => x.btts);

      
      const bttsArrayAway = Array.from(gameArrayAway, (x) => x.btts);
      const bttsArrayAwayOnly = Array.from(gameArrayAwayTeamAwayGames, (x) => x.btts);

      const resultsArrayHome = Array.from(gameArrayHome, (x) => x.won);
      const resultsArrayAway = Array.from(gameArrayAway, (x) => x.won);

      let homeTeam = gameStats.home.teamName;
      let awayTeam = gameStats.away.teamName;

      let time = game.time;

      if (homeForm.last3Points === undefined) {
        homeForm.last3Points = getPointsFromLastX(homeForm.lastThreeForm);

        homeForm.last5Points = getPointsFromLastX(homeForm.LastFiveForm);

        homeForm.last6Points = getPointsFromLastX(homeForm.LastSixForm);

        homeForm.last10Points = getPointsFromLastX(homeForm.LastTenForm);

        homeForm.homePPGame = getPointsFromLastX(homeForm.resultsHome);

        awayForm.last3Points = getPointsFromLastX(awayForm.lastThreeForm);

        awayForm.last5Points = getPointsFromLastX(awayForm.LastFiveForm);

        awayForm.last6Points = getPointsFromLastX(awayForm.LastSixForm);

        awayForm.last10Points = getPointsFromLastX(awayForm.LastTenForm);

        awayForm.awayPPGame = getPointsFromLastX(awayForm.resultsAway);
      }

      // let homeThreeGameAverage = await getPointAverage(
      //   homeForm.last3Points,
      //   3
      // );

      let homeFiveGameAverage = await getPointAverage(homeForm.last5Points, 5);

      let homeSixGameAverage = await getPointAverage(homeForm.last6Points, 6);

      let homeTenGameAverage = await getPointAverage(homeForm.last10Points, 10);

      homeForm.homePPGAv = await getPointAverage(
        homeForm.homePPGame,
        homeForm.resultsHome.length
      );
      homeForm.tenGameAv = homeTenGameAverage;
      homeForm.fiveGameAv = homeFiveGameAverage;

      // let awayThreeGameAverage = await getPointAverage(
      //   awayForm.last3Points,
      //   3
      // );

      let awayFiveGameAverage = await getPointAverage(awayForm.last5Points, 5);

      let awaySixGameAverage = await getPointAverage(awayForm.last6Points, 6);

      let awayTenGameAverage = await getPointAverage(awayForm.last10Points, 10);

      awayForm.awayPPGAv = await getPointAverage(
        awayForm.awayPPGame,
        awayForm.resultsAway.length
      );
      awayForm.tenGameAv = awayTenGameAverage;
      awayForm.fiveGameAv = awayFiveGameAverage;

      let paid;
      if (userDetail) {
        paid = await checkUserPaidStatus(userDetail.uid);
      } else {
        paid = false;
      }

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

      // if (displayBool === true && gameStats.home[2].LeagueOrAll === "League") {
      //   console.log(1)
      formTextStringHome = await GenerateFormSummary(
        homeForm,
        homeForm.tenGameAv,
        homeForm.fiveGameAv
      );
      formTextStringAway = await GenerateFormSummary(
        awayForm,
        awayForm.tenGameAv,
        awayForm.fiveGameAv
      );
      // } else {
      //   console.log(2)
      //   formTextStringHome = "";
      //   formTextStringAway = "";
      // }

      let favouriteRecordHome, favouriteRecordAway;
      if (
        homeForm.underdogCount &&
        awayForm.underdogCount &&
        homeForm.favouriteCount &&
        awayForm.favouriteCount
      ) {
        favouriteRecordHome =
          game.homeOdds < game.awayOdds || game.homeOdds === game.awayOdds
            ? `${homeForm.teamName} have been favourites ${
                homeForm.favouriteCount
              } times. Of these games, they have Won: ${homeForm.oddsReliabilityWin.toFixed(
                0
              )}%, Drawn:  ${homeForm.oddsReliabilityDraw.toFixed(
                0
              )}%, Lost:  ${homeForm.oddsReliabilityLose.toFixed(0)}%`
            : `${homeForm.teamName} have been underdogs ${
                homeForm.underdogCount
              } times. Of these games, they have Won: ${homeForm.oddsReliabilityWinAsUnderdog.toFixed(
                0
              )}%, Drawn:  ${homeForm.oddsReliabilityDrawAsUnderdog.toFixed(
                0
              )}%, Lost:  ${homeForm.oddsReliabilityLoseAsUnderdog.toFixed(
                0
              )}%`;
        favouriteRecordAway =
          game.homeOdds > game.awayOdds || game.homeOdds === game.awayOdds
            ? `${awayForm.teamName} have been favourites ${
                awayForm.favouriteCount
              } times. Of these games, they have Won: ${awayForm.oddsReliabilityWin.toFixed(
                0
              )}%, Drawn:  ${awayForm.oddsReliabilityDraw.toFixed(
                0
              )}%, Lost:  ${awayForm.oddsReliabilityLose.toFixed(0)}%`
            : `${awayForm.teamName} have been underdogs ${
                awayForm.underdogCount
              } times. Of these games, they have Won: ${awayForm.oddsReliabilityWinAsUnderdog.toFixed(
                0
              )}%, Drawn:  ${awayForm.oddsReliabilityDrawAsUnderdog.toFixed(
                0
              )}%, Lost:  ${awayForm.oddsReliabilityLoseAsUnderdog.toFixed(
                0
              )}%`;
      } else if (
        !homeForm.favouriteCount &&
        awayForm.favouriteCount &&
        !homeForm.underdogCount &&
        awayForm.underdogCount
      ) {
        favouriteRecordHome =
          "No previous fixtures match the profile of this game.";
        favouriteRecordAway =
          game.homeOdds > game.awayOdds || game.homeOdds === game.awayOdds
            ? `${awayForm.teamName} have been favourites ${
                awayForm.favouriteCount
              } times. Of these games, they have Won: ${awayForm.oddsReliabilityWin.toFixed(
                0
              )}%, Drawn:  ${awayForm.oddsReliabilityDraw.toFixed(
                0
              )}%, Lost:  ${awayForm.oddsReliabilityLose.toFixed(0)}%`
            : `${awayForm.teamName} have been underdogs ${
                awayForm.underdogCount
              } times. Of these games, they have Won: ${awayForm.oddsReliabilityWinAsUnderdog.toFixed(
                0
              )}%, Drawn:  ${awayForm.oddsReliabilityDrawAsUnderdog.toFixed(
                0
              )}%, Lost:  ${awayForm.oddsReliabilityLoseAsUnderdog.toFixed(
                0
              )}%`;
      } else if (homeForm.oddsReliabilityWin && !awayForm.oddsReliabilityWin) {
        favouriteRecordHome =
          game.homeOdds < game.awayOdds || game.homeOdds === game.awayOdds
            ? `${homeForm.teamName} have been favourites ${
                homeForm.favouriteCount
              } times. Of these games, they have Won: ${homeForm.oddsReliabilityWin.toFixed(
                0
              )}%, Drawn:  ${homeForm.oddsReliabilityDraw.toFixed(
                0
              )}%, Lost:  ${homeForm.oddsReliabilityLose.toFixed(0)}%`
            : `${homeForm.teamName} have been underdogs ${
                homeForm.underdogCount
              } times. Of these games, they have Won: ${homeForm.oddsReliabilityWinAsUnderdog.toFixed(
                0
              )}%, Drawn:  ${homeForm.oddsReliabilityDrawAsUnderdog.toFixed(
                0
              )}%, Lost:  ${homeForm.oddsReliabilityLoseAsUnderdog.toFixed(
                0
              )}%`;
        favouriteRecordAway =
          "No previous fixtures match the profile of this game.";
      } else if (!homeForm.oddsReliabilityWin && !awayForm.oddsReliabilityWin) {
        favouriteRecordHome =
          "No previous fixtures match the profile of this game.";
        favouriteRecordAway =
          "No previous fixtures match the profile of this game.";
      }

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
        formRun: homeForm.formRun,
        goalDifference: homeForm.goalDifference,
        goalDifferenceHomeOrAway: homeForm.goalDifferenceHomeOrAway,
        CardsTotal: homeForm.CardsTotal || "-",
        CornersAverage: homeForm.AverageCorners || "-",
        FormTextStringHome: formTextStringHome,
        FavouriteRecord:
          favouriteRecordHome + `. ${homeForm.reliabilityString}`,
        BTTSArray: bttsArrayHome,
        Results: homeForm.resultsAll,
        ResultsHorA: homeForm.resultsHome.reverse(),
        XGSwing: homeForm.XGChangeRecently,
        styleOfPlayOverall: homeForm.styleOfPlayOverall,
        styleOfPlayHome: homeForm.styleOfPlayHome,
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
        formRun: awayForm.formRun,
        goalDifference: awayForm.goalDifference,
        goalDifferenceHomeOrAway: awayForm.goalDifferenceHomeOrAway,
        CardsTotal: awayForm.CardsTotal || "-",
        CornersAverage: awayForm.AverageCorners || "-",
        FormTextStringAway: formTextStringAway,
        FavouriteRecord:
          favouriteRecordAway + `. ${awayForm.reliabilityString}`,
        BTTSArray: bttsArrayAway,
        Results: awayForm.resultsAll,
        ResultsHorA: awayForm.resultsAway.reverse(),
        XGSwing: awayForm.XGChangeRecently,
        styleOfPlayOverall: awayForm.styleOfPlayOverall,
        styleOfPlayAway: awayForm.styleOfPlayAway,
      });

      ReactDOM.render(
        <div style={style}>
          <div className="H2HStats" id={`H2HStats${game.id}`}></div>
          <div className="TrendsHome" id={`TrendsHome${game.id}`}></div>
          <div className="TrendsAway" id={`TrendsAway${game.id}`}></div>
        </div>,
        document.getElementById("history" + homeTeam)
      );

   

      // function StatsHome() {
      //   return (
      //     <div className="flex-childOne">
      //       <ul style={style}>
      //         <Stats
      //           style={style}
      //           homeOrAway="Home"
      //           gameCount={divider}
      //           key={formDataHome[0].name}
      //           last5={formDataHome[0].Last5}
      //           homeOrAwayResults={gameArrayHomeTeamHomeGames}
      //           LeagueOrAll={formDataHome[0].LeagueOrAll}
      //           className={"KeyStatsHome"}
      //           name={formDataHome[0].name}
      //           goals={homeForm.avgScored}
      //           conceeded={homeForm.avgConceeded}
      //           XG={homeForm.XGOverall.toFixed(2)}
      //           XGConceded={homeForm.XGAgainstAvgOverall.toFixed(2)}
      //           XGSwing={homeForm.XGChangeRecently}
      //           possession={homeForm.AveragePossessionOverall.toFixed(2)}
      //           sot={homeForm.AverageShotsOnTargetOverall.toFixed(2)}
      //           dangerousAttacks={
      //             homeForm.AverageDangerousAttacksOverall !== 0
      //               ? homeForm.AverageDangerousAttacksOverall.toFixed(2)
      //               : homeForm.AverageDangerousAttacks
      //           }
      //           leaguePosition={
      //             formDataHome[0].leaguePosition !== undefined &&
      //             formDataHome[0].leaguePosition !== "undefined"
      //               ? formDataHome[0].leaguePosition
      //               : 0
      //           }
      //           rawPosition={
      //             game.homeRawPosition !== undefined &&
      //             game.homeRawPosition !== "undefined"
      //               ? game.homeRawPosition
      //               : 0
      //           }
      //           homeOrAwayLeaguePosition={
      //             game.homeTeamHomePosition !== undefined &&
      //             game.homeTeamHomePosition !== "undefined"
      //               ? game.homeTeamHomePosition
      //               : 0
      //           }
      //           winPercentage={homeForm.homePPGAv ? homeForm.homePPGAv : "N/A"}
      //           lossPercentage={
      //             game.homeTeamLossPercentage
      //               ? game.homeTeamLossPercentage
      //               : "N/A"
      //           }
      //           drawPercentage={
      //             game.homeTeamDrawPercentage
      //               ? game.homeTeamDrawPercentage
      //               : "N/A"
      //           }
      //           ppg={formDataHome[0].SeasonPPG}
      //           formTrend={[
      //             homeTenGameAverage.toFixed(2),
      //             homeSixGameAverage.toFixed(2),
      //             homeFiveGameAverage.toFixed(2),
      //           ]}
      //           formRun={homeForm.resultsAll.reverse()}
      //           goalDifference={formDataHome[0].goalDifference}
      //           goalDifferenceHomeOrAway={
      //             formDataHome[0].goalDifferenceHomeOrAway
      //           }
      //           BttsPercentage={formDataHome[0].BttsPercentage}
      //           BttsPercentageHomeOrAway={
      //             formDataHome[0].BttsPercentageHomeOrAway
      //           }
      //           BTTSArray={formDataHome[0].BTTSArray}
      //           Results={formDataHome[0].Results}
      //           ResultsHorA={formDataHome[0].ResultsHorA}
      //           CardsTotal={formDataHome[0].CardsTotal}
      //           CornersAverage={homeForm.AverageCorners}
      //           ScoredBothHalvesPercentage={
      //             formDataHome[0].ScoredBothHalvesPercentage
      //           }
      //           FormTextString={formDataHome[0].FormTextStringHome}
      //           FavouriteRecord={formDataHome[0].FavouriteRecord}
      //           StyleOfPlay={formDataHome[0].styleOfPlayOverall}
      //           StyleOfPlayHomeOrAway={formDataHome[0].styleOfPlayHome}
      //         />
      //       </ul>
      //     </div>
      //   );
      // }

      // function StatsAway() {
      //   return (
      //     <div className="flex-childTwo">
      //       <ul style={style}>
      //         <Stats
      //           style={style}
      //           homeOrAway="Away"
      //           gameCount={divider}
      //           key={formDataAway[0].name}
      //           last5={formDataAway[0].Last5}
      //           homeOrAwayResults={gameArrayAwayTeamAwayGames}
      //           LeagueOrAll={formDataAway[0].LeagueOrAll}
      //           className={"KeyStatsAway"}
      //           classNameTwo={"FormStatsAway"}
      //           name={formDataAway[0].name}
      //           goals={awayForm.avgScored}
      //           conceeded={awayForm.avgConceeded}
      //           XG={awayForm.XGOverall.toFixed(2)}
      //           XGConceded={awayForm.XGAgainstAvgOverall.toFixed(2)}
      //           XGSwing={awayForm.XGChangeRecently}
      //           //todo add goal diff and btts percentages
      //           possession={awayForm.AveragePossessionOverall.toFixed(2)}
      //           rawPosition={game.awayRawPosition ? game.awayRawPosition : 0}
      //           sot={awayForm.AverageShotsOnTargetOverall.toFixed(2)}
      //           dangerousAttacks={
      //             awayForm.AverageDangerousAttacksOverall !== 0
      //               ? awayForm.AverageDangerousAttacksOverall.toFixed(2)
      //               : awayForm.AverageDangerousAttacks
      //           }
      //           leaguePosition={
      //             formDataAway[0].leaguePosition !== undefined &&
      //             formDataAway[0].leaguePosition !== "undefined"
      //               ? formDataAway[0].leaguePosition
      //               : 0
      //           }
      //           homeOrAwayLeaguePosition={
      //             game.awayTeamAwayPosition !== undefined &&
      //             game.awayTeamAwayPosition !== "undefinedundefined"
      //               ? game.awayTeamAwayPosition
      //               : 0
      //           }
      //           winPercentage={awayForm.awayPPGAv ? awayForm.awayPPGAv : "N/A"}
      //           lossPercentage={
      //             game.awayTeamLossPercentage
      //               ? game.awayTeamLossPercentage
      //               : "N/A"
      //           }
      //           drawPercentage={
      //             game.awayTeamDrawPercentage
      //               ? game.awayTeamDrawPercentage
      //               : "N/A"
      //           }
      //           ppg={formDataAway[0].SeasonPPG}
      //           formTrend={[
      //             awayTenGameAverage.toFixed(2),
      //             awaySixGameAverage.toFixed(2),
      //             awayFiveGameAverage.toFixed(2),
      //           ]}
      //           formRun={awayForm.resultsAll.reverse()}
      //           goalDifference={formDataAway[0].goalDifference}
      //           goalDifferenceHomeOrAway={
      //             formDataAway[0].goalDifferenceHomeOrAway
      //           }
      //           BttsPercentage={formDataAway[0].BttsPercentage}
      //           BttsPercentageHomeOrAway={
      //             formDataAway[0].BttsPercentageHomeOrAway
      //           }
      //           BTTSArray={formDataAway[0].BTTSArray}
      //           Results={formDataAway[0].Results}
      //           ResultsHorA={formDataAway[0].ResultsHorA}
      //           CardsTotal={formDataAway[0].CardsTotal}
      //           CornersAverage={awayForm.AverageCorners}
      //           ScoredBothHalvesPercentage={
      //             formDataAway[0].ScoredBothHalvesPercentage
      //           }
      //           FormTextString={formDataAway[0].FormTextStringAway}
      //           FavouriteRecord={formDataAway[0].FavouriteRecord}
      //           StyleOfPlay={formDataAway[0].styleOfPlayOverall}
      //           StyleOfPlayHomeOrAway={formDataAway[0].styleOfPlayAway}
      //         />
      //       </ul>
      //     </div>
      //   );
      // }

      // let id, team1, team2, timestamp, homeGoals, awayGoals;

      // async function getGameIdByHomeTeam(games, homeTeamName) {
      //   const matchingGames = games.filter((game) =>
      //     game.homeTeam.includes(homeTeamName)
      //   );
      //   if (matchingGames.length > 0) {
      //     return matchingGames[0];
      //   } else {
      //     return null; // or any other value you prefer to return if no match is found
      //   }
      // }

      // const matchingGame = await getGameIdByHomeTeam(
      //   arrayOfGames,
      //   game.homeTeam
      // );

      // if (matchingGame) {
      //   id = matchingGame.id.toString();
      //   team1 = matchingGame.homeTeam;
      //   team2 = matchingGame.awayTeam;
      //   timestamp = matchingGame.time;
      //   homeGoals = matchingGame.homeGoals;
      //   awayGoals = matchingGame.awayGoals;
      // } else {
      //   id = "0";
      //   team1 = "N/A";
      //   team2 = "N/A";
      //   timestamp = 1;
      //   homeGoals = "-";
      //   awayGoals = "-";
      // }

      // if (homeForm.completeData === true && game.completeData === true) {
      //   ReactDOM.render(
      //     <>
      //       <div style={style}>
      //         <Collapsable
      //           buttonText={"Lineups & match action"}
      //           classNameButton="Lineups"
      //           element={
      //             <>
      //               <SofaLineupsWidget
      //                 id={id}
      //                 team1={team1}
      //                 team2={team2}
      //                 time={timestamp}
      //                 homeGoals={homeGoals}
      //                 awayGoals={awayGoals}
      //               ></SofaLineupsWidget>
      //             </>
      //           }
      //         />
      //         <div style={style}>
      //           <Div className="MatchTime" text={`Kick off: ${time} GMT`}></Div>
      //         </div>
      //         <div id="AIInsightsContainer" className="AIInsightsContainer">
      //         {!paid ? (
      //           <div>Paid feature</div>
      //         ) : (
      //           <div></div>
      //         )}
      //           <Button
      //             className="AIInsights"
      //             onClickEvent={() => generateAIInsights(game.id, homeForm, awayForm)}
      //             text={"Generate AI Insights"}
      //             disabled={!paid}
      //           ></Button>
      //         </div>
      //         <div className="flex-container">
      //           <StatsHome />
      //           <StatsAway />
      //         </div>
      //         <div className="Chart" id={`Chart${game.id}`} style={style}>
      //           <RadarChart
      //             title="XG Tipping Strength Ratings - All Games"
      //             data={[
      //               homeAttackStrength,
      //               homeDefenceStrength,
      //               homePossessionStrength,
      //               homeXGForStrength,
      //               homeXGAgainstStrength,
      //               homeDirectnessStrength,
      //               homeAccuracyOverallStrength,
      //             ]}
      //             data2={[
      //               awayAttackStrength,
      //               awayDefenceStrength,
      //               awayPossessionStrength,
      //               awayXGForStrength,
      //               awayXGAgainstStrength,
      //               awayDirectnessStrength,
      //               awayAccuracyOverallStrength,
      //             ]}
      //             team1={game.homeTeam}
      //             team2={game.awayTeam}
      //           ></RadarChart>
      //           <RadarChart
      //             title="XG Tipping Strength Ratings - Last 5 games"
      //             data={[
      //               homeAttackStrengthLast5,
      //               homeDefenceStrengthLast5,
      //               homePossessionStrengthLast5,
      //               homeXGForStrengthLast5,
      //               homeXGAgainstStrengthLast5,
      //               homeDirectnessStrengthLast5,
      //               homeAccuracyOverallStrengthLast5,
      //             ]}
      //             data2={[
      //               awayAttackStrengthLast5,
      //               awayDefenceStrengthLast5,
      //               awayPossessionStrengthLast5,
      //               awayXGForStrengthLast5,
      //               awayXGAgainstStrengthLast5,
      //               awayDirectnessStrengthLast5,
      //               awayAccuracyOverallStrengthLast5,
      //             ]}
      //             team1={game.homeTeam}
      //             team2={game.awayTeam}
      //           ></RadarChart>
      //           <RadarChart
      //             title="XG Tipping Strength Ratings - Home/Away Games Only"
      //             data={[
      //               homeOnlyAttackStrength,
      //               homeOnlyDefenceStrength,
      //               homeOnlyPossessionStrength,
      //               homeOnlyXGForStrength,
      //               homeOnlyXGAgainstStrength,
      //               homeOnlyDirectnessStrength,
      //               homeOnlyAccuracyOverallStrength,
      //             ]}
      //             data2={[
      //               awayOnlyAttackStrength,
      //               awayOnlyDefenceStrength,
      //               awayOnlyPossessionStrength,
      //               awayOnlyXGForStrength,
      //               awayOnlyXGAgainstStrength,
      //               awayOnlyDirectnessStrength,
      //               awayOnlyAccuracyOverallStrength,
      //             ]}
      //             team1={game.homeTeam}
      //             team2={game.awayTeam}
      //           ></RadarChart>
      //           <DoughnutChart
      //             data={[homeForm.XGRating, awayForm.XGRating]}
      //             homeTeam={game.homeTeam}
      //             awayTeam={game.awayTeam}
      //           ></DoughnutChart>
      //           <BarChartTwo
      //             text="Recent XG Differential Swing"
      //             homeTeam={homeForm.teamName}
      //             awayTeam={awayForm.teamName}
      //             data1={[homeForm.XGChangeRecently.toFixed(2)]}
      //             data2={[awayForm.XGChangeRecently.toFixed(2)]}
      //           ></BarChartTwo>
      //           <BarChart
      //             text="H2H - Home Team | Away Team"
      //             data1={[
      //               homeForm.avgScored * 2,
      //               awayForm.avgConceeded * 2,
      //               homeForm.avPointsAll * 3,
      //               homeForm.XGOverall * 2,
      //               awayForm.XGAgainstAvgOverall * 2,
      //               homeForm.AverageShotsOnTargetOverall,
      //               homeForm.AverageDangerousAttacksOverall !== 0
      //                 ? homeForm.AverageDangerousAttacksOverall / 7.5
      //                 : homeForm.AverageDangerousAttacks / 7.5,
      //               homeForm.AveragePossessionOverall / 7.5,
      //               homeForm.goalDifferenceHomeOrAway / 10,
      //               homeForm.AverageCorners,
      //             ]}
      //             data2={[
      //               awayForm.avgScored * 2,
      //               homeForm.avgConceeded * 2,
      //               awayForm.avPointsAll * 3,
      //               awayForm.XGOverall * 2,
      //               homeForm.XGAgainstAvgOverall * 2,
      //               awayForm.AverageShotsOnTargetOverall,
      //               awayForm.AverageDangerousAttacksOverall !== 0
      //                 ? awayForm.AverageDangerousAttacksOverall / 7.5
      //                 : awayForm.AverageDangerousAttacks / 7.5,
      //               awayForm.AveragePossessionOverall / 7.5,
      //               awayForm.goalDifferenceHomeOrAway / 10,
      //               awayForm.AverageCorners,
      //             ]}
      //           ></BarChart>
      //           <Chart
      //             height={3}
      //             depth={0}
      //             data1={formArrayHome}
      //             data2={formArrayAway}
      //             team1={game.homeTeam}
      //             team2={game.awayTeam}
      //             type={chartType}
      //             tension={0}
      //           ></Chart>
      //           <MultilineChart
      //             height={
      //               Math.max(
      //                 rollingGoalDiffTotalHome[
      //                   rollingGoalDiffTotalHome.length - 1
      //                 ],
      //                 rollingGoalDiffTotalAway[
      //                   rollingGoalDiffTotalAway.length - 1
      //                 ]
      //               ) > 2
      //                 ? Math.max(
      //                     rollingGoalDiffTotalHome[
      //                       rollingGoalDiffTotalHome.length - 1
      //                     ],
      //                     rollingGoalDiffTotalAway[
      //                       rollingGoalDiffTotalAway.length - 1
      //                     ]
      //                   )
      //                 : 2
      //             }
      //             depth={
      //               Math.min(
      //                 rollingGoalDiffTotalHome[
      //                   rollingGoalDiffTotalHome.length - 1
      //                 ],
      //                 rollingGoalDiffTotalAway[
      //                   rollingGoalDiffTotalAway.length - 1
      //                 ]
      //               ) < -2
      //                 ? Math.min(
      //                     rollingGoalDiffTotalHome[
      //                       rollingGoalDiffTotalHome.length - 1
      //                     ],
      //                     rollingGoalDiffTotalAway[
      //                       rollingGoalDiffTotalAway.length - 1
      //                     ]
      //                   )
      //                 : -2
      //             }
      //             data1={rollingGoalDiffTotalHome}
      //             data2={rollingGoalDiffTotalAway}
      //             data3={rollingXGDiffTotalHome}
      //             data4={rollingXGDiffTotalAway}
      //             team1={game.homeTeam}
      //             team2={game.awayTeam}
      //             type={"Goal/XG difference over time"}
      //             tension={0.5}
      //           ></MultilineChart>
      //         </div>
      //         <Div
      //           text={`Last league games (most recent first)`}
      //           className={"LastGameHeader"}
      //         ></Div>
      //         <div className="flex-container">
      //           <div className="flex-childOneOverviewSmall">{overviewHome}</div>
      //           <div className="flex-childTwoOverviewSmall">{overviewAway}</div>
      //         </div>
      //         <h2>Results from similar profile games</h2>
      //         <span>(Games where each team had similar odds)</span>
      //         <h3>Most recent first</h3>
      //         <div className="flex-container-similar">
      //           <div className="flex-childOneOverviewSmall">
      //             {similarGamesHome}
      //           </div>
      //           <div className="flex-childTwoOverviewSmall">
      //             {similarGamesAway}
      //           </div>
      //         </div>
      //         <input type="hidden" name="IL_IN_ARTICLE" />
      //         <Button
      //           className="MoreStats"
      //           onClickEvent={() =>
      //             getTeamStats(
      //               game.id,
      //               game.homeTeam,
      //               game.awayTeam,
      //               formDataHome[0].BttsPercentage,
      //               formDataHome[0].BttsPercentageHomeOrAway,
      //               formDataAway[0].BttsPercentage,
      //               formDataAway[0].BttsPercentageHomeOrAway
      //             )
      //           }
      //           text={"Fixture trends + AI Preview"}
      //         ></Button>
      //       </div>
      //     </>,
      //     document.getElementById("stats" + homeTeam)
      //   );
      // } else if (
      //   homeForm.completeData === false ||
      //   game.completeData === false
      // ) {
      //   ReactDOM.render(
      //     <>
      //       <div style={style}>
      //         <Collapsable
      //           buttonText={"Lineups & match action"}
      //           classNameButton="Lineups"
      //           element={
      //             <>
      //               <SofaLineupsWidget
      //                 id={id}
      //                 team1={team1}
      //                 team2={team2}
      //                 time={timestamp}
      //                 homeGoals={homeGoals}
      //                 awayGoals={awayGoals}
      //               ></SofaLineupsWidget>
      //             </>
      //           }
      //         />
      //         <div className="Chart" id={`Chart${game.id}`} style={style}>
      //           <RadarChart
      //             title="XG Tipping Strength Ratings - All Games"
      //             data={[
      //               homeAttackStrength,
      //               homeDefenceStrength,
      //               homePossessionStrength,
      //               homeXGForStrength,
      //               homeXGAgainstStrength,
      //               homeDirectnessStrength,
      //               homeAccuracyOverallStrength,
      //             ]}
      //             data2={[
      //               awayAttackStrength,
      //               awayDefenceStrength,
      //               awayPossessionStrength,
      //               awayXGForStrength,
      //               awayXGAgainstStrength,
      //               awayDirectnessStrength,
      //               awayAccuracyOverallStrength,
      //             ]}
      //             team1={game.homeTeam}
      //             team2={game.awayTeam}
      //           ></RadarChart>
      //         </div>
      //         <div style={style}>
      //           <Div className="MatchTime" text={`Kick off: ${time} GMT`}></Div>
      //           {/* <Div
      //             text={`Last league games (most recent first)`}
      //             className={"LastGameHeader"}
      //           ></Div> */}
      //         </div>
      //         {/* <div className="flex-container">
      //           <div className="flex-childOneOverviewSmall">{overviewHome}</div>
      //           <div className="flex-childTwoOverviewSmall">{overviewAway}</div>
      //         </div>
      //         <div className="flex-container">
      //           <StatsHome />
      //           <StatsAway />
      //         </div> */}
      //         <h2>Results from similar profile games</h2>
      //         <span>(Games where each team had similar odds)</span>
      //         <h3>Most recent first</h3>
      //         <div className="flex-container-similar">
      //           <div className="flex-childOneOverviewSmall">
      //             {similarGamesHome}
      //           </div>
      //           <div className="flex-childTwoOverviewSmall">
      //             {similarGamesAway}
      //           </div>
      //         </div>
      //         <input type="hidden" name="IL_IN_ARTICLE" />
      //         <Button
      //           className="MoreStats"
      //           onClickEvent={() =>
      //             getTeamStats(
      //               game.id,
      //               game.homeTeam,
      //               game.awayTeam,
      //               formDataHome[0].BttsPercentage,
      //               formDataHome[0].BttsPercentageHomeOrAway,
      //               formDataAway[0].BttsPercentage,
      //               formDataAway[0].BttsPercentageHomeOrAway
      //             )
      //           }
      //           text={"Fixture trends + AI Preview"}
      //         ></Button>
      //       </div>
      //     </>,
      //     document.getElementById("stats" + homeTeam)
      //   );
      // } else {
      //   ReactDOM.render(
      //     <>
      //       <div style={style}>
      //         <Collapsable
      //           buttonText={"Lineups & match action"}
      //           classNameButton="Lineups"
      //           element={
      //             <>
      //               <SofaLineupsWidget
      //                 id={id}
      //                 team1={team1}
      //                 team2={team2}
      //                 time={timestamp}
      //                 homeGoals={homeGoals}
      //                 awayGoals={awayGoals}
      //               ></SofaLineupsWidget>
      //             </>
      //           }
      //         />
      //         <div style={style}>
      //           <Div className="MatchTime" text={`Kick off: ${time} GMT`}></Div>
      //         </div>
      //         <div className="flex-container">
      //           <StatsHome />
      //           <StatsAway />
      //         </div>
      //         <Div
      //           text={`AI Preview, last league games & h2h records (paid feature only)`}
      //           className={"LastGameHeader"}
      //         ></Div>
      //       </div>
      //     </>,
      //     document.getElementById("stats" + homeTeam)
      //   );
      // }
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
