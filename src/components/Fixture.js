import React, { Fragment } from "react";
import { CreateBadge } from "./createBadge";
import Collapsable from "../components/CollapsableElement";
import { createStatsDiv } from "../logic/getStats";

let resultValue;
const text =
  "Next to each badge is each team’s points per game picked up at home or away.\n Once the fixtures have loaded, click on “Get Predictions” to get predictions based on form data.\n Click on an individual fixture for detailed stats for both teams.\n If you change your form selection, re-tapping the fixture will fetch new form data.\n You can also fetch fresh predictions based on the newly selected option by re-tapping on “Get Predictions” at any time.\n If a match is resulted, tapping “Get Predictions” will show how accurate the prediction was.\n If no form radio button is chosen, the last 5 games will be used by default";


function GetDivider(fixture) {
  const matchStatus = fixture.status;
  const isPrediction = resultValue;

  if (isPrediction === false && matchStatus !== "complete") {
    return <div className="divider">{"V"}</div>;
  } else if (isPrediction === false && matchStatus === "complete") {
    return (
      <div className="Result">{`${fixture.fixture.homeGoals} - ${fixture.fixture.awayGoals}`}</div>
    );
  } else if (isPrediction === true && matchStatus === "complete") {
    let outcome;
    let prediction;

    switch (true) {
      case fixture.fixture.homeGoals > fixture.fixture.awayGoals:
        outcome = 0;
        fixture.fixture.winner=fixture.fixture.homeTeam
        break;
      case fixture.fixture.homeGoals === fixture.fixture.awayGoals:
        outcome = 1;
        fixture.fixture.winner="draw"
        break;
      case fixture.fixture.homeGoals < fixture.fixture.awayGoals:
        outcome = 2;
        fixture.fixture.winner=fixture.fixture.awayTeam
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
      switch (true) {
        case outcome === 0:
          fixture.fixture.profit = fixture.fixture.homeOdds
          break;
        case outcome === 1:
          fixture.fixture.profit = fixture.fixture.drawOdds
          break;
        case outcome === 2:
          fixture.fixture.profit = fixture.fixture.awayOdds
          break;
        default:
          break;
      }


      return (
        <Fragment>
          <div className="CorrectResult">{`${fixture.fixture.homeGoals} - ${fixture.fixture.awayGoals}`}</div>
          <div className="score" key={fixture.fixture.homeTeam}>{`${fixture.fixture.goalsA} - ${fixture.fixture.goalsB}`}</div>
        </Fragment>
      );
    } else if (outcome !== prediction) {
      fixture.fixture.profit = -1

      return (
        <Fragment>
          <div className="Result">{`${fixture.fixture.homeGoals} - ${fixture.fixture.awayGoals}`}</div>
          <div className="score" key={fixture.fixture.awayTeam}>{`${fixture.fixture.goalsA} - ${fixture.fixture.goalsB}`}</div>
        </Fragment>
      );
    }
  } else {
    return (
      <div className="score" key={fixture.fixture.id}>{`${fixture.fixture.goalsA} - ${fixture.fixture.goalsB}`}</div>
    );
  }
}

const SingleFixture = ({ fixture }) => (
  <div>
    <li
      className="individualFixture"
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

let newText = text.split("\n").map((i) => {
  return <p>{i}</p>;
});

const List = ({ fixtures }) => (
  <div>
    <Fragment>
      <Collapsable buttonText={"How do I use this?"} text={newText} />
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
