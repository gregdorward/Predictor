import React, {
  useState,
  useEffect,
  Fragment,
  useCallback,
  useMemo,
} from "react";
// import ReactDOM from "react-dom";
import { Button } from "./Button";
import SofaLineupsWidget from "./SofaScore";
import Div from "./Div";
import {
  Chart,
  MultilineChart,
  RadarChart,
  BarChart,
  BarChartTwo,
  DoughnutChart,
} from "./Chart";
import Collapsable from "../components/CollapsableElement";
import Stats from "../components/createStatsDiv";
import { allLeagueResultsArrayOfObjects } from "../logic/getFixtures";
import { userDetail } from "../logic/authProvider";
import { clicked, getPointsFromLastX } from "../logic/getScorePredictions";
import { arrayOfGames } from "../logic/getFixtures";

import { getTeamStats } from "../logic/getTeamStats";
import { checkUserPaidStatus } from "../logic/hasUserPaid";
import { getPointAverage } from "../logic/getStats";
import { allForm } from "../logic/getFixtures";

import {
  calculateAttackingStrength,
  calculateDefensiveStrength,
  calculateMetricStrength,
} from "../logic/getStats";

// let id, team1, team2, timestamp, homeGoals, awayGoals;

function GameStats({ game, displayBool }) {
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

  // State Variables
  const [isLoading, setIsLoading] = useState(false);
  const [aiMatchPreview, setAiMatchPreview] = useState(null);
  const [paid, setPaid] = useState(false);
  const [hasCompleteData, setHasCompleteData] = useState(false);
  //   const [homeForm, setHomeForm] = useState(null);
  //   const [awayForm, setAwayForm] = useState(null);
  let gameStats = allForm.find((match) => match.id === game.id);
  const homeForm = gameStats?.home[2];
  const awayForm = gameStats?.away[2];

  //   const [id, setId] = useState("0");
  //   const [team1, setTeam1] = useState("N/A");
  //   const [team2, setTeam2] = useState("N/A");
  //   const [time, setTime] = useState(1);
  //   const [timestamp, setTimestamp] = useState(1);
  //   const [homeGoals, setHomeGoals] = useState("-");
  //   const [awayGoals, setAwayGoals] = useState("-");
  //   const [rollingGoalDiffTotalHome, setRollingGoalDiffTotalHome] = useState([]);
  //   const [rollingGoalDiffTotalAway, setRollingGoalDiffTotalAway] = useState([]);
  //   const [rollingXGDiffTotalHome, setRollingXGDiffTotalHome] = useState([]);
  //   const [rollingXGDiffTotalAway, setRollingXGDiffTotalAway] = useState([]);

  // These need to be declared *outside* the `if` block
  //   const [formDataHome, setFormDataHome] = useState([]);
  //   const [formDataAway, setFormDataAway] = useState([]);
  const [matchingGame, setMatchingGame] = useState(null); // State for the game
  const [id, setId] = useState("0");
  const [team1, setTeam1] = useState("N/A");
  const [team2, setTeam2] = useState("N/A");
  const [timestamp, setTimestamp] = useState(1);
  const [homeGoals, setHomeGoals] = useState("-");
  const [awayGoals, setAwayGoals] = useState("-");
  const [homeXGRating, setHomeXGRating] = useState(0);
  const [awayXGRating, setAwayXGRating] = useState(0);
  const [homeAttackStrength, setHomeAttackStrength] = useState(0);
  const [homeDefenceStrength, setHomeDefenceStrength] = useState(0);
  const [homePossessionStrength, setHomePossessionStrength] = useState(0);
  const [homeXGForStrength, setHomeXGForStrength] = useState(0);
  const [homeXGAgainstStrength, setHomeXGAgainstStrength] = useState(0);
  const [homeDirectnessStrength, setHomeDirectnessStrength] = useState(0);
  const [homeAccuracyOverallStrength, setHomeAccuracyOverallStrength] =
    useState(0);
  const [awayAttackStrength, setAwayAttackStrength] = useState(0);
  const [awayDefenceStrength, setAwayDefenceStrength] = useState(0);
  const [awayPossessionStrength, setAwayPossessionStrength] = useState(0);
  const [awayXGForStrength, setAwayXGForStrength] = useState(0);
  const [awayXGAgainstStrength, setAwayXGAgainstStrength] = useState(0);
  const [awayDirectnessStrength, setAwayDirectnessStrength] = useState(0);
  const [awayAccuracyOverallStrength, setAwayAccuracyOverallStrength] =
    useState(0);
  //   const [formArrayHome, setFormArrayHome] = useState([]);
  //   const [formArrayAway, setFormArrayAway] = useState([]);
  //   const [chartType, setChartType] = useState("");
  const [rollingSOTDiffTotalHome, setRollingSOTDiffTotalHome] = useState([]);
  const [similarGamesHome, setSimilarGamesHome] = useState([]);
  const [similarGamesAway, setSimilarGamesAway] = useState([]);

  const [homeFiveGameAverage, setHomeFiveGameAverage] = useState(0);
  const [homeSixGameAverage, setHomeSixGameAverage] = useState(0);
  const [homeTenGameAverage, setHomeTenGameAverage] = useState(0);
  const [awayFiveGameAverage, setAwayFiveGameAverage] = useState(0);
  const [awaySixGameAverage, setAwaySixGameAverage] = useState(0);
  const [awayTenGameAverage, setAwayTenGameAverage] = useState(0);
  const [homeAttackStrengthLast5, setHomeAttackStrengthLast5] = useState(
    homeForm?.attackingStrengthLast5 || null
  );
  const [homeOnlyAttackStrength, setHomeOnlyAttackStrength] = useState(
    homeForm?.attackingStrengthHomeOnly || null
  );
  const [homeDefenceStrengthLast5, setHomeDefenceStrengthLast5] = useState(
    homeForm?.defensiveStrengthLast5 || null
  );
  const [homeOnlyDefenceStrength, setHomeOnlyDefenceStrength] = useState(
    homeForm?.defensiveStrengthHomeOnly || null
  );
  const [homePossessionStrengthLast5, setHomePossessionStrengthLast5] =
    useState(homeForm?.possessionStrengthLast5 || null);
  const [homeOnlyPossessionStrength, setHomeOnlyPossessionStrength] = useState(
    homeForm?.possessionStrengthHomeOnly || null
  );
  const [homeXGForStrengthLast5, setHomeXGForStrengthLast5] = useState(
    homeForm?.xgForStrengthLast5 || null
  );
  const [homeOnlyXGForStrength, setHomeOnlyXGForStrength] = useState(
    homeForm?.xgForStrengthHomeOnly || null
  );
  const [homeXGAgainstStrengthLast5, setHomeXGAgainstStrengthLast5] = useState(
    homeForm?.xgAgainstStrengthLast5 || null
  );
  const [homeOnlyXGAgainstStrength, setHomeOnlyXGAgainstStrength] = useState(
    homeForm?.xgAgainstStrengthHomeOnly || null
  );
  const [homeDirectnessStrengthLast5, setHomeDirectnessStrengthLast5] =
    useState(homeForm?.directnessOverallStrengthLast5 || null);
  const [homeOnlyDirectnessStrength, setHomeOnlyDirectnessStrength] = useState(
    homeForm?.directnessHomeStrength || null
  );
  const [
    homeAccuracyOverallStrengthLast5,
    setHomeAccuracyOverallStrengthLast5,
  ] = useState(homeForm?.accuracyOverallStrengthLast5 || null);
  const [homeOnlyAccuracyOverallStrength, setHomeOnlyAccuracyOverallStrength] =
    useState(homeForm?.accuracyHomeStrength || null);
  const [awayAttackStrengthLast5, setAwayAttackStrengthLast5] = useState(
    awayForm?.attackingStrengthLast5 || null
  );
  const [awayOnlyAttackStrength, setAwayOnlyAttackStrength] = useState(
    awayForm?.attackingStrengthAwayOnly || null
  );
  const [awayDefenceStrengthLast5, setAwayDefenceStrengthLast5] = useState(
    awayForm?.defensiveStrengthLast5 || null
  );
  const [awayOnlyDefenceStrength, setAwayOnlyDefenceStrength] = useState(
    awayForm?.defensiveStrengthAwayOnly || null
  );
  const [awayPossessionStrengthLast5, setAwayPossessionStrengthLast5] =
    useState(awayForm?.possessionStrengthLast5 || null);
  const [awayOnlyPossessionStrength, setAwayOnlyPossessionStrength] = useState(
    awayForm?.possessionStrengthAwayOnly || null
  );
  const [awayXGForStrengthLast5, setAwayXGForStrengthLast5] = useState(
    awayForm?.xgForStrengthLast5 || null
  );
  const [awayOnlyXGForStrength, setAwayOnlyXGForStrength] = useState(
    awayForm?.xgForStrengthAwayOnly || null
  );
  const [awayXGAgainstStrengthLast5, setAwayXGAgainstStrengthLast5] = useState(
    awayForm?.xgAgainstStrengthLast5 || null
  );
  const [awayOnlyXGAgainstStrength, setAwayOnlyXGAgainstStrength] = useState(
    awayForm?.xgAgainstStrengthAwayOnly || null
  );
  const [awayDirectnessStrengthLast5, setAwayDirectnessStrengthLast5] =
    useState(awayForm?.directnessOverallStrengthLast5 || null);
  const [awayOnlyDirectnessStrength, setAwayOnlyDirectnessStrength] = useState(
    awayForm?.directnessAwayStrength || null
  );
  const [
    awayAccuracyOverallStrengthLast5,
    setAwayAccuracyOverallStrengthLast5,
  ] = useState(awayForm?.accuracyOverallStrengthLast5 || null);
  const [awayOnlyAccuracyOverallStrength, setAwayOnlyAccuracyOverallStrength] =
    useState(awayForm?.accuracyAwayStrength || null);

  const [gameArrayHomeTeamHomeGames, setGameArrayHomeTeamHomeGames] = useState(
    []
  );
  const [gameArrayAwayTeamAwayGames, setGameArrayAwayTeamAwayGames] = useState(
    []
  );

  const [firstRenderDone, setFirstRenderDone] = useState(false);
  const [rollingSOTDiffTotalAway, setRollingSOTDiffTotalAway] = useState([]);
  const [divider, setDivider] = useState(0);
  const gameArrayHome = [];
  const gameArrayAway = [];
  let goalDiffArrayHome;
  let goalDiffArrayAway;
  let xgDiffArrayHome;
  let xgDiffArrayAway;
  let sotDiffArrayHome;
  let sotDiffArrayAway;
  let rollingGoalDiffTotalHome = [];
  let rollingGoalDiffTotalAway = [];
  let rollingXGDiffTotalHome = [];
  let rollingXGDiffTotalAway = [];

  const pos = allLeagueResultsArrayOfObjects
    .map((i) => i.id)
    .indexOf(gameStats.leagueId);
  let matches = allLeagueResultsArrayOfObjects[pos];
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
          case resultHome[i].homeGoalCount === resultHome[i].awayGoalCount:
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
          case resultHome[i].homeGoalCount === resultHome[i].awayGoalCount:
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
          case resultAway[i].awayGoalCount === resultAway[i].homeGoalCount:
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
          case resultAway[i].homeGoalCount === resultAway[i].awayGoalCount:
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

  gameArrayHome.sort((a, b) => b.unixTimestamp - a.unixTimestamp);

  goalDiffArrayHome = homeForm.allTeamResults.map(
    (a) => a.scored - a.conceeded
  );
  goalDiffArrayHome = goalDiffArrayHome.reverse();
  xgDiffArrayHome = homeForm.allTeamResults.map((a) => a.XG - a.XGAgainst);
  xgDiffArrayHome = xgDiffArrayHome.reverse();

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

  goalDiffArrayAway = awayForm.allTeamResults.map(
    (a) => a.scored - a.conceeded
  );
  goalDiffArrayAway = goalDiffArrayAway.reverse();
  xgDiffArrayAway = awayForm.allTeamResults.map((a) => a.XG - a.XGAgainst);
  xgDiffArrayAway = xgDiffArrayAway.reverse();

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

  async function getGameIdByHomeTeam(games, homeTeamName) {
    const matchingGames = games.filter((game) =>
      game.homeTeam.includes(homeTeamName)
    );
    if (matchingGames.length > 0) {
      return matchingGames[0];
    } else {
      return null; // or any other value you prefer to return if no match is found
    }
  }

  useEffect(() => {
    async function fetchMatchingGame() {
      try {
        const gameInfo = await getGameIdByHomeTeam(arrayOfGames, game.homeTeam); // Await here
        setMatchingGame(gameInfo);
      } catch (error) {
        console.error("Error fetching game info:", error);
        // Handle the error appropriately (e.g., set an error state)
      }
    }

    fetchMatchingGame(); // Call the async function
  }, [arrayOfGames, game.homeTeam]); // Dependencies for useEffect

  useEffect(() => {
    if (matchingGame) {
      setId(matchingGame.id.toString());
      setTeam1(matchingGame.homeTeam);
      setTeam2(matchingGame.awayTeam);
      setTimestamp(matchingGame.time);
      setHomeGoals(matchingGame.homeGoals);
      setAwayGoals(matchingGame.awayGoals);
    } else {
      setId("0");
      setTeam1("N/A");
      setTeam2("N/A");
      setTimestamp(1);
      setHomeGoals("-");
      setAwayGoals("-");
    }
  }, [matchingGame]); //This useEffect hook runs whenever matchingGame changes.

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

  function singleSimilarResult(game) {
    return (
      <div>
        <div className="ResultRowSmallDate">
          <span>{game.date}</span>
        </div>
      </div>
    );
  }

  function StatsHomeComponent() {
    if (!homeForm) return null;
    return (
      <div className="flex-childOne">
        <ul style={style}>
          <Stats
            style={style}
            homeOrAway="Home"
            gameCount={divider}
            key={formDataHome[0].name}
            last5={formDataHome[0].Last5}
            // homeOrAwayResults={gameArrayHomeTeamHomeGames}
            LeagueOrAll={formDataHome[0].LeagueOrAll}
            className={"KeyStatsHome"}
            name={formDataHome[0].name}
            goals={homeForm.avgScored}
            conceeded={homeForm.avgConceeded}
            XG={homeForm.XGOverall.toFixed(2)}
            XGConceded={homeForm.XGAgainstAvgOverall.toFixed(2)}
            XGSwing={homeForm.XGChangeRecently}
            possession={homeForm.AveragePossessionOverall.toFixed(2)}
            sot={homeForm.AverageShotsOnTargetOverall.toFixed(2)}
            dangerousAttacks={
              homeForm.AverageDangerousAttacksOverall !== 0
                ? homeForm.AverageDangerousAttacksOverall.toFixed(2)
                : homeForm.AverageDangerousAttacks
            }
            leaguePosition={
              formDataHome[0].leaguePosition !== undefined &&
              formDataHome[0].leaguePosition !== "undefined"
                ? formDataHome[0].leaguePosition
                : 0
            }
            rawPosition={
              game.homeRawPosition !== undefined &&
              game.homeRawPosition !== "undefined"
                ? game.homeRawPosition
                : 0
            }
            homeOrAwayLeaguePosition={
              game.homeTeamHomePosition !== undefined &&
              game.homeTeamHomePosition !== "undefined"
                ? game.homeTeamHomePosition
                : 0
            }
            winPercentage={homeForm.homePPGAv ? homeForm.homePPGAv : "N/A"}
            lossPercentage={
              game.homeTeamLossPercentage ? game.homeTeamLossPercentage : "N/A"
            }
            drawPercentage={
              game.homeTeamDrawPercentage ? game.homeTeamDrawPercentage : "N/A"
            }
            ppg={formDataHome[0].SeasonPPG}
            formTrend={[
              homeTenGameAverage.toFixed(2),
              homeSixGameAverage.toFixed(2),
              homeFiveGameAverage.toFixed(2),
            ]}
            formRun={homeForm.resultsAll.reverse()}
            goalDifference={formDataHome[0].goalDifference}
            goalDifferenceHomeOrAway={formDataHome[0].goalDifferenceHomeOrAway}
            BttsPercentage={formDataHome[0].BttsPercentage}
            BttsPercentageHomeOrAway={formDataHome[0].BttsPercentageHomeOrAway}
            BTTSArray={formDataHome[0].BTTSArray}
            Results={formDataHome[0].Results}
            ResultsHorA={formDataHome[0].ResultsHorA}
            CardsTotal={formDataHome[0].CardsTotal}
            CornersAverage={homeForm.AverageCorners}
            ScoredBothHalvesPercentage={
              formDataHome[0].ScoredBothHalvesPercentage
            }
            // FormTextString={formDataHome[0].FormTextStringHome}
            FavouriteRecord={formDataHome[0].FavouriteRecord}
            StyleOfPlay={formDataHome[0].styleOfPlayOverall}
            StyleOfPlayHomeOrAway={formDataHome[0].styleOfPlayHome}
          />
        </ul>
      </div>
    );
  }

  // Component: StatsAway (Render Away Team Stats)
  function StatsAwayComponent() {
    if (!awayForm) return null;
    return (
      <div className="flex-childTwo">
        <ul style={style}>
          <Stats
            style={style}
            homeOrAway="Away"
            gameCount={divider}
            key={formDataAway[0].name}
            last5={formDataAway[0].Last5}
            // homeOrAwayResults={gameArrayAwayTeamAwayGames}
            LeagueOrAll={formDataAway[0].LeagueOrAll}
            className={"KeyStatsAway"}
            classNameTwo={"FormStatsAway"}
            name={formDataAway[0].name}
            goals={awayForm.avgScored}
            conceeded={awayForm.avgConceeded}
            XG={awayForm.XGOverall.toFixed(2)}
            XGConceded={awayForm.XGAgainstAvgOverall.toFixed(2)}
            XGSwing={awayForm.XGChangeRecently}
            //todo add goal diff and btts percentages
            possession={awayForm.AveragePossessionOverall.toFixed(2)}
            rawPosition={game.awayRawPosition ? game.awayRawPosition : 0}
            sot={awayForm.AverageShotsOnTargetOverall.toFixed(2)}
            dangerousAttacks={
              awayForm.AverageDangerousAttacksOverall !== 0
                ? awayForm.AverageDangerousAttacksOverall.toFixed(2)
                : awayForm.AverageDangerousAttacks
            }
            leaguePosition={
              formDataAway[0].leaguePosition !== undefined &&
              formDataAway[0].leaguePosition !== "undefined"
                ? formDataAway[0].leaguePosition
                : 0
            }
            homeOrAwayLeaguePosition={
              game.awayTeamAwayPosition !== undefined &&
              game.awayTeamAwayPosition !== "undefinedundefined"
                ? game.awayTeamAwayPosition
                : 0
            }
            winPercentage={awayForm.awayPPGAv ? awayForm.awayPPGAv : "N/A"}
            lossPercentage={
              game.awayTeamLossPercentage ? game.awayTeamLossPercentage : "N/A"
            }
            drawPercentage={
              game.awayTeamDrawPercentage ? game.awayTeamDrawPercentage : "N/A"
            }
            ppg={formDataAway[0].SeasonPPG}
            formTrend={[
              awayTenGameAverage.toFixed(2),
              awaySixGameAverage.toFixed(2),
              awayFiveGameAverage.toFixed(2),
            ]}
            formRun={awayForm.resultsAll.reverse()}
            goalDifference={formDataAway[0].goalDifference}
            goalDifferenceHomeOrAway={formDataAway[0].goalDifferenceHomeOrAway}
            BttsPercentage={formDataAway[0].BttsPercentage}
            BttsPercentageHomeOrAway={formDataAway[0].BttsPercentageHomeOrAway}
            BTTSArray={formDataAway[0].BTTSArray}
            Results={formDataAway[0].Results}
            ResultsHorA={formDataAway[0].ResultsHorA}
            CardsTotal={formDataAway[0].CardsTotal}
            CornersAverage={awayForm.AverageCorners}
            ScoredBothHalvesPercentage={
              formDataAway[0].ScoredBothHalvesPercentage
            }
            // FormTextString={formDataAway[0].FormTextStringAway}
            FavouriteRecord={formDataAway[0].FavouriteRecord}
            StyleOfPlay={formDataAway[0].styleOfPlayOverall}
            StyleOfPlayHomeOrAway={formDataAway[0].styleOfPlayAway}
          />
        </ul>
      </div>
    );
  }
  const bttsArrayHome = Array.from(gameArrayHome, (x) => x.btts);
  const bttsArrayAway = Array.from(gameArrayAway, (x) => x.btts);

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
    // BttsPercentage: homeForm.BttsPercentage || "-",
    // BttsPercentageHomeOrAway: homeForm.BttsPercentageHomeOrAway || "-",
    CardsTotal: homeForm.CardsTotal || "-",
    CornersAverage: homeForm.AverageCorners || "-",
    // FormTextStringHome: formTextStringHome,
    // FavouriteRecord:
    //   favouriteRecordHome + `. ${homeForm.reliabilityString}`,
    BTTSArray: bttsArrayHome,
    Results: homeForm.resultsAll.reverse(),
    ResultsHorA: homeForm.resultsHome,
    XGSwing: homeForm.XGChangeRecently,
    styleOfPlayOverall: homeForm.styleOfPlayOverall,
    styleOfPlayHome: homeForm.styleOfPlayHome,
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
    formRun: awayForm.formRun,
    goalDifference: awayForm.goalDifference,
    goalDifferenceHomeOrAway: awayForm.goalDifferenceHomeOrAway,
    // BttsPercentage: awayForm.BttsPercentage || "-",
    // BttsPercentageHomeOrAway: awayForm.BttsPercentageHomeOrAway || "-",
    CardsTotal: awayForm.CardsTotal || "-",
    CornersAverage: awayForm.AverageCorners || "-",
    // FormTextStringAway: formTextStringAway,
    // FavouriteRecord:
    //   favouriteRecordAway + `. ${awayForm.reliabilityString}`,
    BTTSArray: bttsArrayAway,
    Results: awayForm.resultsAll.reverse(),
    ResultsHorA: awayForm.resultsAway,
    XGSwing: awayForm.XGChangeRecently,
    styleOfPlayOverall: awayForm.styleOfPlayOverall,
    styleOfPlayAway: awayForm.styleOfPlayAway,
    // BTTSAll: awayForm.last10btts,
    // BTTSHorA: awayForm.last10bttsAway,
  });

  function getPointsFromGames(formArr) {
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

  const [showAIInsights, setShowAIInsights] = useState(false);

  let formArrayHome;
  let formArrayAway;
  let chartType;

  // Side Effect: Initialize component
  useEffect(() => {
    async function checkPaymentStatus() {
      if (userDetail?.uid) {
        try {
          const paymentStatus = await checkUserPaidStatus(userDetail.uid);
          setPaid(paymentStatus);
        } catch (error) {
          console.error("Error checking payment status:", error);
          setPaid(false); // Set to false in case of an error
        }
      } else {
        setPaid(false); // Set to false if there's no user ID
      }
    }

    checkPaymentStatus(); // Call the function
  }, [userDetail]); // Dependency on userDetail

  // Get all necessary data

  useEffect(() => {
    // useEffect to fetch and process game data based on props
    async function fetchData() {
      if (game.status === "void") return; // Exit if game is void
      if (!clicked) {
        alert("Tap Get Predictions to fetch all game stats first");
        // return;
      }
      if (!allForm || !allLeagueResultsArrayOfObjects) {
        // return;
      }

      let index = 2;
      let gameStats = allForm.find((match) => match.id === game.id);
      if (!gameStats) {
        console.warn("No game stats found for game id:", game.id);
        // return;
      }

      try {
        const pos = allLeagueResultsArrayOfObjects
          .map((i) => i.id)
          .indexOf(gameStats.leagueId);
        let matches = allLeagueResultsArrayOfObjects[pos];
        const resultHome = matches.fixtures.filter(
          (game) =>
            game.home_name === gameStats.home.teamName ||
            game.away_name === gameStats.home.teamName
        );

        const resultHomeOnly = matches.fixtures.filter(
          (game) => game.home_name === gameStats.home.teamName
        );
        const resultAway = matches.fixtures.filter(
          (game) =>
            game.away_name === gameStats.away.teamName ||
            game.home_name === gameStats.away.teamName
        );

        const resultAwayOnly = matches.fixtures.filter(
          (game) => game.away_name === gameStats.away.teamName
        );

        const homeForm = gameStats.home[index];
        const awayForm = gameStats.away[index];
        let id = game.id;

        const attackingMetricsHome = {
          "Average Dangerous Attacks":
            gameStats?.home[index]?.AverageDangerousAttacksOverall || 0,
          "Average Shots": gameStats?.home[index]?.AverageShots || 0,
          "Average Shots On Target":
            gameStats?.home[index]?.AverageShotsOnTargetOverall || 0,
          "Average Expected Goals": gameStats?.home[index]?.XGOverall || 0,
          "Recent XG": gameStats?.home[index]?.XGlast5
            ? gameStats?.home[index]?.XGlast5
            : gameStats?.home[index]?.XGOverall || 0,
          "Average Goals":
            gameStats?.home[index]?.averageScoredLeague !== undefined &&
            gameStats?.home[index]?.averageScoredLeague !== null
              ? gameStats?.home[index]?.averageScoredLeague
              : gameStats?.home[index]?.ScoredOverall / 10,
        };
        const attackingMetricsAway = {
          // averagePossession: awayForm.AveragePossessionOverall,
          "Average Dangerous Attacks":
            gameStats?.away[index]?.AverageDangerousAttacksOverall || 0,
          "Average Shots": gameStats?.away[index]?.AverageShots || 0,
          "Average Shots On Target":
            gameStats?.away[index]?.AverageShotsOnTargetOverall || 0,
          "Average Expected Goals": gameStats?.away[index]?.XGOverall || 0,
          "Recent XG": gameStats?.away[index]?.XGlast5
            ? gameStats?.away[index]?.XGlast5
            : gameStats?.away[index]?.XGOverall || 0,
          "Average Goals":
            gameStats?.away[index]?.averageScoredLeague !== undefined &&
            gameStats?.away[index]?.averageScoredLeague !== null
              ? gameStats?.away[index]?.averageScoredLeague
              : gameStats?.away[index]?.ScoredOverall / 10,
        };

        const defensiveMetricsHome = {
          "Clean Sheet Percentage":
            100 - gameStats?.home[index]?.CleanSheetPercentage || 0,
          "Average XG Against":
            gameStats?.home[index]?.XGAgainstAvgOverall || 0,
          "Recent XG Against": gameStats?.home[index]?.XGAgainstlast5
            ? gameStats?.home[index]?.XGAgainstlast5
            : gameStats?.home[index]?.XGAgainstAvgOverall || 0,
          "Average Goals Against":
            gameStats?.home[index]?.averageConceededLeague !== undefined &&
            gameStats?.home[index]?.averageConceededLeague !== null
              ? gameStats?.home[index]?.averageConceededLeague
              : gameStats?.home[index]?.ConcededOverall / 10,
        };

        const defensiveMetricsAway = {
          "Clean Sheet Percentage":
            100 - gameStats?.away[index]?.CleanSheetPercentage || 0,
          "Average XG Against":
            gameStats?.away[index]?.XGAgainstAvgOverall || 0,
          "Recent XG Against": gameStats?.away[index]?.XGAgainstlast5
            ? gameStats?.away[index]?.XGAgainstlast5
            : gameStats?.away[index]?.XGAgainstAvgOverall || 0,
          "Average Goals Against":
            gameStats?.away[index]?.averageConceededLeague !== undefined &&
            gameStats?.away[index]?.averageConceededLeague !== null
              ? gameStats?.away[index]?.averageConceededLeague
              : gameStats?.away[index]?.ConcededOverall / 10,
        };

        const attackH = await calculateAttackingStrength(attackingMetricsHome);

        setHomeAttackStrength(attackH);

        const defenceH = await calculateDefensiveStrength(defensiveMetricsHome);

        setHomeDefenceStrength(defenceH);

        const attackA = await calculateAttackingStrength(attackingMetricsAway);

        setAwayAttackStrength(attackA);

        const defenceA = await calculateDefensiveStrength(defensiveMetricsAway);

        setAwayDefenceStrength(defenceA);

        const possH = await calculateMetricStrength(
          "averagePossession",
          homeForm.AveragePossessionOverall
        );

        setHomePossessionStrength(possH);

        const possA = await calculateMetricStrength(
          "averagePossession",
          awayForm.AveragePossessionOverall
        );

        setAwayPossessionStrength(possA);

        // "Directness",
        // "Attacking precision",
        const XGForH = await calculateMetricStrength(
          "xgFor",
          homeForm.XGOverall
        );

        setHomeXGForStrength(XGForH);

        const XGForA = await calculateMetricStrength(
          "xgFor",
          awayForm.XGOverall
        );

        setAwayXGForStrength(XGForA);

        const XGAgH = await calculateMetricStrength(
          "xgAgainst",
          3 - homeForm.XGAgainstAvgOverall
        );

        setHomeXGAgainstStrength(XGAgH);

        const XGAgA = await calculateMetricStrength(
          "xgAgainst",
          3 - awayForm.XGAgainstAvgOverall
        );

        setAwayXGAgainstStrength(XGAgA);

        const directnessHome = await calculateMetricStrength(
          "directnessOverall",
          homeForm.directnessOverall
        );

        setHomeDirectnessStrength(directnessHome);

        const directnessAway = await calculateMetricStrength(
          "directnessOverall",
          awayForm.directnessOverall
        );

        setAwayDirectnessStrength(directnessAway);

        const accuracyHome = await calculateMetricStrength(
          "accuracyOverall",
          homeForm.avgShotValue
        );
        setHomeAccuracyOverallStrength(accuracyHome);

        const accuracyAway = await calculateMetricStrength(
          "accuracyOverall",
          awayForm.avgShotValue
        );
        setAwayAccuracyOverallStrength(accuracyAway);

        const home5GA = await getPointAverage(homeForm.last5Points, 5);
        setHomeFiveGameAverage(home5GA);

        const home6GA = await getPointAverage(homeForm.last6Points, 6);
        setHomeSixGameAverage(home6GA);

        const home10GA = await getPointAverage(homeForm.last10Points, 10);
        setHomeTenGameAverage(home10GA);

        const away5GA = await getPointAverage(awayForm.last5Points, 5);
        setAwayFiveGameAverage(away5GA);

        const away6GA = await getPointAverage(awayForm.last6Points, 6);
        setAwaySixGameAverage(away6GA);

        const away10GA = await getPointAverage(awayForm.last10Points, 10);
        setAwayTenGameAverage(away10GA);

        homeForm.homePPGAv = await getPointAverage(
          homeForm.homePPGame,
          homeForm.resultsHome.length
        );
        homeForm.tenGameAv = homeTenGameAverage;
        homeForm.fiveGameAv = homeFiveGameAverage;

        awayForm.awayPPGAv = await getPointAverage(
          awayForm.awayPPGame,
          awayForm.resultsAway.length
        );
        awayForm.tenGameAv = awayTenGameAverage;
        awayForm.fiveGameAv = awayFiveGameAverage;

        // const homeTeam = game.homeTeam;
        // const awayTeam = game.awayTeam;
        // console.log(homeForm);

        // setTime(game.time);
        // setTeam1(homeTeam);
        // setTeam2(awayTeam);
        // setHomeGoals(game.homeGoals);
        // setAwayGoals(game.awayGoals);

        if (id === "1") {
        }
      } catch (e) {
        console.log(e);
      } finally {
        setIsLoading(false);
        setHasCompleteData(
          game.completeData === true &&
            gameStats?.home[index].completeData === true
        );

        setFirstRenderDone(true);
      }
    }
    if (!firstRenderDone) {
      fetchData();
    }
  }, [game, displayBool, allForm, allLeagueResultsArrayOfObjects, clicked]); // Dependencies for the useCallback

  // AI Insights Generation

  const generateAIInsights = useCallback(
    async (gameId) => {
      setIsLoading(true);
      try {
        const AIPayload = {
          league: game.leagueDesc,
          gameweek: game.game_week,
          homeTeamName: game.homeTeam,
          homeLeaguePosition: homeForm?.LeaguePosition,
          homeTeamResults: homeForm?.allTeamResults,
          homeAttackingStats: homeForm?.attackingMetrics,
          homeAttackingStatsHomeOnly: homeForm?.attackingMetricsHome,
          homeDefensiveStats: homeForm?.defensiveMetrics,
          homeDefensiveStatsHomeOnly: homeForm?.defensiveMetricsHome,

          awayTeamName: game.awayTeam,
          awayLeaguePosition: awayForm?.LeaguePosition,
          awayTeamResults: awayForm?.allTeamResults,
          awayAttackingStats: awayForm?.attackingMetrics,
          awayAttackingStatsAwayOnly: awayForm?.attackingMetricsAway,
          awayDefensiveStats: awayForm?.defensiveMetrics,
          awayDefensiveStatsAwayOnly: homeForm?.defensiveMetricsAway
        };
        const response = await fetch(
          `${process.env.REACT_APP_EXPRESS_SERVER}gemini/${gameId}`,
          {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify(AIPayload),
          }
        );
        console.log(homeForm)


        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const jsonData = await response.json();
        setAiMatchPreview(jsonData);
      } catch (error) {
        console.error("Fetch error:", error);
        // Handle the error
      } finally {
        setIsLoading(false);
      }
    },
    [game, homeForm, awayForm]
  );

  // Function to format the AI Match Preview text with newlines
  const formatAIPreview = (text) => {
    if (!text) return "";
    return text.split(". ").join(".\n");
  };

  //Render the AI data
  const AIOutput = useMemo(() => {
    if (!aiMatchPreview) return null;

    const formattedText = formatAIPreview(aiMatchPreview.matchPreview);
    return (
      <>
        <h2>Preview</h2>
        <div className="AIMatchPreview">{formattedText}</div>
        <h2>AI Prediction</h2>
        <div className="AIMatchPreview">
          {aiMatchPreview.prediction}{" "}
          <i>(may not reflect the view of XGTipping)</i>
        </div>
        <div className="AIContainer">
          <div className="HomeAIInsights">
            <div>{aiMatchPreview?.homeTeam?.summary}</div>
          </div>
          <div className="AwayAIInsights">
            <div>{aiMatchPreview?.awayTeam?.summary}</div>
          </div>
        </div>
      </>
    );
  }, [aiMatchPreview]);

  let [formPointsHome, testArrayHome] = getPointsFromGames(
    gameStats.home[2].WDLRecord
  );
  let [formPointsAway, testArrayAway] = getPointsFromGames(
    gameStats.away[2].WDLRecord
  );

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
  return (
    <>
      <div style={style}>
        <Collapsable
          buttonText={"Lineups & match action"}
          classNameButton="Lineups"
          element={
            <>
              <SofaLineupsWidget
                id={id}
                team1={team1}
                team2={team2}
                time={timestamp}
                homeGoals={homeGoals}
                awayGoals={awayGoals}
              ></SofaLineupsWidget>
            </>
          }
        />
        <div style={style}>
          <Div className="MatchTime" text={`Kick off: ${time} GMT`}></Div>
        </div>
        <div id="AIInsightsContainer" className="AIInsightsContainer">
          {!paid && game.leagueID !== 12451 && <div>Paid feature only</div>}
          <Button
            className="AIInsights"
            onClickEvent={() => {
              generateAIInsights(game.id);
              setShowAIInsights(true);
            }}
            text={"XG AI"}
            disabled={!paid && game.leagueID !== 12451}
          ></Button>
          {showAIInsights && ( // Conditionally Render the AI Insights.
            <div className="AIOutputContainer">
              {isLoading ? <p>Loading AI data....</p> : AIOutput}
            </div>
          )}
        </div>
        <div className="flex-container">
          <StatsHomeComponent />
          <StatsAwayComponent />
        </div>
        <div className="Chart" id={`Chart${game.id}`} style={style}>
          <RadarChart
            title="XG Tipping Strength Ratings - All Games"
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
          <RadarChart
            title="XG Tipping Strength Ratings - Last 5 games"
            data={[
              homeAttackStrengthLast5,
              homeDefenceStrengthLast5,
              homePossessionStrengthLast5,
              homeXGForStrengthLast5,
              homeXGAgainstStrengthLast5,
              homeDirectnessStrengthLast5,
              homeAccuracyOverallStrengthLast5,
            ]}
            data2={[
              awayAttackStrengthLast5,
              awayDefenceStrengthLast5,
              awayPossessionStrengthLast5,
              awayXGForStrengthLast5,
              awayXGAgainstStrengthLast5,
              awayDirectnessStrengthLast5,
              awayAccuracyOverallStrengthLast5,
            ]}
            team1={game.homeTeam}
            team2={game.awayTeam}
          ></RadarChart>
          <RadarChart
            title="XG Tipping Strength Ratings - Home/Away Games Only"
            data={[
              homeOnlyAttackStrength,
              homeOnlyDefenceStrength,
              homeOnlyPossessionStrength,
              homeOnlyXGForStrength,
              homeOnlyXGAgainstStrength,
              homeOnlyDirectnessStrength,
              homeOnlyAccuracyOverallStrength,
            ]}
            data2={[
              awayOnlyAttackStrength,
              awayOnlyDefenceStrength,
              awayOnlyPossessionStrength,
              awayOnlyXGForStrength,
              awayOnlyXGAgainstStrength,
              awayOnlyDirectnessStrength,
              awayOnlyAccuracyOverallStrength,
            ]}
            team1={game.homeTeam}
            team2={game.awayTeam}
          ></RadarChart>
          <DoughnutChart
            data={[homeForm.XGRating, awayForm.XGRating]}
            homeTeam={game.homeTeam}
            awayTeam={game.awayTeam}
          ></DoughnutChart>
          <BarChartTwo
            text="Recent XG Differential Swing"
            homeTeam={homeForm.teamName}
            awayTeam={awayForm.teamName}
            data1={[homeForm.XGChangeRecently.toFixed(2)]}
            data2={[awayForm.XGChangeRecently.toFixed(2)]}
          ></BarChartTwo>
          <BarChart
            text="H2H - Home Team | Away Team"
            data1={[
              homeForm.avgScored * 2,
              awayForm.avgConceeded * 2,
              homeForm.avPointsAll * 3,
              homeForm.XGOverall * 2,
              awayForm.XGAgainstAvgOverall * 2,
              homeForm.AverageShotsOnTargetOverall,
              homeForm.AverageDangerousAttacksOverall !== 0
                ? homeForm.AverageDangerousAttacksOverall / 7.5
                : homeForm.AverageDangerousAttacks / 7.5,
              homeForm.AveragePossessionOverall / 7.5,
              homeForm.goalDifferenceHomeOrAway / 10,
              homeForm.AverageCorners,
            ]}
            data2={[
              awayForm.avgScored * 2,
              homeForm.avgConceeded * 2,
              awayForm.avPointsAll * 3,
              awayForm.XGOverall * 2,
              homeForm.XGAgainstAvgOverall * 2,
              awayForm.AverageShotsOnTargetOverall,
              awayForm.AverageDangerousAttacksOverall !== 0
                ? awayForm.AverageDangerousAttacksOverall / 7.5
                : awayForm.AverageDangerousAttacks / 7.5,
              awayForm.AveragePossessionOverall / 7.5,
              awayForm.goalDifferenceHomeOrAway / 10,
              awayForm.AverageCorners,
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
          <MultilineChart
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
            data3={rollingXGDiffTotalHome}
            data4={rollingXGDiffTotalAway}
            team1={game.homeTeam}
            team2={game.awayTeam}
            type={"Goal/XG difference over time"}
            tension={0.5}
          ></MultilineChart>
        </div>
        <Div
          text={`Last league games (most recent first)`}
          className={"LastGameHeader"}
        ></Div>
        <div className="flex-container">
          <div className="flex-childOneOverviewSmall">{overviewHome}</div>
          <div className="flex-childTwoOverviewSmall">{overviewAway}</div>
        </div>
        {/* <h2>Results from similar profile games</h2>
        <span>(Games where each team had similar odds)</span>
        <h3>Most recent first</h3>
        <div className="flex-container-similar">
          <div className="flex-childOneOverviewSmall">{similarGamesHome}</div>
          <div className="flex-childTwoOverviewSmall">{similarGamesAway}</div>
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
          text={"Fixture trends + AI Preview"}
        ></Button> */}
      </div>
    </>
  );
}

export default GameStats;
