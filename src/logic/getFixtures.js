import React, { Fragment } from "react";
import ReactDOM from "react-dom";
import { orderedLeagues } from "../App";
import { getForm } from "./getForm";
import { Fixture } from "../components/Fixture";
import { Button } from "../components/Button";
import { Slide } from "../components/Slider";
import { getScorePrediction } from "../logic/getScorePredictions";
import { ThreeDots } from "react-loading-icons";
import { selectedOdds } from "../components/OddsRadio";
import LeagueTable from "../components/LeagueTable";
import { getPointsFromLastX } from "../logic/getScorePredictions";
import SlideDiff from "../components/SliderDiff";
import Collapsable from "../components/CollapsableElement";
import { userDetail } from "./authProvider";
import { leagueStatsArray, playerStatsArray } from "../logic/getScorePredictions";
var oddslib = require("oddslib");

var fixtureResponse;
var fixtureArray = [];
export var matches = [];
export var resultedMatches = [];
export let arrayOfGames = [];

var league;
var leagueID;
var leagueGames = [];
export var leagueArray = [];
var leagueIdArray = [];
export let leagueInstance;
export let groupInstance;
export let allLeagueResultsArrayOfObjects = [];
export let uniqueLeagueIDs = [];
var lastThreeFormHome;
var lastThreeFormAway;
var lastFiveFormHome;
var lastFiveFormAway;
var lastSixFormHome;
var lastSixFormAway;
var lastTenFormHome;
var lastTenFormAway;
var leagueOrAll;
var formRunHome;
var formRunAway;
let WDLinLeagueHome;
let WDLinLeagueAway;
let HomeAverageGoals;
let homeAverageGoals;
let HomeAverageConceded;
let homeAverageConceded;
let AwayAverageGoals;
let awayAverageGoals;
let AwayAverageConceded;
let awayAverageConceded;
let paid = false;

export async function diff(a, b) {
  return parseFloat(a - b).toFixed(2);
}

export let allForm = [];
export let tableArray = [];
export let basicTableArray = [];
export let bespokeLeagueArray = [];
groupInstance = [];
leagueInstance = [];

async function convertTimestamp(timestamp) {
  let newDate = new Date(timestamp);
  let [day, month, year] = newDate.toLocaleDateString("en-US").split("/");

  let converted = `${year}-${day}-${month}`;

  return converted;
}
let groups = false;

export async function generateTables(a, leagueIdArray, allResults) {
  tableArray = [];
  basicTableArray = [];
  bespokeLeagueArray = [];
  let i = 0;
  leagueArray.forEach(function (league) {
    let currentLeagueId = leagueIdArray[i];
    console.log(currentLeagueId);
    i++;
    leagueInstance = [];

    //Skip MLS which has a weird format
    if (
      // !league.data.specific_tables[0]?.groups &&
      // currentLeagueId !== 13973 &&
      currentLeagueId !== 12933 &&
      // currentLeagueId !== 13734 &&
      league.data.specific_tables[0]?.table
    ) {
      for (
        let index = 0;
        index < league.data.specific_tables[0].table.length;
        index++
      ) {
        let currentTeam = league.data.specific_tables[0].table[index];
        let last5;
        if (currentTeam.wdl_record.length < 5) {
          last5 = currentTeam.wdl_record
            .slice(`-${currentTeam.wdl_record.length}`)
            .toUpperCase();
        } else {
          last5 = currentTeam.wdl_record.slice(-5).toUpperCase();
        }
        const team = {
          LeagueID: currentLeagueId,
          Position: index + 1,
          Name: currentTeam.cleanName,
          ID: currentTeam.id,
          Played: currentTeam.matchesPlayed,
          Wins: currentTeam.seasonWins_overall,
          Draws: currentTeam.seasonDraws_overall,
          Losses: currentTeam.seasonLosses_overall,
          For: currentTeam.seasonGoals,
          Against:
            currentTeam.seasonConceded_home + currentTeam.seasonConceded_away,
          GoalDifference: currentTeam.seasonGoalDifference,
          Form: last5,
          LastXPoints: getPointsFromLastX(last5.split("")),
          Points: currentTeam.points,
          wdl: currentTeam.wdl_record,
          seasonGoals: currentTeam.seasonGoals,
          seasonConceded: currentTeam.seasonConceded,
          zone:
            currentTeam.zone.name !== null
              ? currentTeam.zone.name
              : "mid-table",
        };
        leagueInstance.push(team);
      }

      tableArray.push({ id: currentLeagueId, table: leagueInstance });
      let basicElements = leagueInstance.map((item) => ({
        LeagueID: item.LeagueID,
        Name: item.Name,
        Position: item.Position,
        GoalDifference: item.GoalDifference,
        Played: item.Played,
        Points: item.Points,
        Zone: item.zone,
      }));
      basicTableArray.push({ id: currentLeagueId, table: basicElements });
    } else if (currentLeagueId === 13973
      // || currentLeagueId === 12933
    ) {
      // for (let x = 0; x < league.data.specific_tables[0].groups.length; x++) {
      // for (
      //   let index = 0;
      //   index < league.data.specific_tables[0].groups[x].table.length;
      //   index++
      // )
      let instances;

      if (currentLeagueId === 13973) {
        console.log(league.data)
        if (league.data.specific_tables[0].groups) {
          instances = league.data.specific_tables[0].groups;
          groups = true
        } else {
          instances = null;
          groups = false
        }
      }
      // else if (currentLeagueId === 12933) {
      //   groups = true
      //   instances = [
      //     league.data.specific_tables[0],
      //     league.data.specific_tables[1],
      //   ];
      // }

      if (groups) {
        instances.forEach((group) => {
          leagueInstance = [];
          for (let index = 0; index < group.table.length; index++) {
            let currentTeam = group.table[index];
            let last5;
            if (currentTeam.wdl_record.length < 5) {
              last5 = currentTeam.wdl_record
                .slice(`-${currentTeam.wdl_record.length}`)
                .toUpperCase();
            } else {
              last5 = currentTeam.wdl_record.slice(-5).toUpperCase();
            }
            const team = {
              LeagueID: currentLeagueId,
              Position: index + 1,
              Name: currentTeam.cleanName,
              ID: currentTeam.id,
              Played: currentTeam.matchesPlayed,
              Wins: currentTeam.seasonWins_overall,
              Draws: currentTeam.seasonDraws_overall,
              Losses: currentTeam.seasonLosses_overall,
              For: currentTeam.seasonGoals,
              Against:
                currentTeam.seasonConceded_home +
                currentTeam.seasonConceded_away,
              GoalDifference: currentTeam.seasonGoalDifference,
              Form: last5,
              LastXPoints: getPointsFromLastX(last5.split("")),
              Points: currentTeam.points,
              wdl: currentTeam.wdl_record,
              seasonGoals: currentTeam.seasonGoals,
              seasonConceded: currentTeam.seasonConceded,
            };
            leagueInstance.push(team);
          }
          bespokeLeagueArray.push({
            id: currentLeagueId,
            group: group.name ? group.name : group.round,
            table: leagueInstance,
          });
          let basicElements = leagueInstance.map((item) => ({
            LeagueID: item.LeagueID,
            Name: item.Name,
            Position: item.Position,
            GoalDifference: item.GoalDifference,
            Played: item.Played,
            Points: item.Points,
          }));
          basicTableArray.push({ id: currentLeagueId, table: basicElements });
        });
      }
    } else if (league.data.league_table === null) {
      for (
        let index = 0;
        index < league.data.all_matches_table_overall.length;
        index++
      ) {
        let currentTeam = league.data.all_matches_table_overall[index];
        let last5 = "N/A";
        const team = {
          LeagueID: currentLeagueId,
          Position: index + 1,
          Name: currentTeam.cleanName,
          ID: currentTeam.id,
          Played: currentTeam.matchesPlayed,
          Wins: currentTeam.seasonWins_overall,
          Draws: currentTeam.seasonDraws_overall,
          Losses: currentTeam.seasonLosses_overall,
          For: currentTeam.seasonGoals,
          Against:
            currentTeam.seasonConceded_home + currentTeam.seasonConceded_away,
          GoalDifference: currentTeam.seasonGoalDifference,
          Form: last5,
          LastXPoints: getPointsFromLastX(last5.split("")),
          Points: currentTeam.points,
          wdl: currentTeam.wdl_record,
          seasonGoals: currentTeam.seasonGoals,
          seasonConceded: currentTeam.seasonConceded,
        };
        leagueInstance.push(team);
      }
      tableArray.push({ id: currentLeagueId, table: leagueInstance });
      let basicElements = leagueInstance.map((item) => ({
        LeagueID: item.LeagueID,
        Name: item.Name,
        Position: item.Position,
        GoalDifference: item.GoalDifference,
        Played: item.Played,
        Points: item.Points,
      }));
      basicTableArray.push({ id: currentLeagueId, table: basicElements });
    }
  });
}

function isWithin48Hours(targetDate) {
  const now = new Date(); // Current date and time
  const timeDifference = targetDate.getTime() - now.getTime(); // Difference in milliseconds
  const fortyEightHoursInMs = 48 * 60 * 60 * 1000; // 48 hours in milliseconds
  // Check if the target date is within the next 48 hours (positive difference)
  // OR within the past 48 hours (negative difference, but absolute value less than 48 hours).
  return Math.abs(timeDifference) <= fortyEightHoursInMs;
}

export async function renderTable(index, results, id) {
  let league;
  //World cup table rendering

  const nowInSeconds = Math.floor(Date.now() / 1000); // Current time in seconds
  const twoWeeksAgo = nowInSeconds - 14 * 24 * 60 * 60; // Two week ago in seconds  console.log(oneWeekAgo)
  // 1740576517073
  // 1723230000
  let mostRecentGames = results.fixtures.filter(
    (result) => result.date_unix >= twoWeeksAgo
  );

  if (id !== 13973 && id !== 12933) {
    const leagueTable = tableArray.filter((table) => table.id === id);

    league = leagueTable[0].table;

    let statistics;
    let leagueStatistics = await fetch(
      `${process.env.REACT_APP_EXPRESS_SERVER}leagueStats/${id}`
    );
    await leagueStatistics.json().then((stats) => {
      statistics = stats.data;
    });

    if (league !== undefined) {
      ReactDOM.render(
        <LeagueTable
          Teams={league}
          Id={id}
          Stats={statistics}
          Key={`League${index}`}
          GamesPlayed={statistics.game_week}
          Results={mostRecentGames}
          Date={todaysDateString}
          RankingStats={leagueStatsArray[`leagueStats${id}`]}
          PlayerRankingStats={playerStatsArray[`playerStats${id}`]}
        // mostRecentGameweek={mostRecentGameweek}
        />,
        document.getElementById(`leagueName${id}`)
      );
    }
  } else if (groups) {

    const leagueTable = bespokeLeagueArray.filter((table) => table.id === id);
    const leagueTable1 = leagueTable[0].table;
    const leagueTable2 = leagueTable[1].table;
    const divisionName1 = leagueTable[0].group;
    const divisionName2 = leagueTable[1].group;

    let statistics;
    let leagueStatistics = await fetch(
      `${process.env.REACT_APP_EXPRESS_SERVER}leagueStats/${id}`
    );
    await leagueStatistics.json().then((stats) => {
      statistics = stats.data;
    });

    if (leagueTable1 !== undefined && leagueTable2 !== undefined) {
      ReactDOM.render(
        <>
          <LeagueTable
            Teams={leagueTable1}
            Stats={statistics}
            Id={id}
            Division={divisionName1}
            Key={`League${index}${divisionName1}`}
            GamesPlayed={statistics.game_week}
            Results={mostRecentGames}
            RankingStats={leagueStatsArray[`leagueStats${id}`]}
            PlayerRankingStats={playerStatsArray[`playerStats${id}`]}
          />
          <LeagueTable
            Teams={leagueTable2}
            Division={divisionName2}
            Stats={statistics}
            Id={id}
            Key={`League${index}${divisionName1}`}
            GamesPlayed={statistics.game_week}
            Results={mostRecentGames}
            RankingStats={leagueStatsArray[`leagueStats${id}`]}
            PlayerRankingStats={playerStatsArray[`playerStats${id}`]}

          />
        </>,
        document.getElementById(`leagueName${id}`)
      );
    }
  }
}

async function createFixture(match, result, mockBool) {
  let roundedHomeOdds;
  let roundedAwayOdds;
  let roundedBTTSOdds;
  let homeFraction;
  let awayFraction;
  let bttsFraction;

  if (selectedOdds === "Fractional odds") {
    if (match.homeOdds !== 0 && match.awayOdds !== 0) {
      roundedHomeOdds = (Math.round(match.homeOdds * 5) / 5).toFixed(1);
      roundedAwayOdds = (Math.round(match.awayOdds * 5) / 5).toFixed(1);

      if (roundedHomeOdds < 1.1) {
        roundedHomeOdds = 1.1;
      }
      if (roundedAwayOdds < 1.1) {
        roundedAwayOdds = 1.1;
      }

      if (match.homeOdds === 0.1 && match.awayOdds === 0.1) {
        match.homeOdds = 3;
        roundedHomeOdds = 3;
        match.awayOdds = 3;
        roundedAwayOdds = 3;
      }

      try {
        homeFraction = oddslib
          .from("decimal", roundedHomeOdds)
          .to("fractional", { precision: 1 });
        awayFraction = oddslib
          .from("decimal", roundedAwayOdds)
          .to("fractional", { precision: 1 });
      } catch (error) {
        console.log(error);
      }
    } else {
      homeFraction = "N/A";
      awayFraction = "N/A";
    }

    if (match.bttsOdds !== 0) {
      roundedBTTSOdds = (Math.round(match.bttsOdds * 5) / 5).toFixed(1);

      if (roundedBTTSOdds < 1.1) {
        roundedBTTSOdds = 1.1;
      }

      try {
        bttsFraction = oddslib
          .from("decimal", roundedBTTSOdds)
          .to("fractional", { precision: 1 });
      } catch (error) {
        console.log(error);
      }
    } else {
      bttsFraction = "N/A";
    }
  } else if (selectedOdds === "Decimal odds") {
    if (match.homeOdds !== 0 && match.awayOdds !== 0) {
      homeFraction = match.homeOdds;
      awayFraction = match.awayOdds;
    } else {
      homeFraction = "N/A";
      awayFraction = "N/A";
    }

    if (match.bttsOdds !== 0) {
      bttsFraction = match.bttsOdds;
    } else {
      bttsFraction = "N/A";
    }
  }

  match.omit = false;
  match.homeTeamWinsPercentage = match.homeTeamWinPercentage;
  match.homeTeamLossesPercentage = match.homeTeamLossPercentage;
  match.homeTeamDrawsPercentage = match.homeTeamDrawPercentage;

  match.awayTeamWinsPercentage = match.awayTeamWinPercentage;
  match.awayTeamLossesPercentage = match.awayTeamLossPercentage;
  match.awayTeamDrawsPercentage = match.awayTeamDrawPercentage;
  match.fractionHome = homeFraction;
  match.fractionAway = awayFraction;

  match.bttsFraction = bttsFraction;

  match.game = match.homeTeam + " v " + match.awayTeam;
}

export function RenderAllFixtures(props) {
  let matches;
  let capped = false;
  let paid = false;
  if (userDetail) {
    paid = userDetail.isPaid;
  }
  const originalLength = props.matches.length;
  let newLength;
  if (paid === true) {
    matches = props.matches;
    newLength = matches.length;
  } else {
    if (originalLength > 20) {
      matches = props.matches.slice(0, 20);
      capped = true;
      newLength = 20;
    } else {
      const slicePercent = 0.5; // 50%
      const sliceCount = Math.ceil(props.matches.length * slicePercent);
      matches = props.matches.slice(0, sliceCount);
      capped = true;
      newLength = sliceCount;
    }
  }

  uniqueLeagueIDs = [...new Set(matches.map(match => match.leagueID))];

  console.log(uniqueLeagueIDs);
  return (
    <Fixture
      fixtures={matches}
      result={props.result}
      mock={false}
      className={"individualFixture"}
      paid={paid}
      capped={capped}
      originalLength={originalLength}
      newLength={newLength}
      stats={props.stats}
    />
  );
}
//     document.getElementById("FixtureContainer")

var myHeaders = new Headers();
myHeaders.append("Origin", "https://gregdorward.github.io");

let isFunctionRunning = false;

export let dynamicDate;
let todaysDateString;

export async function generateFixtures(
  day,
  date,
  selectedOdds,
  footyStatsFormattedDate,
  current,
  todaysDate,
  dateSS,
  unformattedDate
) {
  if (!isFunctionRunning) {
    isFunctionRunning = true;
    todaysDateString = todaysDate;

    ReactDOM.render(
      <div>
        <div className="LoadingText">
          Loading all league, fixture & form data, please be patient...
        </div>
        <ThreeDots className="MainLoading" height="3em" fill="#fe8c00" />
      </div>,
      document.getElementById("Loading")
    );

    //cleanup if different day is selected
    ReactDOM.render(
      <div></div>,
      document.getElementById("GeneratePredictions")
    );
    ReactDOM.render(<div></div>, document.getElementById("MultiPlaceholder"));


    const url = `${process.env.REACT_APP_EXPRESS_SERVER}matches/${footyStatsFormattedDate}`;
    const formUrl = `${process.env.REACT_APP_EXPRESS_SERVER}form/${date}`;
    console.log(unformattedDate);
    dynamicDate = unformattedDate;

    matches = [];
    fixtureArray = [];

    league = await fetch(
      `${process.env.REACT_APP_EXPRESS_SERVER}leagues/${todaysDate}`
    );

    ReactDOM.render(<div></div>, document.getElementById("FixtureContainer"));

    fixtureResponse = await fetch(url);

    await fixtureResponse.json().then((fixtures) => {
      fixtureArray = Array.from(fixtures.data);
    });

    let form;
    let formArray = [];
    allForm = [];
    let isFormStored;
    let isStoredLocally;
    let leaguesStored = false;
    let storedForm = await fetch(formUrl);
    if (storedForm.status === 201 || storedForm.status === 200) {
      await storedForm.json().then((form) => {
        formArray = Array.from(form.allForm);
        isFormStored = true;
        isStoredLocally = true;
        allForm = formArray;
      });
    } else {
      isFormStored = false;
      isStoredLocally = false;
    }

    leagueIdArray = [];
    for (let i = 0; i < orderedLeagues.length; i++) {
      leagueID = orderedLeagues[i].element.id;
      leagueIdArray.push(leagueID);
    }

    var leaguePositions = [];
    leagueArray = [];

    let allLeagueResults;

    allLeagueResults = await fetch(
      `${process.env.REACT_APP_EXPRESS_SERVER}results`
    );

    if (league.status === 200) {
      leaguesStored = true;
      console.log("leagues fetched from s3");
    }

    if (
      league.status === 200 &&
      (allLeagueResults.status === 201 || allLeagueResults.status === 200)
    ) {
      console.log("Not fetching leagues");
      await league.json().then((leagues) => {
        leagueArray = Array.from(leagues.leagueArray);
      });
      updateResults(false);

      await allLeagueResults.json().then((allGames) => {
        allLeagueResultsArrayOfObjects = Array.from(allGames);
      });

      leaguesStored = true;
      generateTables(
        leagueArray,
        leagueIdArray,
        allLeagueResultsArrayOfObjects
      );


      const isYouthOrReserveTeam = (name) => {
        const lowered = name.toLowerCase().trim();
        return (
          lowered.includes("u16") ||
          lowered.includes("u17") ||
          lowered.includes("u18") ||
          lowered.includes("u19") ||
          lowered.includes("u20") ||
          lowered.includes("u21") ||
          lowered.includes("u23") ||
          lowered.includes("reserves") ||
          lowered.includes("reserve") ||
          lowered.endsWith(" b") ||  // only match "Team B", not "FBK Balkan"
          lowered.endsWith(" ii")    // match "Team II"
        );
      };
      arrayOfGames = [];

      try {
        const sofaScore = await fetch(
          `${process.env.REACT_APP_EXPRESS_SERVER}scheduledEvents/${dateSS}`
        );

        const games = await sofaScore.json();

        games.forEach((game) => {
          const homeName = game.homeTeam || "";
          const awayName = game.awayTeam || "";

          // if(homeName.contains("U17") || awayName.contains("U17")) {
          // console.log(homeName, awayName);
          // }

          if (isYouthOrReserveTeam(homeName) || isYouthOrReserveTeam(awayName)) {
            return;
          }

          arrayOfGames.push({
            homeTeam: game.homeTeam,
            homeId: game.homeId !== undefined ? game.homeId : null,
            awayTeam: game.awayTeam,
            awayId: game.awayId !== undefined ? game.awayId : null,
            id: game.id,
            time: game.time,
            homeGoals: game.homeScore !== undefined ? game.homeScore : "-",
            awayGoals: game.awayScore !== undefined ? game.awayScore : "-",
          });
        });
      } catch (error) {
        console.error(
          "An error occurred while fetching or processing data:",
          error
        );
        // You might want to add more specific error handling here,
        // such as setting a default value for arrayOfGames or logging the error to a server.
      }
    } else {
      allLeagueResultsArrayOfObjects = [];
      console.log("Fetching leagues");
      for (let i = 0; i < orderedLeagues.length; i++) {
        league = await fetch(
          `${process.env.REACT_APP_EXPRESS_SERVER}tables/${orderedLeagues[i].element.id}/${todaysDate}`
        );
        // eslint-disable-next-line no-loop-func
        await league.json().then((table) => {
          leagueArray.push(table);
        });
        leaguesStored = false;
      }

      //set variable for date X amount of days in the past and use that to filter the results

      let startDate = (new Date().getTime() / 1000).toFixed(0);
      // deduct 3 months
      let targetDate = startDate - 23778463;

      for (const orderedLeague of orderedLeagues) {
        let fixtures = await fetch(
          `${process.env.REACT_APP_EXPRESS_SERVER}leagueFixtures/${orderedLeague.element.id}`
        );

        let games = await fixtures.json();
        let gamesFiltered;
        let gamesShortened;
        if (games.pager.current_page < games.pager.max_page) {
          const page2 = await fetch(
            `${process.env.REACT_APP_EXPRESS_SERVER}leagueFixtures/${orderedLeague.element.id}&page=2`
          );
          let page2Data = await page2.json();

          const gamesConcat = games.data.concat(page2Data.data);
          const gamesConcatFiltered = gamesConcat.filter(
            (game) => game.status === "complete"
          );

          let mostRecentResults = gamesConcatFiltered.filter(
            (game) => game.date_unix > targetDate
          );
          let sorted = mostRecentResults.sort(
            (a, b) => a.date_unix - b.date_unix
          );
          gamesShortened = sorted.slice(-600);
          gamesFiltered = gamesShortened;
        } else {
          gamesFiltered = games.data.filter(
            (game) => game.status === "complete"
          );

          if (current) {
            let mostRecentResults = gamesFiltered.filter(
              (game) => game.date_unix > targetDate
            );
            gamesFiltered = mostRecentResults.slice(-600);
          }
        }

        const shortenedResults = gamesFiltered.map(
          ({
            home_name,
            away_name,
            homeGoalCount,
            awayGoalCount,
            home_ppg,
            away_ppg,
            date_unix,
            team_a_xg,
            team_b_xg,
            odds_ft_1,
            odds_ft_2,
            team_a_shots,
            team_b_shots,
            team_a_corners,
            team_b_corners,
            team_a_shotsOnTarget,
            team_b_shotsOnTarget,
            team_a_red_cards,
            team_b_red_cards,
            team_a_possession,
            team_b_possession,
            team_a_dangerous_attacks,
            team_b_dangerous_attacks,
            pre_match_teamA_overall_ppg,
            pre_match_teamB_overall_ppg,
            game_week,
          }) => ({
            home_name,
            away_name,
            homeGoalCount,
            awayGoalCount,
            home_ppg,
            away_ppg,
            date_unix,
            team_a_xg,
            team_b_xg,
            odds_ft_1,
            odds_ft_2,
            team_a_shots,
            team_b_shots,
            team_a_corners,
            team_b_corners,
            team_a_shotsOnTarget,
            team_b_shotsOnTarget,
            team_a_red_cards,
            team_b_red_cards,
            team_a_possession,
            team_b_possession,
            team_a_dangerous_attacks,
            team_b_dangerous_attacks,
            pre_match_teamA_overall_ppg,
            pre_match_teamB_overall_ppg,
            game_week,
          })
        );

        let leagueObj = {
          name: orderedLeague.name,
          id: orderedLeague.element.id,
          fixtures: shortenedResults,
        };

        allLeagueResultsArrayOfObjects.push(leagueObj);
      }
      updateResults(true);
      generateTables(
        leagueArray,
        leagueIdArray,
        allLeagueResultsArrayOfObjects
      );
    }

    let teamPositionPrefix;

    async function getPrefix(position) {
      switch (position) {
        case 1:
        case 21:
        case 31:
        case 41:
          teamPositionPrefix = "st";
          break;
        case 2:
        case 22:
        case 32:
        case 42:
          teamPositionPrefix = "nd";
          break;
        case 3:
        case 23:
        case 33:
        case 43:
          teamPositionPrefix = "rd";
          break;
        case 4:
        case 5:
        case 6:
        case 7:
        case 8:
        case 9:
        case 10:
        case 11:
        case 12:
        case 13:
        case 14:
        case 15:
        case 16:
        case 17:
        case 18:
        case 19:
        case 20:
        case 24:
        case 25:
        case 26:
        case 27:
        case 28:
        case 29:
        case 30:
        case 34:
        case 35:
        case 36:
        case 37:
        case 38:
        case 39:
        case 40:
        case 44:
        case 45:
        case 46:
        case 47:
        case 48:
          teamPositionPrefix = "th";
          break;
        default:
          break;
      }
      return teamPositionPrefix;
    }

    // Helper to get leagueInstance length
    function getLeagueInstanceLength(data) {
      if (data.league_table !== null) {
        return data.league_table.length;
      }
      return data.all_matches_table_overall.length;
    }

    // Sort leagueArray based on leagueInstance length (ascending)
    // leagueArray.sort((a, b) => {
    //   return getLeagueInstanceLength(a.data) - getLeagueInstanceLength(b.data);
    // });

    for (let i = 0; i < leagueArray.length; i++) {
      let leagueInstance;
      let homeLeague;
      let awayLeague;

      if (leagueArray[i].data.league_table !== null) {
        leagueInstance = leagueArray[i].data.league_table;
        homeLeague = leagueArray[i].data.all_matches_table_home;
        awayLeague = leagueArray[i].data.all_matches_table_away;
      } else {
        leagueInstance = leagueArray[i].data.all_matches_table_overall;
        homeLeague = leagueArray[i].data.all_matches_table_home;
        awayLeague = leagueArray[i].data.all_matches_table_away;
      }

      for (let x = 0; x < leagueInstance.length; x++) {
        let regularSeason = leagueArray[i].data.specific_tables.find(
          (season) =>
            season.round === "Regular Season" ||
            season.round === "2025" ||
            season.round === "2024/2025" ||
            season.round === "Apertura" ||
            season.round === "1st Phase" ||
            season.round === "2026" ||
            season.round === "-1"
        );
        let string;

        if (regularSeason !== undefined && regularSeason.table) {
          string = regularSeason.table[x];
          homeLeague = leagueArray[i].data.all_matches_table_home;
          awayLeague = leagueArray[i].data.all_matches_table_away;
        } else {
          string = leagueArray[i].data.all_matches_table_overall[x];
          homeLeague = leagueArray[i].data.all_matches_table_home;
          awayLeague = leagueArray[i].data.all_matches_table_away;
        }

        let stringHome = homeLeague[x];
        let stringAway = awayLeague[x];

        if (string) {
          leaguePositions.push({
            name: string.cleanName,
            position: x + 1,
            rawPosition: x + 1,
            homeFormName: stringHome ? stringHome.cleanName : string.cleanName,
            awayFormName: stringAway ? stringAway.cleanName : string.cleanName,
            homeSeasonWinPercentage: stringHome
              ? stringHome.seasonWins
              : string.seasonWins,
            awaySeasonWinPercentage: stringAway
              ? stringAway.seasonWins
              : string.seasonWins,
            homeSeasonLossPercentage: stringHome
              ? stringHome.seasonLosses_home
              : string.seasonLosses_home,
            awaySeasonLossPercentage: stringAway
              ? stringAway.seasonLosses_away
              : string.seasonLosses_away,
            homeSeasonDrawPercentage: stringHome
              ? stringHome.seasonDraws
              : string.seasonDraws,
            awaySeasonDrawPercentage: stringAway
              ? stringAway.seasonDraws
              : string.seasonDraws,
            homeSeasonMatchesPlayed: stringHome
              ? stringHome.matchesPlayed
              : string.matchesPlayed,
            awaySeasonMatchesPlayed: stringAway
              ? stringAway.matchesPlayed
              : string.matchesPlayed,
            ppg: string.points / string.matchesPlayed,
            wdl: string.wdl_record ? string.wdl_record : "",
            played: string.matchesPlayed,
            seasonGoals: string.seasonGoals,
            seasonConceded: string.seasonConceded,
          });
        }
      }
    }

    let previousLeagueName;

    for (let i = 0; i < orderedLeagues.length; i++) {
      leagueID = orderedLeagues[i].element.id;
      leagueGames = fixtureArray.filter(
        (game) => game.competition_id === orderedLeagues[i].element.id
      );

      for (const fixture of leagueGames) {
        const unixTimestamp = fixture.date_unix;
        const milliseconds = unixTimestamp * 1000;
        const dateObject = new Date(milliseconds);
        let match = {};
        if (orderedLeagues[i].name !== previousLeagueName) {
          match.leagueName = orderedLeagues[i].name;
          match.leagueDesc = orderedLeagues[i].name;
          match.leagueIndex = i;
          match.leagueID = leagueID;
        } else {
          match.leagueName = null;
          match.leagueDesc = orderedLeagues[i].name;
          match.leagueIndex = i;
          match.leagueID = leagueID;
        }
        match.id = fixture.id;
        match.competition_id = fixture.competition_id;
        match.date = fixture.date_unix;
        match.time = dateObject.toLocaleString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
        });
        match.homeTeam = fixture.home_name;
        match.awayTeam = fixture.away_name;
        match.stadium = fixture.stadium_name;
        match.refereeID = fixture.refereeID;
        match.homeOdds = +fixture.odds_ft_1.toFixed(2);
        match.awayOdds = +fixture.odds_ft_2.toFixed(2);
        match.drawOdds = +fixture.odds_ft_x.toFixed(2);
        match.homeDoubleChance = fixture.odds_doublechance_1x;
        match.awayDoubleChance = fixture.odds_doublechance_x2;
        match.bttsOdds = fixture.odds_btts_yes;
        match.homeId = fixture.homeID;
        match.awayId = fixture.awayID;
        match.form = [];
        match.btts = false;

        previousLeagueName = orderedLeagues[i].name;

        let homeTeaminLeague;
        let awayTeaminLeague;
        let teamPositionHome;
        let teamPositionHomeTable;
        let teamPositionAwayTable;
        let homeTeamWinPercentageHome;
        let awayTeamWinPercentageAway;
        let homeTeamLossPercentageHome;
        let awayTeamLossPercentageAway;
        let homeTeamDrawPercentageHome;
        let awayTeamDrawPercentageAway;
        let teamPositionAway;
        let homePrefix;
        let homePrefixHomeTable;
        let awayPrefix;
        let awayPrefixAwayTable;
        let homeSeasonPPG;
        let awaySeasonPPG;

        try {
          homeTeaminLeague = leaguePositions.find(
            (team) => team.name === match.homeTeam
          );

          // console.log(leaguePositions)

          let homeTeaminHomeLeague = leaguePositions.find(
            (team) => team.homeFormName === match.homeTeam
          );

          teamPositionHome = homeTeaminLeague.position;
          teamPositionHomeTable = homeTeaminHomeLeague.position;

          WDLinLeagueHome = Array.from(homeTeaminLeague.wdl.toUpperCase());
          HomeAverageGoals =
            homeTeaminLeague.seasonGoals / homeTeaminLeague.played;
          HomeAverageConceded =
            homeTeaminLeague.seasonConceded / homeTeaminLeague.played;

          homeTeamWinPercentageHome =
            (homeTeaminHomeLeague.homeSeasonWinPercentage /
              homeTeaminHomeLeague.homeSeasonMatchesPlayed) *
            100;

          homeTeamLossPercentageHome =
            (homeTeaminHomeLeague.homeSeasonLossPercentage /
              homeTeaminHomeLeague.homeSeasonMatchesPlayed) *
            100;

          homeTeamDrawPercentageHome =
            (homeTeaminHomeLeague.homeSeasonDrawPercentage /
              homeTeaminHomeLeague.homeSeasonMatchesPlayed) *
            100;

          homePrefix = await getPrefix(teamPositionHome);
          homePrefixHomeTable = await getPrefix(teamPositionHomeTable);

          homeSeasonPPG = homeTeaminLeague.ppg.toFixed(2);
        } catch (error) {
          console.log(error);
          teamPositionHome = "N/A";
          homePrefix = "";
          homePrefixHomeTable = "";
          homeSeasonPPG = "N/A";
          homeTeaminLeague = {
            rawPosition: "N/A",
          };
          WDLinLeagueHome = [];
        }

        try {
          awayTeaminLeague = leaguePositions.find(
            (team) => team.name === match.awayTeam
          );

          let awayTeaminAwayLeague = leaguePositions.find(
            (team) => team.awayFormName === match.awayTeam
          );

          teamPositionAway = awayTeaminLeague.position;
          teamPositionAwayTable = awayTeaminAwayLeague.position;

          WDLinLeagueAway = Array.from(awayTeaminLeague.wdl.toUpperCase());
          AwayAverageGoals =
            awayTeaminLeague.seasonGoals / awayTeaminLeague.played;
          AwayAverageConceded =
            awayTeaminLeague.seasonConceded / awayTeaminLeague.played;

          awayTeamWinPercentageAway =
            (awayTeaminAwayLeague.awaySeasonWinPercentage /
              awayTeaminAwayLeague.awaySeasonMatchesPlayed) *
            100;

          awayTeamLossPercentageAway =
            (awayTeaminAwayLeague.awaySeasonLossPercentage /
              awayTeaminAwayLeague.awaySeasonMatchesPlayed) *
            100;

          awayTeamDrawPercentageAway =
            (awayTeaminAwayLeague.awaySeasonDrawPercentage /
              awayTeaminAwayLeague.awaySeasonMatchesPlayed) *
            100;

          awayPrefix = await getPrefix(teamPositionAway);
          awayPrefixAwayTable = await getPrefix(teamPositionAwayTable);

          awaySeasonPPG = awayTeaminLeague.ppg.toFixed(2);
        } catch (error) {
          console.log(error);
          teamPositionAway = "N/A";
          awayPrefix = "";
          awaySeasonPPG = "N/A";
          awayTeaminLeague = {
            rawPosition: "N/A",
          };
          WDLinLeagueAway = [];
        }

        if (!isFormStored) {
          form = await getForm(match);

          let homeFormString5 =
            form[0].data[0].stats.additional_info.formRun_overall.toUpperCase();
          let awayFormString5 =
            form[1].data[0].stats.additional_info.formRun_overall.toUpperCase();
          let homeFormString6 =
            form[0].data[1].stats.additional_info.formRun_overall.toUpperCase();
          let awayFormString6 =
            form[1].data[1].stats.additional_info.formRun_overall.toUpperCase();
          let homeFormString10 =
            form[0].data[2].stats.additional_info.formRun_overall.toUpperCase();
          let awayFormString10 =
            form[1].data[2].stats.additional_info.formRun_overall.toUpperCase();

          let homeFormRun =
            form[0].data[2].stats.additional_info.formRun_home.toUpperCase();
          let awayFormRun =
            form[1].data[2].stats.additional_info.formRun_away.toUpperCase();

          if (WDLinLeagueHome.length >= 10) {
            lastThreeFormHome = WDLinLeagueHome.slice(-3);
            lastFiveFormHome = WDLinLeagueHome.slice(-5);
            lastSixFormHome = WDLinLeagueHome.slice(-6);
            lastTenFormHome = WDLinLeagueHome.slice(-10);
            lastThreeFormAway = WDLinLeagueAway.slice(-3);
            lastFiveFormAway = WDLinLeagueAway.slice(-5);
            lastSixFormAway = WDLinLeagueAway.slice(-6);
            lastTenFormAway = WDLinLeagueAway.slice(-10);
            leagueOrAll = "League";
            homeAverageGoals = HomeAverageGoals;
            homeAverageConceded = HomeAverageConceded;
            awayAverageGoals = AwayAverageGoals;
            awayAverageConceded = AwayAverageConceded;
          } else if (WDLinLeagueHome.length >= 6) {
            lastThreeFormHome = WDLinLeagueHome.slice(-3);
            lastFiveFormHome = WDLinLeagueHome.slice(-5);
            lastSixFormHome = WDLinLeagueHome.slice(-6);
            lastTenFormHome = Array.from(homeFormString10);
            lastThreeFormAway = WDLinLeagueAway.slice(-3);
            lastFiveFormAway = WDLinLeagueAway.slice(-5);
            lastSixFormAway = WDLinLeagueAway.slice(-6);
            lastTenFormAway = Array.from(awayFormString10);
            leagueOrAll = "League";

            homeAverageGoals = HomeAverageGoals;
            homeAverageConceded = HomeAverageConceded;
            awayAverageGoals = AwayAverageGoals;
            awayAverageConceded = AwayAverageConceded;
          } else if (WDLinLeagueHome.length >= 5) {
            lastThreeFormHome = WDLinLeagueHome.slice(-3);
            lastFiveFormHome = WDLinLeagueHome.slice(-5);
            lastSixFormHome = Array.from(homeFormString6);
            lastTenFormHome = Array.from(homeFormString10);
            lastThreeFormAway = WDLinLeagueAway.slice(-3);
            lastFiveFormAway = WDLinLeagueAway.slice(-5);
            lastSixFormAway = Array.from(awayFormString6);
            lastTenFormAway = Array.from(awayFormString10);
            leagueOrAll = "League";

            homeAverageGoals = HomeAverageGoals;
            homeAverageConceded = HomeAverageConceded;
            awayAverageGoals = AwayAverageGoals;
            awayAverageConceded = AwayAverageConceded;
          } else {
            lastThreeFormHome = [
              homeFormString5[2],
              homeFormString5[3],
              homeFormString5[4],
            ];
            lastFiveFormHome = Array.from(homeFormString5);
            lastSixFormHome = Array.from(homeFormString6);
            lastTenFormHome = Array.from(homeFormString10);
            lastThreeFormAway = [
              awayFormString5[2],
              awayFormString5[3],
              awayFormString5[4],
            ];

            lastFiveFormAway = Array.from(awayFormString5);
            lastSixFormAway = Array.from(awayFormString6);
            lastTenFormAway = Array.from(awayFormString10);

            leagueOrAll = "All";

            homeAverageGoals = undefined;
            homeAverageConceded = undefined;
            awayAverageGoals = undefined;
            awayAverageConceded = undefined;
          }

          formRunHome = Array.from(homeFormRun);
          formRunAway = Array.from(awayFormRun);

          if (
            teamPositionHome === 0 ||
            form[0].data[0].season_format !== "Domestic League"
          ) {
            teamPositionHome = "N/A";
            teamPositionHomeTable = "N/A";
            homePrefix = "";
            homePrefixHomeTable = "";
          }
          if (
            teamPositionAway === 0 ||
            form[0].data[0].season_format !== "Domestic League"
          ) {
            teamPositionAway = "N/A";
            teamPositionAwayTable = "N/A";
            awayPrefix = "";
            awayPrefixAwayTable = "";
          }
          allForm.push({
            id: match.id,
            teamIDHome: match.homeId,
            teamIDAway: match.awayId,
            leagueId: leagueID,
            home: {
              teamName: match.homeTeam,
              0: {},
              1: {},
              2: {
                XGOverall: parseFloat(form[0].data[2].stats.xg_for_avg_overall),
                XG: parseFloat(form[0].data[2].stats.xg_for_avg_home),
                ScoredOverall: parseFloat(
                  form[0].data[2].stats.seasonScoredNum_overall
                ),
                ScoredAverage: parseFloat(
                  form[0].data[2].stats.seasonScoredAVG_home
                ),
                PlayedHome: parseFloat(
                  form[0].data[2].stats.seasonMatchesPlayed_home
                ),
                PlayedAway: parseFloat(
                  form[0].data[2].stats.seasonMatchesPlayed_away
                ),
                ConcededOverall: parseFloat(
                  form[0].data[2].stats.seasonConcededNum_overall
                ),
                ConcededAverage: parseFloat(
                  form[0].data[2].stats.seasonConcededAVG_home
                ),
                XGAgainstAvgOverall: parseFloat(
                  form[0].data[2].stats.xg_against_avg_overall
                ),
                XGAgainstAverage: parseFloat(
                  form[0].data[2].stats.xg_against_avg_home
                ),
                CleanSheetPercentage: parseFloat(
                  form[0].data[2].stats.seasonCSPercentage_overall
                ),
                AveragePossessionOverall: parseFloat(
                  form[0].data[2].stats.possessionAVG_overall
                ),
                AveragePossession: parseFloat(
                  form[0].data[2].stats.possessionAVG_home
                ),
                AverageShotsOnTargetOverall: parseFloat(
                  form[0].data[2].stats.shotsOnTargetAVG_overall
                ),
                AverageShotsOnTarget: parseFloat(
                  form[0].data[2].stats.shotsOnTargetAVG_home
                ),
                AverageShots: parseFloat(
                  form[0].data[2].stats.shotsAVG_overall
                ),
                AverageShotsHomeOrAway: parseFloat(
                  form[0].data[2].stats.shotsAVG_home
                ),
                AverageDangerousAttacksOverall: parseFloat(
                  form[0].data[2].stats.dangerous_attacks_avg_overall
                ),
                PPG: parseFloat(form[0].data[2].stats.seasonPPG_overall),
                AttacksHome: parseFloat(form[0].data[2].stats.attacks_avg_home),
                AttacksAway: parseFloat(form[0].data[2].stats.attacks_avg_away),
                AverageDangerousAttacks: parseFloat(
                  form[0].data[2].stats.dangerous_attacks_avg_home
                ),
                homeAttackAdvantage: parseFloat(
                  form[0].data[2].stats.homeAttackAdvantage
                ),
                homeDefenceAdvantage: parseFloat(
                  form[0].data[2].stats.homeDefenceAdvantage
                ),
                BTTSPercentage: parseInt(
                  form[0].data[2].stats.seasonBTTSPercentage_home
                ),
                lastThreeForm:
                  lastThreeFormHome !== undefined
                    ? lastThreeFormHome.reverse()
                    : "N/A",
                LastFiveForm:
                  lastFiveFormHome !== undefined
                    ? lastFiveFormHome.reverse()
                    : "N/A",
                LastSixForm:
                  lastSixFormHome !== undefined
                    ? lastSixFormHome.reverse()
                    : "N/A",
                LastTenForm:
                  lastTenFormHome !== undefined
                    ? lastTenFormHome.reverse()
                    : "N/A",
                LeagueOrAll: leagueOrAll,
                LeaguePosition: `${teamPositionHome}${homePrefix}`,
                homeRawPosition:
                  homeTeaminLeague.rawPosition !== undefined
                    ? homeTeaminLeague.rawPosition
                    : 0,
                homeTeamHomePositionRaw: teamPositionHomeTable,
                SeasonPPG: homeSeasonPPG,
                WinPercentage: homeTeamWinPercentageHome,
                LossPercentage: homeTeamLossPercentageHome,
                DrawPercentage: homeTeamDrawPercentageHome,
                formRun: formRunHome,
                goalDifference:
                  form[0].data[2].stats.seasonGoalDifference_overall,
                goalDifferenceHomeOrAway:
                  form[0].data[2].stats.seasonGoalDifference_home,
                BttsPercentage:
                  form[0].data[2].stats.seasonBTTSPercentage_overall,
                BttsPercentageHomeOrAway:
                  form[0].data[2].stats.seasonBTTSPercentage_home,
                CardsTotal: form[0].data[2].stats.cardsTotal_overall,
                CornersAverage: form[0].data[2].stats.cornersAVG_overall,
                ScoredBothHalvesPercentage:
                  form[0].data[2].stats.scoredBothHalvesPercentage_overall,
                LastMatch: await convertTimestamp(
                  form[0].data[0].last_updated_match_timestamp
                ),
                WDLRecord: WDLinLeagueHome,
                LeagueAverageGoals: homeAverageGoals,
                LeagueAverageConceded: homeAverageConceded,
              },
            },
            away: {
              teamName: match.awayTeam,
              0: {},
              1: {},
              2: {
                XGOverall: parseFloat(form[1].data[2].stats.xg_for_avg_overall),
                XG: parseFloat(form[1].data[2].stats.xg_for_avg_away),
                ScoredOverall: parseFloat(
                  form[1].data[2].stats.seasonScoredNum_overall
                ),
                ScoredAverage: parseFloat(
                  form[1].data[2].stats.seasonScoredAVG_away
                ),
                PlayedHome: parseFloat(
                  form[1].data[2].stats.seasonMatchesPlayed_home
                ),
                PlayedAway: parseFloat(
                  form[1].data[2].stats.seasonMatchesPlayed_away
                ),
                ConcededOverall: parseFloat(
                  form[1].data[2].stats.seasonConcededNum_overall
                ),
                ConcededAverage: parseFloat(
                  form[1].data[2].stats.seasonConcededAVG_away
                ),
                XGAgainstAvgOverall: parseFloat(
                  form[1].data[2].stats.xg_against_avg_overall
                ),
                XGAgainstAverage: parseFloat(
                  form[1].data[2].stats.xg_against_avg_away
                ),
                CleanSheetPercentage: parseFloat(
                  form[1].data[2].stats.seasonCSPercentage_overall
                ),
                AveragePossessionOverall: parseFloat(
                  form[1].data[2].stats.possessionAVG_overall
                ),
                AveragePossession: parseFloat(
                  form[1].data[2].stats.possessionAVG_away
                ),
                AverageShotsOnTargetOverall: parseFloat(
                  form[1].data[2].stats.shotsOnTargetAVG_overall
                ),
                AverageShotsOnTarget: parseFloat(
                  form[1].data[2].stats.shotsOnTargetAVG_away
                ),
                AverageShots: parseFloat(
                  form[1].data[2].stats.shotsAVG_overall
                ),
                AverageShotsHomeOrAway: parseFloat(
                  form[1].data[2].stats.shotsAVG_away
                ),
                AverageDangerousAttacksOverall: parseFloat(
                  form[1].data[2].stats.dangerous_attacks_avg_overall
                ),
                PPG: parseFloat(form[1].data[2].stats.seasonPPG_overall),
                AttacksAverage: parseFloat(
                  form[1].data[2].stats.attacks_avg_away
                ),
                AverageDangerousAttacks: parseFloat(
                  form[1].data[2].stats.dangerous_attacks_avg_away
                ),
                BTTSPercentage: parseInt(
                  form[1].data[2].stats.seasonBTTSPercentage_away
                ),
                lastThreeForm:
                  lastThreeFormAway !== undefined
                    ? lastThreeFormAway.reverse()
                    : "N/A",
                LastFiveForm:
                  lastFiveFormAway !== undefined
                    ? lastFiveFormAway.reverse()
                    : "N/A",
                LastSixForm:
                  lastSixFormAway !== undefined
                    ? lastSixFormAway.reverse()
                    : "N/A",
                LastTenForm:
                  lastTenFormAway !== undefined
                    ? lastTenFormAway.reverse()
                    : "N/A",
                LeagueOrAll: leagueOrAll,
                LeaguePosition: `${teamPositionAway}${awayPrefix}`,
                awayRawPosition: awayTeaminLeague.rawPosition
                  ? awayTeaminLeague.rawPosition
                  : 0,
                awayTeamAwayPositionRaw: teamPositionAwayTable,
                SeasonPPG: awaySeasonPPG,
                WinPercentage: awayTeamWinPercentageAway,
                LossPercentage: awayTeamLossPercentageAway,
                DrawPercentage: awayTeamDrawPercentageAway,
                formRun: formRunAway,
                goalDifference:
                  form[1].data[2].stats.seasonGoalDifference_overall,
                goalDifferenceHomeOrAway:
                  form[1].data[2].stats.seasonGoalDifference_away,
                BttsPercentage:
                  form[1].data[2].stats.seasonBTTSPercentage_overall,
                BttsPercentageHomeOrAway:
                  form[1].data[2].stats.seasonBTTSPercentage_away,
                CardsTotal: form[1].data[2].stats.cardsTotal_overall,
                CornersAverage: form[1].data[2].stats.cornersAVG_overall,
                ScoredBothHalvesPercentage:
                  form[1].data[2].stats.scoredBothHalvesPercentage_overall,
                LastMatch: await convertTimestamp(
                  form[1].data[0].last_updated_match_timestamp
                ),
                WDLRecord: WDLinLeagueAway,
                LeagueAverageGoals: awayAverageGoals,
                LeagueAverageConceded: awayAverageConceded,
              },
            },
          });
        }

        match.matches_completed_minimum = fixture.matches_completed_minimum;
        match.homeBadge = fixture.home_image;
        match.awayBadge = fixture.away_image;

        match.homePpg = fixture.home_ppg.toFixed(2);
        match.awayPpg = fixture.away_ppg.toFixed(2);

        match.lastFiveFormHome = lastFiveFormHome;
        match.lastFiveFormAway = lastFiveFormAway;

        match.homeRawPosition = homeTeaminLeague.rawPosition;
        match.awayRawPosition = awayTeaminLeague.rawPosition;

        match.homeTeamHomePosition = `${teamPositionHomeTable}${homePrefixHomeTable}`;
        match.awayTeamAwayPosition = `${teamPositionAwayTable}${awayPrefixAwayTable}`;

        match.homeTeamHomePositionRaw = teamPositionHomeTable;
        match.awayTeamAwayPositionRaw = teamPositionAwayTable;

        match.homeTeamWinPercentage = homeTeamWinPercentageHome;
        match.awayTeamWinPercentage = awayTeamWinPercentageAway;

        match.homeTeamLossPercentage = homeTeamLossPercentageHome;
        match.awayTeamLossPercentage = awayTeamLossPercentageAway;

        match.homeTeamDrawPercentage = homeTeamDrawPercentageHome;
        match.awayTeamDrawPercentage = awayTeamDrawPercentageAway;
        match.status = fixture.status;
        match.over25Odds = fixture.odds_ft_over25;
        match.btts_potential = fixture.btts_potential;
        match.game = match.homeTeam + " v " + match.awayTeam;
        match.homeGoals = fixture.homeGoalCount;
        match.awayGoals = fixture.awayGoalCount;

        match.expectedGoalsHomeToDate = fixture.team_a_xg_prematch;
        match.expectedGoalsAwayToDate = fixture.team_b_xg_prematch;
        match.game_week = fixture.game_week;

        if (match.status !== "canceled" || match.status !== "suspended") {
          matches.push(match);
          await createFixture(match, false);
        }
      }

      if (matches.length > 0) {
        ReactDOM.render(
          <Fragment>
            <Button
              text={"Get Predictions & Stats"}
              onClickEvent={() => getScorePrediction(day)}
              className={"GeneratePredictions"}
            />
            <div className="Version">Prediction engine v1.5.2 (25/09/25)</div>
            <div>If predictions are missing on games with little data, switch to AI tips in the options, above</div>
            <Collapsable
              buttonText={"Filters"}
              className={"Filters2"}
              element={
                <div className="FilterContainer">
                  <h6>
                    Use the below filters to remove predictions that don't meet
                    the set criteria. These will be greyed out and not included
                    in multi-builders and ROI stats
                  </h6>
                  <h6>Goals for/against differential filter</h6>
                  <div>
                    I'm looking for tips where the goal differential between
                    teams is at least...
                  </div>
                  <SlideDiff
                    value="0"
                    text="all games"
                    useCase="gd"
                    lower="0"
                    upper="30"
                  ></SlideDiff>
                  <h6>Goals for/against home or away differential filter</h6>
                  <div>
                    I'm looking for tips where the goal differential (home or
                    away only) between teams is at least...
                  </div>
                  <SlideDiff
                    value="0"
                    text="all games"
                    useCase="gdHorA"
                    lower="0"
                    upper="30"
                  ></SlideDiff>
                  <Fragment>
                    <h6>XG for/against differential filter</h6>
                    <div>
                      I'm looking for tips where the XG differential between
                      teams is at least...
                    </div>
                    <SlideDiff
                      value="0"
                      text="all games"
                      useCase="xg"
                      lower="0"
                      upper="30"
                    ></SlideDiff>
                  </Fragment>
                  <Fragment>
                    <h6>Last 6 points differential filter</h6>
                    <div>
                      I'm looking for tips where the points differential between
                      teams is at least...
                    </div>
                    <SlideDiff
                      value="0"
                      text="all games"
                      useCase="last10"
                      lower="0"
                      upper="18"
                    ></SlideDiff>
                  </Fragment>
                  <Fragment>
                    <h6>Choose your risk profile</h6>
                    <div>
                      I'm looking for tips where the odds are between...
                    </div>
                    <Slide value="1" text="all games"></Slide>
                  </Fragment>
                </div>
              }
            />
          </Fragment>,
          document.getElementById("GeneratePredictions")
        );
      }

      // }
    }

    ReactDOM.render(
      <div>
        <div className="LoadingText"></div>
      </div>,
      document.getElementById("Loading")
    );

    async function updateResults(bool) {
      console.log("updating results");
      if (allLeagueResultsArrayOfObjects.length > 0 && bool === true) {
        await fetch(`${process.env.REACT_APP_EXPRESS_SERVER}results`, {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }).then(async () => {
          await fetch(`${process.env.REACT_APP_EXPRESS_SERVER}results`, {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify(allLeagueResultsArrayOfObjects),
          });
        });
      } else {
        console.log("EMPTY RESULTS");
      }
    }

    if (!isStoredLocally) {
      await fetch(`${process.env.REACT_APP_EXPRESS_SERVER}allForm/${date}`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ allForm }),
      });
      await updateResults(true);
    }
    if (!leaguesStored) {
      await fetch(
        `${process.env.REACT_APP_EXPRESS_SERVER}leagues/${todaysDate}`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ leagueArray }),
        }
      );
    }

    // const allFixtures = await RenderAllFixtures(matches, false)

    ReactDOM.render(
      <RenderAllFixtures matches={matches} result={false} bool={false} />,
      document.getElementById("FixtureContainer")
    );
    // ReactDOM.render(<RenderAllFixtures matches={matches} bool={false}/>),document.getElementById("FixtureContainer")
    setTimeout(() => {
      isFunctionRunning = false;
    }, 3000);
  }
}
