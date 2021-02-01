import React from "react";
import ReactDOM from "react-dom";
import Header from "./components/Header";
import Radio from "./components/radio";
import { Button } from "./components/Button";
import { today, generateFixtures, tomorrow } from "./logic/getFixtures";
import { selectedOption } from "./components/radio";
import TextBlock from "./components/TextSection";
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

const availableLeagues = [];
export var orderedLeagues = [];

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

    function mapOrder(array, order, key) {
      array.sort(function (a, b) {
        var A = a.element[key],
          B = b.element[key];

        if (order.indexOf(A) > order.indexOf(B)) {
          return 1;
        } else {
          return -1;
        }
      });

      return array;
    }

    //leagues ordered by id
    var leagueOrder = [
      4759,
      4912,
      4845,
      4844,
      5018,
      4944,
      4478,
      4673,
      4889,
      4889,
      4746,
      4567,
      4505,
      4842,
      4972,
      4676,
      4645,
      4547,
      4902,
      4903,
      4803,
      5151,
      4930,
      4655,
      4930,
      4693,
    ];

    orderedLeagues = mapOrder(availableLeagues, leagueOrder, "id");
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
    <TextBlock
      text="Select how many games you would like to fetch form data for"
      className="RadioText"
    />,
    document.getElementById("RadioText")
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
        text={"Get Tomorrow's Fixtures"}
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
      <div id="RadioContainer" className="RadioContainer">
        <div id="RadioText" />
        <div id="RadioButtons" />
      </div>
      <div id="Day" />
      <div id="Buttons" />
      <div id="homeBadge" />
      <div id="FixtureContainer"></div>
    </div>
  );
}

export default App;
