import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { CreateBadge } from "../createBadge";
import {
  STANDINGS_MOVEMENT_LOOKBACK,
  getStandingsRowsForWeek,
} from "../../utils/leaguePositionSeries";

function MovementCell({ movement, lookback }) {
  const windowLabel =
    lookback === 1 ? "last gameweek" : `last ${lookback} gameweeks`;

  if (movement > 0) {
    return (
      <span
        className="Competition__positionRaceMove Competition__positionRaceMove--up"
        title={`Up ${movement} over the ${windowLabel}`}
      >
        <ArrowUp size={14} aria-hidden="true" />
        <span>{movement}</span>
      </span>
    );
  }

  if (movement < 0) {
    const places = Math.abs(movement);
    return (
      <span
        className="Competition__positionRaceMove Competition__positionRaceMove--down"
        title={`Down ${places} over the ${windowLabel}`}
      >
        <ArrowDown size={14} aria-hidden="true" />
        <span>{places}</span>
      </span>
    );
  }

  return (
    <span
      className="Competition__positionRaceMove Competition__positionRaceMove--same"
      title={`No change over the ${windowLabel}`}
    >
      <Minus size={14} aria-hidden="true" />
    </span>
  );
}

function formatGd(gd) {
  const n = Number(gd) || 0;
  if (n > 0) return `+${n}`;
  return String(n);
}

/**
 * Week-scrubbed standings table with rolling movement arrows (narrow viewports).
 */
export default function CompetitionPositionRaceTable({ series, weekIndex }) {
  const rows = getStandingsRowsForWeek(
    series,
    weekIndex,
    STANDINGS_MOVEMENT_LOOKBACK
  );

  if (!rows.length) {
    return null;
  }

  return (
    <div className="Competition__positionRaceTableWrap">
      <table className="Competition__positionRaceTable">
        <thead>
          <tr>
            <th scope="col" className="Competition__positionRaceTableMoveHead">
              <span className="Competition__positionRaceSrOnly">
                Movement over last {STANDINGS_MOVEMENT_LOOKBACK} gameweeks
              </span>
            </th>
            <th scope="col">#</th>
            <th scope="col" className="Competition__positionRaceTableTeamHead">
              Team
            </th>
            <th scope="col">Pld</th>
            <th scope="col">GD</th>
            <th scope="col">Pts</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.team}>
              <td className="Competition__positionRaceTableMove">
                <MovementCell
                  movement={row.movement}
                  lookback={row.movementLookback || STANDINGS_MOVEMENT_LOOKBACK}
                />
              </td>
              <td className="Competition__positionRaceTablePos">
                {row.position}
              </td>
              <td className="Competition__positionRaceTableTeam">
                <span className="Competition__positionRaceTableTeamCell">
                  <CreateBadge
                    image={row.badgePath || "-"}
                    alt=""
                    ClassName="Competition__positionRaceTableBadge"
                  />
                  <span className="Competition__positionRaceTableName">
                    {row.team}
                  </span>
                </span>
              </td>
              <td>{row.played}</td>
              <td>{formatGd(row.gd)}</td>
              <td className="Competition__positionRaceTablePts">{row.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
