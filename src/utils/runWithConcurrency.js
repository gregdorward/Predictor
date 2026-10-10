export async function runWithConcurrency(items, limit, worker) {
  if (!Array.isArray(items) || items.length === 0) {
    return [];
  }

  const concurrency = Math.max(1, Math.min(items.length, Math.floor(limit) || 1));
  const results = new Array(items.length);
  let nextIndex = 0;

  await Promise.all(
    Array.from({ length: concurrency }, async () => {
      while (nextIndex < items.length) {
        const currentIndex = nextIndex;
        nextIndex += 1;
        results[currentIndex] = await worker(items[currentIndex], currentIndex);
      }
    })
  );

  return results;
}
