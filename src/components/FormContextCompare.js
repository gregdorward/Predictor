import Collapsable from "./CollapsableElement";

function formatPct(value) {
  if (value == null || value === "") return "—";
  return `${value}%`;
}

function formatNum(value) {
  if (value == null || value === "") return "—";
  return String(value);
}

function MetricItem({ label, value }) {
  return (
    <li className="FormContextCompare__item">
      <span className="FormContextCompare__label">{label}</span>
      <strong className="FormContextCompare__value">{value}</strong>
    </li>
  );
}

function ContextColumn({ teamName, metrics }) {
  const rest = metrics?.rest;
  const overUnder = metrics?.overUnder;
  const gameState = metrics?.gameState;
  const sos = metrics?.strengthOfSchedule;
  const variance = metrics?.scoringVariance;

  if (!metrics) {
    return (
      <div className="FormContextCompare__col">
        <h4 className="FormContextCompare__team">{teamName}</h4>
        <p className="FormContextCompare__empty">Not enough resulted games yet.</p>
      </div>
    );
  }

  const items = [
    {
      label: "Rest",
      value:
        rest?.daysSinceLastMatch != null
          ? `${rest.daysSinceLastMatch}d · ${rest.restLabel}`
          : "—",
    },
    {
      label: "Congestion",
      value: rest
        ? `${rest.congestionLabel} (${rest.matchesInLast7Days ?? 0} in 7d · ${rest.matchesInLast14Days ?? 0} in 14d)`
        : "—",
    },
    {
      label: "O2.5 last 5 / 10",
      value: `${formatPct(overUnder?.over25Last5Percentage)} / ${formatPct(
        overUnder?.over25Last10Percentage
      )}`,
    },
    {
      label: "Schedule",
      value: sos?.scheduleLabel || "—",
    },
    {
      label: "Opp PPG L5 / all",
      value: `${formatNum(sos?.avOppositionPPGLast5)} / ${formatNum(
        sos?.avOppositionPPGAll
      )}`,
    },
    {
      label: "Scored first",
      value: gameState?.hasData
        ? formatPct(gameState.scoredFirstPercentage)
        : "—",
    },
    {
      label: "Late goals scored",
      value: gameState?.hasData
        ? formatPct(gameState.lateGoalsScoredPercentage)
        : "—",
    },
    {
      label: "Scoring profile",
      value: variance?.varianceLabel
        ? `${variance.varianceLabel} · games decided by 1 goal ${formatPct(
            variance.oneGoalGamePercentage
          )}`
        : "—",
    },
  ];

  return (
    <div className="FormContextCompare__col">
      <h4 className="FormContextCompare__team">{teamName}</h4>
      <ul className="FormContextCompare__list">
        {items.map((item) => (
          <MetricItem key={item.label} label={item.label} value={item.value} />
        ))}
      </ul>
    </div>
  );
}

/**
 * Side-by-side contextual metrics. Display only — does not affect predictions.
 */
export default function FormContextCompare({
  homeTeam,
  awayTeam,
  homeMetrics,
  awayMetrics,
  getCollapsableProps,
}) {
  if (!homeMetrics && !awayMetrics) return null;

  const collapsableProps = getCollapsableProps?.("Match Context") || {};

  return (
    <div className="FormContextCompare">
      <Collapsable
        buttonText={`Match Context \u{2630}`}
        classNameButton="TeamStreaksButton"
        {...collapsableProps}
        element={
          <div className="FormContextCompare__content">
            <p className="FormContextCompare__note">
              Match context - derived from recent fixtures
            </p>
            <div className="FormContextCompare__grid">
              <ContextColumn teamName={homeTeam} metrics={homeMetrics} />
              <ContextColumn teamName={awayTeam} metrics={awayMetrics} />
            </div>
          </div>
        }
      />
    </div>
  );
}
