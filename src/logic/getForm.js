import { proxyurl } from "../App";

const allTeamForm = [];

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

export async function getForm(match) {
  const teams = [match.homeId, match.awayId];
  const fixtureForm = [];

  for (let i = 0; i < teams.length; i++) {
    const team = teams[i];

    let response = await fetch(
      `${process.env.REACT_APP_EXPRESS_SERVER}form/${team}`
    );
    await response.json().then((formData) => {
      fixtureForm[i] = formData;
    });
  }
  return fixtureForm;
}
