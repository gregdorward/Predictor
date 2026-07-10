import { pingIndexNow } from "../../src/seo/indexNow";
import { collectSitemapUrls } from "../../src/seo/sitemapUrls";

function isAuthorized(req) {
  const secret = (process.env.CRON_SECRET || process.env.INDEXNOW_CRON_SECRET)?.trim();
  if (!secret) return { ok: false, reason: "missing_secret" };

  const bearer = req.headers.authorization?.replace(/^Bearer\s+/i, "").trim();
  const querySecret =
    typeof req.query.secret === "string" ? req.query.secret.trim() : null;

  if (bearer === secret || querySecret === secret) {
    return { ok: true };
  }

  return { ok: false, reason: "invalid_secret" };
}

export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const auth = isAuthorized(req);
  if (!auth.ok) {
    if (auth.reason === "missing_secret") {
      return res.status(503).json({
        error: "CRON_SECRET is not configured on this deployment",
      });
    }
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const urls = await collectSitemapUrls();
    const result = await pingIndexNow(urls);

    if (result.skipped) {
      return res.status(200).json(result);
    }

    return res.status(result.ok ? 200 : 502).json(result);
  } catch (error) {
    console.error("IndexNow ping failed:", error);
    return res.status(500).json({ error: error.message || "IndexNow ping failed" });
  }
}
