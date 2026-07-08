import { applyNationalTeamAlias } from "./nationalTeamAliases";

function canonicalTeamKey(name) {
  const normalize = (str) =>
    String(str)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "")
      .replace(/[^a-z]/g, "");

  const aliasKey = normalize(name);
  return normalize(applyNationalTeamAlias(aliasKey));
}

describe("applyNationalTeamAlias", () => {
  test("maps common industry stat website international labels to stat website names", () => {
    expect(applyNationalTeamAlias("usa")).toBe("united states");
    expect(applyNationalTeamAlias("korearepublic")).toBe("south korea");
    expect(applyNationalTeamAlias("cotedivoire")).toBe("ivory coast");
    expect(applyNationalTeamAlias("turkiye")).toBe("turkey");
  });

  test("returns the original key when no alias exists", () => {
    expect(applyNationalTeamAlias("england")).toBe("england");
    expect(applyNationalTeamAlias("")).toBe("");
  });

  test("industry stat website Ivory Coast labels resolve to the same key", () => {
    expect(canonicalTeamKey("Ivory Coast")).toBe("ivorycoast");
    expect(canonicalTeamKey("Côte d'Ivoire")).toBe("ivorycoast");
  });
});
