import { render, within } from "@testing-library/react";
import FormContextCompare from "./FormContextCompare";

jest.mock("./CollapsableElement", () => {
  return function MockCollapsable({ element }) {
    return <div>{element}</div>;
  };
});

const sampleMetrics = {
  rest: {
    daysSinceLastMatch: 10,
    restLabel: "Long layoff",
    congestionLabel: "Light",
    matchesInLast7Days: 0,
    matchesInLast14Days: 1,
  },
  overUnder: { over25Last5Percentage: 60, over25Last10Percentage: 56 },
  strengthOfSchedule: {
    scheduleLabel: "Tougher recent schedule",
    avOppositionPPGLast5: 1.59,
    avOppositionPPGAll: 1.39,
    ppgVsTopHalf: 1.8,
    matchesVsTopHalf: 5,
    ppgVsBottomHalf: 1.2,
    matchesVsBottomHalf: 4,
  },
  gameState: {
    hasData: true,
    scoredFirstPercentage: 40,
    lateGoalsScoredPercentage: 20,
    firstHalfGoalsScoredPercentage: 30,
    secondHalfGoalsScoredPercentage: 50,
    pointsFromLosingPositions: 3,
    ppgFromLosingPositions: 0.5,
    trailedMatches: 6,
    pointsFromWinningPositions: 12,
    ppgFromWinningPositions: 2,
    ledMatches: 6,
  },
  scoringVariance: {
    varianceLabel: "Balanced",
    oneGoalGamePercentage: 35,
    blowoutPercentage: 10,
  },
};

describe("FormContextCompare", () => {
  it("renders metric rows with home and away values aligned", () => {
    const { getByRole } = render(
      <FormContextCompare
        homeTeam="Farnham Town"
        awayTeam="Truro City"
        homeMetrics={sampleMetrics}
        awayMetrics={sampleMetrics}
      />
    );

    const table = getByRole("table");
    expect(within(table).getByText("Rest days")).toBeTruthy();
    expect(within(table).getByText("Farnham Town")).toBeTruthy();
    expect(within(table).getByText("Truro City")).toBeTruthy();
    expect(within(table).getAllByText("60% / 56%").length).toBe(2);
  });
});
