import { parseBacktestArgs } from "./cliArgs";

describe("parseBacktestArgs", () => {
  const range = ["--from", "2026-08-29", "--to", "2026-09-07"];

  test("defaults to kickoff snapshots, not model replay", () => {
    expect(parseBacktestArgs(range)).toMatchObject({
      from: "2026-08-29",
      to: "2026-09-07",
      replayModel: false,
      upload: true,
    });
  });

  test("accepts --replay-model and --no-upload", () => {
    expect(
      parseBacktestArgs([...range, "--no-upload", "--replay-model"])
    ).toMatchObject({
      replayModel: true,
      upload: false,
    });
  });
});
