import React, { Fragment } from "react";
import { CreateBadge } from "./createBadge";
import Collapsable from "../components/CollapsableElement";
import { createStatsDiv } from "../logic/getStats";

let resultValue;
let leagueName;
const text =
  "XG Tipping formulates predictions based on recent form data ranging from points per game to each teams attacking potency\n Expected Goals in previous matches are used to determine whether teams might be over or underperforming and predictions are weighted as such\n Once all fixtures have loaded, click on “Get Predictions”\n Predictions are displayed on the right and the results on the left\n Click on an individual fixture for detailed stats for both teams.\n If you change your form selection, re-tapping the fixture will fetch new form data.\n You can also fetch fresh predictions based on the newly selected option by re-tapping on “Get Predictions” at any time.\n If no form radio button is chosen, the last 5 games will be used by default";

function GetDivider(fixture) {
  const matchStatus = fixture.status;
  const isPrediction = resultValue;

  if (isPrediction === false && matchStatus !== "complete") {
    return (
      <div className="divider" data-cy={"divider-" + fixture.fixture.id}
      >
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

    // console.log(`match.status ${fixture.fixture.status} match.prediction ${fixture.fixture.prediction} match.outcome ${fixture.fixture.outcome}`)

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

    if (fixture.fixture.homeGoals > 0 && fixture.fixture.awayGoals > 0) {
      fixture.fixture.bttsOutcome = "bttsWon";
    } else {
      fixture.fixture.bttsOutcome = "bttsLost";
    }

    if (outcome === prediction) {
      // console.log(fixture.fixture.game);
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
      // console.log(`profit ${fixture.fixture.profit}`);

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
    } else if (outcome !== prediction) {
      fixture.fixture.profit = 0;
      // console.log(fixture.fixture.game);
      // console.log(`profit ${fixture.fixture.profit}`);

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

function getStyle(bool) {

    return "individualFixture";
}

const SingleFixture = ({ fixture }) => (
  <div>
  <div className="leagueName">{fixture.leagueName}</div>
    <li
      className={getStyle(fixture.btts)}
      key={fixture.id}
      onClick={() => createStatsDiv(fixture)}
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
    <div className="StatsDiv">
      <div id={"stats" + fixture.homeTeam}></div>
      <Fragment>
        <div
          className="StatsContainer"
          data-cy={"StatsContainer-" + fixture.id}
        >
          <div className="HomeStats" id={"home" + fixture.homeTeam}></div>
          <div className="AwayStats" id={"away" + fixture.awayTeam}></div>
        </div>
      </Fragment>
      <div className="MatchHistory" id={"history" + fixture.homeTeam}></div>
    </div>
  </div>
);

let newText = text.split("\n").map((i) => {
  return <p>{i}</p>;
});

const List = ({ fixtures }) => (
  <div>
    <Fragment>
      <Collapsable className={"HowToUse"} buttonText={"Show / Hide help"} text={newText} />
    </Fragment>
    <div id="Headers"></div>
    <ul className="FixtureList" id="FixtureList">
      {fixtures.map((fixture, i) => (
        <SingleFixture fixture={fixture}/>
      ))}
    </ul>
  </div>
);

export function Fixture(props) {
  resultValue = props.result;

  return <List fixtures={props.fixtures} result={resultValue}/>;
}
