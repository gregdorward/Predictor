import {
  buildLeaguePositionSeries,
  getStandingsRowsForWeek,
  normalizeLeagueFixturesPayload,
  teamAbbreviation,
} from "./leaguePositionSeries";

function fixture({
  home,
  away,
  hg,
  ag,
  gw,
  date = 1700000000,
  status = "complete",
  homeImage,
  awayImage,
}) {
  return {
    home_name: home,
    away_name: away,
    homeGoalCount: hg,
    awayGoalCount: ag,
    game_week: gw,
    date_unix: date,
    status,
    home_image: homeImage,
    away_image: awayImage,
  };
}

describe("teamAbbreviation", () => {
  test("uses first three letters for a single-word name", () => {
    expect(teamAbbreviation("Arsenal")).toBe("ARS");
  });

  test("uses initials for multi-word names", () => {
    expect(teamAbbreviation("Manchester United")).toBe("MU");
    expect(teamAbbreviation("Brighton and Hove")).toBe("BAH");
  });
});

describe("normalizeLeagueFixturesPayload", () => {
  test("accepts raw arrays and FootyStats wrappers", () => {
    const rows = [{ id: 1 }];
    expect(normalizeLeagueFixturesPayload(rows)).toEqual(rows);
    expect(normalizeLeagueFixturesPayload({ data: rows })).toEqual(rows);
    expect(normalizeLeagueFixturesPayload({ fixtures: rows })).toEqual(rows);
    expect(normalizeLeagueFixturesPayload(null)).toEqual([]);
  });
});

describe("buildLeaguePositionSeries", () => {
  test("ranks by points then goal difference across gameweeks", () => {
    const fixtures = [
      fixture({
        home: "Alpha",
        away: "Bravo",
        hg: 2,
        ag: 0,
        gw: 1,
        date: 100,
        homeImage: "teams/alpha.png",
        awayImage: "teams/bravo.png",
      }),
      fixture({
        home: "Charlie",
        away: "Delta",
        hg: 1,
        ag: 1,
        gw: 1,
        date: 101,
        homeImage: "teams/charlie.png",
        awayImage: "teams/delta.png",
      }),
      fixture({
        home: "Bravo",
        away: "Charlie",
        hg: 3,
        ag: 0,
        gw: 2,
        date: 200,
      }),
      fixture({
        home: "Delta",
        away: "Alpha",
        hg: 0,
        ag: 1,
        gw: 2,
        date: 201,
      }),
    ];

    const series = buildLeaguePositionSeries(fixtures);

    expect(series.labels).toEqual(["GW1", "GW2"]);
    expect(series.teams).toEqual(["Alpha", "Bravo", "Charlie", "Delta"]);

    // GW1: Alpha 3pts +2gd, Charlie/Delta 1pt 0gd (Charlie first by name? Charlie GF1, Delta GF1 - Charlie before Delta by name), Bravo 0
    // Rank: Alpha(3,+2), Charlie(1,0,1), Delta(1,0,1), Bravo(0,-2)
    // Charlie vs Delta: same points, gd, gf → name: Charlie before Delta, so Charlie 2, Delta 3
    expect(series.positions.Alpha[0]).toBe(1);
    expect(series.positions.Charlie[0]).toBe(2);
    expect(series.positions.Delta[0]).toBe(3);
    expect(series.positions.Bravo[0]).toBe(4);

    // GW2: Alpha 6pts, Bravo 3pts +1gd, Charlie 1pt, Delta 1pt -1gd
    // Alpha beat Delta → Alpha 6 (+3gd), Bravo beat Charlie → Bravo 3 (+1gd), Charlie 1 (-3gd), Delta 1 (-1gd)
    // Delta has better GD than Charlie so Delta 3rd, Charlie 4th
    expect(series.positions.Alpha[1]).toBe(1);
    expect(series.positions.Bravo[1]).toBe(2);
    expect(series.positions.Delta[1]).toBe(3);
    expect(series.positions.Charlie[1]).toBe(4);

    expect(series.meta.Alpha.badgePath).toBe("teams/alpha.png");
    expect(series.meta.Alpha.abbr).toBe("ALP");
    expect(series.pointsByWeek.Alpha[1]).toBe(6);
  });

  test("getStandingsRowsForWeek uses rolling 3-gameweek movement", () => {
    // Build 4 weeks so lookback of 3 can compare week 4 (index 3) to week 1 (index 0).
    const fixtures = [
      fixture({ home: "Alpha", away: "Bravo", hg: 1, ag: 0, gw: 1, date: 100 }),
      fixture({ home: "Charlie", away: "Delta", hg: 1, ag: 0, gw: 1, date: 101 }),
      fixture({ home: "Alpha", away: "Charlie", hg: 1, ag: 0, gw: 2, date: 200 }),
      fixture({ home: "Bravo", away: "Delta", hg: 0, ag: 1, gw: 2, date: 201 }),
      fixture({ home: "Bravo", away: "Alpha", hg: 2, ag: 0, gw: 3, date: 300 }),
      fixture({ home: "Delta", away: "Charlie", hg: 1, ag: 0, gw: 3, date: 301 }),
      fixture({ home: "Bravo", away: "Charlie", hg: 1, ag: 0, gw: 4, date: 400 }),
      fixture({ home: "Delta", away: "Alpha", hg: 0, ag: 0, gw: 4, date: 401 }),
    ];

    const series = buildLeaguePositionSeries(fixtures);
    expect(series.labels).toHaveLength(4);

    const week4 = getStandingsRowsForWeek(series, 3, 3);
    const bravo = week4.find((row) => row.team === "Bravo");
    const week1Pos = series.positions.Bravo[0];
    const week4Pos = series.positions.Bravo[3];
    expect(bravo.compareWeek).toBe(0);
    expect(bravo.movement).toBe(week1Pos - week4Pos);
    expect(bravo.movementLookback).toBe(3);
  });

  test("ignores incomplete fixtures and returns empty when under thresholds", () => {
    expect(
      buildLeaguePositionSeries([
        fixture({ home: "A", away: "B", hg: 1, ag: 0, gw: 1, status: "incomplete" }),
      ]).labels
    ).toEqual([]);

    expect(
      buildLeaguePositionSeries([
        fixture({ home: "A", away: "B", hg: 1, ag: 0, gw: 1 }),
        fixture({ home: "C", away: "D", hg: 0, ag: 0, gw: 1 }),
      ]).labels
    ).toEqual([]);
  });

  test("falls back to date buckets when game_week is missing", () => {
    const fixtures = [
      fixture({ home: "A", away: "B", hg: 1, ag: 0, gw: -1, date: 1_700_000_000 }),
      fixture({ home: "C", away: "D", hg: 0, ag: 2, gw: -1, date: 1_700_000_100 }),
      fixture({ home: "B", away: "C", hg: 0, ag: 0, gw: -1, date: 1_700_086_400 }),
      fixture({ home: "D", away: "A", hg: 1, ag: 1, gw: -1, date: 1_700_086_500 }),
    ];

    const series = buildLeaguePositionSeries(fixtures);
    expect(series.labels.length).toBeGreaterThanOrEqual(2);
    expect(series.teams).toHaveLength(4);
  });
});
