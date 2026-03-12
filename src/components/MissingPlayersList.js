import React from 'react';

// 1. Individual Progress Bar Component
const ImpactBar = ({ score }) => {
  const numericScore = parseFloat(score) || 0;

  const getImpactClass = (val) => {
    if (val >= 8) return "impact-critical";
    if (val >= 6) return "impact-high";
    if (val >= 4) return "impact-medium";
    if (val >= 2) return "impact-low";
    return "impact-minimal";
  };

  const impactClass = getImpactClass(numericScore);
  const percentage = Math.min(numericScore * 10, 100);

  return (
    <div className="ImpactWrapper">
      <div className="ImpactBarBackground">
        <div
          className={`ImpactBarFill ${impactClass}`}
          style={{ width: `${percentage}%` }}
        />
        <span className="ImpactBarText">{numericScore.toFixed(1)}</span>
      </div>
    </div>
  );
};

const calculateDiminishingTotal = (sortedPlayers, key) => {
  return sortedPlayers.reduce((acc, p, index) => {
    const score = parseFloat(p[key] || 0);
    const statusMult = p.type === 'doubtful' ? 0.5 : 1.0;

    let positionMult = 1.0;
    if (index === 1) positionMult = 0.6;
    if (index >= 2) positionMult = 0.3;

    return acc + (score * statusMult * positionMult);
  }, 0);
};

// 2. New Summary Component (To be called once at the top of each column)
export const TeamImpactSummary = ({ players, teamName, onCalculate }) => {
  // 1. Move the data preparation to the top (ensure it's always an array)
  const safePlayers = players || [];

  const sortedByAtk = [...safePlayers].sort((a, b) => b.attackingImpactScore - a.attackingImpactScore);
  const sortedByDef = [...safePlayers].sort((a, b) => b.defensiveImpactScore - a.defensiveImpactScore);

  const totalAtk = calculateDiminishingTotal(sortedByAtk, 'attackingImpactScore');
  const totalDef = calculateDiminishingTotal(sortedByDef, 'defensiveImpactScore');

  const atkLoss = parseFloat(Math.min(10, totalAtk / 2).toFixed(1));
  const defLoss = parseFloat(Math.min(10, totalDef / 2).toFixed(1));

  // 2. The Hook is now guaranteed to run every single time
  React.useEffect(() => {
    if (onCalculate && safePlayers.length > 0) {
      onCalculate({ atk: atkLoss, def: defLoss });
    }
  }, [atkLoss, defLoss, onCalculate, safePlayers.length]);

  // 3. ONLY NOW do we return null if there's no data to show visually
  if (safePlayers.length === 0) return null;


  return (
    <div className="TeamImpactSummaryCard">
      <div className="PlayerIdentity">
        <div className="MissingPlayerName">{teamName}</div>
      </div>
      <div className="PlayerStatsRows">
        <div className="StatLine flex-col">
          <span className="MissingPlayerStatLabel">Attacking Threat Lost</span>
          <ImpactBar score={atkLoss} />
        </div>
        <div className="StatLine flex-col">
          <span className="MissingPlayerStatLabel">Defensive Solidity Lost</span>
          <ImpactBar score={defLoss} />
        </div>
      </div>
    </div>
  );
};

// 3. The List Component (Maps through individual players only)
const MissingPlayersList = ({ players = [], className }) => {
  return (
    <div className={`MissingPlayersList ${className}`}>
      {players.map((player, index) => (
        <div key={index} className="MissingPlayerCard">
          <div className="PlayerIdentity">
            <div className="MissingPlayerName">{player.name}</div>
            <div className="PlayerMeta">
              {player.type} - {player.reason}
            </div>
          </div>

          <div className="PlayerStatsRows">
            <div className="StatLine">
              <span className="MissingPlayerStatLabel">Position</span>
              <span className="StatValue">{player.position}</span>
            </div>

            <div className="StatLine flex-col">
              <span className="MissingPlayerStatLabel">Attacking Impact</span>
              <ImpactBar score={player.attackingImpactScore} />
            </div>

            <div className="StatLine flex-col">
              <span className="MissingPlayerStatLabel">Defensive Impact</span>
              <ImpactBar score={player.defensiveImpactScore} />
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