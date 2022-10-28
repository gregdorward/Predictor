import React from "react";

function HeadToHead(props) {
  return (
    <ul className={props.className} style={props.style}>
      <li key="Stadium" className="Stadium" data-cy={props.name + "Stadium"}>
        {`Venue - ${props.stadium}`}
      </li>
      <li
        key="lastGameDetail"
        className="LastGameDetail"
        data-cy={props.name + "Last"}
      >
        {`Last meeting - ${props.lastGameStadiumName} ${props.lastGameDate}`}
      </li>
      <div className="LastGameOverview">
        <div
          key="lastGame"
          className="LastGameHome"
          data-cy={props.name + "LastGame"}
        >
          {`${props.lastGameHomeTeam}`}
        </div>
        <span className="LastGameScore">{`${props.lastGameHomeGoals}`}</span>
        <span className="LastGameScore">{`${props.lastGameAwayGoals}`}</span>
        <div className="LastGameAway">{`${props.lastGameAwayTeam}`}</div>
      </div>

      <li
        key="secondToLastGameDetail"
        className="secondToLastGameDetail"
        data-cy={props.name + "secondToLast"}
      >
        {`Second to last meeting - ${props.secondToLastGameStadiumName} ${props.secondToLastGameDate}`}
      </li>
      <div className="LastGameOverview">
        <div
          key="lastGame"
          className="LastGameHome"
          data-cy={props.name + "LastGame"}
        >
          {`${props.secondToLastGameHomeTeam}`}
        </div>
        <span className="LastGameScore">{`${props.secondToLastGameHomeGoals}`}</span>
        <span className="LastGameScore">{`${props.secondToLastGameAwayGoals}`}</span>
        <div className="LastGameAway">
          {`${props.secondToLastGameAwayTeam}`}
        </div>
      </div>
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
      <li
        key="averageGoals"
        className="averageGoals"
        data-cy={props.name + "averageGoals"}
      >
        {`Average goals in fixture: ${props.averageGoals}`}
      </li>
      <li
        key="bestHomeOdds"
        className="bestHomeOdds"
        data-cy={props.name + "bestHomeOdds"}
      >
        {`Best oods for home win @: ${props.bestHomeOdds}`}
      </li>
      <li
        key="bestAwayOdds"
        className="bestAwayOdds"
        data-cy={props.name + "bestAwayOdds"}
      >
        {`Best oods for away win @: ${props.bestAwayOdds}`}
      </li>
    </ul>
  );
}

export default HeadToHead;
