import { parseBacktestArgs } from "./cliArgs";

describe("parseBacktestArgs", () => {
  const range = ["--from", "2026-08-29", "--to", "2026-09-07"];

  test("defaults to live model replay (snapshots off)", () => {
    expect(parseBacktestArgs(range)).toMatchObject({
      from: "2026-08-29",
      to: "2026-09-07",
      useSnapshots: null,
      replayModel: false,
      upload: true,
    });
  });

  test("accepts --use-snapshots and --no-upload", () => {
    expect(
      parseBacktestArgs([...range, "--no-upload", "--use-snapshots"])
    ).toMatchObject({
      useSnapshots: true,
      upload: false,
    });
  });

  test("--replay-model forces snapshots off", () => {
    expect(
      parseBacktestArgs([...range, "--replay-model"])
    ).toMatchObject({
      useSnapshots: false,
      replayModel: true,
    });
  });

  test("accepts filter preset and inline thresholds", () => {
    expect(
      parseBacktestArgs([...range, "--preset", "ssh", "--filter-edge", "8"])
    ).toMatchObject({
      preset: "ssh",
      filterOverrides: { edge: 8 },
    });
  });

  test("accepts GlobalFilters-style flag names", () => {
    expect(
      parseBacktestArgs([...range, "--filter-minimumGDHorA", "5"])
    ).toMatchObject({
      filterOverrides: { minimumGDHorA: 5 },
    });
  });
});
