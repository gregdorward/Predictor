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
    return className;
  }

  return (
    <Fragment>
      <ul className={props.className} style={props.style}>
        <li key={props.name}>{`${props.name} last ${props.gameCount} form`}</li>
        <li key="last5">
          <span className={styleForm(props.last5[0])}>{props.last5[0]}</span>
          <span className={styleForm(props.last5[1])}>{props.last5[1]}</span>
          <span className={styleForm(props.last5[2])}>{props.last5[2]}</span>
          <span className={styleForm(props.last5[3])}>{props.last5[3]}</span>
          <span className={styleForm(props.last5[4])}>{props.last5[4]}</span>
        </li>

        <li
          key="TeamScored"
          className="TeamScored"
          data-cy={props.name + "teamScored"}
        >
          {`Avg goals scored - ${props.goals}`}
        </li>
        <li
          key="TeamConceeded"
          className="TeamConceeded"
          data-cy={props.name + "teamConceded"}
        >
          {`Avg goals conceeded - ${props.conceeded}`}
        </li>
        <li
          key="TeamPossession"
          className="TeamPossession"
          data-cy={props.name + "teamPossession"}
        >
          {`Avg possession - ${props.possession}%`}
        </li>
        <li key="TeamXG" className="TeamXG" data-cy={props.name + "teamXG"}>
          {`Avg XG - ${props.XG}`}
        </li>
        <li
          key="TeamXGConceded"
          className="TeamXGConceded"
          data-cy={props.name + "teamXGConceded"}
        >
          {`Avg XG conceded - ${props.XGConceded}`}
        </li>
        <li
          key="AverageSOT"
          className="AverageSOT"
          data-cy={props.name + "averageSOT"}
        >
          {`Avg shots on target - ${props.sot}`}
        </li>
        <li
          key="DangerousAttacks"
          className="DangerousAttacks"
          data-cy={props.name + "dangerousAttacks"}
        >
          {`Avg dangerous attacks - ${props.dangerousAttacks}`}
        </li>
        <li
          key="LeaguePosition"
          className="LeaguePosition"
          data-cy={props.name + "leaguePosition"}
        >
          {`League position - ${props.leaguePosition}`}
        </li>
        <li
          key="Last5PPG"
          className="Last5PPG"
          data-cy={props.name + "Last5PPG"}
        >
          {`Last ${props.gameCount} PPG - ${props.last5PPG}`}
        </li>
        <li key="PPG" className="PPG" data-cy={props.name + "PPG"}>
          {`Season PPG - ${props.ppg}`}
        </li>
      </ul>
      <div id="h2hStats"></div>
    </Fragment>
  );
}

export default Stats;
