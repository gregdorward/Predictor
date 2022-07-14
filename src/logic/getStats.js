import ReactDOM from "react-dom";
import { Button } from "../components/Button";
import Stats from "../components/createStatsDiv";
import Div from "../components/Div";
import { allForm } from "../logic/getFixtures";
import { getTeamStats } from "../logic/getTeamStats";
import { getPointsFromLastX } from "../logic/getScorePredictions";
import Norway from "../data/Norway.json";
import { CreateBadge } from "../components/createBadge";
import { Badge } from "@material-ui/core";
import { Fragment } from "react";
import GenerateFormSummary from "../logic/compareFormTrend";

let testBool;

export async function createStatsDiv(game, mock) {
  if (game.status !== "void") {
    let bool = mock;

    if (bool !== true) {
      let radioSelected = 10;

      function toggle() {
        testBool = testBool ? true : true;
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

      let homeLastMatch = await fetch(
        `${process.env.REACT_APP_EXPRESS_SERVER}matches/${gameStats.home[2].LastMatch}`
      );

      let matchArray;
      await homeLastMatch.json().then((matches) => {
        matchArray = Array.from(matches.data);
      });

      let awayLastMatch;
      let matchArrayAway;

      if (gameStats.home[2].LastMatch === gameStats.away[2].LastMatch) {
        console.log("Don't need to fetch");
        matchArrayAway = matchArray;
        console.log(matchArrayAway);
      } else {
        console.log("Fetching");
        awayLastMatch = await fetch(
          `${process.env.REACT_APP_EXPRESS_SERVER}matches/${gameStats.away[2].LastMatch}`
        );

        await awayLastMatch.json().then((matches) => {
          matchArrayAway = Array.from(matches.data);
        });
      }

      const lastGameHome = matchArray.find(
        ({ homeID, awayID }) =>
          homeID === gameStats.teamIDHome || awayID === gameStats.teamIDHome
      )
        ? matchArray.find(
            ({ homeID, awayID }) =>
              homeID === gameStats.teamIDHome || awayID === gameStats.teamIDHome
          )
        : "N/A";

      const lastGameAway = matchArrayAway.find(
        ({ homeID, awayID }) =>
          homeID === gameStats.teamIDAway || awayID === gameStats.teamIDAway
      )
        ? matchArrayAway.find(
            ({ homeID, awayID }) =>
              homeID === gameStats.teamIDAway || awayID === gameStats.teamIDAway
          )
        : "N/A";

      console.log(gameStats.teamIDHome)
      console.log(matchArray);
      console.log(gameStats.teamIDAway)
      console.log(matchArrayAway);


      let lastGameHomeResult;
      let lastGameHomeLink;
      let lastGameAwayResult;
      let lastGameAwayLink;
      let homeStadium;
      let awayStadium;

      let lastGameHomeHomeBadge = lastGameHome.home_image
        ? lastGameHome.home_image
        : "-";
      let lastGameHomeAwayBadge = lastGameHome.away_image
        ? lastGameHome.away_image
        : "-";
      let lastGameAwayHomeBadge = lastGameAway.home_image
        ? lastGameAway.home_image
        : "-";
      let lastGameAwayAwayBadge = lastGameAway.away_image
        ? lastGameAway.away_image
        : "-";

      if (lastGameHome !== "N/A") {
        lastGameHomeResult = `${lastGameHome.home_name} ${lastGameHome.homeGoalCount}  :  ${lastGameHome.awayGoalCount} ${lastGameHome.away_name}`;
        lastGameHomeLink = lastGameHome.match_url;
        homeStadium = lastGameHome.stadium_name;
      } else {
        lastGameHomeResult = "Last game unavailable";
        homeStadium = "-";
      }

      if (lastGameAway !== "N/A") {
        lastGameAwayResult = `${lastGameAway.home_name} ${lastGameAway.homeGoalCount}  :  ${lastGameAway.awayGoalCount} ${lastGameAway.away_name}`;
        lastGameAwayLink = lastGameAway.match_url;
        awayStadium = lastGameAway.stadium_name;
      } else {
        lastGameAwayResult = "Last game unavailable";
        awayStadium = "-";
      }

      let homeTeam = gameStats.home.teamName;
      let awayTeam = gameStats.away.teamName;

      let time = game.time;

      console.log(gameStats.home[index])
      gameStats.home[index].last3Points = getPointsFromLastX(
        gameStats.home[index].lastThreeForm
      );

      gameStats.home[index].last5Points = getPointsFromLastX(
        gameStats.home[index].LastFiveForm
      );

      gameStats.home[index].last6Points = getPointsFromLastX(
        gameStats.home[index].LastSixForm
      );

      gameStats.home[index].last10Points = getPointsFromLastX(
        gameStats.home[index].LastTenForm
      );

      gameStats.away[index].last3Points = getPointsFromLastX(
        gameStats.away[index].lastThreeForm
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

      async function getPointAverage(pointTotal, games) {
        return pointTotal / games;
      }

      let homeThreeGameAverage = await getPointAverage(
        gameStats.home[index].last3Points,
        3
      );

      let homeFiveGameAverage = await getPointAverage(
        gameStats.home[index].last5Points,
        5
      );

      let homeSixGameAverage = await getPointAverage(
        gameStats.home[index].last6Points,
        6
      );

      let homeTenGameAverage = await getPointAverage(
        gameStats.home[index].last10Points,
        10
      );

      let awayThreeGameAverage = await getPointAverage(
        gameStats.away[index].last3Points,
        3
      );

      let awayFiveGameAverage = await getPointAverage(
        gameStats.away[index].last5Points,
        5
      );

      let awaySixGameAverage = await getPointAverage(
        gameStats.away[index].last6Points,
        6
      );

      let awayTenGameAverage = await getPointAverage(
        gameStats.away[index].last10Points,
        10
      );

      async function getLastGameResult(lastGame) {
        let text;
        switch (true) {
          case lastGame === "L":
            text = "Lost";
            break;
          case lastGame === "D":
            text = "Drew";
            break;
          case lastGame === "W":
            text = "Won";
            break;
          default:
            break;
        }
        return text;
      }

      let homeFormTrend = [
        homeThreeGameAverage.toFixed(2),
        homeFiveGameAverage.toFixed(2),
        homeTenGameAverage.toFixed(2),
      ];

      let awayFormTrend = [
        awayThreeGameAverage.toFixed(2),
        awayFiveGameAverage.toFixed(2),
        awayTenGameAverage.toFixed(2),
      ];

      let formTextStringHome = await GenerateFormSummary(
        gameStats.home[2],
        homeFormTrend,
        gameStats.home[0],
      );
      let formTextStringAway = await GenerateFormSummary(
        gameStats.away[2],
        awayFormTrend,
        gameStats.away[0],
      );

      let homeLastGame = await getLastGameResult(
        gameStats.home[index].LastFiveForm[4]
      );
      let awayLastGame = await getLastGameResult(
        gameStats.away[index].LastFiveForm[4]
      );

      const formDataMatch = [];

      formDataMatch.push({
        btts: game.btts_potential,
      });

      const formDataHome = [];

      formDataHome.push({
        name: game.homeTeam,
        Last5: gameStats.home[index].LastFiveForm,
        AverageGoals: gameStats.home[index].ScoredOverall / 10,
        AverageConceeded: gameStats.home[index].ConcededOverall / 10,
        AverageXG: gameStats.home[index].XGOverall,
        AverageXGConceded: gameStats.home[index].XGAgainstAvgOverall,
        AveragePossession: gameStats.home[index].AveragePossessionOverall,
        AverageShotsOnTarget: gameStats.home[index].AverageShotsOnTargetOverall,
        AverageDangerousAttacks:
          gameStats.home[index].AverageDangerousAttacksOverall,
        homeOrAway: "Home",
        leaguePosition: gameStats.home[index].LeaguePosition,
        Last5PPG: gameStats.home[index].PPG,
        SeasonPPG: gameStats.home[index].SeasonPPG,
        lastGame: homeLastGame,
        formRun: gameStats.home[index].formRun,
        goalDifference: gameStats.home[index].goalDifference,
        goalDifferenceHomeOrAway:
          gameStats.home[index].goalDifferenceHomeOrAway,
        BttsPercentage: gameStats.home[index].BttsPercentage,
        BttsPercentageHomeOrAway:
          gameStats.home[index].BttsPercentageHomeOrAway,
        CardsTotal: gameStats.home[index].CardsTotal,
        CornersAverage: gameStats.home[index].CornersAverage,
        ScoredBothHalvesPercentage:
          gameStats.home[index].ScoredBothHalvesPercentage,
        FormTextStringHome: formTextStringHome,
      });

      const formDataAway = [];

      formDataAway.push({
        name: game.awayTeam,
        Last5: gameStats.away[index].LastFiveForm,
        AverageGoals: gameStats.away[index].ScoredOverall / 10,
        AverageConceeded: gameStats.away[index].ConcededOverall / 10,
        AverageXG: gameStats.away[index].XGOverall,
        AverageXGConceded: gameStats.away[index].XGAgainstAvgOverall,
        AveragePossession: gameStats.away[index].AveragePossessionOverall,
        AverageShotsOnTarget: gameStats.away[index].AverageShotsOnTargetOverall,
        AverageDangerousAttacks:
          gameStats.away[index].AverageDangerousAttacksOverall,
        homeOrAway: "Away",
        leaguePosition: gameStats.away[index].LeaguePosition,
        Last5PPG: gameStats.away[index].PPG,
        SeasonPPG: gameStats.away[index].SeasonPPG,
        lastGame: awayLastGame,
        formRun: gameStats.away[index].formRun,
        goalDifference: gameStats.away[index].goalDifference,
        goalDifferenceHomeOrAway:
          gameStats.away[index].goalDifferenceHomeOrAway,
        BttsPercentage: gameStats.away[index].BttsPercentage,
        BttsPercentageHomeOrAway:
          gameStats.away[index].BttsPercentageHomeOrAway,
        CardsTotal: gameStats.away[index].CardsTotal,
        CornersAverage: gameStats.away[index].CornersAverage,
        ScoredBothHalvesPercentage:
          gameStats.away[index].ScoredBothHalvesPercentage,
        FormTextStringAway: formTextStringAway,
      });

      ReactDOM.render(
        <div style={style}>
          <Div className="MatchTime" text={`Kick off: ${time} GMT`}></Div>
          <Div text={`Last game`} className={"LastGameHeader"}></Div>
        </div>,
        document.getElementById("stats" + homeTeam)
      );

      ReactDOM.render(
        <div style={style}>
          <div className="H2HStats" id={`H2HStats${game.id}`}></div>
          <div className="TrendsHome" id={`TrendsHome${game.id}`}></div>
          <div className="TrendsAway" id={`TrendsAway${game.id}`}></div>
        </div>,
        document.getElementById("history" + homeTeam)
      );

      //This tournament does not have league positions
      if (game.leagueName === "Europe UEFA Women's Euro") {
        game.homeTeamHomePosition = "N/A";
        game.awayTeamAwayPosition = "N/A";
      }

      ReactDOM.render(
        <ul>
          <div className="PreviousStadiumHome">{homeStadium}</div>
          <a
            href={`https://footystats.org${lastGameHomeLink}`}
            target="_blank"
            className="PreviousResultHome"
          >
            <CreateBadge
              image={lastGameHomeHomeBadge}
              ClassName="HomeBadgePrevious"
              alt="Home team badge"
              flexShrink={5}
            />
            {lastGameHomeResult}
            <CreateBadge
              image={lastGameHomeAwayBadge}
              ClassName="AwayBadgePrevious"
              alt="Away team badge"
              flexShrink={5}
            />
          </a>
          <Stats
            style={style}
            homeOrAway="Home"
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
            leaguePosition={
              formDataHome[0].leaguePosition
                ? formDataHome[0].leaguePosition
                : 0
            }
            rawPosition={game.homeRawPosition ? game.homeRawPosition : 0}
            homeOrAwayLeaguePosition={
              game.homeTeamHomePosition ? game.homeTeamHomePosition : 0
            }
            winPercentage={
              game.homeTeamWinPercentage ? game.homeTeamWinPercentage : 0
            }
            lossPercentage={
              game.homeTeamLossPercentage ? game.homeTeamLossPercentage : 0
            }
            drawPercentage={
              game.homeTeamDrawPercentage ? game.homeTeamDrawPercentage : 0
            }
            ppg={formDataHome[0].SeasonPPG}
            formTrend={[
              homeTenGameAverage.toFixed(2),
              homeSixGameAverage.toFixed(2),
              homeFiveGameAverage.toFixed(2),
            ]}
            lastGame={homeLastGame}
            formRun={formDataHome[0].formRun}
            goalDifference={formDataHome[0].goalDifference}
            goalDifferenceHomeOrAway={formDataHome[0].goalDifferenceHomeOrAway}
            BttsPercentage={formDataHome[0].BttsPercentage}
            BttsPercentageHomeOrAway={formDataHome[0].BttsPercentageHomeOrAway}
            CardsTotal={formDataHome[0].CardsTotal}
            CornersAverage={formDataHome[0].CornersAverage}
            ScoredBothHalvesPercentage={
              formDataHome[0].ScoredBothHalvesPercentage
            }
            FormTextString={formDataHome[0].FormTextStringHome}
          />
        </ul>,
        document.getElementById("home" + homeTeam)
      );

      ReactDOM.render(
        <ul>
          <div className="PreviousStadiumAway">{awayStadium}</div>
          <a
            href={`https://footystats.org${lastGameAwayLink}`}
            target="_blank"
            className="PreviousResultAway"
          >
            <CreateBadge
              image={lastGameAwayHomeBadge}
              ClassName="HomeBadgePreviousAway"
              alt="Home team badge"
            />
            {lastGameAwayResult}
            <CreateBadge
              image={lastGameAwayAwayBadge}
              ClassName="AwayBadgePreviousAway"
              alt="Away team badge"
            />
          </a>
          <Stats
            style={style}
            homeOrAway="Away"
            gameCount={divider}
            key={formDataAway[0].name}
            last5={formDataAway[0].Last5}
            className={formDataAway[0].homeOrAway}
            name={formDataAway[0].name}
            goals={formDataAway[0].AverageGoals}
            conceeded={formDataAway[0].AverageConceeded}
            XG={formDataAway[0].AverageXG}
            XGConceded={formDataAway[0].AverageXGConceded}
            //todo add goal diff and btts percentages
            possession={formDataAway[0].AveragePossession}
            rawPosition={game.awayRawPosition ? game.awayRawPosition : 0}
            sot={formDataAway[0].AverageShotsOnTarget}
            dangerousAttacks={formDataAway[0].AverageDangerousAttacks}
            leaguePosition={
              formDataAway[0].leaguePosition
                ? formDataAway[0].leaguePosition
                : 0
            }
            homeOrAwayLeaguePosition={
              game.awayTeamAwayPosition ? game.awayTeamAwayPosition : 0
            }
            winPercentage={
              game.awayTeamWinPercentage ? game.awayTeamWinPercentage : 0
            }
            lossPercentage={
              game.awayTeamLossPercentage ? game.awayTeamLossPercentage : 0
            }
            drawPercentage={
              game.awayTeamDrawPercentage ? game.awayTeamDrawPercentage : 0
            }
            ppg={formDataAway[0].SeasonPPG}
            formTrend={[
              awayTenGameAverage.toFixed(2),
              awaySixGameAverage.toFixed(2),
              awayFiveGameAverage.toFixed(2),
            ]}
            lastGame={awayLastGame}
            formRun={formDataAway[0].formRun}
            goalDifference={formDataAway[0].goalDifference}
            goalDifferenceHomeOrAway={formDataAway[0].goalDifferenceHomeOrAway}
            BttsPercentage={formDataAway[0].BttsPercentage}
            BttsPercentageHomeOrAway={formDataAway[0].BttsPercentageHomeOrAway}
            CardsTotal={formDataAway[0].CardsTotal}
            CornersAverage={formDataAway[0].CornersAverage}
            ScoredBothHalvesPercentage={
              formDataAway[0].ScoredBothHalvesPercentage
            }
            FormTextString={formDataAway[0].FormTextStringAway}
          />
        </ul>,
        document.getElementById("away" + awayTeam)
      );

      ReactDOM.render(
        <Button
          className="MoreStats"
          style={style}
          onClickEvent={() =>
            getTeamStats(game.id, game.homeTeam, game.awayTeam)
          }
          text={"Fixture trends"}
        ></Button>,
        document.getElementById(`H2HStats${game.id}`)
      );
    }
  }
}
