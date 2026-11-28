const fs = require("fs");
const path = require("path");

/** Guards against copy-paste: away branches for points/rolling tips must use their own flags. */
describe("tip panel differential branch conditions", () => {
  const src = fs.readFileSync(
    path.join(__dirname, "getScorePredictions.js"),
    "utf8"
  );

  test("points differential away branch uses match.pointsDifferential", () => {
    expect(src).toMatch(
      /\} else if \(\s*match\.pointsDifferential === true\s*&&\s*match\.prediction === "awayWin"/
    );
  });

  test("rolling goal diff away branch uses match.rollingGoalDiff", () => {
    expect(src).toMatch(
      /\} else if \(\s*match\.rollingGoalDiff === true\s*&&\s*match\.prediction === "awayWin"/
    );
  });
});
