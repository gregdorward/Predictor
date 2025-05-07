import RankingsSection from "../components/RankingsSection";

export default function TeamRankingsFlexView({
  title,
  ranksHome,
  ranksAway,
  teamALabel,
  teamBLabel,
}) {
  const allMetrics = Object.keys(ranksHome); // assumes both have same keys

  const ATTACKING_METRICS = [
    "goalsScored",
    "shotsOnTarget",
    "shots",
    "bigChances",
    "bigChancesMissed",
    "hitWoodwork",
    "corners",
    "penaltyGoals",
    "successfulDribbles",
  ];

  const PASSING_METRICS = [
    "averageBallPossession",
    "accuratePasses",
    "accurateLongBalls",
    "accurateCrosses",
  ];

  const MISC_METRICS = ["avgRating", "redCards", "yellowCards", "fouls"];

  const DEFENSIVE_METRICS = [
    "goalsConceded",
    "cleanSheets",
    "tackles",
    "clearances",
    "interceptions",
    "penaltyGoalsConceded",
  ];

  // Helper to map an array of keys to label/key pairs
  const mapMetrics = (keys) =>
    keys
      .filter((k) => allMetrics.includes(k))
      .map((key) => ({ key, label: toLabel(key) }));

  const attackingMetrics = mapMetrics(ATTACKING_METRICS);
  const passingMetrics = mapMetrics(PASSING_METRICS);
  const defensiveMetrics = mapMetrics(DEFENSIVE_METRICS);
  const miscMetrics = mapMetrics(MISC_METRICS);

  return (
    <div className="rankings-container">
      <h3 className="rankings-title">{title}</h3>

      {attackingMetrics.length > 0 && (
        <RankingsSection
          title="Attacking"
          metrics={attackingMetrics}
          ranksHome={ranksHome}
          ranksAway={ranksAway}
          teamALabel={teamALabel}
          teamBLabel={teamBLabel}
        />
      )}

      {passingMetrics.length > 0 && (
        <RankingsSection
          title="Passing"
          metrics={passingMetrics}
          ranksHome={ranksHome}
          ranksAway={ranksAway}
          teamALabel={teamALabel}
          teamBLabel={teamBLabel}
        />
      )}

      {defensiveMetrics.length > 0 && (
        <RankingsSection
          title="Defensive"
          metrics={defensiveMetrics}
          ranksHome={ranksHome}
          ranksAway={ranksAway}
          teamALabel={teamALabel}
          teamBLabel={teamBLabel}
        />
      )}

      {miscMetrics.length > 0 && (
        <RankingsSection
          title="Miscellaneous"
          metrics={miscMetrics}
          ranksHome={ranksHome}
          ranksAway={ranksAway}
          teamALabel={teamALabel}
          teamBLabel={teamBLabel}
        />
      )}
    </div>
  );
}

function toLabel(camel) {
  return camel
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase());
}

