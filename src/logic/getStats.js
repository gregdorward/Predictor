import { proxyurl } from "../App";
import ReactDOM from "react-dom";
import Stats from "../components/createStatsDiv";
import { allForm } from "../logic/getForm";

export async function createStatsDiv(stats, game) {
  let homeTeam = game.homeTeam;
  let awayTeam = game.awayTeam;

  let val = homeTeam;
  let home = allForm.findIndex(function (item, i) {
    return item.name === val;
  });

  let val2 = awayTeam;
  let away = allForm.findIndex(function (item, i) {
    return item.name === val2;
  });

  const formDataHome = [];

  formDataHome.push({
    name: allForm[home].name,
    AverageGoals: allForm[home].averageGoals,
    AverageConceeded: allForm[home].averageGoalsConceded,
    AverageXG: allForm[home].averageXG,
    AveragePossession: allForm[home].possessionAVG,
    homeOrAway: "Home",
  });

  console.log("FORM DATA HOME")
  console.log(formDataHome)

  const formDataAway = [];

  formDataAway.push({
    name: allForm[away].name,
    AverageGoals: allForm[away].averageGoals,
    AverageConceeded: allForm[away].averageGoalsConceded,
    AverageXG: allForm[away].averageXG,
    AveragePossession: allForm[away].possessionAVG,
    homeOrAway: "Away",
  });

  ReactDOM.render(
    <Stats
      key={formDataHome[0].name}
      className={formDataHome[0].homeOrAway}
      name={formDataHome[0].name}
      goals={formDataHome[0].AverageGoals}
      conceeded={formDataHome[0].AverageConceeded}
      XG={formDataHome[0].AverageXG}
      possession={formDataHome[0].AveragePossession}
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
    />,
    document.getElementById("away" + awayTeam)
  );
}

export async function getMatchStats(fixture) {
  let matchDetail = await fetch(
    proxyurl +
      `https://api.footystats.org/match?key=${process.env.REACT_APP_API_KEY}&match_id=` +
      fixture.id
  );

  let stats;
  await matchDetail.json().then((data) => {
    let arr1 = data.data.trends.team_a;
    let arr2 = data.data.trends.team_b;
    stats = arr1.concat(arr2);
  });
  createStatsDiv(stats, fixture);
}
