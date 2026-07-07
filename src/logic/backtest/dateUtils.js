export function parseIsoDate(dateStr) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (!match) {
    throw new Error(`Invalid date "${dateStr}". Use YYYY-MM-DD.`);
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new Error(`Invalid date "${dateStr}".`);
  }

  return date;
}

export function toIsoDate(date) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** FootyStats form key format used by footballServer: MMDDYYYY */
export function toFormDateKey(date) {
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const year = date.getUTCFullYear();
  return `${month}${day}${year}`;
}

export function* eachDateInclusive(fromIso, toIso) {
  const start = parseIsoDate(fromIso);
  const end = parseIsoDate(toIso);

  if (start > end) {
    throw new Error(`--from (${fromIso}) must be on or before --to (${toIso}).`);
  }

  const cursor = new Date(start);
  while (cursor <= end) {
    yield new Date(cursor);
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
