import {
  getFixtureAdProduct,
  getRotatedProduct,
  rotateProducts,
} from "./amazonAffiliates";

const SAMPLE_PRODUCTS = [
  { id: "a", title: "A" },
  { id: "b", title: "B" },
  { id: "c", title: "C" },
];

describe("amazonAffiliates rotation", () => {
  test("rotateProducts shifts catalogue by offset", () => {
    expect(rotateProducts(SAMPLE_PRODUCTS, 1).map((p) => p.id)).toEqual([
      "b",
      "c",
      "a",
    ]);
  });

  test("getRotatedProduct applies offset to slot index", () => {
    expect(getRotatedProduct(SAMPLE_PRODUCTS, 0, 2)?.id).toBe("c");
    expect(getRotatedProduct(SAMPLE_PRODUCTS, 1, 2)?.id).toBe("a");
  });

  test("getFixtureAdProduct uses rotation offset", () => {
    const firstSlot = getFixtureAdProduct(0, 0);
    const rotatedSlot = getFixtureAdProduct(0, 1);
    expect(rotatedSlot?.id).not.toBe(firstSlot?.id);
  });
});
