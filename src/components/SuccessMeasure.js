import { useEffect } from "react";
import useLeagueStats from "./useLeagueStats";

const SuccessMeasure = ({ fixtures }) => {
  const [leagueStats, calculateStats] = useLeagueStats();

  // Calculate stats when fixtures change
  useEffect(() => {
    if (fixtures.length > 0) {
      calculateStats(fixtures); // Call to calculate stats whenever fixtures change
    }
  }, [fixtures, calculateStats]);

  return (
    <div id="successMeasure2">
      {Object.entries(leagueStats).map(([league, stats]) => {
        const { sumProfit, investment, exactScores, successCount } = stats;
        const netProfit = sumProfit - investment;
        const ROI = (netProfit / investment) * 100;
        const exactScoreHitRate = ((exactScores / investment) * 100).toFixed(1);
        const successRate = ((successCount / investment) * 100).toFixed(1);

        return (
          <div key={league}>
            <h3>{league}</h3>
            <p>{`ROI: ${ROI >= 0 ? "+" : ""}${ROI.toFixed(2)}%`}</p>
            <p>{`Exact Scores: ${exactScores} (${exactScoreHitRate}%)`}</p>
            <p>{`Success Count: ${successCount} (${successRate}%)`}</p>
          </div>
        );
      })}
    </div>
  );
};

export default SuccessMeasure;
