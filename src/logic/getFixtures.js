import React from "react";
import ReactDOM from "react-dom";
import createStatsDiv from "../components/createStatsDiv";
import { orderedLeagues, proxyurl } from "../App";
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

async function createFixture(match) {
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

  //   item.onclick = await function () {
  //     getMatchStats(matchId, item);
  //   };

  //   let linebreak = document.createElement("br");
  //   item.appendChild(linebreak);
}

export async function generateFixtures(day, radioState) {
  radioValue = radioState;

  fixtureResponse = await fetch(proxyurl + day);

  await fixtureResponse.json().then((fixtures) => {
    fixtureArray = Array.from(fixtures.data);
  });

  for (let i = 0; i < orderedLeagues.length; i++) {
    leagueGames = fixtureArray.filter(
      (game) => game.competition_id === orderedLeagues[i].element.id
    );

    for (const fixture of leagueGames) {
      console.log(fixture);

      const unixTimestamp = fixture.date_unix;

      const milliseconds = unixTimestamp * 1000; 

      const dateObject = new Date(milliseconds);

      let match = {};
      
      match.id = fixture.id;
      match.time = dateObject.toLocaleString("en-US", { hour: "numeric" });
      console.log(match.time)
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
      match.homeFormColour = await applyColour(match.homePpg);

      match.awayPpg = fixture.away_ppg.toFixed(2);
      match.awayFormColour = await applyColour(match.awayPpg);

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
