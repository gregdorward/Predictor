import {
  formatRank,
  formatRankDetail,
  getRankEdgeState,
  getSectionSummary,
} from "../utils/rankingsInsights";

function SectionSummaryTile({
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

  return (
    <article
      className={`RankingsHeatmap-tile RankingsHeatmap-summaryTile RankingsHeatmap-tile--${summary.tone} RankingsHeatmap-tile--medium`}
      aria-label={`${title} summary. ${summary.leader}. ${teamALabel} leads ${summary.home} metrics. ${teamBLabel} leads ${summary.away} metrics.`}
    >
      <div className="RankingsHeatmap-tileHeader">
        <span className="RankingsHeatmap-metric">{title} snapshot</span>
        <span
          className={`RankingsHeatmap-leader RankingsHeatmap-leader--${summary.tone}`}
        >
          {summary.leader}
        </span>
      </div>

      <div className="RankingsHeatmap-summaryScores">
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

      <div className="RankingsHeatmap-edge">
        {summary.edgeText}
        {summary.unavailable > 0
          ? ` · ${summary.unavailable} unavailable`
          : ` · ${summary.compared} compared`}
      </div>
    </article>
  );
}

function RankingHeatmapTile({
  metric,
  homeRankData,
  awayRankData,
  teamALabel,
  teamBLabel,
  totalTeams,
}) {
  const homeRank = homeRankData?.rank;
  const awayRank = awayRankData?.rank;
  const state = getRankEdgeState(homeRank, awayRank, totalTeams, metric.key);
  const tileClassName = [
    "RankingsHeatmap-tile",
    `RankingsHeatmap-tile--${state.tone}`,
    `RankingsHeatmap-tile--${state.intensity}`,
  ].join(" ");
  const title = `${metric.label}: ${teamALabel} ${formatRankDetail(
    homeRank,
    homeRankData,
    totalTeams
  )}; ${teamBLabel} ${formatRankDetail(awayRank, awayRankData, totalTeams)}`;

  return (
    <article
      className={tileClassName}
      title={title}
      aria-label={`${metric.label}. ${state.leader}. ${teamALabel} ${formatRank(
        homeRank,
        totalTeams
      )}. ${teamBLabel} ${formatRank(awayRank, totalTeams)}.`}
    >
      <div className="RankingsHeatmap-tileHeader">
        <span className="RankingsHeatmap-metric">{metric.label}</span>
        <span
          className={`RankingsHeatmap-leader RankingsHeatmap-leader--${state.tone}`}
        >
          {state.leader}
        </span>
      </div>

      <div className="RankingsHeatmap-ranks">
        <span className="RankingsHeatmap-teamRank">
          <span
            className="RankingsHeatmap-teamDot RankingsHeatmap-teamDot--home"
            aria-hidden="true"
          />
          <span className="RankingsHeatmap-teamLabel">{teamALabel}</span>
          <strong>{formatRank(homeRank, totalTeams)}</strong>
        </span>
        <span className="RankingsHeatmap-teamRank">
          <span
            className="RankingsHeatmap-teamDot RankingsHeatmap-teamDot--away"
            aria-hidden="true"
          />
          <span className="RankingsHeatmap-teamLabel">{teamBLabel}</span>
          <strong>{formatRank(awayRank, totalTeams)}</strong>
        </span>
      </div>

      <div className="RankingsHeatmap-edge">{state.edgeText}</div>
    </article>
  );
}

function toTitleCase(str) {
  return str
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
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
  return (
    <section className="rankings-section" aria-labelledby={`rankings-${title}`}>
      <h5 className="section-title" id={`rankings-${title}`}>
        {toTitleCase(title)}
      </h5>

      <div className="RankingsHeatmap-grid">
        <SectionSummaryTile
          title={toTitleCase(title)}
          metrics={metrics}
          ranksHome={ranksHome}
          ranksAway={ranksAway}
          teamALabel={teamALabel}
          teamBLabel={teamBLabel}
        />
        {metrics.map((metric) => (
          <RankingHeatmapTile
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
    </section>
  );
}
