/** When to insert in-feed ad rows in long lists (homepage fixture list). */

export const LIST_AD_CONFIG = {
  firstAfterIndex: 4,
  interval: 10,
  maxPerList: 2,
};

export function getListAdSlotIndex(itemIndex, itemCount) {
  if (itemIndex >= itemCount - 1) return null;
  const { firstAfterIndex, interval, maxPerList } = LIST_AD_CONFIG;
  if (itemIndex < firstAfterIndex) return null;
  if ((itemIndex - firstAfterIndex) % interval !== 0) return null;
  const slotIndex = Math.floor((itemIndex - firstAfterIndex) / interval);
  if (slotIndex >= maxPerList) return null;
  return slotIndex;
}
