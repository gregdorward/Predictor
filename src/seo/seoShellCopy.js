function teamLabel(team) {
  return team?.name || team?.english_name || null;
}

export function buildCompetitionSeoParagraphs({
  name,
  country,
  season,
  avgGoals,
  btts,
  over25,
  under25,
  homeWin,
  draw,
  awayWin,
  topOver25Teams = [],
  topBttsTeams = [],
}) {
  const paragraphs = [];
  const location = [country, season].filter(Boolean).join(", ");

  paragraphs.push(
    `This page is a season-long research hub for ${name}${
      location ? ` (${location})` : ""
    }. Soccer Stats Hub brings together league averages, market trends and team-level signals so you can compare fixtures with context rather than relying on a single headline number.`
  );

  const marketBits = [];
  if (avgGoals != null) {
    marketBits.push(`matches are averaging ${avgGoals} goals`);
  }
  if (btts != null) {
    marketBits.push(`both teams have scored in about ${btts} of games`);
  }
  if (over25 != null) {
    marketBits.push(`roughly ${over25} of fixtures have gone Over 2.5 goals`);
  }
  if (under25 != null) {
    marketBits.push(`about ${under25} have stayed Under 2.5 goals`);
  }

  if (marketBits.length > 0) {
    paragraphs.push(
      `Across the ${name} season so far, ${marketBits.join(
        ", "
      )}. These figures refresh as the ${
        season || "season"
      } progresses and are a sensible starting point before you open individual matches.`
    );
  } else {
    paragraphs.push(
      `Use the league profile below to see how open or tight this competition has been, then move into team rankings and fixtures for match-by-match detail.`
    );
  }

  if (homeWin != null && draw != null && awayWin != null) {
    paragraphs.push(
      `Home teams have won ${homeWin} of games to date, with ${draw} drawn and ${awayWin} won by the away side. That home and away split often shapes how generous the goal markets look from one week to the next.`
    );
  }

  const leaderName = teamLabel(topOver25Teams[0]);
  const bttsLeaderName = teamLabel(topBttsTeams[0]);
  if (leaderName || bttsLeaderName) {
    const leaderParts = [];
    if (leaderName) {
      leaderParts.push(`${leaderName} rank highly for Over 2.5 games`);
    }
    if (bttsLeaderName && bttsLeaderName !== leaderName) {
      leaderParts.push(`${bttsLeaderName} are among the stronger BTTS teams`);
    }
    paragraphs.push(
      `${leaderParts.join(
        ", while "
      )}. The tables below name the leading sides in each market before the interactive charts and fixture list load.`
    );
  } else {
    paragraphs.push(
      `Full league tables, form charts, player rankings and fixture predictions load below once the interactive view opens.`
    );
  }

  return paragraphs;
}

export function buildFixtureSeoParagraphs({
  home,
  away,
  league,
  competitionName,
}) {
  const paragraphs = [];
  const fixtureLabel = `${home} vs ${away}`;
  const competition = league || competitionName;

  paragraphs.push(
    `This is a pre-match research page for ${fixtureLabel}${
      competition ? ` in ${competition}` : ""
    }. Soccer Stats Hub combines head-to-head history, recent form, expected goals trends and goal-market stats so you can judge whether the data points towards goals, a tighter scoreline or a clear home or away bias.`
  );

  paragraphs.push(
    `Below you can compare ${home} and ${away} on BTTS, Over and Under 2.5, correct-score probabilities, league position and model outputs. We publish our data sources and modelling approach on the methodology page so you can see how each signal is built before using the stats.`
  );

  paragraphs.push(
    `${home} and ${away} are evaluated on the same metrics: rolling form, home and away splits where relevant, and how each side compares to the rest of ${
      competition || "the competition"
    }. That keeps the preview grounded in season-long performance rather than a single recent result.`
  );

  return paragraphs;
}
