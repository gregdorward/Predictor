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
  BarChartLeagueStats,
} from "./Chart";
import MultiTypeChart from "./MultitypeChart"; // Adjust the path if necessary
import { Slider } from "../components/CarouselXGChart";
import Collapsable from "../components/CollapsableElement";
import Stats from "../components/createStatsDiv";
import TeamRankingsFlexView from "./TeamRankingsFlexView";
import {
  allLeagueResultsArrayOfObjects,
  basicTableArray,
} from "../logic/getFixtures";
import { userDetail } from "../logic/authProvider";
import { clicked, getPointsFromLastX } from "../logic/getScorePredictions";
import { arrayOfGames } from "../logic/getFixtures";
import GenerateFormSummary from "../logic/compareFormTrend";

import { getTeamStats } from "../logic/getTeamStats";
import { checkUserPaidStatus } from "../logic/hasUserPaid";
import { getPointAverage } from "../logic/getStats";
import { allForm } from "../logic/getFixtures";
import MissingPlayersList from "../components/MissingPlayersList";
import { StreakStats } from "../components/StreakStats";
import {
  calculateAttackingStrength,
  calculateDefensiveStrength,
  calculateMetricStrength,
} from "../logic/getStats";
import finalPropsSelectorFactory from "react-redux/es/connect/selectorFactory";
import { dynamicDate } from "../logic/getFixtures";
export let userTips;
let setUserTips;

// let id, team1, team2, timestamp, homeGoals, awayGoals;

function GameStats({ game, displayBool, stats }) {
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
  [userTips, setUserTips] = useState(() => {
    const savedTips = localStorage.getItem("userTips");
    return savedTips ? JSON.parse(savedTips) : [];
  });
  const [homeMissingPlayersList, setHomeMissingPlayersList] = useState([]);
  const [awayMissingPlayersList, setAwayMissingPlayersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingStreaks, setLoadingStreaks] = useState(true);

  const [streakData, setStreakData] = useState([]);

  // Save to localStorage whenever userTips changes
  useEffect(() => {
    localStorage.setItem("userTips", JSON.stringify(userTips));
  }, [userTips]);

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
  const [formSummaries, setFormSummary] = useState([]);
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

  const allResultsHome = useMemo(() => {
    return [...homeForm.allTeamResults].sort((b, a) => b.dateRaw - a.dateRaw);
  }, [homeForm.allTeamResults]); // Only re-sort if homeForm.allTeamResults changes

  const homeResults = useMemo(() => {
    return [...homeForm.homeResults].sort((b, a) => b.dateRaw - a.dateRaw);
  }, [homeForm.homeResults]); // Only re-sort if homeForm.homeResults changes

  const allResultsAway = useMemo(() => {
    // Assuming awayForm.allTeamResults is an array
    return [...awayForm.allTeamResults].sort((b, a) => b.dateRaw - a.dateRaw);
  }, [awayForm.allTeamResults]);

  const awayResults = useMemo(() => {
    return [...awayForm.awayResults].sort((b, a) => b.dateRaw - a.dateRaw);
  }, [awayForm.awayResults]); // Only re-sort if awayForm.awayResults changes

  // Memoize the derived arrays
  const goalDiffArrayHome = useMemo(() => {
    return allResultsHome.map((a) => a.scored - a.conceeded);
  }, [allResultsHome]);

  const xgDiffArrayHome = allResultsHome.map((a) => a.XG - a.XGAgainst);
  const xgDiffArrayAway = allResultsAway.map((a) => a.XG - a.XGAgainst);

  const rollingGoalDiffTotalHome = useMemo(() => {
    return goalDiffArrayHome.map(
      (
        (sum) => (value) =>
          (sum += value)
      )(0)
    );
  }, [goalDiffArrayHome]);

  const rollingXGDiffTotalHome = xgDiffArrayHome.map(
    (
      (sum) => (value) =>
        (sum += value)
    )(0)
  );

  const goalDiffArrayHomeOnly = useMemo(() => {
    return homeResults.map((a) => a.scored - a.conceeded);
  }, [homeResults]);

  const goalDiffArrayAwayOnly = useMemo(() => {
    return awayResults.map((a) => a.scored - a.conceeded);
  }, [awayResults]);

  const xgDiffArrayHomeOnly = useMemo(() => {
    return homeResults.map((a) => a.XG - a.XGAgainst);
  }, [homeResults]);

  const xgDiffArrayAwayOnly = useMemo(() => {
    return awayResults.map((a) => a.XG - a.XGAgainst);
  }, [awayResults]);

  const rollingGoalDiffTotalHomeOnly = useMemo(() => {
    return goalDiffArrayHomeOnly.map(
      (
        (sum) => (value) =>
          (sum += value)
      )(0)
    );
  }, [goalDiffArrayHomeOnly]);

  const rollingXGDiffTotalHomeOnly = useMemo(() => {
    return xgDiffArrayHomeOnly.map(
      (
        (sum) => (value) =>
          (sum += value)
      )(0)
    );
  }, [xgDiffArrayHomeOnly]);

  const goalDiffArrayAway = useMemo(() => {
    return allResultsAway.map((a) => a.scored - a.conceeded);
  }, [allResultsAway]);

  const rollingGoalDiffTotalAway = goalDiffArrayAway.map(
    (
      (sum) => (value) =>
        (sum += value)
    )(0)
  );

  const rollingXGDiffTotalAway = xgDiffArrayAway.map(
    (
      (sum) => (value) =>
        (sum += value)
    )(0)
  );

  const rollingGoalDiffTotalAwayOnly = useMemo(() => {
    return goalDiffArrayAwayOnly.map(
      (
        (sum) => (value) =>
          (sum += value)
      )(0)
    );
  }, [goalDiffArrayAwayOnly]);

  const rollingXGDiffTotalAwayOnly = useMemo(() => {
    return xgDiffArrayAwayOnly.map(
      (
        (sum) => (value) =>
          (sum += value)
      )(0)
    );
  }, [xgDiffArrayAwayOnly]);

  //It is unlikely that slice will be an array without useMemo, so you need to ensure it works for all relevant ones.
  const rollingGoalDiffTotalHomeLast5 = useMemo(() => {
    return goalDiffArrayHome
      .slice(Math.max(goalDiffArrayHome.length - 5, 0))
      .map(
        (
          (sum) => (value) =>
            (sum += value)
        )(0)
      );
  }, [goalDiffArrayHome]);

  const rollingXGDiffTotalHomeLast5 = useMemo(() => {
    return xgDiffArrayHome.slice(Math.max(xgDiffArrayHome.length - 5, 0)).map(
      (
        (sum) => (value) =>
          (sum += value)
      )(0)
    );
  }, [xgDiffArrayHome]);

  const rollingGoalDiffTotalAwayLast5 = useMemo(() => {
    return goalDiffArrayAway
      .slice(Math.max(goalDiffArrayAway.length - 5, 0))
      .map(
        (
          (sum) => (value) =>
            (sum += value)
        )(0)
      );
  }, [goalDiffArrayAway]);

  const rollingXGDiffTotalAwayLast5 = useMemo(() => {
    return xgDiffArrayAway.slice(Math.max(xgDiffArrayAway.length - 5, 0)).map(
      (
        (sum) => (value) =>
          (sum += value)
      )(0)
    );
  }, [xgDiffArrayAway]);

  const [firstRenderDone, setFirstRenderDone] = useState(false);
  const [divider, setDivider] = useState(0);
  const gameArrayHome = [];
  const gameArrayAway = [];
  // const allResultsHome = homeForm.allTeamResults.sort((b, a) => b.dateRaw - a.dateRaw);
  // const homeResults = homeForm.homeResults.sort((b, a) => b.dateRaw - a.dateRaw);
  // const allResultsAway = awayForm.allTeamResults.sort((b, a) => a.dateRaw - b.dateRaw);
  // const awayResults = awayForm.awayResults.sort((b, a) => b.dateRaw - a.dateRaw);

  function formatValue(val) {
    return typeof val === "number" && val % 1 !== 0
      ? parseFloat(val.toFixed(2))
      : val;
  }

  function getTeamRanksFromTopTeamsWithPartialMatch(
    topTeamsData,
    targetTeamName
  ) {
    if (!topTeamsData) return;

    const teamRanks = {};
    const topTeams = topTeamsData.topTeams;

    // Define known aliases for ambiguous or shortened names
    const teamNameAliases = {
      "inter milan": "inter",
      "ac milan": "milan",
      "man city": "manchester city",
      "man united": "manchester united",
      psg: "paris saint-germain",
    };

    const targetNameLower = targetTeamName.toLowerCase();
    const normalizedTargetName =
      teamNameAliases[targetNameLower] || targetNameLower;

    for (const statistic in topTeams) {
      if (!Array.isArray(topTeams[statistic])) continue;

      const teamArray = topTeams[statistic];

      // Step 1: Exact match
      let targetTeamIndex = teamArray.findIndex(
        (teamInfo) => teamInfo.team.name.toLowerCase() === normalizedTargetName
      );

      // Step 2: Safe partial match if exact not found
      if (targetTeamIndex === -1) {
        const partialMatches = teamArray.filter((teamInfo) => {
          const name = teamInfo.team.name.toLowerCase();
          return (
            name.includes(normalizedTargetName) ||
            normalizedTargetName.includes(name)
          );
        });

        if (partialMatches.length === 1) {
          targetTeamIndex = teamArray.indexOf(partialMatches[0]);
        } else {
          console.warn(
            `Ambiguous or missing match for "${targetTeamName}" — found:`,
            partialMatches.map((p) => p.team.name)
          );
        }
      }

      // Step 3: Build the teamRanks object
      if (targetTeamIndex !== -1) {
        const teamInfo = teamArray[targetTeamIndex];
        teamRanks[statistic] = {
          name: teamInfo.team.name,
          rank: targetTeamIndex + 1,
          value: formatValue(teamInfo.statistics[statistic]),
          games: teamInfo.statistics.matches,
        };
      } else {
        teamRanks[statistic] = {
          name: null,
          rank: null,
          error: "Team not found in this category",
          value: null,
          games: null,
        };
      }
    }

    return teamRanks;
  }

  const ranksHome = getTeamRanksFromTopTeamsWithPartialMatch(
    stats,
    homeForm.teamName
  );
  const ranksAway = getTeamRanksFromTopTeamsWithPartialMatch(
    stats,
    awayForm.teamName
  );

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

  // let formTextStringHome
  // let formTextStringAway

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

  // goalDiffArrayHome = allResultsHome.map(
  //   (a) => a.scored - a.conceeded
  // );
  // xgDiffArrayHome = allResultsHome.map((a) => a.XG - a.XGAgainst);
  // console.log(xgDiffArrayHome)

  // goalDiffArrayHomeOnly = homeResults.map(
  //   (a) => a.scored - a.conceeded
  // );
  // xgDiffArrayHomeOnly = homeResults.map((a) => a.XG - a.XGAgainst);

  // rollingGoalDiffTotalHome = goalDiffArrayHome.map(
  //   (
  //     (sum) => (value) =>
  //       (sum += value)
  //   )(0)
  // );

  // rollingGoalDiffTotalHomeLast5 = goalDiffArrayHome.slice(0,5).map(
  //     (
  //       (sum) => (value) =>
  //         (sum += value)
  //     )(0)
  //   );

  // rollingXGDiffTotalHome = xgDiffArrayHome.slice(0,5).map(
  //   (
  //     (sum) => (value) =>
  //       (sum += value)
  //   )(0)
  // );

  // rollingXGDiffTotalHomeLast5 = xgDiffArrayHome.slice(0,5)
  //   .map(
  //     (
  //       (sum) => (value) =>
  //         (sum += value)
  //     )(0)
  //   );

  //   console.log(xgDiffArrayHome)
  //   console.log(rollingXGDiffTotalHomeLast5)

  // goalDiffArrayAway = allResultsAway.map(
  //   (a) => a.scored - a.conceeded
  // );

  // rollingGoalDiffTotalHomeOnly = goalDiffArrayHomeOnly.map(
  //   (
  //     (sum) => (value) =>
  //       (sum += value)
  //   )(0)
  // );
  // rollingXGDiffTotalHomeOnly = xgDiffArrayHomeOnly.map(
  //   (
  //     (sum) => (value) =>
  //       (sum += value)
  //   )(0)
  // );

  // xgDiffArrayAway = allResultsAway.map((a) => a.XG - a.XGAgainst);

  // goalDiffArrayAwayOnly = awayResults.map(
  //   (a) => a.scored - a.conceeded
  // );
  // xgDiffArrayAwayOnly = awayResults.map((a) => a.XG - a.XGAgainst);

  // rollingGoalDiffTotalAway = goalDiffArrayAway.map(
  //   (
  //     (sum) => (value) =>
  //       (sum += value)
  //   )(0)
  // );

  // console.log(xgDiffArrayAway)

  // rollingGoalDiffTotalAwayLast5 = goalDiffArrayAway
  //   .slice(0, 5)
  //   .map(
  //     (
  //       (sum) => (value) =>
  //         (sum += value)
  //     )(0)
  //   );

  // rollingXGDiffTotalAway = xgDiffArrayAway.map(
  //   (
  //     (sum) => (value) =>
  //       (sum += value)
  //   )(0)
  // );

  // rollingXGDiffTotalAwayLast5 = xgDiffArrayAway
  //   .slice(0, 5)
  //   .map(
  //     (
  //       (sum) => (value) =>
  //         (sum += value)
  //     )(0)
  //   );

  // rollingGoalDiffTotalAwayOnly = goalDiffArrayAwayOnly.map(
  //   (
  //     (sum) => (value) =>
  //       (sum += value)
  //   )(0)
  // );
  // rollingXGDiffTotalAwayOnly = xgDiffArrayAwayOnly.map(
  //   (
  //     (sum) => (value) =>
  //       (sum += value)
  //   )(0)
  // );

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

  async function getGameIdByAwayTeam(games, awayTeamName) {
    const matchingGames = games.filter((game) =>
      game.awayTeam.includes(awayTeamName)
    );
    if (matchingGames.length > 0) {
      return matchingGames[0];
    } else {
      return null; // or any other value you prefer to return if no match is found
    }
  }

  async function findGameByPartialMatch(gamesArray, searchText, teamType) {
    try {
      const normalize = (str) => str.toLowerCase().replace(/-/g, " ").trim();

      const normalizedSearch = normalize(searchText);

      const matchingGame = gamesArray.find((game) => {
        const teamNameInArray =
          teamType === "homeTeam" ? game.homeTeam : game.awayTeam;

        return normalizedSearch.includes(normalize(teamNameInArray));
      });

      return matchingGame || null;
    } catch (error) {
      console.error(
        `Error finding game by partial match (array value against search text) on ${teamType}:`,
        error
      );
      return null;
    }
  }

  function isBeforeTimestamp(targetTimestamp) {
    const currentTimestamp = Math.floor(Date.now() / 1000); // Get current time in seconds
    return currentTimestamp < targetTimestamp;
  }

  async function getRefStats(refId, compId) {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_EXPRESS_SERVER}referee/${refId}`
      );

      if (!response.ok) {
        // Handle HTTP errors (e.g., 404, 500)
        console.error(`HTTP error! Status: ${response.status}`);
        return null; // Or throw an error to be caught later
      }

      const refData = await response.json(); // Parse the JSON response

      // Access the array within the 'data' property
      const dataArray = refData.data;

      if (!Array.isArray(dataArray)) {
        console.error("Error: Expected 'data' property to be an array.");
        return null;
      }

      // Find the object with the matching competition_id
      const filteredObject = dataArray.find(
        (item) => item.competition_id === compId
      );

      const distilledRefData = {
        appearances_overall: filteredObject.appearances_overall,
        full_name: filteredObject.full_name,
        cards_per_match_overall: filteredObject.cards_per_match_overall,
        goals_per_match_overall: filteredObject.goals_per_match_overall,
        min_per_card_overall: filteredObject.min_per_card_overall,
        nationality: filteredObject.nationality,
        over25_cards_percentage_overall:
          filteredObject.over25_cards_percentage_overall,
        over35_cards_percentage_overall:
          filteredObject.over35_cards_percentage_overall,
        penalties_given_per_match_overall:
          filteredObject.penalties_given_per_match_overall,
        red_cards_overall: filteredObject.red_cards_overall,
      };

      return distilledRefData; // Returns the found object, or undefined if not found
    } catch (error) {
      console.error("Error fetching or processing data:", error);
      return null; // Or handle the error as appropriate for your application (e.g., display an error message to the user)
    }
  }

  const reasonCodeMap = {
    1: "Injury",
    2: "Unknown",
    3: "Suspension",
    4: "Personal Reasons",
    5: "International Duty",
    6: "Not in Squad",
    7: "Rest",
    8: "Unknown",
  };

  function getReasonDescription(code) {
    return reasonCodeMap[code] || "Unknown";
  }

  const typeCodeMap = {
    missing: "red",
    doubtful: "orange",
  };

  function getTypeColour(code) {
    return typeCodeMap[code] || "red";
  }

  const positionCodeMap = {
    G: "Goalkeeper",
    D: "Defender",
    M: "Midfielder",
    F: "Attacker",
  };

  function getPos(code) {
    return positionCodeMap[code] || "";
  }

  async function extractMissingPlayers(data) {
    const extract = (teamType) => {
      const team = data?.[teamType];
      if (!team || !Array.isArray(team.missingPlayers)) return [];

      return team.missingPlayers.map((mp) => ({
        team: teamType,
        name: mp.player?.name ?? "Unknown",
        position: getPos(mp.player?.position),
        reason: getReasonDescription(mp.reason),
        type: mp.type,
      }));
    };

    return {
      homeMissingPlayers: extract("home"),
      awayMissingPlayers: extract("away"),
    };
  }

  useEffect(() => {
    async function fetchMatchingGame() {
      try {
        let matchingGameInfo = await getGameIdByHomeTeam(
          arrayOfGames,
          game.homeTeam
        );
        console.log(matchingGameInfo);
        if (!matchingGameInfo) {
          console.log(
            `No match found for homeTeam: ${game.homeTeam}. Trying awayTeam: ${game.awayTeam}`
          );
          matchingGameInfo = await getGameIdByAwayTeam(
            arrayOfGames,
            game.awayTeam
          );
        }

        if (!matchingGameInfo) {
          console.log(
            `No exact match found for homeTeam: ${game.homeTeam}. Trying partial match...`
          );
          matchingGameInfo = await findGameByPartialMatch(
            arrayOfGames,
            game.homeTeam,
            "homeTeam"
          );
        }

        setMatchingGame(matchingGameInfo);

        if (!matchingGameInfo) {
          console.warn(
            `No matching game found for either homeTeam "${game.homeTeam}" or awayTeam "${game.awayTeam}"`
          );
          // Optionally set matchingGame to a default value (e.g., null) if needed
          // setMatchingGame(null);
        }

        const now = Math.floor(Date.now() / 1000); // current Unix timestamp in seconds
        const isWithin24Hours =
          game.date - now <= 86400 && game.date - now > 0;

          console.log(now)
          console.log(game.date)
          console.log(isWithin24Hours)

        setLoading(true);
        if (
          
            // game.leagueID === 12325 ||
            // game.leagueID === 12451 ||
            // game.leagueID === 12446 ||
            // game.leagueID === 12422 ||
            // game.leagueID === 12529 ||
            // game.leagueID === 12337 ||
            // game.leagueID === 12931 ||
            // game.leagueID === 12622 ||
            // game.leagueID === 13973) &&
          isWithin24Hours
        ) {
          const lineupDetail = await fetch(
            `${process.env.REACT_APP_EXPRESS_SERVER}lineups/${matchingGameInfo.id}`
          );

          const data = await lineupDetail.json();
          const { homeMissingPlayers, awayMissingPlayers } =
            await extractMissingPlayers(data);

          setHomeMissingPlayersList(homeMissingPlayers);
          setAwayMissingPlayersList(awayMissingPlayers);
          setLoading(false);

          console.log(homeMissingPlayersList);
          console.log(homeMissingPlayersList);
        }

        const streaks = await fetch(
          `${process.env.REACT_APP_EXPRESS_SERVER}streaks/${matchingGameInfo.id}`
        );
        setLoadingStreaks(true);

        const streaksDataRaw = await streaks.json();
        setStreakData(streaksDataRaw);
        setLoadingStreaks(false);
      } catch (error) {
        console.error("Error fetching game info:", error);
      }
    }

    fetchMatchingGame();
  }, [game.homeTeam, game.awayTeam]); // Add game.awayTeam to the dependency array

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

  function StatsHomeComponent() {
    if (!homeForm) return null;
    return (
      <div className="flex-childOne">
        <ul style={style}>
          <Stats
            games={"all"}
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
            shots={homeForm.avgShots.toFixed(2)}
            sot={homeForm.AverageShotsOnTargetOverall.toFixed(2)}
            dangerousAttacks={
              homeForm.AverageDangerousAttacksOverall !== 0
                ? homeForm.AverageDangerousAttacksOverall.toFixed(2)
                : homeForm.AverageDangerousAttacks
            }
            leaguePosition={
              homeForm.LeaguePosition !== undefined &&
              homeForm.LeaguePosition !== "undefined"
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
              homeForm.homePositionHomeOnly !== undefined &&
              homeForm.homePositionHomeOnly !== "undefined"
                ? homeForm.homePositionHomeOnly
                : 0
            }
            winPercentage={homeForm.homePPGAv ? homeForm.homePPGAv : "N/A"}
            lossPercentage={
              game.homeTeamLossPercentage ? game.homeTeamLossPercentage : "N/A"
            }
            drawPercentage={
              game.homeTeamDrawPercentage ? game.homeTeamDrawPercentage : "N/A"
            }
            ppg={homeForm.avPointsAll.toFixed(2)}
            formTrend={[
              homeTenGameAverage.toFixed(2),
              homeSixGameAverage.toFixed(2),
              homeFiveGameAverage.toFixed(2),
            ]}
            formRun={homeForm.resultsAll}
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
            FormTextString={formDataHome[0].FormTextStringHome}
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
            games={"all"}
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
            shots={awayForm.avgShots.toFixed(2)}
            dangerousAttacks={
              awayForm.AverageDangerousAttacksOverall !== 0
                ? awayForm.AverageDangerousAttacksOverall.toFixed(2)
                : awayForm.AverageDangerousAttacks
            }
            leaguePosition={
              awayForm.LeaguePosition !== undefined &&
              awayForm.LeaguePosition !== "undefined"
                ? formDataAway[0].leaguePosition
                : 0
            }
            homeOrAwayLeaguePosition={
              awayForm.awayPositionAwayOnly !== undefined &&
              awayForm.awayPositionAwayOnly !== "undefinedundefined"
                ? awayForm.awayPositionAwayOnly
                : 0
            }
            winPercentage={awayForm.awayPPGAv ? awayForm.awayPPGAv : "N/A"}
            lossPercentage={
              game.awayTeamLossPercentage ? game.awayTeamLossPercentage : "N/A"
            }
            drawPercentage={
              game.awayTeamDrawPercentage ? game.awayTeamDrawPercentage : "N/A"
            }
            ppg={awayForm.avPointsAll.toFixed(2)}
            formTrend={[
              awayTenGameAverage.toFixed(2),
              awaySixGameAverage.toFixed(2),
              awayFiveGameAverage.toFixed(2),
            ]}
            formRun={awayForm.resultsAll}
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
            FormTextString={formDataAway[0].FormTextStringAway}
            FavouriteRecord={formDataAway[0].FavouriteRecord}
            StyleOfPlay={formDataAway[0].styleOfPlayOverall}
            StyleOfPlayHomeOrAway={formDataAway[0].styleOfPlayAway}
          />
        </ul>
      </div>
    );
  }

  function StatsHomeLast5Component() {
    if (!homeForm) return null;
    return (
      <div className="flex-childOne">
        <ul style={style}>
          <Stats
            games={"last5"}
            style={style}
            homeOrAway="Home"
            gameCount={divider}
            key={formDataHome[0].name}
            last5={formDataHome[0].Last5}
            // homeOrAwayResults={gameArrayHomeTeamHomeGames}
            LeagueOrAll={formDataHome[0].LeagueOrAll}
            className={"KeyStatsHome"}
            name={formDataHome[0].name}
            goals={homeForm.last5Goals}
            conceeded={homeForm.last5GoalsConceeded}
            XG={homeForm.avXGLast5.toFixed(2)}
            XGConceded={homeForm.avXGAgainstLast5.toFixed(2)}
            possession={homeForm.avPosessionLast5.toFixed(2)}
            shots={homeForm.avShotsLast5.toFixed(2)}
            sot={homeForm.avSOTLast5.toFixed(2)}
            dangerousAttacks={
              homeForm.avDALast5 !== 0
                ? homeForm.avDALast5.toFixed(2)
                : homeForm.AverageDangerousAttacks
            }
            leaguePosition={
              homeForm.LeaguePosition !== undefined &&
              homeForm.LeaguePosition !== "undefined"
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
              homeForm.homePositionHomeOnly !== undefined &&
              homeForm.homePositionHomeOnly !== "undefined"
                ? homeForm.homePositionHomeOnly
                : 0
            }
            winPercentage={homeForm.homePPGAv ? homeForm.homePPGAv : "N/A"}
            lossPercentage={
              game.homeTeamLossPercentage ? game.homeTeamLossPercentage : "N/A"
            }
            drawPercentage={
              game.homeTeamDrawPercentage ? game.homeTeamDrawPercentage : "N/A"
            }
            ppg={homeForm.avPoints5.toFixed(2)}
            formTrend={[
              homeTenGameAverage.toFixed(2),
              homeSixGameAverage.toFixed(2),
              homeFiveGameAverage.toFixed(2),
            ]}
            formRun={homeForm.resultsAll}
            goalDifference={homeForm.last5GoalDiff}
            BttsPercentage={homeForm.bttsLast5Percentage}
            BTTSArray={formDataHome[0].BTTSArray}
            Results={formDataHome[0].Results}
            ResultsHorA={formDataHome[0].ResultsHorA}
            CornersAverage={homeForm.last5Corners}
            FormTextString={formDataHome[0].FormTextStringHome}
          />
        </ul>
      </div>
    );
  }

  // Component: StatsAway (Render Away Team Stats)
  function StatsAwayLast5Component() {
    if (!awayForm) return null;
    return (
      <div className="flex-childTwo">
        <ul style={style}>
          <Stats
            games={"last5"}
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
            goals={awayForm.last5Goals}
            conceeded={awayForm.last5GoalsConceeded}
            XG={awayForm.avXGLast5.toFixed(2)}
            XGConceded={awayForm.avXGAgainstLast5.toFixed(2)}
            //todo add goal diff and btts percentages
            possession={awayForm.avPosessionLast5.toFixed(2)}
            rawPosition={game.awayRawPosition ? game.awayRawPosition : 0}
            sot={awayForm.avSOTLast5.toFixed(2)}
            shots={awayForm.avShotsLast5.toFixed(2)}
            dangerousAttacks={
              awayForm.avDALast5 !== 0
                ? awayForm.avDALast5.toFixed(2)
                : awayForm.AverageDangerousAttacks
            }
            leaguePosition={
              awayForm.LeaguePosition !== undefined &&
              awayForm.LeaguePosition !== "undefined"
                ? formDataAway[0].leaguePosition
                : 0
            }
            homeOrAwayLeaguePosition={
              awayForm.awayPositionAwayOnly !== undefined &&
              awayForm.awayPositionAwayOnly !== "undefinedundefined"
                ? awayForm.awayPositionAwayOnly
                : 0
            }
            winPercentage={awayForm.awayPPGAv ? awayForm.awayPPGAv : "N/A"}
            lossPercentage={
              game.awayTeamLossPercentage ? game.awayTeamLossPercentage : "N/A"
            }
            drawPercentage={
              game.awayTeamDrawPercentage ? game.awayTeamDrawPercentage : "N/A"
            }
            ppg={awayForm.avPoints5.toFixed(2)}
            formTrend={[
              awayTenGameAverage.toFixed(2),
              awaySixGameAverage.toFixed(2),
              awayFiveGameAverage.toFixed(2),
            ]}
            formRun={awayForm.resultsAll}
            goalDifference={awayForm.last5GoalDiff}
            BttsPercentage={awayForm.bttsLast5Percentage}
            BTTSArray={formDataAway[0].BTTSArray}
            Results={formDataAway[0].Results}
            ResultsHorA={formDataAway[0].ResultsHorA}
            CornersAverage={awayForm.last5Corners}
          />
        </ul>
      </div>
    );
  }

  function StatsHomeOnlyComponent() {
    if (!homeForm) return null;
    return (
      <div className="flex-childOne">
        <ul style={style}>
          <Stats
            games={"hOrA"}
            style={style}
            homeOrAway="Home"
            gameCount={divider}
            key={formDataHome[0].name}
            last5={formDataHome[0].Last5}
            // homeOrAwayResults={gameArrayHomeTeamHomeGames}
            LeagueOrAll={formDataHome[0].LeagueOrAll}
            className={"KeyStatsHome"}
            name={formDataHome[0].name}
            goals={homeForm.avgScoredHome}
            conceeded={homeForm.teamConceededAvgHomeOnly.toFixed(2)}
            XG={homeForm.avgXGScoredHome.toFixed(2)}
            XGConceded={homeForm.avgXGConceededHome.toFixed(2)}
            possession={homeForm.avgPossessionHome.toFixed(2)}
            sot={homeForm.avgShotsOnTargetHome.toFixed(2)}
            shots={homeForm.avgShotsHome.toFixed(2)}
            dangerousAttacks={
              homeForm.avgDangerousAttacksHome !== 0
                ? homeForm.avgDangerousAttacksHome.toFixed(2)
                : homeForm.AverageDangerousAttacks
            }
            leaguePosition={
              homeForm.homePositionHomeOnly !== undefined &&
              homeForm.homePositionHomeOnly !== "undefined"
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
              homeForm.homePositionHomeOnly !== undefined &&
              homeForm.homePositionHomeOnly !== "undefined"
                ? homeForm.homePositionHomeOnly
                : 0
            }
            winPercentage={homeForm.homePPGAv ? homeForm.homePPGAv : "N/A"}
            formTrend={[
              homeTenGameAverage.toFixed(2),
              homeSixGameAverage.toFixed(2),
              homeFiveGameAverage.toFixed(2),
            ]}
            formRun={homeForm.resultsAll}
            goalDifference={formDataHome[0].goalDifference}
            goalDifferenceHomeOrAway={formDataHome[0].goalDifferenceHomeOrAway}
            BttsPercentage={homeForm.bttsHomePercentage}
            BTTSArray={formDataHome[0].BTTSArray}
            // Results={formDataHome[0].Results}
            ResultsHorA={formDataHome[0].ResultsHorA}
            CardsTotal={formDataHome[0].CardsTotal}
            CornersAverage={homeForm.cornersAvHome.toFixed()}
            ScoredBothHalvesPercentage={
              formDataHome[0].ScoredBothHalvesPercentage
            }
            FormTextString={formDataHome[0].FormTextStringHome}
            FavouriteRecord={formDataHome[0].FavouriteRecord}
            StyleOfPlay={formDataHome[0].styleOfPlayOverall}
            StyleOfPlayHomeOrAway={formDataHome[0].styleOfPlayHome}
          />
        </ul>
      </div>
    );
  }

  // Component: StatsAway (Render Away Team Stats)
  function StatsAwayOnlyComponent() {
    if (!awayForm) return null;
    return (
      <div className="flex-childTwo">
        <ul style={style}>
          <Stats
            games={"hOrA"}
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
            goals={awayForm.avgScoredAway}
            conceeded={awayForm.teamConceededAvgAwayOnly.toFixed(2)}
            XG={awayForm.avgXGScoredAway.toFixed(2)}
            XGConceded={awayForm.avgXGConceededAway.toFixed(2)}
            //todo add goal diff and btts percentages
            possession={awayForm.avgPossessionAway.toFixed(2)}
            rawPosition={game.awayRawPosition ? game.awayRawPosition : 0}
            sot={awayForm.avgShotsOnTargetAway.toFixed(2)}
            shots={awayForm.avgShotsAway.toFixed(2)}
            dangerousAttacks={
              awayForm.avgDangerousAttacksAway !== 0
                ? awayForm.avgDangerousAttacksAway.toFixed(2)
                : awayForm.AverageDangerousAttacks
            }
            leaguePosition={
              awayForm.awayPosition !== undefined &&
              awayForm.awayPosition !== "undefined"
                ? formDataAway[0].leaguePosition
                : 0
            }
            homeOrAwayLeaguePosition={
              awayForm.awayPositionAwayOnly !== undefined &&
              awayForm.awayPositionAwayOnly !== "undefinedundefined"
                ? awayForm.awayPositionAwayOnly
                : 0
            }
            winPercentage={awayForm.awayPPGAv ? awayForm.awayPPGAv : "N/A"}
            formTrend={[
              awayTenGameAverage.toFixed(2),
              awaySixGameAverage.toFixed(2),
              awayFiveGameAverage.toFixed(2),
            ]}
            formRun={awayForm.resultsAll}
            goalDifference={formDataAway[0].goalDifference}
            goalDifferenceHomeOrAway={formDataAway[0].goalDifferenceHomeOrAway}
            BttsPercentage={awayForm.bttsHomePercentage}
            BTTSArray={formDataAway[0].BTTSArray}
            // Results={formDataAway[0].Results}
            ResultsHorA={formDataAway[0].ResultsHorA}
            CardsTotal={formDataAway[0].CardsTotal}
            CornersAverage={awayForm.cornersAvAway.toFixed()}
            ScoredBothHalvesPercentage={
              formDataAway[0].ScoredBothHalvesPercentage
            }
            FormTextString={formDataAway[0].FormTextStringAway}
            FavouriteRecord={formDataAway[0].FavouriteRecord}
            StyleOfPlay={formDataAway[0].styleOfPlayOverall}
            StyleOfPlayHomeOrAway={formDataAway[0].styleOfPlayAway}
          />
        </ul>
      </div>
    );
  }

  function handleSetUserTips(gameId, game, tipString, tip, date, uid, odds) {
    setUserTips((prevTips) => {
      // Check if the tip for this gameId already exists
      const existingTipIndex = prevTips.findIndex(
        (tip) => tip.gameId === gameId
      );

      if (existingTipIndex !== -1) {
        // If the tip already exists, update it
        const updatedTips = [...prevTips];
        updatedTips[existingTipIndex] = {
          gameId,
          game,
          tipString,
          tip,
          date,
          uid,
          odds,
        };
        return updatedTips; // Return the updated list
      } else {
        // If the tip doesn't exist, add a new one
        return [...prevTips, { gameId, game, tipString, tip, date, uid, odds }];
      }
    });
  }

  gameArrayHome.sort((a, b) => b.unixTimestamp - a.unixTimestamp);
  gameArrayAway.sort((a, b) => b.unixTimestamp - a.unixTimestamp);

  const bttsArrayHome = Array.from(gameArrayHome, (x) => x.btts);
  const bttsArrayAway = Array.from(gameArrayAway, (x) => x.btts);

  const overviewHome = gameArrayHome.slice(0, 10).map((game) => (
    <div>
      <Collapsable
        key={`${game.homeTeam}v${game.awayTeam}`}
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
  }); // Dependency on userDetail

  // Get all necessary data

  useEffect(() => {
    // useEffect to fetch and process game data based on props
    async function fetchData() {
      if (game.status === "void") return; // Exit if game is void

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
          homeForm.avgShotValueChart
        );
        setHomeAccuracyOverallStrength(accuracyHome);

        const accuracyHomeLast5 = await calculateMetricStrength(
          "accuracyOverall",
          homeForm.avgShotValueLast5Chart
        );
        setHomeAccuracyOverallStrengthLast5(accuracyHomeLast5);

        const accuracyHomeOnly = await calculateMetricStrength(
          "accuracyOverall",
          homeForm.avgShotValueHomeChart
        );
        setHomeOnlyAccuracyOverallStrength(accuracyHomeOnly);

        const accuracyAway = await calculateMetricStrength(
          "accuracyOverall",
          awayForm.avgShotValueChart
        );
        setAwayAccuracyOverallStrength(accuracyAway);

        const accuracyAwayLast5 = await calculateMetricStrength(
          "accuracyOverall",
          awayForm.avgShotValueLast5Chart
        );
        setAwayAccuracyOverallStrengthLast5(accuracyAwayLast5);

        const accuracyAwayOnly = await calculateMetricStrength(
          "accuracyOverall",
          awayForm.avgShotValueAwayChart
        );
        setAwayOnlyAccuracyOverallStrength(accuracyAwayOnly);

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

        if (homeForm.fiveGameAv) {
          const formTextStringHome = await GenerateFormSummary(
            homeForm,
            homeForm.tenGameAv,
            homeForm.fiveGameAv
          );
          const formTextStringAway = await GenerateFormSummary(
            awayForm,
            awayForm.tenGameAv,
            awayForm.fiveGameAv
          );
          setFormSummary([formTextStringHome, formTextStringAway]);
        }

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
  }, [
    awayFiveGameAverage,
    firstRenderDone,
    awayTenGameAverage,
    game.completeData,
    game.id,
    game.status,
    homeFiveGameAverage,
    homeTenGameAverage,
  ]); // Dependencies for the useCallback

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
    FormTextStringHome: formSummaries[0],
    // FavouriteRecord:
    //   favouriteRecordHome + `. ${homeForm.reliabilityString}`,
    BTTSArray: bttsArrayHome,
    Results: homeForm.resultsAll,
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
    FormTextStringAway: formSummaries[1],
    // FavouriteRecord:
    //   favouriteRecordAway + `. ${awayForm.reliabilityString}`,
    BTTSArray: bttsArrayAway,
    Results: awayForm.resultsAll,
    ResultsHorA: awayForm.resultsAway,
    XGSwing: awayForm.XGChangeRecently,
    styleOfPlayOverall: awayForm.styleOfPlayOverall,
    styleOfPlayAway: awayForm.styleOfPlayAway,
    // BTTSAll: awayForm.last10btts,
    // BTTSHorA: awayForm.last10bttsAway,
  });

  // AI Insights Generation

  async function fetchBasicTable(id) {
    const foundItem = basicTableArray.find((item) => item.id === id);
    return foundItem;
  }

  const generateAIInsights = useCallback(
    async (gameId, streak) => {
      setIsLoading(true);
      const table = await fetchBasicTable(game.leagueID);
      const leagueTable = table.table;
      let progress;
      let type;
      let statistics;
      let leagueStatistics = await fetch(
        `${process.env.REACT_APP_EXPRESS_SERVER}leagueStats/${leagueTable[0].LeagueID}`
      );
      let totalGames;

      await leagueStatistics.json().then((stats) => {
        statistics = stats.data;
        type = stats.data.round_format;
        progress = statistics.progress;
        totalGames = (statistics.totalMatches * 2) / statistics.clubNum;
      });
      let roundType;
      switch (type) {
        case 0:
          roundType = "League game";
          break;
        case 1:
          roundType = "Group game";
          break;
        case 2:
          roundType = "Knockout round";
          break;
        default:
          roundType = undefined;
          break;
      }

      // let previousGameStats;
      let previousGames = await fetch(
        `${process.env.REACT_APP_EXPRESS_SERVER}match/${gameId}`
      );
      let odds;
      await previousGames.json().then((data) => {
        console.log(data.data);
        odds = {
          HomeTeam: {
            HomeWin: data.data.odds_ft_1,
            MostCorners: data.data.odds_corners_1,
            DoubleChanceHomeOrDraw: data.data.odds_doublechance_1x,
            ToWinToNil: data.data.odds_win_to_nil_1,
            ToScoreFirst: data.data.odds_team_to_score_first_1,
            CleanSheetYes: data.data.odds_team_a_cs_yes,
            CleanSheetNo: data.data.odds_team_a_cs_no,
          },
          AwayTeam: {
            AwayWin: data.data.odds_ft_2,
            MostCorners: data.data.odds_corners_2,
            DoubleChanceAwayOrDraw: data.data.odds_doublechance_x2,
            ToWinToNil: data.data.odds_win_to_nil_2,
            ToScoreFirst: data.data.odds_team_to_score_first_2,
            CleanSheetYes: data.data.odds_team_b_cs_yes,
            CleanSheetNo: data.data.odds_team_b_cs_no,
          },
          GeneralMatchOdds: {
            BTTSYes: data.data.odds_btts_yes,
            BTTSNo: data.data.odds_btts_no,
            "Over2.5Goals": data.data.odds_ft_over25,
            "Under2.5Goals": data.data.odds_ft_under25,
            "Over3.5Goals": data.data.odds_ft_over35,
            "Under3.5Goals": data.data.odds_ft_under35,
            "Over10.5Corners": data.data.odds_corners_over_105,
            "Under10.5Corners": data.data.odds_corners_under_105,
            "1stHalfResultHomeWinning": data.data.odds_1st_half_result_1,
            "1stHalfResultAwayWinning": data.data.odds_1st_half_result_2,
          },
        };

        // previousGameStats = data.data.h2h.previous_matches_results
      });

      console.log(game);
      console.log(streak);
      try {
        const AIPayload = {
          competition: game.leagueDesc,
          totalLeagueGames: totalGames,
          gameweek: game.matches_completed_minimum + 1,
          gameType: roundType,
          // referee: await getRefStats(game.refereeID, game.competition_id),
          leagueTable: leagueTable,
          seasonProgressPercent: progress,
          venue: game.stadium,
          odds,
          teamStreakData: streak,
          homeTeam: {
            homeTeamName: game.homeTeam,
            homeLeaguePosition: homeForm?.LeaguePosition,
            // homeTeamResults: homeForm?.allTeamResults,
            "XG diff all games": homeForm?.longTermXGDiff,
            "XG diff last 5 games": homeForm?.shortTermXGDiff,
            homeAttackingStats: homeForm?.attackingMetrics,
            homeAttackingStatsLast5: homeForm?.attackingMetricsHomeLast5,
            homeAttackingStatsHomeOnly: homeForm?.attackingMetricsHomeOnly,
            homeDefensiveStats: homeForm?.defensiveMetrics,
            homeDefensiveStatsLast5: homeForm?.defensiveMetricsHomeLast5,
            homeDefensiveStatsHomeOnly: homeForm?.defensiveMetricsHomeOnly,
          },
          awayTeam: {
            awayTeamName: game.awayTeam,
            awayLeaguePosition: awayForm?.LeaguePosition,
            // awayTeamResults: awayForm?.allTeamResults,
            "XG diff all games": awayForm?.longTermXGDiff,
            "XG diff last 5 games": awayForm?.shortTermXGDiff,
            awayAttackingStats: awayForm?.attackingMetrics,
            awayAttackingStatsLast5: awayForm?.attackingMetricsAwayLast5,
            awayAttackingStatsAwayOnly: awayForm?.attackingMetricsAwayOnly,
            awayDefensiveStats: awayForm?.defensiveMetrics,
            awayDefensiveStatsLast5: awayForm?.defensiveMetricsAwayLast5,
            awayDefensiveStatsAwayOnly: awayForm?.defensiveMetricsAwayOnly,
          },
        };
        console.log(AIPayload);

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

    const formattedText = formatAIPreview(aiMatchPreview.matchPreview1);
    const formattedText2 = formatAIPreview(aiMatchPreview.matchPreview2);

    return (
      <>
        <h2>Preview</h2>
        <div className="AIMatchPreview">{formattedText}</div>
        <div className="AIMatchPreview">{formattedText2}</div>
        <h2>AI Prediction</h2>
        <div className="AIMatchPreview">
          {aiMatchPreview.prediction}{" "}
          <i>(may not reflect the view of Soccer Stats Hub)</i>
        </div>
        <div className="AIMatchPreview">
          {aiMatchPreview.opinionOnXGTippingPrediction}{" "}
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

  const UserTips = ({
    game,
    handleSetUserTips,
    userDetail,
    selectedTip,
    handleTipSelect,
  }) => {
    const handleClick = (tipType, label) => {
      if (selectedTip === tipType) {
        return; // If the button clicked is already selected, do nothing
      }

      let odds;

      if (tipType === "homeTeam") {
        odds = game.homeOdds;
      } else if (tipType === "awayTeam") {
        odds = game.awayOdds;
      } else if (tipType === "draw") {
        odds = game.drawOdds;
      }

      handleTipSelect(tipType); // Update parent state
      handleSetUserTips(
        game.id,
        game.game,
        label,
        tipType,
        game.date,
        userDetail.uid,
        odds
      );
    };

    return (
      <div className="UserTips">
        <button
          id="TipButtonHome"
          className="TipButton"
          style={{
            backgroundColor: selectedTip === "homeTeam" ? "#fe8c00" : "white",
            color: selectedTip === "homeTeam" ? "white" : "#030052",
            border: `1px solid ${
              selectedTip === "homeTeam" ? "#fe8c00" : "#030052"
            }`,
          }}
          onClick={() => handleClick("homeTeam", `${game.homeTeam} to win`)}
        >
          Home
        </button>

        <button
          id="TipButtonDraw"
          className="TipButton"
          style={{
            backgroundColor: selectedTip === "draw" ? "#fe8c00" : "white",
            color: selectedTip === "draw" ? "white" : "#030052",
            border: `1px solid ${
              selectedTip === "draw" ? "#fe8c00" : "#030052"
            }`,
          }}
          onClick={() => handleClick("draw", "Draw")}
        >
          Draw
        </button>

        <button
          id="TipButtonAway"
          className="TipButton"
          style={{
            backgroundColor: selectedTip === "awayTeam" ? "#fe8c00" : "white",
            color: selectedTip === "awayTeam" ? "white" : "#030052",
            border: `1px solid ${
              selectedTip === "awayTeam" ? "#fe8c00" : "#030052"
            }`,
          }}
          onClick={() => handleClick("awayTeam", `${game.awayTeam} to win`)}
        >
          Away
        </button>
      </div>
    );
  };

  const [selectedTip, setSelectedTip] = useState(null);

  console.log(streakData);

  const handleTipSelect = (tipType) => {
    setSelectedTip(tipType);
  };
  return (
    <>
      {isBeforeTimestamp(game.date) && (
        <>
          <h2>Your Prediction</h2>
          <UserTips
            game={game}
            handleSetUserTips={handleSetUserTips}
            userDetail={userDetail}
            selectedTip={selectedTip} // Pass selectedTip down
            handleTipSelect={handleTipSelect} // Pass handler down
          />
        </>
      )}
      <div style={style}>
        <div style={style}>
          <Div className="MatchTime" text={`Kick off: ${time} GMT`}></Div>
        </div>
        <Collapsable
          buttonText={`Lineups & match action \u{2630}`}
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
        {(game.leagueID === 12325 ||
          game.leagueID === 12451 ||
          game.leagueID === 12446 ||
          game.leagueID === 12422 ||
          game.leagueID === 12529 ||
          game.leagueID === 12337 ||
          game.leagueID === 12931 ||
          game.leagueID === 12327 ||
          game.leagueID === 13973) &&
        loading ? (
          <div>Loading missing players. Data may not be available until 24 hours before kick-off...</div>
        ) : !paid ? (
          <Button
            className="MissingPlayersButton Locked"
            text={"Missing players 🔒"}
            disabled
          />
        ) : (
          <Collapsable
            buttonText={`Missing players \u{2630}`}
            classNameButton="MissingPlayersButton"
            element={
              <div className="MissingPlayers">
                <MissingPlayersList
                  team={game.homeTeam}
                  className="HomeMissingPlayers"
                  players={homeMissingPlayersList}
                />
                <MissingPlayersList
                  team={game.awayTeam}
                  className="AwayMissingPlayers"
                  players={awayMissingPlayersList}
                />
              </div>
            }
          />
        )}

        {loadingStreaks ? (
          <div>Loading streak data...</div>
        ) : !paid ? (
          <Button
            className="TeamStreaksButton Locked"
            text={"Team Streaks (All comps) 🔒"}
            disabled
          />
        ) : (
          <Collapsable
            buttonText={`Team Streaks (All comps) \u{2630}`}
            classNameButton="TeamStreaksButton"
            element={
              <div className="TeamStreaks">
                <StreakStats
                  stats={streakData}
                  home={game.homeTeam}
                  away={game.awayTeam}
                  homeLogo={game.homeBadge}
                  awayLogo={game.awayBadge}
                />
              </div>
            }
          />
        )}

        <div id="AIInsightsContainer" className="AIInsightsContainer">
          {!paid && game.leagueID !== 12325 ? (
            <Button
              className="AIInsightsLocked"
              text={"Soccer Stats Hub AI 🔒"}
              disabled={!paid && game.leagueID !== 12325}
            />
          ) : (
            <Button
              className="AIInsights"
              onClickEvent={() => {
                generateAIInsights(game.id, streakData);
                setShowAIInsights(true);
              }}
              text={"Soccer Stats Hub AI"}
              disabled={!paid && game.leagueID !== 12325}
            />
          )}

          {showAIInsights && ( // Conditionally Render the AI Insights.
            <div className="AIOutputContainer">
              {isLoading ? <p>Loading AI data....</p> : AIOutput}
            </div>
          )}
        </div>
        <Slider
          length="3"
          element1={
            <>
              <h2>All games</h2>
              <div className="flex-container">
                <StatsHomeComponent />
                <StatsAwayComponent />
              </div>
              {ranksHome && ranksAway && (
                <TeamRankingsFlexView
                  title={`Rankings in ${game.leagueDesc} out of ${stats.topTeams.accurateCrosses.length} teams`}
                  ranksHome={ranksHome}
                  ranksAway={ranksAway}
                  teamALabel={game.homeTeam}
                  teamBLabel={game.awayTeam}
                />
              )}
              <div className="Chart" id={`Chart${game.id}`} style={style}>
                <RadarChart
                  style={{ height: "auto" }}
                  title="Soccer Stats Hub Strength Ratings - All Games"
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
                  text="All games - Home Team | Away Team"
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
                    homeForm.goalDifference / 10,
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
                    awayForm.goalDifference / 10,
                    awayForm.AverageCorners,
                  ]}
                ></BarChart>
                <MultiTypeChart
                  dataArray={homeForm.twoDGoalsArray}
                  text={homeForm.teamName + " XG Diff (All)"}
                />
                <MultiTypeChart
                  dataArray={awayForm.twoDGoalsArray}
                  text={awayForm.teamName + " XG Diff (All)"}
                />
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
                      rollingGoalDiffTotalHome[
                        rollingGoalDiffTotalHome.length - 1
                      ],
                      rollingGoalDiffTotalAway[
                        rollingGoalDiffTotalAway.length - 1
                      ]
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
                      rollingGoalDiffTotalHome[
                        rollingGoalDiffTotalHome.length - 1
                      ],
                      rollingGoalDiffTotalAway[
                        rollingGoalDiffTotalAway.length - 1
                      ]
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
            </>
          }
          element2={
            <>
              <h2>Last 5 games only</h2>
              <div className="flex-container">
                <StatsHomeLast5Component />
                <StatsAwayLast5Component />
              </div>
              <div className="Chart" id={`Chart${game.id}`} style={style}>
                <RadarChart
                  title="Soccer Stats Hub Strength Ratings - Last 5 Games Only"
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
                <BarChart
                  text="Last 5 only - Home Team | Away Team"
                  data1={[
                    homeForm.last5Goals * 2,
                    awayForm.last5GoalsConceeded * 2,
                    homeForm.avPoints5 * 3,
                    homeForm.avXGLast5 * 2,
                    awayForm.avXGAgainstLast5 * 2,
                    homeForm.avSOTLast5,
                    homeForm.avDALast5 !== 0
                      ? homeForm.avDALast5 / 7.5
                      : homeForm.AverageDangerousAttacks / 7.5,
                    homeForm.avPosessionLast5 / 7.5,
                    homeForm.last5GoalDiff / 5,
                    homeForm.last5Corners,
                  ]}
                  data2={[
                    awayForm.last5Goals * 2,
                    homeForm.last5GoalsConceeded * 2,
                    awayForm.avPoints5 * 3,
                    awayForm.avXGLast5 * 2,
                    homeForm.avXGAgainstLast5 * 2,
                    awayForm.avSOTLast5,
                    awayForm.avDALast5 !== 0
                      ? awayForm.avDALast5 / 7.5
                      : awayForm.AverageDangerousAttacks / 7.5,
                    awayForm.avPosessionLast5 / 7.5,
                    awayForm.last5GoalDiff / 5,
                    awayForm.last5Corners,
                  ]}
                ></BarChart>
                <MultiTypeChart
                  dataArray={homeForm.twoDGoalsArray.slice(
                    Math.max(homeForm.twoDGoalsArray.length - 5, 0)
                  )}
                  text={homeForm.teamName + " XG Diff Last 5"}
                />
                <MultiTypeChart
                  dataArray={awayForm.twoDGoalsArray.slice(
                    Math.max(awayForm.twoDGoalsArray.length - 5, 0)
                  )}
                  text={awayForm.teamName + " XG Diff Last 5"}
                />
                <MultilineChart
                  height={
                    Math.max(
                      rollingGoalDiffTotalHomeLast5[
                        rollingGoalDiffTotalHomeLast5.length - 1
                      ],
                      rollingGoalDiffTotalAwayLast5[
                        rollingGoalDiffTotalAwayLast5.length - 1
                      ]
                    ) > 2
                      ? Math.max(
                          rollingGoalDiffTotalHomeLast5[
                            rollingGoalDiffTotalHomeLast5.length - 1
                          ],
                          rollingGoalDiffTotalAwayLast5[
                            rollingGoalDiffTotalAwayLast5.length - 1
                          ]
                        )
                      : 2
                  }
                  depth={
                    Math.min(
                      rollingGoalDiffTotalHomeLast5[
                        rollingGoalDiffTotalHomeLast5.length - 1
                      ],
                      rollingGoalDiffTotalAwayLast5[
                        rollingGoalDiffTotalAwayLast5.length - 1
                      ]
                    ) < -2
                      ? Math.min(
                          rollingGoalDiffTotalHomeLast5[
                            rollingGoalDiffTotalHomeLast5.length - 1
                          ],
                          rollingGoalDiffTotalAwayLast5[
                            rollingGoalDiffTotalAwayLast5.length - 1
                          ]
                        )
                      : -2
                  }
                  data1={rollingGoalDiffTotalHomeLast5}
                  data2={rollingGoalDiffTotalAwayLast5}
                  data3={rollingXGDiffTotalHomeLast5}
                  data4={rollingXGDiffTotalAwayLast5}
                  team1={game.homeTeam}
                  team2={game.awayTeam}
                  type={"Goal/XG difference over last 5"}
                  tension={0.5}
                ></MultilineChart>
              </div>
            </>
          }
          element3={
            <>
              <h2>Home/Away games only</h2>
              <div className="flex-container">
                <StatsHomeOnlyComponent />
                <StatsAwayOnlyComponent />
              </div>
              <div className="Chart" id={`Chart${game.id}`} style={style}>
                <RadarChart
                  title="Soccer Stats Hub Strength Ratings - Home/Away Games Only"
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
                <BarChart
                  text="Home/Away only - Home Team | Away Team"
                  data1={[
                    homeForm.avgScoredHome * 2,
                    awayForm.teamConceededAvgAwayOnly * 2,
                    homeForm.homePPGAv * 3,
                    homeForm.avgXGScoredHome * 2,
                    awayForm.avgXGConceededHome * 2,
                    homeForm.avgShotsOnTargetHome,
                    homeForm.avgDangerousAttacksHome !== 0
                      ? homeForm.avgDangerousAttacksHome / 7.5
                      : homeForm.AverageDangerousAttacks / 7.5,
                    homeForm.avgPossessionHome / 7.5,
                    homeForm.goalDifferenceHomeOrAway / 10,
                    homeForm.cornersAvHome,
                  ]}
                  data2={[
                    awayForm.avgScoredAway * 2,
                    homeForm.teamConceededAvgAwayOnly * 2,
                    awayForm.awayPPGAv * 3,
                    awayForm.avgXGScoredAway * 2,
                    homeForm.avgXGConceededAway * 2,
                    awayForm.avgShotsOnTargetAway,
                    awayForm.avgDangerousAttacksAway !== 0
                      ? awayForm.avgDangerousAttacksAway / 7.5
                      : awayForm.AverageDangerousAttacks / 7.5,
                    awayForm.avgPossessionAway / 7.5,
                    awayForm.goalDifferenceHomeOrAway / 10,
                    awayForm.cornersAvAway,
                  ]}
                ></BarChart>
                <MultiTypeChart
                  dataArray={homeForm.twoDGoalsArrayHome}
                  text={homeForm.teamName + " XG Diff (Home)"}
                />
                <MultiTypeChart
                  dataArray={awayForm.twoDGoalsArrayAway}
                  text={awayForm.teamName + " XG Diff (Away)"}
                />
                <MultilineChart
                  height={
                    Math.max(
                      rollingGoalDiffTotalHomeOnly[
                        rollingGoalDiffTotalHomeOnly.length - 1
                      ],
                      rollingGoalDiffTotalAwayOnly[
                        rollingGoalDiffTotalAwayOnly.length - 1
                      ]
                    ) > 2
                      ? Math.max(
                          rollingGoalDiffTotalHomeOnly[
                            rollingGoalDiffTotalHomeOnly.length - 1
                          ],
                          rollingGoalDiffTotalAwayOnly[
                            rollingGoalDiffTotalAwayOnly.length - 1
                          ]
                        )
                      : 2
                  }
                  depth={
                    Math.min(
                      rollingGoalDiffTotalHomeOnly[
                        rollingGoalDiffTotalHomeOnly.length - 1
                      ],
                      rollingGoalDiffTotalAwayOnly[
                        rollingGoalDiffTotalAwayOnly.length - 1
                      ]
                    ) < -2
                      ? Math.min(
                          rollingGoalDiffTotalHomeOnly[
                            rollingGoalDiffTotalHomeOnly.length - 1
                          ],
                          rollingGoalDiffTotalAwayOnly[
                            rollingGoalDiffTotalAwayOnly.length - 1
                          ]
                        )
                      : -2
                  }
                  data1={rollingGoalDiffTotalHomeOnly}
                  data2={rollingGoalDiffTotalAwayOnly}
                  data3={rollingXGDiffTotalHomeOnly}
                  data4={rollingXGDiffTotalAwayOnly}
                  team1={game.homeTeam}
                  team2={game.awayTeam}
                  type={"Home/Away Goal/XG difference over time"}
                  tension={0.5}
                ></MultilineChart>
              </div>
            </>
          }
        />
        <div className="Chart" id={`Chart${game.id}`} style={style}></div>
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
