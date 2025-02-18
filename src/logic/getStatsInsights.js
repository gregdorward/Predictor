export async function getHighestScoringLeagues() {
  let teamsList = await fetch(`${process.env.REACT_APP_EXPRESS_SERVER}over25`);
  let arr = [];
  await teamsList.json().then(async (leagues) => {
    for (let index = 0; index < leagues.data.top_leagues.data.length; index++) {
      const league = {
        league: leagues.data.top_leagues.data[index].name,
        leagueCountry: leagues.data.top_leagues.data[index].country,
        averageGoals: leagues.data.top_leagues.data[index].seasonAVG_overall,
        over25Percentage:
          leagues.data.top_leagues.data[index].seasonOver25Percentage_overall,
        division: leagues.data.top_leagues.data[index].division,
        leagueId: leagues.data.top_leagues.data[index].id,
      };
      arr.push(league);
    }
  });
  return arr;
}

export async function getLowestScoringLeagues() {
  let teamsList = await fetch(`${process.env.REACT_APP_EXPRESS_SERVER}under25`);
  let arr = [];
  await teamsList.json().then(async (leagues) => {
    for (let index = 0; index < leagues.data.top_leagues.data.length; index++) {
      const league = {
        league: leagues.data.top_leagues.data[index].name,
        leagueCountry: leagues.data.top_leagues.data[index].country,
        averageGoals: leagues.data.top_leagues.data[index].seasonAVG_overall,
        under25Percentage:
          leagues.data.top_leagues.data[index].seasonUnder25Percentage_overall,
        leagueId: leagues.data.top_leagues.data[index].id,
      };
      arr.push(league);
    }
  });
  return arr;
}

export async function getHighestScoringTeams() {
  let teamsList = await fetch(`${process.env.REACT_APP_EXPRESS_SERVER}over25`);
  let arr = [];
  await teamsList.json().then(async (teams) => {
    for (let index = 0; index < teams.data.top_teams.data.length; index++) {
      const team = {
        team: teams.data.top_teams.data[index].full_name,
        next_match_team: teams.data.top_teams.data[index].next_match_team,
        teamCountry: teams.data.top_teams.data[index].country,
        averageGoals: teams.data.top_teams.data[index].seasonAVG_overall,
        over25Percentage:
          teams.data.top_teams.data[index].seasonOver25Percentage_overall,
        division: teams.data.top_teams.data[index].division,
        leagueId: teams.data.top_teams.data[index].id,
      };
      arr.push(team);
    }
  });
  return arr;
}

async function convertTimestamp(timestamp) {
  let newDate = new Date(timestamp * 1000);
  
  // Extract date components
  let [day, month, year] = newDate.toLocaleDateString("en-GB").split("/");

  // Extract time (24-hour format)
  let time = newDate.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

  // Format: YYYY-DD-MM HH:MM
  return `${year}-${day}-${month} ${time}`;
}


export async function getHighestScoringFixtures() {
  let fixturesList = await fetch(
    `${process.env.REACT_APP_EXPRESS_SERVER}over25`
  );

  let arr = [];
  
  await fixturesList.json().then(async (fixture) => {
    // Extract fixture data
    let fixtures = fixture.data.top_fixtures.data;
    console.log(fixtures)

    // Sort fixtures by `date_unix` (soonest first)
    fixtures.sort((a, b) => a.date_unix - b.date_unix);

    // Process sorted fixtures
    for (let index = 0; index < fixtures.length; index++) {
      const game = {
        date: fixtures[index].date_unix
          ? await convertTimestamp(fixtures[index].date_unix)
          : "N/A",
        country: fixtures[index].country,
        odds: fixtures[index].odds_ft_over25,
        avgGoals: fixtures[index].avg_potential,
        match: fixtures[index].name,
        progress: fixtures[index].progress
      };
      arr.push(game);
    }
  });

  return arr;
}

