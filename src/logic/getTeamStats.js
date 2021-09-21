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
   await match.json().then(async (match) => {
    console.log(match.data)
    let matchArr = match.data.h2h.previous_matches_ids
    let previousMatchDetails;
    if(match.data.h2h.previous_matches_results.totalMatches > 0){
      let lastMatch = matchArr[matchArr.length - 1].id
      let previousMatch = await fetch(
        `${process.env.REACT_APP_EXPRESS_SERVER}match/${lastMatch}`
      );
      let dateObject;
      let date;
      await previousMatch.json().then((game) => {
        previousMatchDetails = game.data
        const unixTimestamp = previousMatchDetails.date_unix;
        const milliseconds = unixTimestamp * 1000;
        dateObject = new Date(milliseconds);


         date = `${dateObject.getDate()}/${dateObject.getMonth()+1}/${dateObject.getFullYear()}`
      })

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
            lastGameStadiumName={previousMatchDetails.stadium_name}
            lastGameHomeGoals={previousMatchDetails.homeGoalCount}
            lastGameAwayGoals={previousMatchDetails.awayGoalCount}
            lastGameHomeTeam={previousMatchDetails.home_name}
            lastGameAwayTeam={previousMatchDetails.away_name}
            lastGameDate={date}
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
    } else {
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
            lastGameStadiumName="N/A"
            lastGameHomeGoals="previous"
            lastGameAwayGoals="match"
            lastGameHomeTeam="No"
            lastGameAwayTeam="data"
            lastGameDate=""
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
    }


  });
}
