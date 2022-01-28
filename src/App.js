import React from "react";
import ReactDOM from "react-dom";
import Header from "./components/Header";
import { Button } from "./components/Button";
import OddsRadio from "./components/OddsRadio";
import { selectedOdds } from "./components/OddsRadio";
import {
  FacebookShareButton,
  FacebookIcon,
  RedditShareButton,
  RedditIcon,
  TelegramShareButton,
  TelegramIcon,
  TwitterShareButton,
  TwitterIcon,
  WhatsappShareButton,
  WhatsappIcon,
} from "react-share";

import {
  generateFixtures,
} from "./logic/getFixtures";
import { selectedOption } from "./components/radio";
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

      if (element.year === 20212022 || element.year === 2021) {
        if (element.id !== 5784) {
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
      5948, //Polish prem 21/22
      5534, //Irish Prem 21
      6120, //Spanish secunda 21/22
      6205, //
      6020, //Bundesliga 2 21/22
      6018, //French League 2 21/22
      5991, //Scottish Championship
      5976, //Scottish league 1 21/22
      5974, //Scottish league 2 21/22
      6173, //Women's prem 21/22
      5674, //MLS 21
      6639, //Australian A league 21
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
      <div id="exoticOfTheDay" />
      <div id="BTTS" />
      <div id="longShots" />
      <div id="draws" />
      <div id="insights" />
      <div id="tables" />
      <div id="homeBadge" />
      <div id="FixtureContainerHeaders"></div>
      <div id="FixtureContainer">
        <div>
          <div className="WelcomeText">
            Global fixtures and predictions from 30+ league competitions,
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
          <div className="DataText">Raw data from</div>
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
      <div className="Social">
        <TwitterShareButton
          url={"www.xgtipping.com"}
          title={"#XGTipping"}
          className="ShareButton"
          style={{ backgroundColor: "#294A66", boxShadow: "none" }}
        >
          <TwitterIcon size={"3em"} round={true} />
        </TwitterShareButton>
        <FacebookShareButton
          url={"www.xgtipping.com"}
          quote={"XGTipping - data-driven football predictions"}
          className="ShareButton"
          style={{ backgroundColor: "#294A66", boxShadow: "none" }}
        >
          <FacebookIcon size={"3em"} round={true} />
        </FacebookShareButton>
        <RedditShareButton
          url={"www.xgtipping.com"}
          title={"XGTipping"}
          className="ShareButton"
          style={{ backgroundColor: "#294A66", boxShadow: "none" }}
        >
          <RedditIcon size={"3em"} round={true} />
        </RedditShareButton>
        <WhatsappShareButton
          url={"www.xgtipping.com"}
          title={"XGTipping"}
          separator=": "
          className="ShareButton"
          style={{ backgroundColor: "#294A66", boxShadow: "none" }}
        >
          <WhatsappIcon size={"3em"} round={true} />
        </WhatsappShareButton>
        <TelegramShareButton
          url={"XGTipping"}
          title={"XGTipping"}
          className="ShareButton"
          style={{ backgroundColor: "#294A66", boxShadow: "none" }}
        >
          <TelegramIcon size={"3em"} round={true} />
        </TelegramShareButton>
      </div>
    </div>
  );
}

export default App;
