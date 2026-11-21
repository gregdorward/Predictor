import { useId, useState } from "react";
import {
  MIN_LEAGUE_SAMPLE,
  buildLeagueRoiRows,
  formatRecord,
  formatRoi,
  roiTone,
} from "./leagueRoiModel";

function LeagueRoiRow({ row }) {
  const tone = roiTone(row);
  return (
    <tr className={`LeagueRoi__row LeagueRoi__row--${tone}`}>
      <th scope="row">
        <span className="LeagueRoi__name">{row.name}</span>
        <span className="LeagueRoi__meta">{formatRecord(row)}</span>
      </th>
      <td className={`LeagueRoi__roi LeagueRoi__roi--${tone}`}>
        {formatRoi(row.roi)}
      </td>
    </tr>
  );
}

export default function LeagueRoiList({ leagues }) {
  const { ready, thin, total } = buildLeagueRoiRows(leagues);
  const [open, setOpen] = useState(false);
  const panelId = useId();

  if (total === 0) return null;

  return (
    <section className="LeagueRoi" aria-label="ROI by league">
      <button
        type="button"
        className="LeagueRoi__trigger"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        <span>ROI by League</span>
        <span className="LeagueRoi__count">{total}</span>
        <span className="LeagueRoi__sr"> leagues</span>
        <svg
          className="LeagueRoi__chevron"
          viewBox="0 0 16 16"
          aria-hidden="true"
          focusable="false"
        >
          <path
            d="M4 6.25 8 10.25 12 6.25"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <div className="LeagueRoi__panel" id={panelId} hidden={!open}>
        <table className="LeagueRoi__table">
          <caption>
            One unit staked on each settled match. Profit and loss colour
            starts at {MIN_LEAGUE_SAMPLE} matches. Highest return first.
          </caption>
          <thead>
            <tr>
              <th scope="col">League</th>
              <th scope="col" aria-sort="descending">
                ROI
              </th>
            </tr>
          </thead>
          {ready.length > 0 ? (
            <tbody>
              {ready.map((row) => (
                <LeagueRoiRow key={row.name} row={row} />
              ))}
            </tbody>
          ) : null}
          {thin.length > 0 ? (
            <tbody>
              <tr className="LeagueRoi__group">
                <th colSpan={2} scope="rowgroup">
                  Fewer than {MIN_LEAGUE_SAMPLE} settled matches
                </th>
              </tr>
              {thin.map((row) => (
                <LeagueRoiRow key={row.name} row={row} />
              ))}
            </tbody>
          ) : null}
        </table>
      </div>
    </section>
  );
}
