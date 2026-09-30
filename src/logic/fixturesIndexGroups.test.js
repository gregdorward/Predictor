import { groupFixturesByDate, fixturesDateSectionId } from "./fixturesIndexGroups";

describe("fixturesIndexGroups", () => {
  test("fixturesDateSectionId sanitizes keys", () => {
    expect(fixturesDateSectionId("2026-09-30")).toBe("fixtures-2026-09-30");
  });

  test("groupFixturesByDate preserves chronological first-seen order", () => {
    const fixtures = [
      { dateKey: "2026-10-01", date: "Thu 1 Oct", href: "/a" },
      { dateKey: "2026-09-30", date: "Wed 30 Sept", href: "/b" },
      { dateKey: "2026-09-30", date: "Wed 30 Sept", href: "/c" },
      { dateKey: "2026-10-01", date: "Thu 1 Oct", href: "/d" },
    ];

    const groups = groupFixturesByDate(fixtures);

    expect(groups.map((g) => g.dateKey)).toEqual(["2026-10-01", "2026-09-30"]);
    expect(groups[0].fixtures).toHaveLength(2);
    expect(groups[1].fixtures).toHaveLength(2);
  });
});
