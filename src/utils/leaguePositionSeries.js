/**
 * Build league-position-over-time series from completed league fixtures.
 */

const EMPTY = {
  labels: [],
  teams: [],
  positions: {},
  pointsByWeek: {},
  gdByWeek: {},
  playedByWeek: {},
  gfByWeek: {},
  gaByWeek: {},
  meta: {},
};

export function teamAbbreviation(name) {
  const parts = String(name || "T")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "T";
  if (parts.length === 1) {
    return parts[0].slice(0, 3).toUpperCase();
  }
  return parts
    .slice(0, 3)
    .map((part) => part[0] || "")
    .join("")
    .toUpperCase();
}

export function normalizeLeagueFixturesPayload(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.fixtures)) return payload.fixtures;
  return [];
}

function isCompleteFixture(fixture) {
  if (!fixture) return false;
  if (fixture.status === "complete") return true;
  // Cached shortened rows may omit status; accept rows with finite goal counts.
  if (fixture.status != null && fixture.status !== "") return false;
  return (
    Number.isFinite(Number(fixture.homeGoalCount)) &&
    Number.isFinite(Number(fixture.awayGoalCount)) &&
    Number(fixture.homeGoalCount) >= 0 &&
    Number(fixture.awayGoalCount) >= 0
  );
}

function hasValidGameWeek(fixture) {
  const gw = Number(fixture?.game_week);
  return Number.isFinite(gw) && gw > 0;
}

function dayKey(dateUnix) {
  const ts = Number(dateUnix);
  if (!Number.isFinite(ts) || ts <= 0) return null;
  const ms = ts > 1e12 ? ts : ts * 1000;
  return new Date(ms).toISOString().slice(0, 10);
}

function ensureTeam(stats, meta, name, badgePath) {
  if (!stats.has(name)) {
    stats.set(name, {
      played: 0,
      points: 0,
      gf: 0,
      ga: 0,
      gd: 0,
    });
  }
  if (!meta[name]) {
    meta[name] = {
      badgePath: badgePath || null,
      abbr: teamAbbreviation(name),
    };
  } else if (!meta[name].badgePath && badgePath) {
    meta[name].badgePath = badgePath;
  }
}

function applyResult(stats, teamName, scored, conceded) {
  const row = stats.get(teamName);
  if (!row) return;
  row.played += 1;
  row.gf += scored;
  row.ga += conceded;
  row.gd = row.gf - row.ga;
  if (scored > conceded) row.points += 3;
  else if (scored === conceded) row.points += 1;
}

function rankTeams(stats) {
  return [...stats.entries()]
    .map(([name, row]) => ({ name, ...row }))
    .sort(
      (a, b) =>
        b.points - a.points ||
        b.gd - a.gd ||
        b.gf - a.gf ||
        a.name.localeCompare(b.name)
    );
}

function snapshotPositions(stats, allTeamNames) {
  const ranked = rankTeams(stats);
  const positionByTeam = {};
  const pointsByTeam = {};
  const gdByTeam = {};
  const playedByTeam = {};
  const gfByTeam = {};
  const gaByTeam = {};

  let place = 0;
  for (const row of ranked) {
    place += 1;
    if (row.played > 0) {
      positionByTeam[row.name] = place;
      pointsByTeam[row.name] = row.points;
      gdByTeam[row.name] = row.gd;
      playedByTeam[row.name] = row.played;
      gfByTeam[row.name] = row.gf;
      gaByTeam[row.name] = row.ga;
    }
  }

  for (const name of allTeamNames) {
    if (!Object.prototype.hasOwnProperty.call(positionByTeam, name)) {
      const row = stats.get(name);
      positionByTeam[name] = null;
      pointsByTeam[name] = row?.points ?? 0;
      gdByTeam[name] = row?.gd ?? 0;
      playedByTeam[name] = row?.played ?? 0;
      gfByTeam[name] = row?.gf ?? 0;
      gaByTeam[name] = row?.ga ?? 0;
    }
  }

  return {
    positionByTeam,
    pointsByTeam,
    gdByTeam,
    playedByTeam,
    gfByTeam,
    gaByTeam,
  };
}

/**
 * @param {object[]} fixtures Raw FootyStats league-matches (or shortened cache rows)
 * @returns {{
 *   labels: string[],
 *   teams: string[],
 *   positions: Record<string, (number|null)[]>,
 *   pointsByWeek: Record<string, (number|null)[]>,
 *   gdByWeek: Record<string, (number|null)[]>,
 *   playedByWeek: Record<string, (number|null)[]>,
 *   gfByWeek: Record<string, (number|null)[]>,
 *   gaByWeek: Record<string, (number|null)[]>,
 *   meta: Record<string, { badgePath: string|null, abbr: string }>
 * }}
 */
export function buildLeaguePositionSeries(fixtures) {
  const completed = (fixtures || []).filter(isCompleteFixture);
  if (completed.length === 0) {
    return {
      ...EMPTY,
      positions: {},
      pointsByWeek: {},
      gdByWeek: {},
      playedByWeek: {},
      gfByWeek: {},
      gaByWeek: {},
      meta: {},
    };
  }

  const useGameWeek = completed.filter(hasValidGameWeek).length >= completed.length * 0.5;

  /** @type {Map<string|number, object>} */
  const buckets = new Map();

  for (const fixture of completed) {
    let key;
    let label;
    if (useGameWeek && hasValidGameWeek(fixture)) {
      key = Number(fixture.game_week);
      label = `GW${key}`;
    } else {
      const day = dayKey(fixture.date_unix);
      if (!day) continue;
      key = day;
      label = day;
    }

    if (!buckets.has(key)) {
      buckets.set(key, { key, label, fixtures: [] });
    }
    buckets.get(key).fixtures.push(fixture);
  }

  const orderedBuckets = [...buckets.values()].sort((a, b) => {
    if (typeof a.key === "number" && typeof b.key === "number") {
      return a.key - b.key;
    }
    return String(a.key).localeCompare(String(b.key));
  });

  // Within each bucket, apply matches chronologically
  for (const bucket of orderedBuckets) {
    bucket.fixtures.sort(
      (a, b) => Number(a.date_unix || 0) - Number(b.date_unix || 0)
    );
  }

  if (orderedBuckets.length < 2) {
    return {
      ...EMPTY,
      positions: {},
      pointsByWeek: {},
      gdByWeek: {},
      playedByWeek: {},
      gfByWeek: {},
      gaByWeek: {},
      meta: {},
    };
  }

  const stats = new Map();
  const meta = {};
  const allTeamNames = new Set();

  // Discover all teams up front for stable series length
  for (const fixture of completed) {
    if (fixture.home_name) allTeamNames.add(fixture.home_name);
    if (fixture.away_name) allTeamNames.add(fixture.away_name);
  }

  const teamList = [...allTeamNames].sort((a, b) => a.localeCompare(b));
  if (teamList.length < 4) {
    return {
      ...EMPTY,
      positions: {},
      pointsByWeek: {},
      gdByWeek: {},
      playedByWeek: {},
      gfByWeek: {},
      gaByWeek: {},
      meta: {},
    };
  }

  const labels = [];
  const positions = Object.fromEntries(teamList.map((name) => [name, []]));
  const pointsByWeek = Object.fromEntries(teamList.map((name) => [name, []]));
  const gdByWeek = Object.fromEntries(teamList.map((name) => [name, []]));
  const playedByWeek = Object.fromEntries(teamList.map((name) => [name, []]));
  const gfByWeek = Object.fromEntries(teamList.map((name) => [name, []]));
  const gaByWeek = Object.fromEntries(teamList.map((name) => [name, []]));

  for (const bucket of orderedBuckets) {
    for (const fixture of bucket.fixtures) {
      const home = fixture.home_name;
      const away = fixture.away_name;
      if (!home || !away) continue;

      const homeGoals = Number(fixture.homeGoalCount);
      const awayGoals = Number(fixture.awayGoalCount);
      if (!Number.isFinite(homeGoals) || !Number.isFinite(awayGoals)) continue;

      const homeBadge = fixture.home_image || fixture.homeBadge || null;
      const awayBadge = fixture.away_image || fixture.awayBadge || null;

      ensureTeam(stats, meta, home, homeBadge);
      ensureTeam(stats, meta, away, awayBadge);
      applyResult(stats, home, homeGoals, awayGoals);
      applyResult(stats, away, awayGoals, homeGoals);
    }

    // Ensure meta exists for every known team even if not in this bucket
    for (const name of teamList) {
      ensureTeam(stats, meta, name, null);
    }

    const {
      positionByTeam,
      pointsByTeam,
      gdByTeam,
      playedByTeam,
      gfByTeam,
      gaByTeam,
    } = snapshotPositions(stats, teamList);

    labels.push(bucket.label);
    for (const name of teamList) {
      const placed = positionByTeam[name] != null;
      positions[name].push(positionByTeam[name]);
      pointsByWeek[name].push(placed ? pointsByTeam[name] : null);
      gdByWeek[name].push(placed ? gdByTeam[name] : null);
      playedByWeek[name].push(placed ? playedByTeam[name] : null);
      gfByWeek[name].push(placed ? gfByTeam[name] : null);
      gaByWeek[name].push(placed ? gaByTeam[name] : null);
    }
  }

  return {
    labels,
    teams: teamList,
    positions,
    pointsByWeek,
    gdByWeek,
    playedByWeek,
    gfByWeek,
    gaByWeek,
    meta,
  };
}

/**
 * Ranked standings rows for a single week.
 * movement = places gained vs position `lookback` weeks earlier (default 3).
 * Positive rose, negative fell, 0 unchanged / not enough history.
 */
export const STANDINGS_MOVEMENT_LOOKBACK = 3;

export function getStandingsRowsForWeek(
  series,
  weekIndex,
  lookback = STANDINGS_MOVEMENT_LOOKBACK
) {
  if (!series?.teams?.length || !series.labels?.length) return [];

  const maxWeek = series.labels.length - 1;
  const week = Math.max(0, Math.min(Number(weekIndex) || 0, maxWeek));
  const window = Math.max(1, Number(lookback) || STANDINGS_MOVEMENT_LOOKBACK);
  const compareWeek = Math.max(0, week - window);

  const rows = [];
  for (const team of series.teams) {
    const position = series.positions?.[team]?.[week];
    if (position == null) continue;

    const comparePosition =
      week === 0 || compareWeek === week
        ? null
        : series.positions?.[team]?.[compareWeek];
    const movement =
      comparePosition != null && Number.isFinite(comparePosition)
        ? comparePosition - position
        : 0;

    rows.push({
      team,
      abbr: series.meta?.[team]?.abbr || teamAbbreviation(team),
      badgePath: series.meta?.[team]?.badgePath || null,
      position,
      comparePosition,
      compareWeek,
      movementLookback: week - compareWeek,
      movement,
      points: series.pointsByWeek?.[team]?.[week] ?? 0,
      gd: series.gdByWeek?.[team]?.[week] ?? 0,
      played: series.playedByWeek?.[team]?.[week] ?? 0,
      gf: series.gfByWeek?.[team]?.[week] ?? 0,
      ga: series.gaByWeek?.[team]?.[week] ?? 0,
    });
  }

  return rows.sort(
    (a, b) =>
      a.position - b.position ||
      b.points - a.points ||
      a.team.localeCompare(b.team)
  );
}
