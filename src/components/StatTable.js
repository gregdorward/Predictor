import { useState } from "react";
import { FormControl, Select, MenuItem } from "@mui/material";

function mergeLeagueData(rankingStats) {
  const mergedTeams = {};

  // Iterate over every category (accurateCrosses, bigChances, etc.)
  Object.keys(rankingStats).forEach((category) => {
    const teamArray = rankingStats[category];

    if (Array.isArray(teamArray)) {
      teamArray.forEach((entry) => {
        const teamId = entry.team.id;

        // If this team isn't in our merged object yet, initialize it
        if (!mergedTeams[teamId]) {
          mergedTeams[teamId] = {
            team: entry.team,
            statistics: { matches: entry.statistics.matches }
          };
        }

        // Add the specific metric to this team's statistics object
        // Example: team.statistics['bigChances'] = 45
        mergedTeams[teamId].statistics[category] = entry.statistics[category];
      });
    }
  });

  // Convert the object back into an array for .map()
  return Object.values(mergedTeams);
}

/**
 * Processes raw league statistics to derive tactical and efficiency metrics.
 * @param {Array} leagueData - The array of team objects from your JSON.
 * @returns {Array} - Team objects with new calculated analytical metrics.
 */
function deriveLeagueAnalytics(leagueData) {
  console.log("Raw League Data for Analytics:", leagueData);
  return leagueData.map(entry => {
    const stats = entry.statistics;
    const matches = stats.matches || 1; // Prevent division by zero

    return {
      teamName: entry.team.name,
      // 1. Efficiency Metrics
      conversionRate: (stats.goalsScored / stats.shotsOnTarget) || 0,
      bigChanceConversion: (stats.goalsScored / stats.bigChances) || 0,
      ShotQualityIndex: stats.bigChances / stats.shots,
      // 2. Tactical Style Metrics
      longBallPercent: (stats.accurateLongBalls / stats.accuratePasses) * 100,
      passesPerMatch: stats.accuratePasses / matches,
      crossingReliance: (stats.accurateCrosses / stats.accuratePasses) * 100,

      // 3. Defensive Proactivity (Proxy for PPDA/High Press)
      defensiveActionsPerMatch: (stats.tackles + stats.interceptions + stats.fouls) / matches,
      attackingActionsPerMatch: (
        stats.shots +
        stats.successfulDribbles +
        stats.corners +
        stats.accurateCrosses
      ) / matches,
      aggressionIndex: stats.fouls / (stats.tackles + stats.interceptions) || 0,

      // 4. Discipline and Pressure
      disciplineRatio: (stats.yellowCards + stats.redCards) / stats.fouls || 0,
    };
  });
}

const formatLabel = (key) =>
  key
    .replace(/([A-Z])/g, " $1") // Add space before capital letters
    .replace(/^./, (str) => str.toUpperCase()); // Capitalize first letter

const RankingTable = ({ rankingStats }) => {
  // const unifiedLeagueData = mergeLeagueData(rankingStats);
  // const dataAnalysis = deriveLeagueAnalytics(unifiedLeagueData);
  // console.log("Derived Analytics:", dataAnalysis);

  const statKeys = Object.keys(rankingStats);
  const [selectedStat, setSelectedStat] = useState(statKeys[0]);
  console.log(rankingStats)
  const handleChange = (e) => {
    setSelectedStat(e.target.value);
  };

  const data = rankingStats[selectedStat];

  return (
    <div className="LeagueStatsTable">
      <FormControl
        sx={{
          marginBottom: 2,
          marginTop: 1,
          width: "90%",
          "& .MuiOutlinedInput-root": {
            backgroundColor: "#f0f0f0",
            fontSize: "1.25em",
            width: "50%",
            marginLeft: "auto",
            marginRight: "auto",
            fontFamily: "'Open Sans', sans-serif",
            height: "2em",
            color: "#fe8c00",
            borderRadius: 2,
            "& .MuiSelect-icon": {
              color: "#fe8c00",
            },
            "& fieldset": {
              borderColor: "#ccc !important",
              borderWidth: "0px",
            },
            "&:hover fieldset": {
              borderWidth: "0px",
            },
            "&.Mui-focused fieldset": {
              borderWidth: "0px",
            },
          },
        }}
      >
        <Select
          labelId="stat-select-label"
          id="stat-select"
          value={selectedStat}
          label="Choose a stat"
          onChange={handleChange}
          displayEmpty
        >
          {statKeys.map((key) => (
            <MenuItem key={key} value={key}>
              {formatLabel(key)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <table
        style={{ marginTop: "1em", borderCollapse: "collapse", width: "95%" }}
      >
        <thead>
          <tr>
            <th>Rank</th>
            <th>Team</th>
            <th>Matches</th>
            <th>{formatLabel(selectedStat)}</th>
          </tr>
        </thead>
        <tbody>
          {data.map(({ team, statistics }, index) => (
            <tr key={team.id}>
              <td>{index + 1}</td>
              <td>{team.name}</td>
              <td>{statistics.matches}</td>
              <td>
                {typeof statistics[selectedStat] === "number"
                  ? Number.isInteger(statistics[selectedStat])
                    ? statistics[selectedStat]
                    : statistics[selectedStat].toFixed(2)
                  : statistics[selectedStat] ?? "N/A"}
              </td>{" "}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RankingTable;
