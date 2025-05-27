import React, { Fragment, useEffect } from "react";
import ReactDOM from "react-dom";
import { Button } from "./components/Button";
import OddsRadio from "./components/OddsRadio";
import { Fixture } from "./components/Fixture";
import mockedFixtures from "./data/mockedFixtures.json";
import ThemeToggle from "./components/DarkModeToggle";
import { selectedOdds } from "./components/OddsRadio";
import Collapsable from "./components/CollapsableElement";
import StripePolicies from "./components/Contact";
import { loadStripe } from "@stripe/stripe-js";
import { AuthProvider, useAuth } from "./logic/authProvider";
import { getAuth } from "firebase/auth";
import Login from "./components/Login";
import { getCurrentUser } from "./components/ProtectedContent";
import { userDetail } from "./logic/authProvider";
import { checkUserPaidStatus } from "./logic/hasUserPaid";
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
import Logo from "./components/Logo";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";

export const proxyurl = "https://safe-caverns-99679.herokuapp.com/";
export var fixtureList = [];
export let allLeagueData = [];

export const availableLeagues = [];
export var orderedLeagues = [];

let loggedIn;
export let paid = false;

const leagueOrder = [
  // 11084, //Euro 2024
  // 7432, //World Cup 22
  // 13734, //Nations league 24/25
  12325, //premier league 22/23
  12451, //championship 22/23
  12446, //league 1 22/23
  12422, //league 2 22/23
  12622, //National league 22/23
  12316, //La Liga 22/23
  12455, //Scottish Prem 22/23
  12529, //Bundesliga 22/23
  12530, //Serie A 22/23
  12337, //French Prem 22/23
  12931, //Portagul Prem 22/23
  12322, //Dutch Prem 22/23
  12137, //Belgian Pro League 22/23
  13963, //sweden 24
  12132, //Danish Prem 24/25
  13987, //Norway Prem 23
  12472, //Austrian Prem 22/23
  12734, //Greek Prem 22/23
  12641, //turkey
  12120, //Polish prem 22/23
  12326, //Swiss prem 22/23
  12121, //Croatia 24/25
  12336, //Czecjh 24/25
  13952, //Irish Prem 23
  12321, // Champs league
  12327, //Europa
  12467, //Spanish secunda 22/23
  12621, //Italy serie B 22/23
  12528, //Bundesliga 2 22/23
  // 12623, //German 3rd tier 22/23
  12338, //French League 2 22/23
  12456, //Scottish Championship 22/23
  12474, //Scottish league 1 22/23
  12453, //Scottish league 2 22/23
  12827, //Women's prem 23/24
  13973, //MLS 25,
  14236, //Canada 25
  14231, //Brazil prem 24
  14125, //Argentina prem 23
  12136, //Mexico prem 23/24
  12933, //National league North and South 22/23
  13703, //Australian A league 24/25
  14069, //S Korea 25,
  13960, //Japan 25
  12772, //Saudi 24/25
  13964, // WC Qual Europe,
  10121, // WC Qual SA,
  11426, // WC Qual ConCaf
  12801, // WC Qual Aus,
  // 5874, // Esports eBattle

  //Japan
  //canada
];

// const sofaScoreIds = [
//   {
//     12325: 17, //EPL
//   },
//   {
//     12451: 18 //Championship
//   },
//   {
//     12446: 24 //League 1
//   },
//   {
//     12422: 25 //League 2
//   },
//   {
//     12622: 173 //Conference
//   },
//   {
//     12316:
//   },
//   {},
//   {},
//   {},
//   {},
//   {},
//   {},
//   {},
//   {},
//   {},
//   {},
//   {},
//   {},
//   {},
//   {},
//   {},
//   {},
//   {},
//   {},
//   // 13734, //Nations league 24/25
//   12325, //premier league 22/23
//   12451, //championship 22/23
//   12446, //league 1 22/23
//   12422, //league 2 22/23
//   12622, //National league 22/23
//   12316, //La Liga 22/23
//   12455, //Scottish Prem 22/23
//   12529, //Bundesliga 22/23
//   12530, //Serie A 22/23
//   12337, //French Prem 22/23
//   12931, //Portagul Prem 22/23
//   12322, //Dutch Prem 22/23
//   12137, //Belgian Pro League 22/23
//   13963, //sweden 24
//   12132, //Danish Prem 24/25
//   13987, //Norway Prem 23
//   12472, //Austrian Prem 22/23
//   12734, //Greek Prem 22/23
//   12641, //turkey
//   12120, //Polish prem 22/23
//   12326, //Swiss prem 22/23
//   12121, //Croatia 24/25
//   12336, //Czecjh 24/25
//   13952, //Irish Prem 23
//   12321, // Champs league
//   12327, //Europa
//   12467, //Spanish secunda 22/23
//   12621, //Italy serie B 22/23
//   12528, //Bundesliga 2 22/23
//   // 12623, //German 3rd tier 22/23
//   12338, //French League 2 22/23
//   12456, //Scottish Championship 22/23
//   12474, //Scottish league 1 22/23
//   12453, //Scottish league 2 22/23
//   12827, //Women's prem 23/24
//   13973, //MLS 25,
//   14236, //Canada 25
//   14231, //Brazil prem 24
//   14125, //Argentina prem 23
//   12136, //Mexico prem 23/24
//   12933, //National league North and South 22/23
//   13703, //Australian A league 24/25
//   14069, //S Korea 25,
//   13960, //Japan 25
//   12772, //Saudi 24/25
//   13964, // WC Qual Europe,
//   10121, // WC Qual SA,
//   11426, // WC Qual ConCaf
//   12801, // WC Qual Aus,
// ];

let today;
let todayFootyStats;
let todaySS;
let tomorrow;
let tomorrowFootyStats;
let tomorrowSS;
export let date;
let dateSS;
let dateFootyStats;
let yesterday;
let yesterdayFootyStats;
let yesterdaySS;
let lastSaturday;
let lastSaturdayFootyStats;
let historic;
let historicFootyStats;
let historicSS;
let historicDate;
let string;
let dateString;
let dateString2;
let dateUnformatted;
let todaysDateUnformatted;
let tomorrowsDateUnformatted;
let yesterdaysDateUnformatted;
let saturdayDateUnformatted;

async function calculateDate(dateString) {
  const day = dateString.getDate();
  const month = dateString.getMonth() + 1;
  const year = dateString.getFullYear();
  return [`${month}${day}${year}`, `${year}-${month}-${day}`];
}

(async function fetchLeagueData() {
  let leagueList;
  if (userDetail) {
    paid = await checkUserPaidStatus(userDetail.uid);
  } else {
    paid = false;
  }
  let now = new Date();
  let dateNow = await calculateDate(now);
  leagueList = await fetch(
    `${process.env.REACT_APP_EXPRESS_SERVER}leagueList/${dateNow[0]}`
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

      if (
        element.year === 2025 ||
        element.year === 20242025 ||
        element.year === 2026 ||
        element.year === -1
      ) {
        if (
          element.id !== 5874 &&
          element.id !== 12623 &&
          element.id !== 13734
        ) {
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
  loggedIn = await getCurrentUser();


  async function decrementDate(num, date) {
    i = i - num;
    console.log(i);
    if (i > -120) {
      date.setDate(date.getDate() - num);
      dateUnformatted = date;
      dateSS = await convertTimestampForSofaScore(date);
      [date, dateFootyStats] = await calculateDate(date);
      string = dateFootyStats;
      dateString = date;
      await renderButtons();
    }
  }

  async function incrementDateV2(num, date) {
    i = i + num;
    console.log(i);
    if (i <= 3) {
      date.setDate(date.getDate() + num);
      dateUnformatted = date;
      dateSS = await convertTimestampForSofaScore(date);
      [date, dateFootyStats] = await calculateDate(date);
      string = dateFootyStats;
      dateString = date;
      await renderButtons();
    }
  }

  const todayRaw = new Date();
  const tomorrowsDate = new Date(todayRaw);
  tomorrowsDate.setDate(todayRaw.getDate() + 1);

  const yesterdaysDate = new Date(todayRaw);
  yesterdaysDate.setDate(todayRaw.getDate() - 1);

  const saturdayDate = new Date(todayRaw);
  saturdayDate.setDate(todayRaw.getDate() - ((saturdayDate.getDay() + 6) % 7) - 2);

  const historicDate = new Date(todayRaw);
  historicDate.setDate(todayRaw.getDate() - ((historicDate.getDay() + 6) % 7) - 9);

  // Run calculateDate on all in parallel
  const [
    [today, todayFootyStats],
    [lastSaturday, lastSaturdayFootyStats],
  ] = await Promise.all([
    calculateDate(todayRaw),
    calculateDate(saturdayDate),
  ]);

  async function convertTimestampForSofaScore(timestamp) {
    let newDate = new Date(timestamp);

    let year = newDate.getFullYear();
    let month = String(newDate.getMonth() + 1).padStart(2, "0"); // Adding 1 to month because it is zero-based
    let day = String(newDate.getDate()).padStart(2, "0");

    let converted = `${year}-${month}-${day}`;

    return converted;
  }

  const [
    todaySS,
    lastSaturdaySS,
  ] = await Promise.all([
    convertTimestampForSofaScore(new Date()),
    convertTimestampForSofaScore(saturdayDate),
  ]);

  const text =
    "Select a day you would like to retrieve fixtures for from the options above\n A list of games will be returned once the data has loaded\n Once all fixtures have loaded, click on “Get Predictions” to see our forecasted outcomes for every game\n If a game has completed, the predictions is displayed on the right and the actual result on the left\n Each individual fixture is tappable/clickable. By doing so, you can access a range of detailed stats, from comparative charts, granular performance measures to previous meetings.\n All games are subject to the same automated prediction algorithm with the outcome being a score prediction. Factors that determine the tip include the following, amongst others:\n - Goal differentials\n - Expected goal differentials \n - Attack/Defence performance\n - Form trends over time\n - Home/Away records\n - WDL records\n - Points per game \n - A range of other comparative factors\n  –\n";

  const text2 =
    "A range of tools are available should you wish to use them\n Build a multi - Use the '+' or '-' buttons to add or remove a game deemed to be one of our highest confidence tips from the day\n Exotic of the day: A pre-built exotic multi comprising of our highest confidence tips\n BTTS games: Games where both teams to score is deemed a likely outcome\n Over 2.5 goals tips: Games where over 2.5 goals are most likely to be scored\n SSH tips: Comprises only games where the expected goal differentials between each team are at their greatest. We believe this shows a true disparity in the form of the two opposing teams\n Tap the 'How to use' option to hide this text";

  let textJoined = text.concat(text2);

  let newText = textJoined.split("\n").map((i) => {
    return <p>{i}</p>;
  });

  async function renderButtons(loginStatus) {
    ReactDOM.render(
      <div className="FixtureButtons">
        <h6>{loginStatus}</h6>
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
                  today,
                  lastSaturdaySS,
                  saturdayDateUnformatted
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
                today,
                dateSS,
                dateUnformatted
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
                today,
                todaySS,
                todaysDateUnformatted
              )
            )
          }
        />
        <Button
          text={`>`}
          className="FixturesButton"
          onClickEvent={async () => await incrementDateV2(1, date)}
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
                today,
                lastSaturdaySS,
                saturdayDateUnformatted
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
              today,
              todaySS,
              todaysDateUnformatted
            )
          )
        }
      />
      <Button
        text={`>`}
        className="FixturesButton"
        onClickEvent={async () => await incrementDateV2(1, date)}
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

  if (loggedIn) {
    ReactDOM.render(
      <h6>Welcome back {loggedIn.email}</h6>,
      document.getElementById("Email")
    );
  } else {
    ReactDOM.render(<Login />, document.getElementById("Email"));
  }
}

// Replace with your own Stripe public key
const stripePromise = loadStripe(
  "pk_live_51QojxLBrqiWlVPadBxhtoj499YzoC8YjFUIVQwCcTe8B7ZUG47NbYAam2wvNox2mUmzd0WgQh4PWKaIQaxKxubig00yEzjNuVQ"
);

const handleCheckout = async (priceId) => {
  const stripe = await stripePromise;
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    alert("Please sign-up or login before purchasing");
    return;
  }

  const response = await fetch(
    `${process.env.REACT_APP_EXPRESS_SERVER}create-checkout-session`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ priceId, uid: user.uid }), // Send uid
    }
  );

  const session = await response.json();

  const result = await stripe.redirectToCheckout({ sessionId: session.id });

  if (result.error) {
    console.error("Checkout error:", result.error.message);
  }
};

const welcomeTextUnsplitOne = `Your Ultimate Source for In-Depth Soccer Statistics, AI Analysis and Tips. At Soccer Stats Hub, we specialize in providing comprehensive head-to-head stats, cutting-edge XG metrics, and intelligent AI previews. Our unique bespoke multi-builder tips, powered by comparative data, offers unparalleled depth for serious soccer enthusiasts and analysts.\n `;
let welcomeTextOne = welcomeTextUnsplitOne.split("\n").map((i) => {
  return <p>{i}</p>;
});

function AppContent() {
  const { user, isPaidUser } = useAuth();

  getLeagueList();

  return (
    <div className="App">
      <div className="DarkMode">
        <ThemeToggle />
      </div>
      <Logo />
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
      <div id="Email" className="Email"></div>
      <div id="Day" />
      <div id="Checkbox" />
      <div id="ExplainerText" />
      <div id="Loading" className="Loading"></div>
      <div id="Buttons" className="Buttons">
        <ThreeDots className="MainLoading" fill="#030061" />
        <div>Loading all fixture and form data...</div>
      </div>

      {user ? (
        isPaidUser ? (
          // If the user is logged in and is a paying customer, show the cancel button
          <div />
        ) : (
          // If the user is logged in but is NOT a paying customer, show subscribe buttons
          <div>
            <span className="MembershipInfo">
              Full fixtures and AI predictions are restricted to premium
              members. Memberships can be cancelled at any time and prices will
              differ in currencies other than GBP. Payments are securely hosted
              by Stripe.
            </span>
            <button
              onClick={() => handleCheckout("price_1QrQ4ZBrqiWlVPadCkhLhtiZ")}
              className="SubscribeButton"
            >
              Subscribe for £1/week
            </button>
            <button
              onClick={() => handleCheckout("price_1QrQ5NBrqiWlVPadFBuBKKSM")}
              className="SubscribeButton"
            >
              Subscribe for £3/month
            </button>
            <button
              onClick={() => handleCheckout("price_1QrQ75BrqiWlVPadEML30BoJ")}
              className="SubscribeButton"
            >
              Subscribe for £30/year
            </button>
          </div>
        )
      ) : (
        // If the user is not logged in, show nothing
        <div></div>
      )}

      <div id="GeneratePredictions" className="GeneratePredictions" />
      <div id="MultiPlaceholder" className="MultiPlaceholder" />
      <div id="shortlistRender" />
      <div id="successMeasure2" />
      <div id="highLowLeagues" className="HighLowLeagues" />
      <div id="risk" />
      <div id="successMeasure" />
      <div id="tables" />
      <div id="homeBadge" />
      <div id="FixtureContainerHeaders"></div>

      <div id="FixtureContainer">
        <h6 className="WelcomeText">{welcomeTextOne}</h6>
        <div>
          <h6 className="WelcomeText">
            Stats and tips from 40+ leagues and cups, including
            <ul className="AllLeagues" key="league-list">
              <li className="League" key="premier-league">
                Premier League
              </li>
              <li className="League" key="english-football-league">
                English Football League
              </li>
              <li className="League" key="la-liga">
                La Liga
              </li>
              <li className="League" key="serie-a">
                Serie A
              </li>
              <li className="League" key="bundesliga">
                Bundesliga
              </li>
              <li className="League" key="ligue-1">
                Ligue 1
              </li>
              <li className="League" key="mls">
                MLS
              </li>
              <li className="League" key="primeira-liga">
                Primeira Liga
              </li>
              <li className="League" key="champions-league">
                UEFA Champions League
              </li>
              <li className="League" key="loads-more">
                Loads more...
              </li>
            </ul>
          </h6>
        </div>
        <h6 className="GetMatchStatText">
          Games shown below for illustrative purposes only
        </h6>
        <div id="Checkbox" />

        {/* <div className="ExplainerContainer">
          <span className="oddsHomeExplainer">Home odds</span>
          <span className="emptyHomeTeam"></span>
          <span className="scoreExplainer">Result / KO Time</span>
          <span className="predictionExplainer">Our Prediction</span>
          <span className="emptyAwayTeam"></span>
          <span className="oddsAwayExplainer">Away odds</span>
        </div> */}

        <Fixture
          fixtures={mockedFixtures.matches}
          mock={true}
          className={"individualFixture"}
        />
      </div>
      <div id="XGDiff" />

      {user ? (
        isPaidUser ? (
          // If the user is logged in and is a paying customer, show the cancel button
          <button
            onClick={() => {
              window.location.href =
                "https://www.soccerstatshub.com/#/cancelsubscription";
            }}
            className="CancelButton"
          >
            Cancel Subscription
          </button>
        ) : (
          <div />
        )
      ) : (
        // If the user is not logged in, show nothing
        <div></div>
      )}
      <div className="bitcoin" id="bitcoin">
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
      <div className="Social">
        <TwitterShareButton
          url={"www.soccerstatshub.com"}
          title={"#SoccerStatsHub"}
          className="ShareButton"
        >
          <TwitterIcon size={"3em"} round={true} />
        </TwitterShareButton>
        <RedditShareButton
          url={"www.soccerstatshub.com"}
          title={"Soccer Stats Hub"}
          className="ShareButton"
        >
          <RedditIcon size={"3em"} round={true} />
        </RedditShareButton>
        <FacebookShareButton
          url={"www.soccerstatshub.com"}
          quote={"SoccerStatsHub - data-driven football predictions"}
          className="ShareButton"
        >
          <FacebookIcon size={"3em"} round={true} />
        </FacebookShareButton>
        <WhatsappShareButton
          url={"www.soccerstatshub.com"}
          title={"SoccerStatsHub"}
          separator=": "
          className="ShareButton"
        >
          <WhatsappIcon size={"3em"} round={true} />
        </WhatsappShareButton>
        <TelegramShareButton
          url={"SoccerStatsHub"}
          title={"Soccer Stats Hub"}
          className="ShareButton"
        >
          <TelegramIcon size={"3em"} round={true} />
        </TelegramShareButton>
      </div>

      <Collapsable buttonText={"Contact"} element={<StripePolicies />} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<AppContent />} />
      </Routes>
    </AuthProvider>
  );
}
