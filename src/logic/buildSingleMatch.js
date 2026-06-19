import { getForm } from "./getForm";
import {
  buildApiFormShortWindow,
  buildApiFormChartWindow,
  shouldStoreApiFormWindows,
} from "./getFixtures";
import {
  calculateAttackingStrength,
  calculateDefensiveStrength,
} from "./getStats";
import {
  buildFixturePageAttackingMetrics,
  buildFixturePageDefensiveMetrics,
  buildFixturePageSections,
  buildFixtureModelOutputs,
} from "./fixturePageMetrics";

export function formatDateForApi(unixTimestamp) {
  const d = new Date(unixTimestamp * 1000);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

async function convertTimestamp(timestamp) {
  const newDate = new Date(timestamp);
  const [day, month, year] = newDate.toLocaleDateString("en-US").split("/");
  return `${year}-${day}-${month}`;
}

function getPrefix(position) {
  if ([1, 21, 31, 41].includes(position)) return "st";
  if ([2, 22, 32, 42].includes(position)) return "nd";
  if ([3, 23, 33, 43].includes(position)) return "rd";
  return "th";
}

export function buildLeaguePositionsFromTable(tableResponse) {
  const leaguePositions = [];
  const data = tableResponse?.data;
  if (!data) return leaguePositions;

  let leagueInstance;
  let homeLeague;
  let awayLeague;

  if (data.league_table !== null) {
    leagueInstance = data.league_table;
    homeLeague = data.all_matches_table_home;
    awayLeague = data.all_matches_table_away;
  } else {
    leagueInstance = data.all_matches_table_overall;
    homeLeague = data.all_matches_table_home;
    awayLeague = data.all_matches_table_away;
  }

  for (let x = 0; x < leagueInstance.length; x++) {
    const regularSeason = data.specific_tables?.find(
      (season) =>
        season.round === "Regular Season" ||
        season.round === "2027" ||
        season.round === "2026/2027" ||
        season.round === "Apertura" ||
        season.round === "1st Phase" ||
        season.round === "2026" ||
        season.round === "-1"
    );

    let string;
    if (regularSeason !== undefined && regularSeason.table) {
      string = regularSeason.table[x];
      homeLeague = data.all_matches_table_home;
      awayLeague = data.all_matches_table_away;
    } else {
      string = data.all_matches_table_overall[x];
      homeLeague = data.all_matches_table_home;
      awayLeague = data.all_matches_table_away;
    }

    const stringHome = homeLeague?.[x];
    const stringAway = awayLeague?.[x];

    if (string) {
      leaguePositions.push({
        name: string.cleanName,
        position: x + 1,
        rawPosition: x + 1,
        homeFormName: stringHome ? stringHome.cleanName : string.cleanName,
        awayFormName: stringAway ? stringAway.cleanName : string.cleanName,
        homeSeasonWinPercentage: stringHome
          ? stringHome.seasonWins
          : string.seasonWins,
        awaySeasonWinPercentage: stringAway
          ? stringAway.seasonWins
          : string.seasonWins,
        homeSeasonLossPercentage: stringHome
          ? stringHome.seasonLosses_home
          : string.seasonLosses_home,
        awaySeasonLossPercentage: stringAway
          ? stringAway.seasonLosses_away
          : string.seasonLosses_away,
        homeSeasonDrawPercentage: stringHome
          ? stringHome.seasonDraws
          : string.seasonDraws,
        awaySeasonDrawPercentage: stringAway
          ? stringAway.seasonDraws
          : string.seasonDraws,
        homeSeasonMatchesPlayed: stringHome
          ? stringHome.matchesPlayed
          : string.matchesPlayed,
        awaySeasonMatchesPlayed: stringAway
          ? stringAway.matchesPlayed
          : string.matchesPlayed,
        ppg: string.points / string.matchesPlayed,
        wdl: string.wdl_record ? string.wdl_record : "",
        played: string.matchesPlayed,
        seasonGoals: string.seasonGoals,
        seasonConceded: string.seasonConceded,
      });
    }
  }

  return leaguePositions;
}

export function buildMatchFromFixture(fixture, leagueID, leagueName) {
  const dateObject = new Date(fixture.date_unix * 1000);
  return {
    id: fixture.id,
    leagueName,
    leagueDesc: leagueName,
    leagueIndex: 0,
    leagueID,
    competition_id: fixture.competition_id,
    date: fixture.date_unix,
    time: dateObject.toLocaleString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    homeTeam: fixture.home_name,
    awayTeam: fixture.away_name,
    stadium: fixture.stadium_name,
    refereeID: fixture.refereeID,
    homeOdds:
      fixture.odds_ft_1 != null ? Number(fixture.odds_ft_1).toFixed(2) : "—",
    awayOdds:
      fixture.odds_ft_2 != null ? Number(fixture.odds_ft_2).toFixed(2) : "—",
    drawOdds:
      fixture.odds_ft_x != null ? Number(fixture.odds_ft_x).toFixed(2) : "—",
    homeDoubleChance: fixture.odds_doublechance_1x,
    awayDoubleChance: fixture.odds_doublechance_x2,
    bttsOdds: fixture.odds_btts_yes,
    homeId: fixture.homeID,
    awayId: fixture.awayID,
    form: [],
    btts: false,
    matches_completed_minimum: fixture.matches_completed_minimum,
    homeBadge: fixture.home_image,
    awayBadge: fixture.away_image,
    homePpg:
      fixture.home_ppg != null ? Number(fixture.home_ppg).toFixed(2) : "N/A",
    awayPpg:
      fixture.away_ppg != null ? Number(fixture.away_ppg).toFixed(2) : "N/A",
    status: fixture.status,
    over25Odds: fixture.odds_ft_over25,
    btts_potential: fixture.btts_potential,
    game: `${fixture.home_name} v ${fixture.away_name}`,
    homeGoals: fixture.homeGoalCount,
    awayGoals: fixture.awayGoalCount,
    expectedGoalsHomeToDate: fixture.team_a_xg_prematch,
    expectedGoalsAwayToDate: fixture.team_b_xg_prematch,
    game_week: fixture.game_week,
  };
}

function buildFormWindow2Stats(formTeam, venue) {
  const stats = formTeam.data[2].stats;
  const venueKey = venue === "home" ? "home" : "away";
  return {
    XGOverall: parseFloat(stats.xg_for_avg_overall),
    XG: parseFloat(stats[`xg_for_avg_${venueKey}`]),
    ScoredOverall: parseFloat(stats.seasonScoredNum_overall),
    ScoredAverage: parseFloat(stats[`seasonScoredAVG_${venueKey}`]),
    ScoredAverageOverall: parseFloat(stats.seasonScoredAVG_overall),
    ConcededAverageOverall: parseFloat(stats.seasonConcededAVG_overall),
    PlayedHome: parseFloat(stats.seasonMatchesPlayed_home),
    PlayedAway: parseFloat(stats.seasonMatchesPlayed_away),
    ConcededOverall: parseFloat(stats.seasonConcededNum_overall),
    ConcededAverage: parseFloat(stats[`seasonConcededAVG_${venueKey}`]),
    XGAgainstAvgOverall: parseFloat(stats.xg_against_avg_overall),
    XGAgainstAverage: parseFloat(stats[`xg_against_avg_${venueKey}`]),
    CleanSheetPercentage: parseFloat(stats.seasonCSPercentage_overall),
    AveragePossessionOverall: parseFloat(stats.possessionAVG_overall),
    AveragePossession: parseFloat(stats[`possessionAVG_${venueKey}`]),
    AverageShotsOnTargetOverall: parseFloat(stats.shotsOnTargetAVG_overall),
    AverageShotsOnTarget: parseFloat(stats[`shotsOnTargetAVG_${venueKey}`]),
    AverageShots: parseFloat(stats.shotsAVG_overall),
    AverageShotsHomeOrAway: parseFloat(stats[`shotsAVG_${venueKey}`]),
    AverageDangerousAttacksOverall: parseFloat(
      stats.dangerous_attacks_avg_overall
    ),
    PPG: parseFloat(stats.seasonPPG_overall),
    AttacksHome: parseFloat(stats.attacks_avg_home),
    AttacksAway: parseFloat(stats.attacks_avg_away),
    AttacksAverage: parseFloat(stats[`attacks_avg_${venueKey}`]),
    AverageDangerousAttacks: parseFloat(
      stats[`dangerous_attacks_avg_${venueKey}`]
    ),
    homeAttackAdvantage: parseFloat(stats.homeAttackAdvantage),
    homeDefenceAdvantage: parseFloat(stats.homeDefenceAdvantage),
    BTTSPercentage: parseInt(stats[`seasonBTTSPercentage_${venueKey}`]),
    goalDifference: stats.seasonGoalDifference_overall,
    goalDifferenceHomeOrAway: stats[`seasonGoalDifference_${venueKey}`],
    BttsPercentage: stats.seasonBTTSPercentage_overall,
    BttsPercentageHomeOrAway: stats[`seasonBTTSPercentage_${venueKey}`],
    CardsTotal: stats.cardsTotal_overall,
    CornersAverage: stats.cornersAVG_overall,
    ScoredBothHalvesPercentage: stats.scoredBothHalvesPercentage_overall,
  };
}

function resolveFormStrings(form) {
  return {
    homeFormString5:
      form[0].data[0].stats.additional_info.formRun_overall.toUpperCase(),
    awayFormString5:
      form[1].data[0].stats.additional_info.formRun_overall.toUpperCase(),
    homeFormString6:
      form[0].data[1].stats.additional_info.formRun_overall.toUpperCase(),
    awayFormString6:
      form[1].data[1].stats.additional_info.formRun_overall.toUpperCase(),
    homeFormString10:
      form[0].data[2].stats.additional_info.formRun_overall.toUpperCase(),
    awayFormString10:
      form[1].data[2].stats.additional_info.formRun_overall.toUpperCase(),
    homeFormRun:
      form[0].data[2].stats.additional_info.formRun_home.toUpperCase(),
    awayFormRun:
      form[1].data[2].stats.additional_info.formRun_away.toUpperCase(),
  };
}

function resolveLeagueFormSlices(
  WDLinLeagueHome,
  WDLinLeagueAway,
  formStrings,
  homeTeaminLeague,
  awayTeaminLeague
) {
  const {
    homeFormString5,
    awayFormString5,
    homeFormString6,
    awayFormString6,
    homeFormString10,
    awayFormString10,
  } = formStrings;

  let lastThreeFormHome;
  let lastFiveFormHome;
  let lastSixFormHome;
  let lastTenFormHome;
  let lastThreeFormAway;
  let lastFiveFormAway;
  let lastSixFormAway;
  let lastTenFormAway;
  let leagueOrAll;
  let homeAverageGoals;
  let homeAverageConceded;
  let awayAverageGoals;
  let awayAverageConceded;

  const HomeAverageGoals =
    homeTeaminLeague?.played > 0
      ? homeTeaminLeague.seasonGoals / homeTeaminLeague.played
      : null;
  const HomeAverageConceded =
    homeTeaminLeague?.played > 0
      ? homeTeaminLeague.seasonConceded / homeTeaminLeague.played
      : null;
  const AwayAverageGoals =
    awayTeaminLeague?.played > 0
      ? awayTeaminLeague.seasonGoals / awayTeaminLeague.played
      : null;
  const AwayAverageConceded =
    awayTeaminLeague?.played > 0
      ? awayTeaminLeague.seasonConceded / awayTeaminLeague.played
      : null;

  if (WDLinLeagueHome.length >= 10) {
    lastThreeFormHome = WDLinLeagueHome.slice(-3);
    lastFiveFormHome = WDLinLeagueHome.slice(-5);
    lastSixFormHome = WDLinLeagueHome.slice(-6);
    lastTenFormHome = WDLinLeagueHome.slice(-10);
    lastThreeFormAway = WDLinLeagueAway.slice(-3);
    lastFiveFormAway = WDLinLeagueAway.slice(-5);
    lastSixFormAway = WDLinLeagueAway.slice(-6);
    lastTenFormAway = WDLinLeagueAway.slice(-10);
    leagueOrAll = "League";
    homeAverageGoals = HomeAverageGoals;
    homeAverageConceded = HomeAverageConceded;
    awayAverageGoals = AwayAverageGoals;
    awayAverageConceded = AwayAverageConceded;
  } else if (WDLinLeagueHome.length >= 6) {
    lastThreeFormHome = WDLinLeagueHome.slice(-3);
    lastFiveFormHome = WDLinLeagueHome.slice(-5);
    lastSixFormHome = WDLinLeagueHome.slice(-6);
    lastTenFormHome = Array.from(homeFormString10);
    lastThreeFormAway = WDLinLeagueAway.slice(-3);
    lastFiveFormAway = WDLinLeagueAway.slice(-5);
    lastSixFormAway = WDLinLeagueAway.slice(-6);
    lastTenFormAway = Array.from(awayFormString10);
    leagueOrAll = "League";
    homeAverageGoals = HomeAverageGoals;
    homeAverageConceded = HomeAverageConceded;
    awayAverageGoals = AwayAverageGoals;
    awayAverageConceded = AwayAverageConceded;
  } else if (WDLinLeagueHome.length >= 5) {
    lastThreeFormHome = WDLinLeagueHome.slice(-3);
    lastFiveFormHome = WDLinLeagueHome.slice(-5);
    lastSixFormHome = Array.from(homeFormString6);
    lastTenFormHome = Array.from(homeFormString10);
    lastThreeFormAway = WDLinLeagueAway.slice(-3);
    lastFiveFormAway = WDLinLeagueAway.slice(-5);
    lastSixFormAway = Array.from(awayFormString6);
    lastTenFormAway = Array.from(awayFormString10);
    leagueOrAll = "League";
    homeAverageGoals = HomeAverageGoals;
    homeAverageConceded = HomeAverageConceded;
    awayAverageGoals = AwayAverageGoals;
    awayAverageConceded = AwayAverageConceded;
  } else {
    lastThreeFormHome = [homeFormString5[2], homeFormString5[3], homeFormString5[4]];
    lastFiveFormHome = Array.from(homeFormString5);
    lastSixFormHome = Array.from(homeFormString6);
    lastTenFormHome = Array.from(homeFormString10);
    lastThreeFormAway = [awayFormString5[2], awayFormString5[3], awayFormString5[4]];
    lastFiveFormAway = Array.from(awayFormString5);
    lastSixFormAway = Array.from(awayFormString6);
    lastTenFormAway = Array.from(awayFormString10);
    leagueOrAll = "All";
    homeAverageGoals = undefined;
    homeAverageConceded = undefined;
    awayAverageGoals = undefined;
    awayAverageConceded = undefined;
  }

  return {
    lastThreeFormHome,
    lastFiveFormHome,
    lastSixFormHome,
    lastTenFormHome,
    lastThreeFormAway,
    lastFiveFormAway,
    lastSixFormAway,
    lastTenFormAway,
    leagueOrAll,
    homeAverageGoals,
    homeAverageConceded,
    awayAverageGoals,
    awayAverageConceded,
    formRunHome: Array.from(formStrings.homeFormRun),
    formRunAway: Array.from(formStrings.awayFormRun),
  };
}

function resolveTeamLeagueContext(match, leaguePositions) {
  let homeTeaminLeague = { rawPosition: "N/A" };
  let awayTeaminLeague = { rawPosition: "N/A" };
  let teamPositionHome = "N/A";
  let teamPositionHomeTable = "N/A";
  let teamPositionAway = "N/A";
  let teamPositionAwayTable = "N/A";
  let WDLinLeagueHome = [];
  let WDLinLeagueAway = [];
  let homePrefix = "";
  let homePrefixHomeTable = "";
  let awayPrefix = "";
  let awayPrefixAwayTable = "";
  let homeSeasonPPG = "N/A";
  let awaySeasonPPG = "N/A";
  let homeTeamWinPercentageHome;
  let awayTeamWinPercentageAway;
  let homeTeamLossPercentageHome;
  let awayTeamLossPercentageAway;
  let homeTeamDrawPercentageHome;
  let awayTeamDrawPercentageAway;

  try {
    homeTeaminLeague = leaguePositions.find((team) => team.name === match.homeTeam);
    const homeTeaminHomeLeague = leaguePositions.find(
      (team) => team.homeFormName === match.homeTeam
    );
    teamPositionHome = homeTeaminLeague.position;
    teamPositionHomeTable = homeTeaminHomeLeague.position;
    WDLinLeagueHome = Array.from(homeTeaminLeague.wdl.toUpperCase());
    homeTeamWinPercentageHome =
      (homeTeaminHomeLeague.homeSeasonWinPercentage /
        homeTeaminHomeLeague.homeSeasonMatchesPlayed) *
      100;
    homeTeamLossPercentageHome =
      (homeTeaminHomeLeague.homeSeasonLossPercentage /
        homeTeaminHomeLeague.homeSeasonMatchesPlayed) *
      100;
    homeTeamDrawPercentageHome =
      (homeTeaminHomeLeague.homeSeasonDrawPercentage /
        homeTeaminHomeLeague.homeSeasonMatchesPlayed) *
      100;
    homePrefix = getPrefix(teamPositionHome);
    homePrefixHomeTable = getPrefix(teamPositionHomeTable);
    homeSeasonPPG = homeTeaminLeague.ppg.toFixed(2);
  } catch {
    teamPositionHome = "N/A";
    homePrefix = "";
    homePrefixHomeTable = "";
    homeSeasonPPG = "N/A";
    homeTeaminLeague = { rawPosition: "N/A" };
    WDLinLeagueHome = [];
  }

  try {
    awayTeaminLeague = leaguePositions.find((team) => team.name === match.awayTeam);
    const awayTeaminAwayLeague = leaguePositions.find(
      (team) => team.awayFormName === match.awayTeam
    );
    teamPositionAway = awayTeaminLeague.position;
    teamPositionAwayTable = awayTeaminAwayLeague.position;
    WDLinLeagueAway = Array.from(awayTeaminLeague.wdl.toUpperCase());
    awayTeamWinPercentageAway =
      (awayTeaminAwayLeague.awaySeasonWinPercentage /
        awayTeaminAwayLeague.awaySeasonMatchesPlayed) *
      100;
    awayTeamLossPercentageAway =
      (awayTeaminAwayLeague.awaySeasonLossPercentage /
        awayTeaminAwayLeague.awaySeasonMatchesPlayed) *
      100;
    awayTeamDrawPercentageAway =
      (awayTeaminAwayLeague.awaySeasonDrawPercentage /
        awayTeaminAwayLeague.awaySeasonMatchesPlayed) *
      100;
    awayPrefix = getPrefix(teamPositionAway);
    awayPrefixAwayTable = getPrefix(teamPositionAwayTable);
    awaySeasonPPG = awayTeaminLeague.ppg.toFixed(2);
  } catch {
    teamPositionAway = "N/A";
    awayPrefix = "";
    awayPrefixAwayTable = "";
    awaySeasonPPG = "N/A";
    awayTeaminLeague = { rawPosition: "N/A" };
    WDLinLeagueAway = [];
  }

  return {
    homeTeaminLeague,
    awayTeaminLeague,
    teamPositionHome,
    teamPositionHomeTable,
    teamPositionAway,
    teamPositionAwayTable,
    WDLinLeagueHome,
    WDLinLeagueAway,
    homePrefix,
    homePrefixHomeTable,
    awayPrefix,
    awayPrefixAwayTable,
    homeSeasonPPG,
    awaySeasonPPG,
    homeTeamWinPercentageHome,
    awayTeamWinPercentageAway,
    homeTeamLossPercentageHome,
    awayTeamLossPercentageAway,
    homeTeamDrawPercentageHome,
    awayTeamDrawPercentageAway,
  };
}

export async function buildAllFormEntry(match, fixture, leagueID, leaguePositions) {
  const form = await getForm(match);
  const formStrings = resolveFormStrings(form);
  const teamCtx = resolveTeamLeagueContext(match, leaguePositions);
  const formSlices = resolveLeagueFormSlices(
    teamCtx.WDLinLeagueHome,
    teamCtx.WDLinLeagueAway,
    formStrings,
    teamCtx.homeTeaminLeague,
    teamCtx.awayTeaminLeague
  );

  const storeApiWindows = shouldStoreApiFormWindows(
    leagueID,
    fixture.matches_completed_minimum
  );

  const homeWindow2 = buildFormWindow2Stats(form[0], "home");
  const awayWindow2 = buildFormWindow2Stats(form[1], "away");

  const formEntry = {
    id: match.id,
    teamIDHome: match.homeId,
    teamIDAway: match.awayId,
    leagueId: leagueID,
    home: {
      teamName: match.homeTeam,
      0: storeApiWindows ? buildApiFormShortWindow(form[0], 0, "home") : {},
      1: storeApiWindows ? buildApiFormChartWindow(form[0], 1) : {},
      2: {
        ...homeWindow2,
        lastThreeForm: formSlices.lastThreeFormHome?.slice().reverse() ?? "N/A",
        LastFiveForm: formSlices.lastFiveFormHome?.slice().reverse() ?? "N/A",
        LastSixForm: formSlices.lastSixFormHome?.slice().reverse() ?? "N/A",
        LastTenForm: formSlices.lastTenFormHome?.slice().reverse() ?? "N/A",
        LeagueOrAll: formSlices.leagueOrAll,
        LeaguePosition: `${teamCtx.teamPositionHome}${teamCtx.homePrefix}`,
        homeRawPosition: teamCtx.homeTeaminLeague.rawPosition ?? 0,
        homeTeamHomePositionRaw: teamCtx.teamPositionHomeTable,
        SeasonPPG: teamCtx.homeSeasonPPG,
        WinPercentage: teamCtx.homeTeamWinPercentageHome,
        LossPercentage: teamCtx.homeTeamLossPercentageHome,
        DrawPercentage: teamCtx.homeTeamDrawPercentageHome,
        formRun: formSlices.formRunHome,
        LastMatch: await convertTimestamp(
          form[0].data[0].last_updated_match_timestamp
        ),
        WDLRecord: teamCtx.WDLinLeagueHome,
        LeagueAverageGoals: formSlices.homeAverageGoals,
        LeagueAverageConceded: formSlices.homeAverageConceded,
      },
    },
    away: {
      teamName: match.awayTeam,
      0: storeApiWindows ? buildApiFormShortWindow(form[1], 0, "away") : {},
      1: storeApiWindows ? buildApiFormChartWindow(form[1], 1) : {},
      2: {
        ...awayWindow2,
        lastThreeForm: formSlices.lastThreeFormAway?.slice().reverse() ?? "N/A",
        LastFiveForm: formSlices.lastFiveFormAway?.slice().reverse() ?? "N/A",
        LastSixForm: formSlices.lastSixFormAway?.slice().reverse() ?? "N/A",
        LastTenForm: formSlices.lastTenFormAway?.slice().reverse() ?? "N/A",
        LeagueOrAll: formSlices.leagueOrAll,
        LeaguePosition: `${teamCtx.teamPositionAway}${teamCtx.awayPrefix}`,
        awayRawPosition: teamCtx.awayTeaminLeague.rawPosition ?? 0,
        awayTeamAwayPositionRaw: teamCtx.teamPositionAwayTable,
        SeasonPPG: teamCtx.awaySeasonPPG,
        WinPercentage: teamCtx.awayTeamWinPercentageAway,
        LossPercentage: teamCtx.awayTeamLossPercentageAway,
        DrawPercentage: teamCtx.awayTeamDrawPercentageAway,
        formRun: formSlices.formRunAway,
        LastMatch: await convertTimestamp(
          form[1].data[0].last_updated_match_timestamp
        ),
        WDLRecord: teamCtx.WDLinLeagueAway,
        LeagueAverageGoals: formSlices.awayAverageGoals,
        LeagueAverageConceded: formSlices.awayAverageConceded,
      },
    },
  };

  match.lastFiveFormHome = formSlices.lastFiveFormHome;
  match.lastFiveFormAway = formSlices.lastFiveFormAway;
  match.homeRawPosition = teamCtx.homeTeaminLeague.rawPosition;
  match.awayRawPosition = teamCtx.awayTeaminLeague.rawPosition;
  match.homeTeamHomePosition = `${teamCtx.teamPositionHomeTable}${teamCtx.homePrefixHomeTable}`;
  match.awayTeamAwayPosition = `${teamCtx.teamPositionAwayTable}${teamCtx.awayPrefixAwayTable}`;
  match.homeTeamHomePositionRaw = teamCtx.teamPositionHomeTable;
  match.awayTeamAwayPositionRaw = teamCtx.teamPositionAwayTable;
  match.homeTeamWinPercentage = teamCtx.homeTeamWinPercentageHome;
  match.awayTeamWinPercentage = teamCtx.awayTeamWinPercentageAway;
  match.homeTeamLossPercentage = teamCtx.homeTeamLossPercentageHome;
  match.awayTeamLossPercentage = teamCtx.awayTeamLossPercentageAway;
  match.homeTeamDrawPercentage = teamCtx.homeTeamDrawPercentageHome;
  match.awayTeamDrawPercentage = teamCtx.awayTeamDrawPercentageAway;

  return formEntry;
}

export {
  buildFixturePageAttackingMetrics,
  buildFixturePageDefensiveMetrics,
  buildFixturePageSections,
  buildLegacyFixtureSections,
  buildFixtureModelOutputs,
} from "./fixturePageMetrics";

export async function enrichMatchForFixturePageDisplay(match) {
  const strengthOptions =
    match?.apiFormOnly || match?.formHome?.apiFormOnly
      ? { international: true }
      : {};

  for (const side of ["formHome", "formAway"]) {
    const form = match?.[side];
    if (!form) {
      continue;
    }

    form.fixtureAttackingMetrics = buildFixturePageAttackingMetrics(form);
    form.fixtureDefensiveMetrics = buildFixturePageDefensiveMetrics(form);
    form.fixtureAttackingStrength = await calculateAttackingStrength(
      form.fixtureAttackingMetrics,
      false,
      strengthOptions
    );
    form.fixtureDefensiveStrength = await calculateDefensiveStrength(
      form.fixtureDefensiveMetrics,
      false,
      strengthOptions
    );
  }
}

export function mapMatchToFixturePageData(match) {
  const homeAttack =
    match.formHome?.fixtureAttackingStrength ??
    match.formHome?.attackingStrength;
  const homeDefence =
    match.formHome?.fixtureDefensiveStrength ??
    match.formHome?.defensiveStrength;
  const awayAttack =
    match.formAway?.fixtureAttackingStrength ??
    match.formAway?.attackingStrength;
  const awayDefence =
    match.formAway?.fixtureDefensiveStrength ??
    match.formAway?.defensiveStrength;

  return {
    fixtureDetails: {
      id: match.id,
      homeTeamName: match.homeTeam,
      homeId: match.homeId,
      homeTeamBadge: match.homeBadge,
      awayTeamName: match.awayTeam,
      awayId: match.awayId,
      awayTeamBadge: match.awayBadge,
      stadium: match.stadium,
      time: match.time,
      homeGoals: match.goalsA,
      awayGoals: match.goalsB,
      competitionId: match.competition_id,
      leagueName: match.leagueName,
    },
    sections: buildFixturePageSections(match),
    chart: {
      homeAttack,
      homeDefence,
      awayAttack,
      awayDefence,
    },
    recentResults: {
      home: match.formHome?.allTeamResults ?? [],
      away: match.formAway?.allTeamResults ?? [],
    },
    modelOutputs: buildFixtureModelOutputs(match),
    headToHead: match.headToHead ?? null,
  };
}
