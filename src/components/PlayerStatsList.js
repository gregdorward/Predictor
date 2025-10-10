import { useState } from "react";
import Collapsable from "./CollapsableElement";


const formatLabel = (key) =>
  key
    .replace(/([A-Z])/g, " $1") // Add space before capital letters
    .replace(/^./, (str) => str.toUpperCase()); // Capitalize first letter

const PlayerStatsList = ({ playerStats, className, spanClass }) => {
  const [expandedPlayers, setExpandedPlayers] = useState([]);
  const [activeIframePlayerId, setActiveIframePlayerId] = useState(null);


  const toggleAll = (expand) => {
    setExpandedPlayers(expand ? playerStats.map((p) => p.playerName) : []);
  };

  const togglePlayer = (playerName, shouldOpen) => {
    setExpandedPlayers((prev) => {
      const alreadyOpen = prev.includes(playerName);
      if (shouldOpen && !alreadyOpen) {
        return [...prev, playerName];
      }
      if (!shouldOpen && alreadyOpen) {
        return prev.filter((name) => name !== playerName);
      }
      return prev; // No change
    });
  };

  return (
    <div className={className}>
      <button className="ExpandCollapse" onClick={() => toggleAll(true)}>
        Expand All
      </button>
      <button className="ExpandCollapse" onClick={() => toggleAll(false)}>
        Collapse All
      </button>

      {playerStats.map((player) => (
        <Collapsable
          key={player.playerName}
          buttonText={player.playerName}
          buttonImage={player.playerImage}
          classNameButton="PlayerToggleButton"
          isOpen={expandedPlayers.includes(player.playerName)}
          onTriggerOpening={() => togglePlayer(player.playerName, true)}
          onTriggerClosing={() => togglePlayer(player.playerName, false)}
          element={
            <ul className={className}>
              <button
                className="OpenStatsButton"
                onClick={() => setActiveIframePlayerId(player.playerId)}
              >
                View Attributes
              </button>

              {player.rankings.map((ranking) => (
                <li key={ranking.metric} className="PlayerStatItem">
                  {className === "AwayPlayerStats" ? (
                    <>
                      <span
                        className={`StatBall LeftBall${ranking.rank === 1 ? " Gold" : ""
                          }`}
                      >
                        {ranking.rank}
                      </span>
                      <span className="StatLabel">
                        {formatLabel(ranking.metric)}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="StatLabel">
                        {formatLabel(ranking.metric)}
                      </span>
                      <span
                        className={`StatBall RightBall${ranking.rank === 1 ? " Gold" : ""
                          }`}
                      >
                        {ranking.rank}
                      </span>
                    </>
                  )}
                </li>
              ))}
            </ul>
          }
        />
      ))}
      {activeIframePlayerId && (
        <div className="IframeModalOverlay" onClick={() => setActiveIframePlayerId(null)}>
          <div className="IframeModalContent" onClick={(e) => e.stopPropagation()}>
            <button className="CloseModalButton" onClick={() => setActiveIframePlayerId(null)}>
              Close
            </button>
            <iframe
              src={`https://widgets.sofascore.com/en/embed/player/${activeIframePlayerId}?widgetTheme=dark`}
              className="SofaScoreIframe"
              frameBorder="0"
              scrolling="no"
              title="SofaScore Player"
            />
          </div>
        </div>
      )}
    </div>

  );
};

export default PlayerStatsList;
