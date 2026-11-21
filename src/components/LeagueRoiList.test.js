import { fireEvent, render, screen } from "@testing-library/react";
import LeagueRoiList from "./LeagueRoiList";
import { buildLeagueRoiRows, formatRoi } from "./leagueRoiModel";

const leagues = {
  "France Ligue 1": {
    totalInvestment: 1,
    successCount: 1,
    exactScores: 1,
    totalROI: "50.00",
  },
  "England National League North": {
    totalInvestment: 12,
    successCount: 9,
    exactScores: 2,
    totalROI: "92.25",
  },
  "England National League South": {
    totalInvestment: 12,
    successCount: 5,
    exactScores: 0,
    totalROI: "1.08",
  },
  "Poland Ekstraklasa": {
    totalInvestment: 2,
    successCount: 0,
    exactScores: 0,
    totalROI: "-100.00",
  },
  "Scotland Premiership": {
    totalInvestment: 6,
    successCount: 3,
    exactScores: 1,
    totalROI: "0.00",
  },
};

describe("buildLeagueRoiRows", () => {
  test("keeps a 5-match league with the coloured set and parks thinner leagues below", () => {
    const { ready, thin } = buildLeagueRoiRows({
      ...leagues,
      "Belgium Pro League": {
        totalInvestment: 5,
        successCount: 3,
        exactScores: 0,
        totalROI: "10.00",
      },
    });

    expect(ready.map((row) => row.name)).toEqual([
      "England National League North",
      "Belgium Pro League",
      "England National League South",
      "Scotland Premiership",
    ]);
    expect(thin.map((row) => row.name)).toEqual([
      "France Ligue 1",
      "Poland Ekstraklasa",
    ]);
  });

  test("prints a tight sign, including a real minus", () => {
    expect(formatRoi(92.25)).toBe("+92.25%");
    expect(formatRoi(-11)).toBe("\u221211.00%");
    expect(formatRoi(0)).toBe("0.00%");
  });
});

describe("LeagueRoiList", () => {
  test("opens a ledger where a one-match league is not a profit verdict", () => {
    render(<LeagueRoiList leagues={leagues} />);

    const trigger = screen.getByRole("button", { name: /ROI by League/ });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveTextContent("5");

    fireEvent.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(
      screen.getByText(/Profit and loss colour starts at 5 matches/)
    ).toBeVisible();
    expect(
      screen.getByRole("columnheader", { name: "ROI" })
    ).toHaveAttribute("aria-sort", "descending");

    expect(screen.getByRole("cell", { name: "+92.25%" })).toHaveClass(
      "LeagueRoi__roi--up"
    );
    expect(screen.getByRole("cell", { name: "+50.00%" })).toHaveClass(
      "LeagueRoi__roi--thin"
    );
    expect(screen.getByRole("cell", { name: "\u2212100.00%" })).toHaveClass(
      "LeagueRoi__roi--thin"
    );
    expect(screen.getByText("Fewer than 5 settled matches")).toBeVisible();
    expect(
      screen.getByRole("rowheader", {
        name: /England National League North 9 of 12, 2 exact scores/,
      })
    ).toBeVisible();
  });
});
