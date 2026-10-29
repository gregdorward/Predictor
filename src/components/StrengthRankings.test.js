import { fireEvent, render, screen } from "@testing-library/react";
import StrengthRankings from "./StrengthRankings";
import { buildStrengthPreviewOverview } from "../logic/strengthRankingsPreview";

jest.mock("./SiteHeader", () => {
  return function SiteHeader({ children }) {
    return <div>{children}</div>;
  };
});

const overview = buildStrengthPreviewOverview();

describe("StrengthRankings", () => {
  test("opens the top club's last six and keeps a strong result above an easy win", () => {
    render(<StrengthRankings overview={overview} />);

    expect(screen.getByRole("heading", { name: "Strength rankings" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "England", pressed: true })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Premier League/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Arsenal", expanded: true })).toBeInTheDocument();
    expect(screen.getAllByText("+8.4")[0].closest("tr")).toHaveTextContent("0-2 A");
    expect(screen.getAllByText("+8.4")[0].closest("tr")).toHaveTextContent("Liverpool");
    expect(screen.getAllByText("+1.4")[0].closest("tr")).toHaveTextContent("Wolves");
    const city = screen.getByRole("button", { name: "Man City" }).closest("tr");
    expect(city).toHaveTextContent("City 1");
    expect(city).toHaveTextContent("1-0 H");
    expect(city).toHaveTextContent("+1.1");
    expect(screen.getByRole("heading", { name: /Championship/ })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /La Liga/ })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Show the other 3" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Bournemouth" })).not.toBeInTheDocument();
  });

  test("a country change replaces the pyramid", () => {
    render(<StrengthRankings overview={overview} />);
    fireEvent.click(screen.getByRole("button", { name: "Spain" }));

    expect(screen.getByRole("heading", { name: /La Liga/ })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /Premier League/ })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Barcelona", expanded: true })).toBeInTheDocument();
  });

  test("global is one list, with each club's competition", () => {
    render(<StrengthRankings overview={overview} />);
    fireEvent.click(screen.getByRole("button", { name: "Global" }));

    expect(screen.getByRole("heading", { name: /Worldwide/ })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /Premier League/ })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Leeds", expanded: true })).toBeInTheDocument();
    expect(screen.getAllByText("+9.1").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Championship").length).toBeGreaterThan(0);
  });

  test("show the rest reveals the clubs below the top five", () => {
    render(<StrengthRankings overview={overview} />);
    fireEvent.click(screen.getByRole("button", { name: "Show the other 3" }));
    expect(screen.getByRole("button", { name: "Bournemouth" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Show the top 5" })).toBeInTheDocument();
  });

  test("an empty blob explains that the morning build has not landed", () => {
    render(<StrengthRankings overview={null} />);
    expect(screen.getByText(/refresh each morning/)).toBeInTheDocument();
  });

  test("six games is the default and ten games switches the sample", () => {
    const tenGlobal = overview.global.map((team, index) =>
      index === 0 ? { ...team, name: "Ten Leader", rating: team.rating + 40, played: 10 } : team
    );
    const tenLeagues = overview.leagues.map((league) =>
      league.slug === "premier-league"
        ? {
            ...league,
            teams: league.teams.map((team) =>
              team.name === "Arsenal"
                ? { ...team, name: "Arsenal Ten", rating: 1901, played: 10, form: "WWWWWWWWWW" }
                : team
            ),
          }
        : league
    );
    render(
      <StrengthRankings
        overview={{
          ...overview,
          windows: {
            6: { global: overview.global, leagues: overview.leagues },
            10: { global: tenGlobal, leagues: tenLeagues },
          },
        }}
      />
    );

    expect(screen.getByRole("button", { name: "6 games", pressed: true })).toBeInTheDocument();
    expect(screen.getByText(/last six results/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Arsenal", expanded: true })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "10 games" }));

    expect(screen.getByRole("button", { name: "10 games", pressed: true })).toBeInTheDocument();
    expect(screen.getByText(/last ten results/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Arsenal Ten", expanded: true })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Arsenal" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "6 games" }));
    expect(screen.getByRole("button", { name: "Arsenal", expanded: true })).toBeInTheDocument();
    expect(screen.getByText(/last six results/)).toBeInTheDocument();
  });
});
