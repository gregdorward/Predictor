import { render, screen } from "@testing-library/react";
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
    expect(
      screen.getByText(/Switch axes on the style map/i)
    ).toBeInTheDocument();
  });
});
