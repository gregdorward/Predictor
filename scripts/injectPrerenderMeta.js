/**
 * Ensures each prerendered route has exactly one set of SEO tags in static HTML.
 * react-snap + react-helmet can leave stale or partial head tags after index.html changes.
 */
const fs = require("fs");
const path = require("path");

const BUILD_DIR = path.join(__dirname, "..", "build");
const SITE_URL = "https://www.soccerstatshub.com";
const OG_IMAGE = `${SITE_URL}/images/social-share-card.jpg`;
const SITE_NAME = "SoccerStatsHub";

const PAGE_META = {
  "/": {
    title: "SoccerStatsHub | Football Stats, Predictions & Tips",
    description:
      "Data-driven football stats, BTTS tips, Over 2.5 predictions, correct score analysis and daily multis for today's matches.",
  },
  "/o25/": {
    title: "Over 2.5 Goals Teams | SoccerStatsHub",
    description:
      "Elite scoring teams with the highest average goals and upcoming fixtures. Find the best Over 2.5 goals betting opportunities.",
  },
  "/u25/": {
    title: "Under 2.5 Goals Leagues | SoccerStatsHub",
    description:
      "Leagues with the lowest goals-per-match averages. Identify Under 2.5 goals value across top European and international competitions.",
  },
  "/teamshigh/": {
    title: "Highest Scoring Teams | SoccerStatsHub",
    description:
      "Teams ranked by goals scored this season. Compare attacking form and find high-scoring sides across major leagues.",
  },
  "/fixtureshigh/": {
    title: "Highest Scoring Fixtures | SoccerStatsHub",
    description:
      "Today's fixtures with the highest goal potential. Data-driven insights to find matches likely to produce goals.",
  },
  "/bttsfixtures/": {
    title: "BTTS Fixtures Today | SoccerStatsHub",
    description:
      "Both Teams To Score fixture insights for today's matches. Stats-backed BTTS picks across major leagues.",
  },
  "/bttsteams/": {
    title: "BTTS Teams | SoccerStatsHub",
    description:
      "Teams with the strongest Both Teams To Score records. Find BTTS-elite sides and their upcoming fixtures.",
  },
  "/worldcup2026/": {
    title: "World Cup 2026 Preview | SoccerStatsHub",
    description:
      "FIFA World Cup 2026 tournament preview: predicted winner, Golden Boot picks, group predictions, all 48 team guides and key match predictions.",
  },
  "/seasonpreviews/": {
    title: "Season Previews | SoccerStatsHub",
    description:
      "AI-powered season previews for the Premier League, La Liga, Serie A, Championship and more.",
  },
};

const PRERENDER_ROUTES = Object.keys(PAGE_META);

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function getCanonicalUrl(pathname) {
  if (pathname === "/") return `${SITE_URL}/`;
  return `${SITE_URL}${pathname}`;
}

function buildSeoBlock(pathname) {
  const meta = PAGE_META[pathname];
  const canonicalUrl = getCanonicalUrl(pathname);
  const title = escapeHtml(meta.title);
  const description = escapeHtml(meta.description);

  return [
    `<title>${title}</title>`,
    `<meta name="description" content="${description}">`,
    `<link rel="canonical" href="${canonicalUrl}">`,
    `<meta property="og:title" content="${title}">`,
    `<meta property="og:description" content="${description}">`,
    `<meta property="og:image" content="${OG_IMAGE}">`,
    `<meta property="og:url" content="${canonicalUrl}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:site_name" content="${SITE_NAME}">`,
    `<meta property="og:locale" content="en_GB">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${title}">`,
    `<meta name="twitter:description" content="${description}">`,
    `<meta name="twitter:image" content="${OG_IMAGE}">`,
  ].join("\n  ");
}

function stripSeoTags(html) {
  return html
    .replace(/<title[^>]*>[\s\S]*?<\/title>/gi, "")
    .replace(/<meta[^>]+name=["']description["'][^>]*>/gi, "")
    .replace(/<meta[^>]+name=["']robots["'][^>]*>/gi, "")
    .replace(/<meta[^>]+property=["']og:[^"']+["'][^>]*>/gi, "")
    .replace(/<meta[^>]+name=["']twitter:[^"']+["'][^>]*>/gi, "")
    .replace(/<link[^>]+rel=["']canonical["'][^>]*>/gi, "");
}

function stripStalePrerenderMarkup(html) {
  return html
    .replace(/<div class="sr-only">[\s\S]*?<\/div>/gi, "")
    .replace(/<h1>SoccerStatsHub(?:\s*–\s*Football Stats, Predictions &amp; Tips)?<\/h1>/gi, "");
}

function injectSeoTags(html, pathname) {
  const cleaned = stripStalePrerenderMarkup(stripSeoTags(html));
  const seoBlock = buildSeoBlock(pathname);

  return cleaned.replace(
    /(<meta[^>]+name=["']viewport["'][^>]*>)/i,
    `$1\n  ${seoBlock}`
  );
}

function routeToFilePath(route) {
  if (route === "/") return path.join(BUILD_DIR, "index.html");
  const folder = route.replace(/\/$/, "");
  return path.join(BUILD_DIR, folder, "index.html");
}

function ensureRouteHtml(route) {
  const targetPath = routeToFilePath(route);
  const sourcePath = path.join(BUILD_DIR, "index.html");

  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Missing build template at ${sourcePath}`);
  }

  fs.mkdirSync(path.dirname(targetPath), { recursive: true });

  if (!fs.existsSync(targetPath)) {
    fs.copyFileSync(sourcePath, targetPath);
  }

  const html = fs.readFileSync(targetPath, "utf8");
  fs.writeFileSync(targetPath, injectSeoTags(html, route));
}

function main() {
  PRERENDER_ROUTES.forEach((route) => {
    ensureRouteHtml(route);
    console.log(`Injected SEO tags for ${route}`);
  });
}

main();
