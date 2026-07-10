import ShareableVisual from "./ShareableVisual";
import { CreateBadge } from "./createBadge";
import { sanitizeImageFilename } from "../utils/captureElementImage";
import { buildAttackDefenceMetricTrends } from "../utils/metricTrendAnalysis";

const TREND_META = {
  improving: {
    symbol: "↑",
    label: "Improving",
    className: "MetricTrendTables-arrow--up",
  },
  worsening: {
    symbol: "↓",
    label: "Worsening",
    className: "MetricTrendTables-arrow--down",
  },
  stable: {
    symbol: "→",
    label: "Stable",
    className: "MetricTrendTables-arrow--flat",
  },
};

function TrendArrow({ direction }) {
  const meta = TREND_META[direction] ?? TREND_META.stable;

  return (
    <span
      className={`MetricTrendTables-arrow ${meta.className}`}
      title={meta.label}
      aria-label={meta.label}
    >
      {meta.symbol}
    </span>
  );
}

function TeamMetricTrendTable({ teamName, badge, rows = [] }) {
  if (!rows.length) {
    return null;
  }

  return (
    <div className="MetricTrendTables-teamPanel">
      <h4 className="MetricTrendTables-teamName">
        {badge ? (
          <CreateBadge
            image={badge}
            alt={`${teamName} badge`}
            ClassName="MetricTrendTables-badge"
          />
        ) : null}
        <span>{teamName}</span>
      </h4>
      <table className="MetricTrendTables-table">
        <thead>
          <tr>
            <th scope="col">Metric</th>
            <th scope="col">Trend</th>
            <th scope="col">Summary</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key}>
              <th scope="row">{row.label}</th>
              <td className="MetricTrendTables-trendCell">
                <TrendArrow direction={row.direction} />
              </td>
              <td className="MetricTrendTables-detailCell">
                <span className="MetricTrendTables-detailPrimary">{row.detailPrimary}</span>
                {row.detailSecondary ? (
                  <span className="MetricTrendTables-detailSecondary">{row.detailSecondary}</span>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MetricTrendSection({
  title,
  subtitle,
  variant,
  team1,
  team2,
  homeBadge,
  awayBadge,
  homeRows,
  awayRows,
}) {
  if (!homeRows?.length && !awayRows?.length) {
    return null;
  }

  return (
    <section
      className={`MetricTrendTables-section MetricTrendTables-section--${variant}`}
    >
      <div className="MetricTrendTables-sectionHeader">
        <h3 className="MetricTrendTables-sectionTitle">{title}</h3>
        {subtitle ? (
          <p className="MetricTrendTables-sectionSubtitle">{subtitle}</p>
        ) : null}
      </div>
      <div className="MetricTrendTables-panels">
        {homeRows?.length ? (
          <TeamMetricTrendTable teamName={team1} badge={homeBadge} rows={homeRows} />
        ) : null}
        {awayRows?.length ? (
          <TeamMetricTrendTable teamName={team2} badge={awayBadge} rows={awayRows} />
        ) : null}
      </div>
    </section>
  );
}

export default function AttackDefenceMetricTrendTables({
  team1,
  team2,
  homeBadge,
  awayBadge,
  homeResults = [],
  awayResults = [],
  text = "All Competition Games - Attack & Defence trends",
}) {
  const trends = buildAttackDefenceMetricTrends(homeResults, awayResults);
  const hasHome = homeResults.length > 0;
  const hasAway = awayResults.length > 0;

  if (!hasHome && !hasAway) {
    return null;
  }

  const shareFilename = sanitizeImageFilename(`${team1}-vs-${team2}-metric-trends`);
  const shareTitle = `${team1} vs ${team2} - ${text}`;

  return (
    <ShareableVisual
      filename={shareFilename}
      shareTitle={shareTitle}
      className="ShotAreaCharts-share MetricTrendTables-share"
    >
      <div data-share-capture className="ComparisonBarChart MetricTrendTables">
        <div className="ShotAreaCharts-header">
          <p className="ShotAreaCharts-title">{text}</p>
          <p className="ShotAreaCharts-subtitle">
            Arrow = season-long direction. Summary shows the per-game shift and recent vs early form.
          </p>
        </div>

        <MetricTrendSection
          variant="attack"
          title="Attack"
          subtitle="Higher values are better. Green up = improving over the season."
          team1={team1}
          team2={team2}
          homeBadge={homeBadge}
          awayBadge={awayBadge}
          homeRows={hasHome ? trends.attack.home : []}
          awayRows={hasAway ? trends.attack.away : []}
        />

        <MetricTrendSection
          variant="defence"
          title="Defence"
          subtitle="Lower values are better. Green up = conceding fewer chances over the season."
          team1={team1}
          team2={team2}
          homeBadge={homeBadge}
          awayBadge={awayBadge}
          homeRows={hasHome ? trends.defence.home : []}
          awayRows={hasAway ? trends.defence.away : []}
        />
      </div>
    </ShareableVisual>
  );
}
