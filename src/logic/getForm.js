import { proxyurl } from "../App";
var divider;
const allForm = [];

export async function diff(a, b) {
  return parseFloat(a - b).toFixed(2);
}

export async function applyColour(value) {
  let colour;
  switch (true) {
    case value < 0.49:
      colour = "#CD5C5C";
      break;
    case value >= 0.5 && value <= 1:
      colour = "#F08080";
      break;
    case value >= 1.01 && value <= 1.25:
      colour = "#FFA07A";
      break;
    case value >= 1.26 && value <= 1.5:
      colour = "#FFFFE0";
      break;
    case value >= 1.51 && value <= 2:
      colour = "#CFDBC5";
      break;
    case value >= 2.01 && value <= 2.5:
      colour = "#8AA37B";
      break;
    case value >= 2.51 && value <= 3:
      colour = "#3F6826";
      break;
    default:
      colour = "white";
      break;
  }
  return colour;
}

export async function getForm(teamId, homeOrAway, radio) {
  let form = {};
  let radioValue = parseInt(radio);

  let index;
  if (radioValue === 5) {
    index = 0;
    divider = 5;
  } else if (radioValue === 6) {
    index = 1;
    divider = 6;
  } else if (radioValue === 10) {
    index = 2;
    divider = 10;
  }

  console.log("RADIO VALUE + " + radioValue);

  console.log("INDEX VALUE = " + index);

  let response = await fetch(
    proxyurl +
      `https://api.footystats.org/lastx?key=${process.env.REACT_APP_API_KEY}&team_id=` +
      teamId
  );
  await response.json().then((data) => {
    let defenceScore;
    console.log(data);

    form.averageXGConceded = data.data[index].stats.xg_against_avg_overall;
    form.name = data.data[index].name;
    if (homeOrAway === "home") {
      form.averageXG = data.data[index].stats.xg_for_avg_home;
      form.averageGoals = data.data[index].stats.seasonScoredAVG_home;
      form.bttsPercentage = data.data[index].stats.seasonBTTSPercentage_home;

      form.averageGoalsConceded =
        data.data[index].stats.seasonConceded_overall / divider;

      defenceScore = parseInt(data.data[index].stats.seasonCSPercentage_home);
    } else if (homeOrAway === "away") {
      form.averageXG = data.data[index].stats.xg_for_avg_away;
      form.averageGoals = data.data[index].stats.seasonScoredAVG_away;
      form.bttsPercentage = data.data[index].stats.seasonBTTSPercentage_away;

      form.averageGoalsConceded =
        data.data[index].stats.seasonConceded_overall / divider;

      defenceScore = parseInt(data.data[index].stats.seasonCSPercentage_away);
    }

    if (parseFloat(form.averageXG).toFixed(2) != 0.0) {
      form.finishingScore = parseFloat(
        (form.averageGoals / form.averageXG).toFixed(2)
      );
    } else {
      form.finishingScore = 0.0;
    }

    if (parseFloat(form.averageGoalsConceded).toFixed(2) != 0.0) {
      form.goalieRating = parseFloat(
        (form.averageXGConceded / form.averageGoalsConceded).toFixed(2)
      );
    } else {
      form.goalieRating = 2;
    }

    form.forecastedXG = form.averageXG * form.finishingScore;

    switch (true) {
      case defenceScore < 20:
        form.defenceRating = 0;
        break;
      case defenceScore >= 20 && defenceScore < 40:
        form.defenceRating = 0.2;
        break;
      case defenceScore >= 40 && defenceScore < 60:
        form.defenceRating = 0.4;
        break;
      case defenceScore >= 60 && defenceScore < 80:
        form.defenceRating = 0.8;
        break;
      case defenceScore >= 80:
        form.defenceRating = 1;
        break;
      default:
        break;
    }
  });
  form.finalFinishingScore = parseFloat(await diff(form.finishingScore, 1));

  form.finalGoalieRating = parseFloat(await diff(form.goalieRating, 1));

  allForm.push(form);
  console.log(form);
  return form;
}
