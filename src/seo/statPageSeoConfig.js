const RELATED_CORE_STATS = [
  { label: "BTTS teams", href: "/bttsteams/" },
  { label: "BTTS fixtures", href: "/bttsfixtures/" },
  { label: "Under 2.5 leagues", href: "/u25/" },
  { label: "Highest scoring leagues", href: "/highest-scoring-leagues/" },
  { label: "Over 2.5 fixtures", href: "/fixtureshigh/" },
  { label: "Competitions", href: "/competitions/" },
];

export const STAT_PAGE_SEO = {
  u25: {
    canonicalPath: "/u25/",
    intro:
      "Use this Under 2.5 goals table to compare low-scoring football leagues by average goals per match and Under 2.5 rate. It is designed for users researching defensive competitions, slower scoring environments and leagues where low-goal match profiles are common.",
    relatedLinks: [
      { label: "BTTS No teams", href: "/btts-no-teams/" },
      { label: "Highest scoring leagues", href: "/highest-scoring-leagues/" },
      { label: "Over 2.5 teams", href: "/o25/" },
      { label: "Competitions", href: "/competitions/" },
    ],
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
    relatedLinks: [
      { label: "BTTS No teams", href: "/btts-no-teams/" },
      { label: "BTTS fixtures", href: "/bttsfixtures/" },
      { label: "Highest scoring leagues", href: "/highest-scoring-leagues/" },
      { label: "Over 2.5 fixtures", href: "/fixtureshigh/" },
    ],
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
      "BTTS fixtures combine scoring averages, match timing and market data to surface games where both teams scoring may deserve closer inspection.",
    relatedLinks: [
      { label: "BTTS teams", href: "/bttsteams/" },
      { label: "BTTS No teams", href: "/btts-no-teams/" },
      { label: "Over 2.5 fixtures", href: "/fixtureshigh/" },
      { label: "Upcoming fixtures", href: "/fixtures/" },
    ],
    faqItems: [
      {
        question: "What are BTTS fixtures?",
        answer:
          "BTTS fixtures are matches where both teams scoring is a relevant market, usually because both sides have scoring and conceding patterns.",
      },
      {
        question: "Why do some matches not appear here?",
        answer:
          "The page filters for fixtures with enough season progress and goal potential, so low-sample or low-signal matches are excluded.",
      },
      {
        question: "What should I check after this table?",
        answer:
          "Open the individual match view to compare form, head-to-head data, goal trends and prediction outputs.",
      },
    ],
  },
  o25: {
    canonicalPath: "/o25/",
    intro:
      "This Over 2.5 teams table ranks high-scoring sides by average goals and Over 2.5 rate, helping you find teams that are often involved in goal-heavy matches.",
    relatedLinks: [
      { label: "Highest scoring leagues", href: "/highest-scoring-leagues/" },
      { label: "Over 2.5 fixtures", href: "/fixtureshigh/" },
      { label: "BTTS teams", href: "/bttsteams/" },
      { label: "Under 2.5 leagues", href: "/u25/" },
    ],
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
      "These fixtures are filtered for goal potential using combined scoring averages and market information, giving you a shortlist of matches to research for Over 2.5 and goal-heavy outcomes.",
    relatedLinks: [
      { label: "Over 2.5 teams", href: "/o25/" },
      { label: "Highest scoring leagues", href: "/highest-scoring-leagues/" },
      { label: "BTTS fixtures", href: "/bttsfixtures/" },
      { label: "Upcoming fixtures", href: "/fixtures/" },
    ],
    faqItems: [
      {
        question: "How are high-scoring fixtures selected?",
        answer:
          "Fixtures are filtered using combined scoring averages, season progress and available goal-market data.",
      },
      {
        question: "Is this the same as an Over 2.5 prediction?",
        answer:
          "It is a research shortlist rather than a guarantee. The individual match page gives deeper form and prediction context.",
      },
      {
        question: "Why is average goals shown?",
        answer:
          "Average goals gives a quick signal for how open or goal-heavy the fixture profile is.",
      },
    ],
  },
  highestScoringLeagues: {
    canonicalPath: "/highest-scoring-leagues/",
    intro:
      "Compare high-scoring football leagues by goals per match and the percentage of fixtures finishing over 2.5 goals. Use this table to find competitions where open, goal-heavy matches are most common.",
    relatedLinks: [
      { label: "Over 2.5 teams", href: "/o25/" },
      { label: "Over 2.5 fixtures", href: "/fixtureshigh/" },
      { label: "Under 2.5 leagues", href: "/u25/" },
      { label: "BTTS teams", href: "/bttsteams/" },
    ],
    faqItems: [
      {
        question: "Which leagues are highest scoring?",
        answer:
          "The highest-scoring leagues are those with the strongest goals-per-match averages and high Over 2.5 rates in the current data.",
      },
      {
        question: "Why compare league goal averages?",
        answer:
          "League-wide scoring environments shape fixture expectations, especially before comparing the individual teams involved.",
      },
      {
        question: "Is this page updated during the season?",
        answer:
          "Yes. The table updates as the underlying league goal data changes through the season.",
      },
    ],
  },
  bttsNoTeams: {
    canonicalPath: "/btts-no-teams/",
    intro:
      "Find teams with lower Both Teams To Score rates, useful for BTTS No, clean sheet and low-scoring match research. Teams are filtered for a meaningful sample of completed matches.",
    relatedLinks: [
      { label: "BTTS teams", href: "/bttsteams/" },
      { label: "Under 2.5 leagues", href: "/u25/" },
      { label: "BTTS fixtures", href: "/bttsfixtures/" },
      { label: "Competitions", href: "/competitions/" },
    ],
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
