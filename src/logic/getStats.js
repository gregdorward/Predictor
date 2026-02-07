import ReactDOM from "react-dom";
import { allForm } from "../logic/getFixtures";
import { getPointsFromLastX } from "../logic/getScorePredictions";
import { allLeagueResultsArrayOfObjects } from "../logic/getFixtures";
import GenerateFormSummary from "../logic/compareFormTrend";
import { clicked } from "../logic/getScorePredictions";
import { userDetail } from "../logic/authProvider";
import { checkUserPaidStatus } from "../logic/hasUserPaid";
import { render } from '../utils/render';

export async function getPointAverage(pointTotal, games) {
  return pointTotal / games;
}


export async function calculateAttackingStrength(stats) {
  // Define weights for each metric (you can adjust these based on your preference)
  const weights = {
    // averagePossession: 0.1,
    "Average Dangerous Attacks": 0.1,
    "Average Shots": 0.1,
    "Average Shots On Target": 0.2,
    "Average Expected Goals": 0.2,
    "Weighted XG": 0,
    "Average Goals": 0.3,
    Corners: 0,
    "Average Shot Value": 0.1,
    "Possession": 0,
  };

  // Define the ranges for normalization
  const ranges = {
    // League average Dangerous Attacks is highly variable
    "Average Dangerous Attacks": { min: 20, max: 80 }, 
    
    // League average Shots is typically 12-14
    "Average Shots": { min: 7, max: 19 }, 
    
    // League average Shots On Target is typically 4.5-5.5
    "Average Shots On Target": { min: 3, max: 7 }, 
    
    // League average XG scored is typically 1.3 - 1.5
    "Average Expected Goals": { min: 0.6, max: 2.2 }, 
    "Weighted XG": { min: 0.6, max: 2.2 },
    
    // League average Goals scored is typically 1.3 - 1.5
    "Average Goals": { min: 0.5, max: 2.2 }, 
    
    // League average Corners is typically 5-6
    Corners: { min: 3, max: 8 },
    
    // Speculative range for average shot value (XG/Shot)
    "Average Shot Value": { min: 5, max: 23 },
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
    "Average XG Against": 0.3,
    "Weighted XG Against": 0,
    "Average Goals Against": 0.4,
    "Average SOT Against": 0.2,
    "Average Dangerous Attacks Against": 0.1
  };

  // Define the ranges for normalization
  const ranges = {
    // League average XG conceded is typically 1.3 - 1.5
    "Average XG Against": { min: 0.6, max: 2.2 }, 
    "Weighted XG Against": { min: 0.6, max: 2.2 },
    
    // League average Goals conceded is typically 1.3 - 1.5
    "Average Goals Against": { min: 0.5, max: 2.2 }, 
    
    // League average SOT conceded is typically 4 - 5
    "Average SOT Against": { min: 3, max: 7 }, 
    "Average Dangerous Attacks Against": { min: 20, max: 80 },
  };

  // Normalize each metric value and calculate the weighted sum
  let weightedSum = 0;
  for (const metric in stats) {
    if (
      stats.hasOwnProperty(metric) &&
      weights.hasOwnProperty(metric) &&
      ranges.hasOwnProperty(metric)
    ) {
      let normalizedValueRaw =
        (stats[metric] - ranges[metric].min) / (ranges[metric].max - ranges[metric].min);
      let normalizedValueClamped = Math.max(0, Math.min(1, normalizedValueRaw));

      // 🟢 Correctly reverse the score: Low Goals Against (0) should yield Strength Score (1)
      let reversedScore = 1 - normalizedValueClamped;
      // If XG Against is at MIN, normalizedValueClamped = 0. reversedScore = 1. (Strong Defense)

      weightedSum += reversedScore * weights[metric];
      // You can remove the unused 'normValue' parameter completely if you always use 1.
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

      const homeForm = gameStats.home[index];
      const awayForm = gameStats.away[index];

      if (displayBool === true) {

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

        // });
      }

      const bttsArrayHome = Array.from(gameArrayHome, (x) => x.btts);


      const bttsArrayAway = Array.from(gameArrayAway, (x) => x.btts);

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
            ? `${homeForm.teamName} have been favourites ${homeForm.favouriteCount
            } times. Of these games, they have Won: ${homeForm.oddsReliabilityWin.toFixed(
              0
            )}%, Drawn:  ${homeForm.oddsReliabilityDraw.toFixed(
              0
            )}%, Lost:  ${homeForm.oddsReliabilityLose.toFixed(0)}%`
            : `${homeForm.teamName} have been underdogs ${homeForm.underdogCount
            } times. Of these games, they have Won: ${homeForm.oddsReliabilityWinAsUnderdog.toFixed(
              0
            )}%, Drawn:  ${homeForm.oddsReliabilityDrawAsUnderdog.toFixed(
              0
            )}%, Lost:  ${homeForm.oddsReliabilityLoseAsUnderdog.toFixed(
              0
            )}%`;
        favouriteRecordAway =
          game.homeOdds > game.awayOdds || game.homeOdds === game.awayOdds
            ? `${awayForm.teamName} have been favourites ${awayForm.favouriteCount
            } times. Of these games, they have Won: ${awayForm.oddsReliabilityWin.toFixed(
              0
            )}%, Drawn:  ${awayForm.oddsReliabilityDraw.toFixed(
              0
            )}%, Lost:  ${awayForm.oddsReliabilityLose.toFixed(0)}%`
            : `${awayForm.teamName} have been underdogs ${awayForm.underdogCount
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
            ? `${awayForm.teamName} have been favourites ${awayForm.favouriteCount
            } times. Of these games, they have Won: ${awayForm.oddsReliabilityWin.toFixed(
              0
            )}%, Drawn:  ${awayForm.oddsReliabilityDraw.toFixed(
              0
            )}%, Lost:  ${awayForm.oddsReliabilityLose.toFixed(0)}%`
            : `${awayForm.teamName} have been underdogs ${awayForm.underdogCount
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
            ? `${homeForm.teamName} have been favourites ${homeForm.favouriteCount
            } times. Of these games, they have Won: ${homeForm.oddsReliabilityWin.toFixed(
              0
            )}%, Drawn:  ${homeForm.oddsReliabilityDraw.toFixed(
              0
            )}%, Lost:  ${homeForm.oddsReliabilityLose.toFixed(0)}%`
            : `${homeForm.teamName} have been underdogs ${homeForm.underdogCount
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

      // const defensiveMetricsHome = {
      //   "Clean Sheet Percentage": 100 - homeForm.CleanSheetPercentage,
      //   "Average XG Against": homeForm.XGAgainstAvgOverall,
      //   "Recent XG Against": homeForm.XGAgainstlast5
      //     ? homeForm.XGAgainstlast5
      //     : homeForm.XGAgainstAvgOverall,
      //   "Average Goals Against":
      //     homeForm.averageConceededLeague !== undefined &&
      //       homeForm.averageConceededLeague !== null
      //       ? homeForm.averageConceededLeague
      //       : homeForm.ConcededOverall / 10,
      // };

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

      render(
        <div style={style}>
          <div className="H2HStats" id={`H2HStats${game.id}`}></div>
          <div className="TrendsHome" id={`TrendsHome${game.id}`}></div>
          <div className="TrendsAway" id={`TrendsAway${game.id}`}></div>
        </div>,
        "history" + homeTeam
      );

  }
}
}
