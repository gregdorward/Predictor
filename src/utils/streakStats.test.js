import { getStreakCategories, hasValidStreaks } from "./streakStats";

describe("hasValidStreaks", () => {
  test("rejects quota / error payloads", () => {
    expect(hasValidStreaks({ error: "Temporarily unavailable (quota)" })).toBe(
      false
    );
  });

  test("accepts general and head2head streak arrays", () => {
    expect(
      hasValidStreaks({
        general: [{ name: "Wins", value: 3, team: "home" }],
        head2head: [],
      })
    ).toBe(true);
  });

  test("rejects non-array category values", () => {
    expect(hasValidStreaks({ general: "not-an-array" })).toBe(false);
  });
});

describe("getStreakCategories", () => {
  test("returns only array categories", () => {
    expect(
      getStreakCategories({
        general: [{ name: "Wins", value: 1, team: "home" }],
        meta: { foo: 1 },
      })
    ).toEqual([
      ["general", [{ name: "Wins", value: 1, team: "home" }]],
    ]);
  });

  test("returns empty list for error payloads", () => {
    expect(
      getStreakCategories({ error: "Temporarily unavailable (quota)" })
    ).toEqual([]);
  });
});
