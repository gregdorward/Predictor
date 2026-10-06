import Collapsable from "./CollapsableElement";

function formatPct(value) {
  if (value == null || value === "") return "—";
  return `${value}%`;
}

function formatNum(value) {
  if (value == null || value === "") return "—";
  return String(value);
}

function buildMetricRows(metrics) {
  if (!metrics) return null;

  const rest = metrics.rest;
  const overUnder = metrics.overUnder;
  const gameState = metrics.gameState;
  const sos = metrics.strengthOfSchedule;
  const variance = metrics.scoringVariance;

  return [
    {
      id: "rest-days",
      label: "Rest days",
      value:
        rest?.daysSinceLastMatch != null
          ? `${rest.daysSinceLastMatch}d · ${rest.restLabel}`
          : "—",
    },
    {
      id: "congestion",
      label: "Congestion",
      value: rest
        ? `${rest.congestionLabel} (${rest.matchesInLast7Days ?? 0} in 7d · ${rest.matchesInLast14Days ?? 0} in 14d)`
        : "—",
    },
    {
      id: "over-25",
      label: "O2.5 last 5 / 10",
      value: `${formatPct(overUnder?.over25Last5Percentage)} / ${formatPct(
        overUnder?.over25Last10Percentage
      )}`,
    },
    {
      id: "schedule",
      label: "Schedule",
      value: sos?.scheduleLabel || "—",
    },
    {
      id: "opposition-ppg",
      label: "Last 5 Opposition PPG Avg / all",
      value: `${formatNum(sos?.avOppositionPPGLast5)} / ${formatNum(
        sos?.avOppositionPPGAll
      )}`,
    },
    {
      id: "ppg-top-half",
      label: "PPG vs top half",
      value:
        sos?.ppgVsTopHalf != null
          ? `${formatNum(sos.ppgVsTopHalf)} (${sos.matchesVsTopHalf ?? 0} games)`
          : "—",
    },
    {
      id: "ppg-bottom-half",
      label: "PPG vs bottom half",
      value:
        sos?.ppgVsBottomHalf != null
          ? `${formatNum(sos.ppgVsBottomHalf)} (${sos.matchesVsBottomHalf ?? 0} games)`
          : "—",
    },
    {
      id: "scored-first",
      label: "Scored first",
      value: gameState?.hasData
        ? formatPct(gameState.scoredFirstPercentage)
        : "—",
    },
    {
      id: "late-goals",
      label: "Late goals scored",
      value: gameState?.hasData
        ? formatPct(gameState.lateGoalsScoredPercentage)
        : "—",
    },
    {
      id: "half-goals",
      label: "1H / 2H goals scored",
      value: gameState?.hasData
        ? `${formatPct(gameState.firstHalfGoalsScoredPercentage)} / ${formatPct(
            gameState.secondHalfGoalsScoredPercentage
          )}`
        : "—",
    },
    {
      id: "points-losing",
      label: "Points from losing positions",
      value: gameState?.hasData
        ? `${gameState.pointsFromLosingPositions ?? 0} pts · ${formatNum(
            gameState.ppgFromLosingPositions
          )} PPG (${gameState.trailedMatches ?? 0} trails)`
        : "—",
    },
    {
      id: "points-winning",
      label: "Points from winning positions",
      value: gameState?.hasData
        ? `${gameState.pointsFromWinningPositions ?? 0} pts · ${formatNum(
            gameState.ppgFromWinningPositions
          )} PPG (${gameState.ledMatches ?? 0} leads)`
        : "—",
    },
    {
      id: "scoring-profile",
      label: "Scoring profile",
      value: variance?.varianceLabel
        ? `${variance.varianceLabel} · games decided by 1 goal - ${formatPct(
            variance.oneGoalGamePercentage
          )}`
        : "—",
    },
    {
      id: "blowout",
      label: "Blowout rate (margin 3+ either way)",
      value: formatPct(variance?.blowoutPercentage),
    },
  ];
}

function ComparisonTable({ homeTeam, awayTeam, homeMetrics, awayMetrics }) {
  const homeRows = buildMetricRows(homeMetrics);
  const awayRows = buildMetricRows(awayMetrics);
  const template = homeRows || awayRows;

  if (!template) {
    return (
      <p className="FormContextCompare__empty">
        Not enough resulted games yet.
      </p>
    );
  }

  return (
    <div className="FormContextCompare__tableWrap">
      <table className="FormContextCompare__table">
        <thead>
          <tr>
            <th
              scope="col"
              className="FormContextCompare__th FormContextCompare__th--metric"
            >
              Metric
            </th>
            <th
              scope="col"
              className="FormContextCompare__th FormContextCompare__th--home"
            >
              {homeTeam}
            </th>
            <th
              scope="col"
              className="FormContextCompare__th FormContextCompare__th--away"
            >
              {awayTeam}
            </th>
          </tr>
        </thead>
        <tbody>
          {template.map((row, index) => (
            <tr key={row.id}>
              <th scope="row" className="FormContextCompare__metric">
                {row.label}
              </th>
              <td className="FormContextCompare__cell FormContextCompare__cell--home">
                {homeRows ? homeRows[index].value : "—"}
              </td>
              <td className="FormContextCompare__cell FormContextCompare__cell--away">
                {awayRows ? awayRows[index].value : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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
  locked = false,
}) {
  if (!homeMetrics && !awayMetrics) return null;

  const collapsableProps = getCollapsableProps?.("Match Context") || {};

  return (
    <div className="FormContextCompare">
      <Collapsable
        buttonText={`Match Context \u{2630}`}
        classNameButton="TeamStreaksButton"
        {...collapsableProps}
        locked={locked}
        element={
          <div className="FormContextCompare__content">
            <p className="FormContextCompare__note">
              Match context - derived from recent competition fixtures
            </p>
            <ComparisonTable
              homeTeam={homeTeam}
              awayTeam={awayTeam}
              homeMetrics={homeMetrics}
              awayMetrics={awayMetrics}
            />
          </div>
        }
      />
    </div>
  );
}
