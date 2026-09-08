export function mergeFormEntry(allForm, formEntry) {
  const existingFormIndex = allForm.findIndex(
    (entry) =>
      entry.id === formEntry.id ||
      (entry.home?.teamName === formEntry.home?.teamName &&
        entry.away?.teamName === formEntry.away?.teamName)
  );
  if (existingFormIndex >= 0) {
    allForm[existingFormIndex] = formEntry;
  } else {
    allForm.push(formEntry);
  }
}

export function mergeLeagueResults(allLeagueResultsArrayOfObjects, leagueResults) {
  const existingLeagueIndex = allLeagueResultsArrayOfObjects.findIndex(
    (entry) => String(entry.id) === String(leagueResults.id)
  );
  if (existingLeagueIndex >= 0) {
    allLeagueResultsArrayOfObjects[existingLeagueIndex] = leagueResults;
  } else {
    allLeagueResultsArrayOfObjects.push(leagueResults);
  }
}
