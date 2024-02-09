import React, { Fragment } from "react";
import ReactDOM from "react-dom";
import Header from "./components/Header";
import { Button } from "./components/Button";
import OddsRadio from "./components/OddsRadio";
import { Fixture } from "./components/Fixture";
import mockedFixtures from "./data/mockedFixtures.json";
import { selectedOdds } from "./components/OddsRadio";
import Collapsable from "./components/CollapsableElement";
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
import { ThreeDots } from "react-loading-icons";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import reactDom from "react-dom";
// require("dotenv").config();

export const proxyurl = "https://safe-caverns-99679.herokuapp.com/";
export var fixtureList = [];
export let allLeagueData = [];

export const availableLeagues = [];
export var orderedLeagues = [];

const leagueOrder = [
  7432, //World Cup 22
  9660, //premier league 22/23
  9663, //championship 22/23
  9582, //league 1 22/23
  9581, //league 2 22/23
  9700, //National league 22/23
  9665, //La Liga 22/23
  9636, //Scottish Prem 22/23
  9655, //Bundesliga 22/23
  9697, //Serie A 22/23
  9674, //French Prem 22/23
  9984, //Portagul Prem 22/23
  9653, //Dutch Prem 22/23
  9577, //Belgian Pro League 22/23
  8737, //sweden 23
  9545, //Danish Prem 22/23
  8739, //Norway Prem 23
  9954, //Austrian Prem 22/23
  9889, //Greek Prem 22/23
  9553, //Polish prem 22/23
  9580, //Swiss prem 22/23
  8741, //Irish Prem 23
  9675, //Spanish secunda 22/23
  9808, //Italy serie B 22/23
  9656, //Bundesliga 2 22/23
  9741, //German 3rd tier 22/23
  9621, //French League 2 22/23
  9637, //Scottish Championship 22/23
  9639, //Scottish league 1 22/23
  9638, //Scottish league 2 22/23
  9890, //Women's prem 23/24
  8777, //MLS 23
  9035, //Brazil prem 23
  8595, //Argentina prem 23
  // 6935, //Japan 22
  9525, //Mexico prem 23/24
  9972, //National league North and South 22/23
  10505, //Australian A league 23/24
  8899, //S Korea 23
];

let today;
let todayFootyStats;
let tomorrow;
let tomorrowFootyStats;
let date;
let dateFootyStats;
let yesterday;
let yesterdayFootyStats;
let lastSaturday;
let lastSaturdayFootyStats;
let historic;
let historicFootyStats;
let tomorrowsDate;
let yesterdaysDate;
let saturdayDate;
let historicDate;
let string;
let dateString;

(async function fetchLeagueData() {
  let leagueList;

  leagueList = await fetch(`${process.env.REACT_APP_EXPRESS_SERVER}leagueList`);

  let leagueArray;
  await leagueList.json().then((leagues) => {
    leagueArray = Array.from(leagues.data);
  });

  for (let i = 0; i < leagueArray.length; i++) {
    const league = leagueArray[i];
    const name = leagueArray[i].name;

    for (let x = 0; x < league.season.length; x++) {
      const element = league.season[x];

      if (element.year === 2023 || element.year === 20232024) {
        if (element.id !== 4340 && element.id !== 6935 && element.id !== 7061) {
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
  return orderedLeagues;
})();

export async function getLeagueList() {
  let i = 0;
  date = new Date();
  string = "Today";

  async function incrementDate(num, date) {
    i = i + num;
    date.setDate(date.getDate() + num);
    [date, dateFootyStats] = await calculateDate(date);
    string = dateFootyStats;
    await renderButtons();
  }

  async function decrementDate(num, date) {
    i = i - num;
    console.log(i);
    if (i > -60) {
      date.setDate(date.getDate() - num);
      [date, dateFootyStats] = await calculateDate(date);
      string = dateFootyStats;
      dateString = date;
      await renderButtons();
    }
  }

  async function calculateDate(dateString) {
    const day = dateString.getDate();
    const month = dateString.getMonth() + 1;
    const year = dateString.getFullYear();
    return [`${month}${day}${year}`, `${year}-${month}-${day}`];
  }

  [today, todayFootyStats] = await calculateDate(new Date());

  tomorrowsDate = new Date();
  tomorrowsDate.setDate(tomorrowsDate.getDate() + 1);
  [tomorrow, tomorrowFootyStats] = await calculateDate(tomorrowsDate);

  yesterdaysDate = new Date();
  yesterdaysDate.setDate(yesterdaysDate.getDate() - 1);
  [yesterday, yesterdayFootyStats] = await calculateDate(yesterdaysDate);

  saturdayDate = new Date();
  saturdayDate.setDate(
    saturdayDate.getDate() - ((saturdayDate.getDay() + 6) % 7)
  );
  saturdayDate.setDate(saturdayDate.getDate() - 2);
  [lastSaturday, lastSaturdayFootyStats] = await calculateDate(saturdayDate);

  historicDate = new Date();
  historicDate.setDate(
    historicDate.getDate() - ((historicDate.getDay() + 6) % 7)
  );
  historicDate.setDate(historicDate.getDate() - 9);
  [historic, historicFootyStats] = await calculateDate(historicDate);

  const text =
    "Select a day you would like to retrieve fixtures for from the options above\n A list of games will be returned once the data has loaded\n Once all fixtures have loaded, click on “Get Predictions” to see XGTipping's forecasted outcomes for every game\n If a game has completed, the predictions is displayed on the right and the actual result on the left\n Each individual fixture is tappable/clickable. By doing so, you can access a range of detailed stats, from comparative charts, granular performance measures to previous meetings.\n All games are subject to the same automated prediction algorithm with the outcome being a score prediction. Factors that determine the tip include the following, amongst others:\n - Goal differentials\n - Expected goal differentials \n - Attack/Defence performance\n - Form trends over time\n - Home/Away records\n - WDL records\n - Points per game \n - A range of other comparative factors\n  –\n";

  const text2 =
    "A range of tools are available should you wish to use them\n Build a multi - Use the '+' or '-' buttons to add or remove a game deemed to be one of XGTIpping's highest confidence tips from the day\n Exotic of the day: A pre-built exotic multi comprising of XGTipping's highest confidence tips\n BTTS games: Games where both teams to score is deemed a likely outcome\n Over 2.5 goals tips: Games where over 2.5 goals are most likely to be scored\n XG tips: Comprises only games where the expected goal differentials between each team are at their greatest. We believe this shows a true disparity in the form of the two opposing teams\n Tap the 'How to use' option to hide this text";

  let textJoined = text.concat(text2);

  let newText = textJoined.split("\n").map((i) => {
    return <p>{i}</p>;
  });

  async function renderButtons() {
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
                  lastSaturday,
                  selectedOdds,
                  lastSaturdayFootyStats,
                  false,
                  today
                )
              )
            }
          />
        </div>
        <Button
          text={`<`}
          className="FixturesButton"
          onClickEvent={async () => await decrementDate(1, date)}
        />
        <Button
          text={dateFootyStats !== undefined ? dateFootyStats : date}
          className="FixturesButton"
          onClickEvent={async () =>
            fixtureList.push(
              await generateFixtures(
                "todaysFixtures",
                dateString,
                selectedOdds,
                dateFootyStats,
                false,
                today
              )
            )
          }
        />
        <Button
          text={`Today`}
          className="FixturesButtonToday"
          onClickEvent={async () =>
            fixtureList.push(
              await generateFixtures(
                "todaysFixtures",
                today,
                selectedOdds,
                todayFootyStats,
                true,
                today
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
                tomorrow,
                selectedOdds,
                tomorrowFootyStats,
                true,
                today
              )
            )
          }
        />
      </div>,
      document.getElementById("Buttons")
    );
  }

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
                lastSaturday,
                selectedOdds,
                lastSaturdayFootyStats,
                false,
                today
              )
            )
          }
        />
        {/* <Button
          text={"Historic predictions"}
          className="HistoricFixturesButtonRight"
          onClickEvent={async () =>
            fixtureList.push(
              await generateFixtures(
                "historic",
                historic,
                selectedOdds,
                historicFootyStats
              )
            )
          }
        /> */}
      </div>
      <Button
        text={`<`}
        className="FixturesButton"
        onClickEvent={async () => await decrementDate(1, date)}
      />
      <Button
        text={`${string}`}
        className="FixturesButtonToday"
        onClickEvent={async () =>
          fixtureList.push(
            await generateFixtures(
              "todaysFixtures",
              today,
              selectedOdds,
              todayFootyStats,
              true,
              today
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
              tomorrow,
              selectedOdds,
              tomorrowFootyStats,
              true,
              today
            )
          )
        }
      />
      <span>
        *Not enough data to predict games in the first few gameweeks -
        predictions displayed as 'x - x'
      </span>
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
  ReactDOM.render(
    <Fragment>
      <Collapsable
        // className={"HowToUse"}
        buttonText={"How to use"}
        element={newText}
      />
    </Fragment>,
    document.getElementById("XGDiff")
  );

  // ReactDOM.render(
  //   <Button
  //     text={"Lowest scoring leagues"}
  //     className={"Under25TeamsButton"}
  //     onClickEvent={async () => {
  //       let leagues = await getLowestScoringLeagues();
  //       const leagueList = [];

  //       leagues.forEach(async (league) =>
  //         leagueList.push(
  //           <ul className="GlobalStat">
  //             <p className="TeamName">
  //               {league.league} ({league.leagueCountry})
  //             </p>
  //             <li>Average goals: {league.averageGoals}</li>
  //             <li>Under 2.5 goals %: {league.under25Percentage}%</li>
  //           </ul>
  //         )
  //       );

  //       reactDom.render(
  //         <div>
  //           <h3>Leagues with the lowest scoring games</h3>
  //           <ul>{leagueList}</ul>
  //         </div>,
  //         document.getElementById("Under25Games")
  //       );
  //     }}
  //   ></Button>,
  //   document.getElementById("Under25Games")
  // );

  // ReactDOM.render(
  //   <Button
  //     text={"Highest scoring leagues"}
  //     className={"Over25TeamsButton"}
  //     onClickEvent={async () => {
  //       let leagues = await getHighestScoringLeagues();
  //       const leagueList = [];

  //       leagues.forEach(async (league) =>
  //         leagueList.push(
  //           <ul className="GlobalStat">
  //             <p className="TeamName">
  //               {league.league} ({league.leagueCountry})
  //             </p>
  //             <li>Average goals: {league.averageGoals}</li>
  //             <li>Over 2.5 goals %: {league.over25Percentage}%</li>
  //           </ul>
  //         )
  //       );

  //       reactDom.render(
  //         <div>
  //           <h3>Leagues with the highest scoring games</h3>
  //           <ul>{leagueList}</ul>
  //         </div>,
  //         document.getElementById("Over25Games")
  //       );
  //     }}
  //   ></Button>,
  //   document.getElementById("Over25Games")
  // );
}

async function getHighestScoringLeagues() {
  let teamsList = await fetch(`${process.env.REACT_APP_EXPRESS_SERVER}over25`);
  let arr = [];
  await teamsList.json().then(async (leagues) => {
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

const welcomeTextUnsplitOne = `Welcome to XGTipping. Your go-to resource for all things football, from predictions, comprehensive head to head stats, results, xg scores, odds, league tables, form, and bespoke multi-builders underpinned by expected goal (XG) data.\n `;
let welcomeTextOne = welcomeTextUnsplitOne.split("\n").map((i) => {
  return <p>{i}</p>;
});

const welcomeTextUnsplitTwo = `XGTipping is completely independent and free to use, relying on a donation model to support running costs. For feedback or feature ideas, get in touch at @TippingXg.`;
let welcomeTextTwo = welcomeTextUnsplitTwo.split("\n").map((i) => {
  return <p>{i}</p>;
});

function App() {
  getLeagueList();
  return (
    <>
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
        <div id="risk" />
        <div id="successMeasure" />
        <div id="tables" />
        <div id="homeBadge" />
        <div id="FixtureContainerHeaders"></div>
        {/* <StyledKofiButton buttonText="Donations"></StyledKofiButton> */}
        <div id="XGDiff" />
        <div id="FixtureContainer">
          <h6 className="WelcomeText">{welcomeTextOne}</h6>
          <h6 className="GetMatchStatText">
            Below is an example of our tips/results overview for you to
            familiarise yourself with. Get real fixtures using the date buttons,
            above. When loaded, tap on one to see full match stats
          </h6>
          <div className="ExplainerContainer">
            <span className="oddsHomeExplainer">Home odds</span>
            <span className="emptyHomeTeam"></span>
            <span className="scoreExplainer">Result / KO Time</span>
            <span className="predictionExplainer">Our Prediction</span>
            <span className="emptyAwayTeam"></span>
            <span className="oddsAwayExplainer">Away odds</span>
          </div>
          <Fixture
            fixtures={mockedFixtures.matches}
            // result={false}
            mock={true}
            className={"individualFixture"}
          />
          <div>
            <h6 className="WelcomeText">{welcomeTextTwo}</h6>
            <h6 className="WelcomeText">
              We cover a range of leagues, including
              <ul className="AllLeagues">
                <li className="League">Premier League</li>
                <li className="League">English Football League</li>
                <li className="League">La Liga</li>
                <li className="League">Serie A</li>
                <li className="League">Bundesliga</li>
                <li className="League">Ligue 1</li>
                <li className="League">MLS</li>
                <li className="League">Primeira Liga</li>
                <li className="League">Loads more...</li>
              </ul>
            </h6>
          </div>
          <div>
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
          <div className="bitcoin" id="bitcoin">
            We aim to remain free to use, contributions are always appreciated
            though:
            <a
              href="https://www.ko-fi.com/xgtipping"
              target="_blank"
              rel="noreferrer"
            >
              Donations
            </a>
            <span className="bitcoinSymbol">&#x20bf;itcoin address</span>
            <span className="bitcoinAddress">
              bc1q7j62txkvhfu0dt3l0s07saze6pjnyzs26wfgp0
            </span>
          </div>
        </div>
        <div className="Social">
          <TwitterShareButton
            url={"www.xgtipping.com"}
            title={"#XGTipping"}
            className="ShareButton"
            style={{
              backgroundColor: "white",
              boxShadow: "none",
              padding: "0.5em",
            }}
          >
            <TwitterIcon size={"3em"} round={true} />
          </TwitterShareButton>
          <RedditShareButton
            url={"www.xgtipping.com"}
            title={"XGTipping"}
            className="ShareButton"
            style={{
              backgroundColor: "white",
              boxShadow: "none",
              padding: "0.5em",
            }}
          >
            <RedditIcon size={"3em"} round={true} />
          </RedditShareButton>
          <FacebookShareButton
            url={"www.xgtipping.com"}
            quote={"XGTipping - data-driven football predictions"}
            className="ShareButton"
            style={{
              backgroundColor: "white",
              boxShadow: "none",
              padding: "0.5em",
            }}
          >
            <FacebookIcon size={"3em"} round={true} />
          </FacebookShareButton>
          <WhatsappShareButton
            url={"www.xgtipping.com"}
            title={"XGTipping"}
            separator=": "
            className="ShareButton"
            style={{
              backgroundColor: "white",
              boxShadow: "none",
              padding: "0.5em",
            }}
          >
            <WhatsappIcon size={"3em"} round={true} />
          </WhatsappShareButton>
          <TelegramShareButton
            url={"XGTipping"}
            title={"XGTipping"}
            className="ShareButton"
            style={{
              backgroundColor: "white",
              boxShadow: "none",
              padding: "0.5em",
            }}
          >
            <TelegramIcon size={"3em"} round={true} />
          </TelegramShareButton>
        </div>
      </div>
    </>
  );
}

export default App;

// import React from "react";
// import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
// import HomePage from "./components/HomePage";
// import TeamPage from "./components/Team";

// const App = () => {
//   return (
//     <Router>
//       <Routes>
//       <Route path="/team" element={<TeamPage />} />
//         <Route path="/" element={<HomePage />} />
//         {/* Add more routes */}
//       </Routes>
//     </Router>
//   );
// };

// export default App;
