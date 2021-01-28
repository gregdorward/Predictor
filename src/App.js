import React from "react";
import ReactDOM from "react-dom";
import Header from "./components/Header";
import Radio from "./components/radio";
import { Button } from "./components/Button";
import { today, generateFixtures, tomorrow } from "./logic/getFixtures";
import { selectedOption } from "./components/radio";
require("dotenv").config();

export const proxyurl = "https://safe-caverns-99679.herokuapp.com/";
export var fixtureList = [];

// var slider = document.getElementById("myRange");

// var output = document.getElementById("weight");
// output.innerHTML = slider.value;

// slider.oninput = function () {
//   output.innerHTML = this.value;
//   weighting = this.value / 100;
// };

// (async function populateContent() {
//   // spinner.showSpinner();

//   // spinner.hideSpinner();
// })();

console.log("KEY");
console.log(process.env.REACT_APP_API_KEY);

export const availableLeagues = [];

(async function getLeagueList() {
  let leagueList = await fetch(
    proxyurl +
      `https://api.footystats.org/league-list?key=${process.env.REACT_APP_API_KEY}&chosen_leagues_only=true`
  );
  let leagueArray;
  await leagueList.json().then((leagues) => {
    leagueArray = Array.from(leagues.data);
  });

  for (let i = 0; i < leagueArray.length; i++) {
    const league = leagueArray[i];
    const name = leagueArray[i].name;

    for (let x = 0; x < league.season.length; x++) {
      const element = league.season[x];

      if (element.year === 20202021) {
        availableLeagues.push({ name: name, element });
      }
    }
  }

  ReactDOM.render(
    <div className="LastXGames">
      <Radio
        value="5"
        label="form based on last 5 games"
        className="FormRadio"
      />
      <Radio
        value="6"
        label="form based on last 6 games"
        className="FormRadio"
      />
      <Radio
        value="10"
        label="form based on last 10 games"
        className="FormRadio"
      />
    </div>,
    document.getElementById("RadioButtons")
  );

  ReactDOM.render(
    <div className="FixtureButtons">
      <Button
        text={"Get Today's Fixtures"}
        onClickEvent={async () =>
          fixtureList.push(await generateFixtures(today, selectedOption))
        }
      />
      <Button
        text={"Get Tomorros's Fixtures"}
        onClickEvent={async () =>
          fixtureList.push(await generateFixtures(tomorrow, selectedOption))
        }
      />
    </div>,
    document.getElementById("Buttons")
  );
})();

function App() {
  return (
    <div className="App">
      <Header />
      <div id="RadioButtons" />
      <div id="Day" />
      <div id="Buttons" />
      <div id="homeBadge" />
      <div id="FixtureContainer"></div>
    </div>
  );
}

export default App;
