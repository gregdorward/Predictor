import React from "react";
import ReactDOM from "react-dom";
import { orderedLeagues } from "../App";
import { getForm, applyColour } from "./getForm";
import { Fixture } from "../components/Fixture";
import { Button } from "../components/Button";
import { getScorePrediction } from "../logic/getScorePredictions";
import { ThreeDots } from "react-loading-icons";
import { selectedOdds } from "../components/OddsRadio";
import LeagueTable from "../components/LeagueTable";

var oddslib = require("oddslib");

require("dotenv").config();

var fixtureResponse;
var fixtureArray;
export const matches = [];
export const resultedMatches = [];
var league;
var leagueGames = [];
export var leagueArray = [];
export let leagueInstance;
var lastFiveFormHome;
var lastFiveFormAway;
var lastSixFormHome;
var lastSixFormAway;
var lastTenFormHome;
var lastTenFormAway;

export const [currentDay, month, year] = new Date()
  .toLocaleDateString("en-US")
  .split("/");
let tomorrowsDate = new Date();
tomorrowsDate.setDate(new Date().getDate() + 1);
let [tomorrowDay, tomorrowMonth, tomorrowYear] = tomorrowsDate
  .toLocaleDateString("en-US")
  .split("/");

let yesterdaysDate = new Date();
yesterdaysDate.setDate(new Date().getDate() - 1);
let [yesterdayDay, yesterdayMonth, yesterdayYear] = yesterdaysDate
  .toLocaleDateString("en-US")
  .split("/");

// var prevSat = new Date();

// prevSat.setDate(prevSat.getDate() - (6-prevSat.getDay()))

// console.log(prevSat)

var d = new Date();

// set to Monday of this week
d.setDate(d.getDate() - ((d.getDay() + 6) % 7));

// set to Saturday just gone
d.setDate(d.getDate() - 2);

let [saturdayDay, saturdayMonth, saturdayYear] = d
  .toLocaleDateString("en-US")
  .split("/");

var historicDate = new Date();

// set to Monday of this week
historicDate.setDate(
  historicDate.getDate() - ((historicDate.getDay() + 6) % 7)
);

// set to Saturday prior to last
historicDate.setDate(historicDate.getDate() - 9);

let [historicDay, historicMonth, historicYear] = historicDate
  .toLocaleDateString("en-US")
  .split("/");

export const saturday = `${process.env.REACT_APP_EXPRESS_SERVER}matches/${saturdayYear}-${saturdayDay}-${saturdayMonth}`;
export const historic = `${process.env.REACT_APP_EXPRESS_SERVER}matches/${historicYear}-${historicDay}-${historicMonth}`;
export const yesterday = `${process.env.REACT_APP_EXPRESS_SERVER}matches/${yesterdayYear}-${yesterdayDay}-${yesterdayMonth}`;
export const today = `${process.env.REACT_APP_EXPRESS_SERVER}matches/${year}-${currentDay}-${month}`;
export const tomorrow = `${process.env.REACT_APP_EXPRESS_SERVER}matches/${tomorrowYear}-${tomorrowDay}-${tomorrowMonth}`;

export function getRadioState(state) {
  let radioState = state;
  return radioState;
}

export async function diff(a, b) {
  return parseFloat(a - b).toFixed(2);
}

export let allForm = [];
export let tableArray = [];
leagueInstance = [];

export async function generateTables() {
  leagueArray.forEach(function (league) {
    leagueInstance = [];
    if (!league.data.specific_tables[0].groups) {
      for (
        let index = 0;
        index < league.data.specific_tables[0].table.length;
        index++
      ) {
        let currentTeam = league.data.specific_tables[0].table[index];
        let last5 = currentTeam.wdl_record.slice(-5);
        let rawForm = last5.replace(/,/g, "").toUpperCase();
        let form = Array.from(rawForm);
        const team = {
          Position: index + 1,
          Name: currentTeam.cleanName,
          Played: currentTeam.matchesPlayed,
          Wins: currentTeam.seasonWins_overall,
          Draws: currentTeam.seasonDraws_overall,
          Losses: currentTeam.seasonLosses_overall,
          For: currentTeam.seasonGoals,
          Against:
            currentTeam.seasonConceded_home + currentTeam.seasonConceded_away,
          GoalDifference: currentTeam.seasonGoalDifference,
          Form: `${form[0]}${form[1]}${form[2]}${form[3]}${form[4]}`,
          Points: currentTeam.points,
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
          Position: index + 1,
          Name: currentTeam.cleanName,
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
        };
        leagueInstance.push(team);
      }
      tableArray.push(leagueInstance);
    }
  });
}

export async function renderTable(index) {
  let league = tableArray[index];
  if (league !== undefined) {
    ReactDOM.render(
      <LeagueTable Teams={league} Key={`League${index}`} />,
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

  if (selectedOdds === "Fractional") {
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
  } else if (selectedOdds === "Decimal") {
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

  match.fractionHome = homeFraction;
  match.fractionAway = awayFraction;

  match.bttsFraction = bttsFraction;

  match.game = match.homeTeam + " v " + match.awayTeam;

  if (mockBool !== true) {
    ReactDOM.render(
      <Fixture
        fixtures={matches}
        result={result}
        mock={mockBool}
        className={"individualFixture"}
      />,
      document.getElementById("FixtureContainer")
    );
  } else if (mockBool === true) {
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
}

var myHeaders = new Headers();
myHeaders.append("Origin", "https://gregdorward.github.io");

export async function generateFixtures(day, radioState, selectedOdds) {
  let url;
  switch (day) {
    case "lastSaturday":
      url = saturday;
      break;
    case "historic":
      url = historic;
      break;
    case "yesterdaysFixtures":
      url = yesterday;
      break;
    case "todaysFixtures":
      url = today;
      break;
    case "tomorrowsFixtures":
      url = tomorrow;
      break;
    default:
      break;
  }

  fixtureResponse = await fetch(url);

  await fixtureResponse.json().then((fixtures) => {
    fixtureArray = Array.from(fixtures.data);
  });

  let form;
  let formArray;
  var isFormStored;
  var isStoredLocally;
  let storedForm = await fetch(
    `${process.env.REACT_APP_EXPRESS_SERVER}form${day}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    }
  );
  if (storedForm.status === 201) {
    await storedForm.json().then((form) => {
      formArray = Array.from(form.allForm);
      isFormStored = true;
      isStoredLocally = false;
      allForm = formArray;
    });
  } else if (storedForm.status === 200) {
    await storedForm.json().then((form) => {
      formArray = Array.from(form.allForm);
      isFormStored = true;
      isStoredLocally = false;
      allForm = formArray;
    });
  } else {
    isFormStored = false;
    isStoredLocally = false;
  }

  ReactDOM.render(
    <div>
      <div className="LoadingText">Loading all league data</div>
      <ThreeDots height="3em" />
    </div>,
    document.getElementById("Buttons")
  );

  league = await fetch(
    `${process.env.REACT_APP_EXPRESS_SERVER}leagues/${currentDay}${month}${year}`
  );

  var leaguePositions = [];
  if (league.status === 200) {
    await league.json().then((leagues) => {
      leagueArray = Array.from(leagues.leagueArray);
    });
    generateTables(leagueArray);
  } else {
    for (let i = 0; i < orderedLeagues.length; i++) {
      league = await fetch(
        `${process.env.REACT_APP_EXPRESS_SERVER}tables/${orderedLeagues[i].element.id}/${currentDay}${month}${year}`
      );
      // eslint-disable-next-line no-loop-func
      await league.json().then((table) => {
        leagueArray.push(table);
      });
      generateTables(leagueArray);
    }
  }

  for (let i = 0; i < 35; i++) {
    for (
      let x = 0;
      x < leagueArray[i].data.all_matches_table_overall.length;
      x++
    ) {
      let string = leagueArray[i].data.all_matches_table_overall[x];
      let stringHome = leagueArray[i].data.all_matches_table_home[x];
      let stringAway = leagueArray[i].data.all_matches_table_away[x];

      leaguePositions.push({
        name: string.cleanName,
        position: string.position,
        rawPosition: x+1,
        homeFormName: stringHome.cleanName,
        awayFormName: stringAway.cleanName,
        homeSeasonWinPercentage: stringHome.seasonWins,
        awaySeasonWinPercentage: stringAway.seasonWins,
        homeSeasonLossPercentage: stringHome.seasonLosses_home,
        awaySeasonLossPercentage: stringAway.seasonLosses_away,
        homeSeasonDrawPercentage: stringHome.seasonDraws,
        awaySeasonDrawPercentage: stringAway.seasonDraws,
        homeSeasonMatchesPlayed: stringHome.matchesPlayed,
        awaySeasonMatchesPlayed: stringAway.matchesPlayed,
        ppg: string.ppg_overall,
      });
    }
  }
  console.log(leaguePositions)

  let previousLeagueName;

  for (let i = 0; i < orderedLeagues.length; i++) {
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
      let teamPositionPrefix;
      let homePrefix;
      let homePrefixHomeTable;
      let awayPrefix;
      let awayPrefixAwayTable;
      let homeSeasonPPG;
      let awaySeasonPPG;

      async function getPrefix(position) {
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

      try {
        homeTeaminLeague = leaguePositions.find(
          (team) => team.name === match.homeTeam
        );

        let homeTeaminHomeLeague = leaguePositions.find(
          (team) => team.homeFormName === match.homeTeam
        );

        console.log(homeTeaminHomeLeague)
        teamPositionHome = homeTeaminLeague.position;
        teamPositionHomeTable = homeTeaminHomeLeague.position;

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

        console.log(teamPositionAwayTable);

        awayPrefix = await getPrefix(teamPositionAway);
        awayPrefixAwayTable = await getPrefix(teamPositionAwayTable);

        awaySeasonPPG = awayTeaminLeague.ppg.toFixed(2);
      } catch (error) {
        console.log(error);
        teamPositionAway = "N/A";
        awayPrefix = "";
        awaySeasonPPG = "N/A";
      }

      if (!isFormStored) {
        form = await getForm(match);

        // if (
        //   form[0].data[0].stats.additional_info &&
        //   form[1].data[0].stats.additional_info
        // ) {

        //   //get the last 5 games stats from a big block of text
        //   var homeExtract = form[0].data[0].stats.additional_info.replace(
        //     /["']/g,
        //     ""
        //   );

        //   var slug = homeExtract.split(",53:").pop().toUpperCase();
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
        lastFiveFormHome = Array.from(homeFormString5);
        lastSixFormHome = Array.from(homeFormString6);
        lastTenFormHome = Array.from(homeFormString10);
        lastFiveFormAway = Array.from(awayFormString5);
        lastSixFormAway = Array.from(awayFormString6);
        lastTenFormAway = Array.from(awayFormString10);

        if (teamPositionHome === 0) {
          teamPositionHome = "N/A";
          teamPositionHomeTable = "N/A";
          homePrefix = "";
          homePrefixHomeTable = "";
        }

        if (teamPositionAway === 0) {
          teamPositionAway = "N/A";
          teamPositionAwayTable = "N/A";
          awayPrefix = "";
          awayPrefixAwayTable = "";
        }
        // } else {
        //   lastFiveFormHome = "N/A"
        //   lastFiveFormAway = "N/A"
        // }

        console.log(form[0].data[2].stats)

        allForm.push({
          id: match.id,
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
                form[0].data[0].stats.seasonCSPercentage_home
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
              PPG: parseFloat(form[0].data[0].stats.seasonPPG_home),
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
              LastFiveForm: lastFiveFormHome,
              LastSixForm: lastSixFormHome,
              LastTenForm: lastTenFormHome,
              LeaguePosition: `${teamPositionHome}${homePrefix}`,
              homeRawPosition: homeTeaminLeague.rawPosition,
              homeTeamHomePositionRaw: teamPositionHomeTable,
              SeasonPPG: homeSeasonPPG,
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
                form[0].data[1].stats.seasonCSPercentage_home
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
              PPG: parseFloat(form[0].data[1].stats.seasonPPG_home),
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
              LastFiveForm: lastFiveFormHome,
              LastSixForm: lastSixFormHome,
              LastTenForm: lastTenFormHome,
              LeaguePosition: `${teamPositionHome}${homePrefix}`,
              homeRawPosition: homeTeaminLeague.rawPosition,
              homeTeamHomePositionRaw: teamPositionHomeTable,
              SeasonPPG: homeSeasonPPG,
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
                form[0].data[2].stats.seasonCSPercentage_home
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
              PPG: parseFloat(form[0].data[2].stats.seasonPPG_home),
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
              LastFiveForm: lastFiveFormHome,
              LastSixForm: lastSixFormHome,
              LastTenForm: lastTenFormHome,
              LeaguePosition: `${teamPositionHome}${homePrefix}`,
              homeRawPosition: homeTeaminLeague.rawPosition,
              homeTeamHomePositionRaw: teamPositionHomeTable,
              SeasonPPG: homeSeasonPPG,
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
                form[1].data[0].stats.seasonCSPercentage_away
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
              PPG: parseFloat(form[1].data[0].stats.seasonPPG_away),
              AttacksAverage: parseFloat(
                form[1].data[0].stats.attacks_avg_away
              ),
              AverageDangerousAttacks: parseFloat(
                form[1].data[0].stats.dangerous_attacks_avg_away
              ),
              BTTSPercentage: parseInt(
                form[0].data[0].stats.seasonBTTSPercentage_away
              ),
              LastFiveForm: lastFiveFormAway,
              LastSixForm: lastSixFormAway,
              LastTenForm: lastTenFormAway,
              LeaguePosition: `${teamPositionAway}${awayPrefix}`,
              awayRawPosition: awayTeaminLeague.rawPosition,
              awayTeamAwayPositionRaw: teamPositionAwayTable,
              SeasonPPG: awaySeasonPPG,
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
                form[1].data[1].stats.seasonCSPercentage_away
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
              PPG: parseFloat(form[1].data[1].stats.seasonPPG_away),
              AttacksAverage: parseFloat(
                form[1].data[1].stats.attacks_avg_away
              ),
              AverageDangerousAttacks: parseFloat(
                form[1].data[1].stats.dangerous_attacks_avg_away
              ),
              BTTSPercentage: parseInt(
                form[0].data[1].stats.seasonBTTSPercentage_away
              ),
              LastFiveForm: lastFiveFormAway,
              LastSixForm: lastSixFormAway,
              LastTenForm: lastTenFormAway,
              LeaguePosition: `${teamPositionAway}${awayPrefix}`,
              awayRawPosition: awayTeaminLeague.rawPosition,
              awayTeamAwayPositionRaw: teamPositionAwayTable,
              SeasonPPG: awaySeasonPPG,
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
                form[1].data[2].stats.seasonCSPercentage_away
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
              PPG: parseFloat(form[1].data[2].stats.seasonPPG_away),
              AttacksAverage: parseFloat(
                form[1].data[2].stats.attacks_avg_away
              ),
              AverageDangerousAttacks: parseFloat(
                form[1].data[2].stats.dangerous_attacks_avg_away
              ),
              BTTSPercentage: parseInt(
                form[0].data[2].stats.seasonBTTSPercentage_away
              ),
              LastFiveForm: lastFiveFormAway,
              LastSixForm: lastSixFormAway,
              LastTenForm: lastTenFormAway,
              LeaguePosition: `${teamPositionAway}${awayPrefix}`,
              awayRawPosition: awayTeaminLeague.rawPosition,
              awayTeamAwayPositionRaw: teamPositionAwayTable,
              SeasonPPG: awaySeasonPPG,
            },
          },
        });
      }

      match.homeBadge = fixture.home_image;
      match.awayBadge = fixture.away_image;

      

      match.homePpg = fixture.home_ppg.toFixed(2);
      match.homeFormColour = await applyColour(match.homePpg);

      match.awayPpg = fixture.away_ppg.toFixed(2);
      match.awayFormColour = await applyColour(match.awayPpg);

      match.lastFiveFormHome = lastFiveFormHome;
      match.lastFiveFormAway = lastFiveFormAway;
      match.homeRawPosition = homeTeaminLeague.rawPosition
      match.awayRawPosition = awayTeaminLeague.rawPosition

      match.homeTeamHomePosition = `${teamPositionHomeTable}${homePrefixHomeTable}`;
      match.awayTeamAwayPosition = `${teamPositionAwayTable}${awayPrefixAwayTable}`;

      match.homeTeamHomePositionRaw = teamPositionHomeTable
      match.awayTeamAwayPositionRaw = teamPositionAwayTable


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

      console.log(match)
      console.log(fixture)


      if (match.status !== "canceled" || match.status !== "suspended") {
        matches.push(match);
        await createFixture(match, false);
      }

      console.log(allForm)
    }
    // }
    ReactDOM.render(
      <Button
        text={"Generate predictions"}
        onClickEvent={() => getScorePrediction(day)}
      />,
      document.getElementById("Buttons")
    );
  }
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
