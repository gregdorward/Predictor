import TableContainer from "@material-ui/core/TableContainer";
import Paper from "@material-ui/core/Paper";
import LeagueTableExtras from "./LeagueTableExtras";

/**
 * Wraps LeagueTableExtras in the same container used by standard league tables
 * so stats headers, colours and column borders match other leagues.
 */
export default function LeagueTableExtrasPanel(props) {
  return (
    <TableContainer component={Paper} className="StatsTable">
      <LeagueTableExtras {...props} />
    </TableContainer>
  );
}
