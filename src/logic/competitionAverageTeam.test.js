jest.mock("./getFixtures", () => ({ allForm: [], allLeagueResultsArrayOfObjects: [] }));
jest.mock("./getScorePredictions", () => ({ clicked: false }));
jest.mock("./authProvider", () => ({ userDetail: null }));
jest.mock("./hasUserPaid", () => ({ checkUserPaidStatus: jest.fn() }));
jest.mock("./compareFormTrend", () => jest.fn());
jest.mock("../utils/render", () => ({ render: jest.fn() }));

import { buildCompetitionAverageTeam } from "./competitionAverageTeam";
import { buildCompetitionAverageRadar } from "./competitionAverageRadar";
import {
  calculateAttackingStrength,
  calculateMetricStrength,
} from "./getStats";

const KICKOFF = 2_000_000_000;

function fixture(overrides = {}) {
  return {
    status: "complete",
    date_unix: KICKOFF - 7 * 86400,
    homeGoalCount: 2,
    awayGoalCount: 0,
    team_a_xg: 1.8,
    team_b_xg: 0.6,
    team_a_shots: 16,
    team_b_shots: 8,
    team_a_shotsOnTarget: 6,
    team_b_shotsOnTarget: 2,
    team_a_dangerous_attacks: 60,
    team_b_dangerous_attacks: 40,
    team_a_possession: 60,
    team_b_possession: 40,
    team_a_corners: 7,
    team_b_corners: 3,
    team_a_red_cards: 0,
    team_b_red_cards: 1,
    pens_recorded: 1,
    team_a_penalties_won: 0,
    team_b_penalties_won: 0,
    ...overrides,
  };
}

const tenFixtures = (overrides) => Array.from({ length: 10 }, () => fixture(overrides));

describe("buildCompetitionAverageTeam", () => {
  test("returns null before enough fixtures are complete", () => {
    expect(buildCompetitionAverageTeam(tenFixtures().slice(1), KICKOFF)).toBeNull();
  });

  test("ignores fixtures from the day before kickoff onwards and incomplete ones", () => {
    const fixtures = [
      ...tenFixtures().slice(1),
      fixture({ date_unix: KICKOFF - 3600 }),
      fixture({ status: "incomplete" }),
    ];
    expect(buildCompetitionAverageTeam(fixtures, KICKOFF)).toBeNull();
  });

  test("averages both sides overall and keeps venue splits", () => {
    const team = buildCompetitionAverageTeam(tenFixtures(), KICKOFF);

    expect(team.fixtureCount).toBe(10);
    expect(team.overall).toMatchObject({
      scored: 1,
      conceded: 1,
      xg: expect.closeTo(1.2),
      xgAgainst: expect.closeTo(1.2),
      shots: 12,
      sot: 4,
      corners: 5,
      redCards: 0.5,
      points: 1.5,
      cleanSheet: 50,
    });
    expect(team.home).toMatchObject({
      scored: 2,
      conceded: 0,
      xgAgainst: expect.closeTo(0.6),
      sotAgainst: 2,
      cleanSheet: 100,
    });
    expect(team.away).toMatchObject({ scored: 0, conceded: 2, points: 0, redCards: 1 });
  });

  test("treats missing provider values as gaps, not zeros", () => {
    const team = buildCompetitionAverageTeam(
      [...tenFixtures().slice(1), fixture({ team_a_shots: -1, team_a_corners: -1 })],
      KICKOFF
    );
    expect(team.home.shots).toBe(16);
    expect(team.home.corners).toBe(7);
  });
});

describe("buildCompetitionAverageRadar", () => {
  test("returns null without an average team", async () => {
    expect(await buildCompetitionAverageRadar(null)).toBeNull();
  });

  test("rates the average team on every radar axis", async () => {
    const radar = await buildCompetitionAverageRadar(
      buildCompetitionAverageTeam(tenFixtures(), KICKOFF)
    );

    expect(radar.overall).toHaveLength(7);
    expect(radar.last5.slice(2)).toEqual(radar.overall.slice(2));

    const expectedAttack = await calculateAttackingStrength({
      "Average Dangerous Attacks": 50,
      "Average Shots": 12,
      "Average Shots On Target": 4,
      "Average Expected Goals": 1.2,
      "Weighted XG": 1.2,
      "Average Goals": 1,
      "Expected Points": 1.5,
    });
    expect(radar.overall[0]).toBe(expectedAttack);
    expect(radar.overall[2]).toBe(await calculateMetricStrength("averagePossession", 50));
    expect(radar.overall[3]).toBe(await calculateMetricStrength("xgFor", 1.2));
    expect(radar.overall[4]).toBe(await calculateMetricStrength("xgAgainst", 1.8));
    expect(radar.overall[5]).toBe(
      await calculateMetricStrength("directnessOverall", (12 / 50) * 10)
    );
    expect(radar.overall[6]).toBe(
      await calculateMetricStrength("accuracyOverall", (1.2 / 12) * 100 * 1)
    );
  });

  test("removes penalty xG for the attack rating but not the XGF axis", async () => {
    const withPens = await buildCompetitionAverageRadar(
      buildCompetitionAverageTeam(tenFixtures({ team_a_penalties_won: 1 }), KICKOFF)
    );
    const withoutPens = await buildCompetitionAverageRadar(
      buildCompetitionAverageTeam(tenFixtures(), KICKOFF)
    );
    expect(withPens.overall[3]).toBe(await calculateMetricStrength("xgFor", 1.2));
    expect(withPens.overall[0]).toBeLessThan(withoutPens.overall[0]);
  });
});
