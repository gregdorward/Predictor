import {
  formatTrendingTipLabel,
  getTrendingSelections,
} from "../logic/predictionLeague";

export default function PredictionLeagueTrending({ slips = [] }) {
  const topPicks = getTrendingSelections(slips);

  if (topPicks.length === 0) return null;

  return (
    <div className="TrendingSection">
      <h3>Popular pending picks</h3>
      <div
        className="TopPicksGrid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
        }}
      >
        {topPicks.map((pick) => (
          <div
            key={`${pick.game}_${pick.tip}`}
            className="TrendCard"
            style={{ position: "relative" }}
          >
            <span
              className="TrendingTipsCount"
              style={{
                position: "absolute",
                top: "40%",
                right: "15px",
              }}
            >
              {pick.count}x
            </span>
            <div className="TrendingTipGame">{pick.game}</div>
            <div>{formatTrendingTipLabel(pick.tip)}</div>
            <div>@{pick.odds}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
