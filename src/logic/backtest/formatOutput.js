function escapeCsv(value) {
  const str = value == null ? "" : String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

const MATCH_CSV_COLUMNS = [
  "matchId",
  "date",
  "league",
  "homeTeam",
  "awayTeam",
  "predHome",
  "predAway",
  "actualHome",
  "actualAway",
  "prediction",
  "outcomeCorrect",
  "exactScore",
  "profit",
  "homeWinProb",
  "drawProb",
  "awayWinProb",
  "over25Prob",
  "bttsYesProb",
  "completeData",
  "formSource",
  "skippedReason",
];

export function buildResultsJson(rows) {
  return { matches: rows };
}

export function buildSummaryJson({ runId, params, summary, skippedDays }) {
  return {
    runId,
    generatedAt: new Date().toISOString(),
    runParams: params,
    ...summary,
    skippedDays,
  };
}

export function buildResultsCsv(rows) {
  const header = MATCH_CSV_COLUMNS.join(",");
  const lines = rows.map((row) =>
    MATCH_CSV_COLUMNS.map((col) => escapeCsv(row[col])).join(",")
  );
  return [header, ...lines].join("\n");
}
