import React, { Fragment } from "react";
import { CreateBadge } from "./createBadge";
import Collapsable from "../components/CollapsableElement";
function Stats(props) {
  const { getCollapsableProps } = props;
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

  if (props.games === "all") {
    return (
      <Fragment>
        <ul className={props.className ? props.className : ""} style={props.style ? props.style : {}}>
          <CreateBadge image={props.badge} alt="Team badge" ClassName={"ColumnBadge"} />
          <li className="FormHeader">League results (most recent on right)</li>
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
            <li className="FormSummaryHome">{props.FormTextString ? props.FormTextString : ""}</li>
            <li className="StyleOfPlay">{`Style: ${props.StyleOfPlay ? props.StyleOfPlay : "N/A"}`}</li>
            <li className="StyleOfPlay">{`${props.homeOrAway ? props.homeOrAway : "N/A"} style: ${props.StyleOfPlayHomeOrAway ? props.StyleOfPlayHomeOrAway : "N/A"}`}</li>
            {/* <li className="FavouriteSummaryHome">{props.FavouriteRecord ? props.FavouriteRecord : "Graphs also only available to paying customers"}</li> */}
          </div>
          <div className="AllStats">
            <Collapsable buttonText={`Key Stats`}
              classNameButton="StatHeader"
              {...getCollapsableProps("Key Stats")}
              isOpen={true}
              element={
                <><li
                  key="LeaguePosition"
                  className="LeaguePosition"
                  data-cy={props.name ? props.name + "leaguePosition" : "leaguePosition"}
                >
                  {`League position: ${props.leaguePosition !== undefined ? props.leaguePosition : "N/A"
                    }`}
                </li>
                  <li
                    key="TeamScored"
                    className="TeamScored"
                    data-cy={props.name ? props.name + "teamScored" : "teamScored"}
                  >
                    {`Avg goals scored: ${props.goals !== undefined ? props.goals : "N/A"}`}
                  </li>
                  <li
                    key="TeamConceeded"
                    className="TeamConceeded"
                    data-cy={props.name ? props.name + "teamConceded" : "teamConceded"}
                  >
                    {`Avg goals conceeded: ${props.conceeded !== undefined ? props.conceeded : "N/A"}`}
                  </li>
                  <li key="TeamXG" className="TeamXG" data-cy={props.name ? props.name + "teamXG" : "teamXG"}>
                    {`Avg XG: ${props.XG !== undefined ? props.XG : "N/A"}`}
                  </li>
                  <li
                    key="TeamXGConceded"
                    className="TeamXGConceded"
                    data-cy={props.name ? props.name + "teamXGConceded" : "teamXGConceded"}
                  >
                    {`Avg XG conceded: ${props.XGConceded !== undefined ? props.XGConceded : "N/A"}`}
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
                    {`Goal difference ${props.homeOrAway ? props.homeOrAway : "N/A"} : ${props.goalDifferenceHomeOrAway !== undefined ? props.goalDifferenceHomeOrAway : "N/A"
                      }`}
                  </li>
                  <li
                    key="TeamPossession"
                    className="TeamPossession"
                    data-cy={props.name ? props.name + "teamPossession" : "teamPossession"}
                  >
                    {`Avg possession: ${props.possession !== undefined ? props.possession : "N/A"}%`}
                  </li></>
              }
            />
            <Collapsable
              buttonText={`Attacking`}
              {...getCollapsableProps("Attacking")}
              classNameButton="StatHeader"
              element={
                <><li
                  key="AverageShots"
                  className="AverageShots"
                  data-cy={props.name ? props.name + "AverageShots" : "AverageShots"}
                >
                  {`Avg shots: ${props.shots !== undefined ? props.shots : "N/A"}`}
                </li><li
                  key="AverageSOT"
                  className="AverageSOT"
                  data-cy={props.name ? props.name + "averageSOT" : "averageSOT"}
                >
                    {`Avg shots on target: ${props.sot !== undefined ? props.sot : "N/A"}`}
                  </li><li
                    key="DangerousAttacks"
                    className="DangerousAttacks"
                    data-cy={props.name ? props.name + "dangerousAttacks" : "dangerousAttacks"}
                  >
                    {`Avg dangerous attacks: ${props.dangerousAttacks !== undefined ? props.dangerousAttacks : "N/A"}`}
                  </li><li
                    key="TeamShotsInsideBox"
                    className="TeamShotsInsideBox"
                    data-cy={props.name ? props.name + "teamShotsInsideBox" : "teamShotsInsideBox"}
                  >
                    {`Shots inside box: ${props.shotsInsideBox !== undefined ? props.shotsInsideBox : "N/A"}`}
                  </li>
                  <li key="GoalsFromInsideBox" className="GoalsFromInsideBox" data-cy={props.name ? props.name + "goalsFromInsideBox" : "goalsFromInsideBox"}>
                    {`Goals from inside box: ${props.goalsFromInsideTheBox !== undefined ? props.goalsFromInsideTheBox : "N/A"}`}
                  </li>
                  <li key="GoalsFromOutsideBox" className="GoalsFromOutsideBox" data-cy={props.name ? props.name + "goalsFromOutsideBox" : "goalsFromOutsideBox"}>
                    {`Goals from outside box: ${props.goalsFromOutsideTheBox !== undefined ? props.goalsFromOutsideTheBox : "N/A"}`}
                  </li>
                  <li
                    key="fastBreakShots"
                    className="fastBreakShots"
                    data-cy={props.name ? props.name + "fastBreakShots" : "fastBreakShots"}
                  >
                    {`Fast break shots: ${props.fastBreakShots !== undefined ? props.fastBreakShots : "N/A"}`}
                  </li>
                  <li
                    key="bigChances"
                    className="bigChances"
                    data-cy={props.name ? props.name + "bigChances" : "bigChances"}
                  >
                    {`Big chances created: ${props.bigChances !== undefined ? props.bigChances : "N/A"}`}
                  </li>
                  <li
                    key="bigChancesMissed"
                    className="bigChancesMissed"
                    data-cy={props.name ? props.name + "bigChancesMissed" : "bigChancesMissed"}
                  >
                    {`Big chances missed: ${props.bigChancesMissed !== undefined ? props.bigChancesMissed : "N/A"}`}
                  </li>
                </>
              }
            />
            <Collapsable
              buttonText={`Defensive`}
              classNameButton="StatHeader"
              {...getCollapsableProps("Defensive")}

              element={
                <>
                  <li key="shotsOnTargetAgainst" className="shotsOnTargetAgainst" data-cy={props.name ? props.name + "shotsOnTargetAgainst" : "shotsOnTargetAgainst"}>
                    {`Avg Shots on target against: ${props.shotsOnTargetAgainst !== undefined ? props.shotsOnTargetAgainst : "N/A"}`}
                  </li>
                  <li
                    key="TeamShotsInsideBoxAgainst"
                    className="TeamShotsInsideBoxAgainst"
                    data-cy={props.name ? props.name + "teamShotsInsideBoxAgainst" : "teamShotsInsideBoxAgainst"}
                  >
                    {`Shots inside box against: ${props.shotsInsideBoxAgainst !== undefined ? props.shotsInsideBoxAgainst : "N/A"}`}
                  </li>
                  <li
                    key="bigChancesConceded"
                    className="bigChancesConceded"
                    data-cy={props.name ? props.name + "bigChancesConceded" : "bigChancesConceded"}
                  >
                    {`Big chances against: ${props.bigChancesConceded !== undefined ? props.bigChancesConceded : "N/A"}`}
                  </li>
                  <li key="ErrorsLeadingToShotAgainst" className="ErrorsLeadingToShotAgainst" data-cy={props.name ? props.name + "ErrorsLeadingToShotAgainst" : "ErrorsLeadingToShotAgainst"}>
                    {`Errors leading to shot against: ${props.errorsLeadingToShotAgainst !== undefined ? props.errorsLeadingToShotAgainst : "N/A"}`}
                  </li>
                </>
              }
            />
            <Collapsable buttonText={"In Possession"}
              classNameButton="StatHeader"
              {...getCollapsableProps("In Possession")}
              element={
                <>
                  <li key="PPAA" className="PPAA" data-cy={props.name ? props.name + "PPAA" : "PPAA"}>
                    {`Passes per attacking action: ${props.PPAA !== undefined ? `${props.PPAA}` : "N/A"}`}
                  </li>
                  {/* <span className="StatExplanation">
                    PPAA = Total Opposition Half Passes / Total Attacking Actions (Shots + Crosses + Dribbles + Big Chances Created)
                  </span> */}
                  <li key="AccuratePassesPercentage" className="AccuratePassesPercentage" data-cy={props.name ? props.name + "AccuratePassesPercentage" : "AccuratePassesPercentage"}>
                    {`Accurate passes: ${props.accuratePassesPercentage !== undefined ? `${props.accuratePassesPercentage}%` : "N/A"}`}
                  </li>
                  <li key="AccuratePassesOpponentHalf" className="AccuratePassesOpponentHalf" data-cy={props.name ? props.name + "AccuratePassesOpponentHalf" : "AccuratePassesOpponentHalf"}>
                    {`Accurate attacking passes: ${props.accuratePassesOpponentHalf !== undefined ? `${props.accuratePassesOpponentHalf}%` : "N/A"}`}
                  </li>
                  <li key="AccuratePassesDefensiveHalf" className="AccuratePassesDefensiveHalf" data-cy={props.name ? props.name + "AccuratePassesDefensiveHalf" : "AccuratePassesDefensiveHalf"}>
                    {`Accurate own half passes: ${props.accuratePassesDefensiveHalf !== undefined ? `${props.accuratePassesDefensiveHalf}%` : "N/A"}`}
                  </li>
                  <li key="LongBallPercentage" className="LongBallPercentage" data-cy={props.name ? props.name + "LongBallPercentage" : "LongBallPercentage"}>
                    {`Long ball percentage: ${props.longBallPercentage !== undefined ? `${props.longBallPercentage}%` : "N/A"}`}
                  </li>
                  <li key="AccurateLongBallsPercentage" className="AccurateLongBallsPercentage" data-cy={props.name ? props.name + "AccurateLongBallsPercentage" : "AccurateLongBallsPercentage"}>
                    {`Accurate long balls: ${props.accurateLongBallsPercentage !== undefined ? `${props.accurateLongBallsPercentage}%` : "N/A"}`}
                  </li>
                  <li key="AccurateCrosses" className="AccurateCrosses" data-cy={props.name ? props.name + "AccurateCrosses" : "AccurateCrosses"}>
                    {`Accurate crosses: ${props.accurateCrosses !== undefined ? `${props.accurateCrosses}` : "N/A"}`}
                  </li>
                  <li key="dribbleAttempts" className="dribbleAttempts" data-cy={props.name ? props.name + "dribbleAttempts" : "dribbleAttempts"}>
                    {`Dribble attempts: ${props.dribbleAttempts !== undefined ? `${props.dribbleAttempts}` : "N/A"}`}
                  </li>
                  <li key="successfulDribbles" className="successfulDribbles" data-cy={props.name ? props.name + "successfulDribbles" : "successfulDribbles"}>
                    {`Successful dribbles: ${props.successfulDribbles !== undefined ? `${props.successfulDribbles}` : "N/A"}`}
                  </li>
                </>
              }
            />
            <Collapsable buttonText={"Out Of Possession"}
              classNameButton="StatHeader"
              {...getCollapsableProps("Out Of Possession")}

              element={
                <>
                  <li key="PPDA" className="PPDA" data-cy={props.name ? props.name + "PPDA" : "PPDA"}>
                    {`Passes per defensive action: ${props.PPDA !== undefined ? `${props.PPDA}` : "N/A"}`}
                  </li>
                  {/* <span className="StatExplanation">
                    PPDA = Total Own Half Passes Against / Total Defensive Actions (Tackles + Interceptions + Clearances + Blocks)
                  </span> */}
                  <li key="ballRecovery" className="ballRecovery" data-cy={props.name ? props.name + "ballRecovery" : "ballRecovery"}>
                    {`Ball recoveries: ${props.ballRecovery !== undefined ? `${props.ballRecovery}` : "N/A"}`}
                  </li>
                  <li key="interceptions" className="interceptions" data-cy={props.name ? props.name + "interceptions" : "interceptions"}>
                    {`Interceptions: ${props.interceptions !== undefined ? `${props.interceptions}` : "N/A"}`}
                  </li>
                  <li
                    key="DuelsWon"
                    className="DuelsWon"
                    data-cy={props.name ? props.name + "duelsWon" : "duelsWon"}
                  >
                    {`Duels won: ${props.duelsWonPercentage !== undefined ? `${props.duelsWonPercentage}%` : "N/A"}`}
                  </li>
                  <li
                    key="AerialDuelsWon"
                    className="AerialDuelsWon"
                    data-cy={props.name ? props.name + "aerialDuelsWon" : "aerialDuelsWon"}
                  >
                    {`Aerial duels won: ${props.aerialDuelsWonPercentage !== undefined ? `${props.aerialDuelsWonPercentage}%` : "N/A"}`}
                  </li>
                  <li key="accurateLongBallsAgainstPercentage" className="accurateLongBallsAgainstPercentage" data-cy={props.name ? props.name + "accurateLongBallsAgainstPercentage" : "accurateLongBallsAgainstPercentage"}>
                    {`Accurate long balls against: ${props.accurateLongBallsAgainstPercentage !== undefined ? `${props.accurateLongBallsAgainstPercentage}%` : "N/A"}`}
                  </li>
                </>
              }
            />
            <Collapsable buttonText={"Form"}
              classNameButton="StatHeader"
              {...getCollapsableProps("Form")}

              element={
                <> <li key="PPG" className="PPG" data-cy={props.name ? props.name + "PPG" : "PPG"}>
                  {`Season PPG: ${props.ppg !== undefined ? props.ppg : "N/A"}`}
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
                    key="WinPercentage"
                    className="WinPercentage"
                    data-cy={props.name ? props.name + "WinPercentage" : "WinPercentage"}
                  >
                    {props.homeOrAway && props.winPercentage !== undefined && props.winPercentage !== "N/A" ? `${props.homeOrAway} PPG: ${props.winPercentage.toFixed(2)}` : "N/A"}
                  </li></>
              }
            />
            <Collapsable buttonText={"Discipline"}
              classNameButton="StatHeader"
              {...getCollapsableProps("Discipline")}
              element={
                <> <li
                  key="CardsTotal"
                  className="CardsTotal"
                  data-cy={props.name ? props.name + "CardsTotal" : "CardsTotal"}
                >
                  {`Yellow cards: ${props.CardsTotal !== undefined ? props.CardsTotal : "N/A"}`}
                </li>
                  <li
                    key="RedCardsTotal"
                    className="RedCardsTotal"
                    data-cy={props.name ? props.name + "RedCardsTotal" : "RedCardsTotal"}
                  >
                    {`Red cards: ${props.RedCardsTotal !== undefined ? props.RedCardsTotal : "N/A"}`}
                  </li>
                  <li
                    key="Fouls"
                    className="Fouls"
                    data-cy={props.name ? props.name + "Fouls" : "Fouls"}
                  >
                    {`Fouls: ${props.Fouls !== undefined ? props.Fouls : "N/A"}`}
                  </li>
                  <li key="PenaltiesConceded" className="PenaltiesConceded" data-cy={props.name ? props.name + "PenaltiesConceded" : "PenaltiesConceded"}>
                    {`Penalties conceded: ${props.PenaltiesConceded !== undefined ? props.PenaltiesConceded : "N/A"}`}
                  </li>
                </>
              }
            />
            <Collapsable buttonText={"Set Pieces"}
              classNameButton="StatHeader"
              {...getCollapsableProps("Set Pieces")}
              element={
                <> <li
                  key="CornersAverage"
                  className="CornersAverage"
                  data-cy={props.name ? props.name + "CornersAverage" : "CornersAverage"}
                >
                  {`Corners average: ${props.CornersAverage !== undefined ? props.CornersAverage : "N/A"}`}
                </li>
                  <li
                    key="FreeKickGoals"
                    className="FreeKickGoals"
                    data-cy={props.name ? props.name + "FreeKickGoals" : "FreeKickGoals"}
                  >
                    {`Free kick goals: ${props.FreeKickGoals !== undefined ? props.FreeKickGoals : "N/A"}`}
                  </li>
                </>
              }
            />
            <Collapsable buttonText={"Misc"}
              classNameButton="StatHeader"
              {...getCollapsableProps("Misc")}
              element={
                <>         <li
                  key="TeamAverageRating"
                  className="TeamAverageRating"
                  data-cy={props.name ? props.name + "teamAverageRating" : "teamAverageRating"}
                >
                  {`Avg rating: ${props.averageRating !== undefined ? props.averageRating : "N/A"}`}
                </li>


                  <li
                    key="TeamXGSwing"
                    className="TeamXGSwing"
                    data-cy={props.name ? props.name + "teamXGSwing" : "teamXGSwing"}
                  >
                    {`XG difference swing (last 5): ${props.XGSwing !== undefined ? props.XGSwing?.toFixed(2) : "N/A"
                      }`}
                  </li>
                  <li key="Offsides" className="Offsides" data-cy={props.name ? props.name + "Offsides" : "Offsides"}>
                    {`Offsides: ${props.offsides !== undefined ? props.offsides : "N/A"}`}
                  </li>
                </>
              }
            />
          </div>
        </ul>
        <div id="h2hStats"></div>
      </Fragment>
    );
  } else if (props.games === "hOrA") {
    return (
      <Fragment>
        <ul className={props.className ? props.className : ""} style={props.style ? props.style : {}}>
          <CreateBadge image={props.badge} alt="Team badge" ClassName={"ColumnBadge"} />

          <li className="FormHeader">League results (most recent on right)</li>
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
          <div className="AllStats">
            <div className="FormSummaries">
              <li className="StyleOfPlay">{`${props.homeOrAway ? props.homeOrAway : "N/A"} style: ${props.StyleOfPlayHomeOrAway ? props.StyleOfPlayHomeOrAway : "N/A"}`}</li>
            </div>
            <li
              key="TeamScored"
              className="TeamScored"
              data-cy={props.name ? props.name + "teamScored" : "teamScored"}
            >
              {`Avg goals scored: ${props.goals !== undefined ? props.goals : "N/A"}`}
            </li>
            <li
              key="TeamConceeded"
              className="TeamConceeded"
              data-cy={props.name ? props.name + "teamConceded" : "teamConceded"}
            >
              {`Avg goals conceeded: ${props.conceeded !== undefined ? props.conceeded : "N/A"}`}
            </li>
            <li
              key="TeamPossession"
              className="TeamPossession"
              data-cy={props.name ? props.name + "teamPossession" : "teamPossession"}
            >
              {`Avg possession: ${props.possession !== undefined ? props.possession : "N/A"}%`}
            </li>
            <li key="TeamXG" className="TeamXG" data-cy={props.name ? props.name + "teamXG" : "teamXG"}>
              {`Avg XG: ${props.XG !== undefined ? props.XG : "N/A"}`}
            </li>
            <li
              key="TeamXGConceded"
              className="TeamXGConceded"
              data-cy={props.name ? props.name + "teamXGConceded" : "teamXGConceded"}
            >
              {`Avg XG conceded: ${props.XGConceded !== undefined ? props.XGConceded : "N/A"}`}
            </li>
            <li
              key="goalDifferenceHorA"
              className="goalDifferenceHorA"
              data-cy={props.name ? props.name + "goalDifference" : "goalDifference"}
            >
              {`Goal difference ${props.homeOrAway ? props.homeOrAway : "N/A"} : ${props.goalDifferenceHomeOrAway !== undefined ? props.goalDifferenceHomeOrAway : "N/A"
                }`}
            </li>
            <li
              key="AverageShots"
              className="AverageShots"
              data-cy={props.name ? props.name + "AverageShots" : "AverageShots"}
            >
              {`Avg shots: ${props.shots !== undefined ? props.shots : "N/A"}`}
            </li>
            <li
              key="AverageSOT"
              className="AverageSOT"
              data-cy={props.name ? props.name + "averageSOT" : "averageSOT"}
            >
              {`Avg shots on target: ${props.sot !== undefined ? props.sot : "N/A"}`}
            </li>
            <li
              key="DangerousAttacks"
              className="DangerousAttacks"
              data-cy={props.name ? props.name + "dangerousAttacks" : "dangerousAttacks"}
            >
              {`Avg dangerous attacks: ${props.dangerousAttacks !== undefined ? props.dangerousAttacks : "N/A"}`}
            </li>
            <li
              key="WinPercentage"
              className="WinPercentage"
              data-cy={props.name ? props.name + "WinPercentage" : "WinPercentage"}
            >
              {props.homeOrAway && props.winPercentage !== undefined && props.winPercentage !== "N/A" ? `${props.homeOrAway} PPG: ${props.winPercentage.toFixed(2)}` : "N/A"}
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
          <div className="AllStats">
            <li
              key="TeamScored"
              className="TeamScored"
              data-cy={props.name ? props.name + "teamScored" : "teamScored"}
            >
              {`Avg goals scored: ${props.goals !== undefined ? props.goals : "N/A"}`}
            </li>
            <li
              key="TeamConceeded"
              className="TeamConceeded"
              data-cy={props.name ? props.name + "teamConceded" : "teamConceded"}
            >
              {`Avg goals conceeded: ${props.conceeded !== undefined ? props.conceeded : "N/A"}`}
            </li>
            <li
              key="TeamPossession"
              className="TeamPossession"
              data-cy={props.name ? props.name + "teamPossession" : "teamPossession"}
            >
              {`Avg possession: ${props.possession !== undefined ? props.possession : "N/A"}%`}
            </li>
            <li key="TeamXG" className="TeamXG" data-cy={props.name ? props.name + "teamXG" : "teamXG"}>
              {`Avg XG: ${props.XG !== undefined ? props.XG : "N/A"}`}
            </li>
            <li
              key="TeamXGConceded"
              className="TeamXGConceded"
              data-cy={props.name ? props.name + "teamXGConceded" : "teamXGConceded"}
            >
              {`Avg XG conceded: ${props.XGConceded !== undefined ? props.XGConceded : "N/A"}`}
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
              key="AverageShots"
              className="AverageShots"
              data-cy={props.name ? props.name + "AverageShots" : "AverageShots"}
            >
              {`Avg shots: ${props.shots !== undefined ? props.shots : "N/A"}`}
            </li>
            <li
              key="AverageSOT"
              className="AverageSOT"
              data-cy={props.name ? props.name + "averageSOT" : "averageSOT"}
            >
              {`Avg shots on target: ${props.sot !== undefined ? props.sot : "N/A"}`}
            </li>
            <li
              key="DangerousAttacks"
              className="DangerousAttacks"
              data-cy={props.name ? props.name + "dangerousAttacks" : "dangerousAttacks"}
            >
              {`Avg dangerous attacks: ${props.dangerousAttacks !== undefined ? props.dangerousAttacks : "N/A"}`}
            </li>
            <li key="PPG" className="PPG" data-cy={props.name ? props.name + "PPG" : "PPG"}>
              {`Last 5 PPG: ${props.ppg !== undefined ? props.ppg : "N/A"}`}
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
