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

  if (props.formRun) {
    return (
      <Fragment>
        <ul className={props.className} style={props.style}>
          <li className="FormHeader">All Form (most recent on right)</li>
          <li key={`last5`} className="Form">
            <span className={styleForm(props.last5[0])}>{props.last5[0]}</span>
            <span className={styleForm(props.last5[1])}>{props.last5[1]}</span>
            <span className={styleForm(props.last5[2])}>{props.last5[2]}</span>
            <span className={styleForm(props.last5[3])}>{props.last5[3]}</span>
            <span className={styleForm(props.last5[4])}>{props.last5[4]}</span>
          </li>
          <li className="FormHeader">
            {props.homeOrAway} form (most recent on right)
          </li>
          <li key={`last5${props.homeOrAway}`} className="FormHomeOrAway">
            <span className={styleForm(props.formRun[0])}>
              {props.formRun[0]}
            </span>
            <span className={styleForm(props.formRun[1])}>
              {props.formRun[1]}
            </span>
            <span className={styleForm(props.formRun[2])}>
              {props.formRun[2]}
            </span>
            <span className={styleForm(props.formRun[3])}>
              {props.formRun[3]}
            </span>
            <span className={styleForm(props.formRun[4])}>
              {props.formRun[4]}
            </span>
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
            key="goalDifference"
            className="goalDifference"
            data-cy={props.name + "goalDifference"}
          >
            {`Goal difference : `}
            <span>{props.goalDifference}</span>
          </li>
          <li
            key="goalDifferenceHorA"
            className="goalDifferenceHorA"
            data-cy={props.name + "goalDifference"}
          >
            {`Goal difference ${props.homeOrAway} : ${props.goalDifferenceHomeOrAway}`}
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
            key="LeaguePositionHomeOrAway"
            className="LeaguePositionHomeOrAway"
            data-cy={props.name + "LeaguePositionHomeOrAway"}
          >
            {`Position (${props.homeOrAway} only) - ${props.homeOrAwayLeaguePosition}`}
          </li>
          <li
            key="WinPercentage"
            className="WinPercentage"
            data-cy={props.name + "WinPercentage"}
          >
            {`${props.homeOrAway} wins - ${props.winPercentage.toFixed(1)}%`}
          </li>
          <li
            key="DrawPercentage"
            className="DrawPercentage"
            data-cy={props.name + "DrawPercentage"}
          >
            {`${props.homeOrAway} draws - ${props.drawPercentage.toFixed(1)}%`}
          </li>
          <li
            key="LossPercentage"
            className="LossPercentage"
            data-cy={props.name + "LossPercentage"}
          >
            {`${props.homeOrAway} losses - ${props.lossPercentage.toFixed(1)}%`}
          </li>
          <li key="PPG" className="PPG" data-cy={props.name + "PPG"}>
            {`Season PPG - ${props.ppg}`}
          </li>
          <li
            key="FormTrend10a"
            className="FormTrend"
            data-cy={props.name + "FormTrend10"}
          >
            {`Last 10 PPG: ${props.formTrend[0]}`}
          </li>
          <li
            key="FormTrend10b"
            className="FormTrend"
            data-cy={props.name + "FormTrend10"}
          >
            {`Last 6 PPG: ${props.formTrend[1]}`}
          </li>
          <li
            key="FormTrend10c"
            className="FormTrend"
            data-cy={props.name + "FormTrend10"}
          >
            {`Last 5 PPG: ${props.formTrend[2]}.`}
          </li>
          <li
            key="BttsPercentage"
            className="BttsPercentage"
            data-cy={props.name + "BttsPercentage"}
          >
            {`BTTS: ${props.BttsPercentage}%`}
          </li>
          <li
            key="BttsPercentageHomeOrAway"
            className="BttsPercentageHomeOrAway"
            data-cy={props.name + "BttsPercentageHomeOrAway"}
          >
            {`BTTS ${props.homeOrAway}: ${props.BttsPercentageHomeOrAway}%`}
          </li>
          <li
            key="CardsTotal"
            className="CardsTotal"
            data-cy={props.name + "CardsTotal"}
          >
            {`Cards total: ${props.CardsTotal}`}
          </li>
          <li
            key="CornersAverage"
            className="CornersAverage"
            data-cy={props.name + "CornersAverage"}
          >
            {`Corners average: ${props.CornersAverage}`}
          </li>
          <li
            key="ScoredBothHalvesPercentage"
            className="ScoredBothHalvesPercentage"
            data-cy={props.name + "ScoredBothHalvesPercentage"}
          >
            {`Scored both halves: ${props.ScoredBothHalvesPercentage}%`}
          </li>
        </ul>
        <div id="h2hStats"></div>
      </Fragment>
    );
  } else {
    return (
      <Fragment>
        <ul className={props.className} style={props.style}>
          <li className="FormHeader">Form (most recent on right)</li>
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
            key="LeaguePositionHomeOrAway"
            className="LeaguePositionHomeOrAway"
            data-cy={props.name + "LeaguePositionHomeOrAway"}
          >
            {`Position (${props.homeOrAway} only) - ${props.homeOrAwayLeaguePosition}`}
          </li>
          <li
            key="WinPercentage"
            className="WinPercentage"
            data-cy={props.name + "WinPercentage"}
          >
            {`${props.homeOrAway} wins - ${props.winPercentage.toFixed(1)}%`}
          </li>
          <li
            key="DrawPercentage"
            className="DrawPercentage"
            data-cy={props.name + "DrawPercentage"}
          >
            {`${props.homeOrAway} draws - ${props.drawPercentage.toFixed(1)}%`}
          </li>
          <li
            key="LossPercentage"
            className="LossPercentage"
            data-cy={props.name + "LossPercentage"}
          >
            {`${props.homeOrAway} losses - ${props.lossPercentage.toFixed(1)}%`}
          </li>
          <li key="PPG" className="PPG" data-cy={props.name + "PPG"}>
            {`Season PPG - ${props.ppg}`}
          </li>
          <li
            key="FormTrend10a"
            className="FormTrend"
            data-cy={props.name + "FormTrend10"}
          >
            {`Last 10 PPG: ${props.formTrend[0]}`}
          </li>
          <li
            key="FormTrend10b"
            className="FormTrend"
            data-cy={props.name + "FormTrend10"}
          >
            {`Last 6 PPG: ${props.formTrend[1]}`}
          </li>
          <li
            key="FormTrend10c"
            className="FormTrend"
            data-cy={props.name + "FormTrend10"}
          >
            {`Last 5 PPG: ${props.formTrend[2]}.`}
          </li>
          <li
            key="BttsPercentage"
            className="BttsPercentage"
            data-cy={props.name + "BttsPercentage"}
          >
            {`BTTS: ${props.BttsPercentage}%`}
          </li>
          <li
            key="BttsPercentageHomeOrAway"
            className="BttsPercentageHomeOrAway"
            data-cy={props.name + "BttsPercentageHomeOrAway"}
          >
            {`BTTS ${props.homeOrAway}: ${props.BttsPercentageHomeOrAway}%`}
          </li>
          <li
            key="CardsTotal"
            className="CardsTotal"
            data-cy={props.name + "CardsTotal"}
          >
            {`Cards total: ${props.CardsTotal}`}
          </li>
          <li
            key="CornersAverage"
            className="CornersAverage"
            data-cy={props.name + "CornersAverage"}
          >
            {`Corners average: ${props.CornersAverage}`}
          </li>
          <li
            key="ScoredBothHalvesPercentage"
            className="ScoredBothHalvesPercentage"
            data-cy={props.name + "ScoredBothHalvesPercentage"}
          >
            {`Scored both halves: ${props.ScoredBothHalvesPercentage}%`}
          </li>
        </ul>
        <div id="h2hStats"></div>
      </Fragment>
    );
  }
}

export default Stats;
