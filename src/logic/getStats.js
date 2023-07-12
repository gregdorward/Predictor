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
export async function getAttackStrength(goalsFor) {
  let strength;
  switch (true) {
    case goalsFor >= 2.8:
      strength = 10;
      break;
    case goalsFor >= 2.5 && goalsFor < 2.8:
      strength = 9;
      break;
    case goalsFor >= 2.2 && goalsFor < 2.5:
      strength = 8;
      break;
    case goalsFor >= 1.9 && goalsFor < 2.2:
      strength = 7;
      break;
    case goalsFor >= 1.6 && goalsFor < 1.9:
      strength = 6;
      break;
    case goalsFor >= 1.3 && goalsFor < 1.6:
      strength = 5;
      break;
    case goalsFor >= 1 && goalsFor < 1.3:
      strength = 4;
      break;
    case goalsFor >= 0.7 && goalsFor < 1:
      strength = 3;
      break;
    case goalsFor >= 0.4 && goalsFor < 0.7:
      strength = 2;
      break;
    case goalsFor < 0.4:
      strength = 1;
      break;
    default:
      break;
  }
  return strength;
}

export async function getDefenceStrength(goalsAgainst) {
  let strength;
  switch (true) {
    case goalsAgainst >= 2.8:
      strength = 1;
      break;
    case goalsAgainst >= 2.5 && goalsAgainst < 2.8:
      strength = 2;
      break;
    case goalsAgainst >= 2.2 && goalsAgainst < 2.5:
      strength = 3;
      break;
    case goalsAgainst >= 1.9 && goalsAgainst < 2.2:
      strength = 4;
      break;
    case goalsAgainst >= 1.6 && goalsAgainst < 1.9:
      strength = 5;
      break;
    case goalsAgainst >= 1.3 && goalsAgainst < 1.6:
      strength = 6;
      break;
    case goalsAgainst >= 1 && goalsAgainst < 1.3:
      strength = 7;
      break;
    case goalsAgainst >= 0.7 && goalsAgainst < 1:
      strength = 8;
      break;
    case goalsAgainst >= 0.4 && goalsAgainst < 0.7:
      strength = 9;
      break;
    case goalsAgainst < 0.4:
      strength = 10;
      break;
    default:
      break;
  }
  return strength;
}

export async function getPossessionStrength(possession) {
  let strength;
  switch (true) {
    case possession >= 68:
      strength = 10;
      break;
    case possession >= 64 && possession < 68:
      strength = 9;
      break;
    case possession >= 60 && possession < 64:
      strength = 8;
      break;
    case possession >= 56 && possession < 60:
      strength = 7;
      break;
    case possession >= 52 && possession < 56:
      strength = 6;
      break;
    case possession >= 48 && possession < 52:
      strength = 5;
      break;
    case possession >= 44 && possession < 48:
      strength = 4;
      break;
    case possession >= 40 && possession < 44:
      strength = 3;
      break;
    case possession >= 35 && possession < 40:
      strength = 2;
      break;
    case possession < 35:
      strength = 1;
      break;
    default:
      break;
  }
  return strength;
}

export async function getShotsStrength(Shots) {
  let strength;
  switch (true) {
    case Shots >= 15:
      strength = 10;
      break;
    case Shots >= 14.25 && Shots < 15:
      strength = 9;
      break;
    case Shots >= 13.5 && Shots < 14.25:
      strength = 8;
      break;
    case Shots >= 12.75 && Shots < 13.5:
      strength = 7;
      break;
    case Shots >= 12 && Shots < 12.75:
      strength = 6;
      break;
    case Shots >= 11.25 && Shots < 12:
      strength = 5;
      break;
    case Shots >= 10.5 && Shots < 11.25:
      strength = 4;
      break;
    case Shots >= 9.75 && Shots < 10.5:
      strength = 3;
      break;
    case Shots >= 9 && Shots < 9.75:
      strength = 2;
      break;
    case Shots < 9:
      strength = 1;
      break;
    default:
      break;
  }
  return strength;
}

export async function getShotsStrengthHorA(Shots) {
  let strength;
  switch (true) {
    case Shots >= 19.5:
      strength = 10;
      break;
    case Shots >= 18 && Shots < 19.5:
      strength = 9;
      break;
    case Shots >= 17 && Shots < 18:
      strength = 8;
      break;
    case Shots >= 15.5 && Shots < 17:
      strength = 7;
      break;
    case Shots >= 14 && Shots < 15.5:
      strength = 6;
      break;
    case Shots >= 12.5 && Shots < 14:
      strength = 5;
      break;
    case Shots >= 11 && Shots < 12.5:
      strength = 4;
      break;
    case Shots >= 9.5 && Shots < 11:
      strength = 3;
      break;
    case Shots >= 8 && Shots < 9.5:
      strength = 2;
      break;
    case Shots < 8:
      strength = 1;
      break;
    default:
      break;
  }
  return strength;
}

export async function getXGForStrength(XG) {
  let strength;
  switch (true) {
    case XG >= 2.9:
      strength = 10;
      break;
    case XG >= 2.6 && XG < 2.9:
      strength = 9;
      break;
    case XG >= 2.3 && XG < 2.6:
      strength = 8;
      break;
    case XG >= 2 && XG < 2.3:
      strength = 7;
      break;
    case XG >= 1.7 && XG < 2:
      strength = 6;
      break;
    case XG >= 1.4 && XG < 1.7:
      strength = 5;
      break;
    case XG >= 1.1 && XG < 1.4:
      strength = 4;
      break;
    case XG >= 0.8 && XG < 1.1:
      strength = 3;
      break;
    case XG >= 0.5 && XG < 0.8:
      strength = 2;
      break;
    case XG < 0.5:
      strength = 1;
      break;
    default:
      break;
  }
  return strength;
}

export async function getXGAgainstStrength(XGAgainst) {
  let strength;
  switch (true) {
    case XGAgainst >= 2.9:
      strength = 1;
      break;
    case XGAgainst >= 2.6 && XGAgainst < 2.9:
      strength = 2;
      break;
    case XGAgainst >= 2.3 && XGAgainst < 2.6:
      strength = 3;
      break;
    case XGAgainst >= 2 && XGAgainst < 2.3:
      strength = 4;
      break;
    case XGAgainst >= 1.7 && XGAgainst < 2:
      strength = 5;
      break;
    case XGAgainst >= 1.4 && XGAgainst < 1.7:
      strength = 6;
      break;
    case XGAgainst >= 1.1 && XGAgainst < 1.4:
      strength = 7;
      break;
    case XGAgainst >= 0.8 && XGAgainst < 1.1:
      strength = 8;
      break;
    case XGAgainst >= 0.5 && XGAgainst < 0.8:
      strength = 9;
      break;
    case XGAgainst < 0.5:
      strength = 10;
      break;
    default:
      break;
  }
  return strength;
}

export async function getXGDifferentialStrength(XGDiff) {
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
      console.log("default clause triggered");
      break;
  }
  return strength;
}


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
  if (game.status !== "void") {
    // takes the displayBool boolean from the fixture onClick and sets the styling of the stats div from there
    function styling(testBool) {
      let bool = testBool;
      if (bool === true) {
        // set stats element to display flex
        return { display: "block" };
      } else {
        // set stats element to display none
        return { display: "none" };
      }
    }

    let style = styling(displayBool);

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

    gameStats.home[index].last3Points = getPointsFromLastX(
      gameStats.home[index].lastThreeForm
    );

    gameStats.home[index].last5Points = getPointsFromLastX(
      gameStats.home[index].LastFiveForm
    );

    gameStats.home[index].last6Points = getPointsFromLastX(
      gameStats.home[index].LastSixForm
    );

    gameStats.home[index].last10Points = getPointsFromLastX(
      gameStats.home[index].LastTenForm
    );

    gameStats.away[index].last3Points = getPointsFromLastX(
      gameStats.away[index].lastThreeForm
    );

    gameStats.away[index].last5Points = getPointsFromLastX(
      gameStats.away[index].LastFiveForm
    );

    gameStats.away[index].last6Points = getPointsFromLastX(
      gameStats.away[index].LastSixForm
    );

    gameStats.away[index].last10Points = getPointsFromLastX(
      gameStats.away[index].LastTenForm
    );

    async function getPointAverage(pointTotal, games) {
      return pointTotal / games;
    }

    // let homeThreeGameAverage = await getPointAverage(
    //   gameStats.home[index].last3Points,
    //   3
    // );

    let homeFiveGameAverage = await getPointAverage(
      gameStats.home[index].last5Points,
      5
    );

    let homeSixGameAverage = await getPointAverage(
      gameStats.home[index].last6Points,
      6
    );

    let homeTenGameAverage = await getPointAverage(
      gameStats.home[index].last10Points,
      10
    );

    // let awayThreeGameAverage = await getPointAverage(
    //   gameStats.away[index].last3Points,
    //   3
    // );

    let awayFiveGameAverage = await getPointAverage(
      gameStats.away[index].last5Points,
      5
    );

    let awaySixGameAverage = await getPointAverage(
      gameStats.away[index].last6Points,
      6
    );

    let awayTenGameAverage = await getPointAverage(
      gameStats.away[index].last10Points,
      10
    );

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

    let homeLastGame = await getLastGameResult(
      gameStats.home[index].LastFiveForm[4]
    );
    let awayLastGame = await getLastGameResult(
      gameStats.away[index].LastFiveForm[4]
    );

    let homeAttackStrength = await getAttackStrength(
      gameStats.home[index].ScoredOverall / 10
    );
    let homeDefenceStrength = await getDefenceStrength(
      gameStats.home[index].ConcededOverall / 10
    );
    let homePossessionStrength = await getPossessionStrength(
      gameStats.home[index].AveragePossessionOverall
    );
    let homeXGForStrength = await getXGForStrength(gameStats.home[2].XGOverall);
    let homeXGAgainstStrength = await getXGAgainstStrength(
      gameStats.home[2].XGAgainstAvgOverall
    );

    let awayAttackStrength = await getAttackStrength(
      gameStats.away[index].ScoredOverall / 10
    );
    let awayDefenceStrength = await getDefenceStrength(
      gameStats.away[index].ConcededOverall / 10
    );
    let awayPossessionStrength = await getPossessionStrength(
      gameStats.away[index].AveragePossessionOverall
    );
    let awayXGForStrength = await getXGForStrength(gameStats.away[2].XGOverall);
    let awayXGAgainstStrength = await getXGAgainstStrength(
      gameStats.away[2].XGAgainstAvgOverall
    );

    let [formPointsHome, testArrayHome] = await getPointsFromGames(
      gameStats.home[2].WDLRecord
    );
    let [formPointsAway, testArrayAway] = await getPointsFromGames(
      gameStats.away[2].WDLRecord
    );

    let rollingGoalDiffHome = [
      (gameStats.home[0].ScoredOverall - gameStats.home[0].ConcededOverall) /
        10,
      (gameStats.home[1].ScoredOverall - gameStats.home[1].ConcededOverall) / 6,
      (gameStats.home[2].ScoredOverall - gameStats.home[2].ConcededOverall) / 5,
    ];

    let rollingGoalDiffAway = [
      (gameStats.away[0].ScoredOverall - gameStats.away[0].ConcededOverall) /
        10,
      (gameStats.away[1].ScoredOverall - gameStats.away[1].ConcededOverall) / 6,
      (gameStats.away[2].ScoredOverall - gameStats.away[2].ConcededOverall) / 5,
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
      AverageGoals: gameStats.home[index].ScoredOverall / 10,
      AverageConceeded: gameStats.home[index].ConcededOverall / 10,
      AverageXG: gameStats.home[index].XGOverall,
      AverageXGConceded: gameStats.home[index].XGAgainstAvgOverall,
      AveragePossession: gameStats.home[index].AveragePossessionOverall,
      AverageShotsOnTarget: gameStats.home[index].AverageShotsOnTargetOverall,
      AverageDangerousAttacks:
        gameStats.home[index].AverageDangerousAttacksOverall,
      homeOrAway: "Home",
      leaguePosition: gameStats.home[index].LeaguePosition,
      Last5PPG: gameStats.home[index].PPG,
      SeasonPPG: gameStats.home[index].SeasonPPG,
      lastGame: homeLastGame,
      formRun: gameStats.home[index].formRun,
      goalDifference: gameStats.home[index].goalDifference,
      goalDifferenceHomeOrAway: gameStats.home[index].goalDifferenceHomeOrAway,
      BttsPercentage: gameStats.home[index].BttsPercentage,
      BttsPercentageHomeOrAway: gameStats.home[index].BttsPercentageHomeOrAway,
      CardsTotal: gameStats.home[index].CardsTotal,
      CornersAverage: gameStats.home[index].CornersAverage,
      ScoredBothHalvesPercentage:
        gameStats.home[index].ScoredBothHalvesPercentage,
      FormTextStringHome: formTextStringHome,
      BTTSArray: bttsArrayHome,
      Results: resultsArrayHome,
      BTTSAll: gameStats.home[index].last10btts,
      BTTSHorA: gameStats.home[index].last10bttsHome
    });

    const formDataAway = [];

    formDataAway.push({
      name: game.awayTeam,
      Last5: gameStats.away[2].LastFiveForm,
      LeagueOrAll: gameStats.away[2].LeagueOrAll,
      AverageGoals: gameStats.away[index].ScoredOverall / 10,
      AverageConceeded: gameStats.away[index].ConcededOverall / 10,
      AverageXG: gameStats.away[index].XGOverall,
      AverageXGConceded: gameStats.away[index].XGAgainstAvgOverall,
      AveragePossession: gameStats.away[index].AveragePossessionOverall,
      AverageShotsOnTarget: gameStats.away[index].AverageShotsOnTargetOverall,
      AverageDangerousAttacks:
        gameStats.away[index].AverageDangerousAttacksOverall,
      homeOrAway: "Away",
      leaguePosition: gameStats.away[index].LeaguePosition,
      Last5PPG: gameStats.away[index].PPG,
      SeasonPPG: gameStats.away[index].SeasonPPG,
      lastGame: awayLastGame,
      formRun: gameStats.away[index].formRun,
      goalDifference: gameStats.away[index].goalDifference,
      goalDifferenceHomeOrAway: gameStats.away[index].goalDifferenceHomeOrAway,
      BttsPercentage: gameStats.away[index].BttsPercentage,
      BttsPercentageHomeOrAway: gameStats.away[index].BttsPercentageHomeOrAway,
      CardsTotal: gameStats.away[index].CardsTotal,
      CornersAverage: gameStats.away[index].CornersAverage,
      ScoredBothHalvesPercentage:
        gameStats.away[index].ScoredBothHalvesPercentage,
      FormTextStringAway: formTextStringAway,
      BTTSArray: bttsArrayAway,
      Results: resultsArrayAway,
      ResultsHomeOrAway: resultsArrayAway,
      BTTSAll: gameStats.away[index].last10btts,
      BTTSHorA: gameStats.away[index].last10bttsAway
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
              goals={formDataHome[0].AverageGoals}
              conceeded={formDataHome[0].AverageConceeded}
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
              BTTSAll={formDataHome[0].BTTSAll ? formDataHome[0].BTTSAll : '"Get Predictions" first'}
              BTTSHorA={formDataHome[0].BTTSHorA ? formDataHome[0].BTTSHorA : '"Get Predictions" first'}
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
              goals={formDataAway[0].AverageGoals}
              conceeded={formDataAway[0].AverageConceeded}
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
              BTTSAll={formDataAway[0].BTTSAll ? formDataAway[0].BTTSAll : '"Get Predictions" first'}
              BTTSHorA={formDataAway[0].BTTSHorA ? formDataAway[0].BTTSHorA : '"Get Predictions" first'}
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
            ]}
            data2={[
              awayAttackStrength,
              awayDefenceStrength,
              awayPossessionStrength,
              awayXGForStrength,
              awayXGAgainstStrength,
            ]}
            team1={game.homeTeam}
            team2={game.awayTeam}
          ></RadarChart>
          <BarChart
            data1={[
              formDataHome[0].AverageGoals,
              formDataAway[0].AverageConceeded,
              gameStats.home[0].PPG,
              formDataHome[0].AverageXG,
              formDataAway[0].AverageXGConceded,
              formDataHome[0].AverageShotsOnTarget,
              formDataHome[0].AverageDangerousAttacks /7.5,
              formDataHome[0].AveragePossession / 7.5,
              formDataHome[0].goalDifferenceHomeOrAway / 5,
              formDataHome[0].CornersAverage,
            ]}
            data2={[
              formDataAway[0].AverageGoals,
              formDataHome[0].AverageConceeded,
              gameStats.away[0].PPG,
              formDataAway[0].AverageXG,
              formDataHome[0].AverageXGConceded,
              formDataAway[0].AverageShotsOnTarget,
              formDataAway[0].AverageDangerousAttacks / 7.5,
              formDataHome[0].AveragePossession / 7.5,
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
              Math.max(rollingGoalDiffTotalHome[rollingGoalDiffTotalHome.length -1], rollingGoalDiffTotalAway[rollingGoalDiffTotalAway.length -1]) > 2
                ? Math.max(rollingGoalDiffTotalHome[rollingGoalDiffTotalHome.length -1], rollingGoalDiffTotalAway[rollingGoalDiffTotalAway.length -1])
                : 2
            }
            depth={
              Math.min(rollingGoalDiffTotalHome[rollingGoalDiffTotalHome.length -1], rollingGoalDiffTotalAway[rollingGoalDiffTotalAway.length -1]) < -2
                ? Math.min(rollingGoalDiffTotalHome[rollingGoalDiffTotalHome.length -1], rollingGoalDiffTotalAway[rollingGoalDiffTotalAway.length -1])
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
