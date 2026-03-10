const MissingPlayersList = ({ players = [], className, team }) => {
  return (
    <div className={`MissingPlayersList ${className}`}>
      {players.map((player, index) => (
        <div key={index} className="MissingPlayerCard">
          {/* Header Info */}
          <div className="PlayerIdentity">
            <div className="MissingPlayerName">{player.name}</div>
            <div className="PlayerMeta">
              {player.type} - {player.reason}
            </div>
          </div>

          {/* Stats Section */}
          <div className="PlayerStatsRows">
            <div className="StatLine">
              <span className="MissingPlayerStatLabel">Position</span>
              <span className="StatValue">{player.position}</span>
            </div>
            <div className="StatLine">
              <span className="MissingPlayerStatLabel">Attacking Impact (0 - 10)</span>
              <span className="StatValue">{player.attackingImpactScore}</span>
            </div>
            <div className="StatLine">
              <span className="MissingPlayerStatLabel">Defensive Impact (0 - 10)</span>
              <span className="StatValue">{player.defensiveImpactScore}</span>
            </div>
            <div className="StatLine">
              <span className="MissingPlayerStatLabel">Appearances</span>
              <span className="StatValue">{player.appearances}</span>
            </div>
            <div className="StatLine">
              <span className="MissingPlayerStatLabel">Goals</span>
              <span className="StatValue">{player.goals}</span>
            </div>
            <div className="StatLine">
              <span className="MissingPlayerStatLabel">Assists</span>
              <span className="StatValue">{player.assists}</span>
            </div>
            <div className="StatLine">
              <span className="MissingPlayerStatLabel">Average Rating</span>
              <span className="StatValue">{player.rating?.toFixed(2)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
export default MissingPlayersList;
