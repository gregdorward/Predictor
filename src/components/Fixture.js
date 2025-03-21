import React, { Fragment, useState } from "react";
import { CreateBadge } from "./createBadge";
import { createStatsDiv } from "../logic/getStats";
import { renderTable } from "../logic/getFixtures";
import { allLeagueResultsArrayOfObjects } from "../logic/getFixtures";
import { useDispatch } from "react-redux";
import { setData } from "../logic/dataSlice";
import { Provider } from "react-redux";
import store from "../logic/store"; // Import your Redux store
import { formObjectHome } from "../logic/getScorePredictions";
import { clicked } from "../logic/getScorePredictions";
import { userDetail } from "../logic/authProvider";
import { checkUserPaidStatus } from "../logic/hasUserPaid";
import GameStats from "./GameStats";
import { userTips } from "./GameStats";
import { dynamicDate } from "../logic/getFixtures";

let resultValue;
let paid;
var count;
let mockValue;
var setCount;
function toggle(bool) {
  count = !bool;
  return count;
}

function GetDivider(fixture, mock) {
  const matchStatus = fixture.status;
  let isPrediction = resultValue;

  if (fixture.fixture.omit === true && matchStatus !== "complete") {
    isPrediction = true;
    return (
      <Fragment>
        <div className="KOTime">{`${fixture.fixture.time}`}</div>
        <div
          className="Omitted"
          key={fixture.fixture.awayTeam}
        >{`${fixture.fixture.goalsA} - ${fixture.fixture.goalsB}`}</div>
      </Fragment>
    );
  } else if (mockValue === true && matchStatus === "complete") {
    isPrediction = false;
    return (
      <Fragment>
        <div className="Result">{`${fixture.fixture.homeGoals} - ${fixture.fixture.awayGoals}`}</div>
        <div
          className="CorrectScore"
          key={fixture.fixture.homeTeam}
          data-cy={"score-" + fixture.fixture.id}
        >{`${fixture.fixture.goalsA} - ${fixture.fixture.goalsB}`}</div>
      </Fragment>
    );
  } else if (mockValue === true && matchStatus !== "complete") {
    isPrediction = true;
    return (
      <Fragment>
        <div className="KOTime">{`${fixture.fixture.time}`}</div>
        <div
          className="score"
          key={fixture.fixture.awayTeam}
        >{`${fixture.fixture.goalsA} - ${fixture.fixture.goalsB}`}</div>
      </Fragment>
    );
  } else if (isPrediction === false && matchStatus !== "complete") {
    return (
      <div className="divider" data-cy={"divider-" + fixture.fixture.id}>
        {"V"}
      </div>
    );
  } else if (isPrediction === false && matchStatus === "complete") {
    return (
      <div
        className="Result"
        data-cy={"result-" + fixture.fixture.id}
      >{`${fixture.fixture.homeGoals} - ${fixture.fixture.awayGoals}`}</div>
    );
  } else if (isPrediction === true && matchStatus === "complete") {
    let outcome;
    let prediction;

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

    if (fixture.fixture.omit === true) {
      return (
        <Fragment>
          <div className="Result">{`${fixture.fixture.homeGoals} - ${fixture.fixture.awayGoals}`}</div>
          <div
            className="Omitted"
            key={fixture.fixture.homeTeam}
            data-cy={"score-" + fixture.fixture.id}
          >{`${fixture.fixture.goalsA} - ${fixture.fixture.goalsB}`}</div>
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
        return (
          <Fragment>
            <div className="Result">{`${fixture.fixture.homeGoals} - ${fixture.fixture.awayGoals}`}</div>
            <div
              className="ExactScore"
              key={fixture.fixture.homeTeam}
              data-cy={"score-" + fixture.fixture.id}
            >{`${fixture.fixture.goalsA} - ${fixture.fixture.goalsB}`}</div>
          </Fragment>
        );
      } else {
        fixture.fixture.exactScore = false;
        return (
          <Fragment>
            <div className="Result">{`${fixture.fixture.homeGoals} - ${fixture.fixture.awayGoals}`}</div>
            <div
              className="CorrectScore"
              key={fixture.fixture.homeTeam}
              data-cy={"score-" + fixture.fixture.id}
            >{`${fixture.fixture.goalsA} - ${fixture.fixture.goalsB}`}</div>
          </Fragment>
        );
      }
    } else if (outcome !== prediction) {
      if (fixture.fixture.homeOdds !== 0) {
        fixture.fixture.profit = 0;
      } else {
        fixture.fixture.profit = 1;
      }
      fixture.fixture.exactScore = false;
      return (
        <Fragment>
          <div className="Result">{`${fixture.fixture.homeGoals} - ${fixture.fixture.awayGoals}`}</div>
          <div
            className="IncorrectScore"
            key={fixture.fixture.awayTeam}
          >{`${fixture.fixture.goalsA} - ${fixture.fixture.goalsB}`}</div>
        </Fragment>
      );
    }
  } else {
    return (
      <Fragment>
        <div className="KOTime">{`${fixture.fixture.time}`}</div>
        <div
          className="score"
          key={fixture.fixture.awayTeam}
        >{`${fixture.fixture.goalsA} - ${fixture.fixture.goalsB}`}</div>
      </Fragment>
    );
  }
}

function renderLeagueName(fixture, mock, showShortlist) {
  mockValue = mock;

  let name = fixture.leagueName;
  let id =
    allLeagueResultsArrayOfObjects.length > 0
      ? allLeagueResultsArrayOfObjects[fixture.leagueIndex].id
      : null;
  if (showShortlist === true) {
    return (
      <div>
        <div
          className="leagueName"
          id={`league${id}`}
          key={`leagueName${id}div`}
          onClick={() =>
            renderTable(
              fixture.leagueIndex,
              allLeagueResultsArrayOfObjects[fixture.leagueIndex],
              id
            )
          }
        >
          {fixture.leagueDesc} &#9776;
        </div>
        <div
          className="LeagueTable"
          key={`leagueName${id}`}
          id={`leagueName${id}`}
        ></div>
      </div>
    );
  } else if (name === null || mock === true) {
    return <div></div>;
  } else {
    return (
      <div>
        <div
          className="leagueName"
          id={`league${id}`}
          key={`leagueName${id}div`}
          onClick={() =>
            renderTable(
              fixture.leagueIndex,
              allLeagueResultsArrayOfObjects[fixture.leagueIndex],
              id
            )
          }
        >
          {fixture.leagueName} &#9776;
        </div>
        <div
          className="LeagueTable"
          key={`leagueName${id}`}
          id={`leagueName${id}`}
        ></div>
      </div>
    );
  }
}

const downArrow = "\u{2195}";
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

    localStorage.setItem("fixtureDetails", JSON.stringify(fixtureDetails));
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

  const handleGameStatsClick = () => {
    if (!clicked) {
      alert("Tap Get Predictions to fetch all game stats first");
      return;
    }
    StoreData();
    setShowGameStats(!showGameStats);
  };

  return (
    <div key={fixture.game}>
      {renderLeagueName(fixture, mock, showShortlist)}
      <div className={`individualFixtureContainer${fixture.omit}`}>
        <li
          className={`individualFixture${fixture.omit}`}
          key={fixture.id}
          data-cy={fixture.id}
          // onClick={onToggle} // Toggle checked state on click
          style={{ display: checked ? "lightblue" : "white" }} // Change background when checked
        >
          <div className="HomeOdds">{fixture.fractionHome}</div>
          <div className="homeTeam">{fixture.homeTeam}</div>
          <GetDivider
            result={resultValue}
            status={fixture.status}
            fixture={fixture}
          />
          <div className="awayTeam">{fixture.awayTeam}</div>
          <CreateBadge
            image={fixture.homeBadge}
            ClassName="HomeBadge"
            alt="Home team badge"
            flexShrink={5}
          />
          <CreateBadge
            image={fixture.awayBadge}
            ClassName="AwayBadge"
            alt="Away team badge"
          />
          <div className="AwayOdds">{fixture.fractionAway}</div>
        </li>
        <button className="GameStats" onClick={handleGameStatsClick}>
          Game overview {downArrow}
        </button>
        <input
          type="checkbox"
          checked={checked}
          onChange={onToggle}
          className="star"
          id={`shortlist-${fixture.id}`} // Unique ID for label association
        />
        <button className="GameStatsTwo" onClick={handleButtonClick}>
          More detail {rightArrow}
        </button>
        {/* Checkbox for toggling */}
      </div>
      {showGameStats && <GameStats game={fixture} displayBool={true} />}
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
    alert('Tips submitted. You may need to refresh your page to see them appear the list')
  } else {
    return;
  }

  localStorage.removeItem("userTips");
  userTips.length = 0;
}

const List = ({ fixtures, mock }) => {
  // State to track selected fixtures
  const [selectedFixtures, setSelectedFixtures] = useState([]);
  const [showShortlist, setShowShortlist] = useState(false); // Toggle between full list and shortlist

  const handleToggle = (fixture) => {

    setSelectedFixtures((prev) => {
      const index = prev.findIndex((f) => f.id === fixture.id);
      if (index !== -1) {
        // Remove fixture if already selected
        return prev.filter((_, i) => i !== index);
      } else {
        // Add fixture to the end of the array
        return [...prev, fixture];
      }
    });
  };

  // Convert array into an indexed object
  const shortlist = Object.fromEntries(
    selectedFixtures.map((fixture, i) => [i, fixture])
  );

  return (
    <>
      <ShortlistButton
        toggleShortlist={() => setShowShortlist(!showShortlist)}
      />
      <SubmitTipsButton submit={() => submitTips()} />
      <div>
        <div id="Headers"></div>
        <ul className="FixtureList" id="FixtureList">
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

function ShortlistButton({ toggleShortlist }) {
  return <button onClick={toggleShortlist}>Toggle Shortlist &#9733; </button>;
}

function SubmitTipsButton({ submit }) {
  return (
    <button
      onClick={submit}
      style={{
        border: "1px solid #fe8c00",
      }}
    >
      Submit My Tips
    </button>
  );
}

export function Fixture(props) {
  [count, setCount] = useState(false);
  resultValue = props.result;
  return (
    <Provider store={store}>
      <List
        fixtures={props.fixtures}
        result={resultValue}
        count={count}
        mock={props.mock}
      />
      {!props.paid && props.capped === true && (
        <div>
          {props.originalLength} games have been capped at 15 for free users
          with full stats available for those returned - sign up for access to
          40+ leagues and cups
        </div>
      )}{" "}
    </Provider>
  );
}
