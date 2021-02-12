import ReactDOM from "react-dom";
import Stats from "../components/createStatsDiv";
import Div from "../components/Div";
import { selectedOption } from "../components/radio";

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

  let homeTeam = game.homeTeam;
  let awayTeam = game.awayTeam;
  let time = game.time;

  const formDataMatch = [];

  formDataMatch.push({
    btts: game.btts_potential,
  });


  const formDataHome = [];

  formDataHome.push({
    name: game.homeTeam,
    AverageGoals: (
      game.form.allHomeForm[index].stats.seasonScoredNum_overall / divider
    ).toFixed(2),
    AverageConceeded: (
      game.form.allHomeForm[index].stats.seasonConcededNum_overall / divider
    ).toFixed(2),
    AverageXG: game.form.allHomeForm[index].stats.xg_for_avg_overall,
    AveragePossession: game.form.allHomeForm[index].stats.possessionAVG_overall,
    AverageSOT: game.form.allHomeForm[index].stats.shotsOnTargetAVG_overall,
    AverageDangerousAttacks: game.form.allHomeForm[index].stats.dangerous_attacks_avg_overall,
    homeOrAway: "Home",
  });

  const formDataAway = [];

  formDataAway.push({
    name: game.awayTeam,
    AverageGoals: (
      game.form.allAwayForm[index].stats.seasonScoredNum_overall / divider
    ).toFixed(2),
    AverageConceeded: (
      game.form.allAwayForm[index].stats.seasonConcededNum_overall / divider
    ).toFixed(2),
    AverageXG: game.form.allAwayForm[index].stats.xg_for_avg_overall,
    AveragePossession: game.form.allAwayForm[index].stats.possessionAVG_overall,
    AverageSOT: game.form.allAwayForm[index].stats.shotsOnTargetAVG_overall,
    AverageDangerousAttacks: game.form.allAwayForm[index].stats.dangerous_attacks_avg_overall,
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
      sot={formDataHome[0].AverageSOT}
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
      sot={formDataAway[0].AverageSOT}
      dangerousAttacks={formDataAway[0].AverageDangerousAttacks}
    />,
    document.getElementById("away" + awayTeam)
  );
}
