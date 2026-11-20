/**
 * Row kinds decide how the value is shown and the comparison bar drawn:
 * - split: each side's share of the combined total
 * - percent: split bar, values shown with "%"
 * - signed: both sides on one axis centred on zero
 * - rank: no bar, the gap in places is shown instead
 *
 * `average` names the matching per-game field on the competition average team
 * (see buildCompetitionAverageTeam). Only rows whose team value comes from the
 * same fixture data set one, so the comparison is like for like.
 */

const ppgRow = (key, label, extra = {}) => ({ key, label, ...extra });

const GOALS_AND_XG_ROWS = [
  { key: "goals", label: "Avg goals scored", cy: "teamScored", average: "scored" },
  { key: "conceeded", label: "Avg goals conceded", cy: "teamConceded", average: "conceded" },
  { key: "XG", label: "Avg xG", cy: "teamXG", average: "xg" },
  { key: "npXG", label: "Avg npxG", cy: "teamNpXG", average: "npXG" },
  { key: "XGConceded", label: "Avg xG conceded", cy: "teamXGConceded", average: "xgAgainst" },
  {
    key: "npXGConceded",
    label: "Avg npxG conceded",
    cy: "teamNpXGConceded",
    average: "npXGAgainst",
  },
];

const SHOTS_ROW = { key: "shots", label: "Avg shots", cy: "AverageShots", average: "shots" };
const SOT_ROW = { key: "sot", label: "Avg shots on target", cy: "averageSOT", average: "sot" };
const DANGEROUS_ATTACKS_ROW = {
  key: "dangerousAttacks",
  label: "Avg dangerous attacks",
  cy: "dangerousAttacks",
  average: "dangerousAttacks",
};
const CORNERS_ROW = {
  key: "CornersAverage",
  label: "Corners average",
  cy: "CornersAverage",
  average: "corners",
};

export const ALL_STATS_SECTIONS = [
  {
    id: "key",
    label: "Key Stats",
    free: true,
    rows: [
      { key: "leaguePosition", label: "League position", kind: "rank", cy: "leaguePosition" },
      { key: "strengthChange", label: "Strength, last six", kind: "signed", cy: "strengthRating" },
      ...GOALS_AND_XG_ROWS,
      { key: "goalDifference", label: "Goal difference", kind: "signed", cy: "goalDifference" },
      {
        key: "goalDifferenceHomeOrAway",
        label: "Goal difference at venue",
        kind: "signed",
        cy: "goalDifferenceHorA",
      },
      { key: "possession", label: "Avg possession", kind: "percent", cy: "teamPossession" },
    ],
  },
  {
    id: "attacking",
    label: "Attacking",
    rows: [
      SHOTS_ROW,
      SOT_ROW,
      { key: "shootingAccuracy", label: "Shooting accuracy", kind: "percent", cy: "shootingAccuracy" },
      { key: "goalConversionRate", label: "Shot conversion", kind: "percent", cy: "goalConversionRate" },
      DANGEROUS_ATTACKS_ROW,
      { key: "shotsInsideBox", label: "Shots inside box", cy: "teamShotsInsideBox" },
      { key: "shotsFromOutsideTheBox", label: "Shots outside box", cy: "shotsFromOutsideBox" },
      {
        key: "shotsFromInsideBoxPercentage",
        label: "Shots taken inside box",
        kind: "percent",
        decimals: 0,
        cy: "shotsFromInsideBoxPercentage",
      },
      { key: "goalsFromInsideTheBox", label: "Goals inside box", cy: "goalsFromInsideBox" },
      { key: "goalsFromOutsideTheBox", label: "Goals outside box", cy: "goalsFromOutsideBox" },
      { key: "fastBreakShots", label: "Fast break shots", cy: "fastBreakShots" },
      { key: "bigChances", label: "Big chances created", cy: "bigChances" },
      { key: "bigChancesMissed", label: "Big chances missed", cy: "bigChancesMissed" },
      {
        key: "bigChanceConversionRate",
        label: "Big chance conversion",
        kind: "percent",
        cy: "bigChanceConversionRate",
      },
    ],
  },
  {
    id: "defensive",
    label: "Defensive",
    rows: [
      {
        key: "cleansheetPercentage",
        label: "Clean sheets",
        kind: "percent",
        cy: "cleanSheetPercentage",
        average: "cleanSheet",
      },
      { key: "shotsOnTargetAgainst", label: "Avg shots on target against", cy: "shotsOnTargetAgainst" },
      { key: "shotsInsideBoxAgainst", label: "Shots inside box against", cy: "teamShotsInsideBoxAgainst" },
      {
        key: "shotsFromOutsideTheBoxAgainst",
        label: "Shots outside box against",
        cy: "shotsFromOutsideTheBoxAgainst",
      },
      {
        key: "shotsInsideBoxPercentAgainst",
        label: "Shots against from inside box",
        kind: "percent",
        decimals: 0,
        cy: "shotsInsideBoxPercentAgainst",
      },
      { key: "bigChancesConceded", label: "Big chances against", cy: "bigChancesConceded" },
      {
        key: "accurateCrossesAgainst",
        label: "Accurate crosses against",
        kind: "percent",
        cy: "accurateCrossesAgainst",
      },
      {
        key: "errorsLeadingToShotAgainst",
        label: "Errors leading to a shot",
        cy: "ErrorsLeadingToShotAgainst",
      },
    ],
  },
  {
    id: "possession",
    label: "In Possession",
    rows: [
      { key: "PPAA", label: "Passes per attacking action", cy: "PPAA" },
      { key: "accuratePassesPercentage", label: "Accurate passes", kind: "percent", cy: "AccuratePassesPercentage" },
      {
        key: "accuratePassesOpponentHalf",
        label: "Accurate attacking passes",
        kind: "percent",
        cy: "AccuratePassesOpponentHalf",
      },
      {
        key: "accuratePassesDefensiveHalf",
        label: "Accurate own half passes",
        kind: "percent",
        cy: "AccuratePassesDefensiveHalf",
      },
      { key: "longBallPercentage", label: "Long ball share", kind: "percent", cy: "LongBallPercentage" },
      {
        key: "accurateLongBallsPercentage",
        label: "Accurate long balls",
        kind: "percent",
        cy: "AccurateLongBallsPercentage",
      },
      { key: "accurateCrosses", label: "Accurate crosses", kind: "percent", cy: "AccurateCrosses" },
      { key: "dribbleAttempts", label: "Dribble attempts", cy: "dribbleAttempts" },
      { key: "successfulDribbles", label: "Successful dribbles", cy: "successfulDribbles" },
      {
        key: "fastBreaksLeadingToShot",
        label: "Fast breaks ending in a shot",
        kind: "percent",
        cy: "fastBreaksLeadingToShot",
      },
    ],
  },
  {
    id: "outOfPossession",
    label: "Out Of Possession",
    rows: [
      { key: "PPDA", label: "Passes per defensive action", cy: "PPDA" },
      { key: "tackles", label: "Successful tackles per game", cy: "tackles" },
      { key: "ballRecovery", label: "Ball recoveries per game", cy: "ballRecovery" },
      { key: "interceptions", label: "Interceptions per game", cy: "interceptions" },
      { key: "duelsWonPercentage", label: "Duels won", kind: "percent", cy: "duelsWon" },
      { key: "aerialDuelsWonPercentage", label: "Aerial duels won", kind: "percent", cy: "aerialDuelsWon" },
      {
        key: "accurateLongBallsAgainstPercentage",
        label: "Long balls against completed",
        kind: "percent",
        cy: "accurateLongBallsAgainstPercentage",
      },
    ],
  },
  {
    id: "form",
    label: "Form",
    rows: [
      ppgRow("ppg", "Season PPG", { cy: "PPG" }),
      ppgRow("formTrend[0]", "Last 10 PPG", { getValue: (stats) => stats.formTrend?.[0], cy: "FormTrend10" }),
      ppgRow("formTrend[1]", "Last 6 PPG", { getValue: (stats) => stats.formTrend?.[1], cy: "FormTrend6" }),
      ppgRow("formTrend[2]", "Last 5 PPG", { getValue: (stats) => stats.formTrend?.[2], cy: "FormTrend5" }),
      ppgRow("winPercentage", "PPG at venue", { cy: "WinPercentage" }),
    ],
  },
  {
    id: "discipline",
    label: "Discipline",
    rows: [
      { key: "CardsPerGame", label: "Yellow cards per game", cy: "CardsTotal" },
      {
        key: "RedCardsPerGame",
        label: "Red cards per game",
        cy: "RedCardsTotal",
        average: "redCards",
      },
      { key: "FoulsPerGame", label: "Fouls per game", cy: "Fouls" },
      { key: "PenaltiesConceded", label: "Penalties conceded", cy: "PenaltiesConceded" },
    ],
  },
  {
    id: "setPieces",
    label: "Set Pieces",
    rows: [
      CORNERS_ROW,
      { key: "FreeKickGoals", label: "Free kick goals", cy: "FreeKickGoals" },
    ],
  },
  {
    id: "misc",
    label: "Misc",
    rows: [
      { key: "averageRating", label: "Avg rating", cy: "teamAverageRating" },
      { key: "XGSwing", label: "xG difference swing, last 5", kind: "signed", cy: "teamXGSwing" },
      { key: "offsides", label: "Offsides per game", cy: "Offsides" },
    ],
  },
];

export const RECENT_FORM_ROWS = [
  GOALS_AND_XG_ROWS[0],
  GOALS_AND_XG_ROWS[1],
  { key: "possession", label: "Avg possession", kind: "percent", cy: "teamPossession" },
  ...GOALS_AND_XG_ROWS.slice(2),
  { key: "goalDifference", label: "Goal difference", kind: "signed", cy: "goalDifference" },
  SHOTS_ROW,
  SOT_ROW,
  DANGEROUS_ATTACKS_ROW,
  ppgRow("ppg", "PPG", { cy: "PPG" }),
  CORNERS_ROW,
];
