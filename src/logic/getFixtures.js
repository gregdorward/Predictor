import React from "react";
import ReactDOM from "react-dom";
import { orderedLeagues, proxyurl } from "../App";
import { getForm, applyColour } from "./getForm";
import { Fixture } from "../components/Fixture"
import { Button } from "../components/Button";
import { getScorePrediction } from "../logic/getScorePredictions";
require("dotenv").config();

console.log(process.env.REACT_APP_EXPRESS_SERVER)


var fixtureResponse;
var fixtureArray;
export const matches = [];
export const resultedMatches = [];
var leagueGames = [];

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

export const allForm = [];

async function createFixture(match, result) {
  match.game = match.homeTeam + " v " + match.awayTeam;

  ReactDOM.render(
    <Fixture
      fixtures={matches}
      result={result}
      className={"individualFixture"}
    />,
        document.getElementById("FixtureContainer")
  )
}

// async function createResultedFixtures(match, result) {

//   ReactDOM.render(
//     <Fixture
//       fixtures={resultedMatches}
//       result={result}
//       className={"individualFixture"}
//     />,
//         document.getElementById("FixtureContainer")
//   )
// }



var myHeaders = new Headers();
myHeaders.append("Origin", "https://gregdorward.github.io");

var requestOptions = {
  method: 'GET',
  headers: myHeaders,
  redirect: 'follow'
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
      url =yesterday;
      break;
    case "todaysFixtures":
      url = today
      break;
    case "tomorrowsFixtures":
      url = tomorrow
      break;
    default:
      break;
  }
  


// First try to get stored fixtures from proxy server
// if no fixtures returned, try fetching live first
//  fixtureResponse = await fetch(`${process.env.REACT_APP_EXPRESS_SERVER}/${day}`, requestOptions)

//   await fixtureResponse.json().then((fixtures) => {
//     console.log(fixtures)
//     fixtureArray = Array.from(fixtures.fixtures);
//   });

//   var fixturesReturned = fixtureArray.length > 0

    fixtureResponse = await fetch(proxyurl + url);

    await fixtureResponse.json().then((fixtures) => {
      console.log(fixtures)
      fixtureArray = Array.from(fixtures.data);
    });
  
  ReactDOM.render(
    <Button
      text={"Get Predictions"}
      onClickEvent={() => getScorePrediction(day)}
    />,
    document.getElementById("Buttons")
  );

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
      match.competition_id = fixture.competition_id
      match.time = dateObject.toLocaleString("en-US", { hour: "numeric" });
      match.homeTeam = fixture.home_name;
      match.awayTeam = fixture.away_name;
      match.homeOdds = fixture.odds_ft_1;
      match.awayOdds = fixture.odds_ft_2;
      match.drawOdds = fixture.odds_ft_x
      match.homeId = fixture.homeID;
      match.awayId = fixture.awayID;
      match.form = [];
      match.homeTeamInfo = [];
      match.awayTeamInfo = [];

      const form = await getForm(match);

      match.form.allHomeForm = form[0].data;
      match.form.allAwayForm = form[1].data;

      match.form.homeTeam = form[0].data[index].stats;
      match.form.awayTeam = form[1].data[index].stats;

      match.homeBadge = fixture.home_image
      match.awayBadge = fixture.away_image


      match.homeXG = parseFloat(match.form.homeTeam.xg_for_avg_overall);
      match.awayXG = parseFloat(match.form.awayTeam.xg_for_avg_overall);

      match.homePpg = fixture.home_ppg.toFixed(2);
      match.homeFormColour = await applyColour(match.homePpg);

      match.awayPpg = fixture.away_ppg.toFixed(2);
      match.awayFormColour = await applyColour(match.awayPpg);

      match.status = fixture.status;

      match.btts_potential = fixture.btts_potential;
      match.game = match.homeTeam + " v " + match.awayTeam;

      match.homeGoals = fixture.homeGoalCount;
      match.awayGoals = fixture.awayGoalCount;

      matches.push(match);

      await createFixture(match, false);
    }
  }
}






// export async function generatePriorFixtures(radioState) {
//   console.log("CALLED")
//   let radioValue = parseInt(radioState);

//   let index;
//   if (radioValue === 5) {
//     index = 0;
//   } else if (radioValue === 6) {
//     index = 1;
//   } else if (radioValue === 10) {
//     index = 2;
//   }

//   fixtureResponse = await fetch("http://localhost:5000/allGames")

//   await fixtureResponse.json().then((fixtures) => {
//     console.log(fixtures.fixtures.matches)
//     fixtureArray = fixtures.fixtures.matches;
//   });


//   for (let i = 0; i < orderedLeagues.length; i++) {
//     leagueGames = fixtureArray.filter(
//       (game) => game.competition_id === orderedLeagues[i].element.id
//     );
//     for (const fixture of leagueGames) {

//       resultedMatches.push(fixture);

//       await createResultedFixtures(fixture, true);
//     }
//   }
// }