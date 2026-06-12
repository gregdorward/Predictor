import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  lazy,
  Suspense
} from "react";
import { Button } from "./Button";
import { memo } from "react";
import SofaLineupsWidget from "./SofaScore";
import Div from "./Div";
import {
  Chart,
  MultilineChart,
  RadarChart,
  BarChart,
  DoughnutChart,
  BTTSPieChart,
  VotePieChart
} from "./Chart";
import MultiTypeChart from "./MultitypeChart"; // Adjust the path if necessary
import FixtureComparisonShare from "./FixtureComparisonShare";
import { Slider } from "../components/CarouselXGChart";
import Collapsable from "../components/CollapsableElement";
import Stats from "../components/createStatsDiv";
import TeamRankingsFlexView from "./TeamRankingsFlexView";
import {
  allLeagueResultsArrayOfObjects,
  basicTableArray,
} from "../logic/getFixtures";
import { userDetail } from "../logic/authProvider";
import { clicked, getPointsFromLastX } from "../logic/getScorePredictions";
import { arrayOfGames } from "../logic/getFixtures";
import GenerateFormSummary from "../logic/compareFormTrend";
import { checkUserPaidStatus } from "../logic/hasUserPaid";
import { getPointAverage } from "../logic/getStats";
import {
  allForm,
  API_FORM_ONLY_LEAGUE_IDS,
  shouldUseApiFormOnly,
} from "../logic/getFixtures";
import {
  fixedStatOrDash,
  formatProbabilityPercent,
  formatStatDisplay,
  formatStatOrDash,
  ratioOrDash,
  ratioPercentOrDash,
  statOrDash,
  STAT_FALLBACK,
} from "../utils/formatStat";
import { expandRadarStrengthSeries } from "../utils/radarDisplay";
import MissingPlayersList from "../components/MissingPlayersList";
import PlayerStatsList from "../components/PlayerStatsList";
import { ManagerComparison } from "../components/ManagerCard";
import { StreakStats } from "../components/StreakStats";
import {
  calculateAttackingStrength,
  calculateDefensiveStrength,
  calculateMetricStrength,
} from "../logic/getStats";
import { rounds } from "./TeamOfTheSeason";
import { applyNationalTeamAlias } from "../utils/nationalTeamAliases";
import { findSofaScoreGameByTeams } from "../utils/sofaScoreMatch";
import { getLeagueFixturesByLeagueId } from "../utils/leagueResultsAccess";
import {
  mapFutureFixtureEvents,
  selectUpcomingFixtures,
} from "../utils/futureFixturesDisplay";
import StarRating from "../components/StarRating";
import { handleCheckout, stripePromise } from "../App"
import PlayerStatsTable from "./PlayerStatsTable";
import { AuthProvider, useAuth } from "../logic/authProvider";
import BetSlipFooter from "../components/Betslip";
import { TeamImpactSummary } from "./MissingPlayersList";
import { predictedScoresData } from "../logic/getScorePredictions";
import { MatchTacticalComparison } from "../components/TacticalApproach";
// import FutureFixturesSideBySide from "./FutureFixturesSideBySide";
// export let userTips;

// console.log(userTips);
let setUserTips;
const MemoizedSofaLineupsWidget = memo(SofaLineupsWidget);
const LazyFutureFixturesSideBySide = lazy(() => import('./FutureFixturesSideBySide'));

// let id, team1, team2, timestamp, homeGoals, awayGoals;

function getOverUnderProbability(scoreMatrix = [], line = 2.5) {
  let over = 0;
  let under = 0;

  for (const { home, away, probability } of scoreMatrix || []) {
    if (home + away > line) over += probability;
    else under += probability;
  }
  over = over * 100
  under = under * 100

  return { over, under };
}

function getBTTSProbability(scoreMatrix = []) {
  let yes = 0;
  let no = 0;

  for (const { home, away, probability } of scoreMatrix || []) {
    if (home > 0 && away > 0) yes += probability;
    else no += probability;
  }
  yes = yes * 100
  no = no * 100

  return { yes, no };
}

function formatLeagueStat(value) {
  return formatStatDisplay(value);
}

function getTeamInjuryImpactLoss(impacts, gameId, side) {
  let atk = Number(impacts?.atk) || 0;
  let def = Number(impacts?.def) || 0;

  if (atk === 0 && def === 0) {
    const existing = predictedScoresData?.find((entry) => entry.gameId === gameId);
    const stored = existing?.impacts?.[side];
    atk = Number(stored?.atk) || 0;
    def = Number(stored?.def) || 0;
  }

  if (atk === 0 && def === 0) {
    return undefined;
  }

  return Math.max(atk, def);
}

// Shared stat fields for homeAllStatsProps / awayAllStatsProps with "-" fallbacks.
function buildTeamAllStatsFields(teamStats, leagueStats, form) {
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

function leaguePositionOrDash(position) {
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

function getOverallLeagueStatNumbers(form) {
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

function getOverallLeagueStats(form) {
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

function getLast5LeagueStats(form) {
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

function homeAwayDangerousAttacksValue(form, isHome) {
  const venueDa = isHome
    ? form.avgDangerousAttacksHome
    : form.avgDangerousAttacksAway;
  if (venueDa !== 0 && venueDa !== undefined) return venueDa;
  return form.AverageDangerousAttacks ?? 0;
}

function getHomeAwayLeagueStatNumbers(form, venue) {
  if (!form) return {};
  const isHome = venue === "home";
  return {
    goals: leagueStatNumber(isHome ? form.avgScoredHome : form.avgScoredAway),
    conceeded: leagueStatNumber(
      isHome ? form.teamConceededAvgHomeOnly : form.teamConceededAvgAwayOnly
    ),
    XG: leagueStatNumber(isHome ? form.avgXGScoredHome : form.avgXGScoredAway),
    XGConceded: leagueStatNumber(
      isHome ? form.avgXGConceededHome : form.avgXGConceededAway
    ),
    possession: leagueStatNumber(
      isHome ? form.avgPossessionHome : form.avgPossessionAway
    ),
    shots: leagueStatNumber(isHome ? form.avgShotsHome : form.avgShotsAway),
    sot: leagueStatNumber(
      isHome ? form.avgShotsOnTargetHome : form.avgShotsOnTargetAway
    ),
    dangerousAttacks: leagueStatNumber(
      homeAwayDangerousAttacksValue(form, isHome)
    ),
    ppg: leagueStatNumber(isHome ? form.homePPGAv : form.awayPPGAv),
    goalDifference: leagueStatNumber(form.goalDifferenceHomeOrAway),
    corners: leagueStatNumber(isHome ? form.cornersAvHome : form.cornersAvAway),
  };
}

function getHomeAwayLeagueStats(form, venue) {
  const stats = getHomeAwayLeagueStatNumbers(form, venue);
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

function buildComparisonBarChartData(homeStats, awayStats, options = {}) {
  const goalDiffDivisor = options.goalDiffDivisor ?? 10;
  const rows = [
    { home: homeStats.goals, away: awayStats.goals, scale: 2 },
    { home: awayStats.conceeded, away: homeStats.conceeded, scale: 2 },
    { home: homeStats.ppg, away: awayStats.ppg, scale: 3 },
    { home: homeStats.XG, away: awayStats.XG, scale: 2 },
    { home: awayStats.XGConceded, away: homeStats.XGConceded, scale: 2 },
    { home: homeStats.sot, away: awayStats.sot, scale: 1 },
    {
      home: homeStats.dangerousAttacks,
      away: awayStats.dangerousAttacks,
      scale: 1 / 7.5,
    },
    {
      home: homeStats.possession,
      away: awayStats.possession,
      scale: 1 / 7.5,
    },
    {
      home: homeStats.goalDifference,
      away: awayStats.goalDifference,
      scale: 1 / goalDiffDivisor,
    },
    { home: homeStats.corners, away: awayStats.corners, scale: 1 },
  ];

  return {
    data1: rows.map((row) => row.home * row.scale),
    data2: rows.map((row) => row.away * row.scale),
    displayDeltas: rows.map((row) => row.away - row.home),
  };
}

function getMatchOddsProbabilities(scoreMatrix = []) {
  let homeWin = 0;
  let draw = 0;
  let awayWin = 0;

  for (const { home, away, probability } of scoreMatrix || []) {
    if (home > away) homeWin += probability;
    else if (home === away) draw += probability;
    else awayWin += probability;
  }

  homeWin = homeWin * 100
  draw = draw * 100
  awayWin = awayWin * 100

  return { homeWin, draw, awayWin };
}



function GameStats({ game, displayBool, stats, handleToggleTip, userTips }) {
  console.log(game);

  // const { user } = useAuth();

  const [openSections, setOpenSections] = useState({});

  const handleToggle = (sectionName) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };

  const getCollapsableProps = (sectionName) => ({
    isOpen: !!openSections[sectionName],
    onTriggerToggle: () => handleToggle(sectionName),
  });

  function styling(testBool) {
    let bool = testBool;
    if (bool === true && clicked === true) {
      // set stats element to display flex
      return { display: "block" };
    } else {
      // set stats element to display none
      return { display: "none" };
    }
  }
  let style = styling(displayBool);


  const [homeMissingPlayersList, setHomeMissingPlayersList] = useState([]);
  const [awayMissingPlayersList, setAwayMissingPlayersList] = useState([]);
  const [homeMissingPlayersImpact, setHomeMissingPlayersImpact] = useState([]);
  const [awayMissingPlayersImpact, setAwayMissingPlayersImpact] = useState([]);
  const [homeLineupList, setHomeLineupList] = useState([]);
  const [awayLineupList, setAwayLineupList] = useState([]);
  const [voteData, setVoteData] = useState([]);
  const [loadingVoteData, setLoadingVoteData] = useState(true);
  const [loading, setLoading] = useState(null);
  const [streakData, setStreakData] = useState([]);
  const [homeTeamStats, setHomeTeamStats] = useState(null);
  const [awayTeamStats, setAwayTeamStats] = useState(null);
  const [homeTeamPlayerStats, setHomeTeamPlayerStats] = useState(null);
  const [awayTeamPlayerStats, setAwayTeamPlayerStats] = useState(null);
  const [futureFixturesHome, setFutureFixturesHome] = useState([]);
  const [futureFixturesAway, setFutureFixturesAway] = useState([]);
  const [loadingTeamStats, setLoadingTeamStats] = useState(true);
  const [loadingKeyPlayers, setLoadingKeyPlayers] = useState(true);
  const [loadingPlayerStats, setLoadingPlayerStats] = useState(true);
  const [loadingKeyPlayerComparison, setLoadingKeyPlayerComparison] = useState(true);
  const [loadingStreaks, setLoadingStreaks] = useState(true);
  const [homeManager, setHomeManager] = useState(null);
  const [awayManager, setAwayManager] = useState(null);
  const [loadingManagers, setLoadingManagers] = useState(true);
  const [loadingFutureFixtures, setLoadingFutureFixtures] = useState(true);
  const [oddsData, setOddsData] = useState(null); // State to hold your odds object
  const [loadingOdds, setLoadingOdds] = useState(false);
  const [homePlayerData, setHomePlayerData] = useState([]);
  const [awayPlayerData, setAwayPlayerData] = useState([]);
  const [homePlayerAtttributes, setHomePlayerAttributes] = useState([]);
  const [awayPlayerAtttributes, setAwayPlayerAttributes] = useState([]);
  const [homePlayerAtttributesComparison, setHomePlayerAttributesComparison] = useState([]);
  const [awayPlayerAtttributesComparison, setAwayPlayerAttributesComparison] = useState([]);
  const [homePlayerImage, setHomePlayerImage] = useState(null); // State to hold your odds object
  const [awayPlayerImage, setAwayPlayerImage] = useState(null); // State to hold your odds object
  const [loadingPlayerData, setLoadingPlayerData] = useState(true);
  const [homePlayerDataWithImages, setHomePlayerDataWithImages] = useState([]);
  const [awayPlayerDataWithImages, setAwayPlayerDataWithImages] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [aiMatchPreview, setAiMatchPreview] = useState(null);
  const { user, isPaidUser } = useAuth()

  // const paid = true;
  const [hasCompleteData, setHasCompleteData] = useState(false);


  let gameStats = allForm.find((match) => match.id === game.id);
  const homeForm = gameStats?.home[2];
  const awayForm = gameStats?.away[2];

  const [matchingGame, setMatchingGame] = useState(null); // State for the game
  const [formSummaries, setFormSummary] = useState([]);
  const [id, setId] = useState("0");
  const [team1, setTeam1] = useState("N/A");
  const [team2, setTeam2] = useState("N/A");
  const [timestamp, setTimestamp] = useState(1);
  const [homeGoals, setHomeGoals] = useState("-");
  const [awayGoals, setAwayGoals] = useState("-");
  const [homeXGRating, setHomeXGRating] = useState(0);
  const [awayXGRating, setAwayXGRating] = useState(0);
  const [homeAttackStrength, setHomeAttackStrength] = useState(0);
  const [homeDefenceStrength, setHomeDefenceStrength] = useState(0);
  const [homePossessionStrength, setHomePossessionStrength] = useState(0);
  const [homeXGForStrength, setHomeXGForStrength] = useState(0);
  const [homeXGAgainstStrength, setHomeXGAgainstStrength] = useState(0);
  const [homeDirectnessStrength, setHomeDirectnessStrength] = useState(0);
  const [homeAccuracyOverallStrength, setHomeAccuracyOverallStrength] =
    useState(0);
  const [awayAttackStrength, setAwayAttackStrength] = useState(0);
  const [awayDefenceStrength, setAwayDefenceStrength] = useState(0);
  const [awayPossessionStrength, setAwayPossessionStrength] = useState(0);
  const [awayXGForStrength, setAwayXGForStrength] = useState(0);
  const [awayXGAgainstStrength, setAwayXGAgainstStrength] = useState(0);
  const [awayDirectnessStrength, setAwayDirectnessStrength] = useState(0);
  const [awayAccuracyOverallStrength, setAwayAccuracyOverallStrength] =
    useState(0);
  const [rollingSOTDiffTotalHome, setRollingSOTDiffTotalHome] = useState([]);
  const [similarGamesHome, setSimilarGamesHome] = useState([]);
  const [similarGamesAway, setSimilarGamesAway] = useState([]);

  const [homeFiveGameAverage, setHomeFiveGameAverage] = useState(0);
  const [homeSixGameAverage, setHomeSixGameAverage] = useState(0);
  const [homeTenGameAverage, setHomeTenGameAverage] = useState(0);
  const [awayFiveGameAverage, setAwayFiveGameAverage] = useState(0);
  const [awaySixGameAverage, setAwaySixGameAverage] = useState(0);
  const [awayTenGameAverage, setAwayTenGameAverage] = useState(0);
  const [homeAttackStrengthLast5, setHomeAttackStrengthLast5] = useState(
    homeForm?.attackingStrengthLast5 || null
  );
  const [homeOnlyAttackStrength, setHomeOnlyAttackStrength] = useState(
    homeForm?.attackingStrengthHomeOnly || null
  );
  const [homeDefenceStrengthLast5, setHomeDefenceStrengthLast5] = useState(
    homeForm?.defensiveStrengthLast5 || null
  );
  const [homeOnlyDefenceStrength, setHomeOnlyDefenceStrength] = useState(
    homeForm?.defensiveStrengthHomeOnly || null
  );
  const [homePossessionStrengthLast5, setHomePossessionStrengthLast5] =
    useState(homeForm?.possessionStrengthLast5 || null);
  const [homeOnlyPossessionStrength, setHomeOnlyPossessionStrength] = useState(
    homeForm?.possessionStrengthHomeOnly || null
  );
  const [homeXGForStrengthLast5, setHomeXGForStrengthLast5] = useState(
    homeForm?.xgForStrengthLast5 || null
  );
  const [homeOnlyXGForStrength, setHomeOnlyXGForStrength] = useState(
    homeForm?.xgForStrengthHomeOnly || null
  );
  const [homeXGAgainstStrengthLast5, setHomeXGAgainstStrengthLast5] = useState(
    homeForm?.xgAgainstStrengthLast5 || null
  );
  const [homeOnlyXGAgainstStrength, setHomeOnlyXGAgainstStrength] = useState(
    homeForm?.xgAgainstStrengthHomeOnly || null
  );
  const [homeDirectnessStrengthLast5, setHomeDirectnessStrengthLast5] =
    useState(homeForm?.directnessOverallStrengthLast5 || null);
  const [homeOnlyDirectnessStrength, setHomeOnlyDirectnessStrength] = useState(
    homeForm?.directnessHomeStrength || null
  );
  const [
    homeAccuracyOverallStrengthLast5,
    setHomeAccuracyOverallStrengthLast5,
  ] = useState(homeForm?.accuracyOverallStrengthLast5 || null);
  const [homeOnlyAccuracyOverallStrength, setHomeOnlyAccuracyOverallStrength] =
    useState(homeForm?.accuracyHomeStrength || null);
  const [awayAttackStrengthLast5, setAwayAttackStrengthLast5] = useState(
    awayForm?.attackingStrengthLast5 || null
  );
  const [awayOnlyAttackStrength, setAwayOnlyAttackStrength] = useState(
    awayForm?.attackingStrengthAwayOnly || null
  );
  const [awayDefenceStrengthLast5, setAwayDefenceStrengthLast5] = useState(
    awayForm?.defensiveStrengthLast5 || null
  );
  const [awayOnlyDefenceStrength, setAwayOnlyDefenceStrength] = useState(
    awayForm?.defensiveStrengthAwayOnly || null
  );
  const [awayPossessionStrengthLast5, setAwayPossessionStrengthLast5] =
    useState(awayForm?.possessionStrengthLast5 || null);
  const [awayOnlyPossessionStrength, setAwayOnlyPossessionStrength] = useState(
    awayForm?.possessionStrengthAwayOnly || null
  );
  const [awayXGForStrengthLast5, setAwayXGForStrengthLast5] = useState(
    awayForm?.xgForStrengthLast5 || null
  );
  const [awayOnlyXGForStrength, setAwayOnlyXGForStrength] = useState(
    awayForm?.xgForStrengthAwayOnly || null
  );
  const [awayXGAgainstStrengthLast5, setAwayXGAgainstStrengthLast5] = useState(
    awayForm?.xgAgainstStrengthLast5 || null
  );
  const [awayOnlyXGAgainstStrength, setAwayOnlyXGAgainstStrength] = useState(
    awayForm?.xgAgainstStrengthAwayOnly || null
  );
  const [awayDirectnessStrengthLast5, setAwayDirectnessStrengthLast5] =
    useState(awayForm?.directnessOverallStrengthLast5 || null);
  const [awayOnlyDirectnessStrength, setAwayOnlyDirectnessStrength] = useState(
    awayForm?.directnessAwayStrength || null
  );
  const [
    awayAccuracyOverallStrengthLast5,
    setAwayAccuracyOverallStrengthLast5,
  ] = useState(awayForm?.accuracyOverallStrengthLast5 || null);
  const [awayOnlyAccuracyOverallStrength, setAwayOnlyAccuracyOverallStrength] =
    useState(awayForm?.accuracyAwayStrength || null);

  const [gameArrayHomeTeamHomeGames, setGameArrayHomeTeamHomeGames] = useState(
    []
  );
  const [gameArrayAwayTeamAwayGames, setGameArrayAwayTeamAwayGames] = useState(
    []
  );

  const [ranksHome, setRanksHome] = useState([]);
  const [ranksAway, setRanksAway] = useState([]);

  // At the top of your component
  const [homeImpacts, setHomeImpacts] = useState({ atk: 0, def: 0 });
  const [awayImpacts, setAwayImpacts] = useState({ atk: 0, def: 0 });
  const [newManagerHome, setNewManagerHome] = useState(false);
  const [newManagerAway, setNewManagerAway] = useState(false);

  // Inside GameStats.js
  const handleHomeCalculate = useCallback((vals) => {
    setHomeImpacts(prev => {
      // Only update if the values are actually different
      if (prev.atk === vals.atk && prev.def === vals.def) return prev;
      return vals;
    });
  }, []); // Empty array means this function never changes

  const handleAwayCalculate = useCallback((vals) => {
    setAwayImpacts(prev => {
      if (prev.atk === vals.atk && prev.def === vals.def) return prev;
      return vals;
    });
  }, []);


  // The sync logic
  useEffect(() => {
    const syncImpacts = async () => {
      const existing = predictedScoresData.find(p => p.gameId === game.id);

      // 1. Check if impacts changed
      const impactsChanged = !existing ||
        existing.impacts?.home?.atk !== homeImpacts.atk ||
        existing.impacts?.away?.atk !== awayImpacts.atk;

      // 2. Check if manager flags changed 
      // (Comparing true/false against undefined/true/false)
      const managersChanged = !existing ||
        Boolean(existing.homeNewManager) !== newManagerHome ||
        Boolean(existing.awayNewManager) !== newManagerAway;

      const hasChanged = impactsChanged || managersChanged;

      // 3. The "Gate": Only POST if we have something meaningful to save
      // We allow the POST if there are impacts OR if there's a new manager
      const leadsToSave = homeImpacts.atk > 0 ||
        awayImpacts.atk > 0 ||
        newManagerHome ||
        newManagerAway;

      if (hasChanged && leadsToSave) {
        console.log("🚀 Condition met! Sending POST...");

        await fetch(`${process.env.REACT_APP_EXPRESS_SERVER}predictedScores2`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            gameId: game.id,
            ...(homeImpacts.atk > 0 && { homeAtkLoss: homeImpacts.atk }),
            ...(homeImpacts.def > 0 && { homeDefLoss: homeImpacts.def }),
            ...(awayImpacts.atk > 0 && { awayAtkLoss: awayImpacts.atk }),
            ...(awayImpacts.def > 0 && { awayDefLoss: awayImpacts.def }),
            homeNewManager: newManagerHome, // Sends true/false
            awayNewManager: newManagerAway  // Sends true/false
          })
        });

        // IMPORTANT: You should trigger a refresh of predictedScoresData here 
        // so 'existing' becomes current and prevents a loop.
      }
    };

    syncImpacts();
  }, [homeImpacts, awayImpacts, game.id, predictedScoresData, newManagerHome, newManagerAway]);

  const allResultsHome = useMemo(() => {
    const results = homeForm?.allTeamResults ?? [];
    return [...results].sort((b, a) => b.dateRaw - a.dateRaw);
  }, [homeForm?.allTeamResults]);

  const homeResults = useMemo(() => {
    const results = homeForm?.homeResults ?? [];
    return [...results].sort((b, a) => b.dateRaw - a.dateRaw);
  }, [homeForm?.homeResults]);

  const allResultsAway = useMemo(() => {
    const results = awayForm?.allTeamResults ?? [];
    return [...results].sort((b, a) => b.dateRaw - a.dateRaw);
  }, [awayForm?.allTeamResults]);

  const awayResults = useMemo(() => {
    const results = awayForm?.awayResults ?? [];
    return [...results].sort((b, a) => b.dateRaw - a.dateRaw);
  }, [awayForm?.awayResults]);

  // Memoize the derived arrays
  const goalDiffArrayHome = useMemo(() => {
    return allResultsHome.map((a) => a.scored - a.conceeded);
  }, [allResultsHome]);

  const xgDiffArrayHome = allResultsHome.map((a) => a.XG - a.XGAgainst);
  const xgDiffArrayAway = allResultsAway.map((a) => a.XG - a.XGAgainst);

  const rollingGoalDiffTotalHome = useMemo(() => {
    return goalDiffArrayHome.map(
      (
        (sum) => (value) =>
          (sum += value)
      )(0)
    );
  }, [goalDiffArrayHome]);

  const rollingXGDiffTotalHome = xgDiffArrayHome.map(
    (
      (sum) => (value) =>
        (sum += value)
    )(0)
  );

  const goalDiffArrayHomeOnly = useMemo(() => {
    return homeResults.map((a) => a.scored - a.conceeded);
  }, [homeResults]);

  const goalDiffArrayAwayOnly = useMemo(() => {
    return awayResults.map((a) => a.scored - a.conceeded);
  }, [awayResults]);

  const xgDiffArrayHomeOnly = useMemo(() => {
    return homeResults.map((a) => a.XG - a.XGAgainst);
  }, [homeResults]);

  const xgDiffArrayAwayOnly = useMemo(() => {
    return awayResults.map((a) => a.XG - a.XGAgainst);
  }, [awayResults]);

  const rollingGoalDiffTotalHomeOnly = useMemo(() => {
    return goalDiffArrayHomeOnly.map(
      (
        (sum) => (value) =>
          (sum += value)
      )(0)
    );
  }, [goalDiffArrayHomeOnly]);

  const rollingXGDiffTotalHomeOnly = useMemo(() => {
    return xgDiffArrayHomeOnly.map(
      (
        (sum) => (value) =>
          (sum += value)
      )(0)
    );
  }, [xgDiffArrayHomeOnly]);

  const goalDiffArrayAway = useMemo(() => {
    return allResultsAway.map((a) => a.scored - a.conceeded);
  }, [allResultsAway]);

  const rollingGoalDiffTotalAway = goalDiffArrayAway.map(
    (
      (sum) => (value) =>
        (sum += value)
    )(0)
  );

  const rollingXGDiffTotalAway = xgDiffArrayAway.map(
    (
      (sum) => (value) =>
        (sum += value)
    )(0)
  );

  const rollingGoalDiffTotalAwayOnly = useMemo(() => {
    return goalDiffArrayAwayOnly.map(
      (
        (sum) => (value) =>
          (sum += value)
      )(0)
    );
  }, [goalDiffArrayAwayOnly]);

  const rollingXGDiffTotalAwayOnly = useMemo(() => {
    return xgDiffArrayAwayOnly.map(
      (
        (sum) => (value) =>
          (sum += value)
      )(0)
    );
  }, [xgDiffArrayAwayOnly]);

  //It is unlikely that slice will be an array without useMemo, so you need to ensure it works for all relevant ones.
  const rollingGoalDiffTotalHomeLast5 = useMemo(() => {
    return goalDiffArrayHome
      .slice(Math.max(goalDiffArrayHome.length - 5, 0))
      .map(
        (
          (sum) => (value) =>
            (sum += value)
        )(0)
      );
  }, [goalDiffArrayHome]);

  const rollingXGDiffTotalHomeLast5 = useMemo(() => {
    return xgDiffArrayHome.slice(Math.max(xgDiffArrayHome.length - 5, 0)).map(
      (
        (sum) => (value) =>
          (sum += value)
      )(0)
    );
  }, [xgDiffArrayHome]);

  const rollingGoalDiffTotalAwayLast5 = useMemo(() => {
    return goalDiffArrayAway
      .slice(Math.max(goalDiffArrayAway.length - 5, 0))
      .map(
        (
          (sum) => (value) =>
            (sum += value)
        )(0)
      );
  }, [goalDiffArrayAway]);

  const rollingXGDiffTotalAwayLast5 = useMemo(() => {
    return xgDiffArrayAway.slice(Math.max(xgDiffArrayAway.length - 5, 0)).map(
      (
        (sum) => (value) =>
          (sum += value)
      )(0)
    );
  }, [xgDiffArrayAway]);

  const scoreMatrix = game.scoreMatrix ?? [];
  const hasScoreMatrix = scoreMatrix.length > 0;
  const { homeWin, draw, awayWin } = hasScoreMatrix
    ? getMatchOddsProbabilities(scoreMatrix)
    : {
        homeWin: game.homeWinProbability,
        draw: game.drawProbability,
        awayWin: game.awayWinProbability,
      };
  const { yes, no } = hasScoreMatrix
    ? getBTTSProbability(scoreMatrix)
    : {
        yes: game.bttsYesProbability,
        no: game.bttsNoProbability,
      };
  const { over, under } = hasScoreMatrix
    ? getOverUnderProbability(scoreMatrix, 2.5)
    : {
        over: game.over25Probability,
        under: game.under25Probability,
      };




  const [firstRenderDone, setFirstRenderDone] = useState(false);
  const [divider, setDivider] = useState(0);
  const gameArrayHome = [];
  const gameArrayAway = [];

  function formatValue(val) {
    return typeof val === "number" && val % 1 !== 0
      ? parseFloat(val.toFixed(2))
      : val;
  }

  const normalize = (str) =>
    str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "")
      .replace(/[^a-z]/g, "");

  const removeCommonSuffixes = (str) =>
    str.replace(
      /\b(fc|bk|sc|afc|cf|ac|cd|sv|ss|united|city|sporting|club|team|U 20| U 19)\b/g,
      ""
    );

  const cleanTeamName = (str) => removeCommonSuffixes(normalize(str));

  // Centralized alias map
  const teamNameAliases = {
    "psg": "Paris saint-germain",
    "FK Bodo - Glimt": "Bodø/Glimt",
    "inter milan": "inter",
    "ac milan": "milan",
    "man utd": "manchester united",
    "man united": "manchester united",
    "man city": "manchester city",
    "bayern": "bayern munich",
    "montreal impact": "cf montreal",
    "botafogo": "botafogo",
    "fk bodo - glimt": "Bodø/Glimt",
  };


  function getTrueFormColor(ppgValue, minVal = -1.5, maxVal = 1.5) {
    // 1. Clamp the value: ensure the value stays within the defined min/max range
    const clampedValue = Math.max(minVal, Math.min(maxVal, ppgValue));

    // 2. Normalize the value: convert the range [minVal, maxVal] to [0, 1]
    const normalized = (clampedValue - minVal) / (maxVal - minVal);

    // 3. Map to Hue: Map the [0, 1] range to the HSL Hue range [0 (Red), 120 (Green)]
    // We reverse the range so low values are Red (0) and high values are Green (120)
    // The formula is: Hue = (normalized value) * 120
    const hue = normalized * 120;

    // Set fixed saturation and lightness for consistent color pop
    const saturation = 70;
    const lightness = 25;

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }


  const warnedTeams = new Set(); // Move this outside the function if reused

  function getTeamRanksFromTopTeamsWithPartialMatch(topTeamsData, targetTeamName) {
    if (!topTeamsData) return;

    const teamRanks = {};
    const topTeams = topTeamsData.topTeams;

    const teamNameAliases = {
      "inter milan": "inter",
      "ac milan": "milan",
      "man city": "manchester city",
      "man united": "manchester united",
      "psg": "paris saint-germain",
      "fk bodo - glimt": "bodø/glimt", // Changed to lowercase
      "bodøglimt": "bodø/glimt",      // Changed to lowercase
      "bodo/glimt": "bodø/glimt"       // Common variation
    };

    const targetNameLower = targetTeamName.toLowerCase();
    const normalizedTargetName = teamNameAliases[targetNameLower] || targetNameLower;

    for (const statistic in topTeams) {
      if (!Array.isArray(topTeams[statistic])) continue;

      const teamArray = topTeams[statistic];
      let targetTeamIndex = teamArray.findIndex(
        (teamInfo) => teamInfo.team.name.toLowerCase() === normalizedTargetName
      );

      if (targetTeamIndex === -1) {
        const partialMatches = teamArray.filter((teamInfo) => {
          const name = teamInfo.team.name.toLowerCase();
          return (
            name.includes(normalizedTargetName) ||
            normalizedTargetName.includes(name)
          );
        });

        if (partialMatches.length === 1) {
          targetTeamIndex = teamArray.indexOf(partialMatches[0]);
        } else {
          const warningKey = `${targetTeamName}-${statistic}`;
          if (!warnedTeams.has(warningKey)) {
            console.warn(
              `Ambiguous or missing match for "${targetTeamName}" in "${statistic}" — found:`,
              partialMatches.map((p) => p.team.name)
            );
            warnedTeams.add(warningKey);
          }
        }
      }

      if (targetTeamIndex !== -1) {
        const teamInfo = teamArray[targetTeamIndex];
        teamRanks[statistic] = {
          name: teamInfo.team.name,
          rank: targetTeamIndex + 1,
          value: formatValue(teamInfo.statistics[statistic]),
          games: teamInfo.statistics.matches,
        };
      } else {
        teamRanks[statistic] = {
          name: null,
          rank: null,
          error: "Team not found in this category",
          value: null,
          games: null,
        };
      }
    }

    return teamRanks;
  }

  useEffect(() => {
    if (stats && homeForm?.teamName) {
      const ranks = getTeamRanksFromTopTeamsWithPartialMatch(stats, homeForm.teamName);
      setRanksHome(ranks);
    }
  }, [stats, homeForm?.teamName]);

  useEffect(() => {
    if (stats && awayForm?.teamName) {
      const ranks = getTeamRanksFromTopTeamsWithPartialMatch(stats, awayForm.teamName);
      setRanksAway(ranks);
    }
  }, [stats, awayForm?.teamName]);

  const leagueFixtures = getLeagueFixturesByLeagueId(
    allLeagueResultsArrayOfObjects,
    gameStats?.leagueId
  );
  const resultHome = leagueFixtures.filter(
    (game) =>
      game.home_name === gameStats.home.teamName ||
      game.away_name === gameStats.home.teamName
  );

  const resultHomeOnly = leagueFixtures.filter(
    (game) => game.home_name === gameStats.home.teamName
  );

  resultHome.sort((a, b) => b.date_unix - a.date_unix);
  resultHomeOnly.sort((a, b) => b.date_unix - a.date_unix);

  const resultAway = leagueFixtures.filter(
    (game) =>
      game.away_name === gameStats.away.teamName ||
      game.home_name === gameStats.away.teamName
  );

  const resultAwayOnly = leagueFixtures.filter(
    (game) => game.away_name === gameStats.away.teamName
  );

  resultAway.sort((a, b) => b.date_unix - a.date_unix);
  resultAwayOnly.sort((a, b) => b.date_unix - a.date_unix);

  for (let i = 0; i < resultHome.length; i++) {
    let unixTimestamp = resultHome[i].date_unix;
    let milliseconds = unixTimestamp * 1000;
    let dateObject = new Date(milliseconds).toLocaleString("en-GB", {
      timeZone: "UTC",
    });

    let won;
    let goalsScored;
    let goalsConceeded;

    switch (true) {
      case resultHome[i].home_name === gameStats.home.teamName:
        switch (true) {
          case resultHome[i].homeGoalCount > resultHome[i].awayGoalCount:
            won = "W";
            goalsScored = resultHome[i].homeGoalCount;
            goalsConceeded = resultHome[i].awayGoalCount;
            break;
          case resultHome[i].homeGoalCount === resultHome[i].awayGoalCount:
            won = "D";
            goalsScored = resultHome[i].homeGoalCount;
            goalsConceeded = resultHome[i].awayGoalCount;
            break;
          case resultHome[i].homeGoalCount < resultHome[i].awayGoalCount:
            won = "L";
            goalsScored = resultHome[i].homeGoalCount;
            goalsConceeded = resultHome[i].awayGoalCount;
            break;
          default:
            break;
        }
        break;
      case resultHome[i].away_name === gameStats.home.teamName:
        switch (true) {
          case resultHome[i].homeGoalCount > resultHome[i].awayGoalCount:
            won = "L";
            goalsScored = resultHome[i].homeGoalCount;
            goalsConceeded = resultHome[i].awayGoalCount;
            break;
          case resultHome[i].homeGoalCount === resultHome[i].awayGoalCount:
            won = "D";
            goalsScored = resultHome[i].homeGoalCount;
            goalsConceeded = resultHome[i].awayGoalCount;
            break;
          case resultHome[i].homeGoalCount < resultHome[i].awayGoalCount:
            won = "W";
            goalsScored = resultHome[i].homeGoalCount;
            goalsConceeded = resultHome[i].awayGoalCount;
            break;
          default:
            break;
        }
        break;
      default:
        break;
    }

    gameArrayHome.push({
      id: resultHome[i].id,
      date: dateObject,
      homeTeam: resultHome[i].home_name,
      homeGoals: resultHome[i].homeGoalCount,
      homeXG: resultHome[i].team_a_xg,
      homeOdds: resultHome[i].odds_ft_1,
      awayTeam: resultHome[i].away_name,
      awayGoals: resultHome[i].awayGoalCount,
      awayXG: resultHome[i].team_b_xg,
      awayOdds: resultHome[i].odds_ft_2,
      won: won,
      homeShots: resultHome[i].team_a_shots,
      awayShots: resultHome[i].team_b_shots,
      homeSot: resultHome[i].team_a_shotsOnTarget,
      awaySot: resultHome[i].team_b_shotsOnTarget,
      homeRed: resultHome[i].team_a_red_cards,
      awayRed: resultHome[i].team_b_red_cards,
      homePossession: resultHome[i].team_a_possession,
      awayPossession: resultHome[i].team_b_possession,
      homeDangerousAttacks: resultHome[i].team_a_dangerous_attacks,
      awayDangerousAttacks: resultHome[i].team_b_dangerous_attacks,
      homePPG: resultHome[i].pre_match_teamA_overall_ppg,
      awayPPG: resultHome[i].pre_match_teamB_overall_ppg,
      unixTimestamp: resultHome[i].date_unix,
      goalsFor: goalsScored,
      goalsAgainst: goalsConceeded,
      btts:
        resultHome[i].homeGoalCount > 0 && resultHome[i].awayGoalCount > 0
          ? "\u2714"
          : "\u2718",
    });
  }

  for (let i = 0; i < resultHomeOnly.length; i++) {
    let wonHomeOrAwayOnly;

    switch (true) {
      case resultHomeOnly[i].home_name === gameStats.home.teamName:
        switch (true) {
          case resultHomeOnly[i].homeGoalCount >
            resultHomeOnly[i].awayGoalCount:
            wonHomeOrAwayOnly = "W";
            gameArrayHomeTeamHomeGames.push(wonHomeOrAwayOnly);
            break;
          case resultHomeOnly[i].homeGoalCount ===
            resultHomeOnly[i].awayGoalCount:
            wonHomeOrAwayOnly = "D";
            gameArrayHomeTeamHomeGames.push(wonHomeOrAwayOnly);
            break;
          case resultHomeOnly[i].homeGoalCount <
            resultHomeOnly[i].awayGoalCount:
            wonHomeOrAwayOnly = "L";
            gameArrayHomeTeamHomeGames.push(wonHomeOrAwayOnly);
            break;
          default:
            break;
        }
        break;

      default:
        break;
    }
  }

  for (let i = 0; i < resultAway.length; i++) {
    let unixTimestamp = resultAway[i].date_unix;
    let milliseconds = unixTimestamp * 1000;
    let dateObject = new Date(milliseconds).toLocaleString("en-GB", {
      timeZone: "UTC",
    });

    let won;
    let goalsScored;
    let goalsConceeded;

    switch (true) {
      case resultAway[i].home_name === gameStats.away.teamName:
        switch (true) {
          case resultAway[i].homeGoalCount > resultAway[i].awayGoalCount:
            won = "W";
            goalsScored = resultAway[i].awayGoalCount;
            goalsConceeded = resultAway[i].homeGoalCount;
            break;
          case resultAway[i].awayGoalCount === resultAway[i].homeGoalCount:
            won = "D";
            goalsScored = resultAway[i].awayGoalCount;
            goalsConceeded = resultAway[i].homeGoalCount;
            break;
          case resultAway[i].homeGoalCount < resultAway[i].awayGoalCount:
            won = "L";
            goalsScored = resultAway[i].awayGoalCount;
            goalsConceeded = resultAway[i].homeGoalCount;
            break;
          default:
            break;
        }
        break;

      case resultAway[i].away_name === gameStats.away.teamName:
        switch (true) {
          case resultAway[i].homeGoalCount > resultAway[i].awayGoalCount:
            won = "L";
            goalsScored = resultAway[i].awayGoalCount;
            goalsConceeded = resultAway[i].homeGoalCount;
            break;
          case resultAway[i].homeGoalCount === resultAway[i].awayGoalCount:
            won = "D";
            goalsScored = resultAway[i].awayGoalCount;
            goalsConceeded = resultAway[i].homeGoalCount;
            break;
          case resultAway[i].homeGoalCount < resultAway[i].awayGoalCount:
            won = "W";
            goalsScored = resultAway[i].awayGoalCount;
            goalsConceeded = resultAway[i].homeGoalCount;
            break;
          default:
            break;
        }
        break;
      default:
        break;
    }

    gameArrayAway.push({
      id: resultAway[i].id,
      date: dateObject,
      homeTeam: resultAway[i].home_name,
      homeGoals: resultAway[i].homeGoalCount,
      homeXG: resultAway[i].team_a_xg,
      homeOdds: resultAway[i].odds_ft_1,
      awayTeam: resultAway[i].away_name,
      awayGoals: resultAway[i].awayGoalCount,
      awayXG: resultAway[i].team_b_xg,
      awayOdds: resultAway[i].odds_ft_2,
      won: won,
      homeShots: resultAway[i].team_a_shots,
      awayShots: resultAway[i].team_b_shots,
      homeSot: resultAway[i].team_a_shotsOnTarget,
      awaySot: resultAway[i].team_b_shotsOnTarget,
      homeRed: resultAway[i].team_a_red_cards,
      awayRed: resultAway[i].team_b_red_cards,
      homePossession: resultAway[i].team_a_possession,
      awayPossession: resultAway[i].team_b_possession,
      homeDangerousAttacks: resultAway[i].team_a_dangerous_attacks,
      awayDangerousAttacks: resultAway[i].team_b_dangerous_attacks,
      homePPG: resultAway[i].pre_match_teamA_overall_ppg,
      awayPPG: resultAway[i].pre_match_teamB_overall_ppg,
      unixTimestamp: resultAway[i].date_unix,
      goalsFor: goalsScored,
      goalsAgainst: goalsConceeded,
      btts:
        resultAway[i].homeGoalCount > 0 && resultAway[i].awayGoalCount > 0
          ? "\u2714"
          : "\u2718",
    });
  }

  for (let i = 0; i < resultAwayOnly.length; i++) {
    let wonAwayOrAwayOnly;

    switch (true) {
      case resultAwayOnly[i].away_name === gameStats.away.teamName:
        switch (true) {
          case resultAwayOnly[i].awayGoalCount >
            resultAwayOnly[i].homeGoalCount:
            wonAwayOrAwayOnly = "W";
            gameArrayAwayTeamAwayGames.push(wonAwayOrAwayOnly);
            break;
          case resultAwayOnly[i].awayGoalCount ===
            resultAwayOnly[i].homeGoalCount:
            wonAwayOrAwayOnly = "D";
            gameArrayAwayTeamAwayGames.push(wonAwayOrAwayOnly);
            break;
          case resultAwayOnly[i].awayGoalCount <
            resultAwayOnly[i].homeGoalCount:
            wonAwayOrAwayOnly = "L";
            gameArrayAwayTeamAwayGames.push(wonAwayOrAwayOnly);
            break;
          default:
            break;
        }
        break;

      default:
        break;
    }
  }

  // Helper: Memoized team name mapping to avoid repeated computation
  const mappedTeamNameCache = new Map();
  function getMappedTeamName(name) {
    if (mappedTeamNameCache.has(name)) {
      return mappedTeamNameCache.get(name);
    }
    const normalized = cleanTeamName(name);
    const aliasKey = normalize(name);
    const mapped = cleanTeamName(
      teamNameAliases[aliasKey] || applyNationalTeamAlias(aliasKey)
    );
    mappedTeamNameCache.set(name, mapped);
    return mapped;
  }

  async function getGameIdByHomeTeam(games, homeTeamName) {
    const normalizedSearch = getMappedTeamName(homeTeamName);

    // First try to find an exact match
    const exactMatch = games.find(
      (game) => getMappedTeamName(game.homeTeam) === normalizedSearch
    );

    if (exactMatch) return exactMatch;

    // If no exact match, try partial match using includes
    const partialMatch = games.find(
      (game) => getMappedTeamName(game.homeTeam).includes(normalizedSearch)
    );

    return partialMatch || null;
  }

  async function getGameIdByAwayTeam(games, awayTeamName) {
    const normalizedSearch = getMappedTeamName(awayTeamName);

    // First try to find an exact match
    const exactMatch = games.find(
      (game) => getMappedTeamName(game.awayTeam) === normalizedSearch
    );

    if (exactMatch) return exactMatch;

    // If no exact match, try partial match using includes
    const partialMatch = games.find(
      (game) => getMappedTeamName(game.awayTeam).includes(normalizedSearch)
    );

    return partialMatch || null;
  }

  async function findGameByPartialMatch(gamesArray, searchText, teamType) {
    try {
      const normalizedSearch = getMappedTeamName(searchText);

      const matchingGame = gamesArray.find((game) => {
        const teamNameInArray = teamType === "homeTeam" ? game.homeTeam : game.awayTeam;
        const normalizedArrayName = getMappedTeamName(teamNameInArray);
        return (
          normalizedArrayName.includes(normalizedSearch) ||
          normalizedSearch.includes(normalizedArrayName)
        );
      });

      return matchingGame || null;
    } catch (error) {
      console.error(
        `Error finding game by partial match (array value against search text) on ${teamType}:`,
        error
      );
      return null;
    }
  }


  function isBeforeTimestamp(targetTimestamp) {
    const currentTimestamp = Math.floor(Date.now() / 1000); // Get current time in seconds
    return currentTimestamp < targetTimestamp;
  }

  const reasonCodeMap = {
    1: "Injury",
    2: "Unknown",
    3: "Suspension",
    4: "Personal Reasons",
    5: "International Duty",
    6: "Not in Squad",
    7: "Rest",
    8: "Unknown",
  };

  function getReasonDescription(code) {
    return reasonCodeMap[code] || "Unknown";
  }

  const positionCodeMap = {
    G: "Goalkeeper",
    D: "Defender",
    M: "Midfielder",
    F: "Attacker",
  };

  function getPos(code) {
    return positionCodeMap[code] || "";
  }

  async function extractMissingPlayers(data) {
    const extract = (teamType) => {
      const team = data?.[teamType];
      if (!team || !Array.isArray(team.missingPlayers)) return [];

      return team.missingPlayers.map((mp) => ({
        team: teamType,
        name: mp.player?.name ?? "Unknown",
        position: getPos(mp.player?.position),
        reason: getReasonDescription(mp.reason),
        description: mp.description ?? "Unknown",
        type: mp.type,
      }));
    };

    return {
      homeMissingPlayers: extract("home"),
      awayMissingPlayers: extract("away"),
    };
  }

  async function extractPlayerRatings(data) {
    const extract = (teamType) => {
      const team = data?.[teamType];
      if (!team || !Array.isArray(team.players)) {
        return { formation: null, lineup: [] };
      }

      return {
        formation: team.formation ?? null,
        lineup: team.players.map((p) => ({
          team: teamType,
          name: p.player?.name ?? "Unknown",
          avgRating: p.avgRating ?? "N/A",
          position: p.position ?? "Unknown",
          valueEuros: p.player?.proposedMarketValueRaw?.value ?? "Unknown",
        })),
      };
    };

    return {
      homeLineup: extract("home"),
      awayLineup: extract("away"),
    };
  }

  function mapOddsToStreaks(streaks, odds) {
    const mappedStreaks = JSON.parse(JSON.stringify(streaks)); // Deep copy to avoid modifying original

    const getOddsValue = (streakName, teamType) => {
      let oddsCategory;
      if (teamType === "home") {
        oddsCategory = odds.HomeTeam;
      } else if (teamType === "away") {
        oddsCategory = odds.AwayTeam;
      } else if (teamType === "both") {
        oddsCategory = odds.GeneralMatchOdds;
      } else {
        oddsCategory = odds.GeneralMatchOdds;
      }

      const mapping = oddsCategory ? oddsCategory._streakMapping : {};
      const oddsKey = mapping[streakName];

      if (oddsKey !== undefined && oddsKey !== null) {
        return oddsCategory[oddsKey];
      } else if (oddsKey === null) {
        return undefined; // Explicitly mapped to null, means no odds available
      }
      // Fallback: if not in mapping, try direct key match (less reliable for streaks)
      return oddsCategory ? oddsCategory[streakName] : undefined;
    };

    for (const category in mappedStreaks) {
      if (Array.isArray(mappedStreaks[category])) {
        mappedStreaks[category] = mappedStreaks[category].map((streak) => {
          const oddsValue = getOddsValue(streak.name, streak.team);
          return {
            ...streak,
            odds: oddsValue !== undefined ? oddsValue : "N/A",
          };
        });
      }
    }

    return mappedStreaks;
  }

  // Memoize derivedRoundId so it's only recalculated when game.sofaScoreId or rounds changes
  const derivedRoundId = useMemo(() => {
    for (const mapping of rounds) {
      if (mapping.hasOwnProperty(game.sofaScoreId)) {
        return mapping[game.sofaScoreId];
      }
    }
    console.warn(`No matching ID found for ID: ${game.sofaScoreId}`);
    return null;
  }, [game.sofaScoreId, rounds]);

  function getWeekOfYear(date) {
    const target = new Date(date.valueOf());
    const dayNumber = (date.getUTCDay() + 6) % 7;
    target.setUTCDate(target.getUTCDate() - dayNumber + 3);
    const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4));
    const diff = target - firstThursday;
    return 1 + Math.round(diff / (7 * 24 * 60 * 60 * 1000));
  }

  const today = new Date(); // Or new Date()
  const week = getWeekOfYear(today);

  async function extractRankedPlayersByTeam(topPlayers, teamId) {
    const result = [];

    if (!topPlayers || typeof topPlayers !== "object") return result;

    // Helper to find or create player entry
    const getOrCreatePlayer = (players, playerName, playerId) => {
      let playerEntry = players.find((p) => p.playerName === playerName);
      if (!playerEntry) {
        playerEntry = { playerName, playerId, rankings: [] };
        players.push(playerEntry);
      }
      return playerEntry;
    };

    for (const [metric, playerArray] of Object.entries(topPlayers)) {
      if (!Array.isArray(playerArray)) continue;

      playerArray.forEach((playerData, index) => {
        if (playerData?.team?.id === teamId) {
          const playerName = playerData.player?.name;
          const playerId = playerData.player?.id;
          if (!playerName || !playerId) return;

          const playerEntry = getOrCreatePlayer(result, playerName, playerId);
          playerEntry.rankings.push({
            metric,
            rank: index + 1, // Rank is 1-based
          });
        }
      });
    }

    // Sort players by number of rankings (descending)
    result.sort((a, b) => b.rankings.length - a.rankings.length);

    return result;
  }

  useEffect(() => {
    async function fetchMatchingGame() {
      try {
        const mappedHome = getMappedTeamName(game.homeTeam);
        const mappedAway = getMappedTeamName(game.awayTeam);

        // Prefer matching both teams together to avoid false positives in international fixtures.
        let matchingGameInfo = findSofaScoreGameByTeams(
          arrayOfGames,
          game.homeTeam,
          game.awayTeam,
          getMappedTeamName
        );

        if (!matchingGameInfo) {
          matchingGameInfo =
            await getGameIdByHomeTeam(arrayOfGames, mappedHome);
        }

        if (!matchingGameInfo) {
          console.log(
            `No match found for homeTeam: ${mappedHome}. Trying awayTeam: ${mappedAway}`
          );
          matchingGameInfo =
            await getGameIdByAwayTeam(arrayOfGames, mappedAway);
        }

        if (!matchingGameInfo) {
          console.log(
            `No exact match found. Trying partial match on homeTeam: ${mappedHome}`
          );
          matchingGameInfo =
            await findGameByPartialMatch(arrayOfGames, mappedHome, "homeTeam");
        }

        if (!matchingGameInfo) {
          console.log(
            `Still no match. Trying partial match on awayTeam: ${mappedAway}`
          );
          matchingGameInfo =
            await findGameByPartialMatch(arrayOfGames, mappedAway, "awayTeam");
        }

        console.log(
          `Matching game found: ${matchingGameInfo ? matchingGameInfo.id : "None"}`
        );
        setMatchingGame(matchingGameInfo);

        if (!matchingGameInfo) {
          console.warn(
            `No matching game found for either homeTeam "${game.homeTeam}" or awayTeam "${game.awayTeam}"`
          );
          // Optionally set matchingGame to a default value (e.g., null) if needed
          // setMatchingGame(null);
        }

        const now = Math.floor(Date.now() / 1000); // current Unix timestamp in seconds
        const isWithin48Hours = game.date > now && game.date - now <= 172800;
        const lowerTierLeagueIds = [
          // Conference 25/26
          173,
          //National league north 25/26
          176,
          //National league south 25/26
          174,
          // Ekstraklasa (Poland)
          202,
          // Spanish Segunda Division
          54,
          // Bundesliga 2
          44,
          // French Ligue 2
          182,
          // Italian Serie B 25/26
          53,
          // Dutch Eerste Divisie 25
          131,
          // Scottish Championship 25
          206,
          // Scottish League One 25
          207,
          // Scottish League Two 25
          209,
          // Swiss Super League
          215,
          // Croatian First League
          170,
          // Czech First League
          172,
          // Finnish Veikkausliiga
          41,
          // Ukrainian Premier League
          218,
          // Slovenian Prva Liga
          212,
          // Slovak Super Liga
          211,
          // Serbian SuperLiga
          210,
          // Brazil Serie B
          390,
          // Colombian Liga BetPlay 25
          11539,
          // Chilean Primera Division 25
          11653,
          // Uruguayan Primera Division 25
          278,
          // USL 25 (USA 2nd Div)
          13363,
          // Canadian Premier League 25
          13470,
          // Ireland 24/25
          192,
        ];

        // console.log("isWithin48Hours:", isWithin48Hours);
        // console.log("game.date:", game.date, "| now:", now, "| diff:", game.date - now);
        setLoading(true);
        setLoadingStreaks(true);
        setLoadingOdds(true);
        setLoadingPlayerData(true);
        setLoadingTeamStats(true);
        setLoadingKeyPlayers(true);
        setLoadingFutureFixtures(true);
        setLoadingVoteData(true);
        setLoadingManagers(true);

        let previousGames = await fetch(
          `${process.env.REACT_APP_EXPRESS_SERVER}match/${game.id}`
        );
        let odds;
        await previousGames.json().then((data) => {
          odds = {
            HomeTeam: {
              HomeWin: data.data.odds_ft_1,
              MostCorners: data.data.odds_corners_1,
              DoubleChanceHomeOrDraw: data.data.odds_doublechance_1x,
              DoubleChanceAwayOrDraw: data.data.odds_doublechance_x2,
              ToWinToNil: data.data.odds_win_to_nil_1,
              ToScoreFirst: data.data.odds_team_to_score_first_1,
              CleanSheetYes: data.data.odds_team_a_cs_yes,
              CleanSheetNo: data.data.odds_team_a_cs_no,
              "1stHalfResultHomeWinning": data.data.odds_1st_half_result_1,
              "1stHalfResultAwayWinning": data.data.odds_1st_half_result_2,
              "Over2.5GoalsInMatch": data.data.odds_ft_over25,
              "Under2.5GoalsInMatch": data.data.odds_ft_under25,
              "Over3.5GoalsInMatch": data.data.odds_ft_over35,
              "Under3.5GoalsInMatch": data.data.odds_ft_under35,
              "Over10.5CornersInMatch": data.data.odds_corners_over_105,
              "Under10.5CornersInMatch": data.data.odds_corners_under_105,
              BTTSInMatchYes: data.data.odds_btts_yes,
              // --- NEW MAPPING KEYS FOR HOME TEAM ---
              _streakMapping: {
                Wins: "HomeWin",
                "No wins": "DoubleChanceAwayOrDraw",
                "No losses": "DoubleChanceHomeOrDraw",
                "First to score": "ToScoreFirst",
                "Without clean sheet": "CleanSheetNo",
                "First half winner": "1stHalfResultHomeWinning",
                "First half loser": "1stHalfResultAwayWinning",
                "No goals conceded": "CleanSheetYes",
                "More than 2.5 goals": "Over2.5GoalsInMatch",
                "Less than 2.5 goals": "Under2.5GoalsInMatch",
                "More than 3.5 goals": "Over3.5GoalsInMatch",
                "Less than 3.5 goals": "Under3.5GoalsInMatch",
                "Less than 10.5 corners": "Under10.5CornersInMatch",
                "More than 10.5 corners": "Over10.5CornersInMatch",
                "Both teams scoring": "BTTSInMatchYes",

                // Add more specific mappings for home team streaks here
              },
            },
            AwayTeam: {
              AwayWin: data.data.odds_ft_2,
              MostCorners: data.data.odds_corners_2,
              DoubleChanceHomeOrDraw: data.data.odds_doublechance_1x,
              DoubleChanceAwayOrDraw: data.data.odds_doublechance_x2,
              ToWinToNil: data.data.odds_win_to_nil_2,
              ToScoreFirst: data.data.odds_team_to_score_first_2,
              CleanSheetYes: data.data.odds_team_b_cs_yes,
              CleanSheetNo: data.data.odds_team_b_cs_no,
              "1stHalfResultHomeWinning": data.data.odds_1st_half_result_1,
              "1stHalfResultAwayWinning": data.data.odds_1st_half_result_2,
              "Over2.5GoalsInMatch": data.data.odds_ft_over25,
              "Under2.5GoalsInMatch": data.data.odds_ft_under25,
              "Over3.5GoalsInMatch": data.data.odds_ft_over35,
              "Under3.5GoalsInMatch": data.data.odds_ft_under35,
              "Over10.5CornersInMatch": data.data.odds_corners_over_105,
              "Under10.5CornersInMatch": data.data.odds_corners_under_105,
              BTTSInMatchYes: data.data.odds_btts_yes,

              // --- NEW MAPPING KEYS FOR AWAY TEAM ---
              _streakMapping: {
                Wins: "AwayWin",
                "No wins": "DoubleChanceHomeOrDraw",
                "No losses": "DoubleChanceAwayOrDraw", // Assuming "No losses" for away means DoubleChanceAwayOrDraw
                "First to score": "ToScoreFirst",
                "Without clean sheet": "CleanSheetNo",
                "First half winner": "1stHalfResultAwayWinning",
                "First half loser": "1stHalfResultHomeWinning",
                "No goals conceded": "CleanSheetYes",
                "More than 2.5 goals": "Over2.5GoalsInMatch",
                "Less than 2.5 goals": "Under2.5GoalsInMatch",
                "More than 3.5 goals": "Over3.5GoalsInMatch",
                "Less than 3.5 goals": "Under3.5GoalsInMatch",
                "Less than 10.5 corners": "Under10.5CornersInMatch",
                "More than 10.5 corners": "Over10.5CornersInMatch",
                "Both teams scoring": "BTTSInMatchYes",

                // Add more specific mappings for away team streaks here
              },
            },
            GeneralMatchOdds: {
              BTTSYes: data.data.odds_btts_yes,
              BTTSNo: data.data.odds_btts_no,
              "Over2.5Goals": data.data.odds_ft_over25,
              "Under2.5Goals": data.data.odds_ft_under25,
              "Over3.5Goals": data.data.odds_ft_over35,
              "Under3.5Goals": data.data.odds_ft_under35,
              "Over10.5Corners": data.data.odds_corners_over_105,
              "Under10.5Corners": data.data.odds_corners_under_105,

              // --- NEW MAPPING KEYS FOR GENERAL MATCH ODDS ---
              _streakMapping: {
                "Both teams scoring": "BTTSYes",
                "More than 2.5 goals": "Over2.5Goals",
                "Less than 2.5 goals": "Under2.5Goals",
                "Less than 4.5 cards": null, // Explicitly map to null if no odds exist
                "Less than 10.5 corners": "Under10.5Corners",
                "More than 10.5 corners": "Over10.5Corners",
              },
            },
          };

          // previousGameStats = data.data.h2h.previous_matches_results
        });

        setOddsData(odds);

        // 1. Only proceed if the user is a premium member
        console.log("User paid status:", isPaidUser);
        if (isPaidUser && matchingGameInfo?.id) {
          try {
            const streaks = await fetch(
              `${process.env.REACT_APP_EXPRESS_SERVER}streaks/${matchingGameInfo.id}`
            );

            const streaksDataRaw = await streaks.json();

            // 2. Ensure we have data and odds before mapping
            if (streaksDataRaw && odds) {
              const mappedStreaks = mapOddsToStreaks(streaksDataRaw, odds);
              setStreakData(mappedStreaks); // Update state with the mapped data
            }
          } catch (error) {
            console.error("Error fetching streaks:", error);
          }
        } else if (!isPaidUser) {
          // Optional: Clear the state for free users so they don't see old data
          setStreakData(null);
        }

        if (
          derivedRoundId &&
          matchingGameInfo?.homeId &&
          matchingGameInfo?.awayId
        ) {
          console.log(`Derived round ID for league ${game.sofaScoreId}: ${derivedRoundId}`);
          try {
            const homeTeamStatsResponse = await fetch(
              `${process.env.REACT_APP_EXPRESS_SERVER}teamStats/${matchingGameInfo.homeId}/${game.sofaScoreId}/${derivedRoundId}`
            );
            const homeTeam = await homeTeamStatsResponse.json();
            let homeStats = homeTeam.statistics;


            const awayTeamStatsResponse = await fetch(
              `${process.env.REACT_APP_EXPRESS_SERVER}teamStats/${matchingGameInfo.awayId}/${game.sofaScoreId}/${derivedRoundId}`
            );
            const awayTeam = await awayTeamStatsResponse.json();
            let awayStats = awayTeam.statistics;

            setHomeTeamStats(homeStats);
            setAwayTeamStats(awayStats);
          } catch (error) {
            console.error(
              `Error fetching team stats for league ${game.sofaScoreId}:`,
              error
            );
          }


          try {
            const leaguePlayerStatsResponse = await fetch(
              `${process.env.REACT_APP_EXPRESS_SERVER}bestPlayers/${game.sofaScoreId}/${derivedRoundId}/${week}`
            );

            const playerStats = await leaguePlayerStatsResponse.json();

            let playersHome = await extractRankedPlayersByTeam(
              playerStats.topPlayers,
              matchingGameInfo.homeId
            );
            let playersAway = await extractRankedPlayersByTeam(
              playerStats.topPlayers,
              matchingGameInfo.awayId
            );
            const trimmedPlayersHome = playersHome.slice(0, 5); // Limit to top 3 players
            const trimmedPlayersAway = playersAway.slice(0, 5); // Limit to top 3 players



            setHomePlayerData(trimmedPlayersHome);
            setAwayPlayerData(trimmedPlayersAway);

            try {
              const homeImageResponse = await fetch(`${process.env.REACT_APP_EXPRESS_SERVER}playerImage/${playersHome[0].playerId}`);
              const awayImageResponse = await fetch(`${process.env.REACT_APP_EXPRESS_SERVER}playerImage/${playersAway[0].playerId}`);

              if (homeImageResponse.ok) {
                const blob = await homeImageResponse.blob();
                setHomePlayerImage(URL.createObjectURL(blob));
              } else {
                console.error("Failed to fetch home image:", homeImageResponse.status);
              }

              if (awayImageResponse.ok) {
                const blob = await awayImageResponse.blob();
                setAwayPlayerImage(URL.createObjectURL(blob));
              } else {
                console.error("Failed to fetch away image:", awayImageResponse.status);
              }
            } catch (err) {
              console.error("Error fetching images:", err);
            }

            // allPlayerStats[`leagueStats${game.sofaScoreId}`] = teamStats;
            // console.log(`Fetched stats for league ${leagueId}`);
          } catch (error) {
            console.error(
              `Error fetching player stats for league ${game.sofaScoreId}:`,
              error
            );
            // allLeagueStats[`leagueStats${leagueId}`] = { error: error.message }; // Store error if fetch fails
          }

          let homePlayers;
          let awayPlayers;


          try {
            setLoadingPlayerStats(true);

            console.log(matchingGameInfo)
            // Run both fetches in parallel
            const [homeResult, awayResult] = await Promise.allSettled([
              fetch(`${process.env.REACT_APP_EXPRESS_SERVER}teams/get-player-statistics/${matchingGameInfo.homeId}/${game.sofaScoreId}/${derivedRoundId}/${matchingGameInfo.id}`),
              fetch(`${process.env.REACT_APP_EXPRESS_SERVER}teams/get-player-statistics/${matchingGameInfo.awayId}/${game.sofaScoreId}/${derivedRoundId}/${matchingGameInfo.id}`)
            ]);

            // Handle Home Team Data
            if (homeResult.status === 'fulfilled' && homeResult.value.ok) {
              const data = await homeResult.value.json();
              homePlayers = data || [];
              setHomeTeamPlayerStats(data);
            } else {
              console.error("Home stats fetch failed");
              setHomeTeamPlayerStats({ error: true, players: [] }); // Set a "safe" empty state
            }

            // Handle Away Team Data
            if (awayResult.status === 'fulfilled' && awayResult.value.ok) {
              const data = await awayResult.value.json();
              awayPlayers = data || [];
              setAwayTeamPlayerStats(data);
            } else {
              console.error("Away stats fetch failed");
              setAwayTeamPlayerStats({ error: true, players: [] });
            }

          } catch (err) {
            console.error("Critical error in stats fetch:", err);
          } finally {
            setLoadingPlayerStats(false);
          }

          if (
            isWithin48Hours && !lowerTierLeagueIds.includes(game.sofaScoreId)
          ) {
            console.log(`Game is within 48 hours and not in lower tier league. Fetching lineup details for game ID: ${matchingGameInfo.id}`);
            const lineupDetail = await fetch(
              `${process.env.REACT_APP_EXPRESS_SERVER}lineups/${matchingGameInfo.id}`
            );

            const data = await lineupDetail.json();
            console.log("Lineup details fetched:", data);
            const { homeMissingPlayers, awayMissingPlayers } =
              await extractMissingPlayers(data);
            const { homeLineup, awayLineup } = await extractPlayerRatings(data);
            setHomeLineupList(homeLineup);
            setAwayLineupList(awayLineup);
            setHomeMissingPlayersList(homeMissingPlayers);
            setAwayMissingPlayersList(awayMissingPlayers);

            const enrichMissingPlayers = (missingList, teamStats, played, scored, teamDefActions, teamAttActions, team) => {
              if (!missingList || !teamStats || !teamStats.players) return [];
              return missingList.map(missingPlayer => {
                // 1. Find the player in the full statistics list (matching by name or ID)
                const statsEntry = teamStats.players.find(p =>
                  p.name === missingPlayer.name || p.id === missingPlayer.id
                );

                const stats = statsEntry || {};
                const appearances = stats.appearances || 0;
                const tackles = stats.tackles || 0;
                const interceptions = stats.interceptions || 0;
                const accuratePasses = stats.accuratePasses || 0;
                const keyPasses = stats.keyPasses || 0;
                const bigChancesCreated = stats.bigChancesCreated || 0;
                const goals = stats.goals || 0;
                const assists = stats.assists || 0;
                const rating = stats.rating || 6.5;
                const scoringFrequency = stats.scoringFrequency || 0; // e.g., 105.5 minutes per goal
                let efficiencyBonus = 1;

                if (scoringFrequency > 0) {
                  // If a player scores every 90 mins, bonus is ~2.2
                  // If they score every 200 mins, bonus is ~1.0
                  if (stats.position === "F") {
                    efficiencyBonus = Math.max(1, 135 / scoringFrequency);
                  } else {
                    efficiencyBonus = Math.max(1, 270 / scoringFrequency);
                  }
                }

                let goalWeight = 7;
                let assistWeight = 5;

                if (stats.position === "M") {
                  goalWeight = 10;
                  assistWeight = 6;
                }

                const attackingActions =
                  (goals * goalWeight) +
                  (assists * assistWeight) +
                  (keyPasses * 1.5) +
                  (bigChancesCreated * 4);

                const attackingShare =
                  Math.min(1, attackingActions / teamAttActions);

                const usageImpact = Math.min(1, appearances / played) * 3;

                const attackingContributionImpact =
                  Math.pow(attackingShare, 0.6) * 7 * efficiencyBonus;

                const attackingQualityImpact =
                  Math.max(0, rating - 6.5) * 2;

                let positionalAdjustment = 1

                if (stats.position === "F") positionalAdjustment = 1;
                else if (stats.position === "M") positionalAdjustment = 0.9;
                else if (stats.position === "D") positionalAdjustment = 0.8;
                else if (stats.position === "G") positionalAdjustment = 0.4;

                const attackingImpactScore = Math.min(
                  10,
                  usageImpact +
                  attackingContributionImpact * 3 +
                  attackingQualityImpact
                ) * positionalAdjustment;


                const defensiveActions =
                  tackles * 2 +
                  interceptions * 2 +
                  accuratePasses * 0.04;

                const defensiveShare = Math.min(1, defensiveActions / teamDefActions);
                const defensiveUsageImpact = Math.min(1, appearances / played) * 2;
                const defensiveContributionImpact = defensiveShare * 10;
                const defensiveQualityImpact = Math.max(0, rating - 6.5) * 3;

                let defensivePositionMultiplier = 1;

                if (stats.position === "F") defensivePositionMultiplier = 0.35;
                if (stats.position === "M") defensivePositionMultiplier = 0.75;
                if (stats.position === "D") defensivePositionMultiplier = 1.2;
                if (stats.position === "G") defensivePositionMultiplier = 1.5;



                const defensiveImpactScore = Math.min(
                  10,
                  (defensiveUsageImpact +
                    defensiveContributionImpact +
                    defensiveQualityImpact) * defensivePositionMultiplier
                );



                let attackLambdaImpact = 1 - (attackingImpactScore * 0.02);
                let defenceLambdaImpact = 1 + (defensiveImpactScore * 0.02);
                if (missingPlayer.type === "doubtful") {
                  attackLambdaImpact = 1 - ((attackingImpactScore * 0.02) * 0.5);
                  defenceLambdaImpact = 1 + ((defensiveImpactScore * 0.02) * 0.5);
                }
                if (team === "home") {
                  gameStats.home[2].attackLambdaImpact = Math.max(0.8, attackLambdaImpact);
                  gameStats.home[2].defenceLambdaImpact = Math.min(1.2, defenceLambdaImpact);
                } else if (team === "away") {
                  gameStats.away[2].attackLambdaImpact = Math.max(0.8, attackLambdaImpact);
                  gameStats.away[2].defenceLambdaImpact = Math.min(1.2, defenceLambdaImpact);
                }

                return {
                  name: missingPlayer.name,
                  reason: missingPlayer.reason || "Unknown",
                  description: missingPlayer.description || "",
                  type: missingPlayer.type, // e.g., 'Missing' or 'Doubtful'
                  appearances: stats.appearances || 0,
                  goals: stats.goals || 0,
                  assists: stats.assists || 0,
                  rating: stats.rating || 0,
                  position: missingPlayer.position || "Unknown",
                  // Calculate an "Impact Score" (weighted importance)
                  attackingImpactScore: attackingImpactScore.toFixed(1),
                  defensiveImpactScore: defensiveImpactScore.toFixed(1),
                };
              }).sort((a, b) => {
                // 1. Get the max impact for player A
                const maxImpactA = Math.max(
                  parseFloat(a.attackingImpactScore),
                  parseFloat(a.defensiveImpactScore)
                );

                // 2. Get the max impact for player B
                const maxImpactB = Math.max(
                  parseFloat(b.attackingImpactScore),
                  parseFloat(b.defensiveImpactScore)
                );

                // 3. Sort descending (highest impact first)
                // If impacts are equal, fall back to appearances
                if (maxImpactB !== maxImpactA) {
                  return maxImpactB - maxImpactA;
                }
                return b.appearances - a.appearances;
              });
            };

            const teamDefensiveActionsHome = homePlayers.players.reduce((sum, player) => {
              const tackles = player.tackles || 0;
              const interceptions = player.interceptions || 0;
              const accuratePasses = player.accuratePasses || 0;
              return sum + (tackles * 1.2) + (interceptions * 1.5) + (accuratePasses * 0.02);
            }, 0);

            const teamAttackingActionsHome = homePlayers.players.reduce((sum, player) => {
              const goals = player.goals || 0;
              const assists = player.assists || 0;
              const keyPasses = player.keyPasses || 0;
              const bigChancesCreated = player.bigChancesCreated || 0;

              return sum +
                (goals * 4) +
                (assists * 3) +
                (keyPasses * 1.5) +
                (bigChancesCreated * 2);
            }, 0);

            const teamAttackingActionsAway = awayPlayers.players.reduce((sum, player) => {
              const goals = player.goals || 0;
              const assists = player.assists || 0;
              const keyPasses = player.keyPasses || 0;
              const bigChancesCreated = player.bigChancesCreated || 0;

              return sum +
                (goals * 4) +
                (assists * 3) +
                (keyPasses * 1.5) +
                (bigChancesCreated * 2);
            }, 0);

            const teamDefensiveActionsAway = awayPlayers.players.reduce((sum, player) => {
              const tackles = player.tackles || 0;
              const interceptions = player.interceptions || 0;
              const accuratePasses = player.accuratePasses || 0;
              return sum + (tackles * 1.2) + (interceptions * 1.5) + (accuratePasses * 0.02);
            }, 0);


            const homeMissingPlayersImpactAssessment = enrichMissingPlayers(homeMissingPlayers, homePlayers, gameStats.home[2].gamesPlayed, gameStats.home[2].ScoredOverall, teamDefensiveActionsHome, teamAttackingActionsHome, "home");
            const awayMissingPlayersImpactAssessment = enrichMissingPlayers(awayMissingPlayers, awayPlayers, gameStats.away[2].gamesPlayed, gameStats.away[2].ScoredOverall, teamDefensiveActionsAway, teamAttackingActionsAway, "away");

            setHomeMissingPlayersImpact(homeMissingPlayersImpactAssessment);
            setAwayMissingPlayersImpact(awayMissingPlayersImpactAssessment);
          }


          // const matchPreviewResponse = await fetch(
          //   `${process.env.REACT_APP_EXPRESS_SERVER}gemini/match-preview/${matchingGameInfo.homeId}${matchingGameInfo.awayId}/${matchingGameInfo.time}`,
          //   {
          //     method: "POST",
          //     headers: {
          //       Accept: "application/json",
          //       "Content-Type": "application/json",
          //     },
          //     body: JSON.stringify({
          //       homeTeamName: matchingGameInfo.homeTeam,
          //       awayTeamName: matchingGameInfo.awayTeam,
          //       matchTime: matchingGameInfo.time,
          //       homeData: teamDataHomeResponse, // The full home team JSON
          //       awayData: teamDataAwayResponse, // The full away team JSON
          //     }),
          //   }
          // );


          // const voteRequest = await fetch(
          //   `${process.env.REACT_APP_EXPRESS_SERVER}votes/${matchingGameInfo.id}/${today.getDay()}`
          // );
          // const data = await voteRequest.json();
          // setVoteData(data);

        }

        // Managers only need the SofaScore match id, not a league season round.
        if (matchingGameInfo?.id) {
          try {
            const getManagers = await fetch(
              `${process.env.REACT_APP_EXPRESS_SERVER}matches/get-managers/${matchingGameInfo.id}`
            );
            const managersData = await getManagers.json();
            console.log("Managers data fetched:", managersData);

            if (managersData?.homeManager?.name) {
              setHomeManager(managersData.homeManager);
              setAwayManager(managersData.awayManager);

              if (managersData?.homeManager?.careerHistory?.total < 6) {
                console.log(
                  "Home manager has less than 10 games of career history. Marking as new manager."
                );
                setNewManagerHome(true);
              }
              if (managersData?.awayManager?.careerHistory?.total < 6) {
                setNewManagerAway(true);
              }
            }
          } catch (error) {
            console.error(
              `Error fetching managers for game ${matchingGameInfo.id}:`,
              error
            );
          }
        }

        if (isPaidUser && matchingGameInfo?.homeId && matchingGameInfo?.awayId) {
          try {
            const futureFixturesHomeResponse = await fetch(
              `${process.env.REACT_APP_EXPRESS_SERVER}futureFixtures/${matchingGameInfo.homeId}/${week}`
            );
            const fixturesDataHome = await futureFixturesHomeResponse.json();

            const futureFixturesAwayResponse = await fetch(
              `${process.env.REACT_APP_EXPRESS_SERVER}futureFixtures/${matchingGameInfo.awayId}/${week}`
            );
            const fixturesDataAway = await futureFixturesAwayResponse.json();

            setFutureFixturesHome(
              selectUpcomingFixtures(
                mapFutureFixtureEvents(fixturesDataHome.events)
              )
            );
            setFutureFixturesAway(
              selectUpcomingFixtures(
                mapFutureFixtureEvents(fixturesDataAway.events)
              )
            );
          } catch (error) {
            console.error(
              `Error fetching future fixtures for game ${game.sofaScoreId}:`,
              error
            );
          }
        } else if (!isPaidUser) {
          console.log("User is not premium. Skipping future fixtures fetch.");
          setFutureFixturesHome([]);
          setFutureFixturesAway([]);
        }
      } catch (error) {
        console.error("Error fetching or processing data:", error);
        // Handle errors (e.g., set error state, show error message)
      } finally {
        setLoadingTeamStats(false);
        setLoadingOdds(false);
        setLoadingPlayerData(false);
        setLoadingStreaks(false);
        setLoadingFutureFixtures(false);
        setLoadingKeyPlayers(false);
        setLoadingVoteData(false);
        setLoadingManagers(false);
        setLoading(false);
        // console.log(homePlayerData);
      }
    }

    fetchMatchingGame();
  }, [game.id]);

  const hasFetchedImages = useRef(false);

  useEffect(() => {
    if (!homePlayerData.length || !awayPlayerData.length) return;

    if (hasFetchedImages.current) return;

    hasFetchedImages.current = true;

    const fetchImagesForPlayers = async (players, setFn) => {
      const updatedPlayers = [];

      for (const player of players) {
        try {
          const res = await fetch(`${process.env.REACT_APP_EXPRESS_SERVER}playerImage/${player.playerId}`);
          if (res.ok) {
            const blob = await res.blob();
            const imageUrl = URL.createObjectURL(blob);
            updatedPlayers.push({ ...player, playerImage: imageUrl });
          } else {
            console.warn(`Image fetch failed for ${player.playerName}`);
            updatedPlayers.push({ ...player, playerImage: null });
          }
        } catch (error) {
          console.error(`Error fetching image for ${player.playerName}`, error);
          updatedPlayers.push({ ...player, playerImage: null });
        }

        await new Promise((resolve) => setTimeout(resolve, 250)); // 250ms delay
      }

      setFn(updatedPlayers);
    };

    fetchImagesForPlayers(homePlayerData, setHomePlayerDataWithImages);
    fetchImagesForPlayers(awayPlayerData, setAwayPlayerDataWithImages);
  }, [homePlayerData, awayPlayerData]);


  useEffect(() => {
    if (homeTeamStats) {
    }
  }, [homeTeamStats]);

  useEffect(() => {
    if (matchingGame) {
      setId(matchingGame.id.toString());
      setTeam1(matchingGame.homeTeam);
      setTeam2(matchingGame.awayTeam);
      setTimestamp(matchingGame.time);
      setHomeGoals(matchingGame.homeGoals);
      setAwayGoals(matchingGame.awayGoals);
    } else {
      setId("0");
      setTeam1("N/A");
      setTeam2("N/A");
      setTimestamp(1);
      setHomeGoals("-");
      setAwayGoals("-");
    }
  }, [matchingGame]); //This useEffect hook runs whenever matchingGame changes.



  function singleResult(game) {
    return (
      <div>
        <div className="ResultRowSmall">
          <span className="column">{game.homeXG}</span>
          <span className="column">XG</span>
          <span className="column">{game.awayXG}</span>
        </div>
        <div className="ResultRowSmall">
          <span className="column">{game.homeShots}</span>
          <span className="column">Shots</span>
          <span className="column">{game.awayShots}</span>
        </div>
        <div className="ResultRowSmall">
          <span className="column">{game.homeSot}</span>
          <span className="column">SOT</span>
          <span className="column">{game.awaySot}</span>
        </div>
        <div className="ResultRowSmall">
          <span className="column">{game.homeDangerousAttacks}</span>
          <span className="column">Dangerous Attacks</span>
          <span className="column">{game.awayDangerousAttacks}</span>
        </div>
        <div className="ResultRowSmall">
          <span className="column">{game.homePossession}%</span>
          <span className="column">Possession</span>
          <span className="column">{game.awayPossession}%</span>
        </div>
        <div className="ResultRowSmall">
          <span className="column">{game.homeRed}</span>
          <span className="column">Red cards</span>
          <span className="column">{game.awayRed}</span>
        </div>
        <div className="ResultRowSmall">
          <span className="column">{game.homePPG}</span>
          <span className="column">PPG (pre-match)</span>
          <span className="column">{game.awayPPG}</span>
        </div>
      </div>
    );
  }

  const COMPARISON_RULES = [
    // --- Performance & Goals ---
    { key: 'goals', higherIsBetter: true },
    { key: 'conceeded', higherIsBetter: false },
    { key: 'goalDifference', higherIsBetter: true },
    { key: 'goalDifferenceHomeOrAway', higherIsBetter: true },
    { key: 'ppg', higherIsBetter: true },
    { key: 'ppgLast5', higherIsBetter: true },
    { key: 'ppgHomeOrAway', higherIsBetter: true },
    { key: 'injuryImpact', higherIsBetter: false },
    { key: 'formTrend', higherIsBetter: true },
    { key: 'winPercentage', higherIsBetter: true },
    { key: 'lossPercentage', higherIsBetter: false },
    { key: 'drawPercentage', higherIsBetter: false },
    { key: 'cleansheetPercentage', higherIsBetter: true },
    { key: 'averageRating', higherIsBetter: true },
    { key: 'XGSwing', higherIsBetter: true },
    // --- League Position (Lower is Better) ---
    { key: 'leaguePosition', higherIsBetter: false }, // Lower rank is better
    { key: 'rawPosition', higherIsBetter: false }, // Lower rank is better
    { key: 'homeOrAwayLeaguePosition', higherIsBetter: false }, // Lower rank is better

    // --- Expected Goals & Big Chances ---
    { key: 'XG', higherIsBetter: true },
    { key: 'XGConceded', higherIsBetter: false },
    { key: 'bigChances', higherIsBetter: true },
    { key: 'bigChancesMissed', higherIsBetter: false }, // Fewer missed is better
    { key: 'bigChancesConceded', higherIsBetter: false }, // Fewer conceded is better

    // --- Shooting & Conversion ---
    { key: 'shots', higherIsBetter: true },
    { key: 'sot', higherIsBetter: true },
    { key: 'shotsInsideBox', higherIsBetter: true },
    { key: 'shotsFromOutsideTheBox', higherIsBetter: true },
    { key: 'shotsFromInsideBoxPercentage', higherIsBetter: true },
    { key: 'shotsInsideBoxAgainst', higherIsBetter: false },
    { key: 'shotsFromOutsideTheBoxAgainst', higherIsBetter: false },
    { key: 'shotsInsideBoxPercentAgainst', higherIsBetter: false },
    { key: 'shotsOnTargetAgainst', higherIsBetter: false }, // Fewer shots on target conceded is better
    { key: 'shootingAccuracy', higherIsBetter: true },
    { key: 'goalConversionRate', higherIsBetter: true },
    { key: 'bigChanceConversionRate', higherIsBetter: true },
    { key: 'goalsFromInsideTheBox', higherIsBetter: true },
    { key: 'goalsFromOutsideTheBox', higherIsBetter: true },
    { key: 'fastBreakShots', higherIsBetter: true },
    { key: 'fastBreaksLeadingToShot', higherIsBetter: true },
    { key: 'FreeKickGoals', higherIsBetter: true },

    // --- Attack & Build-up ---
    { key: 'dangerousAttacks', higherIsBetter: true },
    { key: 'possession', higherIsBetter: true },
    { key: 'accuratePassesPercentage', higherIsBetter: true },
    { key: 'accuratePassesOpponentHalf', higherIsBetter: true },
    { key: 'accuratePassesDefensiveHalf', higherIsBetter: true },
    { key: 'accurateCrosses', higherIsBetter: true },
    { key: 'accurateCrossesAgainst', higherIsBetter: false }, // Lower success rate conceded is better
    { key: 'longBallPercentage', higherIsBetter: false }, // Often better to have lower reliance on long balls
    { key: 'accurateLongBallsPercentage', higherIsBetter: true },
    { key: 'accurateLongBallsAgainstPercentage', higherIsBetter: false },
    { key: 'CornersAverage', higherIsBetter: true },
    { key: 'offsides', higherIsBetter: false }, // Fewer offsides is better
    { key: 'dribbleAttempts', higherIsBetter: true },
    { key: 'successfulDribbles', higherIsBetter: true },

    // --- Defensive & Pressing ---
    { key: 'PPDA', higherIsBetter: false }, // Lower PPDA means better pressing
    { key: 'PPAA', higherIsBetter: false }, // Lower PPAA means more efficient attacking
    { key: 'duelsWonPercentage', higherIsBetter: true },
    { key: 'aerialDuelsWonPercentage', higherIsBetter: true },
    { key: 'ballRecovery', higherIsBetter: true },
    { key: 'interceptions', higherIsBetter: true },
    { key: 'tackles', higherIsBetter: true },
    { key: 'errorsLeadingToShotAgainst', higherIsBetter: false }, // Fewer errors is better

    // --- Discipline & Fouls ---
    { key: 'FoulsPerGame', higherIsBetter: false }, // Fewer fouls is better
    { key: 'CardsPerGame', higherIsBetter: false }, // Fewer cards is better
    { key: 'RedCardsPerGame', higherIsBetter: false }, // Fewer cards is better
    { key: 'PenaltiesConceded', higherIsBetter: false }, // Fewer conceded is better

    // --- Betting/Form Specifics ---
    { key: 'BttsPercentage', higherIsBetter: true },
    { key: 'BttsPercentageHomeOrAway', higherIsBetter: true },
  ];

  const calculateComparisonStatusMap = (homeStats, awayStats) => {
    const comparisonMap = {};

    COMPARISON_RULES.forEach(({ key, higherIsBetter }) => {
      const homeValue = homeStats[key];
      const awayValue = awayStats[key];

      // --- SCALAR COMPARISON (Default Case) ---
      if (typeof homeValue !== 'object' || homeValue === null || !Array.isArray(homeValue)) {
        if (homeValue !== undefined && awayValue !== undefined) {
          // Compare simple properties (goals, ppg, etc.)
          comparisonMap[key] = compareStat(homeValue, awayValue, higherIsBetter);
        }
      }

      // --- ARRAY COMPARISON (e.g., 'formTrend') ---
      else if (Array.isArray(homeValue) && Array.isArray(awayValue)) {
        const minLength = Math.min(homeValue.length, awayValue.length);

        for (let i = 0; i < minLength; i++) {
          const homeItem = homeValue[i];
          const awayItem = awayValue[i];
          const arrayKey = `${key}[${i}]`; // e.g., 'formTrend[0]'

          if (homeItem !== undefined && awayItem !== undefined) {
            // Compare the individual array elements
            comparisonMap[arrayKey] = compareStat(homeItem, awayItem, higherIsBetter);
          }
        }
      }
    });

    return comparisonMap;
  };


  const compareStat = (homeValue, awayValue, higherIsBetter) => {
    const home = parseFloat(homeValue);
    const away = parseFloat(awayValue);

    // If both are non-numeric (like 'N/A'), they are equal
    if (isNaN(home) && isNaN(away)) return 'equal';
    // If only one is non-numeric, the other is 'better' or 'worse' depending on the rule
    if (isNaN(home)) return higherIsBetter ? 'worse' : 'better';
    if (isNaN(away)) return higherIsBetter ? 'better' : 'worse';

    if (home === away) return 'equal';

    if (higherIsBetter) {
      return home > away ? 'better' : 'worse';
    } else {
      return home < away ? 'better' : 'worse';
    }
  };
  gameArrayHome.sort((a, b) => b.unixTimestamp - a.unixTimestamp);
  gameArrayAway.sort((a, b) => b.unixTimestamp - a.unixTimestamp);

  const bttsArrayHome = Array.from(gameArrayHome, (x) => x.btts);
  const bttsArrayAway = Array.from(gameArrayAway, (x) => x.btts);

  const homeLeagueStats = getOverallLeagueStats(homeForm);
  const awayLeagueStats = getOverallLeagueStats(awayForm);
  const homeLast5LeagueStats = getLast5LeagueStats(homeForm);
  const awayLast5LeagueStats = getLast5LeagueStats(awayForm);
  const homeOnlyLeagueStats = getHomeAwayLeagueStats(homeForm, "home");
  const awayOnlyLeagueStats = getHomeAwayLeagueStats(awayForm, "away");
  const overallBarChartData = buildComparisonBarChartData(
    getOverallLeagueStatNumbers(homeForm),
    getOverallLeagueStatNumbers(awayForm)
  );
  const last5BarChartData = buildComparisonBarChartData(
    getLast5LeagueStatNumbers(homeForm),
    getLast5LeagueStatNumbers(awayForm),
    { goalDiffDivisor: 5 }
  );
  const homeAwayBarChartData = buildComparisonBarChartData(
    getHomeAwayLeagueStatNumbers(homeForm, "home"),
    getHomeAwayLeagueStatNumbers(awayForm, "away")
  );

  const formDataHome = [];

  formDataHome.push({
    name: game.homeTeam,
    Last5: gameStats.home[2].LastFiveForm,
    LeagueOrAll: gameStats.home[2].LeagueOrAll,
    AverageGoals: homeLeagueStats.goals,
    AverageConceeded: homeLeagueStats.conceeded,
    AverageXG: homeLeagueStats.XG,
    AverageXGConceded: homeLeagueStats.XGConceded,
    AveragePossession: homeLeagueStats.possession,
    AverageShotsOnTarget: homeLeagueStats.sot,
    AverageDangerousAttacks: homeLeagueStats.dangerousAttacks,
    homeOrAway: "Home",
    leaguePosition: homeForm.LeaguePosition,
    Last5PPG: homeForm.PPG,
    SeasonPPG: homeForm.SeasonPPG,
    formRun: homeForm.formRun,
    goalDifference: homeLeagueStats.goalDifference,
    goalDifferenceHomeOrAway: homeLeagueStats.goalDifferenceHomeOrAway,
    CardsTotal: homeForm.CardsTotal || "-",
    CornersAverage: homeLeagueStats.corners || "-",
    FormTextStringHome: formSummaries[0],
    BTTSArray: bttsArrayHome,
    Results: homeForm.resultsAll,
    ResultsHorA: homeForm.resultsHome,
    XGSwing: homeForm.XGChangeRecently,
    styleOfPlayOverall: homeForm.styleOfPlayOverall,
    styleOfPlayHome: homeForm.styleOfPlayHome,
  });

  const formDataAway = [];

  formDataAway.push({
    name: game.awayTeam,
    Last5: gameStats.away[2].LastFiveForm,
    LeagueOrAll: gameStats.away[2].LeagueOrAll,
    AverageGoals: awayLeagueStats.goals,
    AverageConceeded: awayLeagueStats.conceeded,
    AverageXG: awayLeagueStats.XG,
    AverageXGConceded: awayLeagueStats.XGConceded,
    AveragePossession: awayLeagueStats.possession,
    AverageShotsOnTarget: awayLeagueStats.sot,
    AverageDangerousAttacks: awayLeagueStats.dangerousAttacks,
    homeOrAway: "Away",
    leaguePosition: awayForm.LeaguePosition,
    Last5PPG: awayForm.PPG,
    SeasonPPG: awayForm.SeasonPPG,
    formRun: awayForm.formRun,
    goalDifference: awayLeagueStats.goalDifference,
    goalDifferenceHomeOrAway: awayLeagueStats.goalDifferenceHomeOrAway,
    CardsTotal: awayForm.CardsTotal || "-",
    CornersAverage: awayLeagueStats.corners || "-",
    FormTextStringAway: formSummaries[1],
    BTTSArray: bttsArrayAway,
    Results: awayForm.resultsAll,
    ResultsHorA: awayForm.resultsAway,
    XGSwing: awayForm.XGChangeRecently,
    styleOfPlayOverall: awayForm.styleOfPlayOverall,
    styleOfPlayAway: awayForm.styleOfPlayAway,
  });

  const opponentPassesHome = homeTeamStats?.ownHalfPassesTotalAgainst ?? 0;
  const defensiveActionsHome =
    (homeTeamStats?.interceptions ?? 0) +
    (homeTeamStats?.tackles ?? 0) +
    (homeTeamStats?.blockedScoringAttempt ?? 0) +
    (homeTeamStats?.clearances ?? 0);

  const oppositionHalfPassesHome = homeTeamStats?.totalOppositionHalfPasses ?? 0;
  const attackingPlaysHome = (homeTeamStats?.shots ?? 0 + homeTeamStats?.totalCrosses ?? 0 + homeTeamStats?.dribbleAttempts ?? 0 + homeTeamStats?.bigChancesCreated ?? 0);
  const PPDA_valueHome = ratioOrDash(opponentPassesHome, defensiveActionsHome);
  const PPAA_valueHome = ratioOrDash(oppositionHalfPassesHome, attackingPlaysHome);

  // const trueFormColour = getTrueFormColor(homeForm.trueForm);
  const isWorldCupCompetition = API_FORM_ONLY_LEAGUE_IDS.includes(game.leagueID);
  const showXgDiffCharts = !shouldUseApiFormOnly(game);

  const homeAllStatsProps = {
    getCollapsableProps: getCollapsableProps,
    games: "all",
    isWorldCupCompetition,
    style: style,
    homeOrAway: "Home",
    badge: game.homeBadge,
    gameCount: divider,
    last5: formDataHome[0].Last5,
    LeagueOrAll: formDataHome[0].LeagueOrAll,
    className: "KeyStatsHome",
    name: formDataHome[0].name,
    value: homeForm.trueForm,
    color: getTrueFormColor(homeForm.trueForm),
    ...buildTeamAllStatsFields(homeTeamStats, homeLeagueStats, homeForm),
    PPDA: PPDA_valueHome,
    PPAA: PPAA_valueHome,
    leaguePosition: leaguePositionOrDash(
      homeForm.LeaguePosition !== undefined &&
        homeForm.LeaguePosition !== "undefined"
        ? formDataHome[0].leaguePosition
        : undefined
    ),
    rawPosition: leaguePositionOrDash(
      game.homeRawPosition !== undefined &&
        game.homeRawPosition !== "undefined"
        ? game.homeRawPosition
        : undefined
    ),
    homeOrAwayLeaguePosition: leaguePositionOrDash(
      homeForm.homePositionHomeOnly !== undefined &&
        homeForm.homePositionHomeOnly !== "undefined"
        ? homeForm.homePositionHomeOnly
        : undefined
    ),
    winPercentage: statOrDash(homeForm.homePPGAv),
    lossPercentage: statOrDash(game.homeTeamLossPercentage),
    drawPercentage: statOrDash(game.homeTeamDrawPercentage),
    formRun: homeForm.resultsAll,
    BTTSArray: formDataHome[0].BTTSArray,
    Results: formDataHome[0].Results,
    ResultsHorA: formDataHome[0].ResultsHorA,
    FormTextString: formDataHome[0].FormTextStringHome,
    FavouriteRecord: statOrDash(formDataHome[0].FavouriteRecord),
    StyleOfPlay: statOrDash(formDataHome[0].styleOfPlayOverall),
    StyleOfPlayHomeOrAway: statOrDash(formDataHome[0].styleOfPlayHome),
    ppgLast5: statOrDash(homeLast5LeagueStats.ppg),
    ppgHomeOrAway: statOrDash(homeForm.homePPGAv),
    injuryImpact: getTeamInjuryImpactLoss(homeImpacts, game.id, "home"),
  };

  const oppositionPassesAway = awayTeamStats?.ownHalfPassesTotalAgainst ?? 0;
  const defensiveActionsAway =
    (awayTeamStats?.interceptions ?? 0) +
    (awayTeamStats?.tackles ?? 0) +
    (awayTeamStats?.blockedScoringAttempt ?? 0) +
    (awayTeamStats?.clearances ?? 0);

  const oppositionHalfPassesAway = awayTeamStats?.totalOppositionHalfPasses ?? 0;
  const attackingPlaysAway = (awayTeamStats?.shots ?? 0 + awayTeamStats?.totalCrosses ?? 0 + awayTeamStats?.dribbleAttempts ?? 0 + awayTeamStats?.bigChancesCreated ?? 0);
  const PPDA_valueAway = ratioOrDash(oppositionPassesAway, defensiveActionsAway);
  const PPAA_valueAway = ratioOrDash(oppositionHalfPassesAway, attackingPlaysAway);

  const awayAllStatsProps = {
    getCollapsableProps: getCollapsableProps,
    games: "all",
    isWorldCupCompetition,
    style: style,
    homeOrAway: "Away",
    badge: game.awayBadge,
    gameCount: divider,
    last5: formDataAway[0].Last5,
    LeagueOrAll: formDataAway[0].LeagueOrAll,
    className: "KeyStatsAway",
    classNameTwo: "FormStatsAway",
    name: formDataAway[0].name,
    value: awayForm.trueForm,
    color: getTrueFormColor(awayForm.trueForm),
    ...buildTeamAllStatsFields(awayTeamStats, awayLeagueStats, awayForm),
    PPDA: PPDA_valueAway,
    PPAA: PPAA_valueAway,
    leaguePosition: leaguePositionOrDash(
      awayForm.LeaguePosition !== undefined &&
        awayForm.LeaguePosition !== "undefined"
        ? formDataAway[0].leaguePosition
        : undefined
    ),
    rawPosition: leaguePositionOrDash(game.awayRawPosition),
    homeOrAwayLeaguePosition: leaguePositionOrDash(
      awayForm.awayPositionAwayOnly !== undefined &&
        awayForm.awayPositionAwayOnly !== "undefinedundefined"
        ? awayForm.awayPositionAwayOnly
        : undefined
    ),
    winPercentage: statOrDash(awayForm.awayPPGAv),
    lossPercentage: statOrDash(game.awayTeamLossPercentage),
    drawPercentage: statOrDash(game.awayTeamDrawPercentage),
    formRun: awayForm.resultsAll,
    BTTSArray: formDataAway[0].BTTSArray,
    Results: formDataAway[0].Results,
    ResultsHorA: formDataAway[0].ResultsHorA,
    FormTextString: formDataAway[0].FormTextStringAway,
    FavouriteRecord: statOrDash(formDataAway[0].FavouriteRecord),
    StyleOfPlay: statOrDash(formDataAway[0].styleOfPlayOverall),
    StyleOfPlayHomeOrAway: statOrDash(formDataAway[0].styleOfPlayAway),
    ppgLast5: statOrDash(awayLast5LeagueStats.ppg),
    ppgHomeOrAway: statOrDash(awayForm.awayPPGAv),
    injuryImpact: getTeamInjuryImpactLoss(awayImpacts, game.id, "away"),
  };

  function StatsHomeComponent({ getCollapsableProps, homeAllStatsProps, comparisonStatusMap }) {
    if (!homeForm) return null;
    return (
      <div className="flex-childOne">
        <ul style={style}>
          <Stats
            {...homeAllStatsProps}
            getCollapsableProps={getCollapsableProps} // Always pass functions explicitly if they aren't in the map
            comparisonStatusMap={comparisonStatusMap}
          />
        </ul>
      </div>
    );
  }


  const invertStatus = (status) => {
    switch (status) {
      case 'better':
        return 'worse';
      case 'worse':
        return 'better';
      case 'equal': // 'equal' stays the same
      default:
        return status;
    }
  };

  // Function to generate the inverted map
  const getInvertedComparisonMap = (originalMap) => {
    const invertedMap = {};
    for (const key in originalMap) {
      if (Object.hasOwnProperty.call(originalMap, key)) {
        invertedMap[key] = invertStatus(originalMap[key]);
      }
    }
    return invertedMap;
  };

  // Component: StatsAway (Render Away Team Stats)
  function StatsAwayComponent({ getCollapsableProps, awayAllStatsProps, comparisonStatusMap }) {
    const invertedMap = getInvertedComparisonMap(comparisonStatusMap);

    if (!awayForm) return null;
    return (
      <div className="flex-childTwo">
        <ul style={style}>
          <Stats
            {...awayAllStatsProps}
            getCollapsableProps={getCollapsableProps}
            // 2. Pass the inverted map to the Stats component!
            comparisonStatusMap={invertedMap}
          />
        </ul>
      </div>
    );
  }


  const comparisonStatusMap = calculateComparisonStatusMap(
    homeAllStatsProps,
    awayAllStatsProps
  );

  function StatsHomeLast5Component({ comparisonStatusMap }) {
    if (!homeForm) return null;
    return (
      <div className="flex-childOne">
        <ul style={style}>
          <Stats
            comparisonStatusMap={comparisonStatusMap}
            games={"last5"}
            isWorldCupCompetition={isWorldCupCompetition}
            style={style}
            homeOrAway="Home"
            badge={game.homeBadge}
            gameCount={divider}
            // key={formDataHome[0].name}
            last5={formDataHome[0].Last5}
            // homeOrAwayResults={gameArrayHomeTeamHomeGames}
            LeagueOrAll={formDataHome[0].LeagueOrAll}
            className={"KeyStatsHome"}
            name={formDataHome[0].name}
            goals={homeLast5LeagueStats.goals}
            conceeded={homeLast5LeagueStats.conceeded}
            XG={homeLast5LeagueStats.XG}
            XGConceded={homeLast5LeagueStats.XGConceded}
            possession={homeLast5LeagueStats.possession}
            shots={homeLast5LeagueStats.shots}
            sot={homeLast5LeagueStats.sot}
            dangerousAttacks={homeLast5LeagueStats.dangerousAttacks}
            leaguePosition={
              homeForm.LeaguePosition !== undefined &&
                homeForm.LeaguePosition !== "undefined"
                ? formDataHome[0].leaguePosition
                : 0
            }
            rawPosition={
              game.homeRawPosition !== undefined &&
                game.homeRawPosition !== "undefined"
                ? game.homeRawPosition
                : 0
            }
            homeOrAwayLeaguePosition={
              homeForm.homePositionHomeOnly !== undefined &&
                homeForm.homePositionHomeOnly !== "undefined"
                ? homeForm.homePositionHomeOnly
                : 0
            }
            winPercentage={homeForm.homePPGAv ? homeForm.homePPGAv : "N/A"}
            lossPercentage={
              game.homeTeamLossPercentage ? game.homeTeamLossPercentage : "N/A"
            }
            drawPercentage={
              game.homeTeamDrawPercentage ? game.homeTeamDrawPercentage : "N/A"
            }
            ppg={homeLast5LeagueStats.ppg}
            formTrend={[
              formatStatDisplay(homeTenGameAverage),
              formatStatDisplay(homeSixGameAverage),
              formatStatDisplay(homeFiveGameAverage),
            ]}
            formRun={homeForm.resultsAll}
            goalDifference={homeLast5LeagueStats.goalDifference}
            BttsPercentage={homeForm.bttsLast5Percentage}
            BTTSArray={formDataHome[0].BTTSArray}
            Results={formDataHome[0].Results}
            ResultsHorA={formDataHome[0].ResultsHorA}
            CornersAverage={homeLast5LeagueStats.corners}
            FormTextString={formDataHome[0].FormTextStringHome}
          />
        </ul>
      </div>
    );
  }

  // Component: StatsAway (Render Away Team Stats)
  function StatsAwayLast5Component({ comparisonStatusMap }) {
    const invertedMap = getInvertedComparisonMap(comparisonStatusMap);
    if (!awayForm) return null;
    return (
      <div className="flex-childTwo">
        <ul style={style}>
          <Stats
            comparisonStatusMap={invertedMap}
            games={"last5"}
            isWorldCupCompetition={isWorldCupCompetition}
            style={style}
            homeOrAway="Away"
            badge={game.awayBadge}
            gameCount={divider}
            key={formDataAway[0].name}
            last5={formDataAway[0].Last5}
            // homeOrAwayResults={gameArrayAwayTeamAwayGames}
            LeagueOrAll={formDataAway[0].LeagueOrAll}
            className={"KeyStatsAway"}
            classNameTwo={"FormStatsAway"}
            name={formDataAway[0].name}
            goals={awayLast5LeagueStats.goals}
            conceeded={awayLast5LeagueStats.conceeded}
            XG={awayLast5LeagueStats.XG}
            XGConceded={awayLast5LeagueStats.XGConceded}
            //todo add goal diff and btts percentages
            possession={awayLast5LeagueStats.possession}
            rawPosition={game.awayRawPosition ? game.awayRawPosition : 0}
            sot={awayLast5LeagueStats.sot}
            shots={awayLast5LeagueStats.shots}
            dangerousAttacks={awayLast5LeagueStats.dangerousAttacks}
            leaguePosition={
              awayForm.LeaguePosition !== undefined &&
                awayForm.LeaguePosition !== "undefined"
                ? formDataAway[0].leaguePosition
                : 0
            }
            homeOrAwayLeaguePosition={
              awayForm.awayPositionAwayOnly !== undefined &&
                awayForm.awayPositionAwayOnly !== "undefinedundefined"
                ? awayForm.awayPositionAwayOnly
                : 0
            }
            winPercentage={awayForm.awayPPGAv ? awayForm.awayPPGAv : "N/A"}
            lossPercentage={
              game.awayTeamLossPercentage ? game.awayTeamLossPercentage : "N/A"
            }
            drawPercentage={
              game.awayTeamDrawPercentage ? game.awayTeamDrawPercentage : "N/A"
            }
            ppg={awayLast5LeagueStats.ppg}
            formTrend={[
              formatStatDisplay(awayTenGameAverage),
              formatStatDisplay(awaySixGameAverage),
              formatStatDisplay(awayFiveGameAverage),
            ]}
            formRun={awayForm.resultsAll}
            goalDifference={awayLast5LeagueStats.goalDifference}
            BttsPercentage={awayForm.bttsLast5Percentage}
            BTTSArray={formDataAway[0].BTTSArray}
            Results={formDataAway[0].Results}
            ResultsHorA={formDataAway[0].ResultsHorA}
            CornersAverage={awayLast5LeagueStats.corners}
          />
        </ul>
      </div>
    );
  }

  const getLast5ComparisonData = (form, isHome = true) => {
    const stats = getLast5LeagueStats(form);
    return {
      goals: stats.goals,
      conceeded: stats.conceeded,
      XG: stats.XG,
      XGConceded: stats.XGConceded,
      possession: stats.possession,
      shots: stats.shots,
      sot: stats.sot,
      dangerousAttacks: stats.dangerousAttacks,
      ppg: stats.ppg,
      goalDifference: stats.goalDifference,
      BttsPercentage: form.bttsLast5Percentage,
      CornersAverage: stats.corners,
      // Add these if your COMPARISON_RULES support array comparison for formTrend
      formTrend: isHome
        ? [homeTenGameAverage, homeSixGameAverage, homeFiveGameAverage]
        : [awayTenGameAverage, awaySixGameAverage, awayFiveGameAverage],
    };
  };

  const homeLast5Data = getLast5ComparisonData(homeForm, true);
  const awayLast5Data = getLast5ComparisonData(awayForm, false);

  const last5ComparisonMap = calculateComparisonStatusMap(
    homeLast5Data,
    awayLast5Data
  );

  function StatsHomeOnlyComponent({ comparisonStatusMap }) {
    if (!homeForm) return null;
    return (
      <div className="flex-childOne">
        <ul style={style}>
          <Stats
            comparisonStatusMap={comparisonStatusMap}
            games={"hOrA"}
            style={style}
            homeOrAway="Home"
            badge={game.homeBadge}
            gameCount={divider}
            key={formDataHome[0].name}
            last5={formDataHome[0].Last5}
            // homeOrAwayResults={gameArrayHomeTeamHomeGames}
            LeagueOrAll={formDataHome[0].LeagueOrAll}
            className={"KeyStatsHome"}
            name={formDataHome[0].name}
            goals={homeOnlyLeagueStats.goals}
            conceeded={homeOnlyLeagueStats.conceeded}
            XG={homeOnlyLeagueStats.XG}
            XGConceded={homeOnlyLeagueStats.XGConceded}
            possession={homeOnlyLeagueStats.possession}
            sot={homeOnlyLeagueStats.sot}
            shots={homeOnlyLeagueStats.shots}
            dangerousAttacks={homeOnlyLeagueStats.dangerousAttacks}
            leaguePosition={
              homeForm.homePositionHomeOnly !== undefined &&
                homeForm.homePositionHomeOnly !== "undefined"
                ? formDataHome[0].leaguePosition
                : 0
            }
            rawPosition={
              game.homeRawPosition !== undefined &&
                game.homeRawPosition !== "undefined"
                ? game.homeRawPosition
                : 0
            }
            homeOrAwayLeaguePosition={
              homeForm.homePositionHomeOnly !== undefined &&
                homeForm.homePositionHomeOnly !== "undefined"
                ? homeForm.homePositionHomeOnly
                : 0
            }
            winPercentage={homeForm.homePPGAv ? homeForm.homePPGAv : "N/A"}
            formTrend={[
              formatStatDisplay(homeTenGameAverage),
              formatStatDisplay(homeSixGameAverage),
              formatStatDisplay(homeFiveGameAverage),
            ]}
            formRun={homeForm.resultsAll}
            goalDifference={homeOnlyLeagueStats.goalDifference}
            goalDifferenceHomeOrAway={homeOnlyLeagueStats.goalDifference}
            BttsPercentage={homeForm.bttsHomePercentage}
            BTTSArray={formDataHome[0].BTTSArray}
            // Results={formDataHome[0].Results}
            ResultsHorA={formDataHome[0].ResultsHorA}
            CardsTotal={formDataHome[0].CardsTotal}
            CornersAverage={homeOnlyLeagueStats.corners}
            ppg={homeOnlyLeagueStats.ppg}
            ScoredBothHalvesPercentage={
              formDataHome[0].ScoredBothHalvesPercentage
            }
            FormTextString={formDataHome[0].FormTextStringHome}
            FavouriteRecord={formDataHome[0].FavouriteRecord}
            StyleOfPlay={formDataHome[0].styleOfPlayOverall}
            StyleOfPlayHomeOrAway={formDataHome[0].styleOfPlayHome}
          />
        </ul>
      </div>
    );
  }

  // Component: StatsAway (Render Away Team Stats)
  function StatsAwayOnlyComponent({ comparisonStatusMap }) {
    const invertedMap = getInvertedComparisonMap(comparisonStatusMap);

    if (!awayForm) return null;
    return (
      <div className="flex-childTwo">
        <ul style={style}>
          <Stats
            comparisonStatusMap={invertedMap}
            games={"hOrA"}
            style={style}
            homeOrAway="Away"
            badge={game.awayBadge}
            gameCount={divider}
            key={formDataAway[0].name}
            last5={formDataAway[0].Last5}
            // homeOrAwayResults={gameArrayAwayTeamAwayGames}
            LeagueOrAll={formDataAway[0].LeagueOrAll}
            className={"KeyStatsAway"}
            classNameTwo={"FormStatsAway"}
            name={formDataAway[0].name}
            goals={awayOnlyLeagueStats.goals}
            conceeded={awayOnlyLeagueStats.conceeded}
            XG={awayOnlyLeagueStats.XG}
            XGConceded={awayOnlyLeagueStats.XGConceded}
            //todo add goal diff and btts percentages
            possession={awayOnlyLeagueStats.possession}
            rawPosition={game.awayRawPosition ? game.awayRawPosition : 0}
            sot={awayOnlyLeagueStats.sot}
            shots={awayOnlyLeagueStats.shots}
            dangerousAttacks={awayOnlyLeagueStats.dangerousAttacks}
            leaguePosition={
              awayForm.awayPosition !== undefined &&
                awayForm.awayPosition !== "undefined"
                ? formDataAway[0].leaguePosition
                : 0
            }
            homeOrAwayLeaguePosition={
              awayForm.awayPositionAwayOnly !== undefined &&
                awayForm.awayPositionAwayOnly !== "undefinedundefined"
                ? awayForm.awayPositionAwayOnly
                : 0
            }
            winPercentage={awayForm.awayPPGAv ? awayForm.awayPPGAv : "N/A"}
            formTrend={[
              formatStatDisplay(awayTenGameAverage),
              formatStatDisplay(awaySixGameAverage),
              formatStatDisplay(awayFiveGameAverage),
            ]}
            formRun={awayForm.resultsAll}
            goalDifference={awayOnlyLeagueStats.goalDifference}
            goalDifferenceHomeOrAway={awayOnlyLeagueStats.goalDifference}
            BttsPercentage={awayForm.bttsHomePercentage}
            BTTSArray={formDataAway[0].BTTSArray}
            // Results={formDataAway[0].Results}
            ResultsHorA={formDataAway[0].ResultsHorA}
            CardsTotal={formDataAway[0].CardsTotal}
            CornersAverage={awayOnlyLeagueStats.corners}
            ppg={awayOnlyLeagueStats.ppg}
            ScoredBothHalvesPercentage={
              formDataAway[0].ScoredBothHalvesPercentage
            }
            FormTextString={formDataAway[0].FormTextStringAway}
            FavouriteRecord={formDataAway[0].FavouriteRecord}
            StyleOfPlay={formDataAway[0].styleOfPlayOverall}
            StyleOfPlayHomeOrAway={formDataAway[0].styleOfPlayAway}
          />
        </ul>
      </div>
    );
  }


  const getHorAComparisonData = (form, isHome = true) => {
    const stats = getHomeAwayLeagueStats(form, isHome ? "home" : "away");
    return {
      goals: stats.goals,
      conceeded: stats.conceeded,
      XG: stats.XG,
      XGConceded: stats.XGConceded,
      possession: stats.possession,
      shots: stats.shots,
      sot: stats.sot,
      dangerousAttacks: stats.dangerousAttacks,
      ppg: stats.ppg,
      goalDifference: stats.goalDifference,
      BttsPercentage: `${isHome ? form.bttsHomePercentage : form.bttsAwayPercentage}`,
      CornersAverage: stats.corners,
      winPercentage: stats.ppg,
      // Add these if your COMPARISON_RULES support array comparison for formTrend
      formTrend: isHome
        ? [homeTenGameAverage, homeSixGameAverage, homeFiveGameAverage]
        : [awayTenGameAverage, awaySixGameAverage, awayFiveGameAverage],
    };
  };

  const homeOnlyData = getHorAComparisonData(homeForm, true);
  const awayOnlyData = getHorAComparisonData(awayForm, false);

  const hOrAComparisonMap = calculateComparisonStatusMap(
    homeOnlyData,
    awayOnlyData
  );



  const overviewHome = gameArrayHome.slice(0, 10).map((game) => (
    <div>
      <Collapsable
        key={`${game.homeTeam}v${game.awayTeam}`}
        classNameButton="ResultButton"
        buttonText={
          <div className={`ResultRowOverviewSmall${game.won}`}>
            <div className="columnOverviewHomeSmall">{game.homeTeam}</div>
            <span className="columnOverviewScoreSmall">
              {game.homeGoals} : {game.awayGoals}
            </span>
            <div className="columnOverviewAwaySmall">{game.awayTeam}</div>
          </div>
        }
        element={singleResult(game)}
      />
    </div>
  ));

  const overviewAway = gameArrayAway.slice(0, 10).map((game) => (
    <div>
      <Collapsable
        classNameButton="ResultButton"
        buttonText={
          <div className={`ResultRowOverviewSmall${game.won}`}>
            <div className="columnOverviewHomeSmall">{game.homeTeam}</div>
            <span className="columnOverviewScoreSmall">
              {game.homeGoals} : {game.awayGoals}
            </span>
            <div className="columnOverviewAwaySmall">{game.awayTeam}</div>
          </div>
        }
        element={singleResult(game)}
      />
    </div>
  ));

  const formDataMatch = [];

  formDataMatch.push({
    btts: game.btts_potential,
  });


  function getPointsFromGames(formArr) {
    const pairings = {
      W: 3,
      D: 1,
      L: 0,
    };
    let newArr = [];
    let arrayOfIndividualPoints = [];
    let sum = 0;

    for (let i = 0; i < formArr.length; i++) {
      sum = sum + pairings[formArr[i]];
      newArr.push(sum);
      arrayOfIndividualPoints.push(pairings[formArr[i]]);
    }
    return [newArr, arrayOfIndividualPoints];
  }

  let time = game.time;

  if (homeForm.last3Points === undefined) {
    homeForm.last3Points = getPointsFromLastX(homeForm.lastThreeForm);

    homeForm.last5Points = getPointsFromLastX(homeForm.LastFiveForm);

    homeForm.last6Points = getPointsFromLastX(homeForm.LastSixForm);

    homeForm.last10Points = getPointsFromLastX(homeForm.LastTenForm);

    homeForm.homePPGame = getPointsFromLastX(homeForm.resultsHome);

    awayForm.last3Points = getPointsFromLastX(awayForm.lastThreeForm);

    awayForm.last5Points = getPointsFromLastX(awayForm.LastFiveForm);

    awayForm.last6Points = getPointsFromLastX(awayForm.LastSixForm);

    awayForm.last10Points = getPointsFromLastX(awayForm.LastTenForm);

    awayForm.awayPPGame = getPointsFromLastX(awayForm.resultsAway);
  }

  const [showAIInsights, setShowAIInsights] = useState(false);

  let formArrayHome;
  let formArrayAway;
  let chartType;

  // Side Effect: Initialize component


  // Get all necessary data

  useEffect(() => {
    // useEffect to fetch and process game data based on props
    async function fetchData() {
      if (game.status === "void") return; // Exit if game is void

      if (!allForm || !allLeagueResultsArrayOfObjects) {
        // return;
      }

      let index = 2;
      let gameStats = allForm.find((match) => match.id === game.id);
      if (!gameStats) {
        console.warn("No game stats found for game id:", game.id);
        return;
      }

      try {
        const leagueFixtures = getLeagueFixturesByLeagueId(
          allLeagueResultsArrayOfObjects,
          gameStats.leagueId
        );
        const resultHome = leagueFixtures.filter(
          (game) =>
            game.home_name === gameStats.home.teamName ||
            game.away_name === gameStats.home.teamName
        );

        const resultHomeOnly = leagueFixtures.filter(
          (game) => game.home_name === gameStats.home.teamName
        );
        const resultAway = leagueFixtures.filter(
          (game) =>
            game.away_name === gameStats.away.teamName ||
            game.home_name === gameStats.away.teamName
        );

        const resultAwayOnly = leagueFixtures.filter(
          (game) => game.away_name === gameStats.away.teamName
        );

        const homeForm = gameStats.home[index];
        const awayForm = gameStats.away[index];
        let id = game.id;

        const attackingMetricsHome = homeForm.attackingMetrics
        const attackingMetricsHomeLast5 = homeForm.attackingMetricsHomeLast5
        const attackingMetricsHomeOnly = homeForm.attackingMetricsHomeOnly

        const attackingMetricsAway = awayForm.attackingMetrics
        const attackingMetricsAwayLast5 = awayForm.attackingMetricsAwayLast5
        const attackingMetricsAwayOnly = awayForm.attackingMetricsAwayOnly

        const defensiveMetricsHome = homeForm.defensiveMetrics
        console.log(defensiveMetricsHome)
        const defensiveMetricsHomeLast5 = homeForm.defensiveMetricsHomeLast5
        const defensiveMetricsHomeOnly = homeForm.defensiveMetricsHomeOnly

        const defensiveMetricsAway = awayForm.defensiveMetrics
        const defensiveMetricsAwayLast5 = awayForm.defensiveMetricsAwayLast5
        const defensiveMetricsAwayOnly = awayForm.defensiveMetricsAwayOnly

        const strengthOptions =
          homeForm.apiFormOnly || awayForm.apiFormOnly
            ? { international: true }
            : {};

        const attackH = await calculateAttackingStrength(
          attackingMetricsHome,
          false,
          strengthOptions
        );
        const attackHLast5 = await calculateAttackingStrength(
          attackingMetricsHomeLast5,
          true,
          strengthOptions
        );
        const attackHOnly = await calculateAttackingStrength(
          attackingMetricsHomeOnly,
          false,
          strengthOptions
        );

        const defenceH = await calculateDefensiveStrength(
          defensiveMetricsHome,
          false,
          strengthOptions
        );
        const defenceHLast5 = await calculateDefensiveStrength(
          defensiveMetricsHomeLast5,
          true,
          strengthOptions
        );
        const defenceHOnly = await calculateDefensiveStrength(
          defensiveMetricsHomeOnly,
          false,
          strengthOptions
        );

        const attackA = await calculateAttackingStrength(
          attackingMetricsAway,
          false,
          strengthOptions
        );
        const attackALast5 = await calculateAttackingStrength(
          attackingMetricsAwayLast5,
          true,
          strengthOptions
        );
        const attackAOnly = await calculateAttackingStrength(
          attackingMetricsAwayOnly,
          false,
          strengthOptions
        );

        const defenceA = await calculateDefensiveStrength(
          defensiveMetricsAway,
          false,
          strengthOptions
        );
        const defenceALast5 = await calculateDefensiveStrength(
          defensiveMetricsAwayLast5,
          true,
          strengthOptions
        );
        const defenceAOnly = await calculateDefensiveStrength(
          defensiveMetricsAwayOnly,
          false,
          strengthOptions
        );

        const possH = await calculateMetricStrength(
          "averagePossession",
          homeForm.AveragePossessionOverall
        );
        const possHLast5 = await calculateMetricStrength(
          "averagePossession",
          homeForm.avPosessionLast5
        );
        const possHOnly = await calculateMetricStrength(
          "averagePossession",
          homeForm.avgPossessionHome
        );

        const possA = await calculateMetricStrength(
          "averagePossession",
          awayForm.AveragePossessionOverall
        );
        const possALast5 = await calculateMetricStrength(
          "averagePossession",
          awayForm.avPosessionLast5
        );
        const possAOnly = await calculateMetricStrength(
          "averagePossession",
          awayForm.avgPossessionAway
        );




        // "Directness",
        // "Attacking precision",
        const XGForH = await calculateMetricStrength(
          "xgFor",
          homeForm.XGOverall
        );


        const XGForA = await calculateMetricStrength(
          "xgFor",
          awayForm.XGOverall
        );


        const XGAgH = await calculateMetricStrength(
          "xgAgainst",
          3 - homeForm.XGAgainstAvgOverall
        );


        const XGAgA = await calculateMetricStrength(
          "xgAgainst",
          3 - awayForm.XGAgainstAvgOverall
        );


        const directnessHome = await calculateMetricStrength(
          "directnessOverall",
          homeForm.directnessOverall
        );


        const directnessAway = await calculateMetricStrength(
          "directnessOverall",
          awayForm.directnessOverall
        );


        const accuracyHome = await calculateMetricStrength(
          "accuracyOverall",
          homeForm.avgShotValueChart
        );

        const accuracyHomeLast5 = await calculateMetricStrength(
          "accuracyOverall",
          homeForm.avgShotValueLast5Chart
        );

        const accuracyHomeOnly = await calculateMetricStrength(
          "accuracyOverall",
          homeForm.avgShotValueHomeChart
        );

        const accuracyAway = await calculateMetricStrength(
          "accuracyOverall",
          awayForm.avgShotValueChart
        );

        const accuracyAwayLast5 = await calculateMetricStrength(
          "accuracyOverall",
          awayForm.avgShotValueLast5Chart
        );

        const accuracyAwayOnly = await calculateMetricStrength(
          "accuracyOverall",
          awayForm.avgShotValueAwayChart
        );

        const home5GA = await getPointAverage(homeForm.last5Points, 5);

        const home6GA = await getPointAverage(homeForm.last6Points, 6);

        const home10GA = await getPointAverage(homeForm.last10Points, 10);

        const away5GA = await getPointAverage(awayForm.last5Points, 5);

        const away6GA = await getPointAverage(awayForm.last6Points, 6);

        const away10GA = await getPointAverage(awayForm.last10Points, 10);

        homeForm.homePPGAv = await getPointAverage(
          homeForm.homePPGame,
          homeForm.resultsHome.length
        );
        homeForm.tenGameAv = home10GA;
        homeForm.fiveGameAv = home5GA;

        awayForm.awayPPGAv = await getPointAverage(
          awayForm.awayPPGame,
          awayForm.resultsAway.length
        );
        awayForm.tenGameAv = away10GA;
        awayForm.fiveGameAv = away5GA;

        // Set calculated strengths and averages directly, as hooks cannot be used here
        setHomeAttackStrength(attackH);
        setHomeAttackStrengthLast5(attackHLast5);
        setHomeOnlyAttackStrength(attackHOnly);
        setHomeDefenceStrength(defenceH);
        setHomeDefenceStrengthLast5(defenceHLast5);
        setHomeOnlyDefenceStrength(defenceHOnly);
        setAwayAttackStrength(attackA);
        setAwayAttackStrengthLast5(attackALast5);
        setAwayOnlyAttackStrength(attackAOnly);
        setAwayDefenceStrength(defenceA);
        setAwayDefenceStrengthLast5(defenceALast5);
        setAwayOnlyDefenceStrength(defenceAOnly);
        setHomePossessionStrength(possH);
        setHomePossessionStrengthLast5(possHLast5);
        setHomeOnlyPossessionStrength(possHOnly);
        setAwayPossessionStrength(possA);
        setAwayPossessionStrengthLast5(possALast5);
        setAwayOnlyPossessionStrength(possAOnly);
        setHomeXGForStrength(XGForH);
        setAwayXGForStrength(XGForA);
        setHomeXGAgainstStrength(XGAgH);
        setAwayXGAgainstStrength(XGAgA);
        setHomeDirectnessStrength(directnessHome);
        setAwayDirectnessStrength(directnessAway);
        setHomeAccuracyOverallStrength(accuracyHome);
        setHomeAccuracyOverallStrengthLast5(accuracyHomeLast5);
        setHomeOnlyAccuracyOverallStrength(accuracyHomeOnly);
        setAwayAccuracyOverallStrength(accuracyAway);
        setAwayAccuracyOverallStrengthLast5(accuracyAwayLast5);
        setAwayOnlyAccuracyOverallStrength(accuracyAwayOnly);
        setHomeFiveGameAverage(home5GA);
        setHomeSixGameAverage(home6GA);
        setHomeTenGameAverage(home10GA);
        setAwayFiveGameAverage(away5GA);
        setAwaySixGameAverage(away6GA);
        setAwayTenGameAverage(away10GA);


        if (homeForm.fiveGameAv && game.matches_completed_minimum > 4) {
          const formTextStringHome = await GenerateFormSummary(
            homeForm,
            homeForm.tenGameAv,
            homeForm.fiveGameAv
          );
          const formTextStringAway = await GenerateFormSummary(
            awayForm,
            awayForm.tenGameAv,
            awayForm.fiveGameAv
          );
          setFormSummary([formTextStringHome, formTextStringAway]);
        }

        // const homeTeam = game.homeTeam;
        // const awayTeam = game.awayTeam;
        // console.log(homeForm);

        // setTime(game.time);
        // setTeam1(homeTeam);
        // setTeam2(awayTeam);
        // setHomeGoals(game.homeGoals);
        // setAwayGoals(game.awayGoals);

        if (id === "1") {
        }
      } catch (e) {
        console.log(e);
      } finally {
        setIsLoading(false);
        setHasCompleteData(
          game.completeData === true &&
          gameStats?.home[index].completeData === true
        );

        setFirstRenderDone(true);
      }
    }
    if (!firstRenderDone) {
      fetchData();
    }
  }, [
    awayFiveGameAverage,
    firstRenderDone,
    awayTenGameAverage,
    game.completeData,
    game.id,
    game.status,
    homeFiveGameAverage,
    homeTenGameAverage,
  ]); // Dependencies for the useCallback



  // AI Insights Generation

  function fetchBasicTable(id) {
    return basicTableArray.find(
      (item) => String(item.id) === String(id)
    );
  }

  const generateAIInsights = useCallback(
    async (gameId, streak, oddsData, homeTeamStats, awayTeamStats, homePlayerData, awayPlayerData, homeMissingPlayersImpact, awayMissingPlayersImpact, homeLineupList, awayLineupList, ranksHome, ranksAway, futureFixturesHome, futureFixturesAway, homeManager, awayManager, homeTeamPlayerStats, awayTeamPlayerStats) => {
      setIsLoading(true);

      try {
        const table = fetchBasicTable(game.leagueID);
        const leagueTable = table?.table ?? null;
        const leagueId = table?.id ?? game.leagueID;

        if (!leagueId) {
          throw new Error("League data unavailable for this fixture.");
        }

        const leagueStatisticsResponse = await fetch(
          `${process.env.REACT_APP_EXPRESS_SERVER}leagueStats/${leagueId}`
        );

        if (!leagueStatisticsResponse.ok) {
          throw new Error(
            `League stats request failed (${leagueStatisticsResponse.status})`
          );
        }

        const stats = await leagueStatisticsResponse.json();
        const statistics = stats.data;
        const roundType = statistics?.format;
        const progress = statistics?.progress;
        const totalGames = statistics
          ? (statistics.totalMatches * 2) / statistics.clubNum
          : undefined;
        const AIPayload = {
          competition: game.leagueDesc,
          totalLeagueGames: totalGames?.toFixed(0),
          gameweek: game.matches_completed_minimum + 1,
          gameType: roundType,
          leagueTable: leagueTable,
          seasonProgressPercent: progress,
          venue: game.stadium,
          odds: oddsData,
          teamStreakDataFromAllCompetitions: streak,
          homeTeam: {
            homeTeamName: game.homeTeam,
            manager: homeManager,
            homeLeaguePosition: homeForm?.LeaguePosition,
            homeTeamResultsLast5: homeForm?.allTeamResults?.slice(0, 5),
            performanceStats: homeTeamStats,
            players: homeTeamPlayerStats,
            competitionRankings: ranksHome,
            missingPlayers: homeMissingPlayersImpact,
            predictedLineup: homeLineupList,
            homeAttackingStats: homeForm?.attackingMetrics,
            homeDefensiveStats: homeForm?.defensiveMetrics,
          },
          awayTeam: {
            awayTeamName: game.awayTeam,
            manager: awayManager,
            awayLeaguePosition: awayForm?.LeaguePosition,
            awayTeamResultsLast5: awayForm?.allTeamResults?.slice(0, 5),
            performanceStats: awayTeamStats,
            players: awayTeamPlayerStats,
            competitionRankings: ranksAway,
            missingPlayers: awayMissingPlayersImpact,
            predictedLineup: awayLineupList,
            awayAttackingStats: awayForm?.attackingMetrics,
            awayDefensiveStats: awayForm?.defensiveMetrics,
          },
        };

        console.log("AI Payload:", AIPayload);

        const response = await fetch(
          `${process.env.REACT_APP_EXPRESS_SERVER}gemini/${gameId}`,
          {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify(AIPayload),
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const jsonData = await response.json();
        console.log("AI Match Preview Data:", jsonData);
        setAiMatchPreview(jsonData);

        // Store predicted score in backend array
        await fetch(`${process.env.REACT_APP_EXPRESS_SERVER}predictedScores2`, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            gameId,
            homeGoalsPrediction: parseInt(jsonData.Guide?.HomeGoalsPrediction, 10),
            awayGoalsPrediction: parseInt(jsonData.Guide?.AwayGoalsPrediction, 10),
          }),
        });

      } catch (error) {
        console.error("AI preview error:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [game, homeForm, awayForm]
  );

  // Function to format the AI Match Preview text with newlines
  const formatAIPreview = (text) => {
    if (!text) return "";
    return text.split(". ").join(".\n");
  };

  const renderAIKeyPlayersList = (roles) => (
    <ul className="AIKeyPlayersList">
      {roles.map((role, index) => {
        const colonIndex = role.indexOf(":");
        const name =
          colonIndex === -1 ? role.trim() : role.slice(0, colonIndex).trim();
        const description =
          colonIndex === -1 ? "" : role.slice(colonIndex + 1).trim();
        return (
          <li key={index} className="AIKeyPlayerItem">
            <strong className="AIKeyPlayerName">{name}</strong>
            {description && (
              <span className="AIKeyPlayerRole">{description}</span>
            )}
          </li>
        );
      })}
    </ul>
  );

  const AIOutput = useMemo(() => {
    if (!aiMatchPreview) return null;

    return (
      <>
        <h2>Preview</h2>
        {aiMatchPreview.matchPreview?.map((text, index) => (
          <div key={index} className="AIMatchPreview">
            {formatAIPreview(text)}
          </div>
        ))}

        {/* // Properties: "CorrectScore", "Over2.5Goals" (yes or no), "MostCards" (team name), "MostCorners" (team name), "MostShotsOnTarget" (team name), "AnytimeGoalscorer" (player name), "ToBeCarded" (player name) */}

        <div className="AIMatchPreviewCard">
          <h2>{`${aiMatchPreview?.homeTeam?.teamName} vs ${aiMatchPreview?.awayTeam?.teamName} AI Tips`}</h2>
          <ul>
            <li>
              <strong>Correct Score:</strong> {aiMatchPreview.Guide.HomeGoalsPrediction} - {aiMatchPreview.Guide.AwayGoalsPrediction}
            </li>
            <li>
              <strong>Anytime Goalscorer:</strong> {aiMatchPreview.Guide.AnytimeGoalscorer}
            </li>
            <li>
              <strong>Most Cards:</strong> {aiMatchPreview.Guide.MostCards}
            </li>
            <li>
              <strong>Most Corners:</strong> {aiMatchPreview.Guide.MostCorners}
            </li>
            <li>
              <strong>Most Shots On Target:</strong> {aiMatchPreview.Guide.MostShotsOnTarget}
            </li>
            <li>
              <strong>To Be Carded:</strong> {aiMatchPreview.Guide.ToBeCarded}
            </li>
          </ul>
          <i>(may not reflect the view of Soccer Stats Hub)</i>
        </div>

        {(aiMatchPreview?.homeTeam?.keyPlayerRoles?.length > 0 ||
          aiMatchPreview?.awayTeam?.keyPlayerRoles?.length > 0) && (
          <>
            <h2>Key Player Overviews</h2>
            <div className="AIContainer AIKeyPlayers">
              {aiMatchPreview?.homeTeam?.keyPlayerRoles?.length > 0 && (
                <div className="HomeAIInsights">
                  <h6 className="TeamName">
                    {aiMatchPreview.homeTeam.teamName}
                  </h6>
                  {renderAIKeyPlayersList(aiMatchPreview.homeTeam.keyPlayerRoles)}
                </div>
              )}
              {aiMatchPreview?.awayTeam?.keyPlayerRoles?.length > 0 && (
                <div className="AwayAIInsights">
                  <h6 className="TeamName">
                    {aiMatchPreview.awayTeam.teamName}
                  </h6>
                  {renderAIKeyPlayersList(aiMatchPreview.awayTeam.keyPlayerRoles)}
                </div>
              )}
            </div>
          </>
        )}

        <h2>Ratings and Styles</h2>
        <div className="AIContainer">
          <div className="HomeAIInsights">
            <h6 className="TeamName">{aiMatchPreview?.homeTeam?.teamName}</h6>
            <div className="StarRating"><span className="StarRatingHeader">Attack <StarRating rating={aiMatchPreview?.homeTeam?.ratings?.Attack} /></span></div>
            <div className="StarRating"><span className="StarRatingHeader">Defence <StarRating rating={aiMatchPreview?.homeTeam?.ratings?.Defence} /></span></div>
            <div className="StarRating"><span className="StarRatingHeader">Directness <StarRating rating={aiMatchPreview?.homeTeam?.ratings?.Directness} /></span></div>
            <div className="StarRating"><span className="StarRatingHeader">Possession <StarRating rating={aiMatchPreview?.homeTeam?.ratings?.Possession} /></span></div>
            <div className="StarRating"><span className="StarRatingHeader">Pressing <StarRating rating={aiMatchPreview?.homeTeam?.ratings?.Pressing} /></span></div>
            <div className="StarRating"><span className="StarRatingHeader">Accuracy <StarRating rating={aiMatchPreview?.homeTeam?.ratings?.Accuracy} /></span></div>
            <div className="StarRating"><span className="StarRatingHeader">Set Pieces <StarRating rating={aiMatchPreview?.homeTeam?.ratings?.SetPieces} /></span></div>
            <div className="StarRating"><span className="StarRatingHeader">Discipline <StarRating rating={aiMatchPreview?.homeTeam?.ratings?.Discipline} /></span></div>
            <div className="StarRating"><span className="StarRatingHeader">Last Game <StarRating rating={aiMatchPreview?.homeTeam?.ratings?.LastMatchPerformance} /></span></div>
            <div className="StarRating"><span className="StarRatingHeader">Overall <StarRating rating={aiMatchPreview?.homeTeam?.ratings?.Overall} /></span></div>
            <div className="TeamStyle">{aiMatchPreview?.homeTeam?.style}</div>
            <ul className="Strengths">
              {aiMatchPreview?.homeTeam?.strengths?.map((strength, index) => (
                <li key={index}>{strength}</li>
              ))}
            </ul>
            <ul className="Weaknesses">
              {aiMatchPreview?.homeTeam?.weaknesses?.map((weakness, index) => (
                <li key={index}>{weakness}</li>
              ))}
            </ul>
          </div>
          <div className="AwayAIInsights">
            <h6 className="TeamName">{aiMatchPreview?.awayTeam?.teamName}</h6>
            <div className="StarRating"><span className="StarRatingHeader">Attack <StarRating rating={aiMatchPreview?.awayTeam?.ratings?.Attack} /></span></div>
            <div className="StarRating"><span className="StarRatingHeader">Defence <StarRating rating={aiMatchPreview?.awayTeam?.ratings?.Defence} /></span></div>
            <div className="StarRating"><span className="StarRatingHeader">Directness <StarRating rating={aiMatchPreview?.awayTeam?.ratings?.Directness} /></span></div>
            <div className="StarRating"><span className="StarRatingHeader">Possession <StarRating rating={aiMatchPreview?.awayTeam?.ratings?.Possession} /></span></div>
            <div className="StarRating"><span className="StarRatingHeader">Pressing <StarRating rating={aiMatchPreview?.awayTeam?.ratings?.Pressing} /></span></div>
            <div className="StarRating"><span className="StarRatingHeader">Accuracy <StarRating rating={aiMatchPreview?.awayTeam?.ratings?.Accuracy} /></span></div>
            <div className="StarRating"><span className="StarRatingHeader">Set Pieces <StarRating rating={aiMatchPreview?.awayTeam?.ratings?.SetPieces} /></span></div>
            <div className="StarRating"><span className="StarRatingHeader">Discipline <StarRating rating={aiMatchPreview?.awayTeam?.ratings?.Discipline} /></span></div>
            <div className="StarRating"><span className="StarRatingHeader">Last Game <StarRating rating={aiMatchPreview?.awayTeam?.ratings?.LastMatchPerformance} /></span></div>
            <div className="StarRating"><span className="StarRatingHeader">Overall <StarRating rating={aiMatchPreview?.awayTeam?.ratings?.Overall} /></span></div>
            <div className="TeamStyle">{aiMatchPreview?.awayTeam?.style}</div>
            <ul className="Strengths">
              {aiMatchPreview?.awayTeam?.strengths?.map((strength, index) => (
                <li key={index}>{strength}</li>
              ))}
            </ul>
            <ul className="Weaknesses">
              {aiMatchPreview?.awayTeam?.weaknesses?.map((weakness, index) => (
                <li key={index}>{weakness}</li>
              ))}
            </ul>
          </div>
        </div>
      </>
    );
  }, [aiMatchPreview]);

  let [formPointsHome, testArrayHome] = getPointsFromGames(
    gameStats.home[2].WDLRecord
  );
  let [formPointsAway, testArrayAway] = getPointsFromGames(
    gameStats.away[2].WDLRecord
  );

  if (formPointsHome.length > 1) {
    formArrayHome = formPointsHome;
    formArrayAway = formPointsAway;
    chartType = "Points over time";
  } else {
    formArrayHome = [
      homeTenGameAverage,
      homeSixGameAverage,
      homeFiveGameAverage,
    ];
    formArrayAway = [
      awayTenGameAverage,
      awaySixGameAverage,
      awayFiveGameAverage,
    ];
    chartType = "Rolling average points over last 10";
  }
  const UserTips = ({ game, userTips, handleToggleTip, userDetail }) => {

    const isSelected = (type) => {
      // Use 'userTips' (the prop) and 'game' (the prop)
      // Remove any reference to 'props.game.id'
      return (userTips || []).some(t =>
        t.gameId === game.id && t.tip === type
      );
    };
    const onBtnClick = (tipType, label) => {
      // 1. Calculate odds (Keep this accessible for everyone)
      const oddsMap = {
        homeWin: game.homeOdds,
        awayWin: game.awayOdds,
        draw: game.drawOdds,
        BTTS: game.bttsOdds,
        over25: game.over25Odds
      };

      // 2. Safely extract user info, or use a placeholder for guests
      const uid = userDetail ? userDetail.uid : "GUEST";
      const displayName = userDetail ? userDetail.displayName : "Guest User";

      // 3. Call the toggle function
      handleToggleTip(
        game.id,
        game.game,
        label,
        tipType,
        game.date,
        uid,            // Now safely passes "GUEST" if null
        oddsMap[tipType],
        displayName     // Now safely passes "Guest User" if null
      );
    };

    return (
      <div className="UserTips">
        {["homeWin", "draw", "awayWin", "BTTS", "over25"].map((type) => (
          <button
            key={type}
            className={`TipButton ${isSelected(type) ? "active" : ""}`}
            onClick={() => onBtnClick(type, type)}
          >
            {type.replace("Win", "")}
          </button>
        ))}
      </div>
    );
  };

  const [selectedTip, setSelectedTip] = useState(null);


  // Home player
  const attributesHome = homePlayerAtttributes;
  const attributesHomeComparison = homePlayerAtttributesComparison;

  const positionHome = attributesHome.position;

  const filteredEntriesHome = Object.entries(attributesHome).filter(
    ([key, value]) =>
      typeof value === "number" && key !== "id" && key !== "yearShift"
  );
  const labelsHome = filteredEntriesHome.map(([key]) => key);
  const dataHome = filteredEntriesHome.map(([, value]) => value);

  const filteredEntries2Home = Object.entries(attributesHomeComparison).filter(
    ([key, value]) =>
      typeof value === "number" && key !== "id" && key !== "yearShift"
  );
  const data2Home = filteredEntries2Home.map(([, value]) => value);

  // Away player
  const attributesAway = awayPlayerAtttributes;
  const attributesAwayComparison = awayPlayerAtttributesComparison;

  const positionAway = attributesAway.position;

  const filteredEntriesAway = Object.entries(attributesAway).filter(
    ([key, value]) =>
      typeof value === "number" && key !== "id" && key !== "yearShift"
  );
  const labelsAway = filteredEntriesAway.map(([key]) => key);
  const dataAway = filteredEntriesAway.map(([, value]) => value);

  const filteredEntries2Away = Object.entries(attributesAwayComparison).filter(
    ([key, value]) =>
      typeof value === "number" && key !== "id" && key !== "yearShift"
  );
  const data2Away = filteredEntries2Away.map(([, value]) => value);

  const handleTipSelect = (tipType) => {
    setSelectedTip(tipType);
  };


  function impliedProbability(decimalOdds) {
    if (!decimalOdds) return null;
    return (1 / decimalOdds) * 100;
  }
  const bttsYesImplied = impliedProbability(game.bttsOdds);
  const bttsNoImplied = 100 - bttsYesImplied;

  const over25Implied = impliedProbability(game.over25Odds);
  const under25Implied = 100 - over25Implied;


  const fairOdds = (prob) =>
    prob > 0 ? (100 / prob) : null;

  const valueClass = (value) => {
    if (value > 2) return "value-positive";   // strong value
    if (value < -2) return "value-negative";  // clearly bad
    return "value-neutral";
  };

  console.log(homeForm)
  const teamAData = {
    name: game.homeTeam,
    preferredStyle: homeForm.tacticalIdentity,
    recordsAgainst: homeForm.tacticalRecords, // This should be an object like { LOW_BLOCK: "W3 D1 L2", HIGH_PRESSURE: "W1 D2 L3", ... }
  };

  const teamBData = {
    name: game.awayTeam,
    preferredStyle: awayForm.tacticalIdentity,
    recordsAgainst: awayForm.tacticalRecords, // This should be an object like { LOW_BLOCK: "W3 D1 L2", HIGH_PRESSURE: "W1 D2 L3", ... }
  };


  return (
    <>
      <div className="ExpandingStats">
        {isBeforeTimestamp(game.date) && (
          <>
            <h2>Your Prediction</h2>
            <UserTips
              game={game}
              userTips={userTips}
              handleToggleTip={handleToggleTip}
              userDetail={userDetail}
            />
          </>
        )}
        <Collapsable
          buttonText={`Market Value \u{2630}`}
          classNameButton="PredictionsButton"
          element={
            <Suspense fallback={<div>Loading predictions...</div>}>
              <table className="PredictionsTable">
                <thead>
                  <tr>
                    <th>Market</th>
                    <th>Our Probability</th>
                    <th>Bookies Probability</th>
                    <th>Fair Odds</th>
                    <th>Value</th>
                  </tr>
                </thead>

                <tbody>
                  {[
                    {
                      label: "Home Win",
                      model: homeWin,
                      bookie: impliedProbability(game.homeOdds)
                    },
                    {
                      label: "Away Win",
                      model: awayWin,
                      bookie: impliedProbability(game.awayOdds)
                    },
                    {
                      label: "Draw",
                      model: draw,
                      bookie: impliedProbability(game.drawOdds)
                    },
                    {
                      label: "BTTS – Yes",
                      model: yes,
                      bookie: bttsYesImplied
                    },
                    {
                      label: "BTTS – No",
                      model: no,
                      bookie: bttsNoImplied
                    },
                    {
                      label: "Over 2.5",
                      model: over,
                      bookie: over25Implied
                    },
                    {
                      label: "Under 2.5",
                      model: under,
                      bookie: under25Implied
                    }
                  ].map(({ label, model, bookie }) => {
                    const modelValue = Number(model);
                    const bookieValue = Number(bookie);
                    const value =
                      Number.isFinite(modelValue) && Number.isFinite(bookieValue)
                        ? modelValue - bookieValue
                        : null;
                    const fairOddsValue = fairOdds(model);

                    return (
                      <tr key={label}>
                        <td>{label}</td>

                        <td>
                          {formatProbabilityPercent(model) || STAT_FALLBACK}
                        </td>
                        <td>
                          {formatProbabilityPercent(bookie) || STAT_FALLBACK}
                        </td>
                        <td>
                          {fairOddsValue != null
                            ? fairOddsValue.toFixed(2)
                            : STAT_FALLBACK}
                        </td>
                        <td className={valueClass(value)}>
                          {Number.isFinite(value)
                            ? `${value.toFixed(1)}%`
                            : STAT_FALLBACK}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Suspense>
          }
        />
        <div>
          {/* <h1>{homeTeamPlayerStats.homeTeamName} vs {homeTeamPlayerStats.awayTeamName}</h1> */}

          {loadingPlayerStats === false && (homeTeamPlayerStats || awayTeamPlayerStats) && (
            <Collapsable
              buttonText={`Player stats \u{2630}`}
              classNameButton="MissingPlayersButton"
              element={
                <div className="match-grids">
                  {/* If home stats failed, the table will show its internal error guard */}
                  <PlayerStatsTable data={homeTeamPlayerStats} />
                  <PlayerStatsTable data={awayTeamPlayerStats} />
                </div>
              }
            />
          )}
        </div>
        <div style={style}>
          <div style={style}>
            <Collapsable
              buttonText={`Lineups & match action \u{2630}`}
              classNameButton="Lineups"
              element={
                <div className="LineupsAndMatchAction">
                  <MemoizedSofaLineupsWidget
                    id={id}
                    team1={team1}
                    team2={team2}
                    time={timestamp}
                  />
                </div>
              }
            />
          </div>

          {loading || (homeMissingPlayersList.length === 0 && awayMissingPlayersList.length === 0) ? (
            <div></div>
          ) : (
            <Collapsable
              buttonText={`Missing players \u{2630}`}
              classNameButton="MissingPlayersButton"
              element={
                <>
                  <div className="AbsenceImpactMessage">
                    Impact of absence based on player's contribution so far in this competition alone
                  </div>
                  <div className="AbsenceImpactMessage">
                    Attacking and defensive impact are derived from competition appearances and contributions relative to the rest of the team in this area
                  </div>

                  <div className="MissingPlayers">
                    {/* HOME COLUMN */}
                    <div className="TeamColumn">
                      <TeamImpactSummary
                        players={homeMissingPlayersImpact}
                        teamName={game.homeTeam}
                        onCalculate={handleHomeCalculate} // Pass the memoized version
                      />
                      <MissingPlayersList
                        players={homeMissingPlayersImpact}
                        className="HomeMissingPlayers"
                      />
                    </div>

                    {/* AWAY COLUMN */}
                    <div className="TeamColumn">
                      <TeamImpactSummary
                        players={awayMissingPlayersImpact}
                        teamName={game.awayTeam}
                        // NEW: Capture the calculated values
                        onCalculate={handleAwayCalculate}
                      />
                      <MissingPlayersList
                        players={awayMissingPlayersImpact}
                        className="AwayMissingPlayers"
                      />
                    </div>
                  </div>
                </>
              }
            />
          )}

          {loadingStreaks ? (
            <div className="loading-spinner"></div>
          ) : streakData === null ? (
            /* The "Locked" state for non-paid users or missing data */
            <div className="TeamStreaksLocked">
              <button className="TeamStreaksButton locked" disabled >
                Team Streaks (All comps) 🔒
              </button>
            </div>
          ) : (
            /* The "Success" state for paid users */
            <Collapsable
              buttonText={`Team Streaks (All comps) \u{2630}`}
              classNameButton="TeamStreaksButton"
              element={
                <div className="TeamStreaks">
                  <StreakStats
                    stats={streakData}
                    home={game.homeTeam}
                    away={game.awayTeam}
                    homeLogo={game.homeBadge}
                    awayLogo={game.awayBadge}
                  />
                </div>
              }
            />
          )}


          {loadingFutureFixtures ? (
            <div className="loading-spinner"></div> // Show actual loading state
          ) : futureFixturesHome.length === 0 ? (
            /* This is the "Locked" or "Empty" state */
            <div className="FutureFixturesLocked">
              <button className="FutureFixturesButton locked" disabled>
                Upcoming Games <span className="lock-icon">🔒</span>
              </button>
            </div>
          ) : (
            /* This is the "Success" state for paid users with data */
            <Collapsable
              buttonText={`Upcoming Games`}
              classNameButton="FutureFixturesButton"
              element={
                <Suspense fallback={<div>Loading fixtures...</div>}>
                  <LazyFutureFixturesSideBySide
                    loadingFutureFixtures={loadingFutureFixtures}
                    futureFixturesHome={futureFixturesHome}
                    futureFixturesAway={futureFixturesAway}
                  />
                </Suspense>
              }
            />
          )}

          {loadingManagers ? (
            <div className="loading-spinner"></div> // Show actual loading state
          ) : homeManager === null ? (
            /* This is the "Locked" or "Empty" state */
            <div className="FutureFixturesLocked">
              <button className="FutureFixturesButton locked" disabled>
                Managers <span className="lock-icon">🔒</span>
              </button>
            </div>
          ) : (
            /* This is the "Success" state for paid users with data */
            <Collapsable
              buttonText={`Managers`}
              classNameButton="FutureFixturesButton"
              element={
                <ManagerComparison
                  homeManager={homeManager}
                  awayManager={awayManager}
                  homeTeam={game.homeTeam}
                  awayTeam={game.awayTeam}
                />
              }
            />
          )}


          {loadingPlayerData || homePlayerDataWithImages.length === 0 ? (
            <div></div>
          ) : (
            <>
              <Collapsable
                buttonText={`Key Players (League Rankings by Metric) \u{2630}`}
                classNameButton="PlayerStatsButton"
                element={
                  <div className="PlayerStats">
                    <PlayerStatsList
                      playerStats={homePlayerDataWithImages}
                      className="HomePlayerStats"
                      spanClass="SpanHome"
                    />
                    <PlayerStatsList
                      playerStats={awayPlayerDataWithImages}
                      className="AwayPlayerStats"
                      spanClass="SpanAway"
                    />
                  </div>
                }
              />
              {/* { paid && dataHome.length !== 0 ||
                dataAway.length !== 0 ? (
                <Collapsable
                  buttonText={`Key Player Comparison \u{2630}`}
                  classNameButton="PlayerAttributesButton"
                  element={
                    <div className="PlayerAttributes">
                      <div className="HomePlayerAttributes">
                        {homePlayerImage && (
                          <img
                            src={homePlayerImage}
                            alt={homePlayerData[0]?.playerName || "Home Player"}
                            className="player-image"
                          />
                        )}
                        <RadarChart
                          style={{ height: "auto" }}
                          title={homePlayerData[0]?.playerName}
                          labels={labelsHome}
                          data={dataHome}
                          data2={data2Home}
                          team1={`${homePlayerData[0]?.playerName} (${positionHome})`}
                          team2={"Competition Average"}
                          max={100}
                        />
                      </div>

                      <div className="AwayPlayerAttributes">
                        {awayPlayerImage && (
                          <img
                            src={awayPlayerImage}
                            alt={awayPlayerData[0]?.playerName || "Away Player"}
                            className="player-image"
                          />
                        )}
                        <RadarChart
                          style={{ height: "auto" }}
                          title={awayPlayerData[0]?.playerName}
                          labels={labelsAway}
                          data={dataAway}
                          data2={data2Away}
                          team1={`${awayPlayerData[0]?.playerName} (${positionAway})`}
                          team2={"Competition Average"}
                          max={100}
                        />
                      </div>
                    </div>
                  }
                />
              ) : (
                <div></div>
              )} */}
            </>
          )}
          <>
            <Collapsable
              buttonText={`Team styles) \u{2630}`}
              classNameButton="TeamStylesButton"
              element={
                <><h4>Likely styles and respective records</h4><MatchTacticalComparison
                  homeTeam={game.homeTeam}
                  awayTeam={game.awayTeam}
                  homeTactics={teamAData} // The object with preferredStyle and recordsAgainst
                  awayTactics={teamBData}
                  homeOdds={game.homeOdds} // Pass current match odds
                  awayOdds={game.awayOdds} /></>
              }
            />
          </>
          {/* <MatchTacticalComparison teamAData={teamAData} teamBData={teamBData} /> */}
          <div id="AIInsightsContainer" className="AIInsightsContainer">
            {loadingKeyPlayers ? (
              <p>Loading data for Match Preview...</p>
            ) : (
              /* The paywall logic is removed; everyone sees the active button now */
              <Button
                className="AIInsights"
                onClickEvent={() => {
                  generateAIInsights(
                    game.id,
                    streakData,
                    oddsData,
                    homeTeamStats,
                    awayTeamStats,
                    homePlayerData,
                    awayPlayerData,
                    homeMissingPlayersImpact,
                    awayMissingPlayersImpact,
                    homeLineupList,
                    awayLineupList,
                    ranksHome,
                    ranksAway,
                    futureFixturesHome,
                    futureFixturesAway,
                    homeManager,
                    awayManager,
                    homeTeamPlayerStats,
                    awayTeamPlayerStats
                  );
                  setShowAIInsights(true);
                }}
                text={"Match Preview"}
                /* Ensure disabled is also set to false so the button is clickable */
                disabled={false}
              />
            )}
          </div>

          {showAIInsights && ( // Conditionally Render the AI Insights.
            <div className="AIOutputContainer">
              {isLoading ? <p>Loading AI data....</p> : AIOutput}
            </div>
          )}
        </div>
        <Slider
          length="3"
          element1={
            <>
              <h2>
                {isWorldCupCompetition
                  ? "All Recent Form"
                  : `${game.leagueDesc} Form`}
              </h2>
              <div className="flex-container">
                <StatsHomeComponent
                  getCollapsableProps={getCollapsableProps}
                  homeAllStatsProps={homeAllStatsProps} // Pass the stats object down too
                  comparisonStatusMap={comparisonStatusMap} // <--- This is the key
                />
                <StatsAwayComponent
                  getCollapsableProps={getCollapsableProps}
                  awayAllStatsProps={awayAllStatsProps} // Pass the stats object down too
                  comparisonStatusMap={comparisonStatusMap} // <--- This is the key
                />
              </div>
              <h2>Betting value</h2>
              <h4>Points difference from bookies predictions over last 5 games</h4>
              <h4>{game.homeTeam} | {game.awayTeam}</h4>
              <span>Based on implied probability derived from odds for each match</span>
              {homeForm?.trueForm !== undefined && awayForm?.trueForm !== undefined && (
                <div className="flex-container">
                  <div className="DoughnutOne">
                    <DoughnutChart
                      pointsTotal={homeForm.pointsSum5}
                      predictedPoints={homeForm.totalExpectedPoints}
                      deltaPTS={homeForm.trueForm}
                      chartTitle={homeForm.trueForm.toFixed(2)}
                      color="#333333"
                      label={homeForm.trueForm.toFixed(2)}
                      theme={localStorage.getItem('theme')}
                    />
                  </div>
                  <div className="DoughnutTwo">
                    <DoughnutChart
                      pointsTotal={awayForm.pointsSum5}
                      predictedPoints={awayForm.totalExpectedPoints}
                      deltaPTS={awayForm.trueForm}
                      chartTitle={awayForm.trueForm.toFixed(2)}
                      color="#333333"
                      label={awayForm.trueForm.toFixed(2)}
                      theme={localStorage.getItem('theme')}
                    />
                  </div>
                </div>
              )}
              {stats && ranksHome && ranksAway && stats?.topTeams && (
                <TeamRankingsFlexView
                  title={`Rankings in ${game.leagueDesc} out of ${
                    stats.topTeams.accurateCrosses?.length ??
                    Object.values(stats.topTeams).find((v) => Array.isArray(v))
                      ?.length ??
                    "?"
                  } teams`}
                  ranksHome={ranksHome}
                  ranksAway={ranksAway}
                  teamALabel={game.homeTeam}
                  teamBLabel={game.awayTeam}
                  totalTeams={
                    stats.topTeams.accurateCrosses?.length ??
                    Object.values(stats.topTeams).find((v) => Array.isArray(v))
                      ?.length
                  }
                />
              )}
              <div className="Chart" id={`Chart${game.id}`} style={style}>
                <RadarChart
                  style={{ height: "auto" }}
                  title="Soccer Stats Hub Strength Ratings - All Competition Games"
                  theme={localStorage.getItem('theme')}
                  max={1}
                  labels={[
                    "Attack",
                    "Defence",
                    "Possession",
                    "XGF",
                    "XGA",
                    "Directness",
                    "Precision",
                  ]}
                  data={expandRadarStrengthSeries([
                    homeAttackStrength,
                    homeDefenceStrength,
                    homePossessionStrength,
                    homeXGForStrength,
                    homeXGAgainstStrength,
                    homeDirectnessStrength,
                    homeAccuracyOverallStrength,
                  ])}
                  data2={expandRadarStrengthSeries([
                    awayAttackStrength,
                    awayDefenceStrength,
                    awayPossessionStrength,
                    awayXGForStrength,
                    awayXGAgainstStrength,
                    awayDirectnessStrength,
                    awayAccuracyOverallStrength,
                  ])}
                  team1={game.homeTeam}
                  team2={game.awayTeam}
                ></RadarChart>
                <BarChart
                  text="All Competition Games - Home Team | Away Team"
                  theme={localStorage.getItem('theme')}
                  team1={game.homeTeam}
                  team2={game.awayTeam}
                  labels={[
                    "Highest Goals",
                    "Fewest Conceeded",
                    "PPG",
                    "Highest XGF",
                    "Fewest XGA",
                    "SoT",
                    "Dangerous Attacks",
                    "Av. Possession",
                    "Home/Away Goal Diff",
                    "Corners"
                  ]}
                  data1={overallBarChartData.data1}
                  data2={overallBarChartData.data2}
                  displayDeltas={overallBarChartData.displayDeltas}
                ></BarChart>
                {showXgDiffCharts && (
                  <>
                    <MultiTypeChart
                      theme={localStorage.getItem('theme')}
                      dataArray={homeForm.twoDGoalsArray || []}
                      text={homeForm.teamName + " XG Diff (All Competition Games)"}
                    />
                    <MultiTypeChart
                      theme={localStorage.getItem('theme')}
                      dataArray={awayForm.twoDGoalsArray || []}
                      text={awayForm.teamName + " XG Diff (All Competition Games)"}
                    />
                  </>
                )}
                <Chart
                  height={3}
                  depth={0}
                  data1={formArrayHome}
                  data2={formArrayAway}
                  team1={game.homeTeam}
                  team2={game.awayTeam}
                  type={chartType}
                  tension={0}
                  theme={localStorage.getItem('theme')}
                ></Chart>
                <MultilineChart
                  height={
                    Math.max(
                      rollingGoalDiffTotalHome[
                      rollingGoalDiffTotalHome.length - 1
                      ],
                      rollingGoalDiffTotalAway[
                      rollingGoalDiffTotalAway.length - 1
                      ]
                    ) > 2
                      ? Math.max(
                        rollingGoalDiffTotalHome[
                        rollingGoalDiffTotalHome.length - 1
                        ],
                        rollingGoalDiffTotalAway[
                        rollingGoalDiffTotalAway.length - 1
                        ]
                      )
                      : 2
                  }
                  depth={
                    Math.min(
                      rollingGoalDiffTotalHome[
                      rollingGoalDiffTotalHome.length - 1
                      ],
                      rollingGoalDiffTotalAway[
                      rollingGoalDiffTotalAway.length - 1
                      ]
                    ) < -2
                      ? Math.min(
                        rollingGoalDiffTotalHome[
                        rollingGoalDiffTotalHome.length - 1
                        ],
                        rollingGoalDiffTotalAway[
                        rollingGoalDiffTotalAway.length - 1
                        ]
                      )
                      : -2
                  }
                  theme={localStorage.getItem('theme')}
                  data1={rollingGoalDiffTotalHome || []}
                  data2={rollingGoalDiffTotalAway || []}
                  data3={rollingXGDiffTotalHome || []}
                  data4={rollingXGDiffTotalAway || []}
                  team1={game.homeTeam}
                  team2={game.awayTeam}
                  type={"Goal/XG difference over time"}
                  tension={0}
                ></MultilineChart>
              </div>
            </>
          }
          element2={
            homeForm?.twoDGoalsArray ? (
              <>
                <h2>Last 5 games only</h2>
                <div className="flex-container">
                  <StatsHomeLast5Component
                    comparisonStatusMap={last5ComparisonMap}
                  />
                  <StatsAwayLast5Component
                    comparisonStatusMap={last5ComparisonMap}
                  />
                </div>
                <div className="Chart" id={`Chart${game.id}`} style={style}>
                  <RadarChart
                    title="Soccer Stats Hub Strength Ratings - Last 5 Games Only"
                    max={1}
                    labels={[
                      "Attack rating",
                      "Defence rating",
                      "Ball retention",
                      "XG For",
                      "XG Against",
                      "Directness",
                      "Attacking precision",
                    ]}
                    theme={localStorage.getItem('theme')}
                    data={expandRadarStrengthSeries([
                      homeAttackStrengthLast5,
                      homeDefenceStrengthLast5,
                      homePossessionStrengthLast5,
                      homeXGForStrengthLast5,
                      homeXGAgainstStrengthLast5,
                      homeDirectnessStrengthLast5,
                      homeAccuracyOverallStrengthLast5,
                    ])}
                    data2={expandRadarStrengthSeries([
                      awayAttackStrengthLast5,
                      awayDefenceStrengthLast5,
                      awayPossessionStrengthLast5,
                      awayXGForStrengthLast5,
                      awayXGAgainstStrengthLast5,
                      awayDirectnessStrengthLast5,
                      awayAccuracyOverallStrengthLast5,
                    ])}
                    team1={game.homeTeam}
                    team2={game.awayTeam}
                  />
                  <BarChart
                    text="Last 5 only - Home Team | Away Team"
                    theme={localStorage.getItem('theme')}
                    team1={game.homeTeam}
                    team2={game.awayTeam}
                    labels={[
                      "Highest Goals",
                      "Fewest Conceeded",
                      "PPG",
                      "Highest XGF",
                      "Fewest XGA",
                      "SoT",
                      "Dangerous Attacks",
                      "Av. Possession",
                      "Home/Away Goal Diff",
                      "Corners"
                    ]}
                    data1={last5BarChartData.data1}
                    data2={last5BarChartData.data2}
                    displayDeltas={last5BarChartData.displayDeltas}
                  />

                  {showXgDiffCharts && (
                    <>
                      <MultiTypeChart
                        theme={localStorage.getItem('theme')}
                        dataArray={homeForm.twoDGoalsArray?.slice(
                          Math.max(homeForm.twoDGoalsArray.length - 5, 0)
                        )}
                        text={homeForm.teamName + ' XG Diff Last 5'}
                      />
                      <MultiTypeChart
                        theme={localStorage.getItem('theme')}
                        dataArray={awayForm.twoDGoalsArray?.slice(
                          Math.max(awayForm.twoDGoalsArray.length - 5, 0)
                        )}
                        text={awayForm.teamName + ' XG Diff Last 5'}
                      />
                    </>
                  )}

                  <MultilineChart
                    theme={localStorage.getItem('theme')}
                    height={
                      Math.max(
                        rollingGoalDiffTotalHomeLast5.at(-1),
                        rollingGoalDiffTotalAwayLast5.at(-1)
                      ) > 2
                        ? Math.max(
                          rollingGoalDiffTotalHomeLast5.at(-1),
                          rollingGoalDiffTotalAwayLast5.at(-1)
                        )
                        : 2
                    }
                    depth={
                      Math.min(
                        rollingGoalDiffTotalHomeLast5.at(-1),
                        rollingGoalDiffTotalAwayLast5.at(-1)
                      ) < -2
                        ? Math.min(
                          rollingGoalDiffTotalHomeLast5.at(-1),
                          rollingGoalDiffTotalAwayLast5.at(-1)
                        )
                        : -2
                    }
                    data1={rollingGoalDiffTotalHomeLast5}
                    data2={rollingGoalDiffTotalAwayLast5}
                    data3={rollingXGDiffTotalHomeLast5}
                    data4={rollingXGDiffTotalAwayLast5}
                    team1={game.homeTeam}
                    team2={game.awayTeam}
                    type="Goal/XG difference over last 5"
                    tension={0.5}
                  />
                </div>
              </>
            ) : null
          }
          element3={
            homeForm?.twoDGoalsArray ? (
              <>
                <h2>Home/Away games only</h2>
                <div className="flex-container">
                  <StatsHomeOnlyComponent
                    comparisonStatusMap={hOrAComparisonMap}
                  />
                  <StatsAwayOnlyComponent
                    comparisonStatusMap={hOrAComparisonMap}
                  />
                </div>
                <div className="Chart" id={`Chart${game.id}`} style={style}>
                  <RadarChart
                    theme={localStorage.getItem('theme')}
                    title="Soccer Stats Hub Strength Ratings - Home/Away Games Only"
                    max={1}
                    labels={[
                      "Attack rating",
                      "Defence rating",
                      "Ball retention",
                      "XG For",
                      "XG Against",
                      "Directness",
                      "Attacking precision",
                    ]}
                    data={expandRadarStrengthSeries([
                      homeOnlyAttackStrength,
                      homeOnlyDefenceStrength,
                      homeOnlyPossessionStrength,
                      homeOnlyXGForStrength,
                      homeOnlyXGAgainstStrength,
                      homeOnlyDirectnessStrength,
                      homeOnlyAccuracyOverallStrength,
                    ])}
                    data2={expandRadarStrengthSeries([
                      awayOnlyAttackStrength,
                      awayOnlyDefenceStrength,
                      awayOnlyPossessionStrength,
                      awayOnlyXGForStrength,
                      awayOnlyXGAgainstStrength,
                      awayOnlyDirectnessStrength,
                      awayOnlyAccuracyOverallStrength,
                    ])}
                    team1={game.homeTeam}
                    team2={game.awayTeam}
                  ></RadarChart>
                  <BarChart
                    text="Home/Away only - Home Team | Away Team"
                    theme={localStorage.getItem('theme')}
                    team1={game.homeTeam}
                    team2={game.awayTeam}
                    labels={[
                      "Highest Goals",
                      "Fewest Conceeded",
                      "PPG",
                      "Highest XGF",
                      "Fewest XGA",
                      "SoT",
                      "Dangerous Attacks",
                      "Av. Possession",
                      "Home/Away Goal Diff",
                      "Corners"
                    ]}
                    data1={homeAwayBarChartData.data1}
                    data2={homeAwayBarChartData.data2}
                    displayDeltas={homeAwayBarChartData.displayDeltas}
                  ></BarChart>
                  {showXgDiffCharts && (
                    <>
                      <MultiTypeChart
                        theme={localStorage.getItem('theme')}
                        dataArray={homeForm.twoDGoalsArrayHome}
                        text={homeForm.teamName + " XG Diff (Home)"}
                      />
                      <MultiTypeChart
                        theme={localStorage.getItem('theme')}
                        dataArray={awayForm.twoDGoalsArrayAway}
                        text={awayForm.teamName + " XG Diff (Away)"}
                      />
                    </>
                  )}
                  <MultilineChart
                    height={
                      Math.max(
                        rollingGoalDiffTotalHomeOnly[
                        rollingGoalDiffTotalHomeOnly.length - 1
                        ],
                        rollingGoalDiffTotalAwayOnly[
                        rollingGoalDiffTotalAwayOnly.length - 1
                        ]
                      ) > 2
                        ? Math.max(
                          rollingGoalDiffTotalHomeOnly[
                          rollingGoalDiffTotalHomeOnly.length - 1
                          ],
                          rollingGoalDiffTotalAwayOnly[
                          rollingGoalDiffTotalAwayOnly.length - 1
                          ]
                        )
                        : 2
                    }
                    depth={
                      Math.min(
                        rollingGoalDiffTotalHomeOnly[
                        rollingGoalDiffTotalHomeOnly.length - 1
                        ],
                        rollingGoalDiffTotalAwayOnly[
                        rollingGoalDiffTotalAwayOnly.length - 1
                        ]
                      ) < -2
                        ? Math.min(
                          rollingGoalDiffTotalHomeOnly[
                          rollingGoalDiffTotalHomeOnly.length - 1
                          ],
                          rollingGoalDiffTotalAwayOnly[
                          rollingGoalDiffTotalAwayOnly.length - 1
                          ]
                        )
                        : -2
                    }
                    theme={localStorage.getItem('theme')}
                    data1={rollingGoalDiffTotalHomeOnly}
                    data2={rollingGoalDiffTotalAwayOnly}
                    data3={rollingXGDiffTotalHomeOnly}
                    data4={rollingXGDiffTotalAwayOnly}
                    team1={game.homeTeam}
                    team2={game.awayTeam}
                    type={"Home/Away Goal/XG difference over time"}
                    tension={0.5}
                  ></MultilineChart>
                </div>
              </>
            ) : null
          }
        />
        <div className="Chart" id={`Chart${game.id}`} style={style}></div>

        <Div
          text={`Last competition games (most recent first)`}
          className={"LastGameHeader"}
        ></Div>
        <div className="flex-container">
          <div className="flex-childOneOverviewSmall">{overviewHome}</div>
          <div className="flex-childTwoOverviewSmall">{overviewAway}</div>
        </div>
        <FixtureComparisonShare
          game={game}
          homeStats={homeAllStatsProps}
          awayStats={awayAllStatsProps}
          comparisonMap={comparisonStatusMap}
        />
      </div>
    </>
  );
}

export default GameStats;
