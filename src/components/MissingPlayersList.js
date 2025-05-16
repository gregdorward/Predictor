import React from 'react';

const MissingPlayersList = ({ players = [] }) => {
    return (
      <ul className="MissingPlayersList">
        {players.map((player, index) => (
          <li key={index} className="MissingPlayer flex items-center gap-4 p-2 rounded border border-gray-200 shadow-sm">
            {/* Colored circle */}
            <span
              className="MissingCircle w-3 h-3 rounded-full"
              style={{ backgroundColor: player.type }}
            ></span>
  
            {/* Player info */}
            <div className="flex flex-col">
              <span className="font-semibold">{player.name}</span>
              <span className="text-sm text-gray-600">
                Position: {player.position} — Reason: {player.reason}
              </span>
            </div>
          </li>
        ))}
      </ul>
    );
  };

export default MissingPlayersList;
