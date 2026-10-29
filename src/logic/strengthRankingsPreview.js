/**
 * Layout sample for local review of /strength-rankings/?preview=comp.
 * Figures are illustrative. They are not a computed ranking.
 */

function match(fields) {
  return {
    opponentLeague: "Premier League",
    opponentRating: 1750,
    opponentRank: 10,
    isHome: true,
    homeGoals: 1,
    awayGoals: 0,
    result: "W",
    delta: 1.1,
    ...fields,
  };
}

function club(league, name, rating, matches) {
  return {
    name,
    leagueId: league.id,
    leagueName: league.name,
    leagueSlug: league.slug,
    base: league.base,
    rating,
    played: matches.length,
    form: [...matches].reverse().map((row) => row.result).join(""),
    matches,
  };
}

function homeRun(label, leagueName) {
  return [0, 1, 2, 3, 4, 5].map((index) =>
    match({
      dateUnix: 1761600000 - index * 86400,
      opponent: `${label} ${index + 1}`,
      opponentLeague: leagueName,
      opponentRank: 8 + index,
      delta: 1.1,
    })
  );
}

function ranked(teams) {
  return teams.map((team, index) => ({ ...team, rank: index + 1 }));
}

const PREMIER = {
  id: 17146,
  slug: "premier-league",
  name: "Premier League",
  country: "England",
  base: 1838,
  source: "clubelo",
};

const CHAMPIONSHIP = {
  id: 17184,
  slug: "championship",
  name: "Championship",
  country: "England",
  base: 1610,
  source: "clubelo",
};

const LA_LIGA = {
  id: 17199,
  slug: "la-liga",
  name: "La Liga",
  country: "Spain",
  base: 1766,
  source: "clubelo",
};

const SERIE_A = {
  id: 17084,
  slug: "serie-a",
  name: "Serie A",
  country: "Italy",
  base: 1739,
  source: "clubelo",
};

const arsenalMatches = [
  match({
    dateUnix: 1761600000,
    opponent: "Liverpool",
    opponentRank: 3,
    isHome: false,
    homeGoals: 0,
    awayGoals: 2,
    result: "W",
    delta: 8.4,
  }),
  match({
    dateUnix: 1761000000,
    opponent: "Wolves",
    opponentRank: 18,
    isHome: true,
    homeGoals: 2,
    awayGoals: 0,
    result: "W",
    delta: 1.4,
  }),
  match({
    dateUnix: 1760400000,
    opponent: "Chelsea",
    opponentRank: 4,
    isHome: true,
    homeGoals: 1,
    awayGoals: 1,
    result: "D",
    delta: 0.2,
  }),
  match({
    dateUnix: 1759800000,
    opponent: "Newcastle",
    opponentRank: 5,
    isHome: false,
    homeGoals: 0,
    awayGoals: 1,
    result: "W",
    delta: 2.2,
  }),
  match({
    dateUnix: 1759200000,
    opponent: "Brighton",
    opponentRank: 8,
    isHome: true,
    homeGoals: 3,
    awayGoals: 1,
    result: "W",
    delta: 1.8,
  }),
  match({
    dateUnix: 1758600000,
    opponent: "Brentford",
    opponentRank: 14,
    isHome: true,
    homeGoals: 1,
    awayGoals: 0,
    result: "W",
    delta: 1.5,
  }),
];

export function buildStrengthPreviewOverview() {
  const premierTeams = ranked([
    club(PREMIER, "Arsenal", 1864, arsenalMatches),
    club(PREMIER, "Man City", 1851, homeRun("City", PREMIER.name)),
    club(PREMIER, "Liverpool", 1844, homeRun("Liverpool", PREMIER.name)),
    club(PREMIER, "Chelsea", 1839, homeRun("Chelsea", PREMIER.name)),
    club(PREMIER, "Newcastle", 1822, homeRun("Newcastle", PREMIER.name)),
    club(PREMIER, "Bournemouth", 1804, homeRun("Bournemouth", PREMIER.name)),
    club(PREMIER, "Brentford", 1790, homeRun("Brentford", PREMIER.name)),
    club(PREMIER, "Wolves", 1774, homeRun("Wolves", PREMIER.name)),
  ]);

  const championshipTeams = ranked([
    club(CHAMPIONSHIP, "Leeds", 1642, homeRun("Leeds", CHAMPIONSHIP.name).slice(0, 2)),
    club(CHAMPIONSHIP, "Burnley", 1628, homeRun("Burnley", CHAMPIONSHIP.name)),
    club(CHAMPIONSHIP, "Sheffield Utd", 1619, homeRun("Sheffield", CHAMPIONSHIP.name)),
    club(CHAMPIONSHIP, "Sunderland", 1611, homeRun("Sunderland", CHAMPIONSHIP.name)),
    club(CHAMPIONSHIP, "Middlesbrough", 1604, homeRun("Boro", CHAMPIONSHIP.name)),
    club(CHAMPIONSHIP, "West Brom", 1596, homeRun("West Brom", CHAMPIONSHIP.name)),
  ]);

  const laLigaTeams = ranked([
    club(LA_LIGA, "Barcelona", 1794, homeRun("Barcelona", LA_LIGA.name)),
    club(LA_LIGA, "Real Madrid", 1788, homeRun("Madrid", LA_LIGA.name)),
    club(LA_LIGA, "Atletico", 1769, homeRun("Atletico", LA_LIGA.name)),
    club(LA_LIGA, "Girona", 1755, homeRun("Girona", LA_LIGA.name)),
    club(LA_LIGA, "Real Sociedad", 1744, homeRun("Sociedad", LA_LIGA.name)),
    club(LA_LIGA, "Villarreal", 1738, homeRun("Villarreal", LA_LIGA.name)),
  ]);

  const serieATeams = ranked([
    club(SERIE_A, "Inter", 1768, homeRun("Inter", SERIE_A.name)),
    club(SERIE_A, "Milan", 1759, homeRun("Milan", SERIE_A.name)),
    club(SERIE_A, "Juventus", 1751, homeRun("Juventus", SERIE_A.name)),
    club(SERIE_A, "Napoli", 1742, homeRun("Napoli", SERIE_A.name)),
    club(SERIE_A, "Roma", 1733, homeRun("Roma", SERIE_A.name)),
  ]);

  const leedsGlobal = club(CHAMPIONSHIP, "Leeds", 1872, [
    match({
      dateUnix: 1761600000,
      opponent: "Arsenal",
      opponentLeague: PREMIER.name,
      opponentRank: 2,
      isHome: false,
      homeGoals: 1,
      awayGoals: 2,
      result: "W",
      delta: 9.1,
    }),
    ...homeRun("Leeds Europe", CHAMPIONSHIP.name).slice(0, 5),
  ]);

  const global = ranked([
    leedsGlobal,
    club(PREMIER, "Arsenal", 1858, arsenalMatches),
    club(PREMIER, "Man City", 1849, homeRun("City", PREMIER.name)),
    club(LA_LIGA, "Barcelona", 1790, homeRun("Barcelona", LA_LIGA.name)),
    club(SERIE_A, "Inter", 1764, homeRun("Inter", SERIE_A.name)),
    club(PREMIER, "Liverpool", 1840, homeRun("Liverpool", PREMIER.name)),
    club(CHAMPIONSHIP, "Burnley", 1630, homeRun("Burnley", CHAMPIONSHIP.name)),
  ]);

  const leagues = [
    { ...PREMIER, teams: premierTeams },
    { ...CHAMPIONSHIP, teams: championshipTeams },
    { ...LA_LIGA, teams: laLigaTeams },
    { ...SERIE_A, teams: serieATeams },
  ];

  return {
    generatedAt: "2026-10-28T06:50:00.000Z",
    window: 6,
    windows: {
      6: { global, leagues },
      10: { global, leagues },
    },
    basesAsOf: "2026-10-28",
    global,
    leagues,
  };
}
