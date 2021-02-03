import React, { Fragment } from "react";
import { CreateBadge } from "./createBadge";
import Collapsable from "../components/CollapsableElement";
import { createStatsDiv } from "../logic/getStats"

function GetDivider(props) {
  const matchStatus = props.fixture.status;
  const isPrediction = props.result;

  if (isPrediction === false && matchStatus !== "complete") {
    return <div className="divider">{"V"}</div>;
  } else if (matchStatus === "complete") {
    return (
      <div className="Result">{`${props.fixture.homeGoals} - ${props.fixture.awayGoals}`}</div>
    );
  } else {
    return (
      <div className="score">{`${props.fixture.goalsA} - ${props.fixture.goalsB}`}</div>
    );
  }
}



// let fixtureClassName;

// function getStyle(fixture) {
//   if (fixture.btts_potential >= 50) {
//     fixtureClassName = "individualFixture";
//   } else {
//     fixtureClassName = "individualFixture"
//   }
//   return fixtureClassName;
// }


export function FixtureList(props) {
  return (
    <ul id="fixtures" className="container">
      <div className="fixture">
        <Collapsable />
        {props.fixtures.map((fixture) => (
          <div>
            <li
              onMouseEnter={(event) => (event.target.style.color = "orange")}
              onMouseLeave={(event) => (event.target.style.color = "")}
              id={props.highlight}
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
                result={props.result}
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
        ))}
      </div>
    </ul>
  );
}
