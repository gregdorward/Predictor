export function getConferenceLeagueDivisions(bespokeLeagueArray, id) {
  return bespokeLeagueArray.filter(
    (table) => Number(table.id) === Number(id) && table.table?.length
  );
}

export function resolveMultiDivisionLeagueTables(bespokeLeagueArray, id) {
  const leagueTable = getConferenceLeagueDivisions(bespokeLeagueArray, id);
  if (leagueTable.length < 2 || !leagueTable[0]?.table || !leagueTable[1]?.table) {
    return null;
  }

  return {
    leagueTable1: leagueTable[0].table,
    leagueTable2: leagueTable[1].table,
    divisionName1: leagueTable[0].group,
    divisionName2: leagueTable[1].group,
  };
}
