export const MIN_LEAGUE_SAMPLE = 5;

export function formatRoi(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "0.00%";
  const abs = Math.abs(n).toFixed(2);
  if (n > 0) return `+${abs}%`;
  if (n < 0) return `\u2212${abs}%`;
  return "0.00%";
}

export function formatRecord({ won, settled, exact }) {
  const exactLabel = exact === 1 ? "1 exact score" : `${exact} exact scores`;
  return `${won} of ${settled}, ${exactLabel}`;
}

export function roiTone(row) {
  if (row.thin) return "thin";
  if (row.roi > 0) return "up";
  if (row.roi < 0) return "down";
  return "flat";
}

export function buildLeagueRoiRows(leagues) {
  const rows = Object.entries(leagues || {})
    .map(([name, league]) => {
      const settled = Number(league?.totalInvestment) || 0;
      const won = Number(league?.successCount) || 0;
      const exact = Number(league?.exactScores) || 0;
      const roi = Number(league?.totalROI);
      return {
        name,
        settled,
        won,
        exact,
        roi: Number.isFinite(roi) ? roi : 0,
        thin: settled < MIN_LEAGUE_SAMPLE,
      };
    })
    .filter((row) => row.name && row.settled > 0);

  const byRoi = (a, b) => b.roi - a.roi || a.name.localeCompare(b.name, "en");
  const ready = rows.filter((row) => !row.thin).sort(byRoi);
  const thin = rows.filter((row) => row.thin).sort(byRoi);
  return { ready, thin, total: rows.length };
}
