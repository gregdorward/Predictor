function ordinal(rank) {
  const suffixes = ["th", "st", "nd", "rd"];
  const mod100 = rank % 100;
  const suffix =
    mod100 >= 11 && mod100 <= 13
      ? "th"
      : suffixes[Math.min(rank % 10, 3)] || "th";
  return `${rank}${suffix}`;
}

function formatMarkerTitle(rank, rankData, teamLabel, totalTeams) {
  if (rank == null) return "";

  let title = `${teamLabel}: ${ordinal(rank)} of ${totalTeams}`;

  if (rankData?.value != null) {
    title += ` · ${rankData.value}`;
  }

  return title;
}

function RankComparisonBar({
  homeRank,
  awayRank,
  homeRankData,
  awayRankData,
  totalTeams,
  homeLabel,
  awayLabel,
}) {
  if (!totalTeams || totalTeams < 2) {
    return <span className="RankComparisonBar-empty">—</span>;
  }

  if (homeRank == null && awayRank == null) {
    return <span className="RankComparisonBar-empty">—</span>;
  }

  const rankToPercent = (rank) =>
    ((rank - 1) / Math.max(totalTeams - 1, 1)) * 100;

  const homeBetter =
    homeRank != null && awayRank != null && homeRank < awayRank;
  const awayBetter =
    homeRank != null && awayRank != null && awayRank < homeRank;

  const homePct = homeRank != null ? rankToPercent(homeRank) : null;
  const awayPct = awayRank != null ? rankToPercent(awayRank) : null;
  const isTied =
    homeRank != null && awayRank != null && homeRank === awayRank;
  const isClustered =
    !isTied &&
    homePct != null &&
    awayPct != null &&
    Math.abs(homePct - awayPct) < 5;

  return (
    <div
      className={`RankComparisonBar${
        isClustered || isTied ? " is-clustered" : ""
      }`}
      role="img"
      aria-label={`${homeLabel} rank ${homeRank ?? "unknown"}, ${awayLabel} rank ${awayRank ?? "unknown"} of ${totalTeams}`}
    >
      <div className="RankComparisonBar-track">
        <div className="RankComparisonBar-scale">
          <div className="RankComparisonBar-zones" aria-hidden="true">
            <span className="RankComparisonBar-zone RankComparisonBar-zone--top" />
            <span className="RankComparisonBar-zone RankComparisonBar-zone--mid" />
            <span className="RankComparisonBar-zone RankComparisonBar-zone--bottom" />
          </div>

          {isTied ? (
            <div
              className="RankComparisonBar-marker RankComparisonBar-marker--tied"
              style={{ left: `${homePct}%` }}
              title={`${homeLabel} & ${awayLabel}: ${ordinal(
                homeRank
              )} of ${totalTeams}`}
            >
              <span className="RankComparisonBar-rank">{homeRank}</span>
              <span className="RankComparisonBar-dots" aria-hidden="true">
                <span className="RankComparisonBar-dot RankComparisonBar-dot--home" />
                <span className="RankComparisonBar-dot RankComparisonBar-dot--away" />
              </span>
            </div>
          ) : (
            <>
              {homeRank != null && (
                <div
                  className={`RankComparisonBar-marker RankComparisonBar-marker--home${
                    homeBetter ? " is-leading" : ""
                  }`}
                  style={{ left: `${homePct}%` }}
                  title={formatMarkerTitle(
                    homeRank,
                    homeRankData,
                    homeLabel,
                    totalTeams
                  )}
                >
                  <span className="RankComparisonBar-rank">{homeRank}</span>
                  <span
                    className="RankComparisonBar-dot RankComparisonBar-dot--home"
                    aria-hidden="true"
                  />
                </div>
              )}

              {awayRank != null && (
                <div
                  className={`RankComparisonBar-marker RankComparisonBar-marker--away${
                    awayBetter ? " is-leading" : ""
                  }`}
                  style={{ left: `${awayPct}%` }}
                  title={formatMarkerTitle(
                    awayRank,
                    awayRankData,
                    awayLabel,
                    totalTeams
                  )}
                >
                  <span className="RankComparisonBar-rank">{awayRank}</span>
                  <span
                    className="RankComparisonBar-dot RankComparisonBar-dot--away"
                    aria-hidden="true"
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
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

      <div className="rankings-row header">
        <div className="ranking-metric">Metric</div>
        <div className="ranking-comparison">Competition Rank</div>
      </div>

      {metrics.map((metric) => {
        const homeRank = ranksHome[metric.key]?.rank;
        const awayRank = ranksAway[metric.key]?.rank;
        const homeBetter =
          homeRank != null && awayRank != null && homeRank < awayRank;
        const awayBetter =
          homeRank != null && awayRank != null && awayRank < homeRank;

        return (
          <div
            key={metric.key}
            className={`rankings-row${
              homeBetter || awayBetter ? " has-leader" : ""
            }`}
          >
            <div className="ranking-metric">{metric.label}</div>

            <div className="ranking-comparison">
              <RankComparisonBar
                homeRank={homeRank}
                awayRank={awayRank}
                homeRankData={ranksHome[metric.key]}
                awayRankData={ranksAway[metric.key]}
                totalTeams={totalTeams}
                homeLabel={teamALabel}
                awayLabel={teamBLabel}
              />
            </div>
          </div>
        );
      })}
    </section>
  );
}
