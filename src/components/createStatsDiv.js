import { Fragment } from "react";
import { CreateBadge } from "./createBadge";

function Stats(props) {
  function styleForm(formIndicator) {
    if (formIndicator === "W") return "win";
    if (formIndicator === "D") return "draw";
    if (formIndicator === "L") return "loss";
    return "formPillSpacer";
  }

  function styleBTTS(BTTSBoolean) {
    if (BTTSBoolean === "\u2714") return "BTTSTrue";
    if (BTTSBoolean === "\u2718") return "BTTSFalse";
    return "BTTSEmpty";
  }

  if (props.games === "all") {
    return (
      <Fragment>
        <ul className={props.className ? props.className : ""} style={props.style ? props.style : {}}>
          <CreateBadge image={props.badge} alt="Team badge" ClassName={"ColumnBadge"} />
          <li className="FormHeader">Competition results (most recent on right)</li>
          <li key={`last5League`} className="last5League">
            <span className={styleForm(props.Results && props.Results[5] ? props.Results[5] : "")}>
              {props.Results && props.Results[5] ? props.Results[5] : ""}
            </span>
            <span className={styleForm(props.Results && props.Results[4] ? props.Results[4] : "")}>
              {props.Results && props.Results[4] ? props.Results[4] : ""}
            </span>
            <span className={styleForm(props.Results && props.Results[3] ? props.Results[3] : "")}>
              {props.Results && props.Results[3] ? props.Results[3] : ""}
            </span>
            <span className={styleForm(props.Results && props.Results[2] ? props.Results[2] : "")}>
              {props.Results && props.Results[2] ? props.Results[2] : ""}
            </span>
            <span className={styleForm(props.Results && props.Results[1] ? props.Results[1] : "")}>
              {props.Results && props.Results[1] ? props.Results[1] : ""}
            </span>
            <span className={styleForm(props.Results && props.Results[0] ? props.Results[0] : "")}>
              {props.Results && props.Results[0] ? props.Results[0] : ""}
            </span>
          </li>
          {!props.isWorldCupCompetition && (
            <>
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
                  {props.ResultsHorA && props.ResultsHorA[1] ? props.ResultsHorA[1] : ""}
                </span>
                <span className={styleForm(props.ResultsHorA && props.ResultsHorA[0] ? props.ResultsHorA[0] : "")}>
                  {props.ResultsHorA && props.ResultsHorA[0] ? props.ResultsHorA[0] : ""}
                </span>
              </li>
            </>
          )}
          {!props.isWorldCupCompetition && (
            <>
              <li
                key="BTTSArrayHomeOrAway"
                className="BTTSArrayHomeOrAway"
                data-cy={props.name ? props.name + "BTTSArrayHomeOrAway" : "BTTSArrayHomeOrAway"}
              >
                <div className="BTTSResults">{props.BTTSArray ? `BTTS` : ``}</div>
                <span className={styleBTTS(props.BTTSArray && props.BTTSArray[5] ? props.BTTSArray[5] : "")}>
                  {props.BTTSArray && props.BTTSArray[5] ? "" : ""}
                </span>
                <span className={styleBTTS(props.BTTSArray && props.BTTSArray[4] ? props.BTTSArray[4] : "")}>
                  {props.BTTSArray && props.BTTSArray[4] ? "" : ""}
                </span>
                <span className={styleBTTS(props.BTTSArray && props.BTTSArray[3] ? props.BTTSArray[3] : "")}>
                  {props.BTTSArray && props.BTTSArray[3] ? "" : ""}
                </span>
                <span className={styleBTTS(props.BTTSArray && props.BTTSArray[2] ? props.BTTSArray[2] : "")}>
                  {props.BTTSArray && props.BTTSArray[2] ? "" : ""}
                </span>
                <span className={styleBTTS(props.BTTSArray && props.BTTSArray[1] ? props.BTTSArray[1] : "")}>
                  {props.BTTSArray && props.BTTSArray[1] ? "" : ""}
                </span>
                <span className={styleBTTS(props.BTTSArray && props.BTTSArray[0] ? props.BTTSArray[0] : "")}>
                  {props.BTTSArray && props.BTTSArray[0] ? "" : ""}
                </span>
              </li>
              <div className="FormSummaries">
                {props.FormTextString && (
                  <li className="FormSummaryHome">
                    {props.FormTextString}
                  </li>
                )}
              </div>
            </>
          )}
        </ul>
        <div id="h2hStats"></div>
      </Fragment>
    );
  } else if (props.games === "hOrA") {
    return (
      <Fragment>
        <ul className={props.className ? props.className : ""} style={props.style ? props.style : {}}>
          <CreateBadge image={props.badge} alt="Team badge" ClassName={"ColumnBadge"} />

          <li className="FormHeader">Competition results (most recent on right)</li>
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
              {props.ResultsHorA && props.ResultsHorA[1] ? props.ResultsHorA[1] : ""}
            </span>
            <span className={styleForm(props.ResultsHorA && props.ResultsHorA[0] ? props.ResultsHorA[0] : "")}>
              {props.ResultsHorA && props.ResultsHorA[0] ? props.ResultsHorA[0] : ""}
            </span>
          </li>
          <div className="FormSummaries">
            <li className="StyleOfPlay">{`${props.homeOrAway ? props.homeOrAway : "N/A"} style: ${props.StyleOfPlayHomeOrAway ? props.StyleOfPlayHomeOrAway : "N/A"}`}</li>
          </div>
        </ul>
        <div id="h2hStats"></div>
      </Fragment>
    );
  } else if (props.games === "last5") {
    return (
      <Fragment>
        <ul className={props.className ? props.className : ""} style={props.style ? props.style : {}}>
          <CreateBadge image={props.badge} alt="Team badge" ClassName={"ColumnBadge"} />
          <li className="FormHeader">
            Last 5 games (All)
          </li>
          <li key={`last5League`} className="last5League">
            <span className={styleForm(props.Results && props.Results[4] ? props.Results[4] : "")}>
              {props.Results && props.Results[4] ? props.Results[4] : ""}
            </span>
            <span className={styleForm(props.Results && props.Results[3] ? props.Results[3] : "")}>
              {props.Results && props.Results[3] ? props.Results[3] : ""}
            </span>
            <span className={styleForm(props.Results && props.Results[2] ? props.Results[2] : "")}>
              {props.Results && props.Results[2] ? props.Results[2] : ""}
            </span>
            <span className={styleForm(props.Results && props.Results[1] ? props.Results[1] : "")}>
              {props.Results && props.Results[1] ? props.Results[1] : ""}
            </span>
            <span className={styleForm(props.Results && props.Results[0] ? props.Results[0] : "")}>
              {props.Results && props.Results[0] ? props.Results[0] : ""}
            </span>
          </li>
          {!props.isWorldCupCompetition && (
            <li
              key="BTTSArrayHomeOrAway"
              className="BTTSArrayHomeOrAway"
              data-cy={props.name ? props.name + "BTTSArrayHomeOrAway" : "BTTSArrayHomeOrAway"}
            >
              <div className="BTTSResults">{props.BTTSArray ? `BTTS` : ``}</div>
              <span className={styleBTTS(props.BTTSArray && props.BTTSArray[5] ? props.BTTSArray[5] : "")}>
                {props.BTTSArray && props.BTTSArray[5] ? "" : ""}
              </span>
              <span className={styleBTTS(props.BTTSArray && props.BTTSArray[4] ? props.BTTSArray[4] : "")}>
                {props.BTTSArray && props.BTTSArray[4] ? "" : ""}
              </span>
              <span className={styleBTTS(props.BTTSArray && props.BTTSArray[3] ? props.BTTSArray[3] : "")}>
                {props.BTTSArray && props.BTTSArray[3] ? "" : ""}
              </span>
              <span className={styleBTTS(props.BTTSArray && props.BTTSArray[2] ? props.BTTSArray[2] : "")}>
                {props.BTTSArray && props.BTTSArray[2] ? "" : ""}
              </span>
              <span className={styleBTTS(props.BTTSArray && props.BTTSArray[1] ? props.BTTSArray[1] : "")}>
                {props.BTTSArray && props.BTTSArray[1] ? "" : ""}
              </span>
              <span className={styleBTTS(props.BTTSArray && props.BTTSArray[0] ? props.BTTSArray[0] : "")}>
                {props.BTTSArray && props.BTTSArray[0] ? "" : ""}
              </span>
            </li>
          )}
        </ul>
        <div id="h2hStats"></div>
      </Fragment>
    );
  }
}

export default Stats;
