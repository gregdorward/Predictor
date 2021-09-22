import React from "react";
import { withStyles, makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";

const StyledTableCell = withStyles((theme) => ({
  head: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
    padding: 5,
    textAlign: "center",
    fontSize: "2em",
    fontFamily: 'inherit',
  },
  body: {
    fontSize: "2em",
    fontFamily: 'inherit',
    padding: 10,
  },
}))(TableCell);

const StyledTableRow = withStyles((theme) => ({
  root: {
    "&:nth-of-type(odd)": {
      backgroundColor: theme.palette.action.hover,
      textAlign: "center",
    },
  },
}))(TableRow);


export default function CustomizedTables(props) {


  return (
    <TableContainer component={Paper} className="StatsTable">
      <Table aria-label="customized table">
        <TableHead>
          <TableRow>
            <StyledTableCell>Stat</StyledTableCell>
            <StyledTableCell>H2H history</StyledTableCell>
            <StyledTableCell>Odds (yes)</StyledTableCell>
            <StyledTableCell>Odds (no)</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
        <StyledTableRow key="O05">
            <StyledTableCell component="th" scope="row" align="center" padding="5">
              Over 0.5 Goals %
            </StyledTableCell>
            <StyledTableCell component="th" scope="row" align="center">
              {`${props.o05Stat}%`}
            </StyledTableCell>
            <StyledTableCell align="center">{props.o05Odds}</StyledTableCell>
            <StyledTableCell align="center">{props.u05Odds}</StyledTableCell>
          </StyledTableRow>
          <StyledTableRow key="O15">
            <StyledTableCell component="th" scope="row" align="center" padding="5">
              Over 1.5 Goals %
            </StyledTableCell>
            <StyledTableCell component="th" scope="row" align="center">
              {`${props.o15Stat}%`}
            </StyledTableCell>
            <StyledTableCell align="center">{props.o15Odds}</StyledTableCell>
            <StyledTableCell align="center">{props.u15Odds}</StyledTableCell>
          </StyledTableRow>
          <StyledTableRow key="O25">
            <StyledTableCell component="th" scope="row" align="center">
              Over 2.5 Goals %
            </StyledTableCell>
            <StyledTableCell component="th" scope="row" align="center">
              {`${props.o25Stat}%`}
            </StyledTableCell>
            <StyledTableCell align="center">{props.o25Odds}</StyledTableCell>
            <StyledTableCell align="center">{props.u25Odds}</StyledTableCell>
          </StyledTableRow>
          <StyledTableRow key="O35">
            <StyledTableCell component="th" scope="row" align="center">
              Over 3.5 Goals %
            </StyledTableCell>
            <StyledTableCell component="th" scope="row" align="center">
              {`${props.o35Stat}%`}
            </StyledTableCell>
            <StyledTableCell align="center">{props.o35Odds}</StyledTableCell>
            <StyledTableCell align="center">{props.u35Odds}</StyledTableCell>
          </StyledTableRow>
          <StyledTableRow key="BTTS">
            <StyledTableCell component="th" scope="row" align="center">
              BTTS %
            </StyledTableCell>
            <StyledTableCell component="th" scope="row" align="center">
              {`${props.BTTSStat}%`}
            </StyledTableCell>
            <StyledTableCell align="center">{props.BTTSOdds}</StyledTableCell>
            <StyledTableCell align="center">{props.BTTSOddsNo}</StyledTableCell>
          </StyledTableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}
