import { SITE_URL } from "./pageMetaConfig";

const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";
const MAX_URLS_PER_REQUEST = 10_000;

function getIndexNowConfig() {
  const key = process.env.INDEXNOW_KEY;
  if (!key) return null;

  const host = new URL(SITE_URL).host;
  const keyLocation = `${SITE_URL}/${key}.txt`;

  return { host, key, keyLocation };
}

function normalizeUrlList(urlList) {
  return [...new Set(urlList)].filter((url) => url.startsWith(SITE_URL));
}

/**
 * Notify IndexNow participants (Bing, Yandex, etc.) about updated URLs.
 * Google does not use IndexNow; keep Search Console for Google.
 */
export async function pingIndexNow(urlList) {
  const config = getIndexNowConfig();
  if (!config) {
    return { ok: false, skipped: true, reason: "INDEXNOW_KEY not set" };
  }

  const urls = normalizeUrlList(urlList);
  if (urls.length === 0) {
    return { ok: false, skipped: true, reason: "no urls" };
  }

  const results = [];

  for (let offset = 0; offset < urls.length; offset += MAX_URLS_PER_REQUEST) {
    const batch = urls.slice(offset, offset + MAX_URLS_PER_REQUEST);
    const response = await fetch(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: config.host,
        key: config.key,
        keyLocation: config.keyLocation,
        urlList: batch,
      }),
    });

    const body = await response.text().catch(() => "");
    results.push({
      status: response.status,
      count: batch.length,
      body: body || null,
    });

    if (!response.ok && response.status !== 202) {
      return {
        ok: false,
        urlCount: urls.length,
        results,
        error: body || `IndexNow request failed (${response.status})`,
      };
    }
  }

  return { ok: true, urlCount: urls.length, results };
}
