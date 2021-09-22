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
    let secondToPreviousMatchDetails;
    if(match.data.h2h.previous_matches_results.totalMatches > 0){
      matchArr.sort((a, b) => b.date_unix - a.date_unix);
      let lastMatch = matchArr[0].id
      let secondToLastMatch = matchArr[1].id

      let previousMatch = await fetch(
        `${process.env.REACT_APP_EXPRESS_SERVER}match/${lastMatch}`
      );
      let dateObject;
      let date;
      let date2;
      await previousMatch.json().then(async (game) => {
        previousMatchDetails = game.data
        console.log(previousMatchDetails)
        const unixTimestamp = previousMatchDetails.date_unix;
        const milliseconds = unixTimestamp * 1000;
        dateObject = new Date(milliseconds);
         date = `${dateObject.getDate()}/${dateObject.getMonth()+1}/${dateObject.getFullYear()}`

         let secondToPreviousMatch = await fetch(
          `${process.env.REACT_APP_EXPRESS_SERVER}match/${secondToLastMatch}`
        );
        let dateObject2;
        await secondToPreviousMatch.json().then((game) => {
          secondToPreviousMatchDetails = game.data
          console.log(secondToPreviousMatchDetails)
          const unixTimestamp = secondToPreviousMatchDetails.date_unix;
          const milliseconds = unixTimestamp * 1000;
          dateObject2 = new Date(milliseconds);
          date2 = `${dateObject2.getDate()}/${dateObject2.getMonth()+1}/${dateObject2.getFullYear()}`
        })
  
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
            secondToLastGameStadiumName={secondToPreviousMatchDetails.stadium_name}
            secondToLastGameHomeGoals={secondToPreviousMatchDetails.homeGoalCount}
            secondToLastGameAwayGoals={secondToPreviousMatchDetails.awayGoalCount}
            secondToLastGameHomeTeam={secondToPreviousMatchDetails.home_name}
            secondToLastGameAwayTeam={secondToPreviousMatchDetails.away_name}
            secondToLastGameDate={date2}
          ></HeadToHead>
          <CustomizedTables
            o05Stat={match.data.h2h.betting_stats.over05Percentage}
            o15Stat={match.data.h2h.betting_stats.over15Percentage}
            o15Forecast={match.data.o15_potential}
            o05Odds={match.data.odds_ft_over05}
            u05Odds={match.data.odds_ft_under05}
            o15Odds={match.data.odds_ft_over15}
            u15Odds={match.data.odds_ft_under15}
            o25Stat={match.data.h2h.betting_stats.over25Percentage}
            o25Forecast={match.data.o25_potential}
            o25Odds={match.data.odds_ft_over25}
            u25Odds={match.data.odds_ft_under25}
            o35Stat={match.data.h2h.betting_stats.over35Percentage}
            o35Forecast={match.data.o35_potential}
            o35Odds={match.data.odds_ft_over35}
            u35Odds={match.data.odds_ft_under35}
            BTTSStat={match.data.h2h.betting_stats.bttsPercentage}
            BTTSForecast={match.data.btts_potential}
            BTTSOdds={match.data.odds_btts_yes}
            BTTSOddsNo={match.data.odds_btts_no}
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
            secondToLastGameStadiumName="N/A"
            secondToLastGameHomeGoals="previous"
            secondToLastGameAwayGoals="match"
            secondToLastGameHomeTeam="No"
            secondToLastGameAwayTeam="data"
            secondToLastGameDate=""
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
