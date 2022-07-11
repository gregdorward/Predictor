import ReactDOM from "react-dom";
import HeadToHead from "../components/HeadToHead";
import { Fragment } from "react";
import CustomizedTables from "../components/Table";
import Competition4340 from "../data/Competition4340.json";

export async function getTeamStats(id, home, away) {
  console.log("EXECUTED");
  let identifier = id;
  let bestHomeOdds;
  let bestHomeOddsProvider;
  let bestAwayOdds;
  let bestAwayOddsProvider;

  let match = await fetch(
    `${process.env.REACT_APP_EXPRESS_SERVER}match/${identifier}`
  );
  await match.json().then(async (match) => {
    let matchArr = match.data.h2h.previous_matches_ids;
    let previousMatchDetails;
    let secondToPreviousMatchDetails;

    let oddsComparisonHomeArray = [];
    let oddsComparisonAwayArray = [];

    if (match.data.odds_comparison) {
      oddsComparisonHomeArray = match.data.odds_comparison["FT Result"][1];
      oddsComparisonAwayArray = match.data.odds_comparison["FT Result"][2];

      let sortedHomeOdds = Object.entries(oddsComparisonHomeArray).sort(
        (a, b) => b[1] - a[1]
      );
      let sortedAwayOdds = Object.entries(oddsComparisonAwayArray).sort(
        (a, b) => b[1] - a[1]
      );

      bestHomeOddsProvider = sortedHomeOdds[0][0];
      bestHomeOdds = sortedHomeOdds[0][1];
      bestAwayOddsProvider = sortedAwayOdds[0][0];
      bestAwayOdds = sortedAwayOdds[0][1];
    } else {
      bestHomeOddsProvider = "N/A";
      bestHomeOdds = "N/A";
      bestAwayOddsProvider = "N/A";
      bestAwayOdds = "N/A";
    }

    let x;

    // let lineupHome01 = Competition4340.find(
    //   (o) => o.id === match.data.lineups.team_a[0].player_id
    // );
    // lineupHome01 = lineupHome01 ? lineupHome01 : { name: "-", id: 0 };
    // let lineupHome02 = Competition4340.find(
    //   (o) => o.id === match.data.lineups.team_a[1].player_id
    // );
    // lineupHome02 = lineupHome02 ? lineupHome02 : { name: "-", id: 0 };
    // let lineupHome03 = Competition4340.find(
    //   (o) => o.id === match.data.lineups.team_a[2].player_id
    // );
    // lineupHome03 = lineupHome03 ? lineupHome03 : { name: "-", id: 0 };
    // let lineupHome04 = Competition4340.find(
    //   (o) => o.id === match.data.lineups.team_a[3].player_id
    // );
    // lineupHome04 = lineupHome04 ? lineupHome04 : { name: "-", id: 0 };
    // let lineupHome05 = Competition4340.find(
    //   (o) => o.id === match.data.lineups.team_a[4].player_id
    // );
    // lineupHome05 = lineupHome05 ? lineupHome05 : { name: "-", id: 0 };
    // let lineupHome06 = Competition4340.find(
    //   (o) => o.id === match.data.lineups.team_a[5].player_id
    // );
    // lineupHome06 = lineupHome06 ? lineupHome06 : { name: "-", id: 0 };
    // let lineupHome07 = Competition4340.find(
    //   (o) => o.id === match.data.lineups.team_a[6].player_id
    // );
    // lineupHome07 = lineupHome07 ? lineupHome07 : { name: "-", id: 0 };
    // let lineupHome08 = Competition4340.find(
    //   (o) => o.id === match.data.lineups.team_a[7].player_id
    // );
    // lineupHome08 = lineupHome08 ? lineupHome08 : { name: "-", id: 0 };

    // let lineupHome09 = Competition4340.find(
    //   (o) => o.id === match.data.lineups.team_a[8].player_id
    // );
    // lineupHome09 = lineupHome09 ? lineupHome09 : { name: "-", id: 0 };

    // let lineupHome10 = Competition4340.find(
    //   (o) => o.id === match.data.lineups.team_a[9].player_id
    // );
    // lineupHome10 = lineupHome10 ? lineupHome10 : { name: "-", id: 0 };

    // let lineupHome11 = Competition4340.find(
    //   (o) => o.id === match.data.lineups.team_a[10].player_id
    // );
    // lineupHome11 = lineupHome11 ? lineupHome11 : { name: "-", id: 0 };

    // let lineupHome12 = Competition4340.find(
    //   (x) => x.id === match.data.bench.team_a[0].player_in_id
    // );
    // lineupHome12 = lineupHome12 ? lineupHome12 : { name: "-", id: 0 };
    // let lineupHome13 = Competition4340.find(
    //   (x) => x.id === match.data.bench.team_a[1].player_in_id
    // );
    // lineupHome13 = lineupHome13 ? lineupHome13 : { name: "-", id: 0 };
    // // );
    // let lineupHome14 = Competition4340.find(
    //   (x) => x.id === match.data.bench.team_a[2].player_in_id
    // );
    // lineupHome14 = lineupHome14 ? lineupHome14 : { name: "-", id: 0 };
    // let lineupHome15 = Competition4340.find(
    //   (x) => x.id === match.data.bench.team_a[3].player_in_id
    // );
    // lineupHome15 = lineupHome15 ? lineupHome15 : { name: "-", id: 0 };
    // let lineupHome16 = Competition4340.find(
    //   (x) => x.id === match.data.bench.team_a[4].player_in_id
    // );
    // lineupHome16 = lineupHome16 ? lineupHome16 : { name: "-", id: 0 };

    // let lineupAway01 = Competition4340.find(
    //   (o) => o.id === match.data.lineups.team_b[0].player_id
    // );
    // lineupAway01 = lineupAway01 ? lineupAway01 : { name: "-", id: 0 };

    // let lineupAway02 = Competition4340.find(
    //   (o) => o.id === match.data.lineups.team_b[1].player_id
    // );
    // lineupAway02 = lineupAway02 ? lineupAway02 : { name: "-", id: 0 };

    // let lineupAway03 = Competition4340.find(
    //   (o) => o.id === match.data.lineups.team_b[2].player_id
    // );
    // lineupAway03 = lineupAway03 ? lineupAway03 : { name: "-", id: 0 };

    // let lineupAway04 = Competition4340.find(
    //   (o) => o.id === match.data.lineups.team_b[3].player_id
    // );
    // lineupAway04 = lineupAway04 ? lineupAway04 : { name: "-", id: 0 };

    // let lineupAway05 = Competition4340.find(
    //   (o) => o.id === match.data.lineups.team_b[4].player_id
    // );
    // lineupAway05 = lineupAway05 ? lineupAway05 : { name: "-", id: 0 };

    // let lineupAway06 = Competition4340.find(
    //   (o) => o.id === match.data.lineups.team_b[5].player_id
    // );
    // lineupAway06 = lineupAway06 ? lineupAway06 : { name: "-", id: 0 };

    // let lineupAway07 = Competition4340.find(
    //   (o) => o.id === match.data.lineups.team_b[6].player_id
    // );
    // lineupAway07 = lineupAway07 ? lineupAway07 : { name: "-", id: 0 };

    // let lineupAway08 = Competition4340.find(
    //   (o) => o.id === match.data.lineups.team_b[7].player_id
    // );
    // lineupAway08 = lineupAway08 ? lineupAway08 : { name: "-", id: 0 };

    // let lineupAway09 = Competition4340.find(
    //   (o) => o.id === match.data.lineups.team_b[8].player_id
    // );
    // lineupAway09 = lineupAway09 ? lineupAway09 : { name: "-", id: 0 };

    // let lineupAway10 = Competition4340.find(
    //   (o) => o.id === match.data.lineups.team_b[9].player_id
    // );
    // lineupAway10 = lineupAway10 ? lineupAway10 : { name: "-", id: 0 };

    // let lineupAway11 = Competition4340.find(
    //   (o) => o.id === match.data.lineups.team_b[10].player_id
    // );
    // lineupAway11 = lineupAway11 ? lineupAway11 : { name: "-", id: 0 };

    // let lineupAway12 = Competition4340.find(
    //   (x) => x.id === match.data.bench.team_b[0].player_in_id
    // );
    // lineupAway12 = lineupAway12 ? lineupAway12 : { name: "-", id: 0 };
    // let lineupAway13 = Competition4340.find(
    //   (x) => x.id === match.data.bench.team_b[1].player_in_id
    // );
    // lineupAway13 = lineupAway13 ? lineupAway13 : { name: "-", id: 0 };
    // // );
    // let lineupAway14 = Competition4340.find(
    //   (x) => x.id === match.data.bench.team_b[2].player_in_id
    // );
    // lineupAway14 = lineupAway14 ? lineupAway14 : { name: "-", id: 0 };
    // let lineupAway15 = Competition4340.find(
    //   (x) => x.id === match.data.bench.team_b[3].player_in_id
    // );
    // lineupAway15 = lineupAway15 ? lineupAway15 : { name: "-", id: 0 };
    // let lineupAway16 = Competition4340.find(
    //   (x) => x.id === match.data.bench.team_b[4].player_in_id
    // );
    // lineupAway16 = lineupAway16 ? lineupAway16 : { name: "-", id: 0 };

    // const styleObj = {
    //   color: "grey",
    // };

    if (match.data.h2h.previous_matches_results.totalMatches > 0) {
      matchArr.sort((a, b) => b.date_unix - a.date_unix);
      let lastMatch = matchArr[0].id;
      let secondMatchExists = true;
      let secondToLastMatch =
        matchArr[1] !== undefined ? secondMatchExists : false;

      let previousMatch = await fetch(
        `${process.env.REACT_APP_EXPRESS_SERVER}match/${lastMatch}`
      );
      let dateObject;
      let date;
      let date2;
      await previousMatch.json().then(async (game) => {
        previousMatchDetails = game.data;
        const unixTimestamp = previousMatchDetails.date_unix;
        const milliseconds = unixTimestamp * 1000;
        dateObject = new Date(milliseconds);
        date = `${dateObject.getDate()}/${
          dateObject.getMonth() + 1
        }/${dateObject.getFullYear()}`;

        let secondToPreviousMatch;
        let dateObject2;

        if (secondMatchExists !== false) {
          secondToPreviousMatch = await fetch(
            `${process.env.REACT_APP_EXPRESS_SERVER}match/${secondToLastMatch}`
          );
          await secondToPreviousMatch.json().then((game) => {
            secondToPreviousMatchDetails = game.data;
            const unixTimestamp = secondToPreviousMatchDetails.date_unix;
            const milliseconds = unixTimestamp * 1000;
            dateObject2 = new Date(milliseconds);
            date2 = `${dateObject2.getDate()}/${
              dateObject2.getMonth() + 1
            }/${dateObject2.getFullYear()}`;
          });
        }
      });

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
            bestHomeOdds={`${bestHomeOddsProvider} - ${bestHomeOdds}`}
            bestAwayOdds={`${bestAwayOddsProvider} - ${bestAwayOdds}`}
            lastGameStadiumName={
              previousMatchDetails.stadium_name
                ? previousMatchDetails.stadium_name
                : "-"
            }
            lastGameHomeGoals={
              previousMatchDetails.homeGoalCount
                ? previousMatchDetails.homeGoalCount
                : "-"
            }
            lastGameAwayGoals={
              previousMatchDetails.awayGoalCount
                ? previousMatchDetails.awayGoalCount
                : "-"
            }
            lastGameHomeTeam={
              previousMatchDetails.home_name
                ? previousMatchDetails.home_name
                : "-"
            }
            lastGameAwayTeam={
              previousMatchDetails.away_name
                ? previousMatchDetails.away_name
                : "-"
            }
            lastGameDate={!isNaN(date) ? date : "-"}
            secondToLastGameStadiumName={
              secondToPreviousMatchDetails.stadium_name
                ? secondToPreviousMatchDetails.stadium_name
                : "-"
            }
            secondToLastGameHomeGoals={
              secondToPreviousMatchDetails.homeGoalCount
                ? secondToPreviousMatchDetails.homeGoalCount
                : "-"
            }
            secondToLastGameAwayGoals={
              secondToPreviousMatchDetails.awayGoalCount
                ? secondToPreviousMatchDetails.awayGoalCount
                : "-"
            }
            secondToLastGameHomeTeam={
              secondToPreviousMatchDetails.home_name
                ? secondToPreviousMatchDetails.home_name
                : "-"
            }
            secondToLastGameAwayTeam={
              secondToPreviousMatchDetails.away_name
                ? secondToPreviousMatchDetails.away_name
                : "-"
            }
            secondToLastGameDate={!isNaN(date2) ? date2 : "-"}
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
          {/* <div className="LineupsContainer">
            <ul className="HomeLineup">
              <li>
                {`${match.data.lineups.team_a[0].shirt_number} - ${lineupHome01.name}`}
              </li>
              <li>
                {`${match.data.lineups.team_a[1].shirt_number} - ${lineupHome02.name}`}
              </li>
              <li>
                {`${match.data.lineups.team_a[2].shirt_number} - ${lineupHome03.name}`}
              </li>
              <li>
                {`${match.data.lineups.team_a[3].shirt_number} - ${lineupHome04.name}`}
              </li>
              <li>
                {`${match.data.lineups.team_a[4].shirt_number} - ${lineupHome05.name}`}
              </li>
              <li>
                {`${match.data.lineups.team_a[5].shirt_number} - ${lineupHome06.name}`}
              </li>
              <li>
                {`${match.data.lineups.team_a[6].shirt_number} - ${lineupHome07.name}`}
              </li>
              <li>
                {`${match.data.lineups.team_a[7].shirt_number} - ${lineupHome08.name}`}
              </li>
              <li>
                {`${match.data.lineups.team_a[8].shirt_number} - ${lineupHome09.name}`}
              </li>
              <li>
                {`${match.data.lineups.team_a[9].shirt_number} - ${lineupHome10.name}`}
              </li>
              <li>
                {`${match.data.lineups.team_a[10].shirt_number} - ${lineupHome11.name}`}
              </li>
              <li style={styleObj}>{`${lineupHome12.name}`}</li>
              <li style={styleObj}>{`${lineupHome13.name}`}</li>
              <li style={styleObj}>{`${lineupHome14.name}`}</li>
              <li style={styleObj}>{`${lineupHome15.name}`}</li>
              <li style={styleObj}>{`${lineupHome16.name}`}</li>
            </ul>

            <ul className="AwayLineup">
              <li>
                {`${match.data.lineups.team_b[0].shirt_number} - ${lineupAway01.name}`}
              </li>
              <li>
                {`${match.data.lineups.team_b[1].shirt_number} - ${lineupAway02.name}`}
              </li>
              <li>
                {`${match.data.lineups.team_b[2].shirt_number} - ${lineupAway03.name}`}
              </li>
              <li>
                {`${match.data.lineups.team_b[3].shirt_number} - ${lineupAway04.name}`}
              </li>
              <li>
                {`${match.data.lineups.team_b[4].shirt_number} - ${lineupAway05.name}`}
              </li>
              <li>
                {`${match.data.lineups.team_b[5].shirt_number} - ${lineupAway06.name}`}
              </li>
              <li>
                {`${match.data.lineups.team_b[6].shirt_number} - ${lineupAway07.name}`}
              </li>
              <li>
                {`${match.data.lineups.team_b[7].shirt_number} - ${lineupAway08.name}`}
              </li>
              <li>
                {`${match.data.lineups.team_b[8].shirt_number} - ${lineupAway09.name}`}
              </li>
              <li>
                {`${match.data.lineups.team_b[9].shirt_number} - ${lineupAway10.name}`}
              </li>
              <li>
                {`${match.data.lineups.team_b[10].shirt_number} - ${lineupAway11.name}`}
              </li>
              <li style={styleObj}>{`${lineupAway12.name}`}</li>
              <li style={styleObj}>{`${lineupAway13.name}`}</li>
              <li style={styleObj}>{`${lineupAway14.name}`}</li>
              <li style={styleObj}>{`${lineupAway15.name}`}</li>
              <li style={styleObj}>{`${lineupAway16.name}`}</li>
            </ul>
          </div> */}
        </Fragment>,
        document.getElementById(`H2HStats${identifier}`)
      );
    } else {
      ReactDOM.render(
        <div>
        No fixture history found
        </div>,
        document.getElementById(`H2HStats${identifier}`)
      );
    }
  });
}
