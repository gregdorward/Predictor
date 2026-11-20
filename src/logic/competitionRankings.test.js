import {
  buildCompetitionTeamMetrics,
  otherTeamValues,
  rankAmong,
} from "./competitionRankings";

const KICKOFF = 2_000_000_000;
const DAY = 86400;

function result(home, away, homeGoals, awayGoals, daysAgo, possession = [50, 50]) {
  return {
    status: "complete",
    home_name: home,
    away_name: away,
    homeGoalCount: homeGoals,
    awayGoalCount: awayGoals,
    date_unix: KICKOFF - daysAgo * DAY,
    team_a_possession: possession[0],
    team_b_possession: possession[1],
  };
}

// A beats everyone at home, B draws every game, C and D lose away.
const FIXTURES = [
  result("A", "B", 2, 0, 20, [60, 40]),
  result("A", "C", 1, 0, 18, [55, 45]),
  result("A", "D", 3, 1, 16, [65, 35]),
  result("B", "C", 1, 1, 14),
  result("B", "D", 0, 0, 12),
  result("C", "D", 2, 2, 10),
  result("D", "A", 0, 1, 8, [-1, -1]),
  result("C", "B", 1, 1, 6),
  result("D", "B", 0, 0, 4),
  result("C", "A", 0, 0, 2, [40, 60]),
];

describe("buildCompetitionTeamMetrics", () => {
  const byName = (name) =>
    buildCompetitionTeamMetrics(FIXTURES, KICKOFF).find((team) => team.name === name);

  test("returns null with too few completed fixtures", () => {
    expect(buildCompetitionTeamMetrics(FIXTURES.slice(1), KICKOFF)).toBeNull();
  });

  test("works out season, venue and recent PPG for each team", () => {
    const a = byName("A");
    expect(a.ppg).toBeCloseTo(13 / 5);
    expect(a.ppgHomeLast6).toBe(3);
    expect(a.ppgAwayLast6).toBe(2);
    expect(a.ppgLast5).toBeCloseTo(13 / 5);
  });

  test("divides form trend PPG by the window size", () => {
    expect(byName("A").ppgTrend10).toBeCloseTo(13 / 10);
    expect(byName("A").ppgTrend6).toBeCloseTo(13 / 6);
  });

  test("skips missing possession rather than counting it as zero", () => {
    expect(byName("A").possessionAway).toBe(60);
  });
});

describe("rankAmong", () => {
  test("ranks highest first and counts the team itself", () => {
    expect(rankAmong(1.5, [2, 1, 0.5])).toEqual({ rank: 2, tied: false, of: 4 });
  });

  test("marks ties and shares the place", () => {
    expect(rankAmong(1, [2, 1, 1, 0.5])).toEqual({ rank: 2, tied: true, of: 5 });
  });

  test("compares at displayed precision so 1.33 ties with 4/3", () => {
    const teams = [
      { name: "A", ppg: 4 / 3 },
      { name: "B", ppg: 2 },
    ];
    expect(rankAmong("1.33", otherTeamValues(teams, "C", "ppg"))).toEqual({
      rank: 2,
      tied: true,
      of: 3,
    });
  });

  test("leaves out the team being ranked", () => {
    const teams = [
      { name: "Sheffield Wednesday", ppg: 1 },
      { name: "Barnsley", ppg: 2 },
    ];
    expect(otherTeamValues(teams, "Sheffield Wednesday", "ppg")).toEqual([2]);
  });

  test("returns null without a value or other teams", () => {
    expect(rankAmong("-", [1])).toBeNull();
    expect(rankAmong(1, [])).toBeNull();
  });
});
