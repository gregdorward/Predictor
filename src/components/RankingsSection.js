import { useState } from "react";
import {
  formatRank,
  getRankEdgeState,
  getSectionSummary,
} from "../utils/rankingsInsights";

const COLLAPSED_ROW_LIMIT = 5;
const LOCKED_PREVIEW_ROWS = 2;

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
  const rowClassName = ["RankingsDuel-row"].filter(Boolean).join(" ");

  const edgeSuffix =
    state.edge != null && state.edge > 0
      ? ` by ${state.edge} rank${state.edge === 1 ? "" : "s"}`
      : "";

  const ariaLabel = `${metric.label}. ${state.leader}${edgeSuffix}. ${teamALabel} ${formatRank(
    homeRank,
    totalTeams
  )}. ${teamBLabel} ${formatRank(awayRank, totalTeams)}.`;

  const homeLeading = state.tone === "home";
  const awayLeading = state.tone === "away";
  const homeTrailing = state.tone === "away";
  const awayTrailing = state.tone === "home";

  return (
    <article className={rowClassName} aria-label={ariaLabel}>
      <div className="RankingsDuel-metricHead">
        <h6 className="RankingsDuel-metric">{metric.label}</h6>
        <p
          className={`RankingsDuel-outcome RankingsDuel-outcome--${state.tone}`}
        >
          <span className="RankingsDuel-outcomeLabel">{state.leader}</span>
          {edgeSuffix ? (
            <span className="RankingsDuel-outcomeEdge">{edgeSuffix.trim()}</span>
          ) : null}
        </p>
      </div>
      <div
        className={`RankingsDuel-duel RankingsDuel-duel--${state.tone}`}
      >
        <div
          className={`RankingsDuel-team RankingsDuel-team--home${
            homeLeading ? " RankingsDuel-team--leading" : ""
          }${homeTrailing ? " RankingsDuel-team--trailing" : ""}${
            homeLeading && state.intensity === "strong"
              ? " RankingsDuel-team--edgeStrong"
              : ""
          }`}
        >
          <span
            className="RankingsDuel-teamDot RankingsDuel-teamDot--home"
            aria-hidden="true"
          />
          <span className="RankingsDuel-teamNameRow">
            <span className="RankingsDuel-teamName">{teamALabel}</span>
            {homeLeading ? (
              <span className="RankingsDuel-leadBadge">Leads</span>
            ) : null}
          </span>
          <span className="RankingsDuel-rank">
            {formatRank(homeRank, totalTeams)}
            {homeRankData?.value != null ? (
              <span className="RankingsDuel-value">({homeRankData.value})</span>
            ) : null}
          </span>
        </div>
        <div
          className={`RankingsDuel-team RankingsDuel-team--away${
            awayLeading ? " RankingsDuel-team--leading" : ""
          }${awayTrailing ? " RankingsDuel-team--trailing" : ""}${
            awayLeading && state.intensity === "strong"
              ? " RankingsDuel-team--edgeStrong"
              : ""
          }`}
        >
          <span
            className="RankingsDuel-teamDot RankingsDuel-teamDot--away"
            aria-hidden="true"
          />
          <span className="RankingsDuel-teamNameRow">
            <span className="RankingsDuel-teamName">{teamBLabel}</span>
            {awayLeading ? (
              <span className="RankingsDuel-leadBadge">Leads</span>
            ) : null}
          </span>
          <span className="RankingsDuel-rank">
            {formatRank(awayRank, totalTeams)}
            {awayRankData?.value != null ? (
              <span className="RankingsDuel-value">({awayRankData.value})</span>
            ) : null}
          </span>
        </div>
      </div>
    </article>
  );
}

function RankingDuelRowWithLock({ locked, rowIndex, ...rowProps }) {
  const premiumLocked = locked && rowIndex >= LOCKED_PREVIEW_ROWS;
  if (!premiumLocked) {
    return <RankingDuelRow {...rowProps} />;
  }
  return (
    <div className="RankingsDuel-row--premiumLocked">
      <RankingDuelRow {...rowProps} />
    </div>
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
  locked = false,
}) {
  const [expanded, setExpanded] = useState(false);
  const sectionTitle = toTitleCase(title);
  const sortedMetrics = sortMetricsByEdge(
    metrics,
    ranksHome,
    ranksAway,
    totalTeams,
    teamALabel,
    teamBLabel
  );
  const visibleMetrics =
    locked || expanded
      ? sortedMetrics
      : sortedMetrics.slice(0, COLLAPSED_ROW_LIMIT);
  const hiddenCount = sortedMetrics.length - COLLAPSED_ROW_LIMIT;
  const showExpand = !locked && hiddenCount > 0;

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
          {visibleMetrics.map((metric, rowIndex) => (
            <RankingDuelRowWithLock
              key={metric.key}
              locked={locked}
              rowIndex={rowIndex}
              metric={metric}
              homeRankData={ranksHome[metric.key]}
              awayRankData={ranksAway[metric.key]}
              teamALabel={teamALabel}
              teamBLabel={teamBLabel}
              totalTeams={totalTeams}
            />
          ))}
        </div>
        {showExpand ? (
          <button
            type="button"
            className="RankingsDuel-expand"
            aria-expanded={expanded}
            onClick={() => setExpanded((open) => !open)}
          >
            {expanded
              ? "Show fewer metrics"
              : `Show ${hiddenCount} more metric${hiddenCount === 1 ? "" : "s"} in ${sectionTitle}`}
          </button>
        ) : null}
      </div>
    </section>
  );
}
