import {
  formatTrendingTipLabel,
  getTrendingSelections,
} from "../logic/predictionLeague";

export default function PredictionLeagueTrending({ slips = [] }) {
  const topPicks = getTrendingSelections(slips);

  if (topPicks.length === 0) return null;

  return (
    <section className="TrendingSection" aria-labelledby="prediction-league-trending-title">
      <h3 id="prediction-league-trending-title" className="TrendingSection__title">
        Popular pending picks
      </h3>
      <ul className="TopPicksGrid">
        {topPicks.map((pick) => (
          <li
            key={`${pick.game}_${pick.tip}`}
            className="TrendCard"
          >
            <div className="TrendCard__main">
              <p className="TrendCard__fixture">{pick.game}</p>
              <p className="TrendCard__selection">
                {formatTrendingTipLabel(pick.tip)}
              </p>
              <p className="TrendCard__odds">
                <span className="TrendCard__oddsValue">@{pick.odds}</span>
              </p>
            </div>
            <span
              className="TrendCard__count"
              aria-label={`${pick.count} tipster${pick.count === 1 ? "" : "s"}`}
            >
              {pick.count}×
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
