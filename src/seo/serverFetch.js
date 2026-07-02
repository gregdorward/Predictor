const ORIGIN = process.env.NEXT_PUBLIC_EXPRESS_SERVER || "https://api.soccerstatshub.com/";

function originUrl(path) {
  const base = ORIGIN.endsWith("/") ? ORIGIN : `${ORIGIN}/`;
  return `${base}${String(path).replace(/^\//, "")}`;
}

export async function fetchCompetitionData(seasonId) {
  try {
    const response = await fetch(originUrl(`competition/${seasonId}`), {
      headers: { accept: "application/json" },
    });
    if (!response.ok) return null;
    const json = await response.json();
    if (!json?.success || !json?.data) return null;
    return json.data;
  } catch {
    return null;
  }
}

export async function fetchMatchSnapshot(matchId) {
  try {
    const response = await fetch(originUrl(`match/snapshot/${matchId}`), {
      headers: { accept: "application/json" },
    });
    if (!response.ok) return null;
    const json = await response.json();
    return json?.data ?? null;
  } catch {
    return null;
  }
}

export async function fetchMatchesForDate(dateStr) {
  const response = await fetch(originUrl(`matches/${dateStr}`), {
    headers: { accept: "application/json" },
  });
  if (!response.ok) return [];
  const json = await response.json();
  const list = Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : [];
  return list;
}

export function formatApiDate(date) {
  const d = date instanceof Date ? date : new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export async function fetchUpcomingFixtureIds(days = 3) {
  const ids = new Set();
  const today = new Date();

  for (let offset = 0; offset < days; offset += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() + offset);
    const dateStr = formatApiDate(date);
    const matches = await fetchMatchesForDate(dateStr);
    for (const match of matches) {
      if (match?.id != null) ids.add(String(match.id));
    }
  }

  return [...ids];
}
