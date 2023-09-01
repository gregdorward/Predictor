import React, { Fragment, useState } from "react";
import { CreateBadge } from "./createBadge";
import Collapsable from "../components/CollapsableElement";
import { createStatsDiv } from "../logic/getStats";
import { renderTable } from "../logic/getFixtures";
import { allLeagueResultsArrayOfObjects } from "../logic/getFixtures";
import { json, useNavigate } from "react-router-dom";
import { Zoom } from "swiper";
import { useDispatch } from "react-redux";
import { setData } from "../logic/dataSlice";
import { Provider } from "react-redux";
import store from "../logic/store"; // Import your Redux store
import { formObjectHome } from "../logic/getScorePredictions";
import { clicked } from "../logic/getScorePredictions";

let resultValue;
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

  if (mockValue === true && matchStatus === "complete") {
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
    if (outcome === prediction) {
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

function renderLeagueName(fixture, mock) {
  mockValue = mock;

  let name = fixture.leagueName;
  let id =
    allLeagueResultsArrayOfObjects.length > 0
      ? allLeagueResultsArrayOfObjects[fixture.leagueIndex].id
      : null;
  if (name === null || mock === true) {
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
export let testing;

function SingleFixture({ fixture, count, mock }) {
  const dispatch = useDispatch();
  function StoreData(){

    const fixtureDetails = {
      homeTeamName: fixture.homeTeam,
      homeTeamBadge: fixture.homeBadge,
      awayTeamName: fixture.awayTeam,
      awayTeamBadge: fixture.awayBadge,
      stadium: fixture.stadium,
      time: fixture.time,
      homeGoals: fixture.goalsA,
      awayGoals: fixture.goalsB
    }

    const homeDetails = {
      "Attacking Strength": fixture.formHome.attackingStrength,
      "Defensive Strength": fixture.formHome.defensiveStrength
    }

    const awayDetails = {
      "Attacking Strength": fixture.formAway.attackingStrength,
      "Defensive Strength": fixture.formAway.defensiveStrength
    }

    const dataToSend = {
      key1: 'value1',
      key2: 'value2',
    };
    fixture.formHome.defensiveMetrics["Clean Sheet Percentage"] = fixture.formHome.CleanSheetPercentage
    fixture.formAway.defensiveMetrics["Clean Sheet Percentage"] = fixture.formAway.CleanSheetPercentage

    localStorage.setItem('homeForm', JSON.stringify(fixture.formHome.attackingMetrics));
    localStorage.setItem('homeFormDef', JSON.stringify(fixture.formHome.defensiveMetrics));
    localStorage.setItem('allTeamResultsHome', JSON.stringify(fixture.formHome.allTeamResults));
    localStorage.setItem('homeDetails', JSON.stringify(homeDetails));


    localStorage.setItem('awayForm', JSON.stringify(fixture.formAway.attackingMetrics));
    localStorage.setItem('awayFormDef', JSON.stringify(fixture.formAway.defensiveMetrics));
    localStorage.setItem('allTeamResultsAway', JSON.stringify(fixture.formAway.allTeamResults));
    localStorage.setItem('awayDetails', JSON.stringify(awayDetails));

    localStorage.setItem('fixtureDetails', JSON.stringify(fixtureDetails))

    dispatch(setData(dataToSend));
  }


  async function handleButtonClick(game) {
    if(clicked === true){
      StoreData(formObjectHome)
      window.open("/#/fixture");
    }
    else return
  }
  return (
    <div key={fixture.game}>
      {renderLeagueName(fixture, mock)}
      <div className="individualFixtureContainer">
        <li
          className={"individualFixture"}
          key={fixture.id}
          data-cy={fixture.id}
          onClick={() => handleButtonClick(fixture)}
        >
          <div className="HomeOdds">{fixture.fractionHome}</div>
          <div className="homeTeam">
            {fixture.homeTeam}
          </div>
          <GetDivider
            result={resultValue}
            status={fixture.status}
            fixture={fixture}
          />
          {/* <div className="divider">{"V"}</div> */}
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
        <button
          className="GameStats"
          onClick={() =>
            mock === false ? createStatsDiv(fixture, count) : null
          }
          onMouseDown={() => (count = toggle(count))}
        >
          Game stats {downArrow}
        </button>
      </div>
      <div id={"stats" + fixture.homeTeam} />
      <div className="MatchHistory" id={"history" + fixture.homeTeam} />
    </div>
  );
}

const List = ({ fixtures, mock }) => (
  <div>
    <div id="Headers"></div>
    <ul className="FixtureList" id="FixtureList">
      {fixtures.map((fixture, i) => (
        <SingleFixture
          fixture={fixture}
          key={fixture.game}
          count={count}
          mock={mock}
        />
      ))}
    </ul>
  </div>
);

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
    </Provider>
  );
}
