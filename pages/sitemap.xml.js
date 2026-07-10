import {
  STATIC_SITEMAP_ROUTES,
  collectSitemapUrls,
} from "../src/seo/sitemapUrls";

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

function buildRouteMeta() {
  const routeMeta = new Map(
    STATIC_SITEMAP_ROUTES.map((route) => [
      route.path === "/" ? "/" : route.path.replace(/\/$/, ""),
      route,
    ])
  );

  return {
    forPath(pathname) {
      const normalized = pathname === "/" ? "/" : pathname.replace(/\/$/, "");
      return (
        routeMeta.get(normalized) || {
          priority: "0.7",
          changefreq: "daily",
        }
      );
    },
  };
}

async function generateSiteMap() {
  const lastmod = new Date().toISOString().slice(0, 10);
  const urls = await collectSitemapUrls();
  const routeMeta = buildRouteMeta();

  const entries = urls.map((loc) => {
    const pathname = new URL(loc).pathname;
    const meta = pathname.startsWith("/competition/")
      ? { priority: "0.8", changefreq: "daily" }
      : pathname.startsWith("/fixture/")
        ? { priority: "0.7", changefreq: "daily" }
        : routeMeta.forPath(pathname);

    return urlEntry(loc, {
      priority: meta.priority,
      changefreq: meta.changefreq,
      lastmod,
    });
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join("\n")}
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
