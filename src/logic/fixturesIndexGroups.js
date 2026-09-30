export function fixturesDateSectionId(dateKey) {
  const safe = String(dateKey || "unknown").replace(/[^a-z0-9-]/gi, "-");
  return `fixtures-${safe}`;
}

/** @param {Array<{ dateKey?: string, date?: string }>} fixtures */
export function groupFixturesByDate(fixtures) {
  const order = [];
  const byKey = new Map();

  for (const fixture of fixtures) {
    const dateKey = fixture.dateKey || fixture.date || "unknown";
    if (!byKey.has(dateKey)) {
      byKey.set(dateKey, []);
      order.push(dateKey);
    }
    byKey.get(dateKey).push(fixture);
  }

  return order.map((dateKey) => {
    const items = byKey.get(dateKey) ?? [];
    const dateLabel = items[0]?.date || dateKey;
    return {
      dateKey,
      dateLabel,
      sectionId: fixturesDateSectionId(dateKey),
      fixtures: items,
    };
  });
}
