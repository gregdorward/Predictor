import { buildMarketsSnapshotRows } from "../logic/fixturePageMetrics";

export default function FixtureMarketsSnapshot({
  match,
  homeTeamName,
  awayTeamName,
}) {
  const rows = buildMarketsSnapshotRows(match);
  if (!rows.length) {
    return null;
  }

  return (
    <section
      className="FixturePage-marketsSnapshot"
      aria-labelledby="fixture-markets-snapshot-title"
    >
      <h3
        id="fixture-markets-snapshot-title"
        className="FixturePage-statGroupTitle FixturePage-marketsSnapshotTitle"
      >
        Recent markets
      </h3>
      <p className="FixturePage-marketsSnapshotLead">
        BTTS and over/under rates from recent matches.
      </p>
      <div className="FixturePage-compareTeams FixturePage-compareTeams--block">
        <span className="FixturePage-compareTeam FixturePage-compareTeam--home">
          {homeTeamName}
        </span>
        <span className="FixturePage-compareTeam FixturePage-compareTeam--away">
          {awayTeamName}
        </span>
      </div>
      <div className="FixturePage-compareRows FixturePage-marketsSnapshotRows">
        {rows.map((row) => (
          <div key={row.label} className="FixturePage-compareRow">
            <span className="FixturePage-compareValue FixturePage-compareValue--home">
              {row.homeValue}
            </span>
            <span className="FixturePage-compareLabel">{row.label}</span>
            <span className="FixturePage-compareValue FixturePage-compareValue--away">
              {row.awayValue}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
