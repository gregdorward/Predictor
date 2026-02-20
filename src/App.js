import { Fragment, useEffect, useState, lazy, Suspense } from "react";
import ReactDOM from "react-dom";
import { render } from './utils/render';
import { Button } from "./components/Button";
import OddsRadio from "./components/OddsRadio";
import PredictionTypeRadio from "./components/PredictionTypeRadio";
import ThemeToggle from "./components/DarkModeToggle";
import { selectedOdds } from "./components/OddsRadio";
import Collapsable from "./components/CollapsableElement";
import StripePolicies from "./components/Contact";
import { loadStripe } from "@stripe/stripe-js";
import { AuthProvider, useAuth } from "./logic/authProvider";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Login from "./components/Login";
import { getCurrentUser } from "./components/ProtectedContent";
import { doc, getDoc, collection, getDocs, query } from 'firebase/firestore';
import { userDetail } from "./logic/authProvider";
import { checkUserPaidStatus } from "./logic/hasUserPaid";
import { getScorePrediction } from "./logic/getScorePredictions";
import HamburgerMenu from "./components/HamburgerMenu";
import CancelSubscription from "./components/CancelSubscription"
import Over25 from "./components/Over25"
import Under25 from "./components/Under25"
import { ThreeDots } from "react-loading-icons";
import HighestScoringTeams from "./components/HighestScoringTeams"
import HighestScoringFixtures from "./components/HighestScoringFixtures";
import BTTSFixtures from "./components/BTTSFixtures";
import BTTSTeams from "./components/BTTSTeams";
import SeasonPreview from "./components/SeasonPreview";
import TeamPage from "./components/Team";
import { SuccessPage } from "./components/Success"
import { CancelPage } from "./components/Cancel"
import PasswordReset from "./components/PasswordReset";
import Logo from "./components/Logo";
import { auth, db } from "./firebase";
import UsernameModal from "./components/UsernameModal";
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
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import PrivacyPolicy from "./components/PrivacyPolicy";
import Over18Badge from './components/images/18.webp';
import { createRoot } from 'react-dom/client';
import setUserTips from "./components/GameStats";
import BetSlipFooter from "./components/Betslip";
import SlideDiff from "./components/SliderDiff";
import { Slide } from "./components/Slider";


export const proxyurl = "https://safe-caverns-99679.herokuapp.com/";
export var fixtureList = [];
export let allLeagueData = [];

export const availableLeagues = [];
export var orderedLeagues = [];
export let paid = false;
// export let userTips;

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
  14977, //German 3rd tier 25 12623
  14954, //French League 2 25 12338
  14987, //Dutch League 2 25
  15061, //Scottish Championship 25 12456
  14943, //Scottish league 1 25 12474
  15209, //Scottish league 2 25 12453
  13973, //MLS 25,
  14236, //Canada 25
  16544, //Brazil prem 26
  16571, //Argentina prem 23 15310 16571
  // 14086, // Columbia 25
  // 14116, // Chile 25
  // 14626, // Uraguay 25
  15234, //Mexico prem 25 12136
  16614, //Colombia 26
  16036, //Australian A league 24/25 13703
  16243, //S Korea 25,
  16242, //Japan 25
  13964, // WC Qual Europe 26,
  10121, // WC Qual SA 26,
  // 11426, // WC Qual ConCaf 26
  // 12801, // WC Qual Aus 26,
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
[date, dateFootyStats] = await calculateDate(date);
let loggedIn



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

  const text =
    "Select a day you would like to retrieve fixtures for from the options above\n A list of games will be returned once the data has loaded\n Once all fixtures have loaded, click on “Get Predictions and Stats” to see our forecasted outcomes for every game\n If a game has completed, the predictions is displayed on the right and the actual result on the left\n Each individual fixture is tappable/clickable. By doing so, you can access a range of detailed stats, from comparative charts, granular performance measures to previous meetings.\n All games are subject to the same automated prediction algorithm with the outcome being a score prediction. Factors that determine the tip include the following, amongst others:\n - Goal differentials\n - Expected goal differentials \n - Attack/Defence performance\n - Form trends over time\n - Home/Away records\n - WDL records\n - Points per game \n - A range of other comparative factors\n  –\n";

  const text2 =
    "A range of tools are available should you wish to use them\n Build a multi - Use the '+' or '-' buttons to add or remove a game deemed to be one of our highest confidence tips from the day\n Exotic of the day: A pre-built exotic multi comprising of our highest confidence tips\n BTTS games: Games where both teams to score is deemed a likely outcome\n Over 2.5 goals tips: Games where over 2.5 goals are most likely to be scored\n SSH Tips: Comprises only games where the expected goal differentials between each team are at their greatest. We believe this shows a true disparity in the form of the two opposing teams\n Tap the 'How to use' option to hide this text";

  let textJoined = text.concat(text2);

  let newText = textJoined.split("\n").map((i) => {
    return <p>{i}</p>;
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
  render(
    <div className="OddsRadios">
      <OddsRadio value="Fractional odds"></OddsRadio>
      <OddsRadio value="Decimal odds"></OddsRadio>
    </div>,
    "Checkbox"
  );
  render(
    <><h6 className="PredictionTypeText">Prediction algorithm type</h6>
      <div className="PredictionRadios">
        <PredictionTypeRadio value="SSH Tips"></PredictionTypeRadio>
        <PredictionTypeRadio value="AI Tips"></PredictionTypeRadio>
      </div></>,
    "CheckboxTwo"
  );
  render(
    <Fragment>
      <Collapsable
        // className={"HowToUse"}
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
          className="LogoutButton"
        >
          Logout
        </button>
      </>,
      "Email"
    );
  } else {
    render(
      <Collapsable
      buttonText="Log In / Sign Up"
      classNameButton="LoginSignUp"
      element={
        <div className="NonFixtureInfo">
        <Login />
      </div>
      }
      
      />
      , "Email");
  }
}




let stripePromise = null;

// Only initialize Stripe in the browser
const getStripe = () => {
  if (typeof window === "undefined") return null; // Prevent SSR / react-snap errors
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
    `${process.env.REACT_APP_EXPRESS_SERVER}create-checkout-session`,
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

function AppContent() {
  const { user, isPaidUser, fixtures, setFixtures, handleGetPredictions, isPredicting } = useAuth()

  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [userTips, setUserTips] = useState([]); // This is the React state
  // 1. For the items the user is currently clicking on the site
  const [activeSlip, setActiveSlip] = useState([]);
  // 2. For the items already in the database (History)
  const [tipHistory, setTipHistory] = useState([]);
  const [offset, setOffset] = useState(0);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [isProbability, setIsProbability] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [loggedInUser, setLoggedInUser] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    // This is the only reliable way to get the user in Firebase
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setLoggedInUser(true)
        setCurrentUser(user);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    console.log("App mounted: Triggering initial fixture load");
    getLeagueList(triggerGlobalPredictions);
    handleAction();
  }, [user]);


  // This function replaces decrementDate and incrementDateV2
  const changeDate = (num) => {
    const newOffset = offset + num;
    if (newOffset > -120 && newOffset <= 4) {
      const newDate = new Date();
      newDate.setDate(newDate.getDate() + newOffset);

      setOffset(newOffset);
      setCurrentDate(newDate);
    }
  };


  const handleAction = async () => {
    setIsLoading(true);

    // 1. Convert the current state date into the formats generateFixtures needs
    // Assuming calculateDate returns [dateRaw, dateFormatted]
    const [raw, formatted] = await calculateDate(currentDate);
    const sofaDate = await convertTimestampForSofaScore(currentDate);

    const data = await generateFixtures(
      "fixtures",       // day
      raw,              // date
      selectedOdds,     // odds
      formatted,        // dateFootyStats
      false,            // current
      raw,              // todaysDate
      sofaDate,         // sofaScoreDate
      currentDate,      // unformattedDate
      handleGetPredictions
    );

    setFixtures(data);
    setIsLoading(false);
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
      const response = await fetch(`${process.env.REACT_APP_EXPRESS_SERVER}tipsNEW`, {
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
    const currency = detectCurrency();
    setCurrentCurrency(currency);
    fetch(`${process.env.REACT_APP_EXPRESS_SERVER}pricing?currency=${currency}`)
      .then(res => res.json())
      .then(setPricing)
      .catch(console.error);
  }, []);


  useEffect(() => {
    // ⭐️ Important: useEffect callback cannot be directly 'async'.
    // Use an IIFE (Immediately Invoked Function Expression) inside.
    const fetchData = async () => {
      if (!user) {
        setShowUsernameModal(false);
        return;
      }

      // 1. Check for displayName (Existing logic)
      if (!user.displayName) {
        console.log("User does not have a displayName. Prompting for username.");
        setShowUsernameModal(true);
        return;
      }

      setShowUsernameModal(false);

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
      {showUsernameModal && user && (
        <UsernameModal
          auth={auth} // Use imported 'auth'
          db={db}     // Use imported 'db'
          user={user} // User object from useAuth()
          onClose={() => setShowUsernameModal(false)}
          onUsernameSet={() => {
            // This function is called after the user successfully sets the name.
            // It closes the modal, and the useEffect hook will prevent it from re-opening.
            setShowUsernameModal(false);
            // You might want to navigate the user or show a success message here.
          }}
        />
      )}
      <div className="DarkMode">
        <Logo />
        <div className="DarkModeIcon">&#9681;</div>
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
      <h1 className="MembersGetMore">Welcome to <span className="TitleColouring">Soccer Stats Hub</span></h1>
      <h4 className="Blurb">The best for in-depth football statistics, analytics and predictions</h4>
      {!loggedIn || isPaidUser ? (
        <div />
      ) : (
        <><div className="MembersGetMoreUnderlined" onClick={() => {
          const FixtureList = document.getElementById("Buttons");
          if (FixtureList) {
            FixtureList.scrollIntoView({ behavior: "smooth" });
            // Optional: Flash the login box or focus an input to draw attention
          }
          const getPredictionsButton = document.getElementById('GeneratePredictionsButton');
          if (getPredictionsButton) {
            // Example: Add a class that quickly changes the background/border color
            getPredictionsButton.classList.add('flash-attention');

            // Remove the class after a short delay (e.g., 1 second)
            setTimeout(() => {
              getPredictionsButton.classList.remove('flash-attention');
              getPredictionsButton.focus(); // Optional: Focus the input after scrolling
            }, 1000);
          }
        }}>Just show me the games</div><div className="NonFixtureInfo">
            <div className="PremiumUpsell">
              <div className="UpsellHeader">
                <h2>Unlock the Full Experience</h2>
                <p>You're currently seeing 25% of the action. Get the edge with full access.</p>
              </div>

              <div className="FeatureComparison">
                <div className="FeatureGroup">
                  <h4>Free Tier</h4>
                  <ul>
                    <li className="limited">Limited Multi Tips</li>
                    <li className="limited">25% of Matches with detailed stats</li>
                    <li className="limited">All EPL games and AI previews</li>
                  </ul>
                </div>
                <div className="FeatureDivider">VS</div>
                <div className="FeatureGroup premium">
                  <h4>Premium</h4>
                  <ul>
                    <li>✅ All matches - unrivalled detail</li>
                    <li>✅ 50 competitions</li>
                    <li>✅ Full multi tips list</li>
                    <li>✅ Full BTTS picks</li>
                    <li>✅ Full over 2.5 goals picks</li>
                    <li>✅ AI-powered match previews</li>
                    <li>✅ Best value tips</li>
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
      <div id="Email" className="Email"></div>
      <div id="Day" />


      <div id="ExplainerText" />
      <div id="Buttons" className="Buttons">
        <div className="FixtureButtons">
          <Button
            text="<"
            className="FixturesButtonAmend"
            onClickEvent={() => changeDate(-1)}
          />

          <Button
            text={currentDate.toLocaleDateString()} // Or your dateFootyStats variable
            className="FixturesButtonToday"
            onClickEvent={() => handleAction()} // This re-runs the current date load
          />

          <Button
            text=">"
            className="FixturesButtonAmend"
            onClickEvent={() => changeDate(1)}
          />
        </div>
      </div>
      <Collapsable buttonText={"Options \u{2630}"} className={"Options"} element={
        <><><div id="Checkbox" /><div id="CheckboxTwo" className="CheckboxTwo" /></><Collapsable
          buttonText={"Filters"}
          className={"Filters2"}
          element={<div className="FilterContainer">
            <h6>
              Use the below filters to show predicted winners that meet
              the set criteria. Others will be greyed out and not included
              in multi-builders and ROI stats. Once the filter is set, tap "Get Predictions and Stats" to see the results.
            </h6>
            <h6>Goals for/against differential filter</h6>
            <div>
              I'm looking for tips where the goal differential between
              teams is at least...
            </div>
            <SlideDiff
              value="0"
              text="all games"
              useCase="gd"
              lower="0"
              upper="30"
            ></SlideDiff>
            <h6>Goals for/against home or away differential filter</h6>
            <div>
              I'm looking for tips where the goal differential (home or
              away only) between teams is at least...
            </div>
            <SlideDiff
              value="0"
              text="all games"
              useCase="gdHorA"
              lower="0"
              upper="30"
            ></SlideDiff>
            <Fragment>
              <h6>XG for/against differential filter</h6>
              <div>
                I'm looking for tips where the XG differential between
                teams is at least...
              </div>
              <SlideDiff
                value="0"
                text="all games"
                useCase="xg"
                lower="0"
                upper="30"
              ></SlideDiff>
            </Fragment>
            <Fragment>
              <h6>Last 6 points differential filter</h6>
              <div>
                I'm looking for tips where the points differential between
                teams is at least...
              </div>
              <SlideDiff
                value="0"
                text="all games"
                useCase="last10"
                lower="0"
                upper="18"
              ></SlideDiff>
            </Fragment>
            <Fragment>
              <h6>Choose your risk profile</h6>
              <div>
                I'm looking for tips where the odds are between...
              </div>
              <Slide value="1" text="all games"></Slide>
            </Fragment>
          </div>} /></>
      }>
      </Collapsable>
      <div id="Loading" className="Loading"></div>
      <div id="GeneratePredictions">
        {fixtures?.length > 0 && (
          <div className="PredictionControls">
            <Button
              text={isPredicting ? "Processing..." : "Get Predictions & Stats"}
              onClickEvent={() => handleGetPredictions('today')}
              disabled={isPredicting} // 🛡️ Disable to prevent multiple clicks
              className={`GeneratePredictionsButton ${isPredicting ? "loading" : ""}`}
            />

            {/* Optional: Add a subtle text indicator below */}
            {isPredicting && <p className="LoadingStatus">Calculating all predictions... Each fixture will be interactable once these are returned</p>}

            <div className="Version">Prediction engine v1.9.0</div>
          </div>
        )}
      </div>
      {/* <div id="MultiPlaceholder" className="MultiPlaceholder" /> */}

      <div id="MultiWrapper" className="MultiWrapper">
        <Collapsable
          buttonText={"Multis"}
          className={"MultisCollapsable"}
          openedClassName={"MultisCollapsableOpened"}
          key="MultisCollapsable"
          id="MultiPlaceholder"
          element={
            <Fragment>
              <div id="bestPredictions" className="bestPredictions" />
              <div id="valueBets" className="ValueBets" />
              <div id="exoticOfTheDay" className="exoticOfTheDay" />
              <div id="RowOneContainer" className="RowOneContainer">
                <div id="BTTS" className="RowOne" />
                <div id="longShots" className="RowOne" />
                {/* <div id="draws" className="RowOne" /> */}
              </div>
              <div id="insights" />
            </Fragment>
          }
        />
      </div>
      <div id="UserGeneratedTips" />
      <div id="shortlistRender" />
      <div id="ROIPlaceholder" />
      {/* <Collapsable buttonText={"ROI"} className={"ROI"} element={<div id="successMeasure2" />} /> */}
      <div className={"StatsInsights"} id="statsInsights" />
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
        ) : (
          /* 2. Show Fixtures only when NOT loading and data exists */
          fixtures?.length > 0 && (
            <RenderAllFixtures
              matches={fixtures}
              userTips={activeSlip}
              handleToggleTip={handleToggleTip}
              userDetail={user}
              result={false}
              isProbability={isProbability}
              setIsProbability={setIsProbability}
            />
          )
        )}
      </div>
      <BetSlipFooter
        userTips={activeSlip}  // Only show the new selections
        setUserTips={setActiveSlip}
        userDetail={user}
        onPlaceBet={submitTips}
        user={currentUser}
      />
      <div id="XGDiff" />
      {user ? (
        isPaidUser ? (
          // If the user is logged in and is a paying customer, show the cancel button
          <button
            onClick={() => {
              window.location.href =
                "https://www.soccerstatshub.com/cancelsubscription";
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
      <div className="Social" height="100" width="100"
      >
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

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<AppContent />} />
        <Route path="/fixture/" element={<TeamPage />} />
        <Route path="/success/" element={<SuccessPage />} />
        <Route path="/cancel/" element={<CancelPage />} />
        <Route path="/reset/" element={<PasswordReset />} />
        <Route path="/o25/" element={<Over25 />} />
        <Route path="/u25/" element={<Under25 />} />
        <Route path="/teamshigh/" element={<HighestScoringTeams />} />
        <Route path="/fixtureshigh/" element={<HighestScoringFixtures />} />
        <Route path="/bttsfixtures/" element={<BTTSFixtures />} />
        <Route path="/bttsteams/" element={<BTTSTeams />} />
        <Route path="/cancelsubscription/" element={<CancelSubscription />} />
        <Route path="/seasonpreviews/" element={<SeasonPreview />} />
        {/* <Route path="/" element={<Fixture />} /> */}
      </Routes>
    </AuthProvider>
  );
}
