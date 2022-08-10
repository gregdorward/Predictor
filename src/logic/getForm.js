export async function getForm(match) {
  const teams = [match.homeId, match.awayId];
  const fixtureForm = [];

  for (let i = 0; i < teams.length; i++) {
    const team = teams[i];

    let response = await fetch(
      `${process.env.REACT_APP_EXPRESS_SERVER}form/${team}`
    );
    await response.json().then((formData) => {
      formData.lastMatchTimestamp = formData.last_updated_match_timestamp
      fixtureForm[i] = formData;
    });
  }
  return fixtureForm;
}
