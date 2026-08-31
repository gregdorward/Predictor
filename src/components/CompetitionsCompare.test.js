import { render, screen, fireEvent } from "@testing-library/react";
import CompetitionsCompare from "./CompetitionsCompare";

jest.mock("./SiteHeader", () => ({ children }) => <div>{children}</div>);

// The charts are client-only and covered by their own test.
jest.mock("next/dynamic", () => () => () => <div data-testid="charts" />);

const OVERVIEW = {
  generatedAt: "2026-08-30T05:30:00.000Z",
  minMatches: 10,
  lowSampleMatches: 30,
  competitions: [
    {
      slug: "high",
      name: "High Scoring",
      country: "Netherlands",
      played: 60,
      total: 306,
      avgGoals: 3.5,
      btts: 70,
      cards: 2.5,
    },
    {
      slug: "mid",
      name: "Mid Table",
      country: "England",
      played: 45,
      total: 380,
      avgGoals: 2.7,
      btts: 55,
      cards: 4.5,
    },
    {
      slug: "fresh",
      name: "Fresh Season",
      country: "Germany",
      played: 12,
      total: 306,
      avgGoals: 3.1,
      btts: 60,
      cards: null,
    },
  ],
};

function leagueOrder() {
  return screen
    .getAllByRole("rowheader")
    .map((cell) => cell.textContent.replace("small sample", "").trim());
}

describe("CompetitionsCompare", () => {
  test("renders every league sorted by goals average by default", () => {
    render(<CompetitionsCompare overview={OVERVIEW} />);

    expect(leagueOrder()).toEqual(["High Scoring", "Fresh Season", "Mid Table"]);
  });

  test("links each league to its competition page", () => {
    render(<CompetitionsCompare overview={OVERVIEW} />);

    expect(screen.getByRole("link", { name: "High Scoring" })).toHaveAttribute(
      "href",
      "/competition/high/"
    );
  });

  test("flags leagues under the low-sample threshold", () => {
    render(<CompetitionsCompare overview={OVERVIEW} />);

    expect(screen.getAllByText("small sample")).toHaveLength(1);
  });

  test("sorting by a column reorders the rows, then reverses on a second press", () => {
    render(<CompetitionsCompare overview={OVERVIEW} />);

    const cardsHeader = screen.getByRole("button", { name: /Cards/ });

    fireEvent.click(cardsHeader);
    // Highest first, and the league with no cards value sinks to the bottom.
    expect(leagueOrder()).toEqual(["Mid Table", "High Scoring", "Fresh Season"]);

    fireEvent.click(cardsHeader);
    expect(leagueOrder()).toEqual(["High Scoring", "Mid Table", "Fresh Season"]);
  });

  test("sorts text columns alphabetically", () => {
    render(<CompetitionsCompare overview={OVERVIEW} />);

    fireEvent.click(screen.getByRole("button", { name: /League/ }));

    expect(leagueOrder()).toEqual(["Fresh Season", "High Scoring", "Mid Table"]);
  });

  test("shows the refresh notice instead of an empty table when there is no data", () => {
    render(<CompetitionsCompare overview={null} />);

    expect(screen.getByText(/comparison data is refreshing/i)).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  test("states when the data was last rebuilt", () => {
    render(<CompetitionsCompare overview={OVERVIEW} />);

    expect(screen.getByText("Data updated 30 August 2026.")).toBeInTheDocument();
  });
});
