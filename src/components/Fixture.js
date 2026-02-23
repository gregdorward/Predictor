import { Fragment, useState, useEffect, useRef, lazy, Suspense } from "react";
import { CreateBadge } from "./createBadge";
import { useDispatch } from "react-redux";
import { setData } from "../logic/dataSlice";
import { Provider } from "react-redux";
import store from "../logic/store"; // Import your Redux store
import { clicked } from "../logic/getScorePredictions";
import { userDetail } from "../logic/authProvider";
import { checkUserPaidStatus } from "../logic/hasUserPaid";
import { leagueStatsArray } from "../logic/getScorePredictions";
import LeagueName from './LeagueName';
import ShareShortlistButton from "./ShareShortlistButton";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import GameStats from "./GameStats";


let resultValue;
let paid;
var count;
let mockValue;
var setCount;
function toggle(bool) {
  count = !bool;
  return count;
}

let tipOutcome = undefined;

// const [displayMode, setDisplayMode] = useState("score"); 
// // "score" | "probability"


function GetDivider(fixture, mockValue) {
  const { status, time } = fixture.fixture;

  const isComplete = status === "complete";
  const isPrediction = fixture.fixture.omit === true || mockValue === true;

  // 1. Return early if the match hasn't happened yet
  if (!isComplete && !isPrediction) {
    return (
      <div className="KOAndPrediction">
        <div className="KOTime">{time}</div>
      </div>
    );
  }

  return null;
}


const downArrow = "\u{2630}";
const rightArrow = "\u{29C9}";

export let testing;

const getProbabilityClass = (probability) => {
  if (probability >= 60) return "prob-strong";
  if (probability >= 45) return "prob-slightlyStrong";
  if (probability >= 35) return "prob-medium";
  if (probability >= 20) return "prob-slightlyWeak";
  return "prob-weak";
};

const PredictionSection = ({ isProbability, goals, team, probability }) => {
  if (!isProbability) {
    return (
      <div className="ScoreContainer">
        <div className="score">{goals ?? "-"}</div>
      </div>
    );
  }

  const safeProb = probability ?? 0;
  const probClass = getProbabilityClass(safeProb);

  if (safeProb > 0) {
    return (
      <div className="ProbabilityWrapper">
        <div className="ProbabilityBarBackground">
          {/* BAR FILL (doesn't affect layout) */}
          <div
            className={`ProbabilityBarFill ${probClass}`}
            style={{ width: `${safeProb}%` }}
          />

          {/* TEXT LAYER */}
          <span className="ProbabilityBarText">
            {probability !== undefined ? `${safeProb?.toFixed(1)}%` : ""}
          </span>
        </div>

        {/* <div className="ProbabilityValue">
        {probability !== undefined ? `${safeProb.toFixed(1)}%` : ""}
      </div> */}
      </div>
    );
  } else {
    return (
      <div className="ProbabilityWrapper">
        <div className="ProbabilityBarBackground">
          {/* BAR FILL (doesn't affect layout) */}
          <div
            className={`ProbabilityBarFill ${probClass}`}
          />

          {/* TEXT LAYER */}
          <span className="ProbabilityBarText">
          </span>
        </div>

        {/* <div className="ProbabilityValue">
        {probability !== undefined ? `${safeProb.toFixed(1)}%` : ""}
      </div> */}
      </div>
    )
  }


};


function ProbabilityView({ fixture }) {

  return (
    <div className="ProbabilityContainer">
      <div className="ProbRow home">
        <span>H</span>
        <span>{fixture.homeWinProbability.toFixed(1)}%</span>
      </div>
      <div className="ProbRow draw">
        <span>D</span>
        <span>{fixture.drawProbability.toFixed(1)}%</span>
      </div>
      <div className="ProbRow away">
        <span>A</span>
        <span>{fixture.awayWinProbability.toFixed(1)}%</span>
      </div>
    </div>
  );
}





function SingleFixture({
  fixture,
  count,
  mock,
  checked,
  onToggle,
  showShortlist,
  isProbability,
  handleToggleTip,
  userTips
}) {
  const dispatch = useDispatch();
  const [showGameStats, setShowGameStats] = useState(false);
  const [isLoadingGameStats, setIsLoadingGameStats] = useState(false); // New loading state
  function StoreData() {
    const fixtureDetails = {
      id: fixture.id,
      homeTeamName: fixture.homeTeam,
      homeId: fixture.homeId,
      homeTeamBadge: fixture.homeBadge,
      awayTeamName: fixture.awayTeam,
      awayId: fixture.awayId,
      awayTeamBadge: fixture.awayBadge,
      stadium: fixture.stadium,
      time: fixture.time,
      homeGoals: fixture.goalsA,
      awayGoals: fixture.goalsB,
    };

    const homeDetails = {
      "Attacking Strength": fixture.formHome.attackingStrength,
      "Defensive Strength": fixture.formHome.defensiveStrength,
    };

    const awayDetails = {
      "Attacking Strength": fixture.formAway.attackingStrength,
      "Defensive Strength": fixture.formAway.defensiveStrength,
    };

    const dataToSend = {
      key1: "value1",
      key2: "value2",
    };
    fixture.formHome.defensiveMetrics["Clean Sheet Percentage"] =
      fixture.formHome.CleanSheetPercentage;
    fixture.formAway.defensiveMetrics["Clean Sheet Percentage"] =
      fixture.formAway.CleanSheetPercentage;

    localStorage.setItem(
      "homeForm",
      JSON.stringify(fixture.formHome.attackingMetrics)
    );
    localStorage.setItem(
      "homeFormDef",
      JSON.stringify(fixture.formHome.defensiveMetrics)
    );
    localStorage.setItem(
      "allTeamResultsHome",
      JSON.stringify(fixture.formHome.allTeamResults)
    );
    localStorage.setItem("homeDetails", JSON.stringify(homeDetails));

    localStorage.setItem(
      "awayForm",
      JSON.stringify(fixture.formAway.attackingMetrics)
    );
    localStorage.setItem(
      "awayFormDef",
      JSON.stringify(fixture.formAway.defensiveMetrics)
    );
    localStorage.setItem(
      "allTeamResultsAway",
      JSON.stringify(fixture.formAway.allTeamResults)
    );
    localStorage.setItem("awayDetails", JSON.stringify(awayDetails));

    localStorage.setItem("fixtureDetails", JSON.stringify(fixtureDetails));

    dispatch(setData(dataToSend));
    dispatch(setData({ key1: "value1", key2: "value2" }));
  }

  async function handleButtonClick() {
    if (userDetail) {
      paid = await checkUserPaidStatus(userDetail.uid);
      if (clicked === true && paid) {
        StoreData();
        window.open("/fixture");
      } else {
        alert("Premium feature only");
      }
    } else {
      paid = false;
    }
  }

  function styleForm(formIndicator) {
    let className;
    if (formIndicator === "W") {
      className = "winSmall";
    } else if (formIndicator === "D") {
      className = "drawSmall";
    } else if (formIndicator === "L") {
      className = "lossSmall";
    }
    return className;
  }

  const handleGameStatsClick = () => {
    if (!clicked) {
      alert("Tap Get Predictions to fetch all game stats first");
      return;
    }
    setIsLoadingGameStats(true);
    StoreData();
    setTimeout(() => {
      setShowGameStats(!showGameStats);
      setIsLoadingGameStats(false); // Set loading to false after "loading"
    }, 1);
  };

  return (
    <div key={fixture.game}>
      <LeagueName fixture={fixture} mock={mock} showShortlist={showShortlist} />
      <div id={fixture.id} className="scroll-target">
        <div className={`individualFixtureContainerfalse`}>
          <li
            className={`individualFixture${fixture.omit}`}
            key={fixture.id}
            data-cy={fixture.id}
            onClick={handleGameStatsClick}
          // onClick={handleGameStatsClick}
          // onClick={onToggle} // Toggle checked state on click
          // style={{ display: checked ? "lightblue" : "white" }} // Change background when checked
          >
            <div className="MatchDetail">
              <GetDivider
                result={resultValue}
                status={fixture.status}
                fixture={fixture}
              />
              <input
                type="checkbox"
                checked={checked}
                onChange={onToggle}
                className="star"
                id={`shortlist-${fixture.id}`} // Unique ID for label association
              />
              <button className="GameStatsTwo" onClick={handleButtonClick}>
                {rightArrow}
              </button>
            </div>
            <div className={`HomeAndAwayContainer${fixture.predictionOutcome}${fixture.exactScore ? "ExactScore" : ""}`}>

              <div className={`ExplainerContainer${isProbability}`}>
                <div className="HomeOddsExplainer">Odds</div>
                <div
                  className="HomeBadgeExplainer"
                />
                <div className={`homeTeam${isProbability}Explainer`}>
                </div>
                <div className={`PredictionOrProbabilityExplainer${isProbability}`}>{isProbability ? 'Chance' : 'Tip'}</div>
                <div className="ResultContainerExplainer">
                  <div className={`resultExplainer`}>
                    Result
                  </div>
                </div>
                <div className="FormContainerExplainer">
                  Form
                </div>
                <div className="GameStatsTwoExplainer">
                </div>
              </div>

              <div className={`HomeContainer${isProbability}`}>
                <div className="HomeOdds">{fixture.fractionHome}</div>
                <CreateBadge
                  image={fixture.homeBadge}
                  ClassName="HomeBadge"
                  alt="Home team badge"
                  flexShrink={5}
                />
                <div className={`homeTeam${isProbability}`}>
                  {fixture.homeTeam}{" "}
                  {fixture.formHome ? `(${fixture.formHome.LeaguePosition})` : ""}
                </div>
                <PredictionSection
                  isProbability={isProbability}
                  team={""}
                  goals={fixture.goalsA}
                  probability={fixture.homeWinProbability !== undefined ? fixture.homeWinProbability : '-'}
                />
                <div className="ResultContainer">
                  <div className={`result`}>
                    {fixture.status === "complete" ? `${fixture.homeGoals}` : `-`}
                  </div>
                </div>
                <div className="FormContainer">
                  <div className={`Last5`}>
                    {fixture.formHome && (
                      <>
                        <span className="FormAllorHA">All</span>
                        <span
                          className={styleForm(
                            fixture.formHome.resultsAll[4] || ""
                          )}
                        ></span>
                        <span
                          className={styleForm(
                            fixture.formHome.resultsAll[3] || ""
                          )}
                        ></span>
                        <span
                          className={styleForm(
                            fixture.formHome.resultsAll[2] || ""
                          )}
                        ></span>
                        <span
                          className={styleForm(
                            fixture.formHome.resultsAll[1] || ""
                          )}
                        ></span>
                        <span
                          className={styleForm(
                            fixture.formHome.resultsAll[0] || ""
                          )}
                        ></span>
                      </>
                    )}
                  </div>
                  <div className={`Last5Home`}>
                    {fixture.formHome && (
                      <>
                        <span className="FormAllorHA">Home</span>
                        <span
                          className={styleForm(
                            fixture.formHome.resultsHome[4] || ""
                          )}
                        ></span>
                        <span
                          className={styleForm(
                            fixture.formHome.resultsHome[3] || ""
                          )}
                        ></span>
                        <span
                          className={styleForm(
                            fixture.formHome.resultsHome[2] || ""
                          )}
                        ></span>
                        <span
                          className={styleForm(
                            fixture.formHome.resultsHome[1] || ""
                          )}
                        ></span>
                        <span
                          className={styleForm(
                            fixture.formHome.resultsHome[0] || ""
                          )}
                        ></span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className={`DrawContainer${isProbability}`}>
                <div className="DrawOdds">{fixture.fractionDraw}</div>
                <div
                  className="DrawBadgeExplainer"
                />
                <div className={`homeTeam${isProbability}Explainer`}>
                </div>
                <PredictionSection
                  isProbability={isProbability}
                  team="Draw"
                  // goals={fixture.goalsB}
                  probability={fixture.drawProbability}
                />
                <div className="ResultContainerExplainer">
                  {/* <div className={`result`}>
                  </div> */}
                </div>
                <div className="FormContainerExplainer">
                </div>
                <div className="GameStatsTwoExplainer">
                </div>
              </div>


              <div className={`AwayContainer${isProbability}`}>
                <div className="AwayOdds">{fixture.fractionAway}</div>
                <CreateBadge
                  image={fixture.awayBadge}
                  ClassName="AwayBadge"
                  alt="Away team badge"
                />
                <div className={`awayTeam${isProbability}`}>
                  {fixture.awayTeam}{" "}
                  <br />
                  {fixture.formAway ? `(${fixture.formAway.LeaguePosition})` : ""}
                </div>
                <PredictionSection
                  isProbability={isProbability}
                  team=""
                  goals={fixture.goalsB}
                  probability={fixture.awayWinProbability}
                />
                <div className="ResultContainer">

                  <div className="result">
                    {fixture.status === "complete" ? `${fixture.awayGoals}` : `-`}
                  </div>
                </div>
                <div className="FormContainer">
                  <div className={`Last5`}>
                    {fixture.formAway && (
                      <>
                        <span className="FormAllorHA">All</span>
                        <span
                          className={styleForm(
                            fixture.formAway.resultsAll[4] || ""
                          )}
                        ></span>
                        <span
                          className={styleForm(
                            fixture.formAway.resultsAll[3] || ""
                          )}
                        ></span>
                        <span
                          className={styleForm(
                            fixture.formAway.resultsAll[2] || ""
                          )}
                        ></span>
                        <span
                          className={styleForm(
                            fixture.formAway.resultsAll[1] || ""
                          )}
                        ></span>
                        <span
                          className={styleForm(
                            fixture.formAway.resultsAll[0] || ""
                          )}
                        ></span>
                      </>
                    )}
                  </div>
                  <div className={`Last5Away`}>
                    {fixture.formAway && (
                      <>
                        <span className="FormAllorHA">Away</span>
                        <span
                          className={styleForm(
                            fixture.formAway.resultsAway[4] || ""
                          )}
                        ></span>
                        <span
                          className={styleForm(
                            fixture.formAway.resultsAway[3] || ""
                          )}
                        ></span>
                        <span
                          className={styleForm(
                            fixture.formAway.resultsAway[2] || ""
                          )}
                        ></span>
                        <span
                          className={styleForm(
                            fixture.formAway.resultsAway[1] || ""
                          )}
                        ></span>
                        <span
                          className={styleForm(
                            fixture.formAway.resultsAway[0] || ""
                          )}
                        ></span>
                      </>
                    )}
                  </div>
                </div>
                {/* <button className="GameStats" onClick={handleGameStatsClick}>
                  {downArrow}
                </button> */}
              </div>
            </div>
          </li>
        </div>
      </div>
      {isLoadingGameStats && <div className="LoadingMessage">Loading Game Stats...</div>}{" "}
      {/* Show loading message */}
      <Suspense fallback={<div>Loading game statistics...</div>}>

        {/* The condition ensures LazyGameStats is only mounted when ready */}
        {showGameStats && !isLoadingGameStats && (
          <GameStats
            game={fixture}
            displayBool={true}
            handleToggleTip={handleToggleTip} // 👈 Pass this down
            userTips={userTips}               // 👈 Pass this down
            stats={
              leagueStatsArray && leagueStatsArray[`leagueStats${fixture.leagueID}`]
                ? leagueStatsArray[`leagueStats${fixture.leagueID}`]
                : null
            }
          />
        )}
      </Suspense>
    </div>
  );
}

// async function submitTips(userTips) {
//   if (userDetail?.uid && userTips) {
//     await fetch(`${process.env.REACT_APP_EXPRESS_SERVER}tips`, {
//       method: "POST",
//       headers: {
//         Accept: "application/json",
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(userTips),
//     });
//     alert("Tips submitted");
//   } else {
//     return;
//   }

//   localStorage.removeItem("userTips");
//   userTips.length = 0;
// }

const List = ({
  fixtures,
  mock,
  showShortlist,
  setShowShortlist,
  handleToggleTip,
  userTips
  // You may also want to accept fullUncappedFixtures here if that was part of your final solution
}) => {
  // ⭐️ showShortlist state is now received via props, not local state ⭐️
  const [selectedFixtures, setSelectedFixtures] = useState([]);

  const togglePredictionMode = async () => {
    // 1. Always update the local UI state first so the toggle feels instant
    const newValue = !isProbability;
    setIsProbability(newValue);

    // 2. Check if a user is logged in
    const user = auth.currentUser;

    // 3. If no user, stop here. The UI has changed, but nothing is saved to Firebase.
    if (!user) {
      console.log("Guest mode: Preference not saved.");
      return;
    }

    // 4. If user exists, sync the preference to the database
    try {
      await updateDoc(doc(db, "users", user.uid), {
        predictionMode: newValue ? "probability" : "score"
      });
    } catch (error) {
      console.error("Error updating preference:", error);
    }
  };


  // You need to resolve this variable being undefined if it's not a prop or local state
  // console.log(showShortlist); 

  const isInitialMount = useRef(true);

  const auth = getAuth();
  const db = getFirestore();
  const [isProbability, setIsProbability] = useState(true);
  const [loadingPreference, setLoadingPreference] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const loadPreference = async () => {
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();
        setIsProbability(data.predictionMode !== "score");
      }
    };

    loadPreference();
  }, []);


  // 1. URL READING EFFECT (Loads shortlist from URL for persistence and sets initial view state)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shortlistParam = params.get('shortlist');
    const viewParam = params.get('view');

    // Use the fixtures prop for reading, as Fixture is now passing the correct source dynamically 
    // (or, if needed, you'd use a dedicated fullUncappedFixtures prop here)
    if (fixtures && fixtures.length > 0) {

      if (shortlistParam) {
        const sharedFixtureIds = shortlistParam.split(',').map(id => parseInt(id, 10));

        // Use the fixtures prop for filtering. Assuming Fixture passes the FULL list 
        // on the second render, the initial set here might still be capped if the timing is tight.
        // For production, you MUST use the uncapped list here (e.g., props.fullUncappedFixtures)
        const sharedShortlist = fixtures.filter(fixture =>
          sharedFixtureIds.includes(fixture.id)
        );

        if (sharedShortlist.length > 0) {
          setSelectedFixtures(sharedShortlist);

          // ⭐️ Use the prop setter for initial state ⭐️
          if (viewParam === 'shortlist') {
            setShowShortlist(true);
          } else if (showShortlist) {
            // If the view was active but the URL no longer requests it, turn it off.
            setShowShortlist(false);
          }

          isInitialMount.current = false;
          return;
        }
      }

      isInitialMount.current = false;
    }

  }, [fixtures, setSelectedFixtures, setShowShortlist, showShortlist]);
  // Note: Added 'showShortlist' to dependencies to allow the else if branch to work on re-renders

  // ----------------------------------------------------------------------

  // 2. URL WRITING EFFECT (Persists user changes to URL) - UNCHANGED
  useEffect(() => {
    if (isInitialMount.current) {
      return;
    }

    const pathname = window.location.pathname;
    const params = new URLSearchParams(window.location.search);
    const hasInitialShortlist = params.get('shortlist') !== null;

    if (hasInitialShortlist && selectedFixtures.length === 0) {
      return;
    }

    if (selectedFixtures.length > 0) {
      const selectedFixtureIds = selectedFixtures.map(f => f.id).join(',');
      params.set('shortlist', selectedFixtureIds);
    } else {
      params.delete('shortlist');
    }

    const newSearchParams = params.toString();

    if (newSearchParams === '') {
      window.history.replaceState(null, '', pathname);
    } else {
      const newUrl = `${pathname}?${newSearchParams}`;
      window.history.replaceState(null, '', newUrl);
    }

  }, [selectedFixtures]);

  // Function to handle the toggle button click
  const handleToggleShortlistView = () => {
    const newState = !showShortlist;

    // ⭐️ Use the prop setter for dynamic state change ⭐️
    setShowShortlist(newState);

    // Modify the URL parameters based on the new state
    const params = new URLSearchParams(window.location.search);

    if (newState === true) {
      params.set('view', 'shortlist');
    } else {
      params.delete('view');
    }

    const newUrl = `${window.location.pathname}?${params.toString()}`;

    if (params.toString() === '') {
      window.history.replaceState(null, '', window.location.pathname);
    } else {
      window.history.replaceState(null, '', newUrl);
    }
  };

  const handleToggle = (fixture) => {
    setSelectedFixtures((prev) => {
      const index = prev.findIndex((f) => f.id === fixture.id);
      if (index !== -1) {
        return prev.filter((_, i) => i !== index);
      } else {
        return [...prev, fixture];
      }
    });
  };

  // Convert array into an indexed object
  const shortlist = Object.fromEntries(
    selectedFixtures.map((fixture, i) => [i, fixture])
  );


  const selectedFixtureIds = selectedFixtures.map(fixture => fixture.id);
  const baseUrl = window.location.origin + window.location.pathname;

  // Assume fixtureIdsString is already defined (e.g., "101,205")
  const fixtureIdsString = selectedFixtures.map(fixture => fixture.id).join(',');

  // Append the 'view' parameter to indicate the shortlist view should be active
  const shareableLink = `${baseUrl}?shortlist=${fixtureIdsString}&view=shortlist`;
  const hasShortlistInUrl = new URLSearchParams(window.location.search).has('shortlist');
  const isShortlistVisible = selectedFixtures.length > 0 || hasShortlistInUrl;

  return mock === true ? (
    <>
      <div>
        <div id="Headers"></div>
        <ul className="FixtureList" id="FixtureList">
          {/* Note: Check your original rendering logic here - it seems slightly off. 
             If !showShortlist is true, you render selectedFixtures? That's unusual.
             Assuming the non-mock version is correct: (showShortlist ? selectedFixtures : fixtures) 
          */}
          {(showShortlist ? selectedFixtures : fixtures).map((fixture) => (
            <SingleFixture
              shortlist={shortlist}
              showShortlist={showShortlist}
              fixture={fixture}
              key={fixture.id}
              mock={mock}
              checked={selectedFixtures.some((f) => f.id === fixture.id)}
              onToggle={() => handleToggle(fixture)}
              isProbability={isProbability}
              handleToggleTip={handleToggleTip}
              userTips={userTips}
            />
          ))}
        </ul>
      </div>
    </>
  ) : (
    <>
      {isShortlistVisible && (
        <div className="ShortListButtons">
          <ShortlistButton
            toggleShortlist={handleToggleShortlistView}
            showShortlist={showShortlist}
          />
          <div>Shortlist</div>
          <ShareShortlistButton selectedFixtures={selectedFixtures} />
        </div>
      )}
      <div>
        <div id="Headers"></div>
        <button className="ProbabilityToggle" onClick={togglePredictionMode}>
          {isProbability ? "Select score mode" : "Select probability mode"}
        </button>
        <div className="InstructionalDiv">Generate predictions and click on any fixture for unparalleled insight</div>
        <ul className="FixtureList" id="FixtureList">
          {/* Renders shortlist when toggle is ON, full list (which is the source list) when OFF */}
          {(showShortlist ? selectedFixtures : fixtures).map((fixture) => (
            <SingleFixture
              shortlist={shortlist}
              showShortlist={showShortlist}
              fixture={fixture}
              key={fixture.id}
              mock={mock}
              checked={selectedFixtures.some((f) => f.id === fixture.id)}
              onToggle={() => handleToggle(fixture)}
              isProbability={isProbability}
              handleToggleTip={handleToggleTip}
              userTips={userTips}
            />
          ))}
        </ul>
      </div>
    </>
  );
};

function ShortlistButton({ toggleShortlist, showShortlist }) {
  // Conditionally set the text and class based on the state
  const buttonText = showShortlist
    ? "\u2605"  // Unicode for greyed out star
    : "\u2606"; // Unicode for star

  const buttonClass = showShortlist
    ? "ShortlistButton active"
    : "ShortlistButton";

  return (
    <button
      onClick={toggleShortlist}
      className={buttonClass}
    >
      {buttonText}
    </button>
  );
}

export function Fixture(props) {
  const [count, setCount] = useState(false);
  // ⭐️ Re-introduce state here to control the view ⭐️
  const [showShortlist, setShowShortlist] = useState(false);

  resultValue = props.result;

  // Dynamically choose the list source based on the toggle state
  const listSource = showShortlist
    ? props.uncappedFixtures // Full list when toggle is ON
    : props.fixtures;         // Capped list when toggle is OFF

  // The cap text logic
  const showCapText = !props.paid && props.capped === true && !showShortlist;

  return (
    <Provider store={store}>
      <List
        fixtures={listSource}
        // ⭐️ Pass state and setter DOWN ⭐️
        showShortlist={showShortlist}
        setShowShortlist={setShowShortlist}
        isProbability={props.isProbability}
        setIsProbability={props.setIsProbability}
        result={resultValue}
        count={count}
        mock={props.mock}
        handleToggleTip={props.handleToggleTip}
        userTips={props.userTips}
      />
      {!props.paid && props.capped === true && (
        <>
          <div className="LockIcon">🔒</div>
          <div className="LockText">
            {props.originalLength} games have been capped at {props.newLength} for free users
            with full stats available for those returned - sign up for as little as £1 a week to access 50 leagues and cups including the EPL, EFL, La Liga, Serie A, Champions League, Europa League, Copa Libertadores and loads more.
          </div>
        </>
      )}{" "}
    </Provider>
  );
}
