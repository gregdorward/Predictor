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
    faqItems: [
      {
        question: "What does BTTS mean?",
        answer:
          "BTTS means Both Teams To Score. A BTTS result occurs when each team scores at least once in the match.",
      },
      {
        question: "What are BTTS fixtures?",
        answer:
          "BTTS fixtures are matches where both teams scoring is a relevant market, usually because both sides have scoring and conceding patterns.",
      },
      {
        question: "Why rank teams by BTTS percentage?",
        answer:
          "Team-level BTTS rates help identify sides that regularly score and concede, which can be useful before checking today’s fixtures.",
      },
      {
        question: "What is BTTS No?",
        answer:
          "BTTS No means at least one team fails to score. Scores such as 1-0, 0-0 and 2-0 are BTTS No results. Low BTTS teams can point towards stronger defensive profiles, weaker attacks or matchups that may suit clean sheet and under-goals research.",
      },
      {
        question: "Why do some matches or teams not appear here?",
        answer:
          "The fixture table filters for matches with enough season progress and goal potential. The team tables require a meaningful sample of completed matches, so low-sample sides are excluded.",
      },
      {
        question: "What should I check after these tables?",
        answer:
          "Compare the shortlist with league scoring environment on the competitions and highest-scoring leagues pages, and read how the model is built on the methodology page. Match odds, injuries, home/away splits and recent form should also be reviewed.",
      },
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
    faqItems: [
      {
        question: "What does Over 2.5 mean?",
        answer:
          "Over 2.5 means a match has three or more total goals. A 2-1, 3-0 or 2-2 scoreline would all be Over 2.5.",
      },
      {
        question: "How are high-scoring fixtures selected?",
        answer:
          "Fixtures are filtered using combined scoring averages, season progress and available goal-market data.",
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
      {
        question: "Is this the same as an Over 2.5 prediction?",
        answer:
          "It is a research shortlist rather than a guarantee. League scoring rates and the methodology page give the wider context.",
      },
      {
        question: "Why is average goals shown?",
        answer:
          "Average goals gives a quick signal for how open or goal-heavy the team or fixture profile is.",
      },
    ],
  },
  highestScoringLeagues: {
    canonicalPath: "/highest-scoring-leagues/",
    intro:
      "Compare the highest-scoring and lowest-scoring football leagues by goals per match, Over 2.5 and Under 2.5 rates. Use the first table for open, goal-heavy competitions and the second for defensive, slower scoring environments.",
    relatedLinks: [HUB_LINKS.goals, HUB_LINKS.btts, HUB_LINKS.competitions],
    faqItems: [
      {
        question: "Which leagues are highest scoring?",
        answer:
          "The highest-scoring leagues are those with the strongest goals-per-match averages and high Over 2.5 rates in the current data.",
      },
      {
        question: "What makes a league low scoring?",
        answer:
          "A low-scoring league has a lower average goals per match and a higher share of matches finishing under 2.5 goals compared with other competitions.",
      },
      {
        question: "Why compare league goal averages?",
        answer:
          "League-wide scoring environments shape fixture expectations, especially before comparing the individual teams involved.",
      },
      {
        question: "How should I use Under 2.5 league stats?",
        answer:
          "Start with league tendencies, then check the individual teams, fixture context, recent form and prices before making any betting decision.",
      },
      {
        question: "Is this page updated during the season?",
        answer:
          "Yes. The tables update as the underlying league goal data changes through the season.",
      },
    ],
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
