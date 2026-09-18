const NAME_SKIP_WORDS = new Set([
  "fc",
  "cf",
  "afc",
  "sc",
  "ac",
  "as",
  "fk",
  "sk",
  "bk",
  "if",
  "cd",
  "ud",
  "sd",
  "rcd",
  "us",
  "ss",
  "calcio",
  "club",
  "de",
  "da",
  "do",
  "del",
  "della",
  "la",
  "el",
  "the",
  "and",
  "of",
  "united",
]);

const FOOTYSTATS_IMAGE_BASE = "https://cdn.footystats.org/img/";

function significantWords(name) {
  const words = String(name || "")
    .replace(/[^a-zA-Z0-9\s'-]/g, " ")
    .split(/[\s'-]+/)
    .filter(Boolean);

  const significant = words.filter(
    (word) => !NAME_SKIP_WORDS.has(word.toLowerCase())
  );
  return significant.length > 0 ? significant : words;
}

/** Compact on-chart label; tooltip still shows the full name. */
export function abbreviateTeamName(name) {
  if (!name) return "";
  const pool = significantWords(name);

  if (pool.length === 0) return "";
  if (pool.length === 1) {
    return pool[0].slice(0, 3).toUpperCase();
  }
  if (pool.length === 2) {
    const a = pool[0];
    const b = pool[1];
    if (a.length <= 3) {
      return `${a.slice(0, 3)}${b[0]}`.toUpperCase();
    }
    return `${a[0]}${b[0]}${b[1] || ""}`.toUpperCase().slice(0, 3);
  }
  return pool
    .slice(0, 3)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function disambiguateAbbreviation(name, used) {
  const pool = significantWords(name);
  const first = pool[0] || String(name || "");
  const max = Math.min(5, first.length);
  for (let n = 3; n <= max; n += 1) {
    const candidate = first.slice(0, n).toUpperCase();
    if (!used.has(candidate)) return candidate;
  }
  const base = first.slice(0, 3).toUpperCase() || "TM";
  let suffix = 2;
  while (used.has(`${base}${suffix}`)) suffix += 1;
  return `${base}${suffix}`;
}

/** Unique 3-letter labels so Birmingham City and Bristol City are not both BCI. */
export function uniqueTeamAbbreviations(names) {
  const list = (names || []).filter(Boolean);
  const assigned = new Map();
  const used = new Set();
  const groups = new Map();

  for (const name of list) {
    const abbr = abbreviateTeamName(name);
    if (!groups.has(abbr)) groups.set(abbr, []);
    groups.get(abbr).push(name);
  }

  for (const [abbr, group] of groups) {
    if (group.length === 1 && !used.has(abbr)) {
      assigned.set(group[0], abbr);
      used.add(abbr);
      continue;
    }
    for (const name of group) {
      const unique = disambiguateAbbreviation(name, used);
      assigned.set(name, unique);
      used.add(unique);
    }
  }

  return assigned;
}

export function normalizeTeamKey(name) {
  return String(name || "")
    .toLowerCase()
    .replace(/\b(fc|cf|afc|sc|ac)\b/g, " ")
    .replace(/[^a-z0-9]+/g, "");
}

export function resolveTeamBadgeUrl(path) {
  if (!path || path === "-") return null;
  const value = String(path).trim();
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  return `${FOOTYSTATS_IMAGE_BASE}${value.replace(/^\//, "")}`;
}

function rememberBadge(map, name, path) {
  if (!name || !path || path === "-") return;
  if (!map.has(name)) map.set(name, path);
  const key = normalizeTeamKey(name);
  if (key && !map.has(key)) map.set(key, path);
}

export function lookupBadgePath(map, name) {
  if (!map || !name) return null;
  return map.get(name) || map.get(normalizeTeamKey(name)) || null;
}

export function addFixtureBadges(map, fixtures) {
  for (const fixture of fixtures || []) {
    rememberBadge(
      map,
      fixture?.home_name,
      fixture?.home_image || fixture?.homeBadge || fixture?.home_image_path
    );
    rememberBadge(
      map,
      fixture?.away_name,
      fixture?.away_image || fixture?.awayBadge || fixture?.away_image_path
    );
  }
  return map;
}

export function addCompetitionTeamBadges(map, teams) {
  for (const team of teams || []) {
    const name = team?.name || team?.cleanName || team?.english_name;
    const path =
      team?.image ||
      team?.image_path ||
      team?.badge ||
      team?.badgePath ||
      team?.logo;
    rememberBadge(map, name, path);
    if (team?.cleanName) rememberBadge(map, team.cleanName, path);
    if (team?.english_name) rememberBadge(map, team.english_name, path);
  }
  return map;
}

export function mergeBadgeMaps(primary, secondary) {
  const merged = new Map(primary || []);
  for (const [key, value] of secondary || []) {
    if (!merged.has(key)) merged.set(key, value);
  }
  return merged;
}
