function ordinal(rank) {
  const suffixes = ["th", "st", "nd", "rd"];
  const mod100 = rank % 100;
  const mod10 = rank % 10;
  const suffix =
    mod100 >= 11 && mod100 <= 13
      ? "th"
      : suffixes[mod10] || "th";
  return `${rank}${suffix}`;
}

function formatRank(rank, totalTeams) {
  if (rank == null) return "No rank";

  return totalTeams ? `${ordinal(rank)} of ${totalTeams}` : ordinal(rank);
}

function formatRankDetail(rank, rankData, totalTeams) {
  let detail = formatRank(rank, totalTeams);
  if (rankData?.value != null) {
    detail += ` · ${rankData.value}`;
  }

  return detail;
}

function getRankEdgeState(homeRank, awayRank, totalTeams) {
  if (homeRank == null || awayRank == null) {
    return {
      tone: "neutral",
      intensity: "none",
      leader: "Unavailable",
      edgeText: "Ranking data missing",
    };
  }

  if (homeRank === awayRank) {
    return {
      tone: "level",
      intensity: "none",
      leader: "Level",
      edgeText: "Same rank",
    };
  }

  const edge = Math.abs(homeRank - awayRank);
  const edgeRatio = totalTeams > 1 ? edge / (totalTeams - 1) : 0;
  const intensity =
    edge >= 6 || edgeRatio >= 0.35
      ? "strong"
      : edge >= 3 || edgeRatio >= 0.18
      ? "medium"
      : "subtle";

  return {
    tone: homeRank < awayRank ? "home" : "away",
    intensity,
    leader: homeRank < awayRank ? "Home edge" : "Away edge",
    edgeText: `${edge} rank edge`,
  };
}

function getSectionSummary(metrics, ranksHome, ranksAway, teamALabel, teamBLabel) {
  const summary = metrics.reduce(
    (acc, metric) => {
      const homeRank = ranksHome[metric.key]?.rank;
      const awayRank = ranksAway[metric.key]?.rank;

      if (homeRank == null || awayRank == null) {
        acc.unavailable += 1;
      } else if (homeRank === awayRank) {
        acc.level += 1;
      } else if (homeRank < awayRank) {
        acc.home += 1;
      } else {
        acc.away += 1;
      }

      return acc;
    },
    { home: 0, away: 0, level: 0, unavailable: 0 }
  );
  const compared = metrics.length - summary.unavailable;
  const tone =
    summary.home === summary.away
      ? "level"
      : summary.home > summary.away
      ? "home"
      : "away";
  const leader =
    tone === "level"
      ? "Category level"
      : `${tone === "home" ? teamALabel : teamBLabel} leads`;
  const edge = Math.abs(summary.home - summary.away);
  const edgeText =
    edge === 0
      ? `${summary.home}-${summary.away} across compared metrics`
      : `${edge} metric edge`;

  return {
    ...summary,
    compared,
    tone,
    leader,
    edgeText,
  };
}

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
  const state = getRankEdgeState(homeRank, awayRank, totalTeams);
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
