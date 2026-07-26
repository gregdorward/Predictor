import { useState } from "react";

const formatLabel = (key) =>
  key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase());

const sortRankings = (rankings = []) =>
  [...rankings].sort((a, b) => a.rank - b.rank);

const KeyPlayerCard = ({ player, onViewAttributes }) => {
  if (!player) {
    return (
      <div className="KeyPlayerCard KeyPlayerCard--empty" aria-hidden="true" />
    );
  }

  const rankings = sortRankings(player.rankings);
  const rankingCount = rankings.length;

  return (
    <article className="KeyPlayerCard">
      <header className="KeyPlayerCardHeader">
        {player.playerImage ? (
          <img
            src={player.playerImage}
            alt=""
            className="player-image-thumb"
          />
        ) : (
          <span
            className="player-image-thumb KeyPlayerCardThumbPlaceholder"
            aria-hidden="true"
          />
        )}
        <div className="KeyPlayerCardIdentity">
          <h3 className="KeyPlayerCardName">{player.playerName}</h3>
          <p className="KeyPlayerCardMeta">
            {rankingCount} league ranking
            {rankingCount === 1 ? "" : "s"}
          </p>
        </div>
      </header>

      <ul className="KeyPlayerRankChips">
        {rankings.map((ranking) => (
          <li
            key={ranking.metric}
            className={`KeyPlayerRankChip${
              ranking.rank === 1 ? " KeyPlayerRankChip--gold" : ""
            }`}
          >
            <span
              className={`StatBall${ranking.rank === 1 ? " Gold" : ""}`}
            >
              {ranking.rank}
            </span>
            <span className="StatLabel">{formatLabel(ranking.metric)}</span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        className="OpenStatsButton"
        onClick={() => onViewAttributes(player.playerId)}
      >
        View Attributes
      </button>
    </article>
  );
};

const PlayerStatsList = ({
  homePlayerStats = [],
  awayPlayerStats = [],
}) => {
  const [activeIframePlayerId, setActiveIframePlayerId] = useState(null);
  const rowCount = Math.max(homePlayerStats.length, awayPlayerStats.length);

  return (
    <>
      <div className="PlayerStats KeyPlayersGrid">
        {Array.from({ length: rowCount }, (_, index) => index).flatMap(
          (index) => {
            const home = homePlayerStats[index] || null;
            const away = awayPlayerStats[index] || null;

            return [
              <KeyPlayerCard
                key={home?.playerId || `home-empty-${index}`}
                player={home}
                onViewAttributes={setActiveIframePlayerId}
              />,
              <KeyPlayerCard
                key={away?.playerId || `away-empty-${index}`}
                player={away}
                onViewAttributes={setActiveIframePlayerId}
              />,
            ];
          }
        )}
      </div>

      {activeIframePlayerId && (
        <div
          className="IframeModalOverlay"
          onClick={() => setActiveIframePlayerId(null)}
        >
          <div
            className="IframeModalContent"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="CloseModalButton"
              onClick={() => setActiveIframePlayerId(null)}
            >
              Close
            </button>
            <iframe
              src={`https://widgets.sofascore.com/en/embed/player/${activeIframePlayerId}?widgetTheme=dark`}
              className="StatWebsiteIframe"
              frameBorder="0"
              scrolling="no"
              title="Industry Stat Website Player"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default PlayerStatsList;
