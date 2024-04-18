import React, { Fragment } from "react";

function Stats(props) {
  let shouldOpen = props.clicked
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

  function styleBTTS(BTTSBoolean) {
    let className;
    if (BTTSBoolean === "\u2714") {
      className = "BTTSTrue";
    } else if (BTTSBoolean === "\u2718") {
      className = "BTTSFalse";
    }
    return className;
  }

  if (props.formRun) {
    console.log(props.formRun)
    return (
      <Fragment>
        <ul className={props.className} style={props.style}>
          <li className="FormSummaryHome">{props.FormTextString}</li>
          <li className="FavouriteSummaryHome">{props.FavouriteRecord}</li>
          <li className="FormHeader">
            League results (most recent on right)
          </li>
          <li key={`last5League`} className="last5League">
          <span className={styleForm(props.Results[0])}>
              {props.Results[0]}
            </span>
            <span className={styleForm(props.Results[1])}>
              {props.Results[1]}
            </span>
            <span className={styleForm(props.Results[2])}>
              {props.Results[2]}
            </span>
            <span className={styleForm(props.Results[3])}>
              {props.Results[3]}
            </span>
            <span className={styleForm(props.Results[4])}>
              {props.Results[4]}
            </span>
            <span className={styleForm(props.Results[5])}>
              {props.Results[5]}
            </span>
          </li>
          <li className="FormHeader">
            {props.homeOrAway} form (most recent on right)
          </li>
          <li key={`last5${props.homeOrAwayResults}`} className="FormHomeOrAway">
          <span className={styleForm(props.ResultsHorA[0])}>
              {props.ResultsHorA[0]}
            </span>
            <span className={styleForm(props.ResultsHorA[1])}>
              {props.ResultsHorA[1]}
            </span>
            <span className={styleForm(props.ResultsHorA[2])}>
              {props.ResultsHorA[2]}
            </span>
            <span className={styleForm(props.ResultsHorA[3])}>
              {props.ResultsHorA[3]}
            </span>
            <span className={styleForm(props.ResultsHorA[4])}>
              {props.ResultsHorA[4]}
            </span>
            <span className={styleForm(props.ResultsHorA[5])}>
              {props.ResultsHorA[5]}
            </span>
          </li>
          <li
            key="BTTSArrayHomeOrAway"
            className="BTTSArrayHomeOrAway"
            data-cy={props.name + "BTTSArrayHomeOrAway"}
          >
            <div className="BTTSResults">BTTS</div>
            <span className={styleBTTS(props.BTTSArray[5])}>{props.BTTSArray[5]}</span>
            <span className={styleBTTS(props.BTTSArray[4])}>{props.BTTSArray[4]}</span>
            <span className={styleBTTS(props.BTTSArray[3])}>{props.BTTSArray[3]}</span>
            <span className={styleBTTS(props.BTTSArray[2])}>{props.BTTSArray[2]}</span>
            <span className={styleBTTS(props.BTTSArray[1])}>{props.BTTSArray[1]}</span>
            <span className={styleBTTS(props.BTTSArray[0])}>{props.BTTSArray[0]}</span>
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
        </ul>
        <div id="h2hStats"></div>
      </Fragment>
    );
  } else {
    return (
      <Fragment>
        <ul className={props.className} style={props.style}>
          <li className="FormSummaryHome">{props.FormTextString}</li>
          <li className="FavouriteSummaryAway">{props.FavouriteRecord}</li>
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
        </ul>
        <div id="h2hStats"></div>
      </Fragment>
    );
  }
}

export default Stats;
