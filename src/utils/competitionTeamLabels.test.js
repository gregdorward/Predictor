import {
  abbreviateTeamName,
  addCompetitionTeamBadges,
  addFixtureBadges,
  lookupBadgePath,
  resolveTeamBadgeUrl,
  uniqueTeamAbbreviations,
} from "./competitionTeamLabels";

describe("abbreviateTeamName", () => {
  test("collides for Birmingham City and Bristol City", () => {
    expect(abbreviateTeamName("Birmingham City")).toBe("BCI");
    expect(abbreviateTeamName("Bristol City")).toBe("BCI");
  });
});

describe("uniqueTeamAbbreviations", () => {
  test("keeps unique compact labels when there is no clash", () => {
    const map = uniqueTeamAbbreviations(["Arsenal", "Chelsea"]);
    expect(map.get("Arsenal")).toBe("ARS");
    expect(map.get("Chelsea")).toBe("CHE");
  });

  test("splits Birmingham City and Bristol City", () => {
    const map = uniqueTeamAbbreviations([
      "Birmingham City",
      "Bristol City",
      "Leeds United",
    ]);
    expect(map.get("Birmingham City")).not.toBe(map.get("Bristol City"));
    expect(map.get("Birmingham City")).toMatch(/^BIR/);
    expect(map.get("Bristol City")).toMatch(/^BRI/);
    expect(map.get("Leeds United")).toBe("LEE");
  });
});

describe("badge maps", () => {
  test("resolves FootyStats paths and absolute URLs", () => {
    expect(resolveTeamBadgeUrl("teams/england-birmingham-city-fc.png")).toBe(
      "https://cdn.footystats.org/img/teams/england-birmingham-city-fc.png"
    );
    expect(resolveTeamBadgeUrl("https://cdn.example.com/badge.png")).toBe(
      "https://cdn.example.com/badge.png"
    );
    expect(resolveTeamBadgeUrl("-")).toBeNull();
  });

  test("looks up badges from fixtures even when names differ by FC suffix", () => {
    const map = addFixtureBadges(new Map(), [
      {
        home_name: "Birmingham City FC",
        home_image: "teams/england-birmingham-city-fc.png",
        away_name: "Bristol City",
        away_image: "teams/england-bristol-city-fc.png",
      },
    ]);

    expect(lookupBadgePath(map, "Birmingham City")).toBe(
      "teams/england-birmingham-city-fc.png"
    );
    expect(lookupBadgePath(map, "Bristol City")).toBe(
      "teams/england-bristol-city-fc.png"
    );
  });

  test("reads image from competition team objects", () => {
    const map = addCompetitionTeamBadges(new Map(), [
      {
        name: "Birmingham City",
        image: "teams/england-birmingham-city-fc.png",
      },
    ]);
    expect(lookupBadgePath(map, "Birmingham City")).toBe(
      "teams/england-birmingham-city-fc.png"
    );
  });
});
