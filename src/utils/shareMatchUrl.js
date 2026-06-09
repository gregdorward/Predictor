const DEFAULT_SITE_URL = "https://www.soccerstatshub.com";

export function formatShareDateParam(unixTimestamp) {
  const ts = Number(unixTimestamp);
  if (!Number.isFinite(ts) || ts <= 0) {
    return null;
  }

  const date = ts > 1e12 ? new Date(ts) : new Date(ts * 1000);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseShareUrlDate(dateParam) {
  if (!dateParam || typeof dateParam !== "string") {
    return null;
  }

  const parts = dateParam.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!parts) {
    return null;
  }

  const year = Number(parts[1]);
  const month = Number(parts[2]);
  const day = Number(parts[3]);
  const parsed = new Date(year, month - 1, day);

  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return null;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  parsed.setHours(0, 0, 0, 0);

  const offset = Math.round((parsed.getTime() - today.getTime()) / 86400000);
  return { date: parsed, offset };
}

export function getInitialDateFromShareUrl() {
  if (typeof window === "undefined") {
    return { date: new Date(), offset: 0 };
  }

  const params = new URLSearchParams(window.location.search);
  const parsed = parseShareUrlDate(params.get("date"));

  if (!parsed) {
    return { date: new Date(), offset: 0 };
  }

  return parsed;
}

export function buildMatchShareUrl(gameId, unixDate, siteUrl = DEFAULT_SITE_URL) {
  if (gameId == null) {
    return null;
  }

  const url = new URL(siteUrl);
  url.searchParams.set("shortlist", String(gameId));

  const dateParam = formatShareDateParam(unixDate);
  if (dateParam) {
    url.searchParams.set("date", dateParam);
  }

  return url.toString();
}
