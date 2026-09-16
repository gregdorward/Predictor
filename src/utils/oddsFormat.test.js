import { decimalToFractional } from "./oddsFormat.js";

describe("decimalToFractional", () => {
  test("maps common prices to familiar fractions", () => {
    expect(decimalToFractional(1.5)).toBe("1/2");
    expect(decimalToFractional(1.8)).toBe("4/5");
    expect(decimalToFractional(2.5)).toBe("6/4");
    expect(decimalToFractional(2.75)).toBe("7/4");
    expect(decimalToFractional(2.8)).toBe("9/5");
    expect(decimalToFractional(3)).toBe("2/1");
  });

  test("snaps mid prices to board fractions", () => {
    expect(decimalToFractional(2.88)).toBe("15/8");
    expect(decimalToFractional(2.05)).toBe("21/20");
    expect(decimalToFractional(2.1)).toBe("11/10");
    expect(decimalToFractional(5.5)).toBe("9/2");
  });

  test("avoids exotic fractions like 7/13 and 97/16", () => {
    // ~1.54 → 8/15 (1.533), not 7/13
    expect(decimalToFractional(1.54)).toBe("8/15");
    // ~7.06 → 6/1, not 97/16
    expect(decimalToFractional(7.06)).toBe("6/1");
    expect(decimalToFractional(1.5385)).toBe("8/15");
    expect(decimalToFractional(7.0625)).toBe("6/1");
  });

  test("handles string inputs and invalid values", () => {
    expect(decimalToFractional("2.88")).toBe("15/8");
    expect(decimalToFractional(1)).toBe("N/A");
    expect(decimalToFractional(0)).toBe("N/A");
    expect(decimalToFractional("N/A")).toBe("N/A");
  });
});
