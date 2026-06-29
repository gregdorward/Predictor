import { useEffect, useState } from "react";
import StatTable from "../StatTable";
import PlayerRankingTable from "../PlayerStatTable";
import { fetchCompetitionMetricRankings } from "./competitionLeagueExtrasData";

export default function CompetitionMetricRankings({ seasonId }) {
  const [rankingStats, setRankingStats] = useState(null);
  const [playerRankingStats, setPlayerRankingStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!seasonId) {
      return;
    }

    let cancelled = false;

    async function loadRankings() {
      setLoading(true);
      setRankingStats(null);
      setPlayerRankingStats(null);

      try {
        const data = await fetchCompetitionMetricRankings(seasonId);
        if (!cancelled) {
          setRankingStats(data.rankingStats);
          setPlayerRankingStats(data.playerRankingStats);
        }
      } catch {
        if (!cancelled) {
          setRankingStats(null);
          setPlayerRankingStats(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadRankings();

    return () => {
      cancelled = true;
    };
  }, [seasonId]);

  if (loading) {
    return null;
  }

  const hasTeamRankings = Boolean(rankingStats?.topTeams);
  const hasPlayerRankings = Boolean(playerRankingStats?.topPlayers);

  if (!hasTeamRankings && !hasPlayerRankings) {
    return null;
  }

  return (
    <>
      {hasTeamRankings && (
        <section className="Competition__section Competition__metricRankings">
          <h2 className="Competition__sectionHeading">
            League rankings by metric
          </h2>
          <StatTable rankingStats={rankingStats.topTeams} />
        </section>
      )}

      {hasPlayerRankings && (
        <section className="Competition__section Competition__metricRankings">
          <h2 className="Competition__sectionHeading">
            Player rankings by metric
          </h2>
          <PlayerRankingTable
            rankingStats={playerRankingStats.topPlayers}
          />
        </section>
      )}
    </>
  );
}
