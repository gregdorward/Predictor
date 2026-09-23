import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@material-ui/core";

function formatGd(gd) {
  const n = Number(gd) || 0;
  if (n > 0) return `+${n}`;
  return String(n);
}

function ClassicStandingsTable({ teams, groupName }) {
  return (
    <Table size="small" className="Competition__classicLeagueTable">
      <TableHead>
        <TableRow className="Competition__classicLeagueTableGroupRow">
          <TableCell
            colSpan={2}
            className="Competition__classicLeagueTableStickyBlock"
          />
          <TableCell align="center" rowSpan={2}>Pld</TableCell>
          <TableCell align="center" colSpan={5} className="Competition__classicLeagueTableVenueHead">
            Home
          </TableCell>
          <TableCell align="center" colSpan={5} className="Competition__classicLeagueTableVenueHead">
            Away
          </TableCell>
          <TableCell align="center" rowSpan={2}>GD</TableCell>
          <TableCell align="center" rowSpan={2}>Pts</TableCell>
        </TableRow>
        <TableRow>
          <TableCell
            align="center"
            className="Competition__classicLeagueTableStickyPos Competition__classicLeagueTableStickyPos--head"
          >
            #
          </TableCell>
          <TableCell
            className="Competition__classicLeagueTableStickyTeam Competition__classicLeagueTableStickyTeam--head"
          >
            Team
          </TableCell>
          <TableCell align="center">W</TableCell>
          <TableCell align="center">D</TableCell>
          <TableCell align="center">L</TableCell>
          <TableCell align="center">F</TableCell>
          <TableCell align="center">A</TableCell>
          <TableCell align="center">W</TableCell>
          <TableCell align="center">D</TableCell>
          <TableCell align="center">L</TableCell>
          <TableCell align="center">F</TableCell>
          <TableCell align="center">A</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {teams.map((team, index) => (
          <TableRow key={`${groupName || "league"}-${team.ID || team.Name}-${index}`}>
            <TableCell
              align="center"
              className="Competition__classicLeagueTableStickyPos"
            >
              {team.Position ?? index + 1}
            </TableCell>
            <TableCell
              className="Competition__classicLeagueTableStickyTeam Competition__classicLeagueTableTeam"
            >
              {team.Name}
            </TableCell>
            <TableCell align="center">{team.Played}</TableCell>
            <TableCell align="center">{team.HomeWins}</TableCell>
            <TableCell align="center">{team.HomeDraws}</TableCell>
            <TableCell align="center">{team.HomeLosses}</TableCell>
            <TableCell align="center">{team.HomeFor}</TableCell>
            <TableCell align="center">{team.HomeAgainst}</TableCell>
            <TableCell align="center">{team.AwayWins}</TableCell>
            <TableCell align="center">{team.AwayDraws}</TableCell>
            <TableCell align="center">{team.AwayLosses}</TableCell>
            <TableCell align="center">{team.AwayFor}</TableCell>
            <TableCell align="center">{team.AwayAgainst}</TableCell>
            <TableCell align="center">{formatGd(team.GoalDifference)}</TableCell>
            <TableCell align="center">{team.Points}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function groupTeams(teams) {
  const hasGroups = teams.some((team) => team.GroupName);
  if (!hasGroups) {
    return [{ name: null, teams }];
  }

  const groups = teams.reduce((acc, team) => {
    const key = team.GroupName || "Table";
    if (!acc[key]) acc[key] = [];
    acc[key].push(team);
    return acc;
  }, {});

  return Object.entries(groups).map(([name, groupTeamsList]) => ({
    name,
    teams: groupTeamsList,
  }));
}

/**
 * Sunday-paper style table: P, home W-D-L-F-A, away W-D-L-F-A, total GD and pts.
 */
export default function CompetitionClassicLeagueTable({ teams }) {
  if (!teams?.length || teams[0].HomeWins == null) {
    return null;
  }

  const groups = groupTeams(teams);

  return (
    <div className="Competition__classicLeagueTableWrap">
      {groups.map(({ name, teams: groupRows }) => (
        <TableContainer
          key={name || "overall"}
          component={Paper}
          className="Competition__table Competition__classicLeagueTableContainer"
        >
          {name ? <h3 className="GroupName">{name}</h3> : null}
          <ClassicStandingsTable teams={groupRows} groupName={name} />
        </TableContainer>
      ))}
    </div>
  );
}
