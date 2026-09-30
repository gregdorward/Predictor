import {
  formatRank,
  getRankEdgeState,
  getSectionSummary,
} from "../utils/rankingsInsights";

function SectionSummaryBar({
  title,
  metrics,
  ranksHome,
  ranksAway,
  teamALabel,
  teamBLabel,
}) {
  const summary = getSectionSummary(
    metrics,
    ranksHome,
    ranksAway,
    teamALabel,
    teamBLabel
  );

  const metaSuffix =
    summary.unavailable > 0
      ? `${summary.unavailable} unavailable`
      : `${summary.compared} compared`;

  return (
    <div
      className={`RankingsDuel-summary RankingsDuel-summary--${summary.tone}`}
      aria-label={`${title} summary. ${summary.leader}. ${teamALabel} leads ${summary.home} metrics. ${teamBLabel} leads ${summary.away} metrics.`}
    >
      <p className="RankingsDuel-summaryLead">{summary.leader}</p>
      <div className="RankingsDuel-summaryStats">
        <span>
          <strong>{summary.home}</strong>
          {teamALabel}
        </span>
        <span>
          <strong>{summary.away}</strong>
          {teamBLabel}
        </span>
        <span>
          <strong>{summary.level}</strong>
          Level
        </span>
      </div>
      <p className="RankingsDuel-summaryMeta">
        {summary.edgeText} · {metaSuffix}
      </p>
    </div>
  );
}

function RankingDuelRow({
  metric,
  homeRankData,
  awayRankData,
  teamALabel,
  teamBLabel,
  totalTeams,
}) {
  const homeRank = homeRankData?.rank;
  const awayRank = awayRankData?.rank;
  const state = getRankEdgeState(
    homeRank,
    awayRank,
    totalTeams,
    metric.key,
    teamALabel,
    teamBLabel,
    homeRankData?.value,
    awayRankData?.value
  );
  const rowClassName = [
    "RankingsDuel-row",
    `RankingsDuel-row--${state.tone}`,
    state.intensity !== "none" ? `RankingsDuel-row--${state.intensity}` : "",
  ]
    .filter(Boolean)
    .join(" ");

  const ariaLabel = `${metric.label}. ${state.leader}. ${teamALabel} ${formatRank(
    homeRank,
    totalTeams
  )}. ${teamBLabel} ${formatRank(awayRank, totalTeams)}.`;

  return (
    <article className={rowClassName} aria-label={ariaLabel}>
      <h6 className="RankingsDuel-metric">{metric.label}</h6>
      <div className="RankingsDuel-duel">
        <div
          className={`RankingsDuel-team RankingsDuel-team--home${
            state.tone === "home" ? " RankingsDuel-team--leading" : ""
          }`}
        >
          <span
            className="RankingsDuel-teamDot RankingsDuel-teamDot--home"
            aria-hidden="true"
          />
          <span className="RankingsDuel-teamName">{teamALabel}</span>
          <span className="RankingsDuel-rank">
            {formatRank(homeRank, totalTeams)}
            {homeRankData?.value != null ? (
              <span className="RankingsDuel-value">({homeRankData.value})</span>
            ) : null}
          </span>
        </div>
        <div
          className={`RankingsDuel-team RankingsDuel-team--away${
            state.tone === "away" ? " RankingsDuel-team--leading" : ""
          }`}
        >
          <span
            className="RankingsDuel-teamDot RankingsDuel-teamDot--away"
            aria-hidden="true"
          />
          <span className="RankingsDuel-teamName">{teamBLabel}</span>
          <span className="RankingsDuel-rank">
            {formatRank(awayRank, totalTeams)}
            {awayRankData?.value != null ? (
              <span className="RankingsDuel-value">({awayRankData.value})</span>
            ) : null}
          </span>
        </div>
      </div>
      <p className="RankingsDuel-edge">{state.edgeText}</p>
    </article>
  );
}

function toTitleCase(str) {
  return str
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function sortMetricsByEdge(metrics, ranksHome, ranksAway, totalTeams, teamALabel, teamBLabel) {
  return [...metrics].sort((metricA, metricB) => {
    const homeA = ranksHome[metricA.key]?.rank;
    const awayA = ranksAway[metricA.key]?.rank;
    const homeB = ranksHome[metricB.key]?.rank;
    const awayB = ranksAway[metricB.key]?.rank;
    const stateA = getRankEdgeState(
      homeA,
      awayA,
      totalTeams,
      metricA.key,
      teamALabel,
      teamBLabel,
      ranksHome[metricA.key]?.value,
      ranksAway[metricA.key]?.value
    );
    const stateB = getRankEdgeState(
      homeB,
      awayB,
      totalTeams,
      metricB.key,
      teamALabel,
      teamBLabel,
      ranksHome[metricB.key]?.value,
      ranksAway[metricB.key]?.value
    );
    const edgeA = stateA.edge ?? -1;
    const edgeB = stateB.edge ?? -1;
    return edgeB - edgeA;
  });
}

export default function RankingsSection({
  title,
  metrics,
  ranksHome,
  ranksAway,
  teamALabel,
  teamBLabel,
  totalTeams,
}) {
  const sectionTitle = toTitleCase(title);
  const sortedMetrics = sortMetricsByEdge(
    metrics,
    ranksHome,
    ranksAway,
    totalTeams,
    teamALabel,
    teamBLabel
  );

  return (
    <section className="rankings-section" aria-labelledby={`rankings-${title}`}>
      <h5 className="section-title" id={`rankings-${title}`}>
        {sectionTitle}
      </h5>

      <div className="RankingsDuel-body">
        <SectionSummaryBar
          title={sectionTitle}
          metrics={metrics}
          ranksHome={ranksHome}
          ranksAway={ranksAway}
          teamALabel={teamALabel}
          teamBLabel={teamBLabel}
        />
        <div className="RankingsDuel-list">
          {sortedMetrics.map((metric) => (
            <RankingDuelRow
              key={metric.key}
              metric={metric}
              homeRankData={ranksHome[metric.key]}
              awayRankData={ranksAway[metric.key]}
              teamALabel={teamALabel}
              teamBLabel={teamBLabel}
              totalTeams={totalTeams}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
