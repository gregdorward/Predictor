import { Fragment, useEffect, useState } from "react";
import { withStyles, makeStyles } from "@material-ui/core/styles";
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Paper, Box, Typography
} from "@material-ui/core";
import { getBTTSTeams } from "../logic/getStatsInsights";
import Logo from "../components/Logo";
import HamburgerMenu from "./HamburgerMenu";
import Canonical from "../components/Canonical";

// Consistent Modern Styling
const useStyles = makeStyles((theme) => ({
  container: {
    maxWidth: 1000,
    width: "100%",
    margin: "40px auto",
    padding: "1em 1em",
    boxSizing: "border-box",
    "& h1": {
      fontSize: "2em",
      fontWeight: 800,
      textAlign: "center",
      marginBottom: 8,
      color: "var(--text-color)",
    },
    "& h2": {
      fontSize: "1.5em",
      fontWeight: 400,
      textAlign: "center",
      marginBottom: 32,
      color: "var(--accent-color)",
      opacity: 0.8,
    },
  },
  tableWrapper: {
    borderRadius: 5,
    boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
    overflow: "hidden",
    maxWidth: "100%",
    border: "1px solid rgba(255,255,255,0.05)",
    backgroundColor: "var(--secondary-background-color)",
  },
  homeLink: {
    display: "inline-block",
    marginBottom: 20,
    textDecoration: "none",
    color: "var(--accent-color)",
    fontWeight: 600,
    "&:hover": { textDecoration: "underline" }
  }
}));

const StyledTableCell = withStyles(() => ({
  head: {
    backgroundColor: "var(--accent-color)",
    color: "var(--button-text-color)",
    fontWeight: 600,
    textTransform: "uppercase",
    fontSize: "1em",
    letterSpacing: "1px",
    borderBottom: "none",
  },
  body: {
    fontSize: "1em",
    padding: "1em 1em",
    borderBottom: "1px solid rgba(0,0,0,0.05)",
    color: "var(--text-color)",
  },
}))(TableCell);

const StyledTableRow = withStyles(() => ({
  root: {
    transition: "background-color 0.2s ease",
    "&:nth-of-type(even)": {
      backgroundColor: "rgba(255,255,255,0.02)",
    },
    "&:hover": {
      backgroundColor: "rgba(var(--accent-color-rgb), 0.1)",
      cursor: "default",
    },
  },
}))(TableRow);

export default function BTTSTeams() {
  const classes = useStyles();
  const [games, setGames] = useState([]);

  useEffect(() => {
    async function fetchGames() {
      const data = await getBTTSTeams();
      setGames(data);
    }
    fetchGames();
  }, []);

  const allowedCountries = ["England", "Scotland", "Italy", "Spain", "Germany", "France", "USA", "Denmark", "Greece", "Turkey", "Switzerland", "Austria", "Norway", "Mexico", "Poland", "Brazil", "Argentina", "Sweden", "Netherlands", "Portugal", "Belgium"];

  const filteredGames = games
    .filter((game) => allowedCountries.includes(game.country) && game.played > 10)
    .slice(0, 30);

  return (
    <Fragment>
      <Canonical />
      <div className="DarkMode"><Logo /></div>
      <HamburgerMenu />
      
      <Box className={`${classes.container} SubpageContent`}>
        <a href="https://www.soccerstatshub.com/" className={classes.homeLink}>← Back to Home</a>
        
        <Typography variant="h1">BTTS Elite Teams</Typography>
        <Typography variant="h2">Teams with the highest percentage of games ending in both teams to score</Typography>
        
        <TableContainer component={Paper} className={`${classes.tableWrapper} SubpageTableScroll`}>
          <Table size="small" aria-label="BTTS teams table">
            <TableHead>
              <TableRow>
                <StyledTableCell align="left">Name</StyledTableCell>
                <StyledTableCell align="center" className="SubpageCol--country">Country</StyledTableCell>
                <StyledTableCell align="center">BTTS %</StyledTableCell>
                <StyledTableCell align="center" className="SubpageCol--played">Played</StyledTableCell>
                <StyledTableCell align="center">Next</StyledTableCell>
                <StyledTableCell align="center">Odds</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredGames.map((team, index) => (
                <StyledTableRow key={index}>
                  <StyledTableCell align="left" style={{ fontWeight: 600 }}>
                    {team.name}
                  </StyledTableCell>
                  <StyledTableCell align="center" className="SubpageCol--country">
                    {team.country}
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <Box 
                      style={{ 
                        backgroundColor: "var(--accent-color)", 
                        color: "#fff", 
                        borderRadius: 4, 
                        padding: "2px 8px", 
                        display: "inline-block",
                        fontWeight: 600 
                      }}
                    >
                      {team.bttsPercentage}
                    </Box>
                  </StyledTableCell>
                  <StyledTableCell align="center" className="SubpageCol--played" style={{ opacity: 0.8 }}>
                    {team.played}
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <Box fontWeight="600">{team.opponent}</Box>
                    <span className="SubpageCellMeta">{team.date}</span>
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <Box fontWeight="bold" color="var(--accent-color)">
                      {team.odds}
                    </Box>
                  </StyledTableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Fragment>
  );
}