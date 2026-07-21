import { Fragment, useEffect, useState, lazy, Suspense } from "react";
import ReactDOM from "react-dom";
import { render } from './utils/render';
import { Button } from "./components/Button";
import { renderOddsRadios, onOddsPreferenceChange, applyOddsPreference, selectedOdds } from "./components/OddsRadio";
import PredictionTypeRadio from "./components/PredictionTypeRadio";
import { oddsModeToSelected, selectedToOddsMode } from "./utils/oddsPreference";
import Collapsable from "./components/CollapsableElement";
import MultisPanelCarousel from "./components/MultisPanelCarousel";
import StripePolicies from "./components/Contact";
import { loadStripe } from "@stripe/stripe-js";
import { useAuth } from "./logic/authProvider";
import { bumpFixturesEpoch } from "./logic/fixturesEpoch";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { scrollToGames } from "./components/GuestLanding";
import { getCurrentUser } from "./components/ProtectedContent";
import { doc, getDoc, collection, getDocs, query, updateDoc } from 'firebase/firestore';
import { userDetail } from "./logic/authProvider";
import { checkUserPaidStatus } from "./logic/hasUserPaid";
import SiteHeader from "./components/SiteHeader";
import CancelSubscription from "./components/CancelSubscription"
import Over25 from "./components/Over25"
import Under25 from "./components/Under25"
import { ThreeDots } from "react-loading-icons";
import HighestScoringTeams from "./components/HighestScoringTeams"
import HighestScoringFixtures from "./components/HighestScoringFixtures";
import BTTSFixtures from "./components/BTTSFixtures";
import BTTSTeams from "./components/BTTSTeams";
import SeasonPreview from "./components/SeasonPreview";
import WorldCup2026 from "./components/WorldCup2026";
import TeamPage from "./components/Team";
import { initTheme } from "./utils/theme";
import { getInitialDateFromShareUrl } from "./utils/shareMatchUrl";
import { SuccessPage } from "./components/Success"
import { CancelPage } from "./components/Cancel"
import PasswordReset from "./components/PasswordReset";
import { auth, db, isReactSnap } from "./firebase";
import Footer from "./components/Footer"
import handleLogout from "./components/SignOut"
import { RenderAllFixtures } from "./logic/getFixtures";
import { triggerGlobalPredictions } from "./logic/authProvider";
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
import PageMeta from "./components/PageMeta";
import PrivacyPolicy from "./components/PrivacyPolicy";
import Over18Badge from './components/images/18.webp';
import { createRoot } from 'react-dom/client';
import setUserTips from "./components/GameStats";
import BetSlipFooter from "./components/Betslip";
import SlideDiff from "./components/SliderDiff";
import { FilterPresets } from "./components/SliderDiff";
import { Slide } from "./components/Slider";


export const proxyurl = "https://safe-caverns-99679.herokuapp.com/";
export var fixtureList = [];
export let allLeagueData = [];

export const availableLeagues = [];
export var orderedLeagues = [];
export let paid = false;
// export let userTips;

// Ids to be updated for the latest season
const leagueOrder = [
  16494, // World cup 2026
  17146, // Premier League 26/27
  17184, // Championship 26/27
  17180, // League One 26/27
  17185, // League Two 26/27
  15657, // National League 25/26
  15845, // National League north 25/26
  15844, // National League south 25/26
  17199, // La Liga 26/27
  17148, // Scottish Prem 26/27
  17210, // Bundesliga 26/27
  17084, // Serie A 26/27
  17102, // Ligue 1 26/27
  15115, // Primeira Liga 25/26 (industry leading stat website id unchanged)
  17097, // Eredivisie 26/27
  17171, // Belgian Pro League 26/27
  16263, // Allsvenskan - deferred, no industry leading stat website chosen_leagues
  17091, // Danish Superliga 26/27
  16558, // Norway 26
  17181, // Austrian Bundesliga 26/27
  15163, // Greek Super League 25/26
  14972, // Turkish Super Lig 25/26
  17112, // Ekstraklasa 26/27
  17129, // Swiss Super League 26/27
  17087, // Croatia 26/27
  17157, // Czech First League 26/27
  // 14089, // Veikkausliiga - deferred
  // 14951, // Ukrainian Premier League - deferred
  // 15065, // Serbian SuperLiga - deferred
  // 15063, // Slovenian Prva Liga - deferred
  // 14933, // Slovak Super Liga - deferred
  16537, // Irish Prem 26
  15066, // Segunda Division 26/27
  15632, // Serie B 25/26
  17212, // Bundesliga 2 26/27
  14977, // 3. Liga 25/26
  17117, // Ligue 2 26/27
  17110, // Eerste Divisie 26/27
  17144, // Scottish Championship 26/27
  17147, // Scottish League One 26/27
  17140, // Scottish League Two 26/27
  16504, // MLS 26
  16544, // Brazil Serie A 26
  16571, // Argentina Primera 26
  // 14116, // Chile - deferred
  // 14626, // Uruguay - deferred
  17099, // Liga MX 26
  16614, // Colombia 26
  16036, // A-League 25/26
  16627, // K League 26
  17115, // J League 26/27
  13964, // WC Qual Europe 2026
  10121, // WC Qual SA 2026
  16808, // Nations League 26/27
  17128, // Champions League 26/27
  17127, // Europa League 26/27
  17130, // Europa Conference League 26/27
  16556, // Copa Libertadores 26
];

// Ids to be updated for the latest season
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

export let date = new Date();
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

function getNoFixturesMessage(offset, date) {
  if (offset === 0) {
    return "There are no fixtures today.";
  }
  if (offset === 1) {
    return "There are no fixtures tomorrow.";
  }
  const formatted = date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return `There are no fixtures on ${formatted}.`;
}

// Synchronous module-init equivalent (avoids top-level await, which Next's
// webpack build does not enable by default).
(function initModuleDate() {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  date = `${month}${day}${year}`;
  dateFootyStats = `${year}-${month}-${day}`;
})();
let loggedIn



async function convertTimestampForSofaScore(timestamp) {
  let newDate = new Date(timestamp);

  let year = newDate.getFullYear();
  let month = String(newDate.getMonth() + 1).padStart(2, "0"); // Adding 1 to month because it is zero-based
  let day = String(newDate.getDate()).padStart(2, "0");

  let converted = `${year}-${month}-${day}`;

  return converted;
}

export const leaguesReady = (async function fetchLeagueData() {
  if (isReactSnap) return;

  let leagueList;
  if (userDetail) {
    paid = await checkUserPaidStatus(userDetail.uid);
  } else {
    paid = false;
  }
  let now = new Date();
  let dateNow = await calculateDate(now);
  leagueList = await fetch(
    `${process.env.NEXT_PUBLIC_EXPRESS_SERVER}leagueList/${dateNow[0]}`
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
        element.year === 20252026 ||
        element.year === 2026 ||
        element.year === 20262027
      ) {
        if (
          element.id !== 5874 &&
          element.id !== 12623
        ) {
          availableLeagues.push({ name: name, element });
        }
      }
    }
  }

  // Only ids in leagueOrder - availableLeagues also contains prior-season duplicates.
  orderedLeagues = leagueOrder
    .map((id) => availableLeagues.find((league) => league.element.id === id))
    .filter(Boolean);
  return orderedLeagues;
})();



// async function renderButtons(today, dateFootyStats) {
//   render(
//     <div className="FixtureButtons">
//       {/* <h6>{loginStatus}</h6> */}
//       <Button
//         text={`<`}
//         className="FixturesButtonAmend"
//         onClickEvent={async () => await decrementDate(1, date)}
//       />
//       <Button
//         text={dateFootyStats !== undefined ? dateFootyStats : date}
//         className="FixturesButtonToday"
//         onClickEvent={async () =>
//           fixtureList.push(
//             await generateFixtures(
//               "todaysFixtures",
//               dateString,
//               selectedOdds,
//               dateFootyStats,
//               false,
//               today,
//               dateSS,
//               dateUnformatted,
//               triggerGlobalPredictions
//             )
//           )
//         }
//       />
//       <Button
//         text={`>`}
//         className="FixturesButtonAmend"
//         onClickEvent={async () => await incrementDateV2(1, date)}
//       />
//     </div>,
//     "Buttons"
//   );
// }

let todayFootyStats;
let today;

export async function getLeagueList() {
  let i = 0;
  date = new Date();
  string = "Today";
  loggedIn = await getCurrentUser();



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
  [today, todayFootyStats] = await calculateDate(todayRaw)

  // const todaySS = await convertTimestampForSofaScore(new Date());

  const howToUseHeadings = new Set([
    "Getting started",
    "Viewing fixtures",
    "Options",
    "Customise tips",
    "Multis and insights",
    "Free and premium",
    "More tools",
  ]);

  const text =
    "Getting started\nUse the < and > arrows to browse fixtures by date. Games load automatically once the data is ready.\nWhen fixtures appear, click \"Get Predictions & Stats\" to generate score predictions and statistics for each match.\n\nViewing fixtures\nEach fixture is clickable. Tap one to open detailed stats, comparative charts, form data, head-to-head history, and match previews.\nFor completed games, the actual score appears in the Result column alongside our prediction.\nUse the checkbox on a fixture to add it to your shortlist. You can view and share your shortlist once you have selections.\n\nOptions\nOpen \"Options ☰\" to choose fractional or decimal odds, select a prediction algorithm, and switch between probability mode (percentages) and score mode (predicted outcomes):\nSSH Tips - our standard model using expected goal differentials, form, home/away records, attack/defence performance, and other comparative factors.\nAI Tips - an alternative model powered by AI, useful where limited match data is available.\n\nCustomise tips\nOpen \"Customise tips\" to filter the tip list by value edge, stats thresholds, probabilities, and odds ranges. Adjust the sliders, then click \"Get Predictions & Stats\" again to refresh results.\n\nMultis and insights\nAfter generating predictions, open \"Multis\" and use the carousel arrows to browse curated selections:\nBuild a Multi - our highest-confidence picks; use the + and - buttons to change how many games are included.\nExotic of the Day - a pre-built multi from our top selections.\nOver 2.5 Goals - games where three or more goals are most likely.\nBTTS Games - games where both teams to score is most likely.\nThe insights section lists standout performers by value, xG difference, goal difference, and more.\n\nFree and premium\nFree accounts see a sample of matches and limited multi and insight lists. Premium unlocks all competitions, full fixture detail, complete multi and BTTS/O2.5 lists, and AI match previews.\n\nMore tools\nUse the menu icon to access BTTS Teams, BTTS Games, Over 2.5 Goals fixtures, highest and lowest scoring leagues and teams, and season previews.\n\nTap \"How to use\" again to hide this text.";

  let newText = text.split("\n").map((line, index) => {
    if (!line) return null;
    if (howToUseHeadings.has(line)) {
      return <p key={index} className="HowToUse-heading">{line}</p>;
    }
    return <p key={index}>{line}</p>;
  });

  // render(
  //   <div className="FixtureButtons">
  //     <Button
  //       text={`<`}
  //       className="FixturesButtonAmend"
  //       onClickEvent={async () => await decrementDate(1, date)}
  //     />
  //     <Button
  //       text={`${string}`}
  //       className="FixturesButtonToday"
  //       onClickEvent={async () =>
  //         fixtureList.push(
  //           await generateFixtures(
  //             "todaysFixtures",
  //             today,
  //             selectedOdds,
  //             todayFootyStats,
  //             true,
  //             today,
  //             todaySS,
  //             todaysDateUnformatted,
  //             triggerGlobalPredictions
  //           )
  //         )
  //       }
  //     />
  //     <Button
  //       text={`>`}
  //       className="FixturesButtonAmend"
  //       onClickEvent={async () => await incrementDateV2(1, date)}
  //     />
  //   </div>,
  //   "Buttons"
  // );
  renderOddsRadios();
  render(
    <div className="PredictionRadios">
      <PredictionTypeRadio value="SSH Tips"></PredictionTypeRadio>
      <PredictionTypeRadio value="AI Tips"></PredictionTypeRadio>
    </div>,
    "CheckboxTwo"
  );
  render(
    <Fragment>
      <Collapsable
        classNameTwo="HowToUse"
        buttonText={"How to use"}
        element={newText}
      />
    </Fragment>,
    "XGDiff"
  );

  if (loggedIn) {
    const getPredictionsButton = document.getElementById('GeneratePredictionsButton');
    if (getPredictionsButton) {
      // Example: Add a class that quickly changes the background/border color
      getPredictionsButton.classList.add('flash-attention');

      // Remove the class after a short delay (e.g., 1 second)
      setTimeout(() => {
        getPredictionsButton.classList.remove('flash-attention');
        // getPredictionsButton.focus(); // Optional: Focus the input after scrolling
      }, 1000);
    }
    render(
      <><div className="WelcomeBack">Welcome back {loggedIn.email}</div><div className="WelcomeBack">Username: {loggedIn.displayName}</div>
        <button
          onClick={handleLogout}
          className="GhostButton LogoutButton"
        >
          Logout
        </button>
      </>,
      "Email"
    );
  } else {
    render(<div />, "Email");
  }
}




let stripePromise = null;

// Only initialize Stripe in the browser
const getStripe = () => {
  if (typeof window === "undefined" || isReactSnap) return null; // Prevent SSR / react-snap errors
  if (!stripePromise) {
    stripePromise = loadStripe("pk_live_51QojxLBrqiWlVPadBxhtoj499YzoC8YjFUIVQwCcTe8B7ZUG47NbYAam2wvNox2mUmzd0WgQh4PWKaIQaxKxubig00yEzjNuVQ");
  }
  return stripePromise;
};

// 1. Add currency as a parameter to the function
export const handleCheckout = async (priceId, currency = 'usd') => {
  const stripe = await getStripe();

  if (!stripe) {
    console.warn("Stripe not initialized. Are you prerendering?");
    return;
  }
  let auth = null;
  let user = null;

  if (typeof window !== "undefined") {
    auth = getAuth();
    user = auth.currentUser;
  }

  if (!user) {
    alert("Please sign-up or login before purchasing");
    return;
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_EXPRESS_SERVER}create-checkout-session`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // 2. Pass the currency in the request body
      body: JSON.stringify({
        priceId,
        uid: user.uid,
        currency: currency.toLowerCase()
      }),
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

export function AppContent({ shellMounted = false }) {
  const { user, isPaidUser, fixtures, setFixtures, handleGetPredictions, isPredicting } = useAuth()

  const [userTips, setUserTips] = useState([]); // This is the React state
  // 1. For the items the user is currently clicking on the site
  const [activeSlip, setActiveSlip] = useState([]);
  // 2. For the items already in the database (History)
  const [tipHistory, setTipHistory] = useState([]);
  const [offset, setOffset] = useState(() => getInitialDateFromShareUrl().offset);
  const [currentDate, setCurrentDate] = useState(() => getInitialDateFromShareUrl().date);
  const [isLoading, setIsLoading] = useState(false);
  const [isProbability, setIsProbability] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [loggedInUser, setLoggedInUser] = useState(false);
  const [showMultis, setShowMultis] = useState(false);

  useEffect(() => {
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setLoggedInUser(true)
        setCurrentUser(user);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    const loadPreference = async () => {
      const ref = doc(db, "users", currentUser.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();
        setIsProbability(data.predictionMode !== "score");
        if (data.oddsMode) {
          applyOddsPreference(oddsModeToSelected(data.oddsMode));
        }
      }
    };

    loadPreference();
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;

    return onOddsPreferenceChange(async (value) => {
      try {
        await updateDoc(doc(db, "users", currentUser.uid), {
          oddsMode: selectedToOddsMode(value),
        });
      } catch (error) {
        console.error("Error updating odds preference:", error);
      }
    });
  }, [currentUser]);

  const togglePredictionMode = async () => {
    const newValue = !isProbability;
    setIsProbability(newValue);

    if (!currentUser) return;

    try {
      await updateDoc(doc(db, "users", currentUser.uid), {
        predictionMode: newValue ? "probability" : "score",
      });
    } catch (error) {
      console.error("Error updating preference:", error);
    }
  };

  useEffect(() => {
    if (isReactSnap) return;

    console.log("App mounted: Triggering initial fixture load");
    getLeagueList(triggerGlobalPredictions);
    handleAction();
  }, [user]);


  const handleAction = async () => {
    bumpFixturesEpoch();
    setIsLoading(true);

    const [raw, formatted] = await calculateDate(currentDate);
    const sofaDate = await convertTimestampForSofaScore(currentDate);

    const data = await generateFixtures(
      "fixtures",
      raw,
      selectedOdds,
      formatted,
      false,
      raw,
      sofaDate,
      currentDate,
      handleGetPredictions
    );

    if (Array.isArray(data)) {
      setFixtures(data);
    }
    setIsLoading(false);
  };

  // This function replaces decrementDate and incrementDateV2
  const changeDate = (num) => {
    const newOffset = offset + num;
    // TEMP: allow browsing 4 days ahead (revert to 3 before merge)
    const maxForwardDays = 4;
    if (newOffset > -120 && newOffset <= maxForwardDays) {
      const newDate = new Date();
      newDate.setDate(newDate.getDate() + newOffset);

      setOffset(newOffset);
      setCurrentDate(newDate);
    }
  };



  const submitTips = async (selectedStake) => {
    if (!user || activeSlip.length === 0) return;

    // 1. Define isMulti inside the function scope
    const isMulti = activeSlip.length > 1;

    const payload = {
      uid: user.uid,
      tips: activeSlip,
      type: isMulti ? "MULTI" : "SINGLE", // ✅ Now isMulti is defined here
      submittedAt: new Date().toISOString(),
      stake: selectedStake
    };

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_EXPRESS_SERVER}tipsNEW`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        // ✅ Now isMulti is also defined here for the alert
        alert(isMulti ? "Accumulator submitted!" : "Single tip submitted!");
        setActiveSlip([]);
        localStorage.removeItem("userTips");
      }
    } catch (error) {
      console.error(error);
    }
  };



  function handleToggleTip(gameId, game, label, tipType, date, uid, odds, tipper) {
    setActiveSlip((prevTips) => {
      // 1. Check if the EXACT same tip is already there (for deselecting)
      const isExactMatch = prevTips.find(
        (t) => t.gameId === gameId && t.tip === tipType
      );

      if (isExactMatch) {
        // If user clicked the same button again, just remove it
        const updated = prevTips.filter((t) => !(t.gameId === gameId && t.tip === tipType));
        localStorage.setItem("userTips", JSON.stringify(updated));
        return updated;
      }

      // 2. Remove ANY existing tip for this specific gameId 
      // This enforces the "1 selection per game" rule
      const filteredTips = prevTips.filter((t) => t.gameId !== gameId);

      // 3. Add the new selection
      const newTip = {
        gameId,
        game,
        tipString: label,
        tip: tipType,
        date,
        uid,
        odds,
        status: "PENDING",
        tipper,
        stake: 1
      };

      const updatedTips = [...filteredTips, newTip];
      localStorage.setItem("userTips", JSON.stringify(updatedTips));
      console.log("Tip added (and any previous selection for this game removed)");

      return updatedTips;
    });
  }

  const [pricing, setPricing] = useState(null);
  const [currentCurrency, setCurrentCurrency] = useState('usd'); // ⭐️ Store the code here

  useEffect(() => {
    if (isReactSnap) return;

    const currency = detectCurrency();
    setCurrentCurrency(currency);
    fetch(`${process.env.NEXT_PUBLIC_EXPRESS_SERVER}pricing?currency=${currency}`)
      .then(res => res.json())
      .then(setPricing)
      .catch(console.error);
  }, []);


  useEffect(() => {
    // ⭐️ Important: useEffect callback cannot be directly 'async'.
    // Use an IIFE (Immediately Invoked Function Expression) inside.
    const fetchData = async () => {
      if (!user) {
        return;
      }

      // --- FETCHING USER PROFILE (Top-level document) ---
      const userDocRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        console.log("User Profile Data fetched");
      } else {
        console.warn("User document not found.");
      }

      // --- FETCHING THE TIPS SUBCOLLECTION (New Logic) ---

      // 1. Create a reference to the 'tips' subcollection
      const tipsCollectionRef = collection(db, "users", user.uid, "tips");

      // 2. Optional: Create a query to order or limit the tips (e.g., show 10 most recent)
      // const q = query(tipsCollectionRef, orderBy("date", "desc"), limit(10));

      // 3. Fetch all documents in the subcollection
      const tipsSnapshot = await getDocs(tipsCollectionRef);

      if (!tipsSnapshot.empty) {
        const fetchedTips = tipsSnapshot.docs.map(tipDoc => ({
          id: tipDoc.id,
          ...tipDoc.data()
        }));
        // If you want history and the slip to be different, use a different state.
        // For now, let's just make the UI work:
        const history = tipsSnapshot.docs.map(doc => doc.data());
        setTipHistory(history); // Store history separately
        // ⭐️ Here you would call a state setter to store the tips in your component state
        // setTips(userTips); 
      } else {
        setUserTips([]);
        console.log("No tips found in the 'tips' subcollection.");
      }
    };

    fetchData();

  }, [user, db]); // Re-ru

  const [data, setData] = useState({
    loading: true,
  });

  const handleSubscribeClick = (priceId) => {
    if (user) {
      // User is logged in, proceed to Stripe checkout as normal
      handleCheckout(priceId, currentCurrency);
    } else {
      // User is NOT logged in.
      // 1. You could alert them:
      // alert("Please sign up or log in to subscribe.");

      // 2. Or better, scroll them to the Login component smoothly:
      const loginSection = document.getElementById("HamburgerMenuDiv");
      if (loginSection) {
        loginSection.scrollIntoView({ behavior: "smooth" });
        // Optional: Flash the login box or focus an input to draw attention
      }
      const emailInput = document.getElementById('LoginSignUp');
      if (emailInput) {
        // Example: Add a class that quickly changes the background/border color
        emailInput.classList.add('flash-attention');

        // Remove the class after a short delay (e.g., 1 second)
        setTimeout(() => {
          emailInput.classList.remove('flash-attention');
          emailInput.focus(); // Optional: Focus the input after scrolling
        }, 1000);
      }
    }
  };

  function formatPrice(amount, currency) {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      minimumFractionDigits: ["jpy", "krw"].includes(currency) ? 0 : 2,
    }).format(amount);
  }


  function detectCurrency() {
    // Get the browser language (e.g., "da-DK" or "en-AU")
    const locale = navigator.language || "en-US";

    // 1. Direct Region/Locale Mapping (High Priority)
    const regionMap = {
      "en-AU": "aud",
      "en-CA": "cad",
      "en-GB": "gbp",
      "en-SG": "sgd",
      "en-NZ": "nzd",
      "da-DK": "dkk",
      "sv-SE": "sek",
      "de-CH": "chf", // Swiss German
      "fr-CH": "chf", // Swiss French
      "ar-SA": "sar",
      "en-NG": "ngn",
      "ko-KR": "krw",
    };

    // Check for an exact locale match first
    if (regionMap[locale]) return regionMap[locale];

    // 2. Language-based Mapping (Fallback)
    // Useful for "fr-BE" or "de-AT" which both use Euro
    const language = locale.split('-')[0]; // Gets "de" from "de-DE"

    const languageMap = {
      "ja": "jpy",
      "de": "eur",
      "fr": "eur",
      "it": "eur",
      "es": "eur",
      "nl": "eur",
    };

    return languageMap[language] || "usd";
  }

  return (
    <div className="App">
      {!shellMounted ? <PageMeta /> : null}
      {!shellMounted ? <SiteHeader showThemeToggle /> : null}
      <div id="LoadingContainer" className="LoadingContainer" />
      <div id="RadioContainer" className="RadioContainer">
        <div id="RadioText" />
        <div id="RadioButtons" />
      </div>
      {!user ? null : (
        <>
      <h1 className="MembersGetMore">Welcome to <span className="TitleColouring">Soccer Stats Hub</span></h1>
      <h4 className="Blurb">The best for in-depth football statistics, analytics and predictions</h4>
      {isPaidUser ? (
        <div />
      ) : (
        <><button
          type="button"
          className="MembersGetMoreUnderlined"
          onClick={scrollToGames}
        >
          Just show me the games
        </button><div className="NonFixtureInfo">
            <div className="PremiumUpsell">
              <div className="UpsellHeader">
                <h2>Unlock the Full Experience</h2>
                <p>You&apos;re only seeing 25% of today&apos;s matches. Premium unlocks every game, tip and insight — so you never miss an edge.</p>
              </div>

              <div className="FeatureComparison">
                <div className="FeatureGroup">
                  <h4>Free Tier</h4>
                  <ul>
                    <li className="limited">Limited multi &amp; Over 2.5 tips</li>
                    <li className="limited">25% of today&apos;s matches</li>
                    <li className="limited">Key stats &amp; top-5 insights only</li>
                  </ul>
                </div>
                <div className="FeatureDivider">VS</div>
                <div className="FeatureGroup premium">
                  <h4>Premium</h4>
                  <ul>
                    <li>✅ Every match across 50+ competitions</li>
                    <li>✅ Full multi, BTTS &amp; Over 2.5 tip lists</li>
                    <li>✅ AI-powered match previews</li>
                    <li>✅ Best-value &amp; stats-based tips</li>
                    <li>✅ Deep match intel — streaks, managers, lineups &amp; upcoming fixtures</li>
                    <li>✅ Full season stats — attack, defence, possession &amp; form</li>
                    <li>✅ Complete insights rankings</li>
                  </ul>
                </div>
              </div>

              {pricing && (
                <div className="SubscriptionOptions">
                  <div className="OptionCard">
                    <span className="Price">
                      {formatPrice(pricing.weekly.amount, pricing.weekly.currency)}
                      <span>/week</span>
                    </span>
                    <button onClick={() => handleSubscribeClick("price_1SxC9QBrqiWlVPadyHJj3Y91")}>
                      Get Weekly
                    </button>
                  </div>

                  <div className="OptionCard featured">
                    <div className="Badge">Best Value</div>
                    <span className="Price">
                      {formatPrice(pricing.yearly.amount, pricing.yearly.currency)}
                      <span>/year</span>
                    </span>
                    <button onClick={() => handleSubscribeClick("price_1SxCPDBrqiWlVPad3nFXzU1B")}>
                      Go Annual
                    </button>
                  </div>

                  <div className="OptionCard">
                    <span className="Price">
                      {formatPrice(pricing.monthly.amount, pricing.monthly.currency)}
                      <span>/month</span>
                    </span>
                    <button onClick={() => handleSubscribeClick("price_1SxCGuBrqiWlVPadO7N4jpQJ")}>
                      Get Monthly
                    </button>
                  </div>
                </div>
              )}


              <p className="TrustNote">
                Secure payments via <strong>Stripe</strong>. Cancel anytime, no contracts.
              </p>
            </div>
          </div></>
      )}
        </>
      )}
      <div id="Email" className="Email"></div>
      <div id="Day" />


      <div id="ExplainerText" />
      <div id="Buttons" className="Buttons">
        <div className="FixtureButtons">
          <Button
            text="<"
            className="SecondaryButton FixturesButtonAmend"
            onClickEvent={() => changeDate(-1)}
          />

          <Button
            text={currentDate.toLocaleDateString()} // Or your dateFootyStats variable
            className="FixturesButtonToday"
            onClickEvent={() => handleAction()} // This re-runs the current date load
            disabled={isLoading || isPredicting}
          />

          <Button
            text=">"
            className="SecondaryButton FixturesButtonAmend"
            onClickEvent={() => changeDate(1)}
          />
        </div>
      </div>
      <div id="Loading" className="Loading"></div>
      <Collapsable
        buttonText={"Customise tips"}
        className={"Filters2"}
        element={<div className="FilterContainer">
          <h5 className="FilterExplainer">
            Customise the tips you see by applying filters based on value, stats, probabilities and odds. Adjust the sliders to set your desired thresholds and click 'Get Predictions and Stats' to see the games that meet your criteria.
          </h5>
          <FilterPresets />
          <Collapsable
            buttonText={"Value filters"}
            className={"ValueFilters"}
            element={
              <><h6 className="FilterHeading">Match outcome edge %</h6><div className="FilterDiv">
                Percentage difference between our probability and bookies implied probability for match outcome (home/draw/away)
              </div><SlideDiff
                value="0"
                text="edge"
                useCase="edge"
                lower="0"
                upper="40"
              ></SlideDiff><h6 className="FilterHeading">Over 2.5 goals edge %</h6><div className="FilterDiv">
                  Percentage difference between our probability and bookies implied probability for over 2.5 goals
                </div><SlideDiff
                  value="0"
                  text="O25edge"
                  useCase="O25edge"
                  lower="0"
                  upper="40"
                ></SlideDiff><h6 className="FilterHeading">BTTS edge %</h6><div className="FilterDiv">
                  Percentage difference between our probability and bookies implied probability for BTTS
                </div><SlideDiff
                  value="0"
                  text="BTTSedge"
                  useCase="BTTSedge"
                  lower="0"
                  upper="40"
                ></SlideDiff></>
            }
          />
          <Collapsable
            buttonText={"Stats filters"}
            className={"StatsFilters"}
            element={
              <><h6 className="FilterHeading">Goals for/against difference</h6>
                <div className="FilterDiv">
                  Goal difference between teams is at least...
                </div>
                <SlideDiff
                  value="0"
                  text="all games"
                  useCase="gd"
                  lower="0"
                  upper="30"
                ></SlideDiff>
                <h6 className="FilterHeading">Goals for/against home or away difference</h6>
                <div className="FilterDiv">
                  Goal difference (home or away only) between teams is at least...
                </div>
                <SlideDiff
                  value="0"
                  text="all games"
                  useCase="gdHorA"
                  lower="0"
                  upper="30"
                ></SlideDiff>
                <h6 className="FilterHeading">XG for/against difference</h6>
                <div className="FilterDiv">
                  XG difference between teams is at least...
                </div>
                <SlideDiff
                  value="0"
                  text="all games"
                  useCase="xg"
                  lower="0"
                  upper="30"
                ></SlideDiff>
                <h6 className="FilterHeading">Last 6 points difference</h6>
                <div className="FilterDiv">
                  Points difference between teams is at least...
                </div>
                <SlideDiff
                  value="0"
                  text="all games"
                  useCase="last10"
                  lower="0"
                  upper="18"
                ></SlideDiff></>
            }
          />
          <Collapsable
            buttonText={"Probability filters"}
            className={"ProbabilityFilters"}
            element={
              <>
                <h6 className="FilterHeading">Win probability</h6>
                <div className="FilterDiv">
                  Probability of win is over...
                </div>
                <SlideDiff
                  value="0"
                  text="winProb"
                  useCase="winProb"
                  lower="40"
                  upper="100"
                ></SlideDiff>
                <h6 className="FilterHeading">Over 2.5 goals probability</h6>
                <div className="FilterDiv">
                  Probability of over 2.5 goals is over...
                </div>
                <SlideDiff
                  value="0"
                  text="over25"
                  useCase="over25"
                  lower="50"
                  upper="100"
                ></SlideDiff>
                <h6 className="FilterHeading">BTTS probability</h6>
                <div className="FilterDiv">
                  Probability of BTTS is over...
                </div>
                <SlideDiff
                  value="0"
                  text="btts"
                  useCase="btts"
                  lower="50"
                  upper="100"
                ></SlideDiff></>
            }
          />

          <Collapsable
            buttonText={"Odds filters"}
            className={"OddsFilters"}
            element={
              <>
                <h6 className="FilterHeading">Odds range</h6>
                <div className="FilterDiv">
                  Odds range for tipped outcome is between...
                </div>
                <SlideDiff
                  value="0"
                  text="odds"
                  useCase="odds" lower="1.1" upper="10" step={0.1}
                ></SlideDiff></>
            }
          />
          <Collapsable
            buttonText={"Other filters"}
            className={"OtherFilters"}
            element={
              <>
                <h6 className="FilterHeading">Omit draws</h6>
                <div className="FilterDiv">
                  Remove draws from the tip list...
                </div>
                <SlideDiff
                  value="0"
                  text="odds"
                  useCase="omitDraws"
                  lower="0"
                  upper="1"
                ></SlideDiff></>
            }
          />
        </div>} />
      <div id="GeneratePredictions">
        {fixtures?.length > 0 && !isLoading && (
          <div className="PredictionControls">
            <Button
              text={isPredicting ? "Processing..." : "Get Predictions & Stats"}
              onClickEvent={() => {
                handleGetPredictions('today');
                setShowMultis(true);
              }} disabled={isPredicting || isLoading}
              className={`GeneratePredictionsButton ${isPredicting ? "loading" : ""}`}
              id="GeneratePredictionsButton"
            />

            {/* Optional: Add a subtle text indicator below */}
            {isPredicting && <p className="LoadingStatus">Calculating all predictions... Each fixture will be interactable once these are returned</p>}

            <div className="Version">Prediction engine v2.1.5</div>
          </div>
        )}
      </div>
      {/* <div id="MultiPlaceholder" className="MultiPlaceholder" /> */}

      {showMultis && (
        <><div id="MultiWrapper" className="MultiWrapper">
          <Collapsable
            buttonText={"Multis"}
            className={"MultisCollapsable"}
            openedClassName={"MultisCollapsableOpened"}
            collapsibleKey="MultisCollapsable"
            element={
              <>
                <MultisPanelCarousel />
                <div id="valueBets" className="ValueBets" />
                <div id="insights" />
              </>
            } />
        </div><div id="UserGeneratedTips" /><div id="shortlistRender" /><div id="ROIPlaceholder" /></>
      )}
      <Collapsable
        buttonText={"Options \u{2630}"}
        className={"Options"}
        classNameTwo="OptionsPanel"
        element={
          <>
            <section className="OptionsSection">
              <h6 className="OptionsSection-heading">Odds format</h6>
              <div id="Checkbox" className="OptionsSection-controls" />
            </section>
            <section className="OptionsSection">
              <h6 className="OptionsSection-heading">Prediction algorithm</h6>
              <div id="CheckboxTwo" className="OptionsSection-controls" />
            </section>
            <section className="OptionsSection">
              <h6 className="OptionsSection-heading">Fixture display</h6>
              <button
                type="button"
                className="OptionsDisplayToggle"
                onClick={togglePredictionMode}
              >
                {isProbability ? "Select score mode" : "Select probability mode"}
              </button>
            </section>
          </>
        }
      />
      {/* <Collapsable buttonText={"ROI"} className={"ROI"} element={<div id="successMeasure2" />} /> */}
      <div id="highLowLeagues" className="HighLowLeagues" />
      <div id="risk" />
      <div id="successMeasure" />
      <div id="tables" />
      <div id="homeBadge" />
      <div id="FixtureContainerHeaders"></div>

      <div id="FixtureContainer">
        {/* 1. Show Spinner while loading */}
        {isLoading ? (
          <div className="LoadingSpinnerContainer" style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
            <ThreeDots stroke="#fe8c00" />
          </div>
        ) : fixtures?.length > 0 ? (
          <RenderAllFixtures
            matches={fixtures}
            userTips={activeSlip}
            handleToggleTip={handleToggleTip}
            userDetail={user}
            result={false}
            isProbability={isProbability}
            setIsProbability={setIsProbability}
          />
        ) : (
          <p className="NoFixtures">
            {getNoFixturesMessage(offset, currentDate)}
          </p>
        )}
      </div>
      <div className={"StatsInsights"} id="statsInsights" />
      <BetSlipFooter
        userTips={activeSlip}  // Only show the new selections
        setUserTips={setActiveSlip}
        userDetail={user}
        onPlaceBet={submitTips}
        user={currentUser}
      />
      <div id="XGDiff" />
      <div className="Social" height="100" width="100"
      >
        <TwitterShareButton
          url={"https://www.soccerstatshub.com"}
          title={"#SoccerStatsHub"}
          className="SecondaryButton ShareButton"
        >
          <TwitterIcon size={"3em"} round={true} />
        </TwitterShareButton>
        <RedditShareButton
          url={"https://www.soccerstatshub.com"}
          title={"Soccer Stats Hub"}
          className="SecondaryButton ShareButton"
        >
          <RedditIcon size={"3em"} round={true} />
        </RedditShareButton>
        <FacebookShareButton
          url={"https://www.soccerstatshub.com"}
          className="SecondaryButton ShareButton"
        >
          <FacebookIcon size={"3em"} round={true} />
        </FacebookShareButton>
        <WhatsappShareButton
          url={"https://www.soccerstatshub.com"}
          title={"Soccer Stats Hub"}
          separator=": "
          className="SecondaryButton ShareButton"
        >
          <WhatsappIcon size={"3em"} round={true} />
        </WhatsappShareButton>
        <TelegramShareButton
          url={"https://www.soccerstatshub.com"}
          title={"Soccer Stats Hub"}
          className="SecondaryButton ShareButton"
        >
          <TelegramIcon size={"3em"} round={true} />
        </TelegramShareButton>
      </div>
      <div>Soccer Stats Hub is for users over 18 years of age only</div>
      <img
        src={Over18Badge.src || Over18Badge} // Next static import returns an object
        alt="18+ only"
        className="age-badge" // Add your CSS class here
        width="100"
        height="100"
      />
      <Collapsable buttonText={"Terms and Conditions"} element={<StripePolicies />} />
      <Collapsable buttonText={"Privacy Policy"} element={<PrivacyPolicy />} />
      <a
        className="BeGamblingAware"
        href="https://www.begambleaware.org"
        target="_blank"
        rel="noreferrer"
      >
        begambleaware
      </a>
       {user ? (
        isPaidUser ? (
          // If the user is logged in and is a paying customer, show the cancel button
          <button
            onClick={() => {
              window.location.href =
                "https://www.soccerstatshub.com/cancelsubscription";
            }}
            className="GhostButton CancelButton"
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
      <Footer />
    </div>
  );
}

export default function App({ shellMounted = false }) {
  useEffect(() => {
    initTheme();
  }, []);

  return <AppContent shellMounted={shellMounted} />;
}
