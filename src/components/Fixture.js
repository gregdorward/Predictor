import React, { Fragment, useState } from "react";
import { CreateBadge } from "./createBadge";
import Collapsable from "../components/CollapsableElement";
import { createStatsDiv } from "../logic/getStats";
import { renderTable } from "../logic/getFixtures";
import { allLeagueResultsArrayOfObjects } from "../logic/getFixtures"


let resultValue;
var count;
var setCount;

function toggle(bool) {
  count = !bool;
  return count;
}

// function stylying(bool){
//   if (bool === true) {
//     // set stats element to display flex
//     return { display: "block" };
//   } else {
//     // set stats element to display none
//     return { display: "none" };
//   }
// }

function GetDivider(fixture) {
  const matchStatus = fixture.status;
  const isPrediction = resultValue;

  console.log(fixture)
  console.log(isPrediction)

  if (isPrediction === false && matchStatus !== "complete") {
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
  } 
  else if (isPrediction === true && matchStatus === "complete") {
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

function renderLeagueName(fixture) {
  let name = fixture.leagueName;
  let id = allLeagueResultsArrayOfObjects[fixture.leagueIndex].id
  if (name === null) {
    return <div></div>;
  } else {
    return (
      <div>
        <div
          className="leagueName"
          id={`league${id}`}
          key={`leagueName${id}div`}
          onClick={() => renderTable(fixture.leagueIndex, allLeagueResultsArrayOfObjects[fixture.leagueIndex], id)}
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

const SingleFixture = ({ fixture, count }) => (
  <div key={fixture.game}>
    {renderLeagueName(fixture)}
    <li
      className={"individualFixture"}
      key={fixture.id}
      onMouseDown={() => (count = toggle(count))}
      onClick={() => createStatsDiv(fixture, count)}
      data-cy={fixture.id}
    >
      <div className="HomeOdds">{fixture.fractionHome}</div>
      <div className="homeTeam">{fixture.homeTeam}</div>
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
    <div id={"stats" + fixture.homeTeam}/>
      <div className="MatchHistory" id={"history" + fixture.homeTeam}/>
  </div>
);

const List = ({ fixtures }) => (
  <div>
    <div id="Headers"></div>
    <ul className="FixtureList" id="FixtureList">
      {fixtures.map((fixture, i) => (
        <SingleFixture fixture={fixture} key={fixture.game} count={count} />
      ))}
    </ul>
  </div>
);

export function Fixture(props) {
  [count, setCount] = useState(false);
  resultValue = props.result;
  return <List fixtures={props.fixtures} result={resultValue} count={count} />;
}
