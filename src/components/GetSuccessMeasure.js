import {useEffect} from "react";
import CollapsableStats from "./leagueStatsCollapsable";

const useLeagueStats = () => {
  const [leagueStats, setLeagueStats] = React.useState({});

  const updateLeagueStats = React.useCallback((leagueName, updates) => {
    setLeagueStats((prevStats) => {
      const prevLeagueStats = prevStats[leagueName] || {};
      const newStats =
        typeof updates === "function" ? updates(prevLeagueStats) : updates;

      return {
        ...prevStats,
        [leagueName]: {
          ...prevLeagueStats,
          ...newStats,
        },
      };
    });
  }, []);

  return { leagueStats, updateLeagueStats };
};

const SuccessMeasure = ({ fixtures }) => {
  const { leagueStats, updateLeagueStats } = useLeagueStats();
  const [totalStats, setTotalStats] = React.useState({
    totalProfit: 0,
    totalInvestment: 0,
    totalROI: 0,
  });

  const [processedFixtures, setProcessedFixtures] = React.useState(new Set());

  useEffect(() => {
    let sumProfit = 0;
    let investment = 0;
    let exactScores = 0;
    let successCount = 0;

    const newProcessedFixtures = new Set(processedFixtures);

    fixtures.forEach((fixture) => {
      if (
        fixture.status === "complete" &&
        fixture.hasOwnProperty("prediction") &&
        fixture.omit !== true &&
        !processedFixtures.has(fixture.id) // Avoid reprocessing
      ) {
        const leagueName = fixture.leagueDesc || "Unknown League";

        // Mark this fixture as processed
        newProcessedFixtures.add(fixture.id);

        // Update overall stats
        sumProfit += fixture.profit;
        investment += 1;

        if (fixture.exactScore) exactScores += 1;
        if (fixture.predictionOutcome === "Won") successCount += 1;

        // Update league-specific stats
        const leagueProfit = fixture.profit;
        updateLeagueStats(leagueName, (prevLeagueStats) => {
          const updatedInvestment = (prevLeagueStats?.investment || 0) + 1;
          const updatedProfit = (prevLeagueStats?.sumProfit || 0) + leagueProfit;
          const netProfit = updatedProfit - updatedInvestment;
          const leagueROI = (netProfit / updatedInvestment) * 100;

          return {
            sumProfit: updatedProfit,
            investment: updatedInvestment,
            successCount:
              (prevLeagueStats?.successCount || 0) +
              (fixture.predictionOutcome === "Won" ? 1 : 0),
            exactScores:
              (prevLeagueStats?.exactScores || 0) +
              (fixture.exactScore === true ? 1 : 0),
            roi: leagueROI.toFixed(2),
          };
        });
      }
    });

    // Update total stats only if new fixtures were processed
    if (newProcessedFixtures.size > processedFixtures.size) {
      const netProfit = sumProfit - investment;
      const ROI = (netProfit / investment) * 100;

      setTotalStats((prev) => ({
        totalProfit: prev.totalProfit + netProfit,
        totalInvestment: prev.totalInvestment + investment,
        totalROI:
          ((prev.totalProfit + netProfit) /
            (prev.totalInvestment + investment)) *
          100,
      }));

      // Update processed fixtures
      setProcessedFixtures(newProcessedFixtures);
    }
  }, [fixtures, processedFixtures, updateLeagueStats]);

  return (
    <>
      <div className="SuccessMeasure">
        <h3>
          Cumulative ROI: {totalStats.totalROI >= 0 ? "+" : ""}
          {totalStats.totalROI.toFixed(2)}%
        </h3>
        <p>Total Profit: {totalStats.totalProfit.toFixed(2)}</p>
        <p>Total Investment: {totalStats.totalInvestment}</p>
      </div>
      <CollapsableStats buttonText="League Breakdown">
        {Object.keys(leagueStats).map((leagueName) => {
          const {
            roi = 0,
            successCount = 0,
            exactScores = 0,
          } = leagueStats[leagueName] || {};
          return (
            <div className="SuccessMeasure" key={leagueName}>
              <h3>
                {leagueName}: ROI {roi >= 0 ? "+" : ""}
                {roi}%
              </h3>
              <p>Successful Predictions: {successCount}</p>
              <p>Exact Scores: {exactScores}%</p>
            </div>
          );
        })}
      </CollapsableStats>
    </>
  );
};

export default SuccessMeasure;
