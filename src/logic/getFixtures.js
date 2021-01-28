import React from "react";
import ReactDOM from "react-dom";
import createStatsDiv from "../components/createStatsDiv";
import { availableLeagues, proxyurl } from "../App";
import { getForm, applyColour } from "./getForm";
import { FixtureList } from "../components/FixtureList";
import { Button } from "../components/Button";
import { getScorePrediction } from "../logic/getScorePredictions";
var fixtureResponse;
var fixtureArray;
export const matches = [];
var radioValue;
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

export const today = `https://api.footystats.org/todays-matches?key=${process.env.REACT_APP_API_KEY}&date=${year}-${day}-${month}`;
export const tomorrow = `https://api.footystats.org/todays-matches?key=${process.env.REACT_APP_API_KEY}&date=${tomorrowYear}-${tomorrowDay}-${tomorrowMonth}`;

export function getRadioState(state) {
  let radioState = state;
  return radioState;
}

export async function getMatchStats(id, item) {
  let matchDetail = await fetch(
    proxyurl +
      `https://api.footystats.org/match?key=${process.env.REACT_APP_API_KEY}&match_id=` +
      id
  );

  let stats;
  await matchDetail.json().then((data) => {
    let arr1 = data.data.trends.team_a;
    let arr2 = data.data.trends.team_b;
    stats = arr1.concat(arr2);
  });
  createStatsDiv(stats, item);
}

async function createFixture(match) {
  console.log("3");

  match.game = match.homeTeam + " v " + match.awayTeam;

  //   ReactDOM.render(<CreateBadge image={match.homeBadge}/>, document.getElementById("homeBadge"));
  ReactDOM.render(
    <FixtureList fixtures={matches} result={false} />,
    document.getElementById("FixtureContainer")
  );

  // item.addEventListener("mouseover", function (event) {
  //   // highlight the mouseover target
  //   event.target.style.color = "orange";
  //   item.onmouseout = logMouseOut;
  //   function logMouseOut() {
  //     event.target.style.color = "";
  //   }
  // });

  let matchId = match.id;

  //   item.onclick = await function () {
  //     getMatchStats(matchId, item);
  //   };

  //   let linebreak = document.createElement("br");
  //   item.appendChild(linebreak);
}

export async function generateFixtures(day, radioState) {
  radioValue = radioState;

  console.log("This is the radio state " + radioValue);
  fixtureResponse = await fetch(proxyurl + day);

  await fixtureResponse.json().then((fixtures) => {
    fixtureArray = Array.from(fixtures.data);
  });

  for (let i = 0; i < availableLeagues.length; i++) {
    leagueGames = fixtureArray.filter(
      (game) => game.competition_id === availableLeagues[i].element.id
    );

    for (const fixture of leagueGames) {
      let match = {};

      match.id = fixture.id;
      match.homeTeam = fixture.home_name;
      match.awayTeam = fixture.away_name;
      match.homeOdds = fixture.odds_ft_1;
      match.awayOdds = fixture.odds_ft_2;
      match.homeId = fixture.homeID;
      match.awayId = fixture.awayID;
      match.homeTeamForm = await getForm(match.homeId, "home", radioValue);
      match.awayTeamForm = await getForm(match.awayId, "away", radioValue);
      match.homeBadge = fixture.home_image;
      match.awayBadge = fixture.away_image;

      match.homeXG = parseFloat(fixture.team_a_xg_prematch);
      match.awayXG = parseFloat(fixture.team_b_xg_prematch);

      match.homePpg = fixture.home_ppg.toFixed(2);
      console.log("1");
      match.homeFormColour = await applyColour(match.homePpg);

      match.awayPpg = fixture.away_ppg.toFixed(2);
      match.awayFormColour = await applyColour(match.awayPpg);

      console.log("2");

      match.status = fixture.status;

      match.btts_potential = fixture.btts_potential;
      match.game = match.homeTeam + " v " + match.awayTeam;

      matches.push(match);

      await createFixture(match);
    }
  }
  ReactDOM.render(
    <Button
      text={"Get Predictions"}
      onClickEvent={() => getScorePrediction()}
    />,
    document.getElementById("Buttons")
  );
}
