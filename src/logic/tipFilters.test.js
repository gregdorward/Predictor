import {
  applyFilterPreset,
  applyHighEdgeFlag,
  applyMinTipOddsFilter,
  applyTipFilters,
  createDefaultTipFilters,
  getTipped1X2Edge,
  getTipped1X2Odds,
  GlobalFilters,
  hasActiveTipFilters,
  resetTipFilters,
} from "./tipFilters";
import {
  applyMinTipOddsFromEnv,
  getMinTipOdds,
  resetMinTipOdds,
  setMinTipOdds,
} from "./scoreModelConfig";

describe("tipFilters", () => {
  afterEach(() => {
    resetTipFilters();
    resetMinTipOdds();
  });

  test("ssh preset matches site customise-tips defaults", () => {
    applyFilterPreset("ssh");
    expect(GlobalFilters.minimumGDHorA).toBe(5);
    expect(GlobalFilters.minimumXG).toBe(2);
    expect(GlobalFilters.oddsRange).toEqual([1.2, 10]);
    expect(hasActiveTipFilters()).toBe(true);
  });

  test("applyTipFilters omits home win below edge threshold", () => {
    applyFilterPreset("value_seekers");
    const match = {
      omit: false,
      winValue: 5,
      O25Value: 10,
      BTTSValue: 10,
      goalDiffHomeOrAwayComparison: 20,
      goalDifferenceComparison: 20,
      homeWinProbability: 70,
      over25Probability: 70,
      bttsYesProbability: 70,
      homeOdds: 2,
    };

    applyTipFilters(match, {
      finalHomeGoals: 2,
      finalAwayGoals: 1,
      xgDiffHomePerspective: 3,
      xgDiffAwayPerspective: 3,
      last6PointDiffHomePerspective: 10,
      last6PointDiffAwayPerspective: 10,
      filters: GlobalFilters,
    });

    expect(match.omit).toBe(true);
  });

  test("applyHighEdgeFlag marks suspiciously high 1X2 edge without omitting", () => {
    const match = {
      omit: false,
      winValue: "25.50",
      drawValue: "5",
      O25Value: 10,
      BTTSValue: 10,
      goalDiffHomeOrAwayComparison: 20,
      goalDifferenceComparison: 20,
      homeWinProbability: 70,
      over25Probability: 70,
      bttsYesProbability: 70,
      homeOdds: 2,
    };

    applyHighEdgeFlag(match, {
      finalHomeGoals: 2,
      finalAwayGoals: 1,
      maxEdge: 20,
    });

    expect(getTipped1X2Edge(match, 2, 1)).toBe(25.5);
    expect(match.highEdgeFlag).toBe(true);
    expect(match.omit).toBe(false);
  });

  test("applyMinTipOddsFilter omits tips shorter than the floor", () => {
    setMinTipOdds(1.5);
    const match = {
      omit: false,
      homeOdds: 1.25,
      awayOdds: 8,
      drawOdds: 4,
    };
    applyMinTipOddsFilter(match, { finalHomeGoals: 2, finalAwayGoals: 0 });
    expect(getTipped1X2Odds(match, 2, 0)).toBe(1.25);
    expect(match.omit).toBe(true);
  });

  test("applyMinTipOddsFilter leaves longer odds alone", () => {
    setMinTipOdds(1.5);
    const match = {
      omit: false,
      homeOdds: 1.8,
      awayOdds: 4,
      drawOdds: 3.5,
    };
    applyMinTipOddsFilter(match, { finalHomeGoals: 2, finalAwayGoals: 0 });
    expect(match.omit).toBe(false);
  });

  test("MIN_TIP_ODDS env enables and disables the floor", () => {
    applyMinTipOddsFromEnv({ MIN_TIP_ODDS: "1.6" });
    expect(getMinTipOdds()).toBe(1.6);
    applyMinTipOddsFromEnv({ MIN_TIP_ODDS: "0" });
    expect(getMinTipOdds()).toBeNull();
  });

  test("inactive filters do not omit matches", () => {
    const match = { omit: false, winValue: 0 };
    applyTipFilters(match, {
      finalHomeGoals: 2,
      finalAwayGoals: 1,
      xgDiffHomePerspective: 0,
      xgDiffAwayPerspective: 0,
      last6PointDiffHomePerspective: 0,
      last6PointDiffAwayPerspective: 0,
      filters: createDefaultTipFilters(),
    });
    expect(match.omit).toBe(false);
  });
});
