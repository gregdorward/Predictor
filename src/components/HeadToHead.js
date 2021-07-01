import React from "react";

function HeadToHead(props) {

  return (
    <ul className={props.className} style={props.style}>
      <li key="Stadium" className="Stadium" data-cy={props.name + "Stadium"}>
        {`Venue - ${props.stadium}`}
      </li>
      <li key="h2h" className="h2h" data-cy={props.name + "h2h"}>
        {`Matches played: ${props.matches}`}
      </li>
      <li key="homeWins" className="homeWins" data-cy={props.name + "homeWins"}>
        {`${props.homeTeam} wins: ${props.homeWins}`}
      </li>
      <li key="awayWins" className="awayWins" data-cy={props.name + "awayWins"}>
        {`${props.awayTeam} wins: ${props.awayWins}`}
      </li>
      <li key="draws" className="draws" data-cy={props.name + "draws"}>
        {`Draws: ${props.draws}`}
      </li>
      <li key="averageGoals" className="averageGoals" data-cy={props.name + "averageGoals"}>
        {`Average goals in fixture: ${props.averageGoals}`}
      </li>
      <li key="bttsPercentage" className="bttsPercentage" data-cy={props.name + "bttsPercentage"}>
        {`Btts history: ${props.bttsPercentage}%`}
      </li>
      <li key="over25Percentage" className="over25Percentage" data-cy={props.name + "over25Percentage"}>
        {`Over 2.5 goals history: ${props.over25Percentage}%`}
      </li> 
    </ul>
  );
}

export default HeadToHead;
