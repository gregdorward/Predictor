import ReactDOM from "react-dom";
import { Button } from "../components/Button";
import Stats from "../components/createStatsDiv";
import Div from "../components/Div";
import { selectedOption } from "../components/radio";
import { allForm, leagueArray } from "../logic/getFixtures";
import { getTeamStats } from "../logic/getTeamStats";
import { getPointsFromLastX } from "../logic/getScorePredictions"

let testBool;

export async function createStatsDiv(game, mock) {
  let bool = mock;

  if (bool !== true) {
    let radioSelected = parseInt(selectedOption);

    function toggle() {
      testBool = testBool ? false : true;
      console.log("Toggled bool is", testBool);
      if (testBool === true) {
        // set stats element to display flex
        return { display: "block" };
      } else {
        // set stats element to display none
        return { display: "none" };
      }
    }

    let style = toggle();

    let index;
    let divider;
    if (radioSelected === 5) {
      index = 0;
      divider = 5;
    } else if (radioSelected === 6) {
      index = 1;
      divider = 6;
    } else if (radioSelected === 10) {
      index = 2;
      divider = 10;
    }

    let gameStats = allForm.find((match) => match.id === game.id);

    console.log(gameStats);

    let homeTeam = gameStats.home.teamName;
    let awayTeam = gameStats.away.teamName;

    console.log(gameStats);

    let time = game.time;

    gameStats.home[index].last5Points = getPointsFromLastX(
      gameStats.home[index].LastFiveForm
    );

    gameStats.home[index].last10Points = getPointsFromLastX(
      gameStats.home[index].LastTenForm
    );

    gameStats.away[index].last5Points = getPointsFromLastX(
      gameStats.away[index].LastFiveForm
    );

    gameStats.away[index].last10Points = getPointsFromLastX(
      gameStats.away[index].LastTenForm
    );

    async function getPointAverage(pointTotal, games){
      return pointTotal / games
    }

    let homeFiveGameAverage = await getPointAverage(gameStats.home[index].last5Points, 5)
    let homeTenGameAverage = await getPointAverage(gameStats.home[index].last10Points, 10)

    let awayFiveGameAverage = await getPointAverage(gameStats.away[index].last5Points, 5)
    let awayTenGameAverage = await getPointAverage(gameStats.away[index].last10Points, 10)

    console.log(homeFiveGameAverage)
    console.log(homeTenGameAverage)
    console.log(awayFiveGameAverage)
    console.log(awayTenGameAverage)


    async function compareFormTrend(five, ten){
      let text;

      if(five >= 2.5){
        switch (true) {
          case five > ten:
            text = "Outstanding and improving"
            break;
            case five === ten:
              text = "Outstanding and consistent"
              break;
              case five < ten:
                text = "Consistently outstanding"
                break;
          default:
            break;
        }
      } else if (five < 2.5 && five >= 2){
        switch (true) {
          case five > ten:
            text = "Very good and improving"
            break;
            case five === ten:
              text = "Very good and consistent"
              break;
              case five < ten:
                text = "Very good but slightly worsening"
                break;
          default:
            break;
        }
      } else if (five < 2 && five >= 1.5){
        switch (true) {
          case five > ten:
            text = "Good and improving"
            break;
            case five === ten:
              text = "Good and consistent"
              break;
              case five < ten:
                text = "Good but slightly worsening"
                break;
          default:
            break;
        }
      } else if (five < 1.5 && five >= 1){
        switch (true) {
          case five > ten:
            text = "Average and improving"
            break;
            case five === ten:
              text = "Average and consistent"
              break;
              case five < ten:
                text = "Average but slightly worsening"
                break;
          default:
            break;
        }
      } else if (five < 1 && five >= 0.5){
        switch (true) {
          case five > ten:
            text = "Poor but improving"
            break;
            case five === ten:
              text = "Poor and consistent"
              break;
              case five < ten:
                text = "Poor and slightly worsening"
                break;
          default:
            break;
        }
      } else if (five < 0.5){
        switch (true) {
          case five > ten:
            text = "Terrible but slightly improving"
            break;
            case five === ten:
              text = "Consistently terrible"
              break;
              case five < ten:
                text = "Terrible and worsening"
                break;
          default:
            break;
        }
      } 

      return text
    }

    let homeFormTrend = await compareFormTrend(homeFiveGameAverage, homeTenGameAverage)
    let awayFormTrend = await compareFormTrend(awayFiveGameAverage, awayTenGameAverage)

    console.log(homeFormTrend)
    console.log(awayFormTrend)


    const formDataMatch = [];

    formDataMatch.push({
      btts: game.btts_potential,
    });

    const formDataHome = [];

    formDataHome.push({
      name: game.homeTeam,
      Last5: gameStats.home[index].LastFiveForm,
      AverageGoals: (gameStats.home[index].ScoredOverall / divider).toFixed(2),
      AverageConceeded: (
        gameStats.home[index].ConcededOverall / divider
      ).toFixed(2),
      AverageXG: gameStats.home[index].XG,
      AverageXGConceded: gameStats.home[index].XGAgainstAvg,
      AveragePossession: gameStats.home[index].AveragePossession,
      AverageShotsOnTarget: gameStats.home[index].AverageShotsOnTarget,
      AverageDangerousAttacks: gameStats.home[index].AverageDangerousAttacks,
      homeOrAway: "Home",
      leaguePosition: gameStats.home[index].LeaguePosition,
      Last5PPG: gameStats.home[index].PPG,
      SeasonPPG: gameStats.home[index].SeasonPPG,
      formTrend: homeFormTrend
    });

    const formDataAway = [];

    formDataAway.push({
      name: game.awayTeam,
      Last5: gameStats.away[index].LastFiveForm,
      AverageGoals: (gameStats.away[index].ScoredOverall / divider).toFixed(2),
      AverageConceeded: (
        gameStats.away[index].ConcededOverall / divider
      ).toFixed(2),
      AverageXG: gameStats.away[index].XG,
      AverageXGConceded: gameStats.away[index].XGAgainstAvg,
      AveragePossession: gameStats.away[index].AveragePossession,
      AverageShotsOnTarget: gameStats.away[index].AverageShotsOnTarget,
      AverageDangerousAttacks: gameStats.away[index].AverageDangerousAttacks,
      homeOrAway: "Away",
      leaguePosition: gameStats.away[index].LeaguePosition,
      Last5PPG: gameStats.away[index].PPG,
      SeasonPPG: gameStats.away[index].SeasonPPG,
      formTrend: awayFormTrend
    });
    ReactDOM.render(
      <div style={style}>
        <Div className="MatchTime" text={"Kick off: " + time}></Div>
      </div>,
      document.getElementById("stats" + homeTeam)
    );

    ReactDOM.render(
      <div style={style}>
        <Div className="MatchTime" text={"Kick off: " + time}></Div>
        <div className="H2HStats" id={`H2HStats${game.id}`}></div>
        <div className="TrendsHome" id={`TrendsHome${game.id}`}></div>
        <div className="TrendsAway" id={`TrendsAway${game.id}`}></div>
      </div>,
      document.getElementById("history" + homeTeam)
    );

    ReactDOM.render(
      <Stats
        style={style}
        gameCount={divider}
        key={formDataHome[0].name}
        last5={formDataHome[0].Last5}
        className={formDataHome[0].homeOrAway}
        name={formDataHome[0].name}
        goals={formDataHome[0].AverageGoals}
        conceeded={formDataHome[0].AverageConceeded}
        XG={formDataHome[0].AverageXG}
        XGConceded={formDataHome[0].AverageXGConceded}
        possession={formDataHome[0].AveragePossession}
        sot={formDataHome[0].AverageShotsOnTarget}
        dangerousAttacks={formDataHome[0].AverageDangerousAttacks}
        leaguePosition={formDataHome[0].leaguePosition}
        last5PPG={formDataHome[0].Last5PPG}
        ppg={formDataHome[0].SeasonPPG}
        formTrend={homeFormTrend}
      />,
      document.getElementById("home" + homeTeam)
    );

    ReactDOM.render(
      <Stats
        style={style}
        gameCount={divider}
        key={formDataAway[0].name}
        last5={formDataAway[0].Last5}
        className={formDataAway[0].homeOrAway}
        name={formDataAway[0].name}
        goals={formDataAway[0].AverageGoals}
        conceeded={formDataAway[0].AverageConceeded}
        XG={formDataAway[0].AverageXG}
        XGConceded={formDataAway[0].AverageXGConceded}
        possession={formDataAway[0].AveragePossession}
        sot={formDataAway[0].AverageShotsOnTarget}
        dangerousAttacks={formDataAway[0].AverageDangerousAttacks}
        leaguePosition={formDataAway[0].leaguePosition}
        last5PPG={formDataAway[0].Last5PPG}
        ppg={formDataAway[0].SeasonPPG}
        formTrend={awayFormTrend}
      />,
      document.getElementById("away" + awayTeam)
    );


    ReactDOM.render(
      <Button
        className="MoreStats"
        style={style}
        onClickEvent={() => getTeamStats(game.id, game.homeTeam, game.awayTeam)}
        text={"More detail"}
      ></Button>,
      document.getElementById(`H2HStats${game.id}`)
    );
  }
}
