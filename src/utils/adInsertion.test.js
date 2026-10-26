import { getListAdSlotIndex } from "./adInsertion";

it("limits long lists to two well-spaced ads", () => {
  const positions = Array.from({ length: 50 }, (_, index) => index)
    .filter((index) => getListAdSlotIndex(index, 50) != null);
  expect(positions).toEqual([4, 14]);
});

it("keeps short lists ad-free and never places a feed ad after the final item", () => {
  expect(getListAdSlotIndex(3, 4)).toBeNull();
  expect(getListAdSlotIndex(4, 5)).toBeNull();
  expect(getListAdSlotIndex(14, 15)).toBeNull();
  expect(getListAdSlotIndex(4, 6)).toBe(0);
});
