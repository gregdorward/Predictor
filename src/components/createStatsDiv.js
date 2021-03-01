import React, { Fragment } from "react";

function Stats(props) {
  function styleForm(formIndicator) {
    let className;
    if (formIndicator === "W") {
      className = "win";
    } else if (formIndicator === "D") {
      className = "draw";
    } else if (formIndicator === "L") {
      className = "loss";
    }
    return className
  }

  return (
    <ul className={props.className}>
      <li key={props.name}>{`Team name - ${props.name}`}</li>
      <li key="last5">
        {"Last 5: "}
        <span
          className={
            styleForm(props.last5[0])
          }
        >
          {props.last5[0]}
        </span>
        <span className={
            styleForm(props.last5[1])
          }>{props.last5[1]}</span>
        <span className={
            styleForm(props.last5[2])
          }>{props.last5[2]}</span>
        <span className={
            styleForm(props.last5[3])
          }>{props.last5[3]}</span>
        <span className={
            styleForm(props.last5[4])
          }>{props.last5[4]}</span>
      </li>

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
      <li key="DangerousAttacks" className="DangerousAttacks">
        {`Average dangerous attacks - ${props.dangerousAttacks}`}
      </li>
    </ul>
  );
}

export default Stats;
