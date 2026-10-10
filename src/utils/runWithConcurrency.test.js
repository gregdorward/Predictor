import { runWithConcurrency } from "./runWithConcurrency";

describe("runWithConcurrency", () => {
  test("preserves result order while capping active workers", async () => {
    let active = 0;
    let maxActive = 0;

    const results = await runWithConcurrency([1, 2, 3, 4, 5], 2, async (item) => {
      active += 1;
      maxActive = Math.max(maxActive, active);

      await new Promise((resolve) => setTimeout(resolve, 5));

      active -= 1;
      return item * 10;
    });

    expect(results).toEqual([10, 20, 30, 40, 50]);
    expect(maxActive).toBeLessThanOrEqual(2);
  });

  test("normalizes invalid limits to one worker", async () => {
    let active = 0;
    let maxActive = 0;

    await runWithConcurrency([1, 2, 3], 0, async () => {
      active += 1;
      maxActive = Math.max(maxActive, active);

      await new Promise((resolve) => setTimeout(resolve, 5));

      active -= 1;
    });

    expect(maxActive).toBe(1);
  });
});
