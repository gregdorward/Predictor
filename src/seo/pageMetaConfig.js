export const SITE_URL = "https://www.soccerstatshub.com";
export const OG_IMAGE = `${SITE_URL}/images/social-share-card.jpg`;
export const SITE_NAME = "Soccer Stats Hub";

export const DEFAULT_TITLE =
  "Soccer Stats Hub | BTTS, Under 2.5, xG & Football Predictions";
export const DEFAULT_DESCRIPTION =
  "Football stats, BTTS, Under 2.5, xG, form and prediction tools. Explore low-scoring leagues, match previews and stats-driven football insights.";

export const PAGE_META = {
  "/": {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
  "/o25": {
    title: "Over 2.5 Goals Teams | High Scoring Football Stats",
    description:
      "Teams ranked by Over 2.5 rate, average goals and upcoming fixtures. Find high-scoring sides for goals and match research.",
  },
  "/highest-scoring-leagues": {
    title: "Highest Scoring Leagues | Over 2.5 Football Stats",
    description:
      "Football leagues ranked by average goals and Over 2.5 rate. Find high-scoring competitions for goals, BTTS and match research.",
  },
  "/u25": {
    title: "Under 2.5 Goals Leagues | Low Scoring Football Stats",
    description:
      "Low-scoring football leagues ranked by average goals and Under 2.5 rate. Compare defensive competitions and under-goals trends.",
  },
  "/teamshigh": {
    title: "Highest Scoring Teams | Soccer Stats Hub",
    description:
      "Teams ranked by goals scored this season. Compare attacking form and find high-scoring sides across major leagues.",
  },
  "/fixtureshigh": {
    title: "Over 2.5 Goals Fixtures Today | High Scoring Match Stats",
    description:
      "Today's fixtures with high goal potential, Over 2.5 odds and combined scoring averages for stats-led match research.",
  },
  "/bttsfixtures": {
    title: "BTTS Fixtures Today | Both Teams To Score Match Stats",
    description:
      "Both Teams To Score fixture insights for today's matches, with scoring averages, BTTS odds and stats-backed match research.",
  },
  "/bttsteams": {
    title: "BTTS Teams Today | Both Teams To Score Stats & Predictions",
    description:
      "Teams with strong Both Teams To Score records, BTTS percentages and upcoming fixtures across major football leagues.",
  },
  "/btts-no-teams": {
    title: "BTTS No Teams | Low Both Teams To Score Stats",
    description:
      "Teams with lower Both Teams To Score rates for BTTS No, clean sheet and low-scoring match research across major football leagues.",
  },
  "/worldcup2026": {
    title: "World Cup 2026 Preview | Soccer Stats Hub",
    description:
      "FIFA World Cup 2026 tournament preview and news: predicted winner, Golden Boot picks, group predictions, all 48 team guides, key match predictions and latest tournament headlines.",
  },
  "/seasonpreviews": {
    title: "Season Previews | Soccer Stats Hub",
    description:
      "AI-generated season previews for the Premier League, La Liga, Serie A, Championship and more.",
  },
  "/about": {
    title: "About Soccer Stats Hub | Football Stats & Predictions",
    description:
      "Learn how Soccer Stats Hub delivers transparent football statistics, BTTS insights, Over 2.5 analysis and data-driven match predictions across 50+ competitions.",
  },
  "/methodology": {
    title: "Football Prediction Methodology | Soccer Stats Hub",
    description:
      "How Soccer Stats Hub uses form, xG, Poisson goal models, lambda tuning, BTTS, Over/Under 2.5 and probability outputs for football stats and predictions.",
  },
  "/faq": {
    title: "FAQ | Soccer Stats Hub",
    description:
      "Frequently asked questions about Soccer Stats Hub football stats, predictions, subscriptions and how our betting insights work.",
  },
  "/privacy": {
    title: "Privacy Policy | Soccer Stats Hub",
    description:
      "How Soccer Stats Hub collects, uses and protects your personal information, including account, payment and usage data.",
  },
  "/terms": {
    title: "Terms and Conditions | Soccer Stats Hub",
    description:
      "Soccer Stats Hub subscription terms, refunds, cancellations, promotions and legal restrictions.",
  },
  "/reset": {
    title: "Reset Password | Soccer Stats Hub",
    description:
      "Request a password reset email for your Soccer Stats Hub account and regain access to football stats, predictions and premium features.",
    noIndex: true,
  },
  "/cancelsubscription": {
    title: "Cancel Subscription | Soccer Stats Hub",
    description: "Manage or cancel your Soccer Stats Hub subscription.",
    noIndex: true,
  },
  "/success": {
    title: "Subscription Confirmed | Soccer Stats Hub",
    description: "Your Soccer Stats Hub premium subscription is active. Return to the app for full stats and predictions.",
    noIndex: true,
  },
  "/cancel": {
    title: "Checkout Cancelled | Soccer Stats Hub",
    description: "Your Soccer Stats Hub checkout was cancelled. Return to the homepage to continue browsing football stats and tips.",
    noIndex: true,
  },
};

export function normalizePathname(pathname) {
  const stripped = pathname.replace(/\/+$/, "");
  return stripped === "" ? "/" : stripped;
}

export function getCanonicalPathFromAsPath(asPath) {
  const withoutQuery = String(asPath || "/").split("?")[0].split("#")[0];
  return normalizePathname(withoutQuery);
}

export function getCanonicalUrl(pathOrAsPath) {
  const path = normalizePathname(pathOrAsPath);
  if (path === "/") return `${SITE_URL}/`;
  return `${SITE_URL}${path}/`;
}

export function getPageMeta(pathname) {
  const path = normalizePathname(pathname);
  return PAGE_META[path] || { title: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION };
}
