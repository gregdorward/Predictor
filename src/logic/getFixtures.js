import React from "react";
import ReactDOM from "react-dom";
import { allLeagueData, orderedLeagues, proxyurl } from "../App";
import { getForm, applyColour } from "./getForm";
import { Fixture } from "../components/Fixture";
import { Button } from "../components/Button";
import { getScorePrediction } from "../logic/getScorePredictions";

require("dotenv").config();

console.log(process.env.REACT_APP_EXPRESS_SERVER);

var fixtureResponse;
var fixtureArray;
export const matches = [];
export const resultedMatches = [];
var leagueGames = [];
var lastFiveFormHome;
var lastFiveFormAway;

export const [day, month, year] = new Date()
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

export const yesterday = `https://api.footystats.org/todays-matches?key=${process.env.REACT_APP_API_KEY}&date=${yesterdayYear}-${yesterdayDay}-${yesterdayMonth}`;
export const today = `https://api.footystats.org/todays-matches?key=${process.env.REACT_APP_API_KEY}&date=${year}-${day}-${month}`;
export const tomorrow = `https://api.footystats.org/todays-matches?key=${process.env.REACT_APP_API_KEY}&date=${tomorrowYear}-${tomorrowDay}-${tomorrowMonth}`;

export function getRadioState(state) {
  let radioState = state;
  return radioState;
}

export async function diff(a, b) {
  return parseFloat(a - b).toFixed(2);
}

export let allForm = [];

async function createFixture(match, result) {
  match.game = match.homeTeam + " v " + match.awayTeam;

  ReactDOM.render(
    <Fixture
      fixtures={matches}
      result={result}
      className={"individualFixture"}
    />,
    document.getElementById("FixtureContainer")
  );
}

var myHeaders = new Headers();
myHeaders.append("Origin", "https://gregdorward.github.io");

var requestOptions = {
  method: "GET",
  headers: myHeaders,
  redirect: "follow",
};

export async function generateFixtures(day, radioState) {
  let radioValue = parseInt(radioState);

  let index;
  if (radioValue === 5) {
    index = 0;
  } else if (radioValue === 6) {
    index = 1;
  } else if (radioValue === 10) {
    index = 2;
  }

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

  fixtureResponse = await fetch(proxyurl + url);

  await fixtureResponse.json().then((fixtures) => {
    fixtureArray = Array.from(fixtures.data);
  });

  ReactDOM.render(
    <Button
      text={"Get Predictions"}
      onClickEvent={() => getScorePrediction(day, allLeagueData)}
    />,
    document.getElementById("Buttons")
  );
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
    console.log("Stored form not fetched");
    isFormStored = false;
    isStoredLocally = false;
  }

  for (let i = 0; i < orderedLeagues.length; i++) {
    leagueGames = fixtureArray.filter(
      (game) => game.competition_id === orderedLeagues[i].element.id
    );

    for (const fixture of leagueGames) {
      const unixTimestamp = fixture.date_unix;
      const milliseconds = unixTimestamp * 1000;
      const dateObject = new Date(milliseconds);

      let match = {};
      match.id = fixture.id;
      match.competition_id = fixture.competition_id;
      match.time = dateObject.toLocaleString("en-US", { hour: "numeric" });
      match.homeTeam = fixture.home_name;
      match.awayTeam = fixture.away_name;
      match.homeOdds = fixture.odds_ft_1;
      match.awayOdds = fixture.odds_ft_2;
      match.drawOdds = fixture.odds_ft_x;
      match.homeId = fixture.homeID;
      match.awayId = fixture.awayID;
      match.form = [];
      match.homeTeamInfo = [];
      match.awayTeamInfo = [];

      if (!isFormStored) {
        form = await getForm(match);
        console.log(form);
        console.log("Pusing match to form object");

        var homeExtract = form[0].data[0].stats.additional_info.replace(
          /["']/g,
          ""
        );

        var slug = homeExtract.split(",53:").pop().toUpperCase();
        lastFiveFormHome = [...slug.substring(0, 5)];

        var awayExtract = form[1].data[0].stats.additional_info.replace(
          /["']/g,
          ""
        );

        var slug = awayExtract.split(",53:").pop().toUpperCase();
        lastFiveFormAway = [...slug.substring(0, 5)];

        allForm.push({
          id: match.id,
          home: {
            teamName: match.homeTeam,
            0: {
              XG: parseFloat(form[0].data[0].stats.xg_for_avg_overall),
              ScoredOverall: parseFloat(
                form[0].data[0].stats.seasonScoredNum_overall
              ),
              ConcededOverall: parseFloat(
                form[0].data[0].stats.seasonConcededNum_overall
              ),
              XGAgainstAvg: parseFloat(
                form[0].data[0].stats.xg_against_avg_overall
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
              LastFiveForm: lastFiveFormHome,
            },
            1: {
              XG: parseFloat(form[0].data[1].stats.xg_for_avg_overall),
              ScoredOverall: parseFloat(
                form[0].data[1].stats.seasonScoredNum_overall
              ),
              ConcededOverall: parseFloat(
                form[0].data[1].stats.seasonConcededNum_overall
              ),
              XGAgainstAvg: parseFloat(
                form[0].data[1].stats.xg_against_avg_overall
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
              LastFiveForm: lastFiveFormHome,
            },
            2: {
              XG: parseFloat(form[0].data[2].stats.xg_for_avg_overall),
              ScoredOverall: parseFloat(
                form[0].data[2].stats.seasonScoredNum_overall
              ),
              ConcededOverall: parseFloat(
                form[0].data[2].stats.seasonConcededNum_overall
              ),
              XGAgainstAvg: parseFloat(
                form[0].data[2].stats.xg_against_avg_overall
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
              LastFiveForm: lastFiveFormHome,
            },
          },
          away: {
            teamName: match.awayTeam,
            0: {
              XG: parseFloat(form[1].data[0].stats.xg_for_avg_overall),
              ScoredOverall: parseFloat(
                form[1].data[0].stats.seasonScoredNum_overall
              ),
              ConcededOverall: parseFloat(
                form[1].data[0].stats.seasonConcededNum_overall
              ),
              XGAgainstAvg: parseFloat(
                form[1].data[0].stats.xg_against_avg_overall
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
              LastFiveForm: lastFiveFormAway,
            },
            1: {
              XG: parseFloat(form[1].data[1].stats.xg_for_avg_overall),
              ScoredOverall: parseFloat(
                form[1].data[1].stats.seasonScoredNum_overall
              ),
              ConcededOverall: parseFloat(
                form[1].data[1].stats.seasonConcededNum_overall
              ),
              XGAgainstAvg: parseFloat(
                form[1].data[1].stats.xg_against_avg_overall
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
              LastFiveForm: lastFiveFormAway,
            },
            2: {
              XG: parseFloat(form[1].data[2].stats.xg_for_avg_overall),
              ScoredOverall: parseFloat(
                form[1].data[2].stats.seasonScoredNum_overall
              ),
              ConcededOverall: parseFloat(
                form[1].data[2].stats.seasonConcededNum_overall
              ),
              XGAgainstAvg: parseFloat(
                form[1].data[2].stats.xg_against_avg_overall
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
              LastFiveForm: lastFiveFormAway,
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

      console.log(match);

      matches.push(match);

      await createFixture(match, false);
    }
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
}
