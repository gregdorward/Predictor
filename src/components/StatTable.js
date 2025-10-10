import { useState } from "react";
import { FormControl, Select, MenuItem } from "@mui/material";

// Utility to convert camelCase or mixedCase to "Proper Case With Spaces"
const formatLabel = (key) =>
  key
    .replace(/([A-Z])/g, " $1") // Add space before capital letters
    .replace(/^./, (str) => str.toUpperCase()); // Capitalize first letter

const RankingTable = ({ rankingStats }) => {
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
