import { collectSitemapEntries } from "../src/seo/sitemapUrls";

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function urlEntry(loc, { lastmod }) {
  const lastmodTag = lastmod
    ? `\n    <lastmod>${escapeXml(lastmod)}</lastmod>`
    : "";
  return `  <url>
    <loc>${escapeXml(loc)}</loc>${lastmodTag}
  </url>`;
}

async function generateSiteMap() {
  let entries = [];
  try {
    entries = await collectSitemapEntries();
  } catch {
    entries = await collectSitemapEntries({
      includeFixtures: false,
      includeCompetitions: false,
    });
  }

  const body = entries
    .map((entry) => urlEntry(entry.loc, { lastmod: entry.lastmod }))
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>`;
}

export async function getServerSideProps({ res }) {
  const xml = await generateSiteMap();
  res.setHeader("Content-Type", "text/xml; charset=utf-8");
  // Short CDN/browser cache so crawlers rarely hit a cold API fan-out.
  res.setHeader(
    "Cache-Control",
    "public, s-maxage=900, stale-while-revalidate=3600"
  );
  res.write(xml);
  res.end();
  return { props: {} };
}

export default function SiteMap() {
  return null;
}
