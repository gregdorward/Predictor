import { getIndexableCompetitions } from "../src/seo/competitionCatalog";
import { fetchUpcomingFixtureLinks } from "../src/seo/serverFetch";
import { SITE_URL } from "../src/seo/pageMetaConfig";

const STATIC_ROUTES = [
  { path: "/", priority: "1.0", changefreq: "daily" },
  { path: "/o25/", priority: "0.8", changefreq: "daily" },
  { path: "/highest-scoring-leagues/", priority: "0.8", changefreq: "daily" },
  { path: "/u25/", priority: "0.8", changefreq: "daily" },
  { path: "/fixtureshigh/", priority: "0.8", changefreq: "daily" },
  { path: "/bttsfixtures/", priority: "0.8", changefreq: "daily" },
  { path: "/bttsteams/", priority: "0.8", changefreq: "daily" },
  { path: "/btts-no-teams/", priority: "0.8", changefreq: "daily" },
  { path: "/seasonpreviews/", priority: "0.7", changefreq: "weekly" },
  { path: "/worldcup2026/", priority: "0.9", changefreq: "weekly" },
  { path: "/competitions/", priority: "0.8", changefreq: "weekly" },
  { path: "/fixtures/", priority: "0.8", changefreq: "daily" },
  { path: "/about/", priority: "0.6", changefreq: "monthly" },
  { path: "/methodology/", priority: "0.6", changefreq: "monthly" },
  { path: "/faq/", priority: "0.6", changefreq: "monthly" },
];

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function urlEntry(loc, { priority, changefreq, lastmod }) {
  return `  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

async function buildFixtureEntries(lastmod) {
  const fixtures = await fetchUpcomingFixtureLinks({ limit: 150 });

  return fixtures.map((fixture) =>
    urlEntry(`${SITE_URL}${fixture.href}`, {
      priority: "0.7",
      changefreq: "daily",
      lastmod,
    })
  );
}

async function generateSiteMap() {
  const lastmod = new Date().toISOString().slice(0, 10);
  const staticEntries = STATIC_ROUTES.map((route) =>
    urlEntry(`${SITE_URL}${route.path}`, {
      priority: route.priority,
      changefreq: route.changefreq,
      lastmod,
    })
  );

  const competitionEntries = getIndexableCompetitions().map((competition) =>
    urlEntry(`${SITE_URL}/competition/${competition.slug}/`, {
      priority: "0.8",
      changefreq: "daily",
      lastmod,
    })
  );

  const fixtureEntries = await buildFixtureEntries(lastmod);

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticEntries, ...competitionEntries, ...fixtureEntries].join("\n")}
</urlset>`;
}

export async function getServerSideProps({ res }) {
  const xml = await generateSiteMap();
  res.setHeader("Content-Type", "text/xml");
  res.write(xml);
  res.end();
  return { props: {} };
}

export default function SiteMap() {
  return null;
}
