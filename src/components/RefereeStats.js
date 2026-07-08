function pickRefereeRecord(records, leagueId) {
  if (!records?.length) return null;

  const leagueMatches = records.filter(
    (record) => Number(record.competition_id) === Number(leagueId)
  );

  if (leagueMatches.length) {
    return leagueMatches.sort(
      (a, b) => (b.ending_year || 0) - (a.ending_year || 0)
    )[0];
  }

  return records.sort(
    (a, b) => (b.ending_year || 0) - (a.ending_year || 0)
  )[0];
}

function formatRate(value) {
  if (value == null || Number.isNaN(Number(value))) return "-";
  return Number(value).toFixed(2);
}

function formatPercent(value) {
  if (value == null || Number.isNaN(Number(value))) return "-";
  return `${Number(value)}%`;
}

function cardAverage(total, matches) {
  const totalCards = Number(total);
  const matchCount = Number(matches);
  if (
    !Number.isFinite(totalCards) ||
    !Number.isFinite(matchCount) ||
    matchCount <= 0
  ) {
    return null;
  }
  return totalCards / matchCount;
}

const RefereeStats = ({ refereeRecords, leagueId }) => {
  const record = pickRefereeRecord(refereeRecords, leagueId);
  if (!record) return null;

  const matches = record.appearances_overall;
  const yellowPerMatch = cardAverage(record.yellow_cards_overall, matches);
  const redPerMatch = cardAverage(record.red_cards_overall, matches);

  return (
    <div className="referee-card">
      <h4 className="referee-name">{record.full_name || record.known_as}</h4>
      <p className="referee-meta">
        {[record.nationality, record.league, record.season]
          .filter(Boolean)
          .join(" · ")}
      </p>

      <div className="referee-stats-grid">
        <div className="referee-stat-item referee-stat-item--neutral">
          <span className="referee-stat-value">{matches ?? "-"}</span>
          <span className="referee-stat-label">Matches</span>
        </div>
        <div className="referee-stat-item referee-stat-item--yellow">
          <span className="referee-stat-value">{formatRate(yellowPerMatch)}</span>
          <span className="referee-stat-label">Yellow / match</span>
        </div>
        <div className="referee-stat-item referee-stat-item--red">
          <span className="referee-stat-value">{formatRate(redPerMatch)}</span>
          <span className="referee-stat-label">Red / match</span>
        </div>
      </div>

      <div className="referee-secondary-stats">
        <span>BTTS: {formatPercent(record.btts_percentage)}</span>
        <span>Home wins: {formatPercent(record.wins_per_home)}</span>
        <span>Away wins: {formatPercent(record.wins_per_away)}</span>
      </div>
    </div>
  );
};

export default RefereeStats;
