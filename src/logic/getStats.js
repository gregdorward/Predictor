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

    gameStats.home[index].last6Points = getPointsFromLastX(
      gameStats.home[index].LastSixForm
    );

    gameStats.home[index].last10Points = getPointsFromLastX(
      gameStats.home[index].LastTenForm
    );

    gameStats.away[index].last5Points = getPointsFromLastX(
      gameStats.away[index].LastFiveForm
    );

    gameStats.away[index].last6Points = getPointsFromLastX(
      gameStats.away[index].LastSixForm
    );

    gameStats.away[index].last10Points = getPointsFromLastX(
      gameStats.away[index].LastTenForm
    );

    async function getPointAverage(pointTotal, games){
      return pointTotal / games
    }

    let homeFiveGameAverage = await getPointAverage(gameStats.home[index].last5Points, 5)
    let homeSixGameAverage = await getPointAverage(gameStats.home[index].last6Points, 6)
    let homeTenGameAverage = await getPointAverage(gameStats.home[index].last10Points, 10)

    let awayFiveGameAverage = await getPointAverage(gameStats.away[index].last5Points, 5)
    let awaySixGameAverage = await getPointAverage(gameStats.away[index].last6Points, 6)
    let awayTenGameAverage = await getPointAverage(gameStats.away[index].last10Points, 10)

    console.log(homeFiveGameAverage)
    console.log(homeTenGameAverage)
    console.log(awayFiveGameAverage)
    console.log(awayTenGameAverage)

    async function getLastGameResult(lastGame){
      let text;
      switch (true) {
        case lastGame === "L":
          text = "Lost"
          break;
        case lastGame === "D":
          text = "Drew"
          break;
        case lastGame === "W":
          text = "Won"
          break;
        default:
          break;
      }
      return text;
    }

    async function compareFormTrend(five, six, ten){
      let text;
      if(five >= 2.5){
        switch (true) {
          case five > six && six > ten:
            text = "Outstanding recent form with solid improvement over last 10 games"
            break;
            case five > six && six < ten:
              text = "Outstanding recent form which has improved with some inconsistency over last 10 games"
              break;
            case five === six && six > ten:
              text = "Outstanding recent form with most improvement in the last 6"
              break;
              case five === six && six < ten:
                text = "Outstanding recent form with a slight dip in the last 6"
                break;
                case five === six && six === ten:
                  text = "Consistently outstanding form over the last 10"
                  break;
                  case five < six && six === ten:
                    text = "Outstanding recent form but slightly worsening in the last 5"
                    break;
                    case five < six && six > ten:
                      text = "Outstanding recent form but slightly fluctuating over the last 10"
                      break;
                      case five < six && six < ten:
                        text = "Outstanding recent form but beginning to worsen recently"
                        break;
          default:
            break;
        }
      } else if (five < 2.5 && five >= 2){
        switch (true) {
          case five > six && six > ten:
            text = "Very good recent form with solid improvement over last 10 games"
            break;
            case five > six && six < ten:
              text = "Very good recent form which has improved with some inconsistency over last 10 games"
              break;
            case five === six && six > ten:
              text = "Very good recent form with most improvement in the last 6"
              break;
              case five === six && six < ten:
                text = "Very good recent form with a slight dip in the last 6"
                break;
                case five === six && six === ten:
                  text = "Very good outstanding form over the last 10"
                  break;
                  case five < six && six === ten:
                    text = "Very good recent form but slightly worsening in the last 5"
                    break;
                    case five < six && six > ten:
                      text = "Very good recent form but slightly fluctuating over the last 10"
                      break;
                      case five < six && six < ten:
                        text = "Very good recent form but beginning to worsen recently"
                        break;
          default:
            break;
        }
      } else if (five < 2 && five >= 1.5){
        switch (true) {
          case five > six && six > ten:
            text = "Good recent form with solid improvement over last 10 games"
            break;
            case five > six && six < ten:
              text = "Good recent form which has improved with some inconsistency over last 10 games"
              break;
            case five === six && six > ten:
              text = "Good recent form with most improvement in the last 6"
              break;
              case five === six && six < ten:
                text = "Good recent form with a slight dip in the last 6"
                break;
                case five === six && six === ten:
                  text = "Good outstanding form over the last 10"
                  break;
                  case five < six && six === ten:
                    text = "Good recent form but slightly worsening in the last 5"
                    break;
                    case five < six && six > ten:
                      text = "Good recent form but slightly fluctuating over the last 10"
                      break;
                      case five < six && six < ten:
                        text = "Good recent form but worsening consistently"
                        break;
          default:
            break;
        }
      } else if (five < 1.5 && five >= 1){
        switch (true) {
          case five > six && six > ten:
            text = "Average recent form with solid improvement over last 10 games"
            break;
            case five > six && six < ten:
              text = "Average recent form which has improved with some inconsistency over last 10 games"
              break;
            case five === six && six > ten:
              text = "Average recent form with most improvement in the last 6"
              break;
              case five === six && six < ten:
                text = "Average recent form with a slight dip in the last 6"
                break;
                case five === six && six === ten:
                  text = "Consistently average form over the last 10"
                  break;
                  case five < six && six === ten:
                    text = "Average recent form but slightly worsening in the last 5"
                    break;
                    case five < six && six > ten:
                      text = "Average recent form, slightly fluctuating over the last 10"
                      break;
                      case five < six && six < ten:
                        text = "Average recent form, declining consistently"
                        break;
          default:
            break;
        }
      } else if (five < 1 && five >= 0.5){
        switch (true) {
          case five > six && six > ten:
            text = "Poor recent form with gradual improvement over last 10 games"
            break;
            case five > six && six < ten:
              text = "Poor recent form but improving with some inconsistency over last 10 games"
              break;
            case five === six && six > ten:
              text = "Poor recent form with some improvement shown in the last 6"
              break;
              case five === six && six < ten:
                text = "Poor recent form with a dip in the last 6"
                break;
                case five === six && six === ten:
                  text = "Consistently poor form over the last 10"
                  break;
                  case five < six && six === ten:
                    text = "Poor recent form, slightly worsening in the last 5"
                    break;
                    case five < six && six > ten:
                      text = "Poor recent form, slightly fluctuating over the last 10"
                      break;
                      case five < six && six < ten:
                        text = "Poor recent form, declining consistently"
                        break;
          default:
            text = "Poor recent form"
            break;
        }
      } else if (five < 0.5){
        switch (true) {
          case five > six && six > ten:
            text = "Terrible recent form with gradual improvement over last 10 games"
            break;
            case five > six && six < ten:
              text = "Terrible recent form with a slight improvement in the last 5"
              break;
            case five === six && six > ten:
              text = "Terrible recent form but improving slightly in the last 6"
              break;
              case five === six && six < ten:
                text = "Terrible recent form with a dip in the last 6"
                break;
                case five === six && six === ten:
                  text = "Consistently terrible form over the last 10"
                  break;
                  case five < six && six === ten:
                    text = "Terrible recent form, worsening further in the last 5"
                    break;
                    case five < six && six > ten:
                      text = "Terrible recent form, slightly fluctuating over the last 10"
                      break;
                      case five < six && six < ten:
                        text = "Terrible recent form, declining consistently"
                        break;
          default:
            break;
        }
      } 

      return text
    }



    let homeFormTrend = await compareFormTrend(homeFiveGameAverage, homeSixGameAverage, homeTenGameAverage)
    let awayFormTrend = await compareFormTrend(awayFiveGameAverage, awaySixGameAverage, awayTenGameAverage)
    let homeLastGame = await getLastGameResult(gameStats.home[index].LastFiveForm[4])
    let awayLastGame = await getLastGameResult(gameStats.away[index].LastFiveForm[4])


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
      formTrend: homeFormTrend,
      lastGame: homeLastGame
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
      formTrend: awayFormTrend,
      lastGame: awayLastGame
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
        lastGame={homeLastGame}
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
        lastGame={awayLastGame}
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
