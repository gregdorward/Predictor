import React from "react";
import { CreateBadge } from "./createBadge";
import Collapsable from "../components/CollapsableElement";
import { getMatchStats } from "../logic/getStats";

export function FixtureList(props) {
  if (props.result === false) {
    return (
      <ul id="fixtures" className="container">
        <div className="fixture">
          <Collapsable />
          {props.fixtures.map((fixture) => (
            <div>
              <li
                onMouseEnter={(event) => (event.target.style.color = "orange")}
                onMouseLeave={(event) => (event.target.style.color = "")}
                className="individualFixture"
                key={fixture.id}
                onClick={() => getMatchStats(fixture)}
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
                <div className="divider">{"V"}</div>
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
              <div className="StatsContainer" >
                <div className="HomeStats" id={"home" + fixture.homeTeam}></div>
                <div className="AwayStats" id={"away" + fixture.awayTeam}></div>
              </div>
              </div>
            </div>
          ))}
        </div>
      </ul>
    );
  } else if (props.result === true) {
    return (
      <ul id="fixtures" className="container">
        <div className="fixture">
          <Collapsable />
          {props.matches.map((match) => (
            <div>
              <li
                onMouseEnter={(event) => (event.target.style.color = "orange")}
                onMouseLeave={(event) => (event.target.style.color = "")}
                className="individualFixture"
                key={match.id}
                onClick={() => getMatchStats(match)}
              >
                <div
                  className="homeForm"
                  style={{
                    backgroundColor: match.homeFormColour,
                  }}
                >
                  {match.homePpg}
                </div>
                <div className="homeTeam">{match.homeTeam}</div>
                <div className="score">{`${match.goalsA} - ${match.goalsB}`}</div>
                <div className="awayTeam">{match.awayTeam}</div>
                <div
                  className="awayForm"
                  style={{
                    backgroundColor: match.awayFormColour,
                  }}
                >
                  {match.awayPpg}
                </div>
                <CreateBadge
                  image={match.homeBadge}
                  ClassName="HomeBadge"
                  alt="Home team badge"
                  flexShrink={5}
                />
                <CreateBadge
                  image={match.awayBadge}
                  ClassName="AwayBadge"
                  alt="Away team badge"
                />
              </li>
              <div className="StatsContainer" id={"stats" + match.homeTeam}>
                <div className="HomeStats" id={"home" + match.homeTeam}></div>
                <div className="AwayStats" id={"away" + match.awayTeam}></div>
              </div>
            </div>
          ))}
        </div>
      </ul>
    );
  }
}
