export const SITE_URL = "https://www.soccerstatshub.com";
export const OG_IMAGE = `${SITE_URL}/images/social-share-card.jpg`;
export const SITE_NAME = "SoccerStatsHub";

export const DEFAULT_TITLE = "SoccerStatsHub | Football Stats, Predictions & Tips";
export const DEFAULT_DESCRIPTION =
  "Data-driven football stats, BTTS tips, Over 2.5 predictions, correct score analysis and daily multis for today's matches.";

export const PAGE_META = {
  "/": {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
  "/o25": {
    title: "Over 2.5 Goals Teams | SoccerStatsHub",
    description:
      "Elite scoring teams with the highest average goals and upcoming fixtures. Find the best Over 2.5 goals betting opportunities.",
  },
  "/u25": {
    title: "Under 2.5 Goals Leagues | SoccerStatsHub",
    description:
      "Leagues with the lowest goals-per-match averages. Identify Under 2.5 goals value across top European and international competitions.",
  },
  "/teamshigh": {
    title: "Highest Scoring Teams | SoccerStatsHub",
    description:
      "Teams ranked by goals scored this season. Compare attacking form and find high-scoring sides across major leagues.",
  },
  "/fixtureshigh": {
    title: "Highest Scoring Fixtures | SoccerStatsHub",
    description:
      "Today's fixtures with the highest goal potential. Data-driven insights to find matches likely to produce goals.",
  },
  "/bttsfixtures": {
    title: "BTTS Fixtures Today | SoccerStatsHub",
    description:
      "Both Teams To Score fixture insights for today's matches. Stats-backed BTTS picks across major leagues.",
  },
  "/bttsteams": {
    title: "BTTS Teams | SoccerStatsHub",
    description:
      "Teams with the strongest Both Teams To Score records. Find BTTS-elite sides and their upcoming fixtures.",
  },
  "/worldcup2026": {
    title: "World Cup 2026 Preview | SoccerStatsHub",
    description:
      "FIFA World Cup 2026 tournament preview and news: predicted winner, Golden Boot picks, group predictions, all 48 team guides, key match predictions and latest tournament headlines.",
  },
  "/seasonpreviews": {
    title: "Season Previews | SoccerStatsHub",
    description:
      "AI-generated season previews for the Premier League, La Liga, Serie A, Championship and more.",
  },
  "/about": {
    title: "About SoccerStatsHub | Football Stats & Predictions",
    description:
      "Learn how SoccerStatsHub delivers transparent football statistics, BTTS insights, Over 2.5 analysis and data-driven match predictions across 50+ competitions.",
  },
  "/faq": {
    title: "FAQ | SoccerStatsHub",
    description:
      "Frequently asked questions about SoccerStatsHub football stats, predictions, subscriptions and how our betting insights work.",
  },
  "/reset": {
    title: "Reset Password | SoccerStatsHub",
    description:
      "Request a password reset email for your SoccerStatsHub account and regain access to football stats, predictions and premium features.",
    noIndex: true,
  },
  "/cancelsubscription": {
    title: "Cancel Subscription | SoccerStatsHub",
    description: "Manage or cancel your SoccerStatsHub subscription.",
    noIndex: true,
  },
  "/success": {
    title: "Subscription Confirmed | SoccerStatsHub",
    description: "Your SoccerStatsHub premium subscription is active. Return to the app for full stats and predictions.",
    noIndex: true,
  },
  "/cancel": {
    title: "Checkout Cancelled | SoccerStatsHub",
    description: "Your SoccerStatsHub checkout was cancelled. Return to the homepage to continue browsing football stats and tips.",
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
