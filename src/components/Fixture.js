import React, { Fragment, useState, useEffect, useRef } from "react";
import { CreateBadge } from "./createBadge";
import { useDispatch } from "react-redux";
import { setData } from "../logic/dataSlice";
import { Provider } from "react-redux";
import store from "../logic/store"; // Import your Redux store
import { clicked } from "../logic/getScorePredictions";
import { userDetail } from "../logic/authProvider";
import { checkUserPaidStatus } from "../logic/hasUserPaid";
import GameStats from "./GameStats";
import { userTips } from "./GameStats";
import { leagueStatsArray } from "../logic/getScorePredictions";
import LeagueName from './LeagueName';
import ShareShortlistButton from "./ShareShortlistButton";

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

function GetDivider(fixture, mock) {
  const matchStatus = fixture.status;
  let isPrediction = resultValue;
  console.log(fixture)

  if (fixture.fixture.omit === true && matchStatus !== "complete") {
    isPrediction = true;
    return (
      <div className="KOAndPrediction">
        <div className="KOTime">{`${fixture.fixture.time}`}</div>
      </div>
    );
  } else if (mockValue === true && matchStatus === "complete") {
    isPrediction = false;
    return (
      <div className="KOAndPrediction">
        <div className="KOTime">{`${fixture.fixture.time}`}</div>
      </div>
    );
  } else if (mockValue === true && matchStatus !== "complete") {
    isPrediction = true;
    return (
      <div className="KOAndPrediction">
        <div className="KOTime">{`${fixture.fixture.time}`}</div>
      </div>
    );
  } else if (isPrediction === false && matchStatus !== "complete") {
    return (
      <div className="KOAndPrediction">
        <div className="KOTime">{`${fixture.fixture.time}`}</div>
      </div>
    );
  } else if (isPrediction === false && matchStatus === "complete") {
    return (
      <div className="KOAndPrediction">
        <div className="KOTime">{`${fixture.fixture.time}`}</div>
      </div>
    );
  } else if (isPrediction === true && matchStatus === "complete") {
    let outcome;
    let prediction;
    console.log(fixture.fixture)

    switch (true) {
      case fixture.fixture.homeGoals > fixture.fixture.awayGoals:
        outcome = 0;
        fixture.fixture.winner = fixture.fixture.homeTeam;
        fixture.fixture.outcome = "homeWin";
        break;
      case fixture.fixture.homeGoals === fixture.fixture.awayGoals:
        outcome = 1;
        fixture.fixture.winner = "draw";
        fixture.fixture.outcome = "draw";

        break;
      case fixture.fixture.homeGoals < fixture.fixture.awayGoals:
        outcome = 2;
        fixture.fixture.winner = fixture.fixture.awayTeam;
        fixture.fixture.outcome = "awayWin";

        break;
      default:
        break;
    }

    switch (true) {
      case fixture.fixture.goalsA > fixture.fixture.goalsB:
        prediction = 0;
        break;
      case fixture.fixture.goalsA === fixture.fixture.goalsB:
        prediction = 1;
        break;
      case fixture.fixture.goalsA < fixture.fixture.goalsB:
        prediction = 2;
        break;
      default:
        break;
    }

    console.log(fixture.fixture)
    if (fixture.fixture.omit === true) {
      return (
        <Fragment>
          <div
            className="Omitted"
            key={fixture.fixture.homeTeam}
            data-cy={"score-" + fixture.fixture.id}
          ></div>
        </Fragment>
      );
    } else if (outcome === prediction) {
      if (fixture.fixture.homeOdds !== 0) {
        switch (true) {
          case outcome === 0:
            fixture.fixture.profit = fixture.fixture.homeOdds;
            break;
          case outcome === 1:
            fixture.fixture.profit = fixture.fixture.drawOdds;
            break;
          case outcome === 2:
            fixture.fixture.profit = fixture.fixture.awayOdds;
            break;
          default:
            break;
        }
      } else fixture.fixture.profit = 1;

      if (
        fixture.fixture.goalsA === fixture.fixture.homeGoals &&
        fixture.fixture.goalsB === fixture.fixture.awayGoals
      ) {
        fixture.fixture.exactScore = true;
        tipOutcome = "exact";
        return null;
      } else {
        fixture.fixture.exactScore = false;
        tipOutcome = "correct";
        return null;
      }
    } else if (outcome !== prediction) {
      if (fixture.fixture.homeOdds !== 0) {
        fixture.fixture.profit = 0;
      } else {
        fixture.fixture.profit = 1;
      }
      // fixture.fixture.exactScore = false;
      tipOutcome = "incorrect";
      return null;
    }
  } else {
    return (
      <div className="KOAndPrediction">
        <div className="KOTime">{`${fixture.fixture.time}`}</div>
      </div>
    );
  }
}

const downArrow = "\u{2630}";
const rightArrow = "\u{29C9}";

export let testing;

function SingleFixture({
  fixture,
  count,
  mock,
  checked,
  onToggle,
  showShortlist,
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
        window.open("/#/fixture");
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
      <div className={`individualFixtureContainerfalse`}>
        <li
          className={`individualFixture${fixture.omit}`}
          key={fixture.id}
          data-cy={fixture.id}
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
          </div>
          <div className={`HomeAndAwayContainer${fixture.predictionOutcome}`}>
            <div className="HomeContainer">
              <div className="HomeOdds">{fixture.fractionHome}</div>
              <CreateBadge
                image={fixture.homeBadge}
                ClassName="HomeBadge"
                alt="Home team badge"
                flexShrink={5}
              />
              <div className="homeTeam">
                {" "}
                {fixture.homeTeam}{" "}
                {fixture.formHome ? `(${fixture.formHome.LeaguePosition})` : ""}
              </div>
              <div className="score" key={fixture.homeTeam}>
                {fixture.goalsA !== undefined ? `${fixture.goalsA}` : `-`}
              </div>
              <div className={`result`}>
                {fixture.status === "complete" ? `${fixture.homeGoals}` : `-`}
              </div>
              <div className={`Last5`}>
                {fixture.formHome && (
                  <>
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
              <button className="GameStatsTwo" onClick={handleButtonClick}>
                {rightArrow}
              </button>
            </div>
            <div className="AwayContainer">
              <div className="AwayOdds">{fixture.fractionAway}</div>
              <CreateBadge
                image={fixture.awayBadge}
                ClassName="AwayBadge"
                alt="Away team badge"
              />
              <div className="awayTeam">
                {fixture.awayTeam}{" "}
                {fixture.formAway ? `(${fixture.formAway.LeaguePosition})` : ""}
              </div>
              <div className="score" key={fixture.awayTeam}>
                {fixture.goalsB !== undefined ? `${fixture.goalsB}` : `-`}
              </div>
              <div className="result">
                {fixture.status === "complete" ? `${fixture.awayGoals}` : `-`}
              </div>
              <div className={`Last5`}>
                {fixture.formAway && (
                  <>
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
              <button className="GameStats" onClick={handleGameStatsClick}>
                {downArrow}
              </button>
            </div>
            {/* <div className="ActionButtons">
              <input
                type="checkbox"
                checked={checked}
                onChange={onToggle}
                className="star"
                id={`shortlist-${fixture.id}`} // Unique ID for label association
              />
            </div> */}
          </div>
        </li>
      </div>
      {isLoadingGameStats && <div>Loading Game Stats...</div>}{" "}
      {/* Show loading message */}
      {showGameStats && !isLoadingGameStats && (
        <GameStats
          game={fixture}
          displayBool={true}
          stats={leagueStatsArray[`leagueStats${fixture.leagueID}`]}
        />
      )}
    </div>
  );
}

async function submitTips() {
  if (userDetail?.uid && userTips) {
    await fetch(`${process.env.REACT_APP_EXPRESS_SERVER}tips`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userTips),
    });
    alert("Tips submitted");
  } else {
    return;
  }

  localStorage.removeItem("userTips");
  userTips.length = 0;
}

const List = ({ 
  fixtures, 
  mock, 
  showShortlist, 
  setShowShortlist, 
  // You may also want to accept fullUncappedFixtures here if that was part of your final solution
}) => {
  // ⭐️ showShortlist state is now received via props, not local state ⭐️
  const [selectedFixtures, setSelectedFixtures] = useState([]);
  
  // You need to resolve this variable being undefined if it's not a prop or local state
  // console.log(showShortlist); 

  const isInitialMount = useRef(true);

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
            />
          ))}
        </ul>
      </div>
    </>
  ) : (
    <>
      <ShortlistButton
        toggleShortlist={handleToggleShortlistView}
        showShortlist={showShortlist}
      />
      <ShareShortlistButton selectedFixtures={selectedFixtures} />
      <SubmitTipsButton submit={() => submitTips()} />
      <div>
        <div id="Headers"></div>
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
    ? "Disable Shortlist"  // Unicode for up arrow
    : "Show Shortlist \u272A"; // Unicode for star

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

function SubmitTipsButton({ submit }) {
  return (
    <button
      className="SubmitTipsButton"
      onClick={submit}
    >
      Submit My Tips
    </button>
  );
}

export function Fixture(props) {
  const [count, setCount] = useState(false);
  // ⭐️ Re-introduce state here to control the view ⭐️
  console.log(props)
  const [showShortlist, setShowShortlist] = useState(false);
  resultValue = props.result;

  // Dynamically choose the list source based on the toggle state
  const listSource = showShortlist
    ? props.uncappedFixtures // Full list when toggle is ON
    : props.fixtures;         // Capped list when toggle is OFF

  // The cap text logic
  const showCapText = !props.paid && props.capped === true && !showShortlist;
  console.log(resultValue)

  return (
    <Provider store={store}>
      <List
        fixtures={listSource}
        // ⭐️ Pass state and setter DOWN ⭐️
        showShortlist={showShortlist}
        setShowShortlist={setShowShortlist}

        result={resultValue}
        count={count}
        mock={props.mock}
      />
      {!props.paid && props.capped === true && (
        <>
          <div className="LockIcon">🔒</div>
          <div className="LockText">
            {props.originalLength} games have been capped at {props.newLength} for free users
            with full stats available for those returned - sign up for access to
            50 leagues and cups
          </div>
        </>
      )}{" "}
    </Provider>
  );
}
