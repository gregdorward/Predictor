import { apiGetUrl } from "./apiUrl";

/** FootyStats / form cache key format: MMDDYYYY (no zero-padding). */
export function toFormDateKeyFromIso(isoDate) {
  const [year, month, day] = String(isoDate).split("-").map(Number);
  if (!year || !month || !day) {
    return null;
  }
  return `${month}${day}${year}`;
}

/**
 * Prefer a dated league-averages snapshot (point-in-time safe), then fall back
 * to the latest global cache.
 */
export async function fetchLeagueAveragesForDate(formDateKey) {
  if (formDateKey) {
    try {
      const datedResponse = await fetch(
        apiGetUrl(`league-averages/${formDateKey}`)
      );
      if (datedResponse.ok) {
        const dated = await datedResponse.json();
        if (Array.isArray(dated) && dated.length > 0) {
          return dated;
        }
      }
    } catch (error) {
      console.warn(
        `Dated league averages unavailable for ${formDateKey}:`,
        error
      );
    }
  }

  const globalResponse = await fetch(apiGetUrl("league-averages"));
  if (!globalResponse.ok) {
    throw new Error(`Failed to load league averages (${globalResponse.status}).`);
  }

  return globalResponse.json();
}
