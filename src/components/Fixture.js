import React, { Component, Fragment } from "react";
import { CreateBadge } from "./createBadge";
import Collapsable from "../components/CollapsableElement";
import { createStatsDiv } from "../logic/getStats";

let resultValue;

function GetDivider(fixture) {
  const matchStatus = fixture.status;
  const isPrediction = resultValue;

  if (isPrediction === false && matchStatus !== "complete") {
    return <div className="divider">{"V"}</div>;
  } else if (matchStatus === "complete") {
    let outcome;
    let prediction;

    switch (true) {
      case fixture.fixture.homeGoals > fixture.fixture.awayGoals:
        outcome = 0;
        break;
      case fixture.fixture.homeGoals === fixture.fixture.awayGoals:
        outcome = 1;
        break;
      case fixture.fixture.homeGoals < fixture.fixture.awayGoals:
        outcome = 2;
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
      return (
        <div className="CorrectResult">{`${fixture.fixture.homeGoals} - ${fixture.fixture.awayGoals}`}</div>
      );
    } else {
      return (
        <div className="Result">{`${fixture.fixture.homeGoals} - ${fixture.fixture.awayGoals}`}</div>
      );
    }
  } else {
    return (
      <div className="score">{`${fixture.fixture.goalsA} - ${fixture.fixture.goalsB}`}</div>
    );
  }
}

let fixtureClassName;

function getStyle(fixture) {
  if (fixture.btts_potential >= 60) {
    fixtureClassName = "highlight";
  } else {
    fixtureClassName = "individualFixture";
  }
  return fixtureClassName;
}

const SingleFixture = ({ fixture }) => (
  <div>
    <li
      className={getStyle(fixture)}
      key={fixture.id}
      onClick={() => createStatsDiv(fixture)}
    >
      <div
        className="homeForm"
        style={{
          backgroundColor: fixture.homeFormColour,
        }}
      >
        {fixture.homePpg}
      </div>
      <div className="homeTeam">{fixture.homeTeam}</div>
      <GetDivider
        result={resultValue}
        status={fixture.status}
        fixture={fixture}
      />
      {/* <div className="divider">{"V"}</div> */}
      <div className="awayTeam">{fixture.awayTeam}</div>
      <div
        className="awayForm"
        style={{
          backgroundColor: fixture.awayFormColour,
        }}
      >
        {fixture.awayPpg}
      </div>
      <CreateBadge
        image={fixture.homeTeamInfo.badge}
        ClassName="HomeBadge"
        alt="Home team badge"
        flexShrink={5}
      />
      <CreateBadge
        image={fixture.awayTeamInfo.badge}
        ClassName="AwayBadge"
        alt="Away team badge"
      />
    </li>
    <div>
      <div id={"stats" + fixture.homeTeam}></div>
      <Fragment>
        <div id={"BTTSPotential" + fixture.id}></div>
        <div className="StatsContainer">
          <div className="HomeStats" id={"home" + fixture.homeTeam}></div>
          <div className="AwayStats" id={"away" + fixture.awayTeam}></div>
        </div>
      </Fragment>
    </div>
  </div>
);

const List = ({ fixtures }) => (
  <div>
    <Fragment>
      <Collapsable />
    </Fragment>
    <ul>
      {fixtures.map((fixture, i) => (
        <SingleFixture fixture={fixture} />
      ))}
    </ul>
  </div>
);

export function Fixture(props) {
  resultValue = props.result;
  return <List fixtures={props.fixtures} result={resultValue} />;
}
