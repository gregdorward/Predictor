import { applyNationalTeamAlias } from "./nationalTeamAliases";

describe("applyNationalTeamAlias", () => {
  test("maps common FootyStats international labels to SofaScore names", () => {
    expect(applyNationalTeamAlias("usa")).toBe("united states");
    expect(applyNationalTeamAlias("korearepublic")).toBe("south korea");
    expect(applyNationalTeamAlias("cotedivoire")).toBe("ivory coast");
    expect(applyNationalTeamAlias("turkiye")).toBe("turkey");
  });

  test("returns the original key when no alias exists", () => {
    expect(applyNationalTeamAlias("england")).toBe("england");
    expect(applyNationalTeamAlias("")).toBe("");
  });
});
