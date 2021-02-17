import ReactDOM from "react-dom";
import Stats from "../components/createStatsDiv";
import Div from "../components/Div";
import { selectedOption } from "../components/radio";
import { allForm } from "../logic/getFixtures";

export async function createStatsDiv(game) {
  let radioSelected = parseInt(selectedOption);

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

  console.log(allForm)
  let gameStats = allForm.find((match) => match.id === game.id)


  let homeTeam = gameStats.home.teamName;
  let awayTeam = gameStats.away.teamName;

  // let homeTeam = game.homeTeam;
  // let awayTeam = game.awayTeam;
  let time = game.time;

  const formDataMatch = [];

  formDataMatch.push({
    btts: game.btts_potential,
  });

  const formDataHome = [];

  formDataHome.push({
    name: game.homeTeam,
    AverageGoals: (gameStats.home[index].ScoredOverall / divider).toFixed(2),
    AverageConceeded: (gameStats.home[index].ConcededOverall / divider).toFixed(
      2
    ),
    AverageXG: gameStats.home[index].XG,
    AveragePossession: gameStats.home[index].AveragePossession,
    AverageShotsOnTarget: gameStats.home[index].AverageShotsOnTarget,
    AverageDangerousAttacks: gameStats.home[index].AverageDangerousAttacks,
    homeOrAway: "Home",
  });

  const formDataAway = [];

  formDataAway.push({
    name: game.awayTeam,
    AverageGoals: (gameStats.away[index].ScoredOverall / divider).toFixed(2),
    AverageConceeded: (gameStats.away[index].ConcededOverall / divider).toFixed(
      2
    ),
    AverageXG: gameStats.away[index].XG,
    AveragePossession: gameStats.away[index].AveragePossession,
    AverageShotsOnTarget: gameStats.away[index].AverageShotsOnTarget,
    AverageDangerousAttacks: gameStats.away[index].AverageDangerousAttacks,
    homeOrAway: "Away",
  });

  ReactDOM.render(
    <Div className="MatchTime" text={"Kick off: " + time}></Div>,
    document.getElementById("stats" + homeTeam)
  );

  ReactDOM.render(
    <Div
      className="BTTSPotential"
      text={"BTTS Potential: " + game.btts_potential + "%"}
    ></Div>,
    document.getElementById("BTTSPotential" + game.id)
  );

  ReactDOM.render(
    <Stats
      key={formDataHome[0].name}
      className={formDataHome[0].homeOrAway}
      name={formDataHome[0].name}
      goals={formDataHome[0].AverageGoals}
      conceeded={formDataHome[0].AverageConceeded}
      XG={formDataHome[0].AverageXG}
      possession={formDataHome[0].AveragePossession}
      sot={formDataHome[0].AverageShotsOnTarget}
      dangerousAttacks={formDataHome[0].AverageDangerousAttacks}
    />,
    document.getElementById("home" + homeTeam)
  );

  ReactDOM.render(
    <Stats
      key={formDataAway[0].name}
      className={formDataAway[0].homeOrAway}
      name={formDataAway[0].name}
      goals={formDataAway[0].AverageGoals}
      conceeded={formDataAway[0].AverageConceeded}
      XG={formDataAway[0].AverageXG}
      possession={formDataAway[0].AveragePossession}
      sot={formDataAway[0].AverageShotsOnTarget}
      dangerousAttacks={formDataAway[0].AverageDangerousAttacks}
    />,
    document.getElementById("away" + awayTeam)
  );
}
