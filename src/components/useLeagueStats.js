import { useState, useEffect } from "react";

const useLeagueStats = () => {
  const [leagueStats, setLeagueStats] = useState({});

  const calculateStats = (fixtures) => {
    const stats = { ...leagueStats }; // Create a copy to avoid direct mutation

    fixtures.forEach((fixture) => {
      if (
        fixture.status === "complete" &&
        fixture.hasOwnProperty("prediction") &&
        fixture.omit !== true
      ) {
        const league = fixture.leagueDesc;

        if (!stats[league]) {
          stats[league] = {
            sumProfit: 0,
            investment: 0,
            exactScores: 0,
            successCount: 0,
          };
        }

        stats[league].sumProfit += fixture.profit;
        stats[league].investment += 1;

        if (fixture.exactScore === true) {
          stats[league].exactScores += 1;
        }

        if (fixture.predictionOutcome === "Won") {
          stats[league].successCount += 1;
        }
      }
    });

    setLeagueStats(stats); // Update state with new stats
  };

  return [leagueStats, calculateStats];
};

export default useLeagueStats;
