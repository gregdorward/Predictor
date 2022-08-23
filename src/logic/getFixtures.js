import React from "react";
import ReactDOM from "react-dom";
import { orderedLeagues } from "../App";
import { getForm } from "./getForm";
import { Fixture } from "../components/Fixture";
import { Button } from "../components/Button";
import { getScorePrediction } from "../logic/getScorePredictions";
import { ThreeDots } from "react-loading-icons";
import { selectedOdds } from "../components/OddsRadio";
import LeagueTable from "../components/LeagueTable";

var oddslib = require("oddslib");

// require("dotenv").config();

var fixtureResponse;
var fixtureArray = [];
export var matches = [];
export var resultedMatches = [];
var league;
var leagueID;
var leagueGames = [];
export var leagueArray = [];
var leagueIdArray = [];
export var leagueStatsArray = [];
export let leagueInstance;
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

export var [currentDay, month, year] = new Date()
  .toLocaleDateString("en-US", { timeZone: "Europe/London" })
  .split("/");

export async function diff(a, b) {
  return parseFloat(a - b).toFixed(2);
}

export let allForm = [];
export let tableArray = [];
leagueInstance = [];

async function convertTimestamp(timestamp) {
  let newDate = new Date(timestamp * 1000);
  let [day, month, year] = newDate.toLocaleDateString("en-US").split("/");

  let converted = `${year}-${day}-${month}`;

  return converted;
}

export async function generateTables(a, leagueIdArray) {
  // leagueIdArray = [];
  tableArray = [];
  let i = 0;
  leagueArray.forEach(function (league) {
    let currentLeagueId = leagueIdArray[i];
    i++;
    console.log(i);
    leagueInstance = [];
    //Skip MLS which has a weird format
    if (!league.data.specific_tables[0].groups && currentLeagueId !== 6969) {
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
          Points: currentTeam.points,
          wdl: currentTeam.wdl_record,
          seasonGoals: currentTeam.seasonGoals,
          seasonConceded: currentTeam.seasonConceded,
        };
        leagueInstance.push(team);
      }
      tableArray.push(leagueInstance);
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
          Points: currentTeam.points,
          wdl: currentTeam.wdl_record,
          seasonGoals: currentTeam.seasonGoals,
          seasonConceded: currentTeam.seasonConceded,
        };
        leagueInstance.push(team);
      }
      tableArray.push(leagueInstance);
    }
  });
}

export async function renderTable(index) {
  let league = tableArray[index];
  let statistics;
  let leagueStatistics = await fetch(
    `${process.env.REACT_APP_EXPRESS_SERVER}leagueStats/${league[0].LeagueID}`
  );
  await leagueStatistics.json().then((stats) => {
    statistics = stats.data;
  });

  console.log(statistics);

  if (league !== undefined) {
    ReactDOM.render(
      <LeagueTable
        Teams={league}
        Stats={statistics}
        Key={`League${index}`}
        GamesPlayed={statistics.game_week}
      />,
      document.getElementById(`leagueName${index}`)
    );
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

  ReactDOM.render(
    <Fixture
      fixtures={matches}
      result={result}
      mock={mockBool}
      className={"individualFixture"}
    />,
    document.getElementById("FixtureContainer")
  );
}

var myHeaders = new Headers();
myHeaders.append("Origin", "https://gregdorward.github.io");

export async function generateFixtures(day, radioState, selectedOdds) {
  //cleanup if different day is selected
  ReactDOM.render(<div></div>, document.getElementById("GeneratePredictions"));
  ReactDOM.render(<div></div>, document.getElementById("successMeasure2"));
  ReactDOM.render(<div></div>, document.getElementById("bestPredictions"));
  ReactDOM.render(<div></div>, document.getElementById("exoticOfTheDay"));
  ReactDOM.render(<div></div>, document.getElementById("insights"));
  ReactDOM.render(<div></div>, document.getElementById("longShots"));
  ReactDOM.render(<div></div>, document.getElementById("BTTS"));
  ReactDOM.render(<div></div>, document.getElementById("draws"));

  [currentDay, month, year] = new Date()
    .toLocaleDateString("en-US", { timeZone: "Europe/London" })
    .split("/");

  let tomorrowsDate = new Date();
  tomorrowsDate.setDate(new Date().getDate() + 1);
  let [tomorrowDay, tomorrowMonth, tomorrowYear] = tomorrowsDate
    .toLocaleDateString("en-US", { timeZone: "Europe/London" })
    .split("/");

  console.log(tomorrowMonth);

  let yesterdaysDate = new Date();
  yesterdaysDate.setDate(new Date().getDate() - 1);
  let [yesterdayDay, yesterdayMonth, yesterdayYear] = yesterdaysDate
    .toLocaleDateString("en-US", { timeZone: "Europe/London" })
    .split("/");

  let d = new Date();
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  d.setDate(d.getDate() - 2);
  d.toLocaleDateString("en-US", { timeZone: "Europe/London" });

  let [saturdayDay, saturdayMonth, saturdayYear] = d
    .toLocaleDateString("en-US", { timeZone: "Europe/London" })
    .split("/");

  let historicDate = new Date();
  historicDate.setDate(
    historicDate.getDate() - ((historicDate.getDay() + 6) % 7)
  );
  historicDate.setDate(historicDate.getDate() - 9);
  let [historicDay, historicMonth, historicYear] = historicDate
    .toLocaleDateString("en-US", { timeZone: "Europe/London" })
    .split("/");

  const saturday = `${process.env.REACT_APP_EXPRESS_SERVER}matches/${saturdayYear}-${saturdayDay}-${saturdayMonth}`;
  const historic = `${process.env.REACT_APP_EXPRESS_SERVER}matches/${historicYear}-${historicDay}-${historicMonth}`;
  const yesterday = `${process.env.REACT_APP_EXPRESS_SERVER}matches/${yesterdayYear}-${yesterdayDay}-${yesterdayMonth}`;
  const today = `${process.env.REACT_APP_EXPRESS_SERVER}matches/${year}-${currentDay}-${month}`;
  const tomorrow = `${process.env.REACT_APP_EXPRESS_SERVER}matches/${tomorrowYear}-${tomorrowDay}-${tomorrowMonth}`;

  matches = [];
  fixtureArray = [];

  let url;
  switch (day) {
    case "lastSaturday":
      url = saturday;
      league = await fetch(
        `${process.env.REACT_APP_EXPRESS_SERVER}leagues/${saturdayDay}${saturdayMonth}${saturdayYear}`
      );
      break;
    case "historic":
      url = historic;
      league = await fetch(
        `${process.env.REACT_APP_EXPRESS_SERVER}leagues/${historicDay}${historicMonth}${historicYear}`
      );
      break;
    case "yesterdaysFixtures":
      url = yesterday;
      currentDay = yesterdayDay;
      league = await fetch(
        `${process.env.REACT_APP_EXPRESS_SERVER}leagues/${yesterdayDay}${yesterdayMonth}${yesterdayYear}`
      );
      break;
    case "todaysFixtures":
      url = today;
      league = await fetch(
        `${process.env.REACT_APP_EXPRESS_SERVER}leagues/${currentDay}${month}${year}`
      );
      break;
    case "tomorrowsFixtures":
      url = tomorrow;
      league = await fetch(
        `${process.env.REACT_APP_EXPRESS_SERVER}leagues/${currentDay}${month}${year}`
      );
      break;
    default:
      break;
  }

  ReactDOM.render(<div></div>, document.getElementById("FixtureContainer"));

  fixtureResponse = await fetch(url);

  await fixtureResponse.json().then((fixtures) => {
    fixtureArray = Array.from(fixtures.data);
  });

  let form;
  let formArray = [];
  var isFormStored;
  var isStoredLocally;
  var leaguesStored = false;
  let storedForm = await fetch(
    `${process.env.REACT_APP_EXPRESS_SERVER}form${day}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    }
  );
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

  ReactDOM.render(
    <div>
      <div className="LoadingText">Loading all league, fixture & form data</div>
      <ThreeDots height="3em" fill="#030061" />
    </div>,
    document.getElementById("Loading")
  );

  leagueIdArray = [];
  for (let i = 0; i < orderedLeagues.length; i++) {
    leagueID = orderedLeagues[i].element.id;
    leagueIdArray.push(leagueID);
  }

  var leaguePositions = [];
  if (league.status === 200) {
    await league.json().then((leagues) => {
      console.log(leagues);
      leagueArray = Array.from(leagues.leagueArray);
    });
    leaguesStored = true;
    console.log("EXECUTING 1");
    generateTables(leagueArray, leagueIdArray);
  } else {
    for (let i = 0; i < orderedLeagues.length; i++) {
      league = await fetch(
        `${process.env.REACT_APP_EXPRESS_SERVER}tables/${orderedLeagues[i].element.id}/${currentDay}${month}${year}`
      );
      // eslint-disable-next-line no-loop-func
      await league.json().then((table) => {
        leagueArray.push(table);
      });
      leaguesStored = false;
      console.log("EXECUTING 2");
    }
    generateTables(leagueArray, leagueIdArray);
  }

  let teamPositionPrefix;

  async function getPrefix(position) {
    console.log("PREFIX FUNCTION");
    switch (position) {
      case 1:
      case 21:
      case 31:
        teamPositionPrefix = "st";
        break;
      case 2:
      case 22:
      case 32:
        teamPositionPrefix = "nd";
        break;
      case 3:
      case 23:
      case 33:
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
        teamPositionPrefix = "th";
        break;
      default:
        break;
    }
    return teamPositionPrefix;
  }

  for (let i = 0; i < leagueArray.length; i++) {
    for (
      let x = 0;
      x < leagueArray[i].data.all_matches_table_overall.length;
      x++
    ) {
      let regularSeason = leagueArray[i].data.specific_tables.find(
        (season) =>
          season.round === "Regular Season" ||
          season.round === "2022" ||
          season.round === "2022/2023" ||
          season.round === "Apertura"
      );
      let string;

      if (regularSeason !== undefined && regularSeason.table) {
        string = regularSeason.table[x];
      } else {
        string = leagueArray[i].data.all_matches_table_overall[x];
      }

      let stringHome = leagueArray[i].data.all_matches_table_home[x];
      let stringAway = leagueArray[i].data.all_matches_table_away[x];

      leaguePositions.push({
        name: string.cleanName,
        position: string.position,
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
        seasonGoals: string.seasonGoals,
        seasonConceded: string.seasonConceded,
      });
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
        match.leagueIndex = i;
      } else {
        match.leagueName = null;
      }
      match.id = fixture.id;
      match.competition_id = fixture.competition_id;
      match.time = dateObject.toLocaleString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      });
      match.homeTeam = fixture.home_name;
      match.awayTeam = fixture.away_name;
      match.homeOdds = fixture.odds_ft_1;
      match.awayOdds = fixture.odds_ft_2;
      match.drawOdds = fixture.odds_ft_x;
      match.homeDoubleChance = fixture.odds_doublechance_1x;
      match.awayDoubleChance = fixture.odds_doublechance_x2;
      match.bttsOdds = fixture.odds_btts_yes;
      match.homeId = fixture.homeID;
      match.awayId = fixture.awayID;
      match.form = [];
      match.homeTeamInfo = [];
      match.awayTeamInfo = [];
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

        let homeTeaminHomeLeague = leaguePositions.find(
          (team) => team.homeFormName === match.homeTeam
        );

        teamPositionHome = homeTeaminLeague.position;
        teamPositionHomeTable = homeTeaminHomeLeague.position;

        WDLinLeagueHome = Array.from(homeTeaminLeague.wdl.toUpperCase());
        HomeAverageGoals =
          homeTeaminLeague.seasonGoals /
          homeTeaminLeague.homeSeasonMatchesPlayed;
        HomeAverageConceded =
          homeTeaminLeague.seasonConceded /
          homeTeaminLeague.homeSeasonMatchesPlayed;

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
          awayTeaminLeague.seasonGoals /
          awayTeaminLeague.awaySeasonMatchesPlayed;
        AwayAverageConceded =
          awayTeaminLeague.seasonConceded /
          awayTeaminLeague.awaySeasonMatchesPlayed;

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

        if (WDLinLeagueHome.length > 10) {
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
        } else if (WDLinLeagueHome.length > 6) {
          lastFiveFormHome = WDLinLeagueHome.slice(-5);
          lastSixFormHome = WDLinLeagueHome.slice(-6);
          lastFiveFormAway = WDLinLeagueAway.slice(-5);
          lastSixFormAway = WDLinLeagueAway.slice(-6);
          leagueOrAll = "League";

          homeAverageGoals = HomeAverageGoals;
          homeAverageConceded = HomeAverageConceded;
          awayAverageGoals = AwayAverageGoals;
          awayAverageConceded = AwayAverageConceded;
        } else if (WDLinLeagueHome.length > 5) {
          lastFiveFormHome = WDLinLeagueHome.slice(-5);
          lastFiveFormAway = WDLinLeagueAway.slice(-5);
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
          formRunHome = Array.from(homeFormRun);
          formRunAway = Array.from(awayFormRun);
          leagueOrAll = "All";

          homeAverageGoals = undefined;
          homeAverageConceded = undefined;
          awayAverageGoals = undefined;
          awayAverageConceded = undefined;
        }

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
          home: {
            teamName: match.homeTeam,
            0: {
              XGOverall: parseFloat(form[0].data[0].stats.xg_for_avg_overall),
              XG: parseFloat(form[0].data[0].stats.xg_for_avg_home),
              ScoredOverall: parseFloat(
                form[0].data[0].stats.seasonScoredNum_overall
              ),
              ScoredAverage: parseFloat(
                form[0].data[0].stats.seasonScoredAVG_home
              ),
              PlayedHome: parseFloat(
                form[0].data[0].stats.seasonMatchesPlayed_home
              ),
              PlayedAway: parseFloat(
                form[0].data[0].stats.seasonMatchesPlayed_away
              ),
              ConcededOverall: parseFloat(
                form[0].data[0].stats.seasonConcededNum_overall
              ),
              ConcededAverage: parseFloat(
                form[0].data[0].stats.seasonConcededAVG_home
              ),
              XGAgainstAvgOverall: parseFloat(
                form[0].data[0].stats.xg_against_avg_overall
              ),
              XGAgainstAverage: parseFloat(
                form[0].data[0].stats.xg_against_avg_home
              ),
              CleanSheetPercentage: parseFloat(
                form[0].data[0].stats.seasonCSPercentage_overall
              ),
              AveragePossessionOverall: parseFloat(
                form[0].data[0].stats.possessionAVG_overall
              ),
              AveragePossession: parseFloat(
                form[0].data[0].stats.possessionAVG_home
              ),
              AverageShotsOnTargetOverall: parseFloat(
                form[0].data[0].stats.shotsOnTargetAVG_overall
              ),
              AverageShotsOnTarget: parseFloat(
                form[0].data[0].stats.shotsOnTargetAVG_home
              ),
              AverageDangerousAttacksOverall: parseFloat(
                form[0].data[0].stats.dangerous_attacks_avg_overall
              ),
              PPG: parseFloat(form[0].data[0].stats.seasonPPG_overall),
              AttacksHome: parseFloat(form[0].data[0].stats.attacks_avg_home),
              AttacksAway: parseFloat(form[0].data[0].stats.attacks_avg_away),
              AverageDangerousAttacks: parseFloat(
                form[0].data[0].stats.dangerous_attacks_avg_home
              ),
              homeAttackAdvantage: parseFloat(
                form[0].data[0].stats.homeAttackAdvantage
              ),
              homeDefenceAdvantage: parseFloat(
                form[0].data[0].stats.homeDefenceAdvantage
              ),
              BTTSPercentage: parseInt(
                form[0].data[0].stats.seasonBTTSPercentage_home
              ),
              lastThreeForm: lastThreeFormHome,
              LastFiveForm: lastFiveFormHome,
              LastSixForm: lastSixFormHome,
              LastTenForm: lastTenFormHome,
              LeagueOrAll: leagueOrAll,
              LeaguePosition: `${teamPositionHome}${homePrefix}`,
              homeRawPosition: homeTeaminLeague.rawPosition
                ? homeTeaminLeague.rawPosition
                : 0,
              homeTeamHomePositionRaw: teamPositionHomeTable,
              SeasonPPG: homeSeasonPPG,
              LeagueAverageGoals: homeAverageGoals,
              LeagueAverageConceded: homeAverageConceded,
            },
            1: {
              XGOverall: parseFloat(form[0].data[1].stats.xg_for_avg_overall),
              XG: parseFloat(form[0].data[1].stats.xg_for_avg_home),
              ScoredOverall: parseFloat(
                form[0].data[1].stats.seasonScoredNum_overall
              ),
              ScoredAverage: parseFloat(
                form[0].data[1].stats.seasonScoredAVG_home
              ),
              PlayedHome: parseFloat(
                form[0].data[1].stats.seasonMatchesPlayed_home
              ),
              PlayedAway: parseFloat(
                form[0].data[1].stats.seasonMatchesPlayed_away
              ),
              ConcededOverall: parseFloat(
                form[0].data[1].stats.seasonConcededNum_overall
              ),
              ConcededAverage: parseFloat(
                form[0].data[1].stats.seasonConcededAVG_home
              ),
              XGAgainstAvgOverall: parseFloat(
                form[0].data[1].stats.xg_against_avg_overall
              ),
              XGAgainstAverage: parseFloat(
                form[0].data[1].stats.xg_against_avg_home
              ),
              CleanSheetPercentage: parseFloat(
                form[0].data[1].stats.seasonCSPercentage_overall
              ),
              AveragePossessionOverall: parseFloat(
                form[0].data[1].stats.possessionAVG_overall
              ),
              AveragePossession: parseFloat(
                form[0].data[1].stats.possessionAVG_home
              ),
              AverageShotsOnTargetOverall: parseFloat(
                form[0].data[1].stats.shotsOnTargetAVG_overall
              ),
              AverageShotsOnTarget: parseFloat(
                form[0].data[1].stats.shotsOnTargetAVG_home
              ),
              AverageDangerousAttacksOverall: parseFloat(
                form[0].data[1].stats.dangerous_attacks_avg_overall
              ),
              PPG: parseFloat(form[0].data[1].stats.seasonPPG_overall),
              AttacksHome: parseFloat(form[0].data[1].stats.attacks_avg_home),
              AttacksAway: parseFloat(form[0].data[1].stats.attacks_avg_away),
              AverageDangerousAttacks: parseFloat(
                form[0].data[1].stats.dangerous_attacks_avg_home
              ),
              homeAttackAdvantage: parseFloat(
                form[0].data[1].stats.homeAttackAdvantage
              ),
              homeDefenceAdvantage: parseFloat(
                form[0].data[1].stats.homeDefenceAdvantage
              ),
              BTTSPercentage: parseInt(
                form[0].data[1].stats.seasonBTTSPercentage_home
              ),
              lastThreeForm: lastThreeFormHome,
              LastFiveForm: lastFiveFormHome,
              LastSixForm: lastSixFormHome,
              LastTenForm: lastTenFormHome,
              LeagueOrAll: leagueOrAll,
              LeaguePosition: `${teamPositionHome}${homePrefix}`,
              homeRawPosition: homeTeaminLeague.rawPosition
                ? homeTeaminLeague.rawPosition
                : 0,
              homeTeamHomePositionRaw: teamPositionHomeTable,
              SeasonPPG: homeSeasonPPG,
              LeagueAverageGoals: homeAverageGoals,
              LeagueAverageConceded: homeAverageConceded,
            },
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
              lastThreeForm: lastThreeFormHome,
              LastFiveForm: lastFiveFormHome,
              LastSixForm: lastSixFormHome,
              LastTenForm: lastTenFormHome,
              LeagueOrAll: leagueOrAll,
              LeaguePosition: `${teamPositionHome}${homePrefix}`,
              homeRawPosition: homeTeaminLeague.rawPosition
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
            0: {
              XGOverall: parseFloat(form[1].data[0].stats.xg_for_avg_overall),
              XG: parseFloat(form[1].data[0].stats.xg_for_avg_away),
              ScoredOverall: parseFloat(
                form[1].data[0].stats.seasonScoredNum_overall
              ),
              ScoredAverage: parseFloat(
                form[1].data[0].stats.seasonScoredAVG_away
              ),
              PlayedHome: parseFloat(
                form[1].data[0].stats.seasonMatchesPlayed_home
              ),
              PlayedAway: parseFloat(
                form[1].data[0].stats.seasonMatchesPlayed_away
              ),
              ConcededOverall: parseFloat(
                form[1].data[0].stats.seasonConcededNum_overall
              ),
              ConcededAverage: parseFloat(
                form[1].data[0].stats.seasonConcededAVG_away
              ),
              XGAgainstAvgOverall: parseFloat(
                form[1].data[0].stats.xg_against_avg_overall
              ),
              XGAgainstAverage: parseFloat(
                form[1].data[0].stats.xg_against_avg_away
              ),
              CleanSheetPercentage: parseFloat(
                form[1].data[0].stats.seasonCSPercentage_overall
              ),
              AveragePossessionOverall: parseFloat(
                form[1].data[0].stats.possessionAVG_overall
              ),
              AveragePossession: parseFloat(
                form[1].data[0].stats.possessionAVG_away
              ),
              AverageShotsOnTargetOverall: parseFloat(
                form[1].data[0].stats.shotsOnTargetAVG_overall
              ),
              AverageShotsOnTarget: parseFloat(
                form[1].data[0].stats.shotsOnTargetAVG_away
              ),
              AverageDangerousAttacksOverall: parseFloat(
                form[1].data[0].stats.dangerous_attacks_avg_overall
              ),
              PPG: parseFloat(form[1].data[0].stats.seasonPPG_overall),
              AttacksAverage: parseFloat(
                form[1].data[0].stats.attacks_avg_away
              ),
              AverageDangerousAttacks: parseFloat(
                form[1].data[0].stats.dangerous_attacks_avg_away
              ),
              BTTSPercentage: parseInt(
                form[1].data[0].stats.seasonBTTSPercentage_away
              ),
              lastThreeForm: lastThreeFormAway,
              LastFiveForm: lastFiveFormAway,
              LastSixForm: lastSixFormAway,
              LastTenForm: lastTenFormAway,
              LeagueOrAll: leagueOrAll,
              LeaguePosition: `${teamPositionAway}${awayPrefix}`,
              awayRawPosition: awayTeaminLeague.rawPosition
                ? awayTeaminLeague.rawPosition
                : 0,
              awayTeamAwayPositionRaw: teamPositionAwayTable,
              SeasonPPG: awaySeasonPPG,
              LeagueAverageGoals: awayAverageGoals,
              LeagueAverageConceded: awayAverageConceded,
            },
            1: {
              XGOverall: parseFloat(form[1].data[1].stats.xg_for_avg_overall),
              XG: parseFloat(form[1].data[1].stats.xg_for_avg_away),
              ScoredOverall: parseFloat(
                form[1].data[1].stats.seasonScoredNum_overall
              ),
              ScoredAverage: parseFloat(
                form[1].data[1].stats.seasonScoredAVG_away
              ),
              PlayedHome: parseFloat(
                form[1].data[1].stats.seasonMatchesPlayed_home
              ),
              PlayedAway: parseFloat(
                form[1].data[1].stats.seasonMatchesPlayed_away
              ),
              ConcededOverall: parseFloat(
                form[1].data[1].stats.seasonConcededNum_overall
              ),
              ConcededAverage: parseFloat(
                form[1].data[1].stats.seasonConcededAVG_away
              ),
              XGAgainstAvgOverall: parseFloat(
                form[1].data[1].stats.xg_against_avg_overall
              ),
              XGAgainstAverage: parseFloat(
                form[1].data[1].stats.xg_against_avg_away
              ),
              CleanSheetPercentage: parseFloat(
                form[1].data[1].stats.seasonCSPercentage_overall
              ),
              AveragePossessionOverall: parseFloat(
                form[1].data[1].stats.possessionAVG_overall
              ),
              AveragePossession: parseFloat(
                form[1].data[1].stats.possessionAVG_away
              ),
              AverageShotsOnTargetOverall: parseFloat(
                form[1].data[1].stats.shotsOnTargetAVG_overall
              ),
              AverageShotsOnTarget: parseFloat(
                form[1].data[1].stats.shotsOnTargetAVG_away
              ),
              AverageDangerousAttacksOverall: parseFloat(
                form[1].data[1].stats.dangerous_attacks_avg_overall
              ),
              PPG: parseFloat(form[1].data[1].stats.seasonPPG_overall),
              AttacksAverage: parseFloat(
                form[1].data[1].stats.attacks_avg_away
              ),
              AverageDangerousAttacks: parseFloat(
                form[1].data[1].stats.dangerous_attacks_avg_away
              ),
              BTTSPercentage: parseInt(
                form[1].data[1].stats.seasonBTTSPercentage_away
              ),
              lastThreeForm: lastThreeFormAway,
              LastFiveForm: lastFiveFormAway,
              LastSixForm: lastSixFormAway,
              LastTenForm: lastTenFormAway,
              LeagueOrAll: leagueOrAll,
              LeaguePosition: `${teamPositionAway}${awayPrefix}`,
              awayRawPosition: awayTeaminLeague.rawPosition
                ? awayTeaminLeague.rawPosition
                : 0,
              awayTeamAwayPositionRaw: teamPositionAwayTable,
              SeasonPPG: awaySeasonPPG,
              LeagueAverageGoals: awayAverageGoals,
              LeagueAverageConceded: awayAverageConceded,
            },
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
              lastThreeForm: lastThreeFormAway,
              LastFiveForm: lastFiveFormAway,
              LastSixForm: lastSixFormAway,
              LastTenForm: lastTenFormAway,
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
    // }
    ReactDOM.render(
      <Button
        text={"Generate predictions"}
        onClickEvent={() => getScorePrediction(day)}
      />,
      document.getElementById("GeneratePredictions")
    );
  }

  ReactDOM.render(
    <div>
      <div className="LoadingText"></div>
    </div>,
    document.getElementById("Loading")
  );

  if (!isStoredLocally) {
    await fetch(`${process.env.REACT_APP_EXPRESS_SERVER}allForm${day}`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ allForm }),
    });
  }

  if (!leaguesStored) {
    await fetch(
      `${process.env.REACT_APP_EXPRESS_SERVER}leagues/${currentDay}${month}${year}`,
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
}
