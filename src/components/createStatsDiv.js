import React from "react";

function Stats(props) {
  return (
    <ul className={props.className}>
      <li key={props.name}>{`Team name - ${props.name}`}</li>
      <li key="TeamScored" className="TeamName">
        {`Average goals scored - ${props.goals}`}
      </li>
      <li key="TeamConceeded" className="TeamName">
        {`Average goals conceeded - ${props.conceeded}`}
      </li>
      <li key="TeamPossession" className="TeamName">
        {`Average possession - ${props.possession}%`}
      </li>
      <li key="TeamXG" className="TeamName">
        {`Average XG - ${props.XG}`}
      </li>
    </ul>
  );
}

export default Stats;
