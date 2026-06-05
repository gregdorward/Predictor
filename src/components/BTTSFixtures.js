import { Fragment, useEffect, useState } from "react";
import { withStyles, makeStyles } from "@material-ui/core/styles";
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Paper, Box, Typography
} from "@material-ui/core";
import { getBTTSFixtures } from "../logic/getStatsInsights";
import Logo from "../components/Logo";
import HamburgerMenu from "./HamburgerMenu";
import Canonical from "../components/Canonical";

// Modern Styling using Hook API for better performance
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
    boxShadow: "0 10px 30px rgba(0,0,0,0.15)", // Soft UK-style shadow
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
      backgroundColor: "rgba(var(--accent-color-rgb), 0.1)", // Requires an RGB var
      cursor: "default",
    },
  },
}))(TableRow);

export default function BTTSFixtures() {
  const classes = useStyles();
  const [games, setGames] = useState([]);

  useEffect(() => {
    async function fetchGames() {
      const data = await getBTTSFixtures();
      setGames(data);
    }
    fetchGames();
  }, []);

  const allowedCountries = ["England", "Scotland", "Italy", "Spain", "Germany", "France", "USA", "Denmark", "Greece", "Turkey", "Switzerland", "Austria", "Norway", "Mexico", "Poland", "Brazil", "Argentina", "Sweden", "Netherlands", "Portugal", "Belgium"];

  const filteredGames = games
    .filter((game) => allowedCountries.includes(game.country) && game.progress > 30 && game.avgGoals > 3)
    .slice(0, 30);

  return (
    <Fragment>
      <Canonical />
      <div className="DarkMode"><Logo /></div>
      <HamburgerMenu />
      
      <Box className={`${classes.container} SubpageContent`}>
        <a href="https://www.soccerstatshub.com/" className={classes.homeLink}>← Back to Home</a>
        
        <Typography variant="h1">BTTS Insights</Typography>
        <Typography variant="h2">High-potential fixtures based on combined scoring averages</Typography>
        
        <TableContainer component={Paper} className={`${classes.tableWrapper} SubpageTableScroll`}>
          <Table size="small" aria-label="BTTS potential table">
            <TableHead>
              <TableRow>
                <StyledTableCell align="left">Fixture</StyledTableCell>
                <StyledTableCell align="center" className="SubpageCol--date">Date</StyledTableCell>
                <StyledTableCell align="center" className="SubpageCol--country">Country</StyledTableCell>
                <StyledTableCell align="center">BTTS</StyledTableCell>
                <StyledTableCell align="center">Avg</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredGames.map((team, index) => (
                <StyledTableRow key={index}>
                  <StyledTableCell align="left" style={{ fontWeight: 600 }}>
                    {team.match}
                    <span className="SubpageCellMeta">{team.date}</span>
                  </StyledTableCell>
                  <StyledTableCell align="center" className="SubpageCol--date" style={{ opacity: 0.7 }}>
                    {team.date}
                  </StyledTableCell>
                  <StyledTableCell align="center" className="SubpageCol--country">
                    {team.country}
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <Box fontWeight="bold" color="var(--accent-color)">
                      {team.odds}
                    </Box>
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <Box 
                      style={{ 
                        backgroundColor: "var(--accent-color)", 
                        color: "#fff", 
                        borderRadius: 4, 
                        padding: "2px 6px", 
                        display: "inline-block",
                        fontWeight: 600 
                      }}
                    >
                      {team.avgGoals}
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