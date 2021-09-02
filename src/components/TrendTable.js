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
    padding: 2,
    textAlign: "center",
    fontSize: "1em",
    fontFamily: 'inherit',
  },
  body: {
    fontSize: "1em",
    fontFamily: 'inherit',
    padding: 2,
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
            <StyledTableCell>Last 10</StyledTableCell>
            <StyledTableCell>Last 6</StyledTableCell>
            <StyledTableCell>Last 5</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <StyledTableRow key="O15">
            <StyledTableCell component="th" scope="row" align="center" padding="2">
              Average points
            </StyledTableCell>
            <StyledTableCell component="th" scope="row" align="center">
              {`${props.last10Points}`}
            </StyledTableCell>
            <StyledTableCell align="center">{`${props.last6Points}`}</StyledTableCell>
            <StyledTableCell align="center">{props.last5Points}</StyledTableCell>
          </StyledTableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}