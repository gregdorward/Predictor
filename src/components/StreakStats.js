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

          <ul className="StreakList">
            {streakList.map((stat, index) => (
              <li key={index} className="StreakRow">
                <div className="StreakTeamIcon">
                  {stat.team === "home" && (
                    <CreateBadge
                      image={homeLogo}
                      ClassName="StreakTeamIcon"
                      alt="Home team badge"
                      flexShrink={5}
                    />
                  )}
                  {stat.team === "away" && (
                    <CreateBadge
                      image={awayLogo}
                      ClassName="StreakTeamIcon"
                      alt="Away team badge"
                    />
                  )}
                  {stat.team === "both" && (
                    <>
                      <CreateBadge
                        image={homeLogo}
                        ClassName="StreakTeamIcon"
                        alt="Home team badge"
                        flexShrink={5}
                      />
                      <CreateBadge
                        image={awayLogo}
                        ClassName="StreakTeamIcon"
                        alt="Away team badge"
                      />
                    </>
                  )}
                </div>

                <div className="StreakLabel">{stat.name}</div>

                <div className="StreakValue">{stat.value}</div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};
