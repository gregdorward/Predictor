import { sofaScoreIds } from "../constants/sofaScoreIds";
import { rounds } from "../components/TeamOfTheSeason";
import { API_FORM_ONLY_LEAGUE_IDS } from "./getFixtures";
import {
  fixedStatOrDash,
  formatStatDisplay,
  formatStatOrDash,
  ratioOrDash,
  ratioPercentOrDash,
  statOrDash,
  STAT_FALLBACK,
} from "../utils/formatStat";

function formatLeagueStat(value) {
  return formatStatDisplay(value);
}

function leagueDangerousAttacksValue(form) {
  if (!form) return 0;
  return (
    form.dangerousAttacksRollingAverage ??
    (form.AverageDangerousAttacksOverall !== 0
      ? form.AverageDangerousAttacksOverall
      : form.AverageDangerousAttacks) ??
    0
  );
}

function leagueStatNumber(value) {
  const n = Number(value);
  return Number.isNaN(n) ? 0 : n;
}

export function getOverallLeagueStatNumbers(form) {
  if (!form) return {};
  return {
    goals: leagueStatNumber(form.avgScored),
    conceeded: leagueStatNumber(form.avgConceeded),
    XG: leagueStatNumber(form.XGOverall),
    XGConceded: leagueStatNumber(form.XGAgainstAvgOverall),
    possession: leagueStatNumber(form.AveragePossessionOverall),
    shots: leagueStatNumber(form.avgShots),
    sot: leagueStatNumber(
      form.shotsOnTargetRollingAverage ?? form.AverageShotsOnTargetOverall
    ),
    dangerousAttacks: leagueStatNumber(leagueDangerousAttacksValue(form)),
    ppg: leagueStatNumber(form.avPointsAll),
    goalDifference: leagueStatNumber(form.goalDifference),
    goalDifferenceHomeOrAway: leagueStatNumber(form.goalDifferenceHomeOrAway),
    corners: leagueStatNumber(form.AverageCorners),
  };
}

export function getOverallLeagueStats(form) {
  const stats = getOverallLeagueStatNumbers(form);
  return {
    goals: formatLeagueStat(stats.goals),
    conceeded: formatLeagueStat(stats.conceeded),
    XG: formatLeagueStat(stats.XG),
    XGConceded: formatLeagueStat(stats.XGConceded),
    possession: formatLeagueStat(stats.possession),
    shots: formatLeagueStat(stats.shots),
    sot: formatLeagueStat(stats.sot),
    dangerousAttacks: formatLeagueStat(stats.dangerousAttacks),
    ppg: formatLeagueStat(stats.ppg),
    goalDifference: formatLeagueStat(stats.goalDifference),
    goalDifferenceHomeOrAway: formatLeagueStat(stats.goalDifferenceHomeOrAway),
    corners: formatLeagueStat(stats.corners),
  };
}

function getLast5LeagueStatNumbers(form) {
  if (!form) return {};
  return {
    goals: leagueStatNumber(form.last5Goals),
    conceeded: leagueStatNumber(form.last5GoalsConceeded),
    XG: leagueStatNumber(form.avXGLast5),
    XGConceded: leagueStatNumber(form.avXGAgainstLast5),
    possession: leagueStatNumber(form.avPosessionLast5),
    shots: leagueStatNumber(form.avShotsLast5),
    sot: leagueStatNumber(form.avSOTLast5),
    dangerousAttacks: leagueStatNumber(
      form.avDALast5 !== 0 ? form.avDALast5 : form.AverageDangerousAttacks
    ),
    ppg: leagueStatNumber(form.avPoints5),
    goalDifference: leagueStatNumber(form.last5GoalDiff),
    corners: leagueStatNumber(form.last5Corners),
  };
}

export function getLast5LeagueStats(form) {
  const stats = getLast5LeagueStatNumbers(form);
  return {
    goals: formatLeagueStat(stats.goals),
    conceeded: formatLeagueStat(stats.conceeded),
    XG: formatLeagueStat(stats.XG),
    XGConceded: formatLeagueStat(stats.XGConceded),
    possession: formatLeagueStat(stats.possession),
    shots: formatLeagueStat(stats.shots),
    sot: formatLeagueStat(stats.sot),
    dangerousAttacks: formatLeagueStat(stats.dangerousAttacks),
    ppg: formatLeagueStat(stats.ppg),
    goalDifference: formatLeagueStat(stats.goalDifference),
    corners: formatLeagueStat(stats.corners),
  };
}

export function buildTeamAllStatsFields(teamStats, leagueStats, form) {
  const shotsInsideBox = teamStats?.shotsFromInsideTheBox;
  const shotsOutsideBox = teamStats?.shotsFromOutsideTheBox;
  const shotsInsideBoxAgainst = teamStats?.shotsFromInsideTheBoxAgainst;
  const shotsOutsideBoxAgainst = teamStats?.shotsFromOutsideTheBoxAgainst;

  return {
    goals: statOrDash(leagueStats.goals),
    conceeded: statOrDash(leagueStats.conceeded),
    averageRating: formatStatOrDash(teamStats?.avgRating),
    XG: statOrDash(leagueStats.XG),
    XGConceded: statOrDash(leagueStats.XGConceded),
    XGSwing:
      form?.XGChangeRecently != null
        ? fixedStatOrDash(form.XGChangeRecently)
        : STAT_FALLBACK,
    bigChances: statOrDash(teamStats?.bigChances),
    bigChancesMissed: statOrDash(teamStats?.bigChancesMissed),
    bigChancesConceded: statOrDash(teamStats?.bigChancesAgainst),
    goalConversionRate: ratioPercentOrDash(
      teamStats?.goalsScored,
      teamStats?.shots
    ),
    bigChanceConversionRate:
      teamStats?.bigChances > 0
        ? ratioPercentOrDash(
            teamStats.bigChances - teamStats.bigChancesMissed,
            teamStats.bigChances
          )
        : STAT_FALLBACK,
    shootingAccuracy: ratioPercentOrDash(
      teamStats?.shotsOnTarget,
      teamStats?.shots
    ),
    shotsOnTargetAgainst: ratioOrDash(
      teamStats?.shotsOnTargetAgainst,
      teamStats?.matches
    ),
    possession: statOrDash(leagueStats.possession),
    accuratePassesPercentage: fixedStatOrDash(teamStats?.accuratePassesPercentage),
    accuratePassesOpponentHalf: fixedStatOrDash(
      teamStats?.accurateOppositionHalfPassesPercentage
    ),
    accuratePassesDefensiveHalf: fixedStatOrDash(
      teamStats?.accurateOwnHalfPassesPercentage
    ),
    accurateCrosses: fixedStatOrDash(teamStats?.accurateCrossesPercentage),
    accurateCrossesAgainst: ratioPercentOrDash(
      teamStats?.crossesSuccessfulAgainst,
      teamStats?.crossesTotalAgainst
    ),
    longBallPercentage: ratioPercentOrDash(
      teamStats?.totalLongBalls,
      teamStats?.totalPasses
    ),
    accurateLongBallsPercentage: fixedStatOrDash(
      teamStats?.accurateLongBallsPercentage
    ),
    accurateLongBallsAgainstPercentage: ratioPercentOrDash(
      teamStats?.longBallsSuccessfulAgainst,
      teamStats?.longBallsTotalAgainst
    ),
    shots: statOrDash(leagueStats.shots),
    sot: statOrDash(leagueStats.sot),
    shotsInsideBox: statOrDash(shotsInsideBox),
    shotsFromOutsideTheBox: statOrDash(shotsOutsideBox),
    shotsFromInsideBoxPercentage: ratioPercentOrDash(
      shotsInsideBox,
      (shotsInsideBox ?? 0) + (shotsOutsideBox ?? 0),
      0
    ),
    shotsInsideBoxAgainst: statOrDash(shotsInsideBoxAgainst),
    shotsFromOutsideTheBoxAgainst: statOrDash(shotsOutsideBoxAgainst),
    shotsInsideBoxPercentAgainst: ratioPercentOrDash(
      shotsInsideBoxAgainst,
      (shotsInsideBoxAgainst ?? 0) + (shotsOutsideBoxAgainst ?? 0),
      0
    ),
    dangerousAttacks: statOrDash(leagueStats.dangerousAttacks),
    goalsFromInsideTheBox: statOrDash(teamStats?.goalsFromInsideTheBox),
    goalsFromOutsideTheBox: statOrDash(teamStats?.goalsFromOutsideTheBox),
    fastBreakShots: statOrDash(teamStats?.fastBreakShots),
    fastBreaksLeadingToShot: ratioPercentOrDash(
      teamStats?.fastBreakShots,
      teamStats?.fastBreaks
    ),
    dribbleAttempts: statOrDash(teamStats?.dribbleAttempts),
    successfulDribbles: statOrDash(teamStats?.successfulDribbles),
    duelsWonPercentage: fixedStatOrDash(teamStats?.duelsWonPercentage),
    aerialDuelsWonPercentage: fixedStatOrDash(teamStats?.aerialDuelsWonPercentage),
    ballRecovery: ratioOrDash(teamStats?.ballRecovery, teamStats?.matches),
    interceptions: ratioOrDash(teamStats?.interceptions, teamStats?.matches),
    cleansheetPercentage: ratioPercentOrDash(
      teamStats?.cleanSheets,
      teamStats?.matches
    ),
    tackles: ratioOrDash(teamStats?.tackles, teamStats?.matches),
    errorsLeadingToShotAgainst: statOrDash(teamStats?.errorsLeadingToShotAgainst),
    offsides: ratioOrDash(teamStats?.offsides, teamStats?.matches),
    ppg: statOrDash(leagueStats.ppg),
    formTrend: [
      formatStatOrDash(form?.avPoints10),
      formatStatOrDash(form?.avPoints6),
      formatStatOrDash(form?.avPoints5),
    ],
    goalDifference: statOrDash(leagueStats.goalDifference),
    goalDifferenceHomeOrAway: statOrDash(leagueStats.goalDifferenceHomeOrAway),
    CardsPerGame: ratioOrDash(teamStats?.yellowCards, teamStats?.matches),
    RedCardsPerGame: ratioOrDash(teamStats?.redCards, teamStats?.matches),
    FoulsPerGame: ratioOrDash(teamStats?.fouls, teamStats?.matches),
    PenaltiesConceded: statOrDash(teamStats?.penaltiesCommited),
    CornersAverage: statOrDash(leagueStats.corners),
    FreeKickGoals: statOrDash(teamStats?.freeKickGoals),
    BttsPercentage: statOrDash(form?.BttsPercentage),
    BttsPercentageHomeOrAway: statOrDash(form?.BttsPercentageHomeOrAway),
    ScoredBothHalvesPercentage: statOrDash(form?.ScoredBothHalvesPercentage),
  };
}

export function leaguePositionOrDash(position) {
  if (
    position === undefined ||
    position === null ||
    position === "undefined" ||
    position === 0
  ) {
    return STAT_FALLBACK;
  }
  return position;
}

export function resolveSofaScoreId(leagueID) {
  if (leagueID == null) return null;
  const found = sofaScoreIds.find((obj) => obj[leagueID] !== undefined);
  return found ? found[leagueID] : null;
}

export function resolveRoundId(sofaScoreId) {
  if (sofaScoreId == null) return null;
  for (const mapping of rounds) {
    if (Object.prototype.hasOwnProperty.call(mapping, sofaScoreId)) {
      return mapping[sofaScoreId];
    }
  }
  return null;
}

export function computePpdaPpaa(teamStats) {
  const opponentPasses = teamStats?.ownHalfPassesTotalAgainst ?? 0;
  const defensiveActions =
    (teamStats?.interceptions ?? 0) +
    (teamStats?.tackles ?? 0) +
    (teamStats?.blockedScoringAttempt ?? 0) +
    (teamStats?.clearances ?? 0);
  const oppositionHalfPasses = teamStats?.totalOppositionHalfPasses ?? 0;
  const attackingPlays =
    (teamStats?.shots ?? 0) +
    (teamStats?.totalCrosses ?? 0) +
    (teamStats?.dribbleAttempts ?? 0) +
    (teamStats?.bigChancesCreated ?? 0);

  return {
    PPDA: ratioOrDash(opponentPasses, defensiveActions),
    PPAA: ratioOrDash(oppositionHalfPasses, attackingPlays),
  };
}

export function buildBttsArrayFromResults(allTeamResults) {
  if (!Array.isArray(allTeamResults)) return [];
  return allTeamResults.map((result) => {
    const scored = Number(result?.scored ?? result?.goalsFor);
    const conceded = Number(result?.conceeded ?? result?.goalsAgainst);
    if (scored > 0 && conceded > 0) return "\u2714";
    return "\u2718";
  });
}

export function getTrueFormColor(ppgValue, minVal = -1.5, maxVal = 1.5) {
  const clampedValue = Math.max(minVal, Math.min(maxVal, ppgValue));
  const normalized = (clampedValue - minVal) / (maxVal - minVal);
  const hue = normalized * 120;
  return `hsl(${hue}, 70%, 25%)`;
}

export const COMPARISON_RULES = [
  { key: "goals", higherIsBetter: true },
  { key: "conceeded", higherIsBetter: false },
  { key: "goalDifference", higherIsBetter: true },
  { key: "goalDifferenceHomeOrAway", higherIsBetter: true },
  { key: "ppg", higherIsBetter: true },
  { key: "ppgLast5", higherIsBetter: true },
  { key: "ppgHomeOrAway", higherIsBetter: true },
  { key: "injuryImpact", higherIsBetter: false },
  { key: "formTrend", higherIsBetter: true },
  { key: "winPercentage", higherIsBetter: true },
  { key: "lossPercentage", higherIsBetter: false },
  { key: "drawPercentage", higherIsBetter: false },
  { key: "cleansheetPercentage", higherIsBetter: true },
  { key: "averageRating", higherIsBetter: true },
  { key: "XGSwing", higherIsBetter: true },
  { key: "leaguePosition", higherIsBetter: false },
  { key: "rawPosition", higherIsBetter: false },
  { key: "homeOrAwayLeaguePosition", higherIsBetter: false },
  { key: "XG", higherIsBetter: true },
  { key: "XGConceded", higherIsBetter: false },
  { key: "bigChances", higherIsBetter: true },
  { key: "bigChancesMissed", higherIsBetter: false },
  { key: "bigChancesConceded", higherIsBetter: false },
  { key: "shots", higherIsBetter: true },
  { key: "sot", higherIsBetter: true },
  { key: "shotsInsideBox", higherIsBetter: true },
  { key: "shotsFromOutsideTheBox", higherIsBetter: true },
  { key: "shotsFromInsideBoxPercentage", higherIsBetter: true },
  { key: "shotsInsideBoxAgainst", higherIsBetter: false },
  { key: "shotsFromOutsideTheBoxAgainst", higherIsBetter: false },
  { key: "shotsInsideBoxPercentAgainst", higherIsBetter: false },
  { key: "shotsOnTargetAgainst", higherIsBetter: false },
  { key: "shootingAccuracy", higherIsBetter: true },
  { key: "goalConversionRate", higherIsBetter: true },
  { key: "bigChanceConversionRate", higherIsBetter: true },
  { key: "goalsFromInsideTheBox", higherIsBetter: true },
  { key: "goalsFromOutsideTheBox", higherIsBetter: true },
  { key: "fastBreakShots", higherIsBetter: true },
  { key: "fastBreaksLeadingToShot", higherIsBetter: true },
  { key: "FreeKickGoals", higherIsBetter: true },
  { key: "dangerousAttacks", higherIsBetter: true },
  { key: "possession", higherIsBetter: true },
  { key: "accuratePassesPercentage", higherIsBetter: true },
  { key: "accuratePassesOpponentHalf", higherIsBetter: true },
  { key: "accuratePassesDefensiveHalf", higherIsBetter: true },
  { key: "accurateCrosses", higherIsBetter: true },
  { key: "accurateCrossesAgainst", higherIsBetter: false },
  { key: "longBallPercentage", higherIsBetter: false },
  { key: "accurateLongBallsPercentage", higherIsBetter: true },
  { key: "accurateLongBallsAgainstPercentage", higherIsBetter: false },
  { key: "CornersAverage", higherIsBetter: true },
  { key: "offsides", higherIsBetter: false },
  { key: "dribbleAttempts", higherIsBetter: true },
  { key: "successfulDribbles", higherIsBetter: true },
  { key: "PPDA", higherIsBetter: false },
  { key: "PPAA", higherIsBetter: false },
  { key: "duelsWonPercentage", higherIsBetter: true },
  { key: "aerialDuelsWonPercentage", higherIsBetter: true },
  { key: "ballRecovery", higherIsBetter: true },
  { key: "interceptions", higherIsBetter: true },
  { key: "tackles", higherIsBetter: true },
  { key: "errorsLeadingToShotAgainst", higherIsBetter: false },
  { key: "FoulsPerGame", higherIsBetter: false },
  { key: "CardsPerGame", higherIsBetter: false },
  { key: "RedCardsPerGame", higherIsBetter: false },
  { key: "PenaltiesConceded", higherIsBetter: false },
  { key: "BttsPercentage", higherIsBetter: true },
  { key: "BttsPercentageHomeOrAway", higherIsBetter: true },
];

function compareStat(homeValue, awayValue, higherIsBetter) {
  const home = parseFloat(homeValue);
  const away = parseFloat(awayValue);

  if (Number.isNaN(home) && Number.isNaN(away)) return "equal";
  if (Number.isNaN(home)) return higherIsBetter ? "worse" : "better";
  if (Number.isNaN(away)) return higherIsBetter ? "better" : "worse";

  if (home === away) return "equal";

  if (higherIsBetter) {
    return home > away ? "better" : "worse";
  }
  return home < away ? "better" : "worse";
}

export function calculateComparisonStatusMap(homeStats, awayStats) {
  const comparisonMap = {};

  COMPARISON_RULES.forEach(({ key, higherIsBetter }) => {
    const homeValue = homeStats[key];
    const awayValue = awayStats[key];

    if (
      typeof homeValue !== "object" ||
      homeValue === null ||
      !Array.isArray(homeValue)
    ) {
      if (homeValue !== undefined && awayValue !== undefined) {
        comparisonMap[key] = compareStat(homeValue, awayValue, higherIsBetter);
      }
    } else if (Array.isArray(homeValue) && Array.isArray(awayValue)) {
      const minLength = Math.min(homeValue.length, awayValue.length);
      for (let i = 0; i < minLength; i++) {
        const arrayKey = `${key}[${i}]`;
        if (homeValue[i] !== undefined && awayValue[i] !== undefined) {
          comparisonMap[arrayKey] = compareStat(
            homeValue[i],
            awayValue[i],
            higherIsBetter
          );
        }
      }
    }
  });

  return comparisonMap;
}

export function getInvertedComparisonMap(originalMap) {
  const invertedMap = {};
  for (const key in originalMap) {
    if (Object.prototype.hasOwnProperty.call(originalMap, key)) {
      const status = originalMap[key];
      if (status === "better") invertedMap[key] = "worse";
      else if (status === "worse") invertedMap[key] = "better";
      else invertedMap[key] = status;
    }
  }
  return invertedMap;
}

/**
 * Build full Stats props for one team (games === "all").
 */
export function buildAllStatsProps({
  match,
  form,
  teamStats,
  side,
  getCollapsableProps,
  style = {},
  formTextString,
  bttsArray,
  injuryImpact,
  divider = 10,
}) {
  const isHome = side === "home";
  const homeOrAway = isHome ? "Home" : "Away";
  const leagueStats = getOverallLeagueStats(form);
  const last5LeagueStats = getLast5LeagueStats(form);
  const { PPDA, PPAA } = computePpdaPpaa(teamStats);
  const isWorldCupCompetition = API_FORM_ONLY_LEAGUE_IDS.includes(match.leagueID);

  const leaguePosition = isHome
    ? form?.LeaguePosition
    : form?.LeaguePosition;
  const rawPosition = isHome ? match.homeRawPosition : match.awayRawPosition;
  const venueLeaguePosition = isHome
    ? form?.homePositionHomeOnly
    : form?.awayPositionAwayOnly;
  const winPercentage = isHome ? form?.homePPGAv : form?.awayPPGAv;
  const lossPercentage = isHome
    ? match.homeTeamLossPercentage
    : match.awayTeamLossPercentage;
  const drawPercentage = isHome
    ? match.homeTeamDrawPercentage
    : match.awayTeamDrawPercentage;
  const resultsHorA = isHome ? form?.resultsHome : form?.resultsAway;

  return {
    getCollapsableProps,
    games: "all",
    isWorldCupCompetition,
    style,
    homeOrAway,
    badge: isHome ? match.homeBadge : match.awayBadge,
    gameCount: divider,
    className: isHome ? "KeyStatsHome" : "KeyStatsAway",
    classNameTwo: isHome ? undefined : "FormStatsAway",
    name: isHome ? match.homeTeam : match.awayTeam,
    value: form?.trueForm,
    color: getTrueFormColor(form?.trueForm ?? 0),
    ...buildTeamAllStatsFields(teamStats, leagueStats, form),
    PPDA,
    PPAA,
    leaguePosition: leaguePositionOrDash(
      leaguePosition !== undefined && leaguePosition !== "undefined"
        ? leaguePosition
        : undefined
    ),
    rawPosition: leaguePositionOrDash(
      rawPosition !== undefined && rawPosition !== "undefined"
        ? rawPosition
        : undefined
    ),
    homeOrAwayLeaguePosition: leaguePositionOrDash(
      venueLeaguePosition !== undefined &&
        venueLeaguePosition !== "undefined" &&
        venueLeaguePosition !== "undefinedundefined"
        ? venueLeaguePosition
        : undefined
    ),
    winPercentage: statOrDash(winPercentage),
    lossPercentage: statOrDash(lossPercentage),
    drawPercentage: statOrDash(drawPercentage),
    formRun: form?.resultsAll,
    BTTSArray: bttsArray ?? buildBttsArrayFromResults(form?.allTeamResults),
    Results: form?.resultsAll,
    ResultsHorA: resultsHorA,
    FormTextString: formTextString,
    StyleOfPlay: statOrDash(form?.styleOfPlayOverall),
    StyleOfPlayHomeOrAway: statOrDash(
      isHome ? form?.styleOfPlayHome : form?.styleOfPlayAway
    ),
    ppgLast5: statOrDash(last5LeagueStats.ppg),
    ppgHomeOrAway: statOrDash(winPercentage),
    injuryImpact,
  };
}
