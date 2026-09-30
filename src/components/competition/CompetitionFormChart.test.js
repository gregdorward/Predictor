import { sortTeamsByLastFive } from "./competitionFormChartUtils.js";

describe("sortTeamsByLastFive", () => {
  test("orders by last-five points then goal difference", () => {
    const teams = [
      { Name: "A", LastXPoints: 6, GoalDifference: 2 },
      { Name: "B", LastXPoints: 9, GoalDifference: -1 },
      { Name: "C", LastXPoints: 6, GoalDifference: 5 },
    ];

    const sorted = sortTeamsByLastFive(teams).map((t) => t.Name);
    expect(sorted).toEqual(["B", "C", "A"]);
  });
});
