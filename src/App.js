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

import { generateFixtures } from "./logic/getFixtures";
import { selectedOption } from "./components/radio";
import { ThreeDots } from "react-loading-icons";
// import { Toggles } from "./components/Toggle";
import reactDom from "react-dom";
// require("dotenv").config();

export const proxyurl = "https://safe-caverns-99679.herokuapp.com/";
export var fixtureList = [];
export let allLeagueData = [];

export const availableLeagues = [];
export var orderedLeagues = [];

const leagueOrder = [
  7704, //premier league 22/23
  7593, //championship 22/23
  7570, //league 1 22/23
  7574, //league 2 22/23
  7729, //National league 22/23
  7665, //La Liga 22/23
  7494, //Scottish Prem 22/23
  7664, //Bundesliga 22/23
  7608, //Serie A 22/23
  7500, //French Prem 22/23
  7731, //Portagul Prem 22/23
  7482, //Dutch Prem 22/23
  7544, //Belgian Pro League 22/23
  7064, //sweden 22
  7426, //Danish Prem 22/23
  7048, //Norway Prem 22
  7890, //Austrian Prem 22/23
  7954, //Greek Prem 22/23
  7428, //Polish prem 22/23
  6967, //Irish Prem 22
  4340, //Womens Euros 22
  7592, //Spanish secunda 22/23
  7864, //Italy serie B 22/23
  7499, //Bundesliga 2 22/23
  7591, //German 3rd tier 22/23
  7501, //French League 2 22/23
  7498, //Scottish Championship 22/23
  7505, //Scottish league 1 22/23
  7506, //Scottish league 2 22/23
  7821, //Women's prem 22/23
  6969, //MLS 22
  8008, //Australian A league 22/23
  7097, //Brazil prem 22
  6935, //Japan 22
  7061, //S Korea 22
  7425, //Mexico prem 22/23
  7956, //National league North and South 22/23
];

(async function getLeagueList() {
  let leagueList;

  console.log(process.env.REACT_APP_EXPRESS_SERVER)
  

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
    const league = leagueArray[i];
    const name = leagueArray[i].name;

    for (let x = 0; x < league.season.length; x++) {
      const element = league.season[x];

      if (element.year === 2022 || element.year === 20222023) {
        if (element.id !== 8008 && element.id !== 4340) {
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
      return array;
    }

    //leagues ordered by id

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
          text={"Last Saturday"}
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
          text={"Historic predictions"}
          className="HistoricFixturesButtonRight"
          onClickEvent={async () =>
            fixtureList.push(
              await generateFixtures("historic", selectedOption, selectedOdds)
            )
          }
        />
      </div>
      <Button
        text={"Yesterday"}
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
        text={"Today"}
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
        text={"Tomorrow"}
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
      <OddsRadio value="Fractional odds"></OddsRadio>
      <OddsRadio value="Decimal odds"></OddsRadio>
    </div>,
    document.getElementById("Checkbox")
  );

  // ReactDOM.render(
  //   <div className="Explainer">
  //     <em>
  //       To discount pre-season form and last seasons' games, only matchs taking
  //       place after the 3rd gameweek in their respective leagues are currently
  //       being predicted by default. Click below if you want to see all
  //       predictions (not recommended)
  //     </em>
  //     <div>
  //       <Toggles />
  //     </div>
  //   </div>,
  //   document.getElementById("ExplainerText")
  // );
  // console.log(Toggles.isOff);

  ReactDOM.render(
    <Button
      text={"Lowest scoring leagues"}
      className={"Under25TeamsButton"}
      onClickEvent={async () => {
        let leagues = await getLowestScoringLeagues();
        const leagueList = [];

        leagues.forEach(async (league) =>
          leagueList.push(
            <ul className="GlobalStat">
              <p className="TeamName">
                {league.league} ({league.leagueCountry})
              </p>
              <li>Average goals: {league.averageGoals}</li>
              <li>Under 2.5 goals %: {league.under25Percentage}%</li>
            </ul>
          )
        );

        reactDom.render(
          <div>
            <h3>Leagues with the lowest scoring games</h3>
            <ul>{leagueList}</ul>
          </div>,
          document.getElementById("Under25Games")
        );
      }}
    ></Button>,
    document.getElementById("Under25Games")
  );

  ReactDOM.render(
    <Button
      text={"Highest scoring leagues"}
      className={"Over25TeamsButton"}
      onClickEvent={async () => {
        let leagues = await getHighestScoringLeagues();
        const leagueList = [];

        leagues.forEach(async (league) =>
          leagueList.push(
            <ul className="GlobalStat">
              <p className="TeamName">
                {league.league} ({league.leagueCountry})
              </p>
              <li>Average goals: {league.averageGoals}</li>
              <li>Over 2.5 goals %: {league.over25Percentage}%</li>
            </ul>
          )
        );

        reactDom.render(
          <div>
            <h3>Leagues with the highest scoring games</h3>
            <ul>{leagueList}</ul>
          </div>,
          document.getElementById("Over25Games")
        );
      }}
    ></Button>,
    document.getElementById("Over25Games")
  );
})();

async function getHighestScoringLeagues() {
  let teamsList = await fetch(`${process.env.REACT_APP_EXPRESS_SERVER}over25`);
  let arr = [];
  await teamsList.json().then(async (leagues) => {
    console.log(leagues.data);
    for (let index = 0; index < 215; index++) {
      const league = {
        league: leagues.data.top_leagues.data[index].name,
        leagueCountry: leagues.data.top_leagues.data[index].country,
        averageGoals: leagues.data.top_leagues.data[index].seasonAVG_overall,
        over25Percentage:
          leagues.data.top_leagues.data[index].seasonOver25Percentage_overall,
        division: leagues.data.top_leagues.data[index].division,
        leagueId: leagues.data.top_leagues.data[index].id,
      };
      arr.push(league);
    }
  });

  const finalArray = arr.filter(
    (league) =>
      leagueOrder.find((element) => element === league.leagueId) &&
      league.averageGoals >= 2.5
  );

  let sortedArray = finalArray.sort((a, b) => b.averageGoals - a.averageGoals);

  return sortedArray;
}

async function getLowestScoringLeagues() {
  let teamsList = await fetch(`${process.env.REACT_APP_EXPRESS_SERVER}under25`);
  let arr = [];
  await teamsList.json().then(async (leagues) => {
    console.log(leagues.data);
    for (let index = 0; index < 215; index++) {
      const league = {
        league: leagues.data.top_leagues.data[index].name,
        leagueCountry: leagues.data.top_leagues.data[index].country,
        averageGoals: leagues.data.top_leagues.data[index].seasonAVG_overall,
        under25Percentage:
          leagues.data.top_leagues.data[index].seasonUnder25Percentage_overall,
        leagueId: leagues.data.top_leagues.data[index].id,
      };
      arr.push(league);
    }
  });

  const finalArray = arr.filter(
    (league) =>
      leagueOrder.find((element) => element === league.leagueId) &&
      league.averageGoals < 2.5
  );

  let sortedArray = finalArray.sort((a, b) => a.averageGoals - b.averageGoals);

  return sortedArray;
}

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
      <div id="ExplainerText" />
      <div id="Loading" className="Loading"></div>
      <div id="Buttons" className="Buttons">
        <ThreeDots className="MainLoading" fill="#030061" />
        <div>Loading all fixture and form data...</div>
      </div>
      <div id="GeneratePredictions" className="GeneratePredictions" />
      <div id="bestPredictions" className="bestPredictions" />
      <div id="exoticOfTheDay" className="exoticOfTheDay" />
      <div id="successMeasure2" />
      <div id="RowOneContainer" className="RowOneContainer">
        <div id="BTTS" className="RowOne" />
        <div id="longShots" className="RowOne" />
        <div id="draws" className="RowOne" />
      </div>
      <div id="insights" />
      <div id="successMeasure" />
      <div id="tables" />
      <div id="homeBadge" />
      <div id="FixtureContainerHeaders"></div>
      <div id="XGDiff" />
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
      <div id="Over25Games" className="Over25Games"></div>
      <div id="Under25Games" className="Under25Games"></div>
      <div className="Social">
        <TwitterShareButton
          url={"www.xgtipping.com"}
          title={"#XGTipping"}
          className="ShareButton"
          style={{ backgroundColor: "#e2e2e26c", boxShadow: "none" }}
        >
          <TwitterIcon size={"3em"} round={true} />
        </TwitterShareButton>
        <FacebookShareButton
          url={"www.xgtipping.com"}
          quote={"XGTipping - data-driven football predictions"}
          className="ShareButton"
          style={{ backgroundColor: "#e2e2e26c", boxShadow: "none" }}
        >
          <FacebookIcon size={"3em"} round={true} />
        </FacebookShareButton>
        <RedditShareButton
          url={"www.xgtipping.com"}
          title={"XGTipping"}
          className="ShareButton"
          style={{ backgroundColor: "#e2e2e26c", boxShadow: "none" }}
        >
          <RedditIcon size={"3em"} round={true} />
        </RedditShareButton>
        <WhatsappShareButton
          url={"www.xgtipping.com"}
          title={"XGTipping"}
          separator=": "
          className="ShareButton"
          style={{ backgroundColor: "#e2e2e26c", boxShadow: "none" }}
        >
          <WhatsappIcon size={"3em"} round={true} />
        </WhatsappShareButton>
        <TelegramShareButton
          url={"XGTipping"}
          title={"XGTipping"}
          className="ShareButton"
          style={{ backgroundColor: "#e2e2e26c", boxShadow: "none" }}
        >
          <TelegramIcon size={"3em"} round={true} />
        </TelegramShareButton>
      </div>
    </div>
  );
}

export default App;
