import { fireEvent, render, screen } from "@testing-library/react";
import CompetitionCompareCharts from "./competitionCompareCharts";

jest.mock("../Chart", () => ({
  useChartTheme: () => "light",
  getChartColors: () => ({
    color: "#111",
    gridColor: "#ccc",
    tooltipBackground: "#000",
  }),
}));

jest.mock("../ShareableVisual", () => ({ children }) => <div>{children}</div>);
jest.mock("react-chartjs-2", () => ({
  Bar: () => <div data-testid="bar-chart" />,
  Scatter: () => <div data-testid="scatter-chart" />,
}));

const COMPETITIONS = [
  {
    id: 1,
    slug: "a",
    name: "League A",
    played: 50,
    total: 100,
    avgGoals: 3.2,
    btts: 65,
    over25: 70,
    cards: 4,
    corners: 10,
    homeWin: 45,
  },
  {
    id: 2,
    slug: "b",
    name: "League B",
    played: 48,
    total: 100,
    avgGoals: 2.8,
    btts: 55,
    over25: 60,
    cards: 3.5,
    corners: 9,
    homeWin: 40,
  },
  {
    id: 3,
    slug: "c",
    name: "League C",
    played: 52,
    total: 100,
    avgGoals: 3.5,
    btts: 70,
    over25: 75,
    cards: 4.2,
    corners: 11,
    homeWin: 42,
  },
  {
    id: 4,
    slug: "d",
    name: "League D",
    played: 46,
    total: 100,
    avgGoals: 2.5,
    btts: 48,
    over25: 50,
    cards: 3.8,
    corners: 8.5,
    homeWin: 38,
  },
];

describe("CompetitionCompareCharts", () => {
  it("renders style map with axis pickers and journey break", () => {
    render(<CompetitionCompareCharts competitions={COMPETITIONS} />);

    expect(screen.getByRole("heading", { name: "Style map" })).toBeInTheDocument();
    expect(screen.getByText("X axis")).toBeInTheDocument();
    expect(screen.getByText("Y axis")).toBeInTheDocument();
    expect(screen.getByTestId("scatter-chart")).toBeInTheDocument();
    expect(screen.getAllByTestId("style-map-legend").length).toBeGreaterThan(0);
    expect(screen.getAllByText("League A").length).toBeGreaterThan(0);
    expect(
      screen.getByText(/Switch axes on the style map/i)
    ).toBeInTheDocument();
  });

  it("shows compact league picker and toggles selection in popover", () => {
    render(<CompetitionCompareCharts competitions={COMPETITIONS} />);

    expect(screen.getByRole("button", { name: "Top 10" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "All leagues (4)" })
    ).toBeInTheDocument();
    expect(screen.getByText(/Showing 4 of 4 leagues on chart/)).toBeInTheDocument();
    expect(screen.getByTestId("style-map-league-bar")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Choose leagues/i }));

    const leagueB = screen.getByRole("option", { name: /League B/i });
    expect(leagueB).toHaveAttribute("aria-selected", "true");
    fireEvent.click(leagueB);
    expect(leagueB).toHaveAttribute("aria-selected", "false");
    expect(screen.getByText(/Showing 3 of 4 leagues on chart/)).toBeInTheDocument();
  });

  it("highlights a league on the chart when its legend entry is tapped", () => {
    render(<CompetitionCompareCharts competitions={COMPETITIONS} />);

    const leagueA = screen.getByRole("button", { name: /League A/i });
    expect(leagueA).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(leagueA);
    expect(leagueA).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(leagueA);
    expect(leagueA).toHaveAttribute("aria-pressed", "false");
  });
});
