import React, { Fragment, useState } from "react";
import ReactDOM from "react-dom";
import { matches, diff } from "./getFixtures";
import { RenderAllFixtures } from "../logic/getFixtures";
import Collapsable from "../components/CollapsableElement";
import CollapsableStats from "../components/CollapsableStats";
import { allForm } from "../logic/getFixtures";
import Increment from "../components/Increment";
import { incrementValue } from "../components/Increment";
import { getBTTSPotential } from "../logic/getBTTSPotential";
import { allLeagueResultsArrayOfObjects } from "../logic/getFixtures";
import { Slider } from "../components/Carousel";
import {
  calculateAttackingStrength,
  calculateDefensiveStrength,
  calculateMetricStrength,
} from "./getStats";
import { rangeValue } from "../components/Slider";
import {
  minimumGD,
  minimumXG,
  minimumLast6,
  minimumGDHorA,
} from "../components/SliderDiff";
import { checkUserPaidStatus } from "../logic/hasUserPaid";
import { userDetail } from "../logic/authProvider";
import { dynamicDate } from "./getFixtures";
import { ThreeDots } from "react-loading-icons";

var myHeaders = new Headers();
myHeaders.append("Origin", "https://gregdorward.github.io");

let finalHomeGoals;
let finalAwayGoals;
let rawFinalHomeGoals;
let rawFinalAwayGoals;
let homeOdds;
let awayOdds;
let totalGoals = 0;
let totalGoals2 = 0;
let numberOfGames = 0;
let drawPredictions = 0;
let homePredictions = 0;
let awayPredictions = 0;
let drawAIPredictions = 0;
let homeAIPredictions = 0;
let awayAIPredictions = 0;
let allOutcomes = 0;
let homeOutcomes = 0;
let awayOutcomes = 0;
let winAmount = 0;
let lossAmount = 0;
let AIwinAmount = 0;
let AIlossAmount = 0;
let sumStatDAWin = 0;
let sumStatDALoss = 0;
let sumStatPossessionWin = 0;
let sumStatPossessionLoss = 0;
let sumStatSOTWin = 0;
let sumStatSOTLoss = 0;
let sumStatPPGLast10Win = 0;
let sumStatPPGLast10Loss = 0;
let sumOddsWin = 0;
let sumOddsLoss = 0;
let sumXGForWin = 0;
let sumXGForLoss = 0;
let sumXGAgainstWin = 0;
let sumXGAgainstLoss = 0;
let allWinOutcomes = 0;
let allLossOutcomes = 0;
let allDrawOutcomes = 0;
let totalROI = 0;
let totalInvestment = 0;
let totalProfit = 0;
let totalAIROI = 0;
let totalAIInvestment = 0;
let totalAIProfit = 0;
let userTipList;
export let formObjectHome;
export let formObjectAway;
export let clicked = false;
let paid;

export var renderPredictions;

async function convertTimestamp(timestamp) {
  let newDate = new Date(timestamp * 1000);
  let [day, month, year] = newDate.toLocaleDateString("en-US").split("/");

  let converted = `${year}-${day}-${month}`;

  return converted;
}

export function getPointsFromLastX(lastX) {
  let points = 0;
  let pointsAddition;

  try {
    lastX.forEach((game) => {
      switch (true) {
        case game === "W":
          pointsAddition = 3;
          break;
        case game === "D":
          pointsAddition = 1;
          break;
        case game === "L":
          pointsAddition = 0;
          break;
        default:
          break;
      }

      points = points + pointsAddition;
    });
    return points;
  } catch (error) {
    console.log(error);
    return "N/A";
  }
}

function isSameDayOrLater(targetTimestamp) {
  console.log("Target timestamp:", targetTimestamp);

  // Convert Unix timestamp (seconds) to a Date object
  const targetDate = new Date(targetTimestamp * 1000);
  const currentDate = dynamicDate; // Current date-time

  console.log("Target date:", targetDate);
  console.log("Current date:", currentDate);

  // Reset both dates to UTC midnight for comparison
  targetDate.setUTCHours(0, 0, 0, 0);
  currentDate.setUTCHours(0, 0, 0, 0);

  console.log("Target date (UTC midnight):", targetDate);
  console.log("Current date (UTC midnight):", currentDate);

  return targetDate >= currentDate;
}

async function fetchUserTips() {
  try {
    const userGeneratedTips = await fetch(
      `${process.env.REACT_APP_EXPRESS_SERVER}tips`
    );
    const tips = await userGeneratedTips.json();

    const tipCounts = {};

    // Process the tips
    Object.values(tips).forEach((userTips) => {
      userTips.forEach(({ gameId, game, tipString, date, odds }) => {
        if (isSameDayOrLater(date)) {
          if (!tipCounts[gameId]) {
            tipCounts[gameId] = { game, tips: {} };
          }

          if (!tipCounts[gameId].tips[tipString]) {
            tipCounts[gameId].tips[tipString] = { count: 0, odds };
          }

          // Increment the respective tip count
          tipCounts[gameId].tips[tipString].count += 1;
        }
      });
    });

    // Convert the object to an array and format output
    const formattedTips = Object.entries(tipCounts).flatMap(
      ([gameId, { game, tips }]) =>
        Object.entries(tips).map(([tipString, { count, odds }]) => ({
          game,
          tipString,
          count,
          formatted: (
            <>
              {tipString} @ {odds} <br />
              {game} <br />
              Tips - {count}
            </>
          ),
        }))
    );

    // Sort by count in descending order
    formattedTips.sort((a, b) => b.count - a.count);

    return formattedTips.slice(0, 10); // ✅ Sorted list with game name, tipString, and count
  } catch (error) {
    console.error("Error fetching user tips:", error);
    return null;
  }
}

function UserTips() {
  const [tips, setTips] = useState([]);

  const fetchAndSetUserTips = async () => {
    const fetchedTips = await fetchUserTips();
    if (fetchedTips) {
      setTips(fetchedTips);
    }
  };

  return (
    <div>
      <button onClick={fetchAndSetUserTips}>Get User Tips</button>
      <h4>Most Tipped Games by Soccer Stats Hub Users</h4>
      <ul className="UserTipsList">
        {tips.length > 0 ? (
          tips.map((game, index) => (
            <li key={index} className="UserTipsListItems">
              {game.formatted}
            </li>
          ))
        ) : (
          <p>
            Expand an individual ficture to make your prediction. Predictions
            will only be submitted when the 'Submit My Tips' button is clicked.
            All users tips will be displayed here with a tally against each,
            showing the most popular.
          </p>
        )}
      </ul>
    </div>
  );
}

async function getPastLeagueResults(team, game, hOrA, form) {
  form.completeData = true;
  let date = game.date;
  if (allLeagueResultsArrayOfObjects[game.leagueIndex].fixtures.length > 10) {
    let teamsHomeResults = allLeagueResultsArrayOfObjects[
      game.leagueIndex
    ].fixtures.filter((fixture) => fixture.home_name === team);

    teamsHomeResults = teamsHomeResults
      .filter(function (item) {
        return item.date_unix < date - 86400;
      })
      .sort((a, b) => a.date_unix - b.date_unix);

    let teamsAwayResults = allLeagueResultsArrayOfObjects[
      game.leagueIndex
    ].fixtures.filter((fixture) => fixture.away_name === team);

    teamsAwayResults = teamsAwayResults
      .filter(function (item) {
        return item.date_unix < date - 86400;
      })
      .sort((a, b) => a.date_unix - b.date_unix);

    async function addTotalsToRecord(record) {
      // Calculate the total for each array and add as a new property
      record.totalW =
        record.W.reduce((sum, value) => sum + value, 0) / record.W.length;
      record.totalD =
        record.D.reduce((sum, value) => sum + value, 0) / record.D.length;
      record.totalL =
        record.L.reduce((sum, value) => sum + value, 0) / record.L.length;

      return record; // Return the updated object
    }

    form.recordAgainstIndividualStyles = {
      W: [],
      D: [],
      L: [],
    };

    form.recordAgainstIndividualStylesHome = {
      W: [],
      D: [],
      L: [],
    };

    form.recordAgainstIndividualStylesAway = {
      W: [],
      D: [],
      L: [],
    };

    let homeResults = [];
    let awayResults = [];
    let oddsSumHome = 0;
    let oddsSumAway = 0;
    let favouriteCount = 0;
    let underdogCount = 0;
    let winningFavouriteCount = 0;
    let drawingFavouriteCount = 0;
    let beatenFavouriteCount = 0;
    let winningUnderdogCount = 0;
    let drawingUnderdogCount = 0;
    let beatenUnderdogCount = 0;

    for (let index = 0; index < teamsHomeResults.length; index++) {
      const resultedGame = teamsHomeResults[index];
      homeResults.push({
        homeTeam: resultedGame.home_name,
        gameweek: resultedGame.game_week,
        homeGoals: resultedGame.homeGoalCount,
        homePPGPreMatch: resultedGame.pre_match_teamA_overall_ppg,
        awayPPGPreMatch: resultedGame.pre_match_teamB_overall_ppg,
        XG:
          resultedGame.team_a_xg <= 0 || resultedGame.team_a_xg > 7
            ? resultedGame.homeGoalCount
            : resultedGame.team_a_xg,
        awayTeam: resultedGame.away_name,
        awayGoals: resultedGame.awayGoalCount,
        XGAgainst:
          resultedGame.team_b_xg <= 0 || resultedGame.team_b_xg > 7
            ? resultedGame.awayGoalCount
            : resultedGame.team_b_xg,
        possession:
          resultedGame.team_a_possession <= 0
            ? 50
            : resultedGame.team_a_possession,
        scored: resultedGame.homeGoalCount,
        conceeded: resultedGame.awayGoalCount,
        shots: resultedGame.team_a_shots <= 0 ? 12 : resultedGame.team_a_shots,
        sot:
          resultedGame.team_a_shotsOnTarget <= 0
            ? 5
            : resultedGame.team_a_shotsOnTarget,
        sotAgainst:
          resultedGame.team_b_shotsOnTarget <= 0
            ? 5
            : resultedGame.team_b_shotsOnTarget,
        dangerousAttacks:
          resultedGame.team_a_dangerous_attacks <= 0
            ? 50
            : resultedGame.team_a_dangerous_attacks,
        corners:
          resultedGame.team_a_corners === -1 ? 6 : resultedGame.team_a_corners,
        date: await convertTimestamp(resultedGame.date_unix),
        dateRaw: resultedGame.date_unix,
        oddsHome: resultedGame.odds_ft_1,
        oddsAway: resultedGame.odds_ft_2,
        btts:
          resultedGame.homeGoalCount > 0 && resultedGame.awayGoalCount > 0
            ? true
            : false,
        points:
          resultedGame.homeGoalCount > resultedGame.awayGoalCount
            ? 3
            : resultedGame.homeGoalCount < resultedGame.awayGoalCount
            ? 0
            : 1,
        result:
          resultedGame.homeGoalCount > resultedGame.awayGoalCount
            ? "W"
            : resultedGame.homeGoalCount < resultedGame.awayGoalCount
            ? "L"
            : "D",
      });

      const directnessHome =
        (resultedGame.team_a_possession === -1
          ? 50
          : 100 - resultedGame.team_a_possession) /
        (resultedGame.team_b_shotsOnTarget === 0 ||
        resultedGame.team_b_shotsOnTarget === -1
          ? 5
          : resultedGame.team_b_shotsOnTarget);

      switch (true) {
        case resultedGame.homeGoalCount > resultedGame.awayGoalCount:
          form.recordAgainstIndividualStyles.W.push(directnessHome);
          form.recordAgainstIndividualStylesHome.W.push(directnessHome);
          break;
        case resultedGame.homeGoalCount < resultedGame.awayGoalCount:
          form.recordAgainstIndividualStyles.L.push(directnessHome);
          form.recordAgainstIndividualStylesHome.L.push(directnessHome);

          break;
        case resultedGame.homeGoalCount === resultedGame.awayGoalCount:
          form.recordAgainstIndividualStyles.D.push(directnessHome);
          form.recordAgainstIndividualStylesHome.D.push(directnessHome);
          break;
        default:
          break;
      }

      oddsSumHome = oddsSumHome + resultedGame.odds_ft_1;
      favouriteCount =
        resultedGame.odds_ft_1 < resultedGame.odds_ft_2
          ? favouriteCount + 1
          : favouriteCount + 0;
      winningFavouriteCount =
        resultedGame.odds_ft_1 < resultedGame.odds_ft_2 &&
        resultedGame.homeGoalCount > resultedGame.awayGoalCount
          ? winningFavouriteCount + 1
          : winningFavouriteCount + 0;
      drawingFavouriteCount =
        resultedGame.odds_ft_1 < resultedGame.odds_ft_2 &&
        resultedGame.homeGoalCount === resultedGame.awayGoalCount
          ? drawingFavouriteCount + 1
          : drawingFavouriteCount + 0;
      beatenFavouriteCount =
        resultedGame.odds_ft_1 < resultedGame.odds_ft_2 &&
        resultedGame.homeGoalCount < resultedGame.awayGoalCount
          ? beatenFavouriteCount + 1
          : beatenFavouriteCount + 0;

      underdogCount =
        resultedGame.odds_ft_1 > resultedGame.odds_ft_2
          ? underdogCount + 1
          : underdogCount + 0;
      winningUnderdogCount =
        resultedGame.odds_ft_1 > resultedGame.odds_ft_2 &&
        resultedGame.homeGoalCount > resultedGame.awayGoalCount
          ? winningUnderdogCount + 1
          : winningUnderdogCount + 0;
      drawingUnderdogCount =
        resultedGame.odds_ft_1 > resultedGame.odds_ft_2 &&
        resultedGame.homeGoalCount === resultedGame.awayGoalCount
          ? drawingUnderdogCount + 1
          : drawingUnderdogCount + 0;
      beatenUnderdogCount =
        resultedGame.odds_ft_1 > resultedGame.odds_ft_2 &&
        resultedGame.homeGoalCount < resultedGame.awayGoalCount
          ? beatenUnderdogCount + 1
          : beatenUnderdogCount + 0;
    }
    for (let index = 0; index < teamsAwayResults.length; index++) {
      const resultedGame = teamsAwayResults[index];
      awayResults.push({
        homeTeam: resultedGame.home_name,
        gameweek: resultedGame.game_week,
        homeGoals: resultedGame.homeGoalCount,
        homePPGPreMatch: resultedGame.pre_match_teamA_overall_ppg,
        awayPPGPreMatch: resultedGame.pre_match_teamB_overall_ppg,
        XG:
          resultedGame.team_b_xg <= 0 || resultedGame.team_b_xg > 7
            ? resultedGame.awayGoalCount
            : resultedGame.team_b_xg,
        awayTeam: resultedGame.away_name,
        awayGoals: resultedGame.awayGoalCount,
        XGAgainst:
          resultedGame.team_a_xg <= 0 || resultedGame.team_a_xg > 7
            ? resultedGame.homeGoalCount
            : resultedGame.team_a_xg,
        possession:
          resultedGame.team_b_possession <= 0
            ? 50
            : resultedGame.team_b_possession,
        scored: resultedGame.awayGoalCount,
        conceeded: resultedGame.homeGoalCount,
        shots: resultedGame.team_b_shots <= 0 ? 12 : resultedGame.team_b_shots,
        sot:
          resultedGame.team_b_shotsOnTarget <= 0
            ? 5
            : resultedGame.team_b_shotsOnTarget,
        sotAgainst:
          resultedGame.team_a_shotsOnTarget <= 0
            ? 5
            : resultedGame.team_a_shotsOnTarget,
        dangerousAttacks:
          resultedGame.team_b_dangerous_attacks <= 0
            ? 50
            : resultedGame.team_b_dangerous_attacks,
        corners:
          resultedGame.team_b_corners === -1 ? 6 : resultedGame.team_b_corners,
        date: await convertTimestamp(resultedGame.date_unix),
        dateRaw: resultedGame.date_unix,
        oddsHome: resultedGame.odds_ft_1,
        oddsAway: resultedGame.odds_ft_2,
        btts:
          resultedGame.homeGoalCount > 0 && resultedGame.awayGoalCount > 0
            ? true
            : false,
        points:
          resultedGame.homeGoalCount > resultedGame.awayGoalCount
            ? 0
            : resultedGame.homeGoalCount < resultedGame.awayGoalCount
            ? 3
            : 1,
        result:
          resultedGame.homeGoalCount > resultedGame.awayGoalCount
            ? "L"
            : resultedGame.homeGoalCount < resultedGame.awayGoalCount
            ? "W"
            : "D",
      });

      const directnessAway =
        (resultedGame.team_b_possession === -1
          ? 50
          : 100 - resultedGame.team_b_possession) /
        (resultedGame.team_a_shotsOnTarget === 0 ||
        resultedGame.team_a_shotsOnTarget === -1
          ? 5
          : resultedGame.team_a_shotsOnTarget);

      switch (true) {
        case resultedGame.homeGoalCount > resultedGame.awayGoalCount:
          form.recordAgainstIndividualStyles.L.push(directnessAway);
          form.recordAgainstIndividualStylesAway.L.push(directnessAway);
          break;
        case resultedGame.homeGoalCount < resultedGame.awayGoalCount:
          form.recordAgainstIndividualStyles.W.push(directnessAway);
          form.recordAgainstIndividualStylesAway.W.push(directnessAway);
          break;
        case resultedGame.homeGoalCount === resultedGame.awayGoalCount:
          form.recordAgainstIndividualStyles.D.push(directnessAway);
          form.recordAgainstIndividualStylesAway.D.push(directnessAway);
          break;
        default:
          break;
      }

      oddsSumAway = oddsSumAway + resultedGame.odds_ft_2;
      favouriteCount =
        resultedGame.odds_ft_1 > resultedGame.odds_ft_2
          ? favouriteCount + 1
          : favouriteCount + 0;
      winningFavouriteCount =
        resultedGame.odds_ft_1 > resultedGame.odds_ft_2 &&
        resultedGame.homeGoalCount < resultedGame.awayGoalCount
          ? winningFavouriteCount + 1
          : winningFavouriteCount + 0;
      drawingFavouriteCount =
        resultedGame.odds_ft_1 > resultedGame.odds_ft_2 &&
        resultedGame.homeGoalCount === resultedGame.awayGoalCount
          ? drawingFavouriteCount + 1
          : drawingFavouriteCount + 0;
      beatenFavouriteCount =
        resultedGame.odds_ft_1 > resultedGame.odds_ft_2 &&
        resultedGame.homeGoalCount > resultedGame.awayGoalCount
          ? beatenFavouriteCount + 1
          : beatenFavouriteCount + 0;

      underdogCount =
        resultedGame.odds_ft_1 < resultedGame.odds_ft_2
          ? underdogCount + 1
          : underdogCount + 0;
      winningUnderdogCount =
        resultedGame.odds_ft_1 < resultedGame.odds_ft_2 &&
        resultedGame.homeGoalCount < resultedGame.awayGoalCount
          ? winningUnderdogCount + 1
          : winningUnderdogCount + 0;
      drawingUnderdogCount =
        resultedGame.odds_ft_1 < resultedGame.odds_ft_2 &&
        resultedGame.homeGoalCount === resultedGame.awayGoalCount
          ? drawingUnderdogCount + 1
          : drawingUnderdogCount + 0;
      beatenUnderdogCount =
        resultedGame.odds_ft_1 < resultedGame.odds_ft_2 &&
        resultedGame.homeGoalCount > resultedGame.awayGoalCount
          ? beatenUnderdogCount + 1
          : beatenUnderdogCount + 0;
    }

    await addTotalsToRecord(form.recordAgainstIndividualStyles);

    let reversedResultsHome = homeResults;
    let reversedResultsAway = awayResults;

    homeResults.sort((a, b) => a.dateRaw - b.dateRaw);

    awayResults.sort((a, b) => a.dateRaw - b.dateRaw);

    const allTeamResultsUnordered =
      reversedResultsHome.concat(reversedResultsAway);
    const allTeamResults = allTeamResultsUnordered.sort(
      (a, b) => a.dateRaw - b.dateRaw
    );

    let points = 0;
    let pointsWeighted = 0;

    allTeamResults.forEach((teamResult) => {
      points = points + teamResult.points;
      pointsWeighted = pointsWeighted + teamResult.points * teamResult.odds;
    });

    form.pointsWeighted = pointsWeighted;
    form.points = points;
    form.gamesPlayed = allTeamResults.length;

    const allTeamResultsHome = reversedResultsHome.sort(
      (b, a) => a.dateRaw - b.dateRaw
    );
    const allTeamResultsAway = reversedResultsAway.sort(
      (b, a) => a.dateRaw - b.dateRaw
    );

    form.allTeamResults = allTeamResults.sort((b, a) => a.dateRaw - b.dateRaw);
    allTeamResults.sort((b, a) => a.dateRaw - b.dateRaw);
    form.allTeamResultsLast6 = form.allTeamResults.slice(0, 6);

    const points6 = allTeamResults.map((res) => res.points).slice(0, 6);
    const pointsSum6 = points6.reduce((a, b) => a + b, 0);
    form.avPoints6 = pointsSum6 / points6.length;
    form.pointsSum6 = pointsSum6;

    const points5 = allTeamResults.map((res) => res.points).slice(0, 5);
    const pointsSum5 = points5.reduce((a, b) => a + b, 0);
    form.avPoints5 = pointsSum5 / points5.length;

    const pointsAll = allTeamResults.map((res) => res.points);
    const pointsSumAll = pointsAll.reduce((a, b) => a + b, 0);
    form.avPointsAll = pointsSumAll / pointsAll.length;

    const resultsAll = allTeamResults.map((res) => res.result);
    const resultsHome = allTeamResultsHome.map((res) => res.result);
    const resultsAway = allTeamResultsAway.map((res) => res.result);

    form.LastFiveForm = resultsAll.slice(0, 5);
    form.LastSixForm = resultsAll.slice(0, 6);
    form.LastTenForm = resultsAll.slice(0, 10);

    form.resultsAll = resultsAll.slice(0, 6);
    form.resultsHome = resultsHome.slice(0, 6);
    form.resultsAway = resultsAway.slice(0, 6);

    const avScoredLast5 = allTeamResults.map((res) => res.scored).slice(0, 5);
    const avScoredLast5Sum = avScoredLast5.reduce((a, b) => a + b, 0);
    form.avScoredLast5 = avScoredLast5Sum / avScoredLast5.length;
    const avConceededLast5 = allTeamResults
      .map((res) => res.conceeded)
      .slice(0, 5);
    const avConceededLast5Sum = avConceededLast5.reduce((a, b) => a + b, 0);
    form.avConceededLast5 = avConceededLast5Sum / avConceededLast5.length;
    const avDALast5 = allTeamResults
      .map((res) => res.dangerousAttacks)
      .slice(0, 5);
    const avDALast5Sum = avDALast5.reduce((a, b) => a + b, 0);
    form.avDALast5 = avDALast5Sum / avDALast5.length;
    const avSOTLast5 = allTeamResults.map((res) => res.sot).slice(0, 5);
    const avSOTLast5Sum = avSOTLast5.reduce((a, b) => a + b, 0);
    form.avSOTLast5 = avSOTLast5Sum / avSOTLast5.length;
    const avSOTAgainstLast5 = allTeamResults
      .map((res) => res.sotAgainst)
      .slice(0, 5);
    const avSOTAgainstLast5Sum = avSOTAgainstLast5.reduce((a, b) => a + b, 0);
    form.avSOTAgainstLast5 = avSOTAgainstLast5Sum / avSOTAgainstLast5.length;
    const avShotsLast5 = allTeamResults.map((res) => res.shots).slice(0, 5);
    const avShotsLast5Sum = avShotsLast5.reduce((a, b) => a + b, 0);
    form.avShotsLast5 = avShotsLast5Sum / avShotsLast5.length;
    const avCornersLast5 = allTeamResults.map((res) => res.corners).slice(0, 5);
    const avCornersLast5Sum = avCornersLast5.reduce((a, b) => a + b, 0);
    form.avCornersLast5 = avCornersLast5Sum / avCornersLast5.length;
    const avPosessionLast5 = allTeamResults
      .map((res) => res.possession)
      .slice(0, 6);
    const avPosessionLast5Sum = avPosessionLast5.reduce((a, b) => a + b, 0);
    form.avPosessionLast5 = avPosessionLast5Sum / avPosessionLast5.length;
    const avXGLast5 = allTeamResults.map((res) => res.XG).slice(0, 5);
    const avXGLast5Sum = avXGLast5.reduce((a, b) => a + b, 0);
    form.avXGLast5 = avXGLast5Sum / avXGLast5.length;
    const avXGAgainstLast5 = allTeamResults
      .map((res) => res.XGAgainst)
      .slice(0, 5);

    const avXGAgainstLast5Sum = avXGAgainstLast5.reduce((a, b) => a + b, 0);
    form.avXGAgainstLast5 = avXGAgainstLast5Sum / avXGAgainstLast5.length;

    const averageOddsHome = oddsSumHome / teamsHomeResults.length;
    const averageOddsAway = oddsSumAway / teamsAwayResults.length;
    form.favouriteCount = favouriteCount;
    form.winningFavouriteCount = winningFavouriteCount;
    form.drawingFavouriteCount = drawingFavouriteCount;
    form.beatenFavouriteCount = beatenFavouriteCount;

    form.underdogCount = underdogCount;
    form.winningUnderdogCount = winningUnderdogCount;
    form.drawingUnderdogCount = drawingUnderdogCount;
    form.beatenUnderdogCount = beatenUnderdogCount;

    form.oddsReliabilityWin =
      favouriteCount > 0
        ? (form.winningFavouriteCount / form.favouriteCount) * 100
        : 0;
    form.oddsReliabilityDraw =
      favouriteCount > 0
        ? (form.drawingFavouriteCount / form.favouriteCount) * 100
        : 0;
    form.oddsReliabilityLose =
      favouriteCount > 0
        ? (form.beatenFavouriteCount / form.favouriteCount) * 100
        : 0;

    form.oddsReliabilityWinAsUnderdog =
      underdogCount > 0
        ? (form.winningUnderdogCount / form.underdogCount) * 100
        : 0;
    form.oddsReliabilityDrawAsUnderdog =
      underdogCount > 0
        ? (form.drawingUnderdogCount / form.underdogCount) * 100
        : 0;
    form.oddsReliabilityLoseAsUnderdog =
      underdogCount > 0
        ? (form.beatenUnderdogCount / form.underdogCount) * 100
        : 0;

    form.reliableIndicator =
      form.winningFavouriteCount + form.beatenUnderdogCount;
    form.unreliableIndicator =
      form.beatenFavouriteCount +
      form.drawingFavouriteCount +
      form.winningUnderdogCount +
      form.drawingUnderdogCount;

    form.predictabilityScore =
      form.reliableIndicator / form.unreliableIndicator;

    let reliabilityString;

    switch (true) {
      case form.predictabilityScore < 0.3:
        reliabilityString =
          "Odds have been an extremely unreliable indicator of actual performance so far this season";
        break;
      case form.predictabilityScore >= 0.3 && form.predictabilityScore < 0.8:
        reliabilityString =
          "Odds have been an unreliable indicator of actual performance so far this season";
        break;
      case form.predictabilityScore >= 0.8 && form.predictabilityScore < 1.2:
        reliabilityString =
          "Odds have been a decent indicator of actual performance so far this season";
        break;
      case form.predictabilityScore >= 1.2 && form.predictabilityScore < 1.7:
        reliabilityString =
          "Odds have been a good indicator of actual performance so far this season";
        break;
      case form.predictabilityScore >= 1.7 && form.predictabilityScore < 2.2:
        reliabilityString =
          "Odds have been a very good indicator of actual performance so far this season";
        break;
      case form.predictabilityScore >= 2.2:
        reliabilityString =
          "Odds have been an excellent indicator of actual performance so far this season";
        break;
      default:
        break;
    }

    form.reliabilityString = reliabilityString;

    const teamGoalsHome = homeResults.map((res) => res.scored);

    const teamGoalsAway = awayResults.map((res) => res.scored);
    const teamGoalsAll = allTeamResults.map((res) => res.scored);
    const teamConceededHome = homeResults.map((res) => res.conceeded);
    const teamConceededAway = awayResults.map((res) => res.conceeded);
    const teamConceededAll = allTeamResults.map((res) => res.conceeded);

    const teamXGForAll = allTeamResults.map((res) => res.XG);
    const teamXGAgainstAll = allTeamResults.map((res) => res.XGAgainst);
    const teamXGForAllRecentAtStart = teamXGForAll;
    const teamXGAgainstAllRecentAtStart = teamXGAgainstAll;
    homeResults.sort((b, a) => a.dateRaw - b.dateRaw);
    awayResults.sort((b, a) => a.dateRaw - b.dateRaw);

    const teamXGForHome = homeResults.map((res) => res.XG);
    const teamXGAgainstHome = homeResults.map((res) => res.XGAgainst);
    const teamXGForAway = awayResults.map((res) => res.XG);
    const teamXGAgainstAway = awayResults.map((res) => res.XGAgainst);

    const XGSum = teamXGForAll.reduce((a, b) => a + b, 0);
    const avgXGScored = XGSum / teamXGForAll.length || 0;
    const XGAgainstSum = teamXGAgainstAll.reduce((a, b) => a + b, 0);
    const avgXGConceeded = XGAgainstSum / teamXGAgainstAll.length || 0;

    const shortTermXGDiff = form.avXGLast5 - form.avXGAgainstLast5;
    const longTermXGDiff = avgXGScored - avgXGConceeded;
    form.shortTermXGDiff = shortTermXGDiff.toFixed(2);
    form.longTermXGDiff = longTermXGDiff.toFixed(2);

    form.XGChangeRecently = shortTermXGDiff - longTermXGDiff;

    const possession = allTeamResults.map((res) => res.possession);
    const possessionSum = possession.reduce((a, b) => a + b, 0);
    const avgPossession = possessionSum / possession.length || 0;

    const possessionHome = homeResults.map((res) => res.possession);
    const possessionSumHome = possessionHome.reduce((a, b) => a + b, 0);
    form.avgPossessionHome = possessionSumHome / possessionHome.length || 0;

    const possessionAway = awayResults.map((res) => res.possession);
    const possessionSumAway = possessionAway.reduce((a, b) => a + b, 0);
    form.avgPossessionAway = possessionSumAway / possessionAway.length || 0;

    const dangerousAttacks = allTeamResults.map((res) => res.dangerousAttacks);
    const dangerousAttacksSum = dangerousAttacks.reduce((a, b) => a + b, 0);
    const avgDangerousAttacks =
      dangerousAttacksSum / dangerousAttacks.length || 40;

    const dangerousAttacksHome = homeResults.map((res) => res.dangerousAttacks);
    const dangerousAttacksSumHome = dangerousAttacksHome.reduce(
      (a, b) => a + b,
      40
    );
    form.avgDangerousAttacksHome =
      dangerousAttacksSumHome / dangerousAttacksHome.length || 40;

    const dangerousAttacksAway = awayResults.map((res) => res.dangerousAttacks);
    const dangerousAttacksSumAway = dangerousAttacksAway.reduce(
      (a, b) => a + b,
      0
    );
    form.avgDangerousAttacksAway =
      dangerousAttacksSumAway / dangerousAttacksAway.length || 40;

    const shots = allTeamResults.map((res) => res.shots);
    const shotsSum = shots.reduce((a, b) => a + b, 0);
    const avgShots = shotsSum / shots.length || 0;
    form.avgShots = avgShots;

    const shotsHome = homeResults.map((res) => res.shots);
    const shotsSumHome = shotsHome.reduce((a, b) => a + b, 0);
    form.avgShotsHome = shotsSumHome / shotsHome.length || 0;

    const shotsAway = awayResults.map((res) => res.shots);
    const shotsSumAway = shotsAway.reduce((a, b) => a + b, 0);
    form.avgShotsAway = shotsSumAway / shotsAway.length || 0;

    const shotsOnTarget = allTeamResults.map((res) => res.sot);
    const shotsOnTargetSum = shotsOnTarget.reduce((a, b) => a + b, 0);
    const avgShotsOnTarget = shotsOnTargetSum / shotsOnTarget.length || 0;

    const shotsOnTargetHome = homeResults.map((res) => res.sot);
    const shotsOnTargetSumHome = shotsOnTargetHome.reduce((a, b) => a + b, 0);
    form.avgShotsOnTargetHome =
      shotsOnTargetSumHome / shotsOnTargetHome.length || 0;

    const shotsOnTargetAway = awayResults.map((res) => res.sot);
    const shotsOnTargetSumAway = shotsOnTargetAway.reduce((a, b) => a + b, 0);
    form.avgShotsOnTargetAway =
      shotsOnTargetSumAway / shotsOnTargetAway.length || 0;

    form.directnessRating = avgPossession / avgShotsOnTarget;
    form.directnessRatingHome =
      form.avgPossessionHome / form.avgShotsOnTargetHome;
    form.directnessRatingAway =
      form.avgPossessionAway / form.avgShotsOnTargetAway;

    const shotsOnTargetAgainst = allTeamResults.map((res) => res.sotAgainst);
    const shotsOnTargetSumAgainst = shotsOnTargetAgainst.reduce(
      (a, b) => a + b,
      0
    );
    const avgShotsOnTargetAgainst =
      shotsOnTargetSumAgainst / shotsOnTargetAgainst.length || 0;

    const shotsOnTargetAgainstHome = homeResults.map((res) => res.sotAgainst);
    const shotsOnTargetSumAgainstHome = shotsOnTargetAgainstHome.reduce(
      (a, b) => a + b,
      0
    );
    form.avgShotsOnTargetAgainstHome =
      shotsOnTargetSumAgainstHome / shotsOnTargetAgainstHome.length || 0;

    const shotsOnTargetAgainstAway = awayResults.map((res) => res.sotAgainst);
    const shotsOnTargetSumAgainstAway = shotsOnTargetAgainstAway.reduce(
      (a, b) => a + b,
      0
    );
    form.avgShotsOnTargetAgainstAway =
      shotsOnTargetSumAgainstAway / shotsOnTargetAgainstAway.length || 0;

    const corners = allTeamResults.map((res) => res.corners);
    const cornersSum = corners.reduce((a, b) => a + b, 0);
    const cornersAv = cornersSum / corners.length || 0;

    const cornersLast5 = corners.slice(0, 5);
    const cornersSumLast5 = cornersLast5.reduce((a, b) => a + b, 0);
    const cornersAvLast5 = cornersSumLast5 / cornersLast5.length || 0;
    form.last5Corners = cornersAvLast5;

    const cornersHome = homeResults.map((res) => res.corners);
    const cornersSumHome = cornersHome.reduce((a, b) => a + b, 0);
    form.cornersAvHome = cornersSumHome / cornersHome.length || 0;

    const cornersAway = awayResults.map((res) => res.corners);
    const cornersSumAway = cornersAway.reduce((a, b) => a + b, 0);
    form.cornersAvAway = cornersSumAway / cornersAway.length || 0;

    const last5XG = teamXGForAllRecentAtStart.slice(0, 5);
    const last5XGSum = last5XG.reduce((a, b) => a + b, 0);
    const last5XGAvgFor = last5XGSum / last5XG.length || 0;

    const last5XGHome = teamXGForHome.slice(0, 5);
    const last5XGSumHome = last5XGHome.reduce((a, b) => a + b, 0);
    form.last5XGAvgForHome = last5XGSumHome / last5XGHome.length || 0;

    const last5XGAway = teamXGForAway.slice(0, 5);
    const last5XGSumAway = last5XGAway.reduce((a, b) => a + b, 0);
    form.last5XGAvgForAway = last5XGSumAway / last5XGAway.length || 0;

    const XGSumHome = teamXGForHome.reduce((a, b) => a + b, 0);
    form.avgXGScoredHome = XGSumHome / teamXGForHome.length || 0;

    const XGSumAway = teamXGForAway.reduce((a, b) => a + b, 0);
    form.avgXGScoredAway = XGSumAway / teamXGForAway.length || 0;

    const XGAgainstSumHome = teamXGAgainstHome.reduce((a, b) => a + b, 0);
    form.avgXGConceededHome = XGAgainstSumHome / teamXGAgainstHome.length || 0;

    const XGAgainstSumAway = teamXGAgainstAway.reduce((a, b) => a + b, 0);
    form.avgXGConceededAway = XGAgainstSumAway / teamXGAgainstAway.length || 0;

    const last5XGAgainst = teamXGAgainstAllRecentAtStart.slice(0, 5);
    const last5XGAgainstSum = last5XGAgainst.reduce((a, b) => a + b, 0);
    const last5XGAvgAgainst = last5XGAgainstSum / last5XGAgainst.length || 0;

    const last5XGAgainstHome = teamXGForHome.slice(0, 5);
    const last5XGAgainstSumHome = last5XGAgainstHome.reduce((a, b) => a + b, 0);
    form.last5XGAvgAgainstHome =
      last5XGAgainstSumHome / last5XGAgainstHome.length || 0;

    const last5XGAgainstAway = teamXGForAway.slice(0, 5);
    const last5XGAgainstSumAway = last5XGAgainstAway.reduce((a, b) => a + b, 0);
    form.last5XGAvgAgainstAway =
      last5XGAgainstSumAway / last5XGAgainstAway.length || 0;

    form.XGDiffNonAverage = XGSum - XGAgainstSum;
    form.XGDiffNonAverageLast5 = last5XGSum - last5XGAgainstSum;

    form.XGOverall = parseFloat(avgXGScored.toFixed(2));
    form.XGlast5 = parseFloat(last5XGAvgFor.toFixed(2));

    const shotsLast5Arr = shots.slice(0, 5);
    const shotsLast5Sum = shotsLast5Arr.reduce((a, b) => a + b, 0);
    const avgShotsLast5 = shotsLast5Sum / shotsLast5Arr.length || 0;
    form.avgShotsLast5 = avgShotsLast5;

    const shotsHomeArr = shotsHome.slice(0, 5);
    const shotsHomeSum = shotsHomeArr.reduce((a, b) => a + b, 0);
    const avgShotsHome = shotsHomeSum / shotsHomeArr.length || 0;
    form.avgShotsHome = avgShotsHome;

    const shotsAwayArr = shotsAway.slice(0, 5);
    const shotsAwaySum = shotsAwayArr.reduce((a, b) => a + b, 0);
    const avgShotsAway = shotsAwaySum / shotsAwayArr.length || 0;
    form.avgShotsAway = avgShotsAway;

    form.avgShotValue = (form.XGOverall / form.avgShots) * 100;
    form.avgShotValueLast5 = (form.XGlast5 / form.avgShotsLast5) * 100;
    form.avgShotValueHome = (form.avgXGScoredHome / form.avgShotsHome) * 100;
    form.avgShotValueAway = (form.avgXGScoredAway / form.avgShotsAway) * 100;

    form.XGAgainstAvgOverall = parseFloat(avgXGConceeded.toFixed(2));
    form.XGAgainstlast5 = parseFloat(last5XGAvgAgainst.toFixed(2));

    form.AveragePossessionOverall = parseFloat(avgPossession.toFixed(1));
    form.AverageDangerousAttacksOverall = parseFloat(
      avgDangerousAttacks.toFixed(1)
    );
    form["Average Shots"] = parseFloat(avgShots.toFixed(1));
    form.AverageCorners = parseFloat(cornersAv.toFixed(1));
    form.AverageShotsOnTargetOverall = parseFloat(avgShotsOnTarget.toFixed(1));
    form.AverageShotsOnTargetAgainstOverall = parseFloat(
      avgShotsOnTargetAgainst.toFixed(1)
    );
    const alpha = 0.4;
    const beta = 0.4;

    if (hOrA === "home") {
      form.homeResults = homeResults;
      form.allGoalsArrayHome = teamGoalsAll;
      form.allConceededArrayHome = teamConceededAll;
      form.allGoalsArrayHomeOnly = teamGoalsHome;
      form.allConceededArrayHomeOnly = teamConceededHome;
      const sum = teamGoalsHome.reduce((a, b) => a + b, 0);
      const sumTwo = teamConceededHome.reduce((a, b) => a + b, 0);
      form.goalDifferenceHomeOrAway = sum - sumTwo;
    } else if (hOrA === "away") {
      form.awayResults = awayResults;
      form.allGoalsArrayAway = teamGoalsAll;
      form.allConceededArrayAway = teamConceededAll;
      form.allGoalsArrayAwayOnly = teamGoalsAway;
      form.allConceededArrayAwayOnly = teamConceededAway;
      const sum = teamGoalsAway.reduce((a, b) => a + b, 0);
      const sumTwo = teamConceededAway.reduce((a, b) => a + b, 0);
      form.goalDifferenceHomeOrAway = sum - sumTwo;
    }

    async function create2DArray(arr1, arr2) {
      if (arr1.length !== arr2.length) {
        throw new Error("Arrays must have the same length.");
      }

      return arr1.map((element, index) => [element, arr2[index]]);
    }

    let bttsHome = homeResults.map((res) => res.btts);
    if (bttsHome.length > 10) {
      bttsHome = bttsHome.slice(-10);
    }

    let bttsAway = awayResults.map((res) => res.btts);
    if (bttsAway.length > 10) {
      bttsAway = bttsAway.slice(-10);
    }

    let bttsAll = allTeamResults.map((res) => res.btts);
    let last5BTTS = bttsAll.slice(0, 5);
    if (bttsAll.length > 10) {
      bttsAll = bttsAll.slice(-10);
    }

    const bttsHomeCount = bttsHome.filter((btts) => btts === true);
    const bttsHomeString = `${bttsHomeCount.length}/${bttsHome.length}`;
    const bttsHomePercentage = (
      (bttsHomeCount.length / bttsHome.length) *
      100
    ).toFixed(0);

    const bttsAwayCount = bttsAway.filter((btts) => btts === true);
    const bttsAwayString = `${bttsAwayCount.length}/${bttsAway.length}`;
    const bttsAwayPercentage = (
      (bttsAwayCount.length / bttsAway.length) *
      100
    ).toFixed(0);
    const bttsAllCount = bttsAll.filter((btts) => btts === true);
    const bttsAllString = `${bttsAllCount.length}/${bttsAll.length}`;
    const bttsAllPercentage = (
      (bttsAllCount.length / bttsAll.length) *
      100
    ).toFixed(0);

    const bttsLast5Count = last5BTTS.filter((btts) => btts === true);
    const bttsLast5Percentage = (
      (bttsLast5Count.length / last5BTTS.length) *
      100
    ).toFixed(0);
    form.bttsAllPercentage = bttsAllPercentage;
    form.bttsLast5Percentage = bttsLast5Percentage;

    form.bttsHomePercentage = bttsHomePercentage;
    form.bttsAwayPercentage = bttsAwayPercentage;

    let r = 10;
    let x = 10;

    const teamGoalsHomeRollingAverage = await predictNextWeightedMovingAverage(
      teamGoalsHome,
      teamGoalsHome.length < x ? teamGoalsHome.length : x
    );

    const teamGoalsAwayRollingAverage = await predictNextWeightedMovingAverage(
      teamGoalsAway,
      teamGoalsAway.length < x ? teamGoalsAway.length : x
    );

    function roundXG(xg, scored) {
      if (scored >= xg) {
        // Round up to the nearest integer if scored is greater or equal
        return Math.ceil(xg);
      } else {
        // Round down to the nearest integer if scored is less
        return Math.floor(xg);
      }
    }
    // console.log(form.teamName)
    // console.log(allTeamResults)
    const xgAndScored = allTeamResults.map((res) => ({
      XG: res.XG,
      scored: res.scored,
    }));
    const xgAgainstAndConceeded = allTeamResults.map((res) => ({
      XG: res.XGAgainst,
      conceeded: res.conceeded,
    }));

    const xgAndScoredHome = homeResults.map((res) => ({
      XG: res.XG,
      scored: res.scored,
    }));
    const xgAgainstAndConceededHome = homeResults.map((res) => ({
      XG: res.XGAgainst,
      conceeded: res.conceeded,
    }));
    const xgAndScoredAway = awayResults.map((res) => ({
      XG: res.XG,
      scored: res.scored,
    }));
    const xgAgainstAndConceededAway = awayResults.map((res) => ({
      XG: res.XGAgainst,
      conceeded: res.conceeded,
    }));

    const RoundedXGForV2 = xgAndScored.map(
      ({ XG }) => XG
      // roundXG(XG, scored, form)
    );
    const RoundedXGAgainstV2 = xgAgainstAndConceeded.map(
      ({ XG }) => XG
      // roundXG(XG, conceeded, form)
    );
    const RoundedXGForHomeV2 = xgAndScoredHome.map(
      ({ XG }) => XG
      // roundXG(XG, scored, form)
    );
    const RoundedXGAgainstHomeV2 = xgAgainstAndConceededHome.map(
      ({ XG }) => XG
      // roundXG(XG, conceeded, form)
    );
    const RoundedXGForAwayV2 = xgAndScoredAway.map(
      ({ XG }) => XG
      // roundXG(XG, scored, form)
    );
    const RoundedXGAgainstAwayV2 = xgAgainstAndConceededAway.map(
      ({ XG }) => XG
      // roundXG(XG, conceeded, form)
    );

    const ArrXGFor = teamXGForAll.map((xg) => xg);
    const ArrXGAgainst = teamXGAgainstAll.map((xg) => xg);
    const ArrXGForHome = teamXGForHome.map((xg) => xg);
    const ArrXGAgainstHome = teamXGAgainstHome.map((xg) => xg);
    const ArrXGForAway = teamXGForAway.map((xg) => xg);
    const ArrXGAgainstAway = teamXGAgainstAway.map((xg) => xg);

    form.twoDGoalsArray = await create2DArray(
      ArrXGFor.reverse(),
      ArrXGAgainst.reverse()
    );
    form.twoDGoalsArrayHome = await create2DArray(
      ArrXGForHome.reverse(),
      ArrXGAgainstHome.reverse()
    );
    form.twoDGoalsArrayAway = await create2DArray(
      ArrXGForAway.reverse(),
      ArrXGAgainstAway.reverse()
    );

    RoundedXGForV2.reverse();
    RoundedXGAgainstV2.reverse();
    RoundedXGForHomeV2.reverse();
    RoundedXGAgainstHomeV2.reverse();
    RoundedXGForAwayV2.reverse();
    RoundedXGAgainstAwayV2.reverse();
    // RoundedXGForAway.reverse()
    // RoundedXGAgainstAway.reverse()

    form.XGPrediction = await predictGoalsWithExponentialSmoothing(
      RoundedXGForV2,
      RoundedXGAgainstV2,
      alpha
    );

    form.XGPredictionHome = await predictGoalsWithExponentialSmoothing(
      RoundedXGForHomeV2,
      RoundedXGAgainstHomeV2,
      beta
    );

    form.XGPredictionAway = await predictGoalsWithExponentialSmoothing(
      RoundedXGForAwayV2,
      RoundedXGAgainstAwayV2,
      beta
    );

    const teamConceededHomeRollingAverage =
      await predictNextWeightedMovingAverage(
        teamConceededHome,
        teamConceededHome.length < x ? teamConceededHome.length : x
      );

    const teamConceededAwayRollingAverage =
      await predictNextWeightedMovingAverage(
        teamConceededAway,
        teamConceededAway.length < x ? teamConceededAway.length : x
      );

    const sum = teamGoalsAll.reduce((a, b) => a + b, 0);
    const avgScored = sum / teamGoalsAll.length || 0;
    form.avgScored = parseFloat(avgScored.toFixed(2));

    const sumHome = teamGoalsHome.reduce((a, b) => a + b, 0);
    const avgScoredHome = sumHome / teamGoalsHome.length || 0;
    form.avgScoredHome = parseFloat(avgScoredHome.toFixed(2));

    const sumAway = teamGoalsAway.reduce((a, b) => a + b, 0);
    const avgScoredAway = sumAway / teamGoalsAway.length || 0;
    form.avgScoredAway = parseFloat(avgScoredAway.toFixed(2));

    const last5 = teamGoalsAll.slice(0, 5);
    const last5Sum = last5.reduce((a, b) => a + b, 0);
    const last5AvgScored = parseFloat(last5Sum / last5.length || 0);

    const last5Home = teamGoalsHome.slice(0, 5);
    const last5SumHome = last5Home.reduce((a, b) => a + b, 0);
    form.last5AvgScoredHome = parseFloat(last5SumHome / last5Home.length || 0);

    const last5Away = teamGoalsAway.slice(0, 5);
    const last5SumAway = last5Away.reduce((a, b) => a + b, 0);
    form.last5AvgScoredAway = parseFloat(last5SumAway / last5Away.length || 0);

    const last5Conceeded = teamConceededAll.slice(0, 5);
    const last5ConceededSum = last5Conceeded.reduce((a, b) => a + b, 0);
    const last5AvgConceeded = parseFloat(
      last5ConceededSum / last5Conceeded.length || 0
    );

    form.last5GoalDiff = last5Sum - last5ConceededSum;

    const last5ConceededHome = teamConceededHome.slice(0, 5);
    const last5ConceededSumHome = last5ConceededHome.reduce((a, b) => a + b, 0);
    form.last5AvgConceededHome = parseFloat(
      last5ConceededSumHome / last5ConceededHome.length || 0
    );

    const last5ConceededAway = teamConceededAway.slice(0, 5);
    const last5ConceededSumAway = last5ConceededAway.reduce((a, b) => a + b, 0);
    form.last5AvgConceededAway = parseFloat(
      last5ConceededSumAway / last5ConceededAway.length || 0
    );

    const last10 = teamGoalsAll.slice(0, 10);
    const last10Sum = last10.reduce((a, b) => a + b, 0);
    const last10AvgScored = parseFloat(last10Sum / last10.length || 0);

    const last10Conceeded = teamConceededAll.slice(0, 10);
    const last10ConceededSum = last10Conceeded.reduce((a, b) => a + b, 0);
    const last10AvgConceeded = parseFloat(
      last10ConceededSum / last10Conceeded.length || 0
    );

    form.avgShotValueChart =
      (form.XGOverall / form.avgShots) * 100 * form.ScoredAverage;
    form.avgShotValueLast5Chart =
      (form.avXGLast5 / form.avgShotsLast5) * 100 * form.avScoredLast5;
    form.avgShotValueHomeChart =
      (form.avgXGScoredHome / form.avgShotsHome) * 100 * form.avgScoredHome;
    form.avgShotValueAwayChart =
      (form.avgXGScoredAway / form.avgShotsAway) * 100 * form.avgScoredAway;

    form.last5Goals = parseFloat(last5AvgScored.toFixed(2));
    form.last5GoalsConceeded = parseFloat(last5AvgConceeded.toFixed(2));
    form.last10Goals = parseFloat(last10AvgScored.toFixed(2));
    form.last10GoalsConceeded = parseFloat(last10AvgConceeded.toFixed(2));
    form.last10GoalDiff = form.last10Goals - form.last10GoalsConceeded;

    const teamGoalsAllRollingAverage = await predictNextWeightedMovingAverage(
      teamGoalsAll,
      teamGoalsAll.length < r ? teamGoalsAll.length : r
    );

    const teamGoalsConceededAllRollingAverage =
      await predictNextWeightedMovingAverage(
        last10Conceeded,
        last10Conceeded.length < 10 ? last10Conceeded.length : 10
      );

    const sumTwo = teamConceededAll.reduce((a, b) => a + b, 0);
    const avgConceeded = sumTwo / teamConceededAll.length || 0;
    form.avgConceeded = parseFloat(avgConceeded.toFixed(2));

    const teamConceededHomeOnlySum = teamConceededHome.reduce(
      (a, b) => a + b,
      0
    );
    const teamConceededAvgHomeOnly =
      teamConceededHomeOnlySum / teamConceededHome.length || 0;
    form.teamConceededAvgHomeOnly = teamConceededAvgHomeOnly;

    const teamConceededAwayOnlySum = teamConceededAway.reduce(
      (a, b) => a + b,
      0
    );
    const teamConceededAvgAwayOnly =
      teamConceededAwayOnlySum / teamConceededAway.length || 0;
    form.teamConceededAvgAwayOnly = teamConceededAvgAwayOnly;

    form.goalDifference = sum - sumTwo;

    // console.log(teamGoalsHomeRollingAverage)
    // console.log(teamGoalsAwayRollingAverage)
    // console.log(teamGoalsAllRollingAverage)
    // console.log(teamConceededHomeRollingAverage)
    // console.log(teamConceededAwayRollingAverage)
    // console.log(teamGoalsConceededAllRollingAverage)
    // console.log(averageOddsHome)
    // console.log(averageOddsAway)
    // console.log(avgScored)
    // console.log(avgConceeded)
    // console.log(form.XGPrediction)
    // console.log(forAndAgainstRollingAvHomeOrAway)
    // console.log(forAndAgainstRollingAv)

    return [
      teamConceededHomeRollingAverage,
      teamConceededAwayRollingAverage,
      teamGoalsConceededAllRollingAverage,
      averageOddsHome,
      averageOddsAway,
      avgScored,
      avgConceeded,
      bttsAllString,
      bttsHomeString,
      bttsAwayString,
      bttsAllPercentage,
      bttsHomePercentage,
      bttsAwayPercentage,
      // forAndAgainstRollingAvHomeOrAway,
      // forAndAgainstRollingAv,
    ];
  } else {
    console.log(form.teamName);
    return null;
  }
}

async function predictNextWeightedMovingAverage(numbers, windowSize) {
  const startIndex = numbers.length - windowSize;
  const window = numbers.slice(startIndex);
  const weights = Array.from(
    { length: windowSize },
    (_, i) => (i + 1) / ((windowSize * (windowSize + 1)) / 2)
  );
  const sum = window.reduce((acc, num, i) => acc + num * weights[i], 0);
  const movingAverage = sum / weights.reduce((acc, w) => acc + w, 0);
  return parseFloat(movingAverage.toFixed(2));
}

// // Function to cap goals at a maximum value
// function capGoals(goals, maxGoals = 4) {
//   return Math.min(goals, maxGoals);
// }

// Function to calculate the weighted average using exponential smoothing
async function calculateWeightedAverage(arr, alpha) {
  let weightedSum = 0;
  let totalWeight = 0;

  for (let i = arr.length - 1; i >= 0; i--) {
    const weight = Math.pow(1 - alpha, arr.length - 1 - i);
    weightedSum += arr[i] * weight;
    totalWeight += weight;
  }

  return weightedSum / totalWeight;
}

// Function to predict goals scored and conceded for a team with exponential smoothing
async function predictGoalsWithExponentialSmoothing(
  teamGoalsFor,
  teamGoalsAgainst,
  alpha
) {
  const lambdaFor = await calculateWeightedAverage(teamGoalsFor, alpha);
  const lambdaAgainst = await calculateWeightedAverage(teamGoalsAgainst, alpha);

  // You can fine-tune these values based on your model and data
  const predictedGoalsFor = lambdaFor;
  const predictedGoalsAgainst = lambdaAgainst;

  return {
    goalsFor: predictedGoalsFor,
    goalsAgainst: predictedGoalsAgainst,
  };
}

async function calculateDifference(num1, num2) {
  return num1 >= num2 ? num1 - num2 : -(num2 - num1);
}

export async function comparison(metricOne, metricTwo) {
  let stat1 = parseFloat(metricOne);
  let stat2 = parseFloat(metricTwo);
  let statDiff;

  statDiff = await calculateDifference(stat1, stat2);

  return parseFloat(statDiff);
}

export async function compareStat(statOne, statTwo) {
  let stat1 = parseFloat(statOne);
  let stat2 = parseFloat(statTwo);
  let statDiff;
  // console.log( await normalizeValues(12, 2, 0, 1))
  // console.log(await diff(1.8571428571428571, 1.14285714285714285))

  if (stat1 === 0) {
    stat1 = stat1 + 1;
    stat2 = stat2 + 1;
  }
  if (stat2 === 0) {
    stat2 = stat2 + 1;
    stat2 = stat2 + 1;
  }

  const { normalizedValue1, normalizedValue2 } = await normalizeValues(
    stat1,
    stat2,
    0,
    1
  );

  const finalValue1 = normalizedValue1;
  const finalValue2 = normalizedValue2;

  statDiff = await diff(finalValue1, finalValue2);

  // if (statDiff > 0.3 || statDiff < -0.3) {
  //   // console.log(statDiff)
  // } else {
  //   statDiff = 0;
  // }
  return statDiff;
}

export async function getClinicalRating(form) {
  let rating;
  let score;
  switch (true) {
    case form.dangerousAttackConversion <= 15:
      rating = "excellent";
      score = 0.8;
      break;

    case form.dangerousAttackConversion > 15 &&
      form.dangerousAttackConversion <= 20:
      rating = "great";
      score = 0.9;
      break;

    case form.dangerousAttackConversion > 20 &&
      form.dangerousAttackConversion <= 25:
      rating = "very good";
      score = 0.95;
      break;

    case form.dangerousAttackConversion > 25 &&
      form.dangerousAttackConversion <= 32.5:
      rating = "good";
      score = 0.98;
      break;

    case form.dangerousAttackConversion > 30 &&
      form.dangerousAttackConversion <= 35:
      rating = "above average";
      score = 0.99;
      break;

    case form.dangerousAttackConversion > 35 &&
      form.dangerousAttackConversion <= 40:
      rating = "average";
      score = 1;
      break;

    case form.dangerousAttackConversion > 40 &&
      form.dangerousAttackConversion <= 45:
      rating = "below average";
      score = 1.01;
      break;

    case form.dangerousAttackConversion > 45 &&
      form.dangerousAttackConversion <= 50:
      rating = "poor";
      score = 1.05;
      break;

    case form.dangerousAttackConversion > 50 &&
      form.dangerousAttackConversion <= 55:
      rating = "very poor";
      score = 1.1;
      break;

    case form.dangerousAttackConversion > 55 &&
      form.dangerousAttackConversion <= 60:
      rating = "terrible";
      score = 1.2;
      break;

    case form.dangerousAttackConversion > 60:
      rating = "awful";
      score = 1.3;
      break;

    default:
      break;
  }

  return [rating, score];
}

export async function getPointsDifferential(pointsHomeAvg, pointsAwayAvg) {
  const differential = await diff(pointsHomeAvg, pointsAwayAvg);
  return parseFloat(differential);
}

export async function getPointWeighting(pointsDiff) {
  let pointsDiffWeightingHome;
  let pointsDiffWeightingAway;

  switch (true) {
    case pointsDiff >= 2.5:
      pointsDiffWeightingHome = 0.3;
      pointsDiffWeightingAway = -0.3;
      break;
    case pointsDiff >= 2 && pointsDiff < 2.5:
      pointsDiffWeightingHome = 0.2;
      pointsDiffWeightingAway = -0.2;
      break;
    case pointsDiff >= 1.5 && pointsDiff < 2:
      pointsDiffWeightingHome = 0.15;
      pointsDiffWeightingAway = -0.15;
      break;
    case pointsDiff >= 1 && pointsDiff < 1.5:
      pointsDiffWeightingHome = 0.1;
      pointsDiffWeightingAway = -0.1;
      break;
    case pointsDiff >= 0.5 && pointsDiff < 1:
      pointsDiffWeightingHome = 0.05;
      pointsDiffWeightingAway = -0.05;
      break;
    case pointsDiff > -0.5 && pointsDiff < 0.5:
      pointsDiffWeightingHome = 0;
      pointsDiffWeightingAway = 0;
      break;
    case pointsDiff <= -0.5 && pointsDiff > -1:
      pointsDiffWeightingHome = -0.05;
      pointsDiffWeightingAway = 0.05;
      break;
    case pointsDiff <= -1 && pointsDiff > -1.5:
      pointsDiffWeightingHome = -0.1;
      pointsDiffWeightingAway = 0.1;
      break;
    case pointsDiff <= -1.5 && pointsDiff > -2:
      pointsDiffWeightingHome = -0.15;
      pointsDiffWeightingAway = 0.15;
      break;
    case pointsDiff <= -2 && pointsDiff > -2.5:
      pointsDiffWeightingHome = -0.2;
      pointsDiffWeightingAway = 0.2;
      break;
    case pointsDiff <= -2.5:
      pointsDiffWeightingHome = -0.3;
      pointsDiffWeightingAway = 0.3;
      break;
    default:
      pointsDiffWeightingHome = 0;
      pointsDiffWeightingAway = 0;
  }
  return [pointsDiffWeightingHome, pointsDiffWeightingAway];
}

export async function compareFormTrend(recentForm, distantForm) {
  let score;
  let scoreTotal = 0;

  for (let index = 0; index < recentForm.length; index++) {
    const recent = recentForm[index];
    const distant = distantForm[index];

    if (recent > distant) {
      score = 1.05;
    } else if (recent === distant) {
      score = 1;
    } else if (recent < distant) {
      score = 0.95;
    }
    scoreTotal = scoreTotal + score / recentForm.length;
  }

  return scoreTotal;
}

export async function getPointAverage(pointTotal, games) {
  return pointTotal / games;
}

async function poissonDistribution(lambda, k) {
  const numerator = Math.exp(-lambda) * Math.pow(lambda, k);
  const denominator = factorial(k);
  return numerator / denominator;
}

function factorial(n) {
  if (n === 0 || n === 1) {
    return 1;
  }
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}

async function calculateAverageGoals(goalsFor) {
  const totalGoals = goalsFor.reduce((sum, goals) => sum + goals, 0);
  return totalGoals / goalsFor.length;
}

async function adjustGoalsAvg(goalsAvg, strengthRatio) {
  return goalsAvg * strengthRatio;
}

async function normalizeDifference(value1, value2) {
  // Calculate the absolute difference between the two values
  const difference = Math.abs(value1 - value2);

  // Define a fixed maximum possible difference (you can adjust this value based on your needs)
  const maxDifference = 25; // Adjust this based on your expected data

  // Normalize the difference to a 0-1 range
  const normalizedDifference = difference / maxDifference;

  // Map to range 0.25 to 1.75 inversely for value1 and value2
  const scaleMin = 0.8;
  const scaleMax = 1.2;

  // The multiplier now stretches across the 0.25 to 1.75 range (difference is 1.5)
  const multiplier = 0.2;

  let value1Normalized, value2Normalized;

  if (value1 > value2) {
    value1Normalized = 1 + normalizedDifference * multiplier; // Closer to 1.75
    value2Normalized = 1 - normalizedDifference * multiplier; // Closer to 0.25
  } else if (value1 < value2) {
    value1Normalized = 1 - normalizedDifference * multiplier; // Closer to 0.25
    value2Normalized = 1 + normalizedDifference * multiplier; // Closer to 1.75
  } else {
    // If the values are equal, normalize both to 1
    value1Normalized = 1;
    value2Normalized = 1;
  }

  return {
    value1Normalized: Math.max(scaleMin, Math.min(value1Normalized, scaleMax)),
    value2Normalized: Math.max(scaleMin, Math.min(value2Normalized, scaleMax)),
  };
}

async function predictScore(
  goalsForTeam1,
  goalsAgainstTeam1,
  goalsForTeam2,
  goalsAgainstTeam2,
  team1Metrics,
  team2Metrics,
  game
) {
  let team1AverageGoalsFor = await calculateAverageGoals(goalsForTeam1);
  let team1AverageGoalsAgainst = await calculateAverageGoals(goalsAgainstTeam1);
  let team2AverageGoalsFor = await calculateAverageGoals(goalsForTeam2);
  let team2AverageGoalsAgainst = await calculateAverageGoals(goalsAgainstTeam2);

  let team1StrengthRatio = 1;
  let team2StrengthRatio = 1;

  let adjustedTeam1AverageGoals = await adjustGoalsAvg(
    team1AverageGoalsFor,
    team1StrengthRatio
  );
  let adjustedTeam2AverageGoals = await adjustGoalsAvg(
    team2AverageGoalsFor,
    team2StrengthRatio
  );

  let adjustedTeam1AverageGoalsAgainst = await adjustGoalsAvg(
    team1AverageGoalsAgainst,
    team2StrengthRatio
  );
  let adjustedTeam2AverageGoalsAgainst = await adjustGoalsAvg(
    team2AverageGoalsAgainst,
    team1StrengthRatio
  );

  let maxGoals = 5; // Set the maximum number of goals to predict

  const scores = [];

  for (let i = 0; i <= maxGoals; i++) {
    for (let j = 0; j <= maxGoals; j++) {
      let team1GoalExpectation =
        (adjustedTeam1AverageGoals + adjustedTeam2AverageGoalsAgainst) / 2;
      // (adjustedTeam2AverageGoalsAgainst / adjustedTeam1AverageGoalsAgainst);
      let team2GoalExpectation =
        (adjustedTeam2AverageGoals + adjustedTeam1AverageGoalsAgainst) / 2;
      // (adjustedTeam1AverageGoalsAgainst / adjustedTeam2AverageGoalsAgainst);

      if (!isFinite(team1GoalExpectation)) {
        team1GoalExpectation = 0;
      }

      if (!isFinite(team2GoalExpectation)) {
        team2GoalExpectation = 0;
      }

      const probability =
        (await poissonDistribution(team1GoalExpectation, i)) *
        (await poissonDistribution(team2GoalExpectation, j));
      scores.push({
        team1Score: i,
        team2Score: j,
        probability,
      });
    }
  }

  scores.sort((a, b) => b.probability - a.probability); // Sort scores in descending order by probability
  const top5Scores = scores.slice(0, 5); // Get the top 5 scores

  return top5Scores;
}

async function normalizeValues(value1, value2, minRange, maxRange) {
  if (
    typeof value1 !== "number" ||
    typeof value2 !== "number" ||
    typeof minRange !== "number" ||
    typeof maxRange !== "number"
  ) {
    throw new Error("All arguments must be numbers.");
  }

  // Calculate the absolute values of the inputs

  const absValue1 = Math.abs(value1);
  const absValue2 = Math.abs(value2);

  // Calculate the total sum of the absolute values
  const totalAbs = absValue1 + absValue2;

  // Calculate the normalized values based on the ratio of absolute values
  const normalizedAbsValue1 =
    (absValue1 / totalAbs) * (maxRange - minRange) + minRange;
  const normalizedAbsValue2 =
    (absValue2 / totalAbs) * (maxRange - minRange) + minRange;

  // Adjust the signs of the normalized values based on the original values
  const normalizedValue1 =
    value1 >= 0 ? normalizedAbsValue1 : -normalizedAbsValue1;
  const normalizedValue2 =
    value2 >= 0 ? normalizedAbsValue2 : -normalizedAbsValue2;

  return { normalizedValue1, normalizedValue2 };
}

async function findClosestProperty(obj, number) {
  let closestProperty = null;
  let smallestDifference = Infinity;

  for (const [key, value] of Object.entries(obj)) {
    const difference = Math.abs(number - value);
    if (difference < smallestDifference) {
      smallestDifference = difference;
      closestProperty = key;
    }
  }

  return closestProperty;
}

export async function generateGoals(homeForm, awayForm, match) {
  const avgHomeXG = (homeForm.avXGLast5 + awayForm.avXGAgainstLast5) / 2;
  const avgHomeGoals = (homeForm.avScoredLast5 + awayForm.avConceededLast5) / 2;
  const avgHomeGoalsLast10 =
    (homeForm.last10Goals + awayForm.last10GoalsConceeded) / 2;

  let homeGoals = (avgHomeGoals + avgHomeXG + avgHomeGoalsLast10) / 3;

  const avgAwayXG = (awayForm.avXGLast5 + homeForm.avXGAgainstLast5) / 2;
  const avgAwayGoals = (awayForm.avScoredLast5 + homeForm.avConceededLast5) / 2;
  const avgAwayGoalsLast10 =
    (awayForm.last10Goals + homeForm.last10GoalsConceeded) / 2;

  let awayGoals = (avgAwayGoals + avgAwayXG + avgAwayGoalsLast10) / 3;

  let homeExpectedScore =
    homeForm.attackingMetrics["Average Expected Goals"] -
    awayForm.defensiveMetrics["Average XG Against"];
  let awayExpectedScore =
    awayForm.attackingMetrics["Average Expected Goals"] -
    homeForm.defensiveMetrics["Average XG Against"];
  let goalDifference = homeExpectedScore - awayExpectedScore;
  let adjustToHome = Math.round(homeForm.CleanSheetPercentage / 50);
  let adjustToAway = Math.round(awayForm.CleanSheetPercentage / 50) * -1;
  let finalScore = goalDifference + adjustToHome + adjustToAway;

  const homeAttackVsAwayDefenceComparison = await comparison(
    homeForm.attackingStrength,
    awayForm.defensiveStrengthScoreGeneration
  );

  const awayAttackVsHomeDefenceComparison = await comparison(
    awayForm.attackingStrength,
    homeForm.defensiveStrengthScoreGeneration
  );

  const homeOverallVsAwayOverallComparison = await comparison(
    homeForm.attackingStrength + homeForm.defensiveStrength,
    awayForm.attackingStrength + awayForm.defensiveStrength
  );

  const awayOverallVsHomeOverallComparison = await comparison(
    awayForm.attackingStrength + awayForm.defensiveStrength,
    homeForm.attackingStrength + homeForm.defensiveStrength
  );

  const homeAttackVsAwayDefenceComparisonLast5 = await comparison(
    homeForm.attackingStrengthLast5,
    awayForm.defensiveStrengthScoreGenerationLast5
  );
  const awayAttackVsHomeDefenceComparisonLast5 = await comparison(
    awayForm.attackingStrengthLast5,
    homeForm.defensiveStrengthScoreGenerationLast5
  );

  const homeAttackVsAwayDefenceComparisonHomeOnly = await comparison(
    homeForm.attackingStrengthHomeOnly,
    awayForm.defensiveStrengthScoreGenerationAwayOnly
  );
  const awayAttackVsHomeDefenceComparisonAwayOnly = await comparison(
    awayForm.attackingStrengthAwayOnly,
    homeForm.defensiveStrengthScoreGenerationHomeOnly
  );

  const pointsComparisonHome = await comparison(
    homeForm.avPoints6,
    awayForm.avPoints6
  );

  const pointsComparisonAway = await comparison(
    awayForm.avPoints6,
    homeForm.avPoints6
  );

  const oddsComparisonHome = await comparison(match.awayOdds, match.homeOdds);
  const oddsComparisonAway = await comparison(match.homeOdds, match.awayOdds);

  homeForm.XGRating =
    homeForm.attackingStrength +
    homeForm.defensiveStrengthScoreGeneration +
    homeForm.attackingStrengthLast5 +
    homeForm.defensiveStrengthScoreGenerationLast5 +
    homeForm.attackingStrengthHomeOnly +
    homeForm.defensiveStrengthScoreGenerationHomeOnly;

  awayForm.XGRating =
    awayForm.attackingStrength +
    awayForm.defensiveStrengthScoreGeneration +
    awayForm.attackingStrengthLast5 +
    awayForm.defensiveStrengthScoreGenerationLast5 +
    awayForm.attackingStrengthAwayOnly +
    awayForm.defensiveStrengthScoreGenerationAwayOnly;

  const XGRatingHomeComparison = await comparison(
    homeForm.XGRating,
    awayForm.XGRating
  );

  const XGRatingAwayComparison = await comparison(
    awayForm.XGRating,
    homeForm.XGRating
  );

  const weighedPointsComparisonHome = await comparison(
    homeForm.pointsWeighted,
    homeForm.points
  );

  const weighedPointsComparisonAway = await comparison(
    awayForm.pointsWeighted,
    awayForm.points
  );

  homeGoals =
    homeGoals +
    homeAttackVsAwayDefenceComparison * 3 +
    XGRatingHomeComparison * 0 +
    homeAttackVsAwayDefenceComparisonLast5 * 0 +
    0.2 +
    homeAttackVsAwayDefenceComparisonHomeOnly * 0 +
    // weighedPointsComparisonHome * 0.005 +
    oddsComparisonHome * 0;

  awayGoals =
    awayGoals +
    awayAttackVsHomeDefenceComparison * 3 +
    XGRatingAwayComparison * 0 +
    -Math.abs(0.2) +
    awayAttackVsHomeDefenceComparisonLast5 * 0 +
    awayAttackVsHomeDefenceComparisonAwayOnly * 0 +
    // weighedPointsComparisonAway * 0.005 +
    oddsComparisonAway * 0;

  // Cumulative ROI for all 3157 match outcomes: +4.31%

  if (finalScore > 0 && (await diff(homeGoals, awayGoals)) < 1.25) {
    homeGoals = homeGoals + 0.5;
    awayGoals = awayGoals + -Math.abs(0.5);
  } else if (finalScore < 0 && (await diff(awayGoals, homeGoals)) < 1.25) {
    homeGoals = homeGoals + -Math.abs(0.5);
    awayGoals = awayGoals + 0.5;
  }

  //PLACEHOLDER

  if (homeGoals < 0 && awayGoals < 0) {
    if (homeGoals < awayGoals) {
      homeGoals = homeGoals + awayGoals / 4;
      awayGoals = awayGoals - homeGoals / 4;
    } else if (homeGoals > awayGoals) {
      homeGoals = homeGoals - awayGoals / 4;
      awayGoals = awayGoals + homeGoals / 4;
    }
  } else if (homeGoals < -1 && awayGoals < 1) {
    awayGoals = awayGoals + Math.abs(homeGoals) / 2;
  } else if (awayGoals < -1 && homeGoals < 1) {
    homeGoals = homeGoals + Math.abs(awayGoals) / 2;
  }

  return [homeGoals, awayGoals];
}

async function calculatePlayingStyle(points, possession) {
  let style;

  switch (true) {
    case possession > 60:
      switch (true) {
        case points > 12:
          style = "Extremely controlling and patient";
          break;
        case points > 9.5:
          style = "Highly controlling, slow and patient";
          break;
        case points > 8.5:
          style = "Balanced and controlling possession";
          break;
        case points > 6:
          style = "Attacking and controlling possession";
          break;
        case points > 3:
          style = "Extremely attacking control approach";
          break;
        default:
          style = "N/A";
          break;
      }
      break;

    case possession > 50:
      switch (true) {
        case points > 12:
          style = "Passive, inefficient possession play";
          break;
        case points > 9:
          style = "Patient, possession-based approach";
          break;
        case points > 8:
          style = "Balanced with some possession focus";
          break;
        case points > 5:
          style = "Direct control, effective possession";
          break;
        case points > 3:
          style = "Extremely direct attacking approach";
          break;
        default:
          style = "N/A";
          break;
      }
      break;

    case possession > 40:
      switch (true) {
        case points > 12:
          style = "Low control with wasteful transitions";
          break;
        case points > 10:
          style = "Wasteful transitional countering play";
          break;
        case points > 7.5:
          style = "Counter attacking and quick build up";
          break;
        case points > 5:
          style = "Direct and precise transitional play";
          break;
        case points > 3:
          style = "Extremely effective transition focus";
          break;
        default:
          style = "N/A";
          break;
      }
      break;

    case possession > 20:
      switch (true) {
        case points > 13:
          style = "Concede possession, highly inefficient";
          break;
        case points > 10:
          style = "Defensive with inefficient transitions";
          break;
        case points > 7:
          style = "Counter attacking and very direct play";
          break;
        case points > 4:
          style = "Extremely counter attacking transitions";
          break;
        case points > 2:
          style = "Extremely direct, efficient countering";
          break;
        default:
          style = "N/A";
          break;
      }
      break;

    default:
      style = "N/A";
      break;
  }

  return style;
}

export async function roundCustom(num, form, otherForm) {
  let wholeNumber = Math.floor(num);
  let remainder = num - wholeNumber;
  let goals;

  if (remainder > 0.9) {
    goals = Math.ceil(num);
  } else {
    goals = Math.floor(num);
  }

  return goals;
}

//Calculates scores based on prior XG figures, weighted by odds
let i = 0;

export async function calculateScore(match, index, divider, calculate) {
  i++;

  let teams;

  if (
    calculate === true &&
    allForm.find(
      (game) =>
        game.home.teamName === match.homeTeam &&
        game.away.teamName === match.awayTeam
    )
  ) {
    teams = [
      allForm.find((game) => game.home.teamName === match.homeTeam).home,
      allForm.find((game) => game.away.teamName === match.awayTeam).away,
    ];
  } else {
    calculate = false;
  }

  let formHome;
  let formAway;

  if (calculate) {
    for (let i = 0; i < teams.length; i++) {
      if (teams[0][index].PlayedHome <= 1 || teams[1][index].PlayedAway <= 1) {
        index = 2;
        divider = 10;
      }

      if (teams[i][index].formRun) {
        teams[i][index].lastHomeOrAwayPoints = getPointsFromLastX(
          teams[i][index].formRun
        );

        teams[i][index].homeOrAwayAverage = await getPointAverage(
          teams[i][index].lastHomeOrAwayPoints,
          teams[i][index].formRun.length
        );
      }

      teams[i][0].ScoredAverage = teams[i][0].ScoredOverall / 5;
      teams[i][1].ScoredAverage = teams[i][1].ScoredOverall / 6;
      teams[i][2].ScoredAverage = teams[i][2].ScoredOverall / 10;

      teams[i][0].ConcededAverage = teams[i][0].ConcededOverall / 5;
      teams[i][1].ConcededAverage = teams[i][1].ConcededOverall / 6;
      teams[i][2].ConcededAverage = teams[i][2].ConcededOverall / 10;

      if (teams[i][1].ScoredAverage === 0) {
        teams[i][1].ScoredAverage = teams[i][index].ScoredOverall / 10;
        teams[i][1].ScoredOverall = teams[i][2].ScoredOverall / 2;
      }

      if (teams[i][1].ConcededAverage === 0) {
        teams[i][1].ConcededAverage = teams[i][index].ConcededOverall / 10;
        teams[i][1].ConcededOverall = teams[i][2].ConcededOverall / 2;
      }

      teams[i][index].ScoredAverageShortTerm = teams[i][0].ScoredOverall / 5;
      teams[i][index].ConcededAverageShortTerm =
        teams[i][0].ConcededOverall / 5;

      teams[i][index].longTermAverageGoals = teams[i][2].ScoredOverall / 10;
      teams[i][index].longTermAverageConceeded =
        teams[i][2].ConcededOverall / 10;

      let recentGoalDiff =
        teams[i][index].ScoredAverageShortTerm -
        teams[i][index].ConcededAverageShortTerm;
      let distantGoalDiff =
        teams[i][index].longTermAverageGoals -
        teams[i][index].longTermAverageConceeded;

      let recentDA = teams[i][0].AverageDangerousAttacksOverall;
      let distantDA = teams[i][2].AverageDangerousAttacksOverall;

      let recentPosession = teams[i][0].AveragePossessionOverall;
      let distantPosession = teams[i][2].AveragePossessionOverall;

      let recentCleanSheet = teams[i][0].CleanSheetPercentage;
      let distantCleanSheet = teams[i][2].CleanSheetPercentage;

      let recentFormArray = [
        recentGoalDiff,
        recentDA,
        recentPosession,
        recentCleanSheet,
      ];
      let distantFormArray = [
        distantGoalDiff,
        distantDA,
        distantPosession,
        distantCleanSheet,
      ];

      teams[i][index].formTrendScore = await compareFormTrend(
        recentFormArray,
        distantFormArray
      );

      teams[i][index].expectedGoals = parseFloat(teams[i][index].XG);

      teams[i][index].ScoredAverageShortAndLongTerm =
        (teams[i][index].ScoredOverall / 10 +
          teams[i][index].ScoredAverageShortTerm) /
        2;

      teams[i][index].conceededAverageShortAndLongTerm =
        (teams[i][index].ConcededOverall / 10 +
          teams[i][index].ConcededAverageShortTerm) /
        2;

      teams[i][index].longTermGoalDifference =
        teams[i][2].ScoredAverage - teams[i][2].ConcededAverage;

      teams[i][index].shortTermGoalDifference =
        teams[i][0].ScoredAverage - teams[i][0].ConcededAverage;

      teams[i][index].XGdifferential = await diff(
        teams[i][index].XGOverall,
        teams[i][index].XGAgainstAvgOverall
      );
    }

    homeOdds = match.homeOdds;
    awayOdds = match.awayOdds;

    formHome = teams[0][index];
    formAway = teams[1][index];

    formHome.dangerousAttackConversion =
      (formHome.ScoredAverageShortAndLongTerm /
        formHome.AverageDangerousAttacksOverall) *
      100;
    formAway.dangerousAttackConversion =
      (formAway.ScoredAverageShortAndLongTerm /
        formAway.AverageDangerousAttacksOverall) *
      100;

    [formHome.clinicalRating, formHome.clinicalScore] = await getClinicalRating(
      formHome
    );
    [formAway.clinicalRating, formAway.clinicalScore] = await getClinicalRating(
      formAway
    );

    let XGdifferential = await diff(
      formHome.XGdifferential,
      formAway.XGdifferential
    );

    formHome.teamName = match.homeTeam;
    formAway.teamName = match.awayTeam;

    match.XGdifferentialValue = Math.abs(XGdifferential);
    match.XGdifferentialValueRaw = parseFloat(XGdifferential);
    if (
      allLeagueResultsArrayOfObjects[match.leagueIndex].fixtures.length > 10 &&
      match.leagueID !== 7956
    ) {
      [
        formHome.predictedGoalsConceededBasedOnHomeAv,
        formHome.predictedGoalsConceededBasedOnAwayAv,
        formHome.allTeamGoalsConceededBasedOnAverages,
        formHome.averageOddsHome,
        formHome.averageOddsAway,
        formHome.averageScoredLeague,
        formHome.averageConceededLeague,
        formHome.last10btts,
        formHome.last10bttsHome,
        formHome.last10bttsAway,
        match.bttsAllPercentageHome,
        match.bttsPercentageHomeHome,
        match.bttsPercentageHomeAway,
        // formHome.forAndAgainstRollingAvHomeOrAway,
        // formHome.forAndAgainstRollingAv,
      ] = await getPastLeagueResults(match.homeTeam, match, "home", formHome);

      [
        formAway.predictedGoalsConceededBasedOnHomeAv,
        formAway.predictedGoalsConceededBasedOnAwayAv,
        formAway.allTeamGoalsConceededBasedOnAverages,
        formAway.averageOddsHome,
        formAway.averageOddsAway,
        formAway.averageScoredLeague,
        formAway.averageConceededLeague,
        formAway.last10btts,
        formAway.last10bttsHome,
        formAway.last10bttsAway,
        match.bttsAllPercentageAway,
        match.bttsPercentageAwayHome,
        match.bttsPercentageAwayAway,
        // formAway.forAndAgainstRollingAvHomeOrAway,
        // formAway.forAndAgainstRollingAv,
      ] = await getPastLeagueResults(match.awayTeam, match, "away", formAway);
    } else {
      formHome.completeData = false;
      // formHome.forAndAgainstRollingAv = {
      //   goalsFor: formHome.ScoredAverage,
      //   goalsAgainst: formHome.ConcededAverage,
      // };
      // formHome.forAndAgainstRollingAvHomeOrAway = {
      //   goalsFor: formHome.ScoredAverage,
      //   goalsAgainst: formHome.ConcededAverage,
      // };
      formHome.predictedGoalsConceededBasedOnHomeAv = formHome.ConcededAverage;
      formHome.predictedGoalsConceededBasedOnAwayAv = formHome.ConcededAverage;
      formHome.allTeamGoalsConceededBasedOnAverages = formHome.ConcededAverage;
      formHome.averageOddsHome = null;
      formHome.averageOddsAway = null;
      formHome.averageScoredLeague = null;
      formHome.averageConceededLeague = null;
      formHome.goalDifference =
        formHome.ScoredOverall - formHome.ConcededOverall;
      formHome.goalDifferenceHomeOrAway =
        formHome.ScoredOverall - formHome.ConcededOverall;
      formHome.last10btts = null;
      formHome.last10bttsHome = null;
      formHome.last10bttsAway = null;
      formHome.allTeamResults = [];
      formHome.resultsAll = [];
      formHome.resultsHome = [];
      formHome.resultsAway = [];
      match.bttsAllPercentageHome = "";
      match.bttsPercentageHomeHome = "";
      match.bttsPercentageHomeAway = "";
      formAway.completeData = false;
      // formAway.forAndAgainstRollingAv = {
      //   goalsFor: formAway.ScoredAverage,
      //   goalsAgainst: formAway.ConcededAverage,
      // };
      // formAway.forAndAgainstRollingAvHomeOrAway = {
      //   goalsFor: formAway.ScoredAverage,
      //   goalsAgainst: formAway.ConcededAverage,
      // };
      formAway.predictedGoalsConceededBasedOnHomeAv = formAway.ConcededAverage;
      formAway.predictedGoalsConceededBasedOnAwayAv = formAway.ConcededAverage;
      formAway.allTeamGoalsConceededBasedOnAverages = formAway.ConcededAverage;
      formAway.averageOddsHome = null;
      formAway.averageOddsAway = null;
      formAway.averageScoredLeague = null;
      formAway.averageConceededLeague = null;
      formAway.goalDifference =
        formAway.ScoredOverall - formAway.ConcededOverall;
      formAway.goalDifferenceHomeOrAway =
        formAway.ScoredOverall - formAway.ConcededOverall;

      formAway.last10btts = null;
      formAway.last10bttsHome = null;
      formAway.last10bttsAway = null;
      formAway.allTeamResults = [];
      formAway.resultsAll = [];
      formAway.resultsHome = [];
      formAway.resultsAway = [];
      match.bttsAllPercentageAway = "";
      match.bttsPercentageAwayHome = "";
      match.bttsPercentageAwayAway = "";
    }

    match.directnessRatingHome = formHome.directnessRatingHome;
    match.directnessRatingAway = formAway.directnessRatingAway;

    if (
      typeof formHome.homeTeamHomePositionRaw === "number" &&
      typeof formAway.awayTeamAwayPositionRaw === "number"
    ) {
      formHome.homePositionHomeOnly = parseFloat(
        formHome.homeTeamHomePositionRaw
      );
      formAway.awayPositionAwayOnly = parseFloat(
        formAway.awayTeamAwayPositionRaw
      );
      formHome.homePosition = parseFloat(formHome.homeRawPosition);
      formAway.awayPosition = parseFloat(formAway.awayRawPosition);
    } else {
      formHome.homePositionHomeOnly = "N/A";
      formAway.awayPositionAwayOnly = "N/A";
      formHome.homePosition = "N/A";
      formAway.awayPosition = "N/A";
    }

    if (formHome.last10Goals && formAway.last10Goals !== 0) {
      if (
        formHome.last5Goals - formHome.last5GoalsConceeded >
        formHome.last10Goals - formHome.last10GoalsConceeded
      ) {
        formHome.improving = true;
      } else {
        formHome.improving = false;
      }

      if (
        formAway.last5Goals - formAway.last5GoalsConceeded >
        formAway.last10Goals - formAway.last10GoalsConceeded
      ) {
        formAway.improving = true;
      } else {
        formAway.improving = false;
      }
    }

    let pointsDiff6 = await getPointsDifferential(
      formHome.avPoints6,
      formAway.avPoints6
    );

    formHome.AttackingPotency = (formHome.XG / formHome.AttacksHome) * 100;
    formAway.AttackingPotency = (formAway.XG / formAway.AttacksAverage) * 100;

    formHome.lastGame = formHome.resultsAll[0];
    formHome.previousToLastGame = formHome.resultsAll[1];

    formAway.lastGame = formAway.resultsAll[0];
    formAway.previousToLastGame = formAway.resultsAll[1];

    let teamComparisonScore;

    const attackingMetricsHome = {
      "Average Dangerous Attacks": formHome.AverageDangerousAttacksOverall,
      "Average Shots": formHome.avgShots
        ? formHome.avgShots.toFixed(2)
        : formHome.avgShots,
      "Average Shot Value": formHome.avgShotValueChart,
      "Average Shots On Target": formHome.AverageShotsOnTargetOverall
        ? formHome.AverageShotsOnTargetOverall
        : formHome.AverageShotsOnTarget,
      "Average Expected Goals": formHome.XGOverall
        ? formHome.XGOverall
        : formHome.expectedGoals,
      "Recent XG": formHome.XGlast5 ? formHome.XGlast5 : formHome.XGOverall,
      "Average Goals": formHome.avgScored
        ? formHome.avgScored
        : formHome.ScoredAverage,
      Corners: formHome.AverageCorners
        ? formHome.AverageCorners
        : formHome.CornersAverage,
    };

    const attackingMetricsHomeLast5 = {
      "Average Dangerous Attacks": formHome.avDALast5
        ? formHome.avDALast5
        : formHome.AverageDangerousAttacksOverall,
      "Average Shots": formHome.avShotsLast5
        ? formHome.avShotsLast5
        : formHome.AverageShots,
      "Average Shot Value": formHome.avgShotValueLast5Chart,
      "Average Shots On Target": formHome.avSOTLast5
        ? formHome.avSOTLast5
        : formHome.AverageShotsOnTarget,
      "Average Expected Goals": formHome.XGlast5
        ? formHome.XGlast5
        : formHome.XGOverall,
      "Recent XG": formHome.XGlast5 ? formHome.XGlast5 : formHome.XGOverall,
      "Average Goals": formHome.avScoredLast5
        ? formHome.avScoredLast5
        : formHome.ScoredAverage,
      Corners: formHome.avCornersLast5
        ? formHome.avCornersLast5
        : formHome.CornersAverage,
    };

    const attackingMetricsHomeOnly = {
      "Average Dangerous Attacks": formHome.avgDangerousAttacksHome
        ? formHome.avgDangerousAttacksHome
        : formHome.AverageDangerousAttacksOverall,
      "Average Shots": formHome.avgShotsHome
        ? formHome.avgShotsHome
        : formHome.AverageShots,
      "Average Shot Value": formHome.avgShotValueHomeChart,
      "Average Shots On Target": formHome.avgShotsOnTargetHome
        ? formHome.avgShotsOnTargetHome
        : formHome.AverageShotsOnTarget,
      "Average Expected Goals": formHome.avgXGScoredHome
        ? formHome.avgXGScoredHome
        : formHome.XGOverall,
      "Recent XG": formHome.last5XGAvgForHome
        ? formHome.last5XGAvgForHome
        : formHome.XGOverall,
      "Average Goals": formHome.avgScoredHome
        ? formHome.avgScoredHome
        : formHome.ScoredAverage,
      Corners: formHome.cornersAvHome
        ? formHome.cornersAvHome
        : formHome.CornersAverage,
    };

    const attackingMetricsAwayOnly = {
      "Average Dangerous Attacks": formAway.avgDangerousAttacksAway
        ? formAway.avgDangerousAttacksAway
        : formAway.AverageDangerousAttacksOverall,
      "Average Shots": formAway.avgShotsAway
        ? formAway.avgShotsAway
        : formAway.AverageShots,
      "Average Shot Value": formAway.avgShotValueAwayChart,
      "Average Shots On Target": formAway.avgShotsOnTargetAway
        ? formAway.avgShotsOnTargetAway
        : formAway.AverageShotsOnTarget,
      "Average Expected Goals": formAway.avgXGScoredAway
        ? formAway.avgXGScoredAway
        : formAway.XGOverall,
      "Recent XG": formAway.last5XGAvgForAway
        ? formAway.last5XGAvgForAway
        : formAway.XGOverall,
      "Average Goals": formAway.avgScoredAway
        ? formAway.avgScoredAway
        : formAway.ScoredAverage,
      Corners: formAway.cornersAvAway
        ? formAway.cornersAvAway
        : formAway.CornersAverage,
    };

    const attackingMetricsAway = {
      "Average Dangerous Attacks": formAway.AverageDangerousAttacksOverall,
      "Average Shots": formAway.avgShots
        ? formAway.avgShots.toFixed(2)
        : formAway.avgShots,
      "Average Shot Value": formAway.avgShotValueChart,
      "Average Shots On Target": formAway.AverageShotsOnTargetOverall
        ? formAway.AverageShotsOnTargetOverall
        : formAway.AverageShotsOnTarget,
      "Average Expected Goals": formAway.XGOverall
        ? formAway.XGOverall
        : formAway.expectedGoals,
      "Recent XG": formAway.XGlast5 ? formAway.XGlast5 : formAway.XGOverall,
      "Average Goals": formAway.avgScored
        ? formAway.avgScored
        : formAway.ScoredAverage,
      Corners: formAway.AverageCorners
        ? formAway.AverageCorners
        : formAway.CornersAverage,
    };

    const attackingMetricsAwayLast5 = {
      "Average Dangerous Attacks": formAway.avDALast5
        ? formAway.avDALast5
        : formAway.AverageDangerousAttacksOverall,
      "Average Shots": formAway.avShotsLast5
        ? formAway.avShotsLast5
        : formAway.AverageShots,
      "Average Shot Value": formAway.avgShotValueLast5Chart,
      "Average Shots On Target": formAway.avSOTLast5
        ? formAway.avSOTLast5
        : formAway.AverageShotsOnTarget,
      "Average Expected Goals": formAway.XGlast5
        ? formAway.XGlast5
        : formAway.XGOverall,
      "Recent XG": formAway.XGlast5 ? formAway.XGlast5 : formAway.XGOverall,
      "Average Goals": formAway.avScoredLast5
        ? formAway.avScoredLast5
        : formAway.ScoredAverage,
      Corners: formAway.avCornersLast5
        ? formAway.avCornersLast5
        : formAway.CornersAverage,
    };

    const defensiveMetricsHome = {
      "Average XG Against": formHome.XGAgainstAvgOverall
        ? formHome.XGAgainstAvgOverall
        : formHome.XGAgainstAvgOverall,
      "Recent XG Against": formHome.XGAgainstlast5
        ? formHome.XGAgainstlast5
        : formHome.XGAgainstAvgOverall,
      "Average Goals Against": formHome.avgConceeded
        ? formHome.avgConceeded
        : formHome.ConcededAverage,
      "Average SOT Against": formHome.AverageShotsOnTargetAgainstOverall
        ? formHome.AverageShotsOnTargetAgainstOverall
        : 5,
    };

    const defensiveMetricsHomeLast5 = {
      "Average XG Against": formHome.XGAgainstlast5
        ? formHome.XGAgainstlast5
        : formHome.XGAgainstAvgOverall,
      "Recent XG Against": formHome.avXGAgainstLast5
        ? formHome.avXGAgainstLast5
        : formHome.XGAgainstAvgOverall,
      "Average Goals Against": formHome.avConceededLast5
        ? formHome.avConceededLast5
        : formHome.ConcededAverage,
      "Average SOT Against": formHome.avSOTAgainstLast5
        ? formHome.avSOTAgainstLast5
        : 5,
    };

    const defensiveMetricsAway = {
      "Average XG Against": formAway.XGAgainstAvgOverall
        ? formAway.XGAgainstAvgOverall
        : formAway.XGAgainstAvgOverall,
      "Recent XG Against": formAway.XGAgainstlast5
        ? formAway.XGAgainstlast5
        : formAway.XGAgainstAvgOverall,
      "Average Goals Against": formAway.avgConceeded
        ? formAway.avgConceeded
        : formAway.ConcededAverage,
      "Average SOT Against": formAway.AverageShotsOnTargetAgainstOverall
        ? formAway.AverageShotsOnTargetAgainstOverall
        : 5,
    };

    const defensiveMetricsAwayLast5 = {
      "Average XG Against": formAway.XGAgainstlast5
        ? formAway.XGAgainstlast5
        : formAway.XGAgainstAvgOverall,
      "Recent XG Against": formAway.avXGAgainstLast5
        ? formAway.avXGAgainstLast5
        : formAway.XGAgainstAvgOverall,
      "Average Goals Against": formAway.avConceededLast5
        ? formAway.avConceededLast5
        : formAway.ConcededAverage,
      "Average SOT Against": formAway.avSOTAgainstLast5
        ? formAway.avSOTAgainstLast5
        : 5,
    };

    const defensiveMetricsHomeOnly = {
      "Average XG Against": formHome.avgXGConceededHome
        ? formHome.avgXGConceededHome
        : formHome.XGAgainstAvgOverall,
      "Recent XG Against": formHome.last5XGAvgAgainstHome
        ? formHome.last5XGAvgAgainstHome
        : formHome.XGAgainstAvgOverall,
      "Average Goals Against": formHome.teamConceededAvgHomeOnly
        ? formHome.teamConceededAvgHomeOnly
        : formHome.ConcededAverage,
      "Average SOT Against": formHome.avgShotsOnTargetAgainstHome
        ? formHome.avgShotsOnTargetAgainstHome
        : 5,
    };

    const defensiveMetricsAwayOnly = {
      "Average XG Against": formAway.avgXGConceededAway
        ? formAway.avgXGConceededAway
        : formAway.XGAgainstAvgOverall,
      "Recent XG Against": formAway.last5XGAvgAgainstAway
        ? formAway.last5XGAvgAgainstAway
        : formAway.XGAgainstAvgOverall,
      "Average Goals Against": formAway.teamConceededAvgAwayOnly
        ? formAway.teamConceededAvgAwayOnly
        : formAway.ConcededAverage,
      "Average SOT Against": formAway.avgShotsOnTargetAgainstAway
        ? formAway.avgShotsOnTargetAgainstAway
        : 5,
    };

    formHome.attackingMetrics = attackingMetricsHome;
    formHome.defensiveMetrics = defensiveMetricsHome;
    formHome.attackingMetricsHomeLast5 = attackingMetricsHomeLast5;
    formHome.defensiveMetricsHomeLast5 = defensiveMetricsHomeLast5;
    formHome.attackingMetricsHomeOnly = attackingMetricsHomeOnly;
    formHome.defensiveMetricsHomeOnly = defensiveMetricsHomeOnly;

    formAway.attackingMetrics = attackingMetricsAway;
    formAway.defensiveMetrics = defensiveMetricsAway;
    formAway.attackingMetricsAwayLast5 = attackingMetricsAwayLast5;
    formAway.defensiveMetricsAwayLast5 = defensiveMetricsAwayLast5;
    formAway.attackingMetricsAwayOnly = attackingMetricsAwayOnly;
    formAway.defensiveMetricsAwayOnly = defensiveMetricsAwayOnly;

    formHome.attackingStrength = await calculateAttackingStrength(
      attackingMetricsHome
    );

    formHome.attackingStrengthScoreGeneration =
      await calculateAttackingStrength(attackingMetricsHome);

    formHome.attackingStrengthLast5 = await calculateAttackingStrength(
      attackingMetricsHomeLast5
    );

    formHome.attackingStrengthHomeOnly = await calculateAttackingStrength(
      attackingMetricsHomeOnly
    );

    formAway.attackingStrength = await calculateAttackingStrength(
      attackingMetricsAway
    );

    formAway.attackingStrengthLast5 = await calculateAttackingStrength(
      attackingMetricsAwayLast5
    );

    formAway.attackingStrengthAwayOnly = await calculateAttackingStrength(
      attackingMetricsAwayOnly
    );

    formHome.defensiveStrength = await calculateDefensiveStrength(
      defensiveMetricsHome
    );

    formHome.defensiveStrengthScoreGeneration =
      await calculateDefensiveStrength(defensiveMetricsHome, 0.85);

    formHome.defensiveStrengthLast5 = await calculateDefensiveStrength(
      defensiveMetricsHomeLast5
    );

    formHome.defensiveStrengthScoreGenerationLast5 =
      await calculateDefensiveStrength(defensiveMetricsHomeLast5, 0.85);

    formHome.defensiveStrengthHomeOnly = await calculateDefensiveStrength(
      defensiveMetricsHomeOnly
    );

    formHome.defensiveStrengthScoreGenerationHomeOnly =
      await calculateDefensiveStrength(defensiveMetricsHomeOnly, 0.85);

    formAway.defensiveStrength = await calculateDefensiveStrength(
      defensiveMetricsAway
    );

    formAway.defensiveStrengthScoreGeneration =
      await calculateDefensiveStrength(defensiveMetricsAway, 0.85);

    formAway.defensiveStrengthLast5 = await calculateDefensiveStrength(
      defensiveMetricsAwayLast5
    );

    formAway.defensiveStrengthScoreGenerationLast5 =
      await calculateDefensiveStrength(defensiveMetricsAwayLast5, 0.85);

    formAway.defensiveStrengthAwayOnly = await calculateDefensiveStrength(
      defensiveMetricsAwayOnly
    );

    formAway.defensiveStrengthScoreGenerationAwayOnly =
      await calculateDefensiveStrength(defensiveMetricsAwayOnly, 0.85);

    formHome.possessionStrength = await calculateMetricStrength(
      "averagePossession",
      formHome.AveragePossessionOverall
        ? formHome.AveragePossessionOverall
        : formHome.AveragePossessionOverall
    );

    formHome.possessionStrengthLast5 = await calculateMetricStrength(
      "averagePossession",
      formHome.avPosessionLast5
        ? formHome.avPosessionLast5
        : formHome.AveragePossessionOverall
    );

    formHome.possessionStrengthHomeOnly = await calculateMetricStrength(
      "averagePossession",
      formHome.avgPossessionHome
        ? formHome.avgPossessionHome
        : formHome.AveragePossessionOverall
    );

    formAway.possessionStrengthLast5 = await calculateMetricStrength(
      "averagePossession",
      formAway.avPosessionLast5
        ? formAway.avPosessionLast5
        : formAway.AveragePossessionOverall
    );

    formAway.possessionStrength = await calculateMetricStrength(
      "averagePossession",
      formAway.AveragePossessionOverall
        ? formAway.AveragePossessionOverall
        : formAway.AveragePossessionOverall
    );

    formAway.possessionStrengthAwayOnly = await calculateMetricStrength(
      "averagePossession",
      formAway.avgPossessionAway
        ? formAway.avgPossessionAway
        : formAway.AveragePossessionOverall
    );

    formHome.XGdifferentialRecent = await diff(
      formHome.XGlast5,
      formHome.XGAgainstlast5
    );

    formHome.actualToXGDifferenceRecent = await diff(
      formHome.XGdifferentialRecent,
      formHome.last5GoalDiff
    );

    formAway.XGdifferentialRecent = await diff(
      formAway.XGlast5,
      formAway.XGAgainstlast5
    );

    formAway.actualToXGDifferenceRecent = await diff(
      formAway.XGdifferentialRecent,
      formAway.last5GoalDiff
    );

    formHome.directnessOverall =
      (formHome.AverageShots / formHome.AveragePossessionOverall) * 10;

    formHome.directnessOverallLast5 =
      (formHome.avShotsLast5 / formHome.avPosessionLast5) * 10;

    formAway.directnessOverallLast5 =
      (formAway.avShotsLast5 / formAway.avPosessionLast5) * 10;

    formHome.directnessHomeOnly =
      (formHome.avgShotsHome / formHome.avgPossessionHome) * 10;

    formAway.directnessOverall =
      (formAway.AverageShots / formAway.AveragePossessionOverall) * 10;

    formAway.directnessAwayOnly =
      (formAway.avgShotsAway / formAway.avgPossessionAway) * 10;

    formHome.directnessOverallStrength = await calculateMetricStrength(
      "directnessOverall",
      formHome.directnessOverall
    );

    formHome.directnessOverallStrengthLast5 = await calculateMetricStrength(
      "directnessOverall",
      formHome.directnessOverallLast5
    );

    formHome.directnessHomeStrength = await calculateMetricStrength(
      "directnessOverall",
      formHome.directnessHomeOnly
    );

    formAway.directnessOverallStrength = await calculateMetricStrength(
      "directnessOverall",
      formAway.directnessOverall
    );

    formAway.directnessOverallStrengthLast5 = await calculateMetricStrength(
      "directnessOverall",
      formAway.directnessOverallLast5
    );

    formAway.directnessAwayStrength = await calculateMetricStrength(
      "directnessOverall",
      formAway.directnessAwayOnly
    );

    formHome.shootingAccuracy =
      (formHome.AverageShotsOnTargetOverall
        ? formHome.AverageShotsOnTargetOverall / formHome.avgShots
        : formHome.AverageShotsOnTarget / formHome.avgShots) *
      formHome.AverageShotsOnTargetOverall
        ? formHome.AverageShotsOnTargetOverall
        : formHome.AverageShotsOnTarget;

    formHome.shootingAccuracyLast5 =
      (formHome.avSOTLast5 / formHome.avShotsLast5) * formHome.avSOTLast5;

    formAway.shootingAccuracyLast5 =
      (formAway.avSOTLast5 / formAway.avShotsLast5) * formAway.avSOTLast5;

    formHome.shootingAccuracyHomeOnly =
      (formHome.avgShotsOnTargetHome / formHome.avgShotsHome) *
      formHome.avgShotsOnTargetHome;

    formAway.shootingAccuracy =
      (formAway.AverageShotsOnTargetOverall
        ? formAway.AverageShotsOnTargetOverall / formAway.avgShots
        : formAway.AverageShotsOnTarget / formAway.avgShots) *
      formAway.AverageShotsOnTargetOverall
        ? formAway.AverageShotsOnTargetOverall
        : formAway.AverageShotsOnTarget;

    formAway.shootingAccuracyAwayOnly =
      (formAway.avgShotsOnTargetAway / formAway.avgShotsAway) *
      formAway.avgShotsOnTargetAway;

    formHome.accuracyOverallStrength = await calculateMetricStrength(
      "accuracyOverall",
      formHome.avgShotValue
    );

    formHome.accuracyOverallStrengthLast5 = await calculateMetricStrength(
      "accuracyOverall",
      formHome.avgShotValueLast5
    );

    formHome.accuracyHomeStrength = await calculateMetricStrength(
      "accuracyOverall",
      formHome.avgShotValueHome
    );

    formAway.accuracyOverallStrength = await calculateMetricStrength(
      "accuracyOverall",
      formAway.avgShotValue
    );

    formAway.accuracyOverallStrengthLast5 = await calculateMetricStrength(
      "accuracyOverall",
      formAway.avgShotValueLast5
    );

    formAway.accuracyAwayStrength = await calculateMetricStrength(
      "accuracyOverall",
      formAway.avgShotValueAway
    );

    formHome.xgForStrength = await calculateMetricStrength(
      "xgFor",
      formHome.XGOverall
    );

    formHome.xgForStrengthLast5 = await calculateMetricStrength(
      "xgFor",
      formHome.XGlast5
    );

    formHome.xgForStrengthHomeOnly = await calculateMetricStrength(
      "xgFor",
      formHome.avgXGScoredHome
    );

    formHome.xgAgainstStrength = await calculateMetricStrength(
      "xgAgainst",
      3 - formHome.XGAgainstAvgOverall
    );

    formHome.xgAgainstStrengthLast5 = await calculateMetricStrength(
      "xgAgainst",
      3 - formHome.XGAgainstlast5
    );

    formHome.xgAgainstStrengthHomeOnly = await calculateMetricStrength(
      "xgAgainst",
      3 - formHome.avgXGConceededHome
    );

    formAway.xgForStrength = await calculateMetricStrength(
      "xgFor",
      formAway.XGOverall
    );

    formAway.xgForStrengthLast5 = await calculateMetricStrength(
      "xgFor",
      formAway.last5XGAvgFor
    );

    formAway.xgForStrengthLast5 = await calculateMetricStrength(
      "xgFor",
      formAway.XGlast5
    );

    formAway.xgForStrengthAwayOnly = await calculateMetricStrength(
      "xgFor",
      formAway.avgXGScoredAway
    );

    formAway.xgAgainstStrength = await calculateMetricStrength(
      "xgAgainst",
      3 - formAway.XGAgainstAvgOverall
    );

    formAway.xgAgainstStrengthLast5 = await calculateMetricStrength(
      "xgAgainst",
      3 - formAway.XGAgainstlast5
    );

    formAway.xgAgainstStrengthAwayOnly = await calculateMetricStrength(
      "xgAgainst",
      3 - formAway.avgXGConceededAway
    );

    formHome.styleOfPlayOverall = await calculatePlayingStyle(
      formHome.directnessRating,
      formHome.AveragePossessionOverall
    );
    formHome.styleOfPlayHome = await calculatePlayingStyle(
      formHome.directnessRatingHome,
      formHome.avgPossessionHome
    );

    formAway.styleOfPlayOverall = await calculatePlayingStyle(
      formAway.directnessRating,
      formAway.AveragePossessionOverall
    );
    formAway.styleOfPlayAway = await calculatePlayingStyle(
      formAway.directnessRatingAway,
      formAway.avgPossessionAway
    );

    formHome.actualToXGDifference = parseInt(
      await diff(formHome.XGDiffNonAverage, formHome.goalDifference)
    );

    formAway.actualToXGDifference = parseInt(
      await diff(formAway.XGDiffNonAverage, formAway.goalDifference)
    );

    [formHome.teamGoalsCalc, formAway.teamGoalsCalc] = await generateGoals(
      formHome,
      formAway,
      match
    );

    let finalHomeGoals;
    let finalAwayGoals;

    const homeGoalDiff =
      formHome.ScoredAverageShortAndLongTerm -
      formHome.conceededAverageShortAndLongTerm;
    const awayGoalDiff =
      formAway.ScoredAverageShortAndLongTerm -
      formAway.conceededAverageShortAndLongTerm;

    formHome.goalsDifferential =
      parseFloat(await diff(homeGoalDiff, awayGoalDiff)) / 1;
    formAway.goalsDifferential =
      parseFloat(await diff(awayGoalDiff, homeGoalDiff)) / 1;

    formHome.rollingAverageGoalsDifferential = parseFloat(
      formHome.allTeamGoalsBasedOnAverages -
        formHome.allTeamGoalsConceededBasedOnAverages
    );
    formAway.rollingAverageGoalsDifferential = parseFloat(
      formAway.allTeamGoalsBasedOnAverages -
        formAway.allTeamGoalsConceededBasedOnAverages
    );

    match.GoalsInGamesAverageHome =
      formHome.avScoredLast5 + formHome.avConceededLast5;

    match.GoalsInGamesAverageAway =
      formAway.avScoredLast5 + formAway.avConceededLast5;

    let homeComparisonWeighting;
    let awayComparisonWeighting;

    if (teamComparisonScore > 0) {
      homeComparisonWeighting = 1 + Math.abs(teamComparisonScore);
      awayComparisonWeighting = 1 + -Math.abs(teamComparisonScore);
    } else if (teamComparisonScore < 0) {
      homeComparisonWeighting = 1 + -Math.abs(teamComparisonScore);
      awayComparisonWeighting = 1 + Math.abs(teamComparisonScore);
    } else {
      homeComparisonWeighting = 1;
      awayComparisonWeighting = 1;
    }

    let experimentalHomeGoals = formHome.teamGoalsCalc;
    let experimentalAwayGoals = formAway.teamGoalsCalc;
    let rawFinalHomeGoals = experimentalHomeGoals;
    let rawFinalAwayGoals = experimentalAwayGoals;

    // if(rawFinalHomeGoals < 0){
    //   rawFinalHomeGoals = 0
    // }

    // if(rawFinalAwayGoals < 0){
    //   rawFinalAwayGoals = 0
    // }

    match.rawFinalHomeGoals = rawFinalHomeGoals;
    match.rawFinalAwayGoals = rawFinalAwayGoals;

    if (
      formHome.CleanSheetPercentage > 30 &&
      formAway.CleanSheetPercentage > 30
    ) {
      finalHomeGoals = rawFinalHomeGoals - Math.abs(1);
      finalAwayGoals = rawFinalAwayGoals - Math.abs(1);
    }

    if (rawFinalHomeGoals < 0) {
      rawFinalHomeGoals = 0.01;
    }

    if (rawFinalAwayGoals < 0) {
      rawFinalAwayGoals = 0.01;
    }

    // if(rawFinalHomeGoals > formHome.avgScored && rawFinalAwayGoals > formAway.avgScored){
    //   rawFinalHomeGoals -= Math.abs(-1)
    //   rawFinalAwayGoals -= Math.abs(-1)
    // }

    finalHomeGoals = Math.floor(rawFinalHomeGoals);
    finalAwayGoals = Math.floor(rawFinalAwayGoals);

    if (match.status !== "suspended") {
      if (finalHomeGoals > finalAwayGoals) {
        match.prediction = "homeWin";
        homePredictions = homePredictions + 1;
        if (
          formHome.lastGame === "L" ||
          formHome.last2Points < 3 ||
          formAway.last2Points > 4 ||
          formHome.oddsReliabilityWin < 50
        ) {
          match.includeInMultis = false;
        } else {
          match.includeInMultis = true;
        }
      } else if (finalAwayGoals > finalHomeGoals) {
        match.prediction = "awayWin";
        awayPredictions = awayPredictions + 1;
        if (
          formAway.lastGame === "L" ||
          formAway.last2Points < 3 ||
          formHome.last2Points > 4 ||
          formAway.oddsReliabilityWin < 50
        ) {
          match.includeInMultis = false;
        } else {
          match.includeInMultis = true;
        }
      } else if (finalHomeGoals === finalAwayGoals) {
        match.prediction = "draw";
        drawPredictions = drawPredictions + 1;
      }
    }

    console.log(`drawPredictions: ${drawPredictions}`);

    if (
      (XGdifferential > 1 && match.prediction === "homeWin") ||
      (XGdifferential < -1.6 && match.prediction === "awayWin")
    ) {
      match.XGdifferential = true;
    } else {
      match.XGdifferential = false;
    }

    if (
      (pointsDiff6 > 1.2 && match.prediction === "homeWin") ||
      (pointsDiff6 < -1.2 && match.prediction === "awayWin")
    ) {
      match.pointsDifferential = true;
      match.pointsDifferentialValue = Math.abs(pointsDiff6);
      match.pointsDifferentialValueRaw = parseFloat(pointsDiff6);
    } else {
      match.pointsDifferential = false;
      match.pointsDifferentialValue = Math.abs(pointsDiff6);
      match.pointsDifferentialValueRaw = parseFloat(pointsDiff6);
    }

    let rollingGoalDiffDifferential = await diff(
      formHome.rollingAverageGoalsDifferential,
      formAway.rollingAverageGoalsDifferential
    );

    if (
      (rollingGoalDiffDifferential > 1.5 && match.prediction === "homeWin") ||
      (rollingGoalDiffDifferential < -1.5 && match.prediction === "awayWin")
    ) {
      match.rollingGoalDiff = true;
      match.rollingGoalDiffValue = rollingGoalDiffDifferential;
    } else {
      match.rollingGoalDiff = false;
      match.rollingGoalDiffValue = rollingGoalDiffDifferential;
    }

    let dangerousAttacksDifferential = await diff(
      formHome.AverageDangerousAttacksOverall,
      formAway.AverageDangerousAttacksOverall
    );

    if (
      (dangerousAttacksDifferential > 20 && match.prediction === "homeWin") ||
      (dangerousAttacksDifferential < -20 && match.prediction === "awayWin")
    ) {
      match.dangerousAttacksDiff = true;
      match.dangerousAttacksDiffValue = dangerousAttacksDifferential;
    } else {
      match.dangerousAttacksDiff = false;
      match.dangerousAttacksDiffValue = dangerousAttacksDifferential;
    }

    switch (true) {
      case match.status !== "complete":
        break;
      case match.homeGoals > match.awayGoals:
        match.winner = match.homeTeam;
        match.outcome = "homeWin";
        homeOutcomes = homeOutcomes + 1;
        allWinOutcomes = allWinOutcomes + 1;
        allLossOutcomes = allLossOutcomes + 1;
        sumStatDAWin = sumStatDAWin += formHome.AverageDangerousAttacksOverall;
        sumStatDALoss = sumStatDALoss +=
          formAway.AverageDangerousAttacksOverall;
        sumStatPossessionWin = sumStatPossessionWin +=
          formHome.AveragePossessionOverall;
        sumStatPossessionLoss = sumStatPossessionLoss +=
          formAway.AveragePossessionOverall;
        sumStatPPGLast10Win = sumStatPPGLast10Win += formHome.last10Points / 10;
        sumStatPPGLast10Loss = sumStatPPGLast10Loss +=
          formAway.last10Points / 10;
        sumStatSOTWin = sumStatSOTWin += formHome.AverageShotsOnTargetOverall;
        sumStatSOTLoss = sumStatSOTLoss += formAway.AverageShotsOnTargetOverall;
        sumOddsWin = sumOddsWin += homeOdds;
        sumOddsLoss = sumOddsLoss += awayOdds;
        sumXGForWin = sumXGForWin += formHome.XGOverall;
        sumXGForLoss = sumXGForLoss += formAway.XGOverall;
        sumXGAgainstWin = sumXGAgainstWin += formHome.XGAgainstAvgOverall;
        sumXGAgainstLoss = sumXGAgainstLoss += formAway.XGAgainstAvgOverall;
        break;
      case match.homeGoals === match.awayGoals:
        match.winner = "draw";
        match.outcome = "draw";
        allOutcomes = allOutcomes + 1;
        allDrawOutcomes = allDrawOutcomes + 1;
        break;
      case match.homeGoals < match.awayGoals:
        match.winner = match.awayTeam;
        match.outcome = "awayWin";
        allOutcomes = allOutcomes + 1;
        awayOutcomes = awayOutcomes + 1;
        allWinOutcomes = allWinOutcomes + 1;
        allLossOutcomes = allLossOutcomes + 1;
        sumStatDAWin = sumStatDAWin += formAway.AverageDangerousAttacksOverall;
        sumStatDALoss = sumStatDALoss +=
          formHome.AverageDangerousAttacksOverall;
        sumStatPossessionWin = sumStatPossessionWin +=
          formAway.AveragePossessionOverall;
        sumStatPossessionLoss = sumStatPossessionLoss +=
          formHome.AveragePossessionOverall;
        sumStatPPGLast10Win = sumStatPPGLast10Win += formAway.last10Points / 10;
        sumStatPPGLast10Loss = sumStatPPGLast10Loss +=
          formHome.last10Points / 10;
        sumStatSOTWin = sumStatSOTWin += formAway.AverageShotsOnTargetOverall;
        sumStatSOTLoss = sumStatSOTLoss += formHome.AverageShotsOnTargetOverall;
        sumOddsWin = sumOddsWin += awayOdds;
        sumOddsLoss = sumOddsLoss += homeOdds;
        sumXGForWin = sumXGForWin += formAway.XGOverall;
        sumXGForLoss = sumXGForLoss += formHome.XGOverall;
        sumXGAgainstWin = sumXGAgainstWin += formAway.XGAgainstAvgOverall;
        sumXGAgainstLoss = sumXGAgainstLoss += formHome.XGAgainstAvgOverall;
        break;
      default:
        break;
    }

    console.log(`allDrawOutcomes: ${allDrawOutcomes}`);

    if (match.status === "complete") {
      if (match.prediction === match.outcome) {
        match.predictionOutcome = "Won";
        winAmount = winAmount + 1;
        if (match.outcome === "draw") {
        }
      } else if (match.prediction !== match.outcome) {
        match.predictionOutcome = "Lost";
        lossAmount = lossAmount + 1;
        if (match.outcome === "draw") {
        }
      }
    }

    if (match.status === "complete") {
      if (match.homeGoals + match.awayGoals > 2) {
        match.over25PredictionOutcome = "Won";
      } else {
        match.over25PredictionOutcome = "Lost";
      }
    }

    if (
      match.status === "complete" &&
      match.homeGoals > 0 &&
      match.awayGoals > 0
    ) {
      match.bttsOutcome = "bttsWon";
    } else {
      match.bttsOutcome = "bttsLost";
    }

    match.formHome = formHome;
    match.formAway = formAway;

    let total = parseInt(finalHomeGoals + finalAwayGoals);
    totalGoals = totalGoals + total;

    let total2 = parseInt(match.homeGoals + match.awayGoals);
    totalGoals2 = totalGoals2 + total2;

    numberOfGames = numberOfGames + 1;

    if (finalHomeGoals < 0) {
      finalHomeGoals = 0;
    }

    if (finalAwayGoals < 0) {
      finalAwayGoals = 0;
    }

    if (match.status === "suspended") {
      finalHomeGoals = "P";
      finalAwayGoals = "P";
    }

    if (
      finalHomeGoals > finalAwayGoals &&
      match.homeOdds !== 0 &&
      (match.homeOdds < rangeValue[0] || match.homeOdds > rangeValue[1])
    ) {
      match.omit = true;
    } else if (
      finalAwayGoals > finalHomeGoals &&
      match.homeOdds !== 0 &&
      (match.awayOdds < rangeValue[0] || match.awayOdds > rangeValue[1])
    ) {
      match.omit = true;
    } else if (
      finalHomeGoals === finalAwayGoals &&
      match.homeOdds !== 0 &&
      (match.drawOdds < rangeValue[0] || match.drawOdds > rangeValue[1])
    ) {
      match.omit = true;
    }

    const last10PointDiffHomePerspective = Math.abs(
      formHome.pointsSum6 - formAway.pointsSum6
    );

    const last6PointDiffAwayPerspective = Math.abs(
      formAway.pointsSum6 - formHome.pointsSum6
    );

    const XGDiffBetweenTeamsHomePerspective = Math.abs(
      formHome.XGDiffNonAverage - formAway.XGDiffNonAverage
    );
    const XGDiffBetweenTeamsAwayPerspective = Math.abs(
      formAway.XGDiffNonAverage - formHome.XGDiffNonAverage
    );

    match.goalDiffHomeOrAwayComparison =
      parseFloat(formHome.goalDifferenceHomeOrAway) -
      parseFloat(formAway.goalDifferenceHomeOrAway);

    match.goalDifferenceComparison =
      parseFloat(formHome.goalDifference) - parseFloat(formAway.goalDifference);

    switch (true) {
      case finalHomeGoals > finalAwayGoals:
        if (minimumXG !== 0 && XGDiffBetweenTeamsHomePerspective < minimumXG) {
          match.omit = true;
        }
        if (
          minimumLast6 !== 0 &&
          last10PointDiffHomePerspective < minimumLast6
        ) {
          match.omit = true;
        }
        if (
          minimumGDHorA !== 0 &&
          match.goalDiffHomeOrAwayComparison < minimumGDHorA
        ) {
          match.omit = true;
        }
        if (minimumGD !== 0 && match.goalDifferenceComparison < minimumGD) {
          match.omit = true;
        }
        break;
      case finalHomeGoals < finalAwayGoals:
        if (minimumXG !== 0 && XGDiffBetweenTeamsAwayPerspective < minimumXG) {
          match.omit = true;
        }
        if (
          minimumLast6 !== 0 &&
          last6PointDiffAwayPerspective < minimumLast6
        ) {
          match.omit = true;
        }
        if (
          minimumGDHorA !== 0 &&
          Math.abs(match.goalDiffHomeOrAwayComparison) < minimumGDHorA
        ) {
          match.omit = true;
        }
        if (
          minimumGD !== 0 &&
          Math.abs(match.goalDifferenceComparison) < minimumGD
        ) {
          match.omit = true;
        }
        break;
      case finalHomeGoals === finalAwayGoals:
        if (
          minimumXG !== 0 &&
          Math.abs(XGDiffBetweenTeamsHomePerspective) < minimumXG
        ) {
          match.omit = true;
        }
        if (
          minimumLast6 !== 0 &&
          last10PointDiffHomePerspective < minimumLast6
        ) {
          match.omit = true;
        }
        if (
          minimumGDHorA !== 0 &&
          Math.abs(match.goalDiffHomeOrAwayComparison) < minimumGDHorA
        ) {
          match.omit = true;
        }
        if (
          minimumGD !== 0 &&
          Math.abs(match.goalDifferenceComparison) < minimumGD
        ) {
          match.omit = true;
        }
        break;
      default:
        break;
    }

    if (match.matches_completed_minimum < 5 || match.omit === true) {
      finalHomeGoals = "-";
      finalAwayGoals = "-";
      match.status = "notEnoughData";
    }

    return [
      finalHomeGoals,
      finalAwayGoals,
      rawFinalHomeGoals,
      rawFinalAwayGoals,
    ];
  } else {
    finalHomeGoals = "";
    finalAwayGoals = "";
    rawFinalHomeGoals = "";
    rawFinalAwayGoals = "";
    match.status = "notEnoughData";
    match.profit = 0;
  }

  return [finalHomeGoals, finalAwayGoals, rawFinalHomeGoals, rawFinalAwayGoals];
}

let specificLeagueResults = {}; // Initialize outside the function to persist data

async function getSuccessMeasure(fixtures) {
  let sumProfit = 0;
  let investment = 0;
  let exactScores = 0;
  let successCount = 0;
  let profit = 0;
  let netProfit = 0;

  for (let i = 0; i < fixtures.length; i++) {
    if (
      fixtures[i].status === "complete" &&
      fixtures[i].hasOwnProperty("prediction") &&
      fixtures[i].omit !== true
    ) {
      sumProfit += fixtures[i].profit;
      investment += 1;
      netProfit = (sumProfit - investment).toFixed(2);
      profit = parseFloat(netProfit);

      if (fixtures[i].exactScore === true) {
        exactScores += 1;
      }
      if (fixtures[i].predictionOutcome === "Won") {
        successCount += 1;
      }

      // Handle league-specific results
      const leagueName = fixtures[i].leagueDesc || "Unknown League";

      if (!specificLeagueResults[leagueName]) {
        specificLeagueResults[leagueName] = {
          totalProfit: 0,
          totalInvestment: 0,
          totalROI: 0,
          exactScores: 0,
          successCount: 0,
        };
      }

      // Update the league-specific results
      const league = specificLeagueResults[leagueName];
      league.totalProfit += fixtures[i].profit;
      league.totalInvestment += 1;
      league.exactScores += fixtures[i].exactScore ? 1 : 0;
      league.successCount += fixtures[i].predictionOutcome === "Won" ? 1 : 0;

      // Calculate ROI for the league
      const netLeagueProfit = league.totalProfit - league.totalInvestment;
      league.totalROI = (
        (netLeagueProfit / league.totalInvestment) *
        100
      ).toFixed(2);
    }
  }

  // Update cumulative totals
  totalInvestment += investment;
  totalProfit += profit;
  const ROI = (profit / investment) * 100;
  totalROI = (totalProfit / totalInvestment) * 100;

  console.log(`Total Investment: ${totalInvestment}`);
  console.log(`Total Profit: ${totalProfit}`);
  console.log(typeof totalProfit);
  console.log(`Total Investment: ${totalInvestment}`);
  console.log(`Total ROI: ${totalROI}`);
  console.log(typeof totalROI);

  let isPaid;
  if (userDetail) {
    isPaid = userDetail.isPaid;
  }
  console.log(isPaid);
  if (investment > 0 && isPaid) {
    ReactDOM.render(
      <Fragment>
        <h3 className={"SuccessMeasureText"}>
          ROI for all {investment} W/D/W outcomes: {ROI >= 0 ? "+" : " "}{" "}
          {ROI.toFixed(2)}%
        </h3>
        <p>{`Correct W/D/W predictions: ${successCount} (${(
          (successCount / investment) *
          100
        ).toFixed(1)}%)`}</p>
        <p>{`Exact scores predicted: ${exactScores} (${(
          (exactScores / investment) *
          100
        ).toFixed(1)}%)`}</p>
        <p className="SuccessMeasureText">
          Cumulative ROI for all {totalInvestment} match outcomes:{" "}
          {totalROI >= 0 ? "+" : ""}
          {totalROI.toFixed(2)}%
        </p>
        <CollapsableStats buttonText="ROI by League">
          {Object.entries(specificLeagueResults)
            .sort(([, a], [, b]) => b.totalROI - a.totalROI) // Sort by ROI in descending order
            .map(([leagueName, league]) => {
              return (
                <div className="SuccessMeasure" key={leagueName}>
                  <h3
                    className={`${
                      league.totalROI >= 0
                        ? "ProfitableLeague"
                        : "NonProfitableLeague"
                    }`}
                  >
                    {leagueName}: ROI {league.totalROI >= 0 ? "+" : " "}
                    {league.totalROI}%
                  </h3>
                  <p>
                    Successful Predictions: {league.successCount} /{" "}
                    {specificLeagueResults[leagueName].totalInvestment} :{" "}
                    {(
                      (league.successCount /
                        specificLeagueResults[leagueName].totalInvestment) *
                      100
                    ).toFixed(2)}
                    %
                  </p>
                  <p>
                    Exact Scores: {league.exactScores} /{" "}
                    {specificLeagueResults[leagueName].totalInvestment} :{" "}
                    {(
                      (league.exactScores /
                        specificLeagueResults[leagueName].totalInvestment) *
                      100
                    ).toFixed(2)}
                  </p>
                </div>
              );
            })}
        </CollapsableStats>
      </Fragment>,
      document.getElementById("successMeasure2")
    );
  } else if (!isPaid) {
    ReactDOM.render(
      <Fragment>
        <p>{`Correct W/D/W predictions: ${successCount} / ${investment} (${(
          (successCount / investment) *
          100
        ).toFixed(1)}%)`}</p>
        <p>Full ROI stats available when fixtures are uncapped</p>
      </Fragment>,
      document.getElementById("successMeasure2")
    );
  } else {
    return;
  }
}

export var tips = [];
export var allTips = [];
let allTipsSorted = [];
var newArray = [];
var bestBets = [];
var price;
var Over25Tips = [];
var XGDiffTips = [];
var rollingDiffTips = [];
var dangerousAttacksDiffTips = [];
var pointsDiffTips = [];
var combinations;
var exoticArray = [];
var gamesInExotic;
var minimumExotic;
var exoticStake;
var exoticString;
var bttsArray = [];
var accumulatedOdds = 1;
let predictions = [];

export async function getNewTips(array) {
  // allTips = [];
  newArray = [];
  accumulatedOdds = 1;

  if (array.length > 1 && incrementValue > 0) {
    array.forEach((tip) => {
      if (array.indexOf(tip) < incrementValue) {
        newArray.push(tip);
        accumulatedOdds = parseFloat(accumulatedOdds) * parseFloat(tip.rawOdds);
      }
    });
  }
  await renderTips(newArray);
}

const footyStatsToSofaScore = [
  {
    //Prem
    12325: {
      id: 17,
      season: 61627,
    },
    //Championship
    12451: {
      id: 18,
      season: 61961,
    },
    //League 1
    12446: {
      id: 24,
      season: 61959,
    },
    //League 2
    12422: {
      id: 25,
      season: 61960,
    },
    //Bundesliga
    12529: {
      id: 35,
      season: 63516,
    },
    //La Liga
    12316: {
      id: 8,
      season: 61643,
    },
    //Champions league
    12321: {
      id: 7,
      season: 61644,
    },
    //Serie A
    12530: {
      id: 23,
      season: 63515,
    },
    //MLS
    13973: {
      id: 242,
      season: 70158,
    },
    //Ligue 1
    12337: {
      id: 34,
      season: 61736,
    },
  },
];

async function fetchLeagueStats() {
  function getWeekOfYear(date) {
    const target = new Date(date.valueOf());
    const dayNumber = (date.getUTCDay() + 6) % 7;
    target.setUTCDate(target.getUTCDate() - dayNumber + 3);
    const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4));
    const diff = target - firstThursday;
    return 1 + Math.round(diff / (7 * 24 * 60 * 60 * 1000));
  }

  const today = new Date(); // Or new Date()
  const week = getWeekOfYear(today);

  const allLeagueStats = {};

  for (const leagueObject of footyStatsToSofaScore) {
    for (const leagueId in leagueObject) {
      const { id: sofaScoreId, season: sofaScoreSeason } =
        leagueObject[leagueId];

      try {
        const leagueTeamStatsResponse = await fetch(
          `${process.env.REACT_APP_EXPRESS_SERVER}LeagueTeamStats/${sofaScoreId}/${sofaScoreSeason}/${week}`
        );
        const teamStats = await leagueTeamStatsResponse.json();
        allLeagueStats[`leagueStats${leagueId}`] = teamStats;
        console.log(`Fetched stats for league ${leagueId}`);
      } catch (error) {
        console.error(`Error fetching stats for league ${leagueId}:`, error);
        allLeagueStats[`leagueStats${leagueId}`] = { error: error.message }; // Store error if fetch fails
      }
    }
  }

  return allLeagueStats;
}

export let leagueStatsArray;

export async function getScorePrediction(day, mocked) {
  let mock = mocked;
  clicked = true;
  tips = [];
  bestBets = [];
  // price = 0
  bttsArray = [];
  Over25Tips = [];
  XGDiffTips = [];
  pointsDiffTips = [];
  rollingDiffTips = [];
  dangerousAttacksDiffTips = [];
  allTips = [];

  let index = 2;
  let divider = 10;

  // Call the function to fetch and store the league stats
  const leagueStatsPromise = fetchLeagueStats();

  ReactDOM.render(
    <div>
      <ThreeDots className="MainLoading" fill="#030061" />
      <div>Loading predictions...</div>
    </div>,
    document.getElementById("FixtureContainer")
  );

  await Promise.all(
    matches.map(async (match) => {
      // if there are no stored predictions, calculate them based on live data
      if (match) {
        switch (true) {
          case match.status === "canceled":
            match.goalsA = "P";
            match.goalsB = "P";
            match.completeData = false;
            await calculateScore(match, index, divider, false);
            break;
          case match.leagueID === 6935 ||
            match.leagueID === 7061 ||
            (match.game_week < 3 &&
              match.game_week !== 0 &&
              match.matches_completed_minimum < 5):
            match.goalsA = "x";
            match.goalsB = "x";
            match.completeData = false;
            await calculateScore(match, index, divider, true);
            break;
          default:
            [
              match.goalsA,
              match.goalsB,
              match.unroundedGoalsA,
              match.unroundedGoalsB,
              match.completeData = true,
            ] = await calculateScore(match, index, divider, true);
            break;
        }
      } else {
        [
          match.goalsA,
          match.goalsB,
          match.unroundedGoalsA,
          match.unroundedGoalsB,
        ] = await calculateScore(match, index, divider, true);
      }

      await getBTTSPotential(
        match,
        match.goalsA,
        match.goalsB,
        match.directnessRatingHome,
        match.directnessRatingAway
      );

      let predictionObject;
      let Over25PredictionObject;
      let XGPredictionObject;
      let pointsDiffObject;
      let rollingDiffObject;
      let dangerousAttacksDiffObject;

      if (match.status === "complete" && match.prediction) {
        match.outcomeSymbol =
          match.predictionOutcome === "Won" ? "\u2714" : "\u2718";
        match.over25PredictionOutcomeSymbol =
          match.over25PredictionOutcome === "Won" ? "\u2714" : "\u2718";
        match.bttsOutcomeSymbol =
          match.bttsOutcome === "bttsWon" ? "\u2714" : "\u2718";
      } else {
        match.outcomeSymbol = "";
        match.over25PredictionOutcomeSymbol = "";
        match.bttsOutcomeSymbol = "";
      }

      if (
        match.unroundedGoalsA - match.unroundedGoalsB > 0.65 &&
        match.homeOdds !== 0 &&
        match.fractionHome !== "N/A" &&
        match.includeInMultis !== false &&
        match.omit !== true
      ) {
        if (
          match.prediction !== "draw" &&
          match.status !== "suspended" &&
          match.status !== "canceled" &&
          match.status !== "notEnoughData" &&
          match.homeOdds < 3
        ) {
          predictionObject = {
            team: `${match.homeTeam} to win`,
            game:
              match.status === "complete"
                ? `${match.homeTeam} ${match.homeGoals} - ${match.awayGoals} ${match.awayTeam}`
                : match.game,
            odds: match.fractionHome,
            rawOdds: match.homeOdds,
            comparisonScore: Math.abs(match.teamComparisonScore),
            rawComparisonScore: match.teamComparisonScore,
            outcome: match.predictionOutcome,
            outcomeSymbol: match.outcomeSymbol,
            goalDifferential: parseFloat(
              await diff(match.unroundedGoalsA, match.unroundedGoalsB)
            ),
            experimentalCalc: (
              (match.unroundedGoalsA - match.unroundedGoalsB) *
              Math.abs(match.teamComparisonScore)
            ).toFixed(2),
            XGdifferentialValue: parseFloat(match.XGdifferentialValue),
          };
          if (
            predictionObject.rawOdds >= 1.25 &&
            match.formHome.clinicalRating !== "awful"
          ) {
            allTips.push(predictionObject);

            if (
              match.unroundedGoalsA - match.unroundedGoalsB >
              incrementValue
            ) {
              bestBets.push(predictionObject);
            }
          }
        }
      } else if (
        match.unroundedGoalsB - match.unroundedGoalsA > 1.75 &&
        match.awayOdds !== 0 &&
        match.fractionAway !== "N/A" &&
        match.includeInMultis !== false &&
        match.omit !== true
      ) {
        if (
          match.prediction !== "draw" &&
          match.status !== "suspended" &&
          match.status !== "canceled" &&
          match.status !== "notEnoughData" &&
          match.awayOdds < 3.5
        ) {
          predictionObject = {
            team: `${match.awayTeam} to win`,
            game:
              match.status === "complete"
                ? `${match.homeTeam} ${match.homeGoals} - ${match.awayGoals} ${match.awayTeam}`
                : match.game,
            rawOdds: match.awayOdds,
            odds: match.fractionAway,
            comparisonScore: Math.abs(match.teamComparisonScore),
            rawComparisonScore: match.teamComparisonScore,
            outcome: match.predictionOutcome,
            outcomeSymbol: match.outcomeSymbol,
            goalDifferential:
              parseFloat(
                await diff(match.unroundedGoalsB, match.unroundedGoalsA)
              ) - 1,
            experimentalCalc: (
              (match.unroundedGoalsB - match.unroundedGoalsA) *
              Math.abs(match.teamComparisonScore)
            ).toFixed(2),
            XGdifferentialValue: parseFloat(match.XGdifferentialValue),
          };
          if (
            predictionObject.rawOdds >= 1.25 &&
            match.formAway.clinicalRating !== "awful"
          ) {
            allTips.push(predictionObject);
            if (match.unroundedGoalsB - match.unroundedGoalsA > 2) {
              bestBets.push(predictionObject);
            }
          }
        }
      }

      if (
        match.btts === true &&
        match.status !== "suspended" &&
        match.status !== "canceled" &&
        match.status !== "notEnoughData"
      ) {
        bttsArray.push(match);
      }
      if (
        match.unroundedGoalsA + match.unroundedGoalsB > 4 &&
        match.goalsA + match.goalsB > 2 &&
        match.GoalsInGamesAverageHome > 3 &&
        match.GoalsInGamesAverageAway > 3
      ) {
        Over25PredictionObject = {
          game:
            match.status === "complete"
              ? `${match.homeTeam} ${match.homeGoals} - ${match.awayGoals} ${match.awayTeam}`
              : match.game,
          team: match.homeTeam,
          decimalOdds: match.homeDoubleChance,
          rawOdds: match.over25Odds,
          odds: match.over25Odds,
          comparisonScore: match.teamComparisonScore,
          outcome: match.predictionOutcome,
          outcomeSymbol: match.over25PredictionOutcomeSymbol,
          doubleChanceOutcome: match.over25PredictionOutcome,
          goalTotalUnrounded: match.unroundedGoalsA + match.unroundedGoalsB,
        };
        Over25Tips.push(Over25PredictionObject);
      }

      if (
        match.XGdifferential === true &&
        match.prediction === "homeWin" &&
        match.status !== "notEnoughData" &&
        match.status !== "suspended" &&
        match.status !== "canceled"
      ) {
        XGPredictionObject = {
          game:
            match.status === "complete"
              ? `${match.homeTeam} ${match.homeGoals} - ${match.awayGoals} ${match.awayTeam}`
              : match.game,
          team: `${match.homeTeam} to win`,
          rawOdds: match.homeOdds,
          comparisonScore: Math.abs(match.teamComparisonScore),
          rawComparisonScore: match.teamComparisonScore,
          outcome: match.predictionOutcome,
          outcomeSymbol: match.outcomeSymbol,
          prediction: `${match.homeTeam} to win`,
          odds: match.fractionHome,
          otherTeam: match.awayTeam,
          XGdifferentialValue: match.XGdifferentialValue,
          goalDifferential: parseFloat(
            await diff(match.unroundedGoalsA, match.unroundedGoalsB)
          ),
        };
        XGDiffTips.push(XGPredictionObject);
      } else if (
        match.XGdifferential === true &&
        match.prediction === "awayWin" &&
        match.status !== "notEnoughData" &&
        match.status !== "suspended" &&
        match.status !== "canceled"
      ) {
        XGPredictionObject = {
          game:
            match.status === "complete"
              ? `${match.homeTeam} ${match.homeGoals} - ${match.awayGoals} ${match.awayTeam}`
              : match.game,
          team: `${match.awayTeam} to win`,
          rawOdds: match.awayOdds,
          comparisonScore: Math.abs(match.teamComparisonScore),
          rawComparisonScore: match.teamComparisonScore,
          outcome: match.predictionOutcome,
          outcomeSymbol: match.outcomeSymbol,
          prediction: `${match.awayTeam} to win`,
          odds: match.fractionAway,
          otherTeam: match.homeTeam,
          XGdifferentialValue: match.XGdifferentialValue,
          goalDifferential: parseFloat(
            await diff(match.unroundedGoalsB, match.unroundedGoalsA)
          ),
        };
        XGDiffTips.push(XGPredictionObject);
      }

      leagueStatsArray = await leagueStatsPromise;

      if (
        match.pointsDifferential === true &&
        match.prediction === "homeWin" &&
        match.status !== "notEnoughData" &&
        match.status !== "suspended" &&
        match.status !== "canceled"
      ) {
        pointsDiffObject = {
          game:
            match.status === "complete"
              ? `${match.homeTeam} ${match.homeGoals} - ${match.awayGoals} ${match.awayTeam}`
              : match.game,
          team: `${match.homeTeam} to win`,
          rawOdds: match.homeOdds,
          comparisonScore: Math.abs(match.teamComparisonScore),
          rawComparisonScore: match.teamComparisonScore,
          outcome: match.predictionOutcome,
          outcomeSymbol: match.outcomeSymbol,
          prediction: `${match.homeTeam} to win`,
          odds: match.fractionHome,
          otherTeam: match.awayTeam,
          pointsDifferentialValue: match.pointsDifferentialValue,
          goalDifferential: parseFloat(
            await diff(match.unroundedGoalsA, match.unroundedGoalsB)
          ),
        };
        pointsDiffTips.push(pointsDiffObject);
      } else if (
        match.XGdifferential === true &&
        match.prediction === "awayWin" &&
        match.status !== "notEnoughData" &&
        match.status !== "suspended" &&
        match.status !== "canceled"
      ) {
        pointsDiffObject = {
          game:
            match.status === "complete"
              ? `${match.homeTeam} ${match.homeGoals} - ${match.awayGoals} ${match.awayTeam}`
              : match.game,
          team: `${match.awayTeam} to win`,
          rawOdds: match.awayOdds,
          comparisonScore: Math.abs(match.teamComparisonScore),
          rawComparisonScore: match.teamComparisonScore,
          outcome: match.predictionOutcome,
          outcomeSymbol: match.outcomeSymbol,
          prediction: `${match.awayTeam} to win`,
          odds: match.fractionAway,
          otherTeam: match.homeTeam,
          pointsDifferentialValue: match.pointsDifferentialValue,
          goalDifferential: parseFloat(
            await diff(match.unroundedGoalsB, match.unroundedGoalsA)
          ),
        };
        pointsDiffTips.push(pointsDiffObject);
      }

      if (
        match.rollingGoalDiff === true &&
        match.prediction === "homeWin" &&
        match.status !== "notEnoughData" &&
        match.status !== "suspended" &&
        match.status !== "canceled"
      ) {
        rollingDiffObject = {
          game:
            match.status === "complete"
              ? `${match.homeTeam} ${match.homeGoals} - ${match.awayGoals} ${match.awayTeam}`
              : match.game,
          team: `${match.homeTeam} to win`,
          rawOdds: match.homeOdds,
          comparisonScore: Math.abs(match.teamComparisonScore),
          rawComparisonScore: match.teamComparisonScore,
          outcome: match.predictionOutcome,
          outcomeSymbol: match.outcomeSymbol,
          prediction: `${match.homeTeam} to win`,
          odds: match.fractionHome,
          otherTeam: match.awayTeam,
          rollingGoalDiffValue: match.rollingGoalDiffValue,
          goalDifferential: parseFloat(
            await diff(match.unroundedGoalsA, match.unroundedGoalsB)
          ),
        };
        rollingDiffTips.push(rollingDiffObject);
      } else if (
        match.XGdifferential === true &&
        match.prediction === "awayWin" &&
        match.status !== "notEnoughData" &&
        match.status !== "suspended" &&
        match.status !== "canceled"
      ) {
        rollingDiffObject = {
          game:
            match.status === "complete"
              ? `${match.homeTeam} ${match.homeGoals} - ${match.awayGoals} ${match.awayTeam}`
              : match.game,
          team: `${match.awayTeam} to win`,
          rawOdds: match.awayOdds,
          comparisonScore: Math.abs(match.teamComparisonScore),
          rawComparisonScore: match.teamComparisonScore,
          outcome: match.predictionOutcome,
          outcomeSymbol: match.outcomeSymbol,
          prediction: `${match.awayTeam} to win`,
          odds: match.fractionAway,
          otherTeam: match.homeTeam,
          rollingGoalDiffValue: match.rollingGoalDiffValue,
          goalDifferential: parseFloat(
            await diff(match.unroundedGoalsB, match.unroundedGoalsA)
          ),
        };
        rollingDiffTips.push(rollingDiffObject);
      }

      if (
        match.dangerousAttacksDiff === true &&
        match.prediction === "homeWin" &&
        match.status !== "notEnoughData" &&
        match.status !== "suspended" &&
        match.status !== "canceled"
      ) {
        dangerousAttacksDiffObject = {
          game:
            match.status === "complete"
              ? `${match.homeTeam} ${match.homeGoals} - ${match.awayGoals} ${match.awayTeam}`
              : match.game,
          team: `${match.homeTeam} to win`,
          rawOdds: match.homeOdds,
          comparisonScore: Math.abs(match.teamComparisonScore),
          rawComparisonScore: match.teamComparisonScore,
          outcome: match.predictionOutcome,
          outcomeSymbol: match.outcomeSymbol,
          prediction: `${match.homeTeam} to win`,
          odds: match.fractionHome,
          otherTeam: match.awayTeam,
          rollingGoalDiffValue: match.rollingGoalDiffValue,
          goalDifferential: parseFloat(
            await diff(match.unroundedGoalsA, match.unroundedGoalsB)
          ),
        };
        dangerousAttacksDiffTips.push(dangerousAttacksDiffObject);
      } else if (
        match.XGdifferential === true &&
        match.prediction === "awayWin" &&
        match.status !== "notEnoughData" &&
        match.status !== "suspended" &&
        match.status !== "canceled"
      ) {
        dangerousAttacksDiffObject = {
          game:
            match.status === "complete"
              ? `${match.homeTeam} ${match.homeGoals} - ${match.awayGoals} ${match.awayTeam}`
              : match.game,
          team: `${match.awayTeam} to win`,
          rawOdds: match.awayOdds,
          comparisonScore: Math.abs(match.teamComparisonScore),
          rawComparisonScore: match.teamComparisonScore,
          outcome: match.predictionOutcome,
          outcomeSymbol: match.outcomeSymbol,
          prediction: `${match.awayTeam} to win`,
          odds: match.fractionAway,
          otherTeam: match.homeTeam,
          rollingGoalDiffValue: match.rollingGoalDiffValue,
          goalDifferential: parseFloat(
            await diff(match.unroundedGoalsB, match.unroundedGoalsA)
          ),
        };
        dangerousAttacksDiffTips.push(dangerousAttacksDiffObject);
      }

      predictions.push(match);
    })
  );
  ReactDOM.render(
    <RenderAllFixtures
      matches={matches}
      result={true}
      bool={mock}
      stats={leagueStatsArray}
    />,
    document.getElementById("FixtureContainer")
  );
  await getSuccessMeasure(matches);
  await getMultis();
  await getNewTips(allTipsSorted);
}

async function getMultis() {
  allTipsSorted = allTips.sort(function (a, b) {
    return b.goalDifferential - a.goalDifferential;
  });

  bestBets.sort(function (a, b) {
    if (a.goalDifferential === b.goalDifferential) {
      return b.comparisonScore - a.comparisonScore;
    } else {
      return b.goalDifferential > a.goalDifferential ? 1 : -1;
    }
  });

  bttsArray.sort(function (a, b) {
    return b.combinedBTTS - a.combinedBTTS;
  });

  Over25Tips.sort(function (a, b) {
    return b.goalTotalUnrounded - a.goalTotalUnrounded;
  });

  XGDiffTips.sort(function (a, b) {
    return Math.abs(b.XGdifferentialValue) - Math.abs(a.XGdifferentialValue);
  });

  pointsDiffTips.sort(function (a, b) {
    return (
      Math.abs(b.pointsDifferentialValue) - Math.abs(a.pointsDifferentialValue)
    );
  });

  rollingDiffTips.sort(function (a, b) {
    return Math.abs(b.rollingGoalDiffValue) - Math.abs(a.rollingGoalDiffValue);
  });

  dangerousAttacksDiffTips.sort(function (a, b) {
    return (
      Math.abs(b.dangerousAttacksDiffValue) -
      Math.abs(a.dangerousAttacksDiffValue)
    );
  });

  exoticArray = [];
  gamesInExotic = 0;
  exoticStake = 0;
  exoticString = "";

  switch (true) {
    case allTips.length >= 10:
      for (let i = 0; i < 10; i++) {
        let game = allTips[i];
        exoticArray.push(game);
      }
      gamesInExotic = 10;
      minimumExotic = 8;
      exoticStake = 0.1;
      exoticString = "45 8-folds, 10 9-folds and 1 10-fold";
      price = getCoverBetMaxReturns(exoticArray, minimumExotic, exoticStake);
      break;
    case allTips.length >= 9:
      for (let i = 0; i < 9; i++) {
        let game = allTips[i];
        exoticArray.push(game);
      }
      gamesInExotic = 9;
      minimumExotic = 7;
      exoticStake = 0.1;
      exoticString = "36 7-folds, 9 8-folds and 1 9-fold";
      price = getCoverBetMaxReturns(exoticArray, minimumExotic, exoticStake);
      break;
    case allTips.length >= 8:
      for (let i = 0; i < 8; i++) {
        let game = allTips[i];
        exoticArray.push(game);
      }
      gamesInExotic = 8;
      minimumExotic = 6;
      exoticStake = 0.1;
      exoticString = "28 6-folds, 8 7-folds and 1 8-fold";
      price = getCoverBetMaxReturns(exoticArray, minimumExotic, exoticStake);
      break;
    case allTips.length >= 7:
      for (let i = 0; i < 7; i++) {
        let game = allTips[i];
        exoticArray.push(game);
      }
      gamesInExotic = 7;
      minimumExotic = 6;
      exoticStake = 1;
      exoticString = "7 6-folds and 1 7-fold";
      price = getCoverBetMaxReturns(exoticArray, minimumExotic, exoticStake);
      break;
    case allTips.length >= 6:
      for (let i = 0; i < 6; i++) {
        let game = allTips[i];
        exoticArray.push(game);
      }
      gamesInExotic = 6;
      minimumExotic = 5;
      exoticStake = 1;
      exoticString = "6 5-folds and 1 6-fold";
      price = getCoverBetMaxReturns(exoticArray, minimumExotic, exoticStake);
      break;
    case allTips.length >= 5:
      for (let i = 0; i < 5; i++) {
        let game = allTips[i];
        exoticArray.push(game);
      }
      gamesInExotic = 5;
      minimumExotic = 4;
      exoticStake = 1;
      exoticString = "5 4-folds and 1 5-fold";
      price = getCoverBetMaxReturns(exoticArray, minimumExotic, exoticStake);
      break;
    case Over25Tips.length >= 4:
      for (let i = 0; i < 4; i++) {
        let game = Over25Tips[i];
        exoticArray.push(game);
      }
      gamesInExotic = 4;
      minimumExotic = 3;
      exoticStake = 1;
      exoticString = "4 3-folds and 1 4-fold";
      price = getCoverBetMaxReturns(exoticArray, minimumExotic, exoticStake);
      break;
    default:
      break;
  }
}

export function getAccumulatorPrice(priceArray) {
  var result = 1;
  for (var i = 0; i < priceArray.length; i++)
    result = result * priceArray[i].rawOdds;

  return result;
}

export function getCoverBetMaxReturns(priceArray, minAccSize, stake) {
  var total = 0;
  combinations = 0;

  for (var i = minAccSize; i <= priceArray.length; i++) {
    var perms = getUniquePermutations(priceArray, i);
    combinations = combinations + perms.length;

    for (var j = 0; j < perms.length; j++)
      total += getAccumulatorPrice(perms[j]) * stake;
  }
  return parseFloat(total.toFixed(2));
}

function getUniquePermutations(arr, permLength) {
  if (arr.length <= permLength) return [arr];

  var permutations = [];
  var newArr = [];

  newArr = arr.slice(0);

  for (var i = 0; i < arr.length; i++) {
    newArr = arr.slice(0);
    newArr.splice(i, 1);
    permutations = twoDimArrayUnion(
      permutations,
      getUniquePermutations(newArr, permLength)
    );
  }
  return permutations;
}

function twoDimArrayUnion(arr1, arr2) {
  for (var i = 0; i < arr2.length; i++) {
    var duplicate = false;

    for (var j = 0; j < arr1.length; j++)
      if (arr1[j].length === arr2[i].length)
        for (var k = 0; k < arr1[j].length; k++)
          if (arr1[j][k] !== arr2[i][k]) break;
          else if (k === arr1[j].length - 1) duplicate = true;

    if (!duplicate) arr1.push(arr2[i]);
  }

  return arr1;
}

function NewlineText(props) {
  const text = props.text;
  const newText = text.split("\n").map((str) => <p>{str}</p>);

  return newText;
}

async function renderTips() {
  if (userDetail) {
    paid = await checkUserPaidStatus(userDetail.uid);
  } else {
    paid = false;
  }

  console.log(paid);
  if (newArray.length > 0) {
    ReactDOM.render(
      <div className="PredictionContainer">
        <Fragment>
          <Increment />
          <Collapsable
            buttonText={"Build a Multi"}
            element={
              <ul className="BestPredictions" id="BestPredictions">
                <div className="BestPredictionsExplainer">
                  Add or remove a selection using the buttons below. Predictions
                  are ordered by confidence in the outcome.
                </div>
                {newArray.map((tip) => (
                  <li key={`${tip.game}acca`}>
                    <div>
                      {tip.team}: {tip.odds}{" "}
                      <span className={tip.outcome}>{tip.outcomeSymbol}</span>
                    </div>
                    <div className="TipGame">{tip.game}</div>
                  </li>
                ))}
                <div className="AccumulatedOdds">{`Accumulator odds ~ : ${
                  Math.round(accumulatedOdds) - 1
                }/1`}</div>
              </ul>
            }
          />
        </Fragment>
      </div>,
      document.getElementById("bestPredictions")
    );
  } else {
    ReactDOM.render(
      <div className="PredictionContainer">
        <Fragment>
          <Increment />
          <Collapsable
            buttonText={"Build a multi"}
            element={
              <ul className="BestPredictions" id="BestPredictions">
                <h4 className="BestPredictionsExplainer">
                  No games fit the criteria
                </h4>
                <div className="AccumulatedOdds">{`Accumulator odds ~ : ${
                  Math.round(accumulatedOdds) - 1
                }/1`}</div>
              </ul>
            }
          />
        </Fragment>
      </div>,
      document.getElementById("bestPredictions")
    );
  }

  if (exoticArray.length > 4) {
    ReactDOM.render(
      <div className="PredictionContainer">
        <Fragment>
          <Collapsable
            buttonText={"Exotic of the Day"}
            element={
              <ul className="BestPredictions" id="BestPredictions">
                <h4 className="BestPredictionsExplainer">
                  <NewlineText
                    text={`${gamesInExotic} games: ${exoticString}\nStake per multi: ${exoticStake} units - ${combinations} combinations\nTotal stake: ${(
                      exoticStake * combinations
                    ).toFixed(2)} unit(s)`}
                  />
                  {`Potential winnings: ${price.toFixed(2)} units`}
                </h4>
                {exoticArray.map((tip) => (
                  <li key={tip.team}>
                    {tip.team}: {tip.odds}{" "}
                    <span className={tip.outcome}>{tip.outcomeSymbol}</span>
                    <div>{tip.game}</div>
                  </li>
                ))}
              </ul>
            }
          />
        </Fragment>
      </div>,
      document.getElementById("exoticOfTheDay")
    );
  } else {
    ReactDOM.render(
      <div className="PredictionContainer">
        <Fragment>
          <Collapsable
            buttonText={"Exotic of the day"}
            element={
              <ul className="BestPredictions" id="BestPredictions">
                <h4 className="BestPredictionsExplainer">
                  Not enough games for this feature
                </h4>
              </ul>
            }
          />
        </Fragment>
      </div>,
      document.getElementById("exoticOfTheDay")
    );
  }

  if (Over25Tips.length > 0) {
    ReactDOM.render(
      <div>
        <Fragment>
          <Collapsable
            buttonText={"Over 2.5 Goals Tips"}
            element={
              <ul className="LongshotPredictions" id="LongshotPredictions">
                <h4>Over 2.5 goals</h4>
                {Over25Tips.map((tip) => (
                  <li key={tip.team}>
                    {tip.game} - Odds: {tip.odds}{" "}
                    <span className={`${tip.doubleChanceOutcome}`}>
                      {tip.outcomeSymbol}
                    </span>
                  </li>
                ))}
              </ul>
            }
          />
        </Fragment>
      </div>,
      document.getElementById("longShots")
    );
  } else {
    ReactDOM.render(
      <div>
        <Fragment>
          <Collapsable
            buttonText={"Over 2.5 goals tips"}
            element={
              <ul className="LongshotPredictions" id="LongshotPredictions">
                <h4>No games fit the criteria</h4>
              </ul>
            }
          />
        </Fragment>
      </div>,
      document.getElementById("longShots")
    );
  }

  if (bttsArray.length > 0) {
    ReactDOM.render(
      <div>
        <Fragment>
          <Collapsable
            buttonText={"BTTS Games"}
            element={
              <ul className="BTTSGames" id="BTTSGames">
                <h4>Games with highest chance of BTTS</h4>
                {bttsArray.map((game) => (
                  <li key={game.game}>
                    {`${game.game} odds: ${game.bttsFraction}`}{" "}
                    <span className={game.bttsOutcome}>
                      {game.bttsOutcomeSymbol}
                    </span>
                  </li>
                ))}
              </ul>
            }
          />
        </Fragment>
      </div>,
      document.getElementById("BTTS")
    );
  } else {
    ReactDOM.render(
      <div>
        <Fragment>
          <Collapsable
            buttonText={"BTTS games"}
            element={
              <ul className="BTTSGames" id="BTTSGames">
                <h4>No games fit the criteria</h4>
              </ul>
            }
          />
        </Fragment>
      </div>,
      document.getElementById("BTTS")
    );
  }

  ReactDOM.render(
    <div>
      <Collapsable
        buttonText={"SSH Tips"}
        element={
          <Slider
            element={
              <ul className="XGDiffTips" id="XGDiffTips">
                <h4>Games with greatest XG Differentials</h4>
                {paid ? (
                  XGDiffTips.length > 0 ? (
                    XGDiffTips.map((tip) => (
                      <li key={tip.game}>
                        {tip.game} | {tip.prediction} {tip.odds}{" "}
                        <span className={tip.outcome}>{tip.outcomeSymbol}</span>
                      </li>
                    ))
                  ) : (
                    <li key="noGames">
                      Sorry, no games fit this criteria today
                    </li>
                  )
                ) : (
                  <li key="premiumOnly">Premium members only</li>
                )}
              </ul>
            }
            element2={
              <ul className="XGDiffTips" id="XGDiffTips">
                <h4>
                  Games with greatest points per game differentials (last 6)
                </h4>
                {paid ? (
                  pointsDiffTips.length > 0 ? (
                    pointsDiffTips.map((game) => (
                      <li key={game.game}>
                        {game.game} | {game.prediction} {game.odds}{" "}
                        <span className={game.outcome}>
                          {game.outcomeSymbol}
                        </span>
                      </li>
                    ))
                  ) : (
                    <li key="noGames">
                      Sorry, no games fit this criteria today
                    </li>
                  )
                ) : (
                  <li key="premiumOnly">Premium members only</li>
                )}
              </ul>
            }
            element3={
              <ul className="XGDiffTips" id="XGDiffTips">
                <h4>
                  Games with greatest rolling goal difference differentials
                </h4>
                {paid ? (
                  rollingDiffTips.length > 0 ? (
                    rollingDiffTips.map((game) => (
                      <li key={game.game}>
                        {game.game} | {game.prediction} {game.odds}{" "}
                        <span className={game.outcome}>
                          {game.outcomeSymbol}
                        </span>
                      </li>
                    ))
                  ) : (
                    <li key="noGames">
                      Sorry, no games fit this criteria today
                    </li>
                  )
                ) : (
                  <li key="premiumOnly">Premium members only</li>
                )}
              </ul>
            }
            element4={
              <ul className="XGDiffTips" id="XGDiffTips">
                <h4>
                  Games with greatest average dangerous attacks differentials
                </h4>
                {paid ? (
                  dangerousAttacksDiffTips.length > 0 ? (
                    dangerousAttacksDiffTips.map((game) => (
                      <li key={game.game}>
                        {game.game} | {game.prediction} {game.odds}{" "}
                        <span className={game.outcome}>
                          {game.outcomeSymbol}
                        </span>
                      </li>
                    ))
                  ) : (
                    <li key="noGames">
                      Sorry, no games fit this criteria today
                    </li>
                  )
                ) : (
                  <li key="premiumOnly">Premium members only</li>
                )}
              </ul>
            }
          ></Slider>
        }
      ></Collapsable>
      {(minimumGD !== 0 ||
        minimumXG !== 0 ||
        minimumLast6 !== 0 ||
        minimumGDHorA !== 0) && (
        <div className="FiltersSelected">
          <h4>Filters selected:</h4>
          <ul className="FiltersSelectedList">
            <li>Minimum goal difference spread: {minimumGD}</li>
            <li>
              Minimum goal difference spread (home or away only):{" "}
              {minimumGDHorA}
            </li>
            <li>Minimum XG difference spread: {minimumXG}</li>
            <li>Minimum PPG difference spread: {minimumLast6}</li>
            <li>
              Odds range: {rangeValue[0]} - {rangeValue[1]}
            </li>
          </ul>
        </div>
      )}
    </div>,
    document.getElementById("insights")
  );

  ReactDOM.render(
    <div>
      <Fragment>
        <UserTips />
      </Fragment>
    </div>,
    document.getElementById("UserGeneratedTips")
  );

  ReactDOM.render(
    <Fragment>
      <Collapsable
        buttonText={"Extras"}
        element={
          <div>
            <button
              className="SecondaryButtons"
              onClick={() => {
                window.open("https://www.soccerstatshub.com/#/bttsteams");
              }}
            >
              Both teams to score teams
            </button>
            <button
              className="SecondaryButtons"
              onClick={() => {
                window.open("https://www.soccerstatshub.com/#/bttsfixtures");
              }}
              disabled={!paid}
            >
              Both teams to score fixtures
            </button>
            <button
              className="SecondaryButtons"
              onClick={() => {
                if (paid)
                  window.open("https://www.soccerstatshub.com/#/fixtureshigh");
              }}
              disabled={!paid}
            >
              Over 2.5 goals fixtures
            </button>
            <button
              className="SecondaryButtons"
              onClick={() => {
                if (paid) window.open("https://www.soccerstatshub.com/#/o25");
              }}
              disabled={!paid}
            >
              Highest scoring leagues
            </button>
            <button
              className="SecondaryButtons"
              onClick={() => {
                if (paid) window.open("https://www.soccerstatshub.com/#/u25");
              }}
              disabled={!paid}
            >
              Lowest scoring leagues
            </button>
            <button
              className="SecondaryButtons"
              onClick={() => {
                if (paid)
                  window.open("https://www.soccerstatshub.com/#/teamshigh");
              }}
              disabled={!paid}
            >
              Highest scoring teams
            </button>
          </div>
        }
      />
    </Fragment>,
    document.getElementById("highLowLeagues")
  );
}
