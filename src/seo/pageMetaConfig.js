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
      "FIFA World Cup 2026 tournament preview: predicted winner, Golden Boot picks, group predictions, all 48 team guides and key match predictions.",
  },
  "/seasonpreviews": {
    title: "Season Previews | SoccerStatsHub",
    description:
      "AI-powered season previews for the Premier League, La Liga, Serie A, Championship and more.",
  },
  "/reset": {
    title: "Reset Password | SoccerStatsHub",
    description: "Reset your SoccerStatsHub account password.",
    noIndex: true,
  },
  "/cancelsubscription": {
    title: "Cancel Subscription | SoccerStatsHub",
    description: "Manage or cancel your SoccerStatsHub subscription.",
    noIndex: true,
  },
};

export function normalizePathname(pathname) {
  const stripped = pathname.replace(/\/+$/, "");
  return stripped === "" ? "/" : stripped;
}

export function getCanonicalUrl(pathname) {
  const path = normalizePathname(pathname);
  if (path === "/") return `${SITE_URL}/`;
  return `${SITE_URL}${path}/`;
}

export function getPageMeta(pathname) {
  const path = normalizePathname(pathname);
  return PAGE_META[path] || { title: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION };
}
