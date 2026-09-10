import { mkdtempSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

import { resetTipFilters } from "../tipFilters.js";
import { parseBacktestFilters } from "./parseFilters.js";

describe("parseBacktestFilters", () => {
  afterEach(() => {
    resetTipFilters();
  });

  test("applies preset from CLI args", () => {
    const result = parseBacktestFilters({ preset: "ssh" });
    expect(result.active).toBe(true);
    expect(result.filters.minimumXG).toBe(2);
    expect(result.presetLabel).toBe("Soccer Stats Hub recommended");
  });

  test("merges JSON file overrides after preset", () => {
    const dir = mkdtempSync(join(tmpdir(), "backtest-filters-"));
    const filePath = join(dir, "filters.json");
    writeFileSync(
      filePath,
      JSON.stringify({ edge: 12, minimumXG: 3 })
    );

    const result = parseBacktestFilters({
      preset: "ssh",
      filtersFile: filePath,
    });

    expect(result.filters.minimumXG).toBe(3);
    expect(result.filters.edge).toBe(12);
    expect(result.filters.minimumGDHorA).toBe(5);
  });
});
