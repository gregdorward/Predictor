/**
 * Six-game strength ratings for homepage fixtures.
 * The full overview includes every match, so this returns only the figures.
 */

import { buildStrengthLookup } from "../../src/logic/strengthRankings";
import { fetchStrengthOverview } from "../../src/seo/serverFetch";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const overview = await fetchStrengthOverview({ timeoutMs: 8000 });
  if (!overview) {
    return res.status(404).json({ error: "Strength rankings not built yet" });
  }

  res.setHeader(
    "Cache-Control",
    "public, s-maxage=3600, stale-while-revalidate=86400"
  );
  return res.status(200).json(buildStrengthLookup(overview));
}
