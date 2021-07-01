import ReactDOM from "react-dom";
import HeadToHead from "../components/HeadToHead";
import BulletList from "../components/BulletList";
import { Fragment } from "react";

export async function getTeamStats(id, home, away) {
  console.log("EXECUTED");
  let identifier = id;
  let match = await fetch(
    `${process.env.REACT_APP_EXPRESS_SERVER}match/${identifier}`
  );
  await match.json().then((match) => {
    ReactDOM.render(
      <Fragment>
        <h3>Fixture history</h3>
        <HeadToHead
          className={"PreviousMatchStats"}
          homeTeam={home}
          awayTeam={away}
          stadium={match.data.stadium_name}
          matches={match.data.h2h.previous_matches_results.totalMatches}
          homeWins={match.data.h2h.previous_matches_results.team_a_wins}
          awayWins={match.data.h2h.previous_matches_results.team_b_wins}
          draws={match.data.h2h.previous_matches_results.draw}
          averageGoals={match.data.h2h.betting_stats.avg_goals}
          bttsPercentage={match.data.h2h.betting_stats.bttsPercentage}
          over25Percentage={match.data.h2h.betting_stats.over25Percentage}
        ></HeadToHead>
      </Fragment>,
      document.getElementById(`H2HStats${identifier}`)
    );

    ReactDOM.render(
      <Fragment>
        <h3>Trends</h3>
        <BulletList array={match.data.trends.team_a}></BulletList>
      </Fragment>,
      document.getElementById(`TrendsHome${identifier}`)
    );

    ReactDOM.render(
      <BulletList array={match.data.trends.team_b}></BulletList>,
      document.getElementById(`TrendsAway${identifier}`)
    );
  });
}
