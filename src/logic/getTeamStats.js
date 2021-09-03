import ReactDOM from "react-dom";
import HeadToHead from "../components/HeadToHead";
import BulletList from "../components/BulletList";
import { Fragment } from "react";
import Table from "@material-ui/core/Table";
import CustomizedTables from "../components/Table";
import { matches } from "./getFixtures";

export async function getTeamStats(id, home, away) {
  console.log("EXECUTED");
  let identifier = id;
  let match = await fetch(
    `${process.env.REACT_APP_EXPRESS_SERVER}match/${identifier}`
  );
  await match.json().then((match) => {
    console.log(match.data)
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
        ></HeadToHead>
        <CustomizedTables
          o15Stat={match.data.h2h.betting_stats.over15Percentage}
          o15Forecast={match.data.o15_potential}
          o15Odds={match.data.odds_ft_over15}
          o25Stat={match.data.h2h.betting_stats.over25Percentage}
          o25Forecast={match.data.o25_potential}
          o25Odds={match.data.odds_ft_over25}
          BTTSStat={match.data.h2h.betting_stats.bttsPercentage}
          BTTSForecast={match.data.btts_potential}
          BTTSOdds={match.data.odds_btts_yes}
          CornersStat={"–"}
          CornersForecast={match.data.corners_potential}
          CornersOdds={match.data.odds_corners_over_105}
        />
      </Fragment>,
      document.getElementById(`H2HStats${identifier}`)
    );
  });
}
