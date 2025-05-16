import React from "react";

const MissingPlayersList = ({ players = [], className, team }) => {
  return (
    <>
      <ul className={className}>
        {players.map((player, index) => (
          <li
            key={index}
            className="MissingPlayer"
          >
            {/* Player info */}
            <div className="flex flex-col">
              <span className="font-semibold">{player.name} </span>
              <span className="text-sm text-gray-600">
                - {player.type} - {player.reason } | ({player.position})
              </span>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
};

export default MissingPlayersList;
