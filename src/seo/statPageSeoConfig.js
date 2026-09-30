const RELATED_CORE_STATS = [
  { label: "BTTS fixtures", href: "/bttsfixtures/" },
  { label: "Over 2.5 fixtures", href: "/fixtureshigh/" },
  { label: "Highest scoring leagues", href: "/highest-scoring-leagues/" },
  { label: "Competitions", href: "/competitions/" },
];

const HUB_LINKS = {
  btts: { label: "BTTS fixtures", href: "/bttsfixtures/" },
  goals: { label: "Over 2.5 fixtures", href: "/fixtureshigh/" },
  leagues: { label: "Highest scoring leagues", href: "/highest-scoring-leagues/" },
  competitions: { label: "Competitions", href: "/competitions/" },
  fixtures: { label: "Upcoming fixtures", href: "/fixtures/" },
  methodology: { label: "Methodology", href: "/methodology/" },
};

export const STAT_PAGE_SEO = {
  u25: {
    canonicalPath: "/u25/",
    intro:
      "Use this Under 2.5 goals table to compare low-scoring football leagues by average goals per match and Under 2.5 rate. It is designed for users researching defensive competitions, slower scoring environments and leagues where low-goal match profiles are common.",
    relatedLinks: [HUB_LINKS.leagues, HUB_LINKS.goals, HUB_LINKS.competitions],
    faqItems: [
      {
        question: "What makes a league low scoring?",
        answer:
          "A low-scoring league has a lower average goals per match and a higher share of matches finishing under 2.5 goals compared with other competitions.",
      },
      {
        question: "How should I use Under 2.5 league stats?",
        answer:
          "Start with league tendencies, then check the individual teams, fixture context, recent form and prices before making any betting decision.",
      },
      {
        question: "How often are these league stats updated?",
        answer:
          "The table refreshes as the underlying football data updates, so the rankings can change as more fixtures are completed.",
      },
    ],
  },
  bttsTeams: {
    canonicalPath: "/bttsteams/",
    intro:
      "This page highlights teams with strong Both Teams To Score records, combining season BTTS percentages with recent fixture context so you can quickly find sides involved in open matches.",
    relatedLinks: [HUB_LINKS.btts, HUB_LINKS.goals, HUB_LINKS.leagues],
    faqItems: [
      {
        question: "What does BTTS mean?",
        answer:
          "BTTS means Both Teams To Score. A BTTS result occurs when each team scores at least once in the match.",
      },
      {
        question: "Why rank teams by BTTS percentage?",
        answer:
          "Team-level BTTS rates help identify sides that regularly score and concede, which can be useful before checking today’s fixtures.",
      },
      {
        question: "Are BTTS team stats enough on their own?",
        answer:
          "No. They are a starting point. Match odds, injuries, home/away splits and recent form should also be reviewed.",
      },
    ],
  },
  bttsFixtures: {
    canonicalPath: "/bttsfixtures/",
    intro:
      "This BTTS hub ranks teams with the strongest and weakest Both Teams To Score records, then lists today’s fixtures with scoring averages and BTTS odds. Use the team tables for season context and the fixture table for today’s shortlist.",
    relatedLinks: [
      HUB_LINKS.goals,
      HUB_LINKS.leagues,
      HUB_LINKS.fixtures,
      HUB_LINKS.methodology,
    ],
  },
  o25: {
    canonicalPath: "/o25/",
    intro:
      "This Over 2.5 teams table ranks high-scoring sides by average goals and Over 2.5 rate, helping you find teams that are often involved in goal-heavy matches.",
    relatedLinks: [HUB_LINKS.leagues, HUB_LINKS.goals, HUB_LINKS.btts],
    faqItems: [
      {
        question: "What does Over 2.5 mean?",
        answer:
          "Over 2.5 means a match has three or more total goals. A 2-1, 3-0 or 2-2 scoreline would all be Over 2.5.",
      },
      {
        question: "Why rank teams instead of matches?",
        answer:
          "Team rankings reveal recurring goal trends before you narrow the research down to a specific fixture.",
      },
      {
        question: "Can a high Over 2.5 team still play a low-scoring match?",
        answer:
          "Yes. These are trend indicators, not guarantees. Opponent strength, venue, team news and odds still matter.",
      },
    ],
  },
  fixturesHigh: {
    canonicalPath: "/fixtureshigh/",
    intro:
      "This goals hub ranks teams with the highest average goals and Over 2.5 rates, then lists today’s fixtures with the strongest combined scoring averages. Use the team table for season context and the fixture table for today’s Over 2.5 shortlist.",
    relatedLinks: [
      HUB_LINKS.btts,
      HUB_LINKS.leagues,
      HUB_LINKS.fixtures,
      HUB_LINKS.methodology,
    ],
  },
  highestScoringLeagues: {
    canonicalPath: "/highest-scoring-leagues/",
    intro:
      "Compare the highest-scoring and lowest-scoring football leagues by goals per match, Over 2.5 and Under 2.5 rates. Use the first table for open, goal-heavy competitions and the second for defensive, slower scoring environments.",
    relatedLinks: [HUB_LINKS.goals, HUB_LINKS.btts, HUB_LINKS.competitions],
  },
  bttsNoTeams: {
    canonicalPath: "/btts-no-teams/",
    intro:
      "Find teams with lower Both Teams To Score rates, useful for BTTS No, clean sheet and low-scoring match research. Teams are filtered for a meaningful sample of completed matches.",
    relatedLinks: [HUB_LINKS.btts, HUB_LINKS.leagues, HUB_LINKS.competitions],
    faqItems: [
      {
        question: "What is BTTS No?",
        answer:
          "BTTS No means at least one team fails to score. Scores such as 1-0, 0-0 and 2-0 are BTTS No results.",
      },
      {
        question: "Why look for low BTTS teams?",
        answer:
          "Low BTTS teams can point towards stronger defensive profiles, weaker attacks or matchups that may suit clean sheet and under-goals research.",
      },
      {
        question: "Why require a minimum number of matches?",
        answer:
          "Small samples can be misleading, so the page filters out teams without enough completed matches.",
      },
    ],
  },
};

export function getCoreStatLinks(excludeHref) {
  return RELATED_CORE_STATS.filter((link) => link.href !== excludeHref);
}

function formatHubRate(value) {
  if (value == null || Number.isNaN(Number(value))) return null;
  return `${Number(value)}%`;
}

function topRow(rows, field) {
  return (rows || [])
    .filter((row) => row && row[field] != null && !Number.isNaN(Number(row[field])))
    .sort((a, b) => Number(b[field]) - Number(a[field]))[0] || null;
}

export function buildBttsFixturesIntro(teamRows = []) {
  const fallback = STAT_PAGE_SEO.bttsFixtures.intro;
  const leader = topRow(teamRows, "bttsPercentage");
  const rate = formatHubRate(leader?.bttsPercentage);
  if (!leader?.name || !rate) return fallback;
  const played =
    leader.played != null ? ` from ${leader.played} matches` : "";
  return `${leader.name} lead the Both Teams To Score table at ${rate}${played}. The team tables rank the strongest and weakest BTTS records, and the fixture table lists today's shortlist with scoring averages and odds.`;
}

export function buildFixturesHighIntro(teamRows = []) {
  const fallback = STAT_PAGE_SEO.fixturesHigh.intro;
  const leader = topRow(teamRows, "averageGoals");
  if (!leader?.team || leader.averageGoals == null) return fallback;
  const rate = formatHubRate(leader.over25Percentage);
  const rateClause = rate ? `, with an Over 2.5 rate of ${rate}` : "";
  return `${leader.team} average ${leader.averageGoals} goals a match${rateClause}. The team table ranks season scoring rates, and the fixture table lists today's Over 2.5 shortlist.`;
}

export function buildHighestScoringLeaguesIntro(leagueRows = []) {
  const fallback = STAT_PAGE_SEO.highestScoringLeagues.intro;
  const leader = topRow(leagueRows, "averageGoals");
  if (!leader?.league || leader.averageGoals == null) return fallback;
  const rate = formatHubRate(leader.over25Percentage);
  const rateClause = rate ? `, with an Over 2.5 rate of ${rate}` : "";
  return `${leader.league} are the highest-scoring league in this table at ${leader.averageGoals} goals a match${rateClause}. The second table lists the lowest-scoring leagues by goals per match.`;
}

export function buildHomepageTodayLinks({
  bttsTeams = [],
  o25Teams = [],
  leagues = [],
} = {}) {
  const btts = topRow(bttsTeams, "bttsPercentage");
  const goals = topRow(o25Teams, "averageGoals");
  const league = topRow(leagues, "averageGoals");

  return [
    {
      href: "/bttsfixtures/",
      label: "BTTS fixtures",
      detail:
        btts?.name && btts.bttsPercentage != null
          ? `${btts.name} ${formatHubRate(btts.bttsPercentage)}`
          : null,
    },
    {
      href: "/fixtureshigh/",
      label: "Over 2.5 fixtures",
      detail:
        goals?.team && goals.averageGoals != null
          ? `${goals.team} ${goals.averageGoals} goals`
          : null,
    },
    {
      href: "/highest-scoring-leagues/",
      label: "Highest scoring leagues",
      detail:
        league?.league && league.averageGoals != null
          ? `${league.league} ${league.averageGoals}`
          : null,
    },
  ];
}
