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
    <ul className={props.className} style={props.style}>
      <li key={props.name}>{`Team name - ${props.name}`}</li>
      <li key="last5">
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

      <li key="TeamScored" className="TeamScored" data-cy={props.name + "teamScored"}>
        {`Average goals scored - ${props.goals}`}
      </li>
      <li key="TeamConceeded" className="TeamConceeded" data-cy={props.name + "teamConceded"}>
        {`Average goals conceeded - ${props.conceeded}`}
      </li>
      <li key="TeamPossession" className="TeamPossession" data-cy={props.name + "teamPossession"}>
        {`Average possession - ${props.possession}%`}
      </li>
      <li key="TeamXG" className="TeamXG" data-cy={props.name + "teamXG"}>
        {`Average XG - ${props.XG}`}
      </li>
      <li key="AverageSOT" className="AverageSOT" data-cy={props.name + "averageSOT"}>
        {`Average shots on target - ${props.sot}`}
      </li>
      <li key="DangerousAttacks" className="DangerousAttacks" data-cy={props.name + "dangerousAttacks"}>
        {`Average dangerous attacks - ${props.dangerousAttacks}`}
      </li>
    </ul>
  );
}

export default Stats;
