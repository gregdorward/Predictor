import React from "react";
import ReactDOM from "react-dom";
import Header from "./components/Header";
import Radio from "./components/radio";
import { Button } from "./components/Button";
import {
  today,
  generateFixtures,
  generatePriorFixtures,
  tomorrow,
  yesterday,
} from "./logic/getFixtures";
import { selectedOption } from "./components/radio";
import TextBlock from "./components/TextSection";
import { ThreeDots } from 'react-loading-icons';
require("dotenv").config();

export const proxyurl = "https://safe-caverns-99679.herokuapp.com/";
export var fixtureList = [];
export let allLeagueData = [];

export const availableLeagues = [];
export var orderedLeagues = [];

(async function getLeagueList() {
  let leagueList;

  leagueList = await fetch(`${process.env.REACT_APP_EXPRESS_SERVER}leagueList`);

  // ReactDOM.render(
  //   <div className="LoadingText">
  //     Loading form data. This might take a while if you're the first user
  //     today...
  //   </div>,
  //   document.getElementById("RadioButtons")
  // );

  let leagueArray;
  await leagueList.json().then((leagues) => {
    leagueArray = Array.from(leagues.data);
  });

  for (let i = 0; i < leagueArray.length; i++) {
    console.log(leagueArray[i]);
    const league = leagueArray[i];
    const name = leagueArray[i].name;

    for (let x = 0; x < league.season.length; x++) {
      const element = league.season[x];

      if (element.year === 20202021 || element.year === 2021) {
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
      4759, //premier league
      4912, //championship
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
      5674,
      5361,
      4885,
      4902,
      4903,
      4803,
      5151,
      4930,
      4655,
      4930,
      4693,
      5713,
      5505, //sweden
      4642, //Denmark
      4507, //Mexico
    ];

    orderedLeagues = mapOrder(availableLeagues, leagueOrder, "id");
  }

  let response;
  let responseBody;

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
        text={"Yesterday's Prediction outcomes"}
        onClickEvent={async () =>
          fixtureList.push(
            await generateFixtures("yesterdaysFixtures", selectedOption)
          )
        }
      />
      <Button
        text={"Today's Fixtures"}
        onClickEvent={async () =>
          fixtureList.push(
            await generateFixtures("todaysFixtures", selectedOption)
          )
        }
      />
      <Button
        text={"Tomorrow's Fixtures"}
        onClickEvent={async () =>
          fixtureList.push(
            await generateFixtures("tomorrowsFixtures", selectedOption)
          )
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
      <a
        className="SocialLink"
        href="https://www.reddit.com/r/xgtipping/"
        target="_blank"
        rel="noreferrer"
      >
        r/xgtipping
      </a>
      <div id="LoadingContainer" className="LoadingContainer" />
      <div id="RadioContainer" className="RadioContainer">
        <div id="RadioText" />
        <div id="RadioButtons" />
      </div>
      <div id="Day" />
      <div id="Buttons">
      <ThreeDots height="3em"/>
      <div>Loading all fixture and form data...</div>
      </div>
      <div id="successMeasure" />
      <div id="bestPredictions" />
      <div id="BTTS" />
      <div id="longShots" />
      <div id="homeBadge" />
      <div id="FixtureContainerHeaders"></div>
      <div id="FixtureContainer">
        <div>
          <div className="WelcomeText">
            Global fixtures and predictions from leagues including
          </div>
          <ul className="AllLeagues">
            <li className="League">Premier League</li>
            <li className="League">La Liga</li>
            <li className="League">Serie A</li>
            <li className="League">Bundesliga</li>
            <li className="League">Ligue 1</li>
            <li className="League">MLS</li>
            <li className="League">Primeira Liga</li>
            <li className="League">And 21 more...</li>
          </ul>
          <div className="DataText">Powered by data from</div>
          <a
            className="DataLink"
            href="https://www.footystats.org"
            target="_blank"
            rel="noreferrer"
          >
            footystats.org
          </a>
        </div>
      </div>
    </div>
  );
}

export default App;
