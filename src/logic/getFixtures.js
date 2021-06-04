import React from "react";
import ReactDOM from "react-dom";
import { orderedLeagues, proxyurl } from "../App";
import { getForm, applyColour } from "./getForm";
import { Fixture } from "../components/Fixture";
import { Button } from "../components/Button";
import { getScorePrediction } from "../logic/getScorePredictions";
import { ThreeDots } from "react-loading-icons";
import { selectedOdds } from "../components/OddsRadio";
var oddslib = require("oddslib");

require("dotenv").config();

var fixtureResponse;
var fixtureArray;
export const matches = [];
export const resultedMatches = [];
var league;
var leagueGames = [];
export var leagueArray = [];
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
let [
  tomorrowDay,
  tomorrowMonth,
  tomorrowYear,
] = tomorrowsDate.toLocaleDateString("en-US").split("/");

let yesterdaysDate = new Date();
yesterdaysDate.setDate(new Date().getDate() - 1);
let [
  yesterdayDay,
  yesterdayMonth,
  yesterdayYear,
] = yesterdaysDate.toLocaleDateString("en-US").split("/");

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

  console.log(selectedOdds);

  await fixtureResponse.json().then((fixtures) => {
    fixtureArray = Array.from(fixtures.data);
    console.log(fixtureArray);
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
  } else {
    for (let i = 0; i < orderedLeagues.length; i++) {
      league = await fetch(
        `${process.env.REACT_APP_EXPRESS_SERVER}tables/${orderedLeagues[i].element.id}/${currentDay}${month}${year}`
      );
      // eslint-disable-next-line no-loop-func
      await league.json().then((table) => {
        leagueArray.push(table);
      });
    }
  }

  for (let i = 0; i < 20; i++) {
    for (
      let x = 0;
      x < leagueArray[i].data.all_matches_table_overall.length;
      x++
    ) {
      let string = leagueArray[i].data.all_matches_table_overall[x];

      leaguePositions.push({
        name: string.cleanName,
        position: string.position,
        ppg: string.ppg_overall,
      });
    }
  }

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
      } else {
        match.leagueName = "";
      }
      match.id = fixture.id;
      match.competition_id = fixture.competition_id;
      match.time = dateObject.toLocaleString("en-US", { hour: "numeric" });
      match.homeTeam = fixture.home_name;
      match.awayTeam = fixture.away_name;
      match.homeOdds = fixture.odds_ft_1;
      match.awayOdds = fixture.odds_ft_2;
      match.drawOdds = fixture.odds_ft_x;
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
      let teamPositionAway;
      let teamPositionPrefix;
      let homePrefix;
      let awayPrefix;
      let homeSeasonPPG;
      let awaySeasonPPG;

      async function getPrefix(position) {
        switch (position) {
          case 1:
          case 21:
            teamPositionPrefix = "st";
            break;
          case 2:
          case 22:
            teamPositionPrefix = "nd";
            break;
          case 3:
          case 23:
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
        teamPositionHome = homeTeaminLeague.position;
        homePrefix = await getPrefix(teamPositionHome);
        homeSeasonPPG = homeTeaminLeague.ppg.toFixed(2);
      } catch (error) {
        console.log(error);
        teamPositionHome = "N/A";
        homePrefix = "";
        homeSeasonPPG = "N/A";
      }

      try {
        awayTeaminLeague = leaguePositions.find(
          (team) => team.name === match.awayTeam
        );
        teamPositionAway = awayTeaminLeague.position;
        awayPrefix = await getPrefix(teamPositionAway);
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

          console.log(form[0].data[0].stats.additional_info)
        //   //get the last 5 games stats from a big block of text
        //   var homeExtract = form[0].data[0].stats.additional_info.replace(
        //     /["']/g,
        //     ""
        //   );

        //   var slug = homeExtract.split(",53:").pop().toUpperCase();
          let homeFormString5 = form[0].data[0].stats.additional_info.formRun_overall.toUpperCase()
          let awayFormString5 = form[1].data[0].stats.additional_info.formRun_overall.toUpperCase()
          let homeFormString6 = form[0].data[1].stats.additional_info.formRun_overall.toUpperCase()
          let awayFormString6 = form[1].data[1].stats.additional_info.formRun_overall.toUpperCase()
          let homeFormString10 = form[0].data[2].stats.additional_info.formRun_overall.toUpperCase()
          let awayFormString10 = form[1].data[2].stats.additional_info.formRun_overall.toUpperCase()
          lastFiveFormHome = Array.from(homeFormString5)
          lastSixFormHome = Array.from(homeFormString6)
          lastTenFormHome = Array.from(homeFormString10)



          // let conversionRateHome = form[0].data[2].stats.additional_info.shots_per_goals_scored_away
          // let shotsRecordedHome = form[0].data[2].stats.additional_info.shots_recorded_matches_num_away
          // let HomePredictionBasedOnShotConversion
          // let AwayPredictionBasedOnShotConversion

          // if(shotsRecordedHome || conversionRateHome === 0){
          //   HomePredictionBasedOnShotConversion = 0
          // } else {
          //   HomePredictionBasedOnShotConversion =  shotsRecordedHome / conversionRateHome
          // }

        

          // let conversionRateAway = form[1].data[2].stats.additional_info.shots_per_goals_scored_away
          // let shotsRecordedAway = form[1].data[2].stats.additional_info.shots_recorded_matches_num_away
         
          // if(shotsRecordedAway || conversionRateAway === 0){
          //   AwayPredictionBasedOnShotConversion = 0
          // } else {
          //   AwayPredictionBasedOnShotConversion =  shotsRecordedAway / conversionRateAway
          // }

         

          //shots_per_goals_scored_away
          //shots_recorded_matches_num_away


          // var awayExtract = form[1].data[0].stats.additional_info.replace(
          //   /["']/g,
          //   ""
          // );

          // var slugAway = awayExtract.split(",53:").pop().toUpperCase();
          lastFiveFormAway = Array.from(awayFormString5)
          lastSixFormAway = Array.from(awayFormString6)
          lastTenFormAway = Array.from(awayFormString10)

        // } else {
        //   lastFiveFormHome = "N/A"
        //   lastFiveFormAway = "N/A"
        // }

        allForm.push({
          id: match.id,
          home: {
            teamName: match.homeTeam,
            0: {
              XG: parseFloat(form[0].data[0].stats.xg_for_avg_overall),
              XGHome: parseFloat(form[0].data[0].stats.xg_for_avg_home),
              XGAway: parseFloat(form[0].data[0].stats.xg_for_avg_away),
              ScoredOverall: parseFloat(
                form[0].data[0].stats.seasonScoredNum_overall
              ),
              ScoredHome: parseFloat(
                form[0].data[0].stats.seasonScoredNum_home
              ),
              ScoredAway: parseFloat(
                form[0].data[0].stats.seasonScoredNum_away
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
              ConcededHome: parseFloat(
                form[0].data[0].stats.seasonConcededNum_home
              ),
              ConcededAway: parseFloat(
                form[0].data[0].stats.seasonConcededNum_away
              ),
              XGAgainstAvg: parseFloat(
                form[0].data[0].stats.xg_against_avg_overall
              ),
              XGAgainstHome: parseFloat(
                form[0].data[0].stats.xg_against_avg_home
              ),
              XGAgainstAway: parseFloat(
                form[0].data[0].stats.xg_against_avg_away
              ),
              CleanSheetPercentage: parseFloat(
                form[0].data[0].stats.seasonCSPercentage_overall
              ),
              AveragePossession: parseFloat(
                form[0].data[0].stats.possessionAVG_overall
              ),
              AverageShotsOnTarget: parseFloat(
                form[0].data[0].stats.shotsOnTargetAVG_overall
              ),
              AverageDangerousAttacks: parseFloat(
                form[0].data[0].stats.dangerous_attacks_avg_overall
              ),
              PPG: parseFloat(form[0].data[0].stats.seasonPPG_overall),
              AttacksHome: parseFloat(form[0].data[0].stats.attacks_avg_home),
              AttacksAway: parseFloat(form[0].data[0].stats.attacks_avg_away),
              DangerousAttacksHome: parseFloat(
                form[0].data[0].stats.dangerous_attacks_avg_home
              ),
              DangerousAttacksAway: parseFloat(
                form[0].data[0].stats.dangerous_attacks_avg_away
              ),
              homeAttackAdvantage: parseFloat(
                form[0].data[0].stats.homeAttackAdvantage
              ),
              homeDefenceAdvantage: parseFloat(
                form[0].data[0].stats.homeDefenceAdvantage
              ),
              BTTSPercentage: parseInt(
                form[0].data[0].stats.seasonBTTSPercentage_overall
              ),
              LastFiveForm: lastFiveFormHome,
              LeaguePosition: `${teamPositionHome}${homePrefix}`,
              SeasonPPG: homeSeasonPPG,
            },
            1: {
              XG: parseFloat(form[0].data[1].stats.xg_for_avg_overall),
              XGHome: parseFloat(form[0].data[1].stats.xg_for_avg_home),
              XGAway: parseFloat(form[0].data[1].stats.xg_for_avg_away),
              ScoredOverall: parseFloat(
                form[0].data[1].stats.seasonScoredNum_overall
              ),
              ScoredHome: parseFloat(
                form[0].data[1].stats.seasonScoredNum_home
              ),
              ScoredAway: parseFloat(
                form[0].data[1].stats.seasonScoredNum_away
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
              ConcededHome: parseFloat(
                form[0].data[1].stats.seasonConcededNum_home
              ),
              ConcededAway: parseFloat(
                form[0].data[1].stats.seasonConcededNum_away
              ),
              XGAgainstAvg: parseFloat(
                form[0].data[1].stats.xg_against_avg_overall
              ),
              XGAgainstHome: parseFloat(
                form[0].data[1].stats.xg_against_avg_home
              ),
              XGAgainstAway: parseFloat(
                form[0].data[1].stats.xg_against_avg_away
              ),
              CleanSheetPercentage: parseFloat(
                form[0].data[1].stats.seasonCSPercentage_overall
              ),
              AveragePossession: parseFloat(
                form[0].data[1].stats.possessionAVG_overall
              ),
              AverageShotsOnTarget: parseFloat(
                form[0].data[1].stats.shotsOnTargetAVG_overall
              ),
              AverageDangerousAttacks: parseFloat(
                form[0].data[1].stats.dangerous_attacks_avg_overall
              ),
              PPG: parseFloat(form[0].data[1].stats.seasonPPG_overall),
              AttacksHome: parseFloat(form[0].data[1].stats.attacks_avg_home),
              AttacksAway: parseFloat(form[0].data[1].stats.attacks_avg_away),
              DangerousAttacksHome: parseFloat(
                form[0].data[1].stats.dangerous_attacks_avg_home
              ),
              DangerousAttacksAway: parseFloat(
                form[0].data[1].stats.dangerous_attacks_avg_away
              ),
              homeAttackAdvantage: parseFloat(
                form[0].data[1].stats.homeAttackAdvantage
              ),
              homeDefenceAdvantage: parseFloat(
                form[0].data[1].stats.homeDefenceAdvantage
              ),
              BTTSPercentage: parseInt(
                form[0].data[1].stats.seasonBTTSPercentage_overall
              ),
              LastFiveForm: lastFiveFormHome,
              LeaguePosition: `${teamPositionHome}${homePrefix}`,
              SeasonPPG: homeSeasonPPG,
            },
            2: {
              XG: parseFloat(form[0].data[2].stats.xg_for_avg_overall),
              XGHome: parseFloat(form[0].data[2].stats.xg_for_avg_home),
              XGAway: parseFloat(form[0].data[2].stats.xg_for_avg_away),
              ScoredOverall: parseFloat(
                form[0].data[2].stats.seasonScoredNum_overall
              ),
              ScoredHome: parseFloat(
                form[0].data[2].stats.seasonScoredNum_home
              ),
              ScoredAway: parseFloat(
                form[0].data[2].stats.seasonScoredNum_away
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
              ConcededHome: parseFloat(
                form[0].data[2].stats.seasonConcededNum_home
              ),
              ConcededAway: parseFloat(
                form[0].data[2].stats.seasonConcededNum_away
              ),
              XGAgainstAvg: parseFloat(
                form[0].data[2].stats.xg_against_avg_overall
              ),
              XGAgainstHome: parseFloat(
                form[0].data[2].stats.xg_against_avg_home
              ),
              XGAgainstAway: parseFloat(
                form[0].data[2].stats.xg_against_avg_away
              ),
              CleanSheetPercentage: parseFloat(
                form[0].data[2].stats.seasonCSPercentage_overall
              ),
              AveragePossession: parseFloat(
                form[0].data[2].stats.possessionAVG_overall
              ),
              AverageShotsOnTarget: parseFloat(
                form[0].data[2].stats.shotsOnTargetAVG_overall
              ),
              AverageDangerousAttacks: parseFloat(
                form[0].data[2].stats.dangerous_attacks_avg_overall
              ),
              PPG: parseFloat(form[0].data[2].stats.seasonPPG_overall),
              AttacksHome: parseFloat(form[0].data[2].stats.attacks_avg_home),
              AttacksAway: parseFloat(form[0].data[2].stats.attacks_avg_away),
              DangerousAttacksHome: parseFloat(
                form[0].data[2].stats.dangerous_attacks_avg_home
              ),
              DangerousAttacksAway: parseFloat(
                form[0].data[2].stats.dangerous_attacks_avg_away
              ),
              homeAttackAdvantage: parseFloat(
                form[0].data[2].stats.homeAttackAdvantage
              ),
              homeDefenceAdvantage: parseFloat(
                form[0].data[2].stats.homeDefenceAdvantage
              ),
              BTTSPercentage: parseInt(
                form[0].data[2].stats.seasonBTTSPercentage_overall
              ),
              LastFiveForm: lastFiveFormHome,
              LeaguePosition: `${teamPositionHome}${homePrefix}`,
              SeasonPPG: homeSeasonPPG,
            },
          },
          away: {
            teamName: match.awayTeam,
            0: {
              XG: parseFloat(form[1].data[0].stats.xg_for_avg_overall),
              XGHome: parseFloat(form[1].data[0].stats.xg_for_avg_home),
              XGAway: parseFloat(form[1].data[0].stats.xg_for_avg_away),
              ScoredOverall: parseFloat(
                form[1].data[0].stats.seasonScoredNum_overall
              ),
              ScoredHome: parseFloat(
                form[1].data[0].stats.seasonScoredNum_home
              ),
              ScoredAway: parseFloat(
                form[1].data[0].stats.seasonScoredNum_away
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
              ConcededHome: parseFloat(
                form[1].data[0].stats.seasonConcededNum_home
              ),
              ConcededAway: parseFloat(
                form[1].data[0].stats.seasonConcededNum_away
              ),
              XGAgainstAvg: parseFloat(
                form[1].data[0].stats.xg_against_avg_overall
              ),
              XGAgainstHome: parseFloat(
                form[1].data[0].stats.xg_against_avg_home
              ),
              XGAgainstAway: parseFloat(
                form[1].data[0].stats.xg_against_avg_away
              ),
              CleanSheetPercentage: parseFloat(
                form[1].data[0].stats.seasonCSPercentage_overall
              ),
              AveragePossession: parseFloat(
                form[1].data[0].stats.possessionAVG_overall
              ),
              AverageShotsOnTarget: parseFloat(
                form[1].data[0].stats.shotsOnTargetAVG_overall
              ),
              AverageDangerousAttacks: parseFloat(
                form[1].data[0].stats.dangerous_attacks_avg_overall
              ),
              PPG: parseFloat(form[1].data[0].stats.seasonPPG_overall),
              AttacksHome: parseFloat(form[1].data[0].stats.attacks_avg_home),
              AttacksAway: parseFloat(form[1].data[0].stats.attacks_avg_away),
              DangerousAttacksHome: parseFloat(
                form[1].data[0].stats.dangerous_attacks_avg_home
              ),
              DangerousAttacksAway: parseFloat(
                form[1].data[0].stats.dangerous_attacks_avg_away
              ),
              homeAttackAdvantage: parseFloat(
                form[1].data[0].stats.homeAttackAdvantage
              ),
              homeDefenceAdvantage: parseFloat(
                form[1].data[0].stats.homeDefenceAdvantage
              ),
              BTTSPercentage: parseInt(
                form[1].data[0].stats.seasonBTTSPercentage_overall
              ),
              LastFiveForm: lastFiveFormAway,
              LeaguePosition: `${teamPositionAway}${awayPrefix}`,
              SeasonPPG: awaySeasonPPG,
            },
            1: {
              XG: parseFloat(form[1].data[1].stats.xg_for_avg_overall),
              XGHome: parseFloat(form[1].data[1].stats.xg_for_avg_home),
              XGAway: parseFloat(form[1].data[1].stats.xg_for_avg_away),
              ScoredOverall: parseFloat(
                form[1].data[1].stats.seasonScoredNum_overall
              ),
              ScoredHome: parseFloat(
                form[1].data[1].stats.seasonScoredNum_home
              ),
              ScoredAway: parseFloat(
                form[1].data[1].stats.seasonScoredNum_away
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
              ConcededHome: parseFloat(
                form[1].data[1].stats.seasonConcededNum_home
              ),
              ConcededAway: parseFloat(
                form[1].data[1].stats.seasonConcededNum_away
              ),
              XGAgainstAvg: parseFloat(
                form[1].data[1].stats.xg_against_avg_overall
              ),
              XGAgainstHome: parseFloat(
                form[1].data[1].stats.xg_against_avg_home
              ),
              XGAgainstAway: parseFloat(
                form[1].data[1].stats.xg_against_avg_away
              ),
              CleanSheetPercentage: parseFloat(
                form[1].data[1].stats.seasonCSPercentage_overall
              ),
              AveragePossession: parseFloat(
                form[1].data[1].stats.possessionAVG_overall
              ),
              AverageShotsOnTarget: parseFloat(
                form[1].data[1].stats.shotsOnTargetAVG_overall
              ),
              AverageDangerousAttacks: parseFloat(
                form[1].data[1].stats.dangerous_attacks_avg_overall
              ),
              PPG: parseFloat(form[1].data[1].stats.seasonPPG_overall),
              AttacksHome: parseFloat(form[1].data[1].stats.attacks_avg_home),
              AttacksAway: parseFloat(form[1].data[1].stats.attacks_avg_away),
              DangerousAttacksHome: parseFloat(
                form[1].data[1].stats.dangerous_attacks_avg_home
              ),
              DangerousAttacksAway: parseFloat(
                form[1].data[1].stats.dangerous_attacks_avg_away
              ),
              homeAttackAdvantage: parseFloat(
                form[1].data[1].stats.homeAttackAdvantage
              ),
              homeDefenceAdvantage: parseFloat(
                form[1].data[1].stats.homeDefenceAdvantage
              ),
              BTTSPercentage: parseInt(
                form[1].data[1].stats.seasonBTTSPercentage_overall
              ),
              LastFiveForm: lastFiveFormAway,
              LeaguePosition: `${teamPositionAway}${awayPrefix}`,
              SeasonPPG: awaySeasonPPG,
            },
            2: {
              XG: parseFloat(form[1].data[2].stats.xg_for_avg_overall),
              XGHome: parseFloat(form[1].data[2].stats.xg_for_avg_home),
              XGAway: parseFloat(form[1].data[2].stats.xg_for_avg_away),
              ScoredOverall: parseFloat(
                form[1].data[2].stats.seasonScoredNum_overall
              ),
              ScoredHome: parseFloat(
                form[1].data[2].stats.seasonScoredNum_home
              ),
              ScoredAway: parseFloat(
                form[1].data[2].stats.seasonScoredNum_away
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
              ConcededHome: parseFloat(
                form[1].data[2].stats.seasonConcededNum_home
              ),
              ConcededAway: parseFloat(
                form[1].data[2].stats.seasonConcededNum_away
              ),
              XGAgainstAvg: parseFloat(
                form[1].data[2].stats.xg_against_avg_overall
              ),
              XGAgainstHome: parseFloat(
                form[1].data[2].stats.xg_against_avg_home
              ),
              XGAgainstAway: parseFloat(
                form[1].data[2].stats.xg_against_avg_away
              ),
              CleanSheetPercentage: parseFloat(
                form[1].data[2].stats.seasonCSPercentage_overall
              ),
              AveragePossession: parseFloat(
                form[1].data[2].stats.possessionAVG_overall
              ),
              AverageShotsOnTarget: parseFloat(
                form[1].data[2].stats.shotsOnTargetAVG_overall
              ),
              AverageDangerousAttacks: parseFloat(
                form[1].data[2].stats.dangerous_attacks_avg_overall
              ),
              PPG: parseFloat(form[1].data[2].stats.seasonPPG_overall),
              AttacksHome: parseFloat(form[1].data[2].stats.attacks_avg_home),
              AttacksAway: parseFloat(form[1].data[2].stats.attacks_avg_away),
              DangerousAttacksHome: parseFloat(
                form[1].data[2].stats.dangerous_attacks_avg_home
              ),
              DangerousAttacksAway: parseFloat(
                form[1].data[2].stats.dangerous_attacks_avg_away
              ),
              homeAttackAdvantage: parseFloat(
                form[1].data[2].stats.homeAttackAdvantage
              ),
              homeDefenceAdvantage: parseFloat(
                form[1].data[2].stats.homeDefenceAdvantage
              ),
              BTTSPercentage: parseInt(
                form[0].data[2].stats.seasonBTTSPercentage_overall
              ),
              LastFiveForm: lastFiveFormAway,
              LeaguePosition: `${teamPositionAway}${awayPrefix}`,
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

      match.status = fixture.status;

      match.btts_potential = fixture.btts_potential;
      match.game = match.homeTeam + " v " + match.awayTeam;

      match.homeGoals = fixture.homeGoalCount;
      match.awayGoals = fixture.awayGoalCount;

      match.expectedGoalsHomeToDate = fixture.team_a_xg_prematch;
      match.expectedGoalsAwayToDate = fixture.team_b_xg_prematch;

      if (match.status !== "canceled" || match.status !== "suspended") {
        matches.push(match);
        await createFixture(match, false);
      }

      // console.log(allForm)
    }
    // }
    ReactDOM.render(
      <Button
        text={"Get Predictions"}
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
