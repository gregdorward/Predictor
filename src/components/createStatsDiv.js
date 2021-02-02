import React from "react";

function Stats(props) {
  return (
    <ul className={props.className}>
      <li key={props.name}>{`Team name - ${props.name}`}</li>
      <li key="TeamScored" className="TeamScored">
        {`Average goals scored - ${props.goals}`}
      </li>
      <li key="TeamConceeded" className="TeamConceeded">
        {`Average goals conceeded - ${props.conceeded}`}
      </li>
      <li key="TeamPossession" className="TeamPossession">
        {`Average possession - ${props.possession}%`}
      </li>
      <li key="TeamXG" className="TeamXG">
        {`Average XG - ${props.XG}`}
      </li>
      <li key="AverageSOT" className="AverageSOT">
          {`Average shots on target - ${props.sot}`}
      </li>
    </ul>
  );
}

export default Stats;
