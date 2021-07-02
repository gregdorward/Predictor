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

function getCornerOverBoolean(stat){
    if(stat > 10.5){
        return "Yes"
    } else if(stat <= 10.5){
        return "No"
    }
}

export default function CustomizedTables(props) {
    let corners = getCornerOverBoolean(props.CornersForecast)
    console.log(corners)

  return (
    <TableContainer component={Paper} className="StatsTable">
      <Table aria-label="customized table">
        <TableHead>
          <TableRow>
            <StyledTableCell>Stat</StyledTableCell>
            <StyledTableCell>H2H history</StyledTableCell>
            <StyledTableCell>Forecast</StyledTableCell>
            <StyledTableCell>Odds</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <StyledTableRow key="O15">
            <StyledTableCell component="th" scope="row" align="center" padding="5">
              Over 1.5 Goals %
            </StyledTableCell>
            <StyledTableCell component="th" scope="row" align="center">
              {`${props.o15Stat}%`}
            </StyledTableCell>
            <StyledTableCell align="center">{`${props.o15Forecast}%`}</StyledTableCell>
            <StyledTableCell align="center">{props.o15Odds}</StyledTableCell>
          </StyledTableRow>

          <StyledTableRow key="O25">
            <StyledTableCell component="th" scope="row" align="center">
              Over 2.5 Goals %
            </StyledTableCell>
            <StyledTableCell component="th" scope="row" align="center">
              {`${props.o25Stat}%`}
            </StyledTableCell>
            <StyledTableCell align="center">{`${props.o25Forecast}%`}</StyledTableCell>
            <StyledTableCell align="center">{props.o25Odds}</StyledTableCell>
          </StyledTableRow>

          <StyledTableRow key="BTTS">
            <StyledTableCell component="th" scope="row" align="center">
              BTTS %
            </StyledTableCell>
            <StyledTableCell component="th" scope="row" align="center">
              {`${props.BTTSStat}%`}
            </StyledTableCell>
            <StyledTableCell align="center">{`${props.BTTSForecast}%`}</StyledTableCell>
            <StyledTableCell align="center">{props.BTTSOdds}</StyledTableCell>
          </StyledTableRow>

          <StyledTableRow key="Corners">
            <StyledTableCell component="th" scope="row" align="center">
              Over 10.5 Corners
            </StyledTableCell>
            <StyledTableCell component="th" scope="row" align="center">
              {`${props.CornersStat}`}
            </StyledTableCell>
            <StyledTableCell align="center">{corners}</StyledTableCell>
            <StyledTableCell align="center">{props.CornersOdds}</StyledTableCell>
          </StyledTableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}
