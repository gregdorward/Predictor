import React from "react";
import { CreateBadge } from "./createBadge";

export const StreakStats = ({ stats, home, away, homeLogo, awayLogo }) => {
  const categoryTitleMap = {
    general: "Recent Game",
    head2head: "Previous Meetings",
  };

  return (
    <div className="StreakStats">
      {Object.entries(stats).map(([category, streakList]) => (
        <div className="StreakCategory" key={category}>
          <h3>{categoryTitleMap[category] || category} Streaks</h3>

          <table className="StreakTable">
            <thead>
              <tr>
                <th className="TableTeamName">Team</th>
                <th>Streak</th>
                <th>Games</th>
                <th>Odds to continue streak</th>
              </tr>
            </thead>
            <tbody>
              {streakList.map((stat, index) => (
                <tr key={index} className="StreakRow">
                  <td className="StreakTeamIcon">
                    {stat.team === "home" && (
                      <CreateBadge image={homeLogo} alt="Home team badge" />
                    )}
                    {stat.team === "away" && (
                      <CreateBadge image={awayLogo} alt="Away team badge" />
                    )}
                    {stat.team === "both" && (
                      <div className="StreakBothBadges">
                        <CreateBadge image={homeLogo} alt="Home team badge" />
                        <CreateBadge image={awayLogo} alt="Away team badge" />
                      </div>
                    )}
                  </td>
                  <td className="StreakLabel">{stat.name}</td>
                  <td className="StreakValue"><span className="StreakValueSpan">{stat.value}</span></td>
                  <td className="StreakOdds">
                  <span className="StreakOddsSpan"> {stat.odds !== undefined
                      ? stat.odds === "N/A"
                        ? "N/A"
                        : `${stat.odds}`
                      : "–"}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};
