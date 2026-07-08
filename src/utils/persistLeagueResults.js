/**
 * Atomically replace the shared league results blob in S3 (Express PUT /results).
 * Do not DELETE before upload - a failed POST after DELETE leaves GET /results 404.
 */
export async function persistLeagueResults(expressServerOrigin, payload) {
  return fetch(`${expressServerOrigin}results`, {
    method: "PUT",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}
