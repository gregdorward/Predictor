import React from "react";
import ReactDOM from "react-dom";
import Header from "./components/Header";
import Radio from "./components/radio";
import { Button } from "./components/Button";
import OddsRadio from "./components/OddsRadio";
import { selectedOdds } from "./components/OddsRadio";

import {
  today,
  generateFixtures,
  generatePriorFixtures,
  tomorrow,
  yesterday,
} from "./logic/getFixtures";
import { selectedOption } from "./components/radio";
import TextBlock from "./components/TextSection";
import { ThreeDots } from "react-loading-icons";
require("dotenv").config();

export const proxyurl = "https://safe-caverns-99679.herokuapp.com/";
export var fixtureList = [];
export let allLeagueData = [];

export const availableLeagues = [];
export var orderedLeagues = [];

(async function getLeagueList() {
  let leagueList;

  leagueList = await fetch(`${process.env.REACT_APP_EXPRESS_SERVER}leagueList`);
  console.log(leagueList);

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
  console.log(leagueArray);

  for (let i = 0; i < leagueArray.length; i++) {
    const league = leagueArray[i];
    const name = leagueArray[i].name;

    for (let x = 0; x < league.season.length; x++) {
      const element = league.season[x];
      console.log(element);

      if (element.year === 20212022 || element.year === 2021) {
        if (element.id !== 5784 && element.id !== 6639) {
          availableLeagues.push({ name: name, element });
        }
      }
    }

    async function mapOrder(array, order, key) {
      array.sort(function (a, b) {
        var A = a.element[key],
          B = b.element[key];

        if (order.indexOf(A) > order.indexOf(B)) {
          return 1;
        } else {
          return -1;
        }
      });
      console.log(array);
      return array;
    }

    //leagues ordered by id
    var leagueOrder = [
      6135, //premier league 21/22
      6089, //championship
      6017, //league 1 21/22
      6015, //league 2 21/22
      6088, //National league 21/22
      6211, //
      5992, //Scottish Prem 21/22
      6192, //
      6198, //Serie A
      6019, //French Prem 21/22
      6117, //Portagul Prem 21/22
      5951, //Dutch Prem 21/22
      6079, //Belgian Pro League 21/22
      5505, //sweden 21/22
      5961, //Danish Prem 21
      5496, //Norway Prem 21
      6008, //Austrian Prem 21
      6282, //Greek Prem 21
      5534, //Irish Prem 21
      6120, //Spanish secunda 21/22
      6205, //
      6020, //Bundesliga 2 21/22
      6018, //French League 2 21/22
      5991, //Scottish Championship
      5976, //Scottish league 1 21/22
      5974, //Scottish league 2 21/22
      5674, //MLS 21
      // 6639, //Australian A league 21
      5713, //Brazil prem 21
      5434, //Japan 21
      5506, //S Korea 21
      6038, //Mexico prem 21/22`

      6083, //National league North and South 21/22
    ];

    orderedLeagues = await mapOrder(availableLeagues, leagueOrder, "id");
  }

  // ReactDOM.render(
  //   <div className="LastXGames">
  //     <Radio
  //       value="5"
  //       label="form based on last 5 games"
  //       className="FormRadio"
  //     />
  //     <Radio
  //       value="6"
  //       label="form based on last 6 games"
  //       className="FormRadio"
  //     />
  //     <Radio
  //       value="10"
  //       label="form based on last 10 games"
  //       className="FormRadio"
  //     />
  //   </div>,
  //   document.getElementById("RadioButtons")
  // );

  // ReactDOM.render(
  //   <TextBlock
  //     text="Select how many games you would like to fetch form data for"
  //     className="RadioText"
  //   />,
  //   document.getElementById("RadioText")
  // );

  ReactDOM.render(
    <div className="FixtureButtons">
      <div className="historicResults">
        <Button
          text={"Last Saturday's predictions"}
          className="HistoricFixturesButton"
          onClickEvent={async () =>
            fixtureList.push(
              await generateFixtures(
                "lastSaturday",
                selectedOption,
                selectedOdds
              )
            )
          }
        />
        <Button
          text={"More historic predictions"}
          className="HistoricFixturesButtonRight"
          onClickEvent={async () =>
            fixtureList.push(
              await generateFixtures("historic", selectedOption, selectedOdds)
            )
          }
        />
      </div>
      <div className="DisclaimerText">
        Current calculations against historic data
      </div>
      <Button
        text={"Yesterday's prediction outcomes"}
        className="FixturesButton"
        onClickEvent={async () =>
          fixtureList.push(
            await generateFixtures(
              "yesterdaysFixtures",
              selectedOption,
              selectedOdds
            )
          )
        }
      />
      <Button
        text={"Today's fixtures"}
        className="FixturesButton"
        onClickEvent={async () =>
          fixtureList.push(
            await generateFixtures(
              "todaysFixtures",
              selectedOption,
              selectedOdds
            )
          )
        }
      />
      <Button
        text={"Tomorrow's fixtures"}
        className="FixturesButton"
        onClickEvent={async () =>
          fixtureList.push(
            await generateFixtures(
              "tomorrowsFixtures",
              selectedOption,
              selectedOdds
            )
          )
        }
      />
    </div>,
    document.getElementById("Buttons")
  );
  ReactDOM.render(
    <div className="OddsRadios">
      <OddsRadio value="Fractional"></OddsRadio>
      <OddsRadio value="Decimal"></OddsRadio>
    </div>,
    document.getElementById("Checkbox")
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
      <div id="Checkbox" />
      <div id="Buttons">
        <ThreeDots className="MainLoading" />
        <div>Loading all fixture and form data...</div>
      </div>
      <div id="successMeasure" />
      <div id="bestPredictions" />
      <div id="BTTS" />
      <div id="longShots" />
      <div id="draws" />
      <div id="homeBadge" />
      <div id="FixtureContainerHeaders"></div>
      <div id="FixtureContainer">
        <div>
          <div className="WelcomeText">
            Global fixtures and predictions from 30 league and cup competitions,
            including
          </div>
          <ul className="AllLeagues">
            <li className="League">Premier League</li>
            <li className="League">La Liga</li>
            <li className="League">Serie A</li>
            <li className="League">Bundesliga</li>
            <li className="League">Ligue 1</li>
            <li className="League">MLS</li>
            <li className="League">Primeira Liga</li>
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
