import React, { Fragment } from "react";

function Stats(props) {
  console.log(props)
  let shouldOpen = props.clicked;

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
    return (
      <Fragment>
        <ul className={props.className ? props.className : ""} style={props.style ? props.style : {}}>
          <li className="FormHeader">League results (most recent on right)</li>
          <li key={`last5League`} className="last5League">
            <span className={styleForm(props.Results && props.Results[0] ? props.Results[0] : "")}>
              {props.Results && props.Results[0] ? props.Results[0] : ""}
            </span>
            <span className={styleForm(props.Results && props.Results[1] ? props.Results[1] : "")}>
              {props.Results && props.Results[1] ? props.Results[1] : ""}
            </span>
            <span className={styleForm(props.Results && props.Results[2] ? props.Results[2] : "")}>
              {props.Results && props.Results[2] ? props.Results[2] : ""}
            </span>
            <span className={styleForm(props.Results && props.Results[3] ? props.Results[3] : "")}>
              {props.Results && props.Results[3] ? props.Results[3] : ""}
            </span>
            <span className={styleForm(props.Results && props.Results[4] ? props.Results[4] : "")}>
              {props.Results && props.Results[4] ? props.Results[4] : ""}
            </span>
            <span className={styleForm(props.Results && props.Results[5] ? props.Results[5] : "")}>
              {props.Results && props.Results[5] ? props.Results[5] : ""}
            </span>
          </li>
          <li className="FormHeader">
            {props.homeOrAway ? props.homeOrAway : "N/A"} form (most recent on right)
          </li>
          <li key={`last5${props.homeOrAwayResults ? props.homeOrAwayResults : "default"}`} className="FormHomeOrAway">
            <span className={styleForm(props.ResultsHorA && props.ResultsHorA[5] ? props.ResultsHorA[5] : "")}>
              {props.ResultsHorA && props.ResultsHorA[5] ? props.ResultsHorA[5] : ""}
            </span>
            <span className={styleForm(props.ResultsHorA && props.ResultsHorA[4] ? props.ResultsHorA[4] : "")}>
              {props.ResultsHorA && props.ResultsHorA[4] ? props.ResultsHorA[4] : ""}
            </span>
            <span className={styleForm(props.ResultsHorA && props.ResultsHorA[3] ? props.ResultsHorA[3] : "")}>
              {props.ResultsHorA && props.ResultsHorA[3] ? props.ResultsHorA[3] : ""}
            </span>
            <span className={styleForm(props.ResultsHorA && props.ResultsHorA[2] ? props.ResultsHorA[2] : "")}>
              {props.ResultsHorA && props.ResultsHorA[2] ? props.ResultsHorA[2] : ""}
            </span>
            <span className={styleForm(props.ResultsHorA && props.ResultsHorA[1] ? props.ResultsHorA[1] : "")}>
              {props.ResultsHorA && props.ResultsHorA[1] ? props.ResultsHorA[4] : ""}
            </span>
            <span className={styleForm(props.ResultsHorA && props.ResultsHorA[0] ? props.ResultsHorA[0] : "")}>
              {props.ResultsHorA && props.ResultsHorA[0] ? props.ResultsHorA[0] : ""}
            </span>
          </li>
          <li
            key="BTTSArrayHomeOrAway"
            className="BTTSArrayHomeOrAway"
            data-cy={props.name ? props.name + "BTTSArrayHomeOrAway" : "BTTSArrayHomeOrAway"}
          >
            <div className="BTTSResults">{props.BTTSArray ? `BTTS` : ``}</div>
            <span className={styleBTTS(props.BTTSArray && props.BTTSArray[5] ? props.BTTSArray[5] : "")}>
              {props.BTTSArray && props.BTTSArray[5] ? props.BTTSArray[5] : ""}
            </span>
            <span className={styleBTTS(props.BTTSArray && props.BTTSArray[4] ? props.BTTSArray[4] : "")}>
              {props.BTTSArray && props.BTTSArray[4] ? props.BTTSArray[4] : ""}
            </span>
            <span className={styleBTTS(props.BTTSArray && props.BTTSArray[3] ? props.BTTSArray[3] : "")}>
              {props.BTTSArray && props.BTTSArray[3] ? props.BTTSArray[3] : ""}
            </span>
            <span className={styleBTTS(props.BTTSArray && props.BTTSArray[2] ? props.BTTSArray[2] : "")}>
              {props.BTTSArray && props.BTTSArray[2] ? props.BTTSArray[2] : ""}
            </span>
            <span className={styleBTTS(props.BTTSArray && props.BTTSArray[1] ? props.BTTSArray[1] : "")}>
              {props.BTTSArray && props.BTTSArray[1] ? props.BTTSArray[1] : ""}
            </span>
            <span className={styleBTTS(props.BTTSArray && props.BTTSArray[0] ? props.BTTSArray[0] : "")}>
              {props.BTTSArray && props.BTTSArray[0] ? props.BTTSArray[0] : ""}
            </span>
          </li>
          <div className="FormSummaries">
            {/* <li className="FormSummaryHome">{props.FormTextString ? props.FormTextString : "The below stats are only available to paying customers"}</li> */}
            <li className="StyleOfPlay">{`Style - ${props.StyleOfPlay ? props.StyleOfPlay : "N/A"}`}</li>
            <li className="StyleOfPlay">{`${props.homeOrAway ? props.homeOrAway : "N/A"} style - ${props.StyleOfPlayHomeOrAway ? props.StyleOfPlayHomeOrAway : "N/A"}`}</li>
            {/* <li className="FavouriteSummaryHome">{props.FavouriteRecord ? props.FavouriteRecord : "Graphs also only available to paying customers"}</li> */}
          </div>
          <div className="AllStats">
            <li
              key="TeamScored"
              className="TeamScored"
              data-cy={props.name ? props.name + "teamScored" : "teamScored"}
            >
              {`Avg goals scored - ${props.goals !== undefined ? props.goals : "N/A"}`}
            </li>
            <li
              key="TeamConceeded"
              className="TeamConceeded"
              data-cy={props.name ? props.name + "teamConceded" : "teamConceded"}
            >
              {`Avg goals conceeded - ${props.conceeded !== undefined ? props.conceeded : "N/A"}`}
            </li>
            <li
              key="TeamPossession"
              className="TeamPossession"
              data-cy={props.name ? props.name + "teamPossession" : "teamPossession"}
            >
              {`Avg possession - ${props.possession !== undefined ? props.possession : "N/A"}%`}
            </li>
            <li key="TeamXG" className="TeamXG" data-cy={props.name ? props.name + "teamXG" : "teamXG"}>
              {`Avg XG - ${props.XG !== undefined ? props.XG : "N/A"}`}
            </li>
            <li
              key="TeamXGConceded"
              className="TeamXGConceded"
              data-cy={props.name ? props.name + "teamXGConceded" : "teamXGConceded"}
            >
              {`Avg XG conceded - ${props.XGConceded !== undefined ? props.XGConceded : "N/A"}`}
            </li>
            <li
              key="TeamXGSwing"
              className="TeamXGSwing"
              data-cy={props.name ? props.name + "teamXGSwing" : "teamXGSwing"}
            >
              {`XG difference swing (last 5): ${
                props.XGSwing !== undefined ? props.XGSwing.toFixed(2) : "N/A"
              }`}
            </li>
            <li
              key="goalDifference"
              className="goalDifference"
              data-cy={props.name ? props.name + "goalDifference" : "goalDifference"}
            >
              {`Goal difference : `}
              <span>{props.goalDifference !== undefined ? props.goalDifference : "N/A"}</span>
            </li>
            <li
              key="goalDifferenceHorA"
              className="goalDifferenceHorA"
              data-cy={props.name ? props.name + "goalDifference" : "goalDifference"}
            >
              {`Goal difference ${props.homeOrAway ? props.homeOrAway : "N/A"} : ${
                props.goalDifferenceHomeOrAway !== undefined ? props.goalDifferenceHomeOrAway : "N/A"
              }`}
            </li>
            <li
              key="AverageSOT"
              className="AverageSOT"
              data-cy={props.name ? props.name + "averageSOT" : "averageSOT"}
            >
              {`Avg shots on target - ${props.sot !== undefined ? props.sot : "N/A"}`}
            </li>
            <li
              key="DangerousAttacks"
              className="DangerousAttacks"
              data-cy={props.name ? props.name + "dangerousAttacks" : "dangerousAttacks"}
            >
              {`Avg dangerous attacks - ${props.dangerousAttacks !== undefined ? props.dangerousAttacks : "N/A"}`}
            </li>
            <li
              key="LeaguePosition"
              className="LeaguePosition"
              data-cy={props.name ? props.name + "leaguePosition" : "leaguePosition"}
            >
              {`League position - ${
                props.leaguePosition !== undefined ? props.leaguePosition : "N/A"
              }`}
            </li>
            <li
              key="LeaguePositionHomeOrAway"
              className="LeaguePositionHomeOrAway"
              data-cy={props.name ? props.name + "LeaguePositionHomeOrAway" : "LeaguePositionHomeOrAway"}
            >
              {`Position (${props.homeOrAway ? props.homeOrAway : "N/A"} only) - ${
                props.homeOrAwayLeaguePosition !== undefined ? props.homeOrAwayLeaguePosition : "N/A"
              }`}
            </li>
            <li
              key="WinPercentage"
              className="WinPercentage"
              data-cy={props.name ? props.name + "WinPercentage" : "WinPercentage"}
            >
              {props.homeOrAway && props.winPercentage !== undefined && props.winPercentage !== "N/A" ? `${props.homeOrAway} PPG - ${props.winPercentage.toFixed(2)}` : "N/A"}
            </li>
            <li key="PPG" className="PPG" data-cy={props.name ? props.name + "PPG" : "PPG"}>
              {`Season PPG - ${props.ppg !== undefined ? props.ppg : "N/A"}`}
            </li>
            <li
              key="FormTrend10a"
              className="FormTrend"
              data-cy={props.name ? props.name + "FormTrend10" : "FormTrend10"}
            >
              {`Last 10 PPG: ${props.formTrend && props.formTrend[0] !== undefined ? props.formTrend[0] : "N/A"}`}
            </li>
            <li
              key="FormTrend10b"
              className="FormTrend"
              data-cy={props.name ? props.name + "FormTrend10" : "FormTrend10"}
            >
              {`Last 6 PPG: ${props.formTrend && props.formTrend[1] !== undefined ? props.formTrend[1] : "N/A"}`}
            </li>
            <li
              key="FormTrend10c"
              className="FormTrend"
              data-cy={props.name ? props.name + "FormTrend10" : "FormTrend10"}
            >
              {`Last 5 PPG: ${props.formTrend && props.formTrend[2] !== undefined ? props.formTrend[2] : "N/A"}.`}
            </li>
            <li
              key="CardsTotal"
              className="CardsTotal"
              data-cy={props.name ? props.name + "CardsTotal" : "CardsTotal"}
            >
              {`Cards total: ${props.CardsTotal !== undefined ? props.CardsTotal : "N/A"}`}
            </li>
            <li
              key="CornersAverage"
              className="CornersAverage"
              data-cy={props.name ? props.name + "CornersAverage" : "CornersAverage"}
            >
              {`Corners average: ${props.CornersAverage !== undefined ? props.CornersAverage : "N/A"}`}
            </li>
          </div>
        </ul>
        <div id="h2hStats"></div>
      </Fragment>
    );
  } else {
    return (
      <Fragment>
        <ul className={props.className ? props.className : ""} style={props.style ? props.style : {}}>
          <div className="FormSummaries">
            {/* <li className="FormSummaryHome">{props.FormTextString ? props.FormTextString : "The below stats are available to paying customers only"}</li> */}
            {/* <li className="FavouriteSummaryAway">{props.FavouriteRecord ? props.FavouriteRecord : "Graphs also only available to paying customers"}</li> */}
          </div>
          <div className="AllStats">
            <li
              key="TeamScored"
              className="TeamScored"
              data-cy={props.name ? props.name + "teamScored" : "teamScored"}
            >
              {`Avg goals scored - ${props.goals !== undefined ? props.goals : "N/A"}`}
            </li>
            <li
              key="TeamConceeded"
              className="TeamConceeded"
              data-cy={props.name ? props.name + "teamConceded" : "teamConceded"}
            >
              {`Avg goals conceeded - ${props.conceeded !== undefined ? props.conceeded : "N/A"}`}
            </li>
            <li
              key="TeamPossession"
              className="TeamPossession"
              data-cy={props.name ? props.name + "teamPossession" : "teamPossession"}
            >
              {`Avg possession - ${props.possession !== undefined ? props.possession : "N/A"}%`}
            </li>
            <li key="TeamXG" className="TeamXG" data-cy={props.name ? props.name + "teamXG" : "teamXG"}>
              {`Avg XG - ${props.XG !== undefined ? props.XG : "N/A"}`}
            </li>
            <li
              key="TeamXGConceded"
              className="TeamXGConceded"
              data-cy={props.name ? props.name + "teamXGConceded" : "teamXGConceded"}
            >
              {`Avg XG conceded - ${props.XGConceded !== undefined ? props.XGConceded : "N/A"}`}
            </li>
            <li
              key="TeamXGSwing"
              className="TeamXGSwing"
              data-cy={props.name ? props.name + "teamXGSwing" : "teamXGSwing"}
            >
              {`XG difference swing (last 5): ${
                props.XGSwing !== undefined ? props.XGSwing.toFixed(2) : "N/A"
              }`}
            </li>
            <li
              key="AverageSOT"
              className="AverageSOT"
              data-cy={props.name ? props.name + "averageSOT" : "averageSOT"}
            >
              {`Avg shots on target - ${props.sot !== undefined ? props.sot : "N/A"}`}
            </li>
            <li
              key="DangerousAttacks"
              className="DangerousAttacks"
              data-cy={props.name ? props.name + "dangerousAttacks" : "dangerousAttacks"}
            >
              {`Avg dangerous attacks - ${props.dangerousAttacks !== undefined ? props.dangerousAttacks : "N/A"}`}
            </li>
            <li
              key="LeaguePosition"
              className="LeaguePosition"
              data-cy={props.name ? props.name + "leaguePosition" : "leaguePosition"}
            >
              {`League position - ${
                props.leaguePosition !== undefined ? props.leaguePosition : "N/A"
              }`}
            </li>
            <li
              key="LeaguePositionHomeOrAway"
              className="LeaguePositionHomeOrAway"
              data-cy={props.name ? props.name + "LeaguePositionHomeOrAway" : "LeaguePositionHomeOrAway"}
            >
              {`Position (${props.homeOrAway ? props.homeOrAway : "N/A"} only) - ${
                props.homeOrAwayLeaguePosition !== undefined ? props.homeOrAwayLeaguePosition : "N/A"
              }`}
            </li>
            <li
              key="WinPercentage"
              className="WinPercentage"
              data-cy={props.name ? props.name + "WinPercentage" : "WinPercentage"}
            >
              {props.homeOrAway && props.winPercentage !== undefined
                ? `${props.homeOrAway} PPG - ${props.winPercentage.toFixed(2)}`
                : "N/A"}
            </li>
            <li key="PPG" className="PPG" data-cy={props.name ? props.name + "PPG" : "PPG"}>
              {`Season PPG - ${props.ppg !== undefined ? props.ppg : "N/A"}`}
            </li>
            <li
              key="FormTrend10a"
              className="FormTrend"
              data-cy={props.name ? props.name + "FormTrend10" : "FormTrend10"}
            >
              {`Last 10 PPG: ${props.formTrend && props.formTrend[0] !== undefined ? props.formTrend[0] : "N/A"}`}
            </li>
            <li
              key="FormTrend10b"
              className="FormTrend"
              data-cy={props.name ? props.name + "FormTrend10" : "FormTrend10"}
            >
              {`Last 6 PPG: ${props.formTrend && props.formTrend[1] !== undefined ? props.formTrend[1] : "N/A"}`}
            </li>
            <li
              key="FormTrend10c"
              className="FormTrend"
              data-cy={props.name ? props.name + "FormTrend10" : "FormTrend10"}
            >
              {`Last 5 PPG: ${props.formTrend && props.formTrend[2] !== undefined ? props.formTrend[2] : "N/A"}.`}
            </li>
            <li
              key="CardsTotal"
              className="CardsTotal"
              data-cy={props.name ? props.name + "CardsTotal" : "CardsTotal"}
            >
              {`Cards total: ${props.CardsTotal !== undefined ? props.CardsTotal : "N/A"}`}
            </li>
            <li
              key="CornersAverage"
              className="CornersAverage"
              data-cy={props.name ? props.name + "CornersAverage" : "CornersAverage"}
            >
              {`Corners average: ${props.CornersAverage !== undefined ? props.CornersAverage : "N/A"}`}
            </li>
          </div>
        </ul>
        <div id="h2hStats"></div>
      </Fragment>
    );
  }
}

export default Stats;
