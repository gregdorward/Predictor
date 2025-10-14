import { Fragment, useEffect, useState, lazy, Suspense } from "react";
import ReactDOM from "react-dom";
import { Button } from "./components/Button";
import OddsRadio from "./components/OddsRadio";
import PredictionTypeRadio from "./components/PredictionTypeRadio";
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
import HamburgerMenu from "./components/HamburgerMenu";
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
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import PrivacyPolicy from "./components/PrivacyPolicy";
import Over18Badge from './components/images/18.png';

export const proxyurl = "https://safe-caverns-99679.herokuapp.com/";
export var fixtureList = [];
export let allLeagueData = [];

export const availableLeagues = [];
export var orderedLeagues = [];

let loggedIn;
export let paid = false;
const LazyLogo = lazy(() => import('./components/Logo'));


const menuItems = ['Home', 'bttsteams', 'Services', 'Contact'];

const leagueOrder = [
  15050, //premier league 25 12325
  14930, //championship 25 12451
  14934, //league 1 25 12446
  14935, //league 2 25 12422
  15657, //National league 25 12622
  15845, //National league north 25
  15844, //National league south 25
  14956, //La Liga 25 12316
  15000, //Scottish Prem 25 12455
  14968, //Bundesliga 25 12529
  15068, //Serie A 25 12530
  14932, //French Prem 25 12337
  15115, //Portagul Prem 25 12931
  14936, //Dutch Prem 25 12322
  14937, //Belgian Pro League 25 12137
  16263, //sweden 25
  15055, //Danish Prem 24/25 12132
  16260, //Norway Prem 25
  14923, //Austrian Prem 25 12472
  15163, //Greek Prem 25 12734
  14972, //turkey 25 12641
  15031, //Polish prem 25 12120
  15047, //Swiss prem 25 12326
  15053, //Croatia 25 12121
  14973, //Czecjh 25 12336
  14089, // Finland 25 14089
  // 14951, // Ulraine 25 12483
  // 15065, // Serbia 25 12138
  // 15063, // Slovenia 25 12476
  // 14933, // Slovakia 25 12944
  13952, //Irish Prem 25
  15066, //Spanish secunda 25 12467
  15632, //Italy serie B 24 12621
  14931, //Bundesliga 2 25 12528
  14954, //French League 2 25 12338
  14987, //Dutch League 2 25
  15061, //Scottish Championship 25 12456
  14943, //Scottish league 1 25 12474
  15209, //Scottish league 2 25 12453
  15478, //Women's prem 25 12827
  13973, //MLS 25,
  13967, // USL Championship 25
  14226, // US Open Cup 25
  14236, //Canada 25
  14231, //Brazil prem 25
  14305, // Brazil Serie B 25
  15746, //Argentina prem 23 15310
  // 14086, // Columbia 25
  // 14116, // Chile 25
  // 14626, // Uraguay 25
  15234, //Mexico prem 25 12136
  12933, //National league North and South 24
  16036, //Australian A league 24/25 13703
  16243, //S Korea 25,
  16242, //Japan 25
  12772, //Saudi 24/25
  13964, // WC Qual Europe 26,
  10121, // WC Qual SA 26,
  // 11426, // WC Qual ConCaf 26
  // 12801, // WC Qual Aus 26,
  14056, // Womens Euros 25
  13734, //Nations league 24
  14924, // Champs league 25 12321
  15002, //Europa 25 12327
  14904, //Europa Conference 25 12278
  16261, // Copa Libertadores 25
];

// const sofaScoreIds = [
//   {
//     15050: 17, //EPL
//   },
//   {
//     14930: 18 //Championship
//   },
//   {
//     14934: 24 //League 1
//   },
//   {
//     14935: 25 //League 2
//   },
//   {
//     12622: 173 //Conference
//   },
//   {
//     14956:
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
//   15050, //premier league 22/23
//   14930, //championship 22/23
//   14934, //league 1 22/23
//   14935, //league 2 22/23
//   12622, //National league 22/23
//   14956, //La Liga 22/23
//   15000, //Scottish Prem 22/23
//   14968, //Bundesliga 22/23
//   15068, //Serie A 22/23
//   14932, //French Prem 22/23
//   15115, //Portagul Prem 22/23
//   14936, //Dutch Prem 22/23
//   14937, //Belgian Pro League 22/23
//   16263, //sweden 24
//   15055, //Danish Prem 24/25
//   16260, //Norway Prem 23
//   14923, //Austrian Prem 22/23
//   15163, //Greek Prem 22/23
//   14972, //turkey
//   15031, //Polish prem 22/23
//   15047, //Swiss prem 22/23
//   15053, //Croatia 24/25
//   14973, //Czecjh 24/25
//   13952, //Irish Prem 23
//   14924, // Champs league
//   15002, //Europa
//   15066, //Spanish secunda 22/23
//   12621, //Italy serie B 22/23
//   14931, //Bundesliga 2 22/23
//   // 12623, //German 3rd tier 22/23
//   14954, //French League 2 22/23
//   15061, //Scottish Championship 22/23
//   14943, //Scottish league 1 22/23
//   15209, //Scottish league 2 22/23
//   12827, //Women's prem 23/24
//   13973, //MLS 25,
//   14236, //Canada 25
//   14231, //Brazil prem 24
//   15310, //Argentina prem 23
//   15234, //Mexico prem 23/24
//   12933, //National league North and South 22/23
//   16036, //Australian A league 24/25
//   16243, //S Korea 25,
//   16242, //Japan 25
//   12772, //Saudi 24/25
//   13964, // WC Qual Europe,
//   10121, // WC Qual SA,
//   11426, // WC Qual ConCaf
//   12801, // WC Qual Aus,
// ];

export let date;
let dateSS;
let dateFootyStats;
let string;
let dateString;
let dateUnformatted;
let todaysDateUnformatted;

async function calculateDate(dateString) {
  const day = dateString.getDate();
  const month = dateString.getMonth() + 1;
  const year = dateString.getFullYear();
  return [`${month}${day}${year}`, `${year}-${month}-${day}`];
}

async function convertTimestampForSofaScore(timestamp) {
  let newDate = new Date(timestamp);

  let year = newDate.getFullYear();
  let month = String(newDate.getMonth() + 1).padStart(2, "0"); // Adding 1 to month because it is zero-based
  let day = String(newDate.getDate()).padStart(2, "0");

  let converted = `${year}-${month}-${day}`;

  return converted;
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
  console.log(dateNow)
  leagueList = await fetch(
    `${process.env.REACT_APP_EXPRESS_SERVER}leagueList/${dateNow[0]}`
  );

  let leagueArray;
  await leagueList.json().then((leagues) => {
    leagueArray = Array.from(leagues.data);
  });

  console.log(leagueArray)
  for (let i = 0; i < leagueArray.length; i++) {
    const league = leagueArray[i];
    const name = leagueArray[i].name;

    for (let x = 0; x < league.season.length; x++) {
      const element = league.season[x];

      if (
        element.year === 2025 ||
        element.year === 20252026 ||
        element.year === 2026 ||
        element.year === -1
      ) {
        if (
          element.id !== 5874 &&
          element.id !== 12623
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
    if (i <= 4) {
      date.setDate(date.getDate() + num);
      dateUnformatted = date;
      dateSS = await convertTimestampForSofaScore(date);
      [date, dateFootyStats] = await calculateDate(date);
      string = dateFootyStats;
      dateString = date;
      console.log(dateString);
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
    [today, todayFootyStats]
  ] = await Promise.all([
    calculateDate(todayRaw)
  ]);

  const [
    todaySS,
  ] = await Promise.all([
    convertTimestampForSofaScore(new Date())
  ]);

  const text =
    "Select a day you would like to retrieve fixtures for from the options above\n A list of games will be returned once the data has loaded\n Once all fixtures have loaded, click on “Get Predictions and Stats” to see our forecasted outcomes for every game\n If a game has completed, the predictions is displayed on the right and the actual result on the left\n Each individual fixture is tappable/clickable. By doing so, you can access a range of detailed stats, from comparative charts, granular performance measures to previous meetings.\n All games are subject to the same automated prediction algorithm with the outcome being a score prediction. Factors that determine the tip include the following, amongst others:\n - Goal differentials\n - Expected goal differentials \n - Attack/Defence performance\n - Form trends over time\n - Home/Away records\n - WDL records\n - Points per game \n - A range of other comparative factors\n  –\n";

  const text2 =
    "A range of tools are available should you wish to use them\n Build a multi - Use the '+' or '-' buttons to add or remove a game deemed to be one of our highest confidence tips from the day\n Exotic of the day: A pre-built exotic multi comprising of our highest confidence tips\n BTTS games: Games where both teams to score is deemed a likely outcome\n Over 2.5 goals tips: Games where over 2.5 goals are most likely to be scored\n SSH Tips: Comprises only games where the expected goal differentials between each team are at their greatest. We believe this shows a true disparity in the form of the two opposing teams\n Tap the 'How to use' option to hide this text";

  let textJoined = text.concat(text2);

  let newText = textJoined.split("\n").map((i) => {
    return <p>{i}</p>;
  });

  async function renderButtons(loginStatus) {
    ReactDOM.render(
      <div className="FixtureButtons">
        <h6>{loginStatus}</h6>
        <Button
          text={`<`}
          className="FixturesButtonAmend"
          onClickEvent={async () => await decrementDate(1, date)}
        />
        <Button
          text={dateFootyStats !== undefined ? dateFootyStats : date}
          className="FixturesButtonToday"
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
          text={`>`}
          className="FixturesButtonAmend"
          onClickEvent={async () => await incrementDateV2(1, date)}
        />
      </div>,
      document.getElementById("Buttons")
    );
  }

  ReactDOM.render(
    <div className="FixtureButtons">
      <Button
        text={`<`}
        className="FixturesButtonAmend"
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
        className="FixturesButtonAmend"
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
    <><h6 className="PredictionTypeText">Prediction algorithm type</h6>
      <div className="PredictionRadios">
        <PredictionTypeRadio value="SSH Tips"></PredictionTypeRadio>
        <PredictionTypeRadio value="AI Tips"></PredictionTypeRadio>
      </div></>,
    document.getElementById("CheckboxTwo")
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
      <><div className="WelcomeBack">Welcome back {loggedIn.email}</div></>,
      document.getElementById("Email")
    );
  } else {
    ReactDOM.render(
      <>
        <h3 className="MembersGetMore">Discover the most in depth stats and tips available</h3>
        <div><p className="MembersGetMore">Join as a free user or upgrade to premium for as little as £1/week, cancel anytime</p></div>
        <Login />
      </>
      , document.getElementById("Email"));
  }
}

// Replace with your own Stripe public key
export const stripePromise = loadStripe(
  "pk_live_51QojxLBrqiWlVPadBxhtoj499YzoC8YjFUIVQwCcTe8B7ZUG47NbYAam2wvNox2mUmzd0WgQh4PWKaIQaxKxubig00yEzjNuVQ"
);

export const handleCheckout = async (priceId) => {
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

const welcomeTextUnsplitOne = `The ultimate football resource. Comprehensive stats, analysis and transparent tips for 40+ leagues and cups.\n `;
let welcomeTextOne = welcomeTextUnsplitOne.split("\n").map((i) => {
  return <p>{i}</p>;
});

function AppContent() {
  const { user, isPaidUser } = useAuth();

  const [data, setData] = useState({
    loading: true,
  });

  useEffect(() => {
    async function fetchData() {
      let now = new Date();
      let dateNow = await calculateDate(now);
      const [
        todaySS,
      ] = await Promise.all([
        convertTimestampForSofaScore(new Date())]);


      fixtureList.push(
        await generateFixtures(
          "todaysFixtures",
          dateNow[0],
          selectedOdds,
          dateNow[1],
          true,
          dateNow[0],
          todaySS,
          new Date()
        ))


      // Update the component state with the fetched data
      setData({
        loading: false,
      });
    }

    fetchData();
  }, []); // The empty dependency array ensures this runs only o

  getLeagueList();

  return (
    <div className="App">
      <div className="DarkMode">
        <Suspense fallback={<div></div>}>
          <LazyLogo />
        </Suspense>
        <a
          className="BeGamblingAware"
          href="https://www.begambleaware.org"
          target="_blank"
          rel="noreferrer"
        >
          begambleaware
        </a>
        <ThemeToggle />
      </div>
      <HamburgerMenu />
      <nav className="hidden md:flex gap-6">
        {menuItems.map((item) => (
          <a
            key={item}
            href={`#${item.toLowerCase()}`}
            className="text-lg font-semibold hover:text-blue-500"
          >
            {item}
          </a>
        ))}
      </nav>
      <div id="LoadingContainer" className="LoadingContainer" />
      <div id="RadioContainer" className="RadioContainer">
        <div id="RadioText" />
        <div id="RadioButtons" />
      </div>
      <div id="Email" className="Email"></div>
      <div id="Day" />


      <div id="ExplainerText" />
      <div id="Loading" className="Loading"></div>
      <div id="Buttons" className="Buttons">
      </div>
      <Collapsable buttonText={"Options \u{2630}"} className={"Options"} element={
        <><div id="Checkbox" /><div id="CheckboxTwo" className="CheckboxTwo" /></>
      }>
      </Collapsable>

      {user ? (
        isPaidUser ? (
          // If the user is logged in and is a paying customer, show the cancel button
          <div />
        ) : (
          // If the user is logged in but is NOT a paying customer, show subscribe buttons
          <div className="SubscribeContainer">
            <span className="MembershipInfo">
              Full fixtures and multis are restricted to premium
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
      <Collapsable buttonText={"ROI"} className={"ROI"} element={<div id="successMeasure2" />} />
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
            <a
              className="SocialLink"
              href="https://www.reddit.com/r/xgtipping/"
              target="_blank"
              rel="noreferrer"
            >
              r/xgtipping
            </a>
          </h6>
        </div>
      </div>
      <div id="XGDiff" />

      {user ? (
        isPaidUser ? (
          // If the user is logged in and is a paying customer, show the cancel button
          <button
            onClick={() => {
              window.location.href =
                "https://https://www.soccerstatshub.com/#/cancelsubscription";
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
      <div className="Social">
        <TwitterShareButton
          url={"https://www.soccerstatshub.com"}
          title={"#SoccerStatsHub"}
          className="ShareButton"
        >
          <TwitterIcon size={"3em"} round={true} />
        </TwitterShareButton>
        <RedditShareButton
          url={"https://www.soccerstatshub.com"}
          title={"Soccer Stats Hub"}
          className="ShareButton"
        >
          <RedditIcon size={"3em"} round={true} />
        </RedditShareButton>
        <FacebookShareButton
          url={"https://www.soccerstatshub.com"}
          quote={"SoccerStatsHub - data-driven football predictions"}
          className="ShareButton"
        >
          <FacebookIcon size={"3em"} round={true} />
        </FacebookShareButton>
        <WhatsappShareButton
          url={"https://www.soccerstatshub.com"}
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
      <div>Soccer Stats Hub is for users over 18 years of age only</div>
      <img
        src={Over18Badge} // Use the imported path here
        alt="18+ only"
        className="age-badge" // Add your CSS class here
      />
      <Collapsable buttonText={"Terms and Conditions"} element={<StripePolicies />} />
      <Collapsable buttonText={"Privacy Policy"} element={<PrivacyPolicy />} />
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
