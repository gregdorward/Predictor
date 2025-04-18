import ReactDOM from "react-dom";
import HeadToHead from "../components/HeadToHead";
import { Fragment } from "react";
import CustomizedTables from "../components/Table";
import { userDetail } from "./authProvider";


export async function getTeamStats(
  id,
  home,
  away,
  homeBTTS,
  homeOnlyBTTS,
  awayBTTS,
  awayOnlyBTTS
) {
  let identifier = id;
  let bestHomeOdds;
  let bestHomeOddsProvider;
  let bestAwayOdds;
  let bestAwayOddsProvider;

  let match = await fetch(
    `${process.env.REACT_APP_EXPRESS_SERVER}match/${identifier}`
  );
  await match.json().then(async (match) => {
    const matchArr = match.data.h2h.previous_matches_ids;
    const reducedMatchArr = matchArr.slice(0, 10);

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

    async function getBTTSPercentage(
      homeToal,
      home,
      awayTotal,
      away,
      fixtureHistory
    ) {
      let total = homeToal + home + awayTotal + away + fixtureHistory;
      return total / 5;
    }

    async function getFairOdds(impliedProbability) {
      let impliedProbabilityDivided = impliedProbability / 100;
      return (1 / impliedProbabilityDivided).toFixed(2);
    }

    if (match.data.h2h.previous_matches_results.totalMatches > 0) {
      let homeTeam = match.data.home_name;
      let awayTeam = match.data.away_name;

      let teamMappings = {
        [homeTeam]: match.data.homeID,
        [awayTeam]: match.data.awayID,
      };

      reducedMatchArr.sort((a, b) => b.date_unix - a.date_unix);

      let date;
      // await previousMatch.json().then(async (game) => {
      //   previousMatchDetails = game.data;
      //   const unixTimestamp = previousMatchDetails.date_unix;
      //   const milliseconds = unixTimestamp * 1000;
      //   dateObject = new Date(milliseconds);
      //   date = `${dateObject.getDate()}/${
      //     dateObject.getMonth() + 1
      //   }/${dateObject.getFullYear()}`;

      //   let secondToPreviousMatch;
      //   let dateObject2;

      //   // if (secondMatchExists !== false) {
      //   //   secondToPreviousMatch = await fetch(
      //   //     `${process.env.REACT_APP_EXPRESS_SERVER}match/${secondToLastMatch}`
      //   //   );
      //   //   await secondToPreviousMatch.json().then((game) => {
      //   //     secondToPreviousMatchDetails = game.data;
      //   //     const unixTimestamp = secondToPreviousMatchDetails.date_unix;
      //   //     const milliseconds = unixTimestamp * 1000;
      //   //     dateObject2 = new Date(milliseconds);
      //   //     date2 = `${dateObject2.getDate()}/${
      //   //       dateObject2.getMonth() + 1
      //   //     }/${dateObject2.getFullYear()}`;
      //   //   });
      //   // }
      // });

      const BTTSForecast = await getBTTSPercentage(
        homeBTTS,
        homeOnlyBTTS,
        awayBTTS,
        awayOnlyBTTS,
        match.data.h2h.betting_stats.bttsPercentage
      );
      const fairOddsBTTSYes = await getFairOdds(BTTSForecast);
      const fairOddsBTTSNo = await getFairOdds(100 - BTTSForecast);
      console.log(match.data);
      function stripLinks(htmlString) {
        return htmlString.replace(/<a\b[^>]*>(.*?)<\/a>/gi, "$1");
      }

      function MatchPreview({ content }) {
        return (
          <div
            className="AIOverview"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        );
      }

      let paid
      if (userDetail){
        paid = userDetail.isPaid
      } else {
        paid = false;
      }


      ReactDOM.render(
        <Fragment>
          <h2>AI Preview</h2>
          {paid ? (
            <MatchPreview content={match.data.gpt_en} />
          ) : (
            // Move ':' to be inside the same parenthesis as '?'
            <div>AI Previews are a paid feature</div>
          )}
          <HeadToHead
            className={"PreviousMatchStats"}
            homeTeam={home}
            awayTeam={away}
            reducedArr={reducedMatchArr}
            teamObject={teamMappings}
            stadium={match.data.stadium_name}
            matches={match.data.h2h.previous_matches_results.totalMatches}
            homeWins={match.data.h2h.previous_matches_results.team_a_wins}
            awayWins={match.data.h2h.previous_matches_results.team_b_wins}
            draws={match.data.h2h.previous_matches_results.draw}
            averageGoals={match.data.h2h.betting_stats.avg_goals}
            bestHomeOdds={`${bestHomeOddsProvider} - ${bestHomeOdds}`}
            bestAwayOdds={`${bestAwayOddsProvider} - ${bestAwayOdds}`}
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
            BTTSForecast={`${BTTSForecast}%`}
            BTTSOdds={`${match.data.odds_btts_yes}\n Fair odds: ${fairOddsBTTSYes}`}
            BTTSOddsNo={`${match.data.odds_btts_no}\n Fair odds: ${fairOddsBTTSNo}`}
            CornersStat={"–"}
            CornersForecast={match.data.corners_potential}
            CornersOdds={match.data.odds_corners_over_105}
          />
        </Fragment>,
        document.getElementById(`H2HStats${identifier}`)
      );
    } else {
      ReactDOM.render(
        <div>No fixture history found</div>,
        document.getElementById(`H2HStats${identifier}`)
      );
    }
  });
}
