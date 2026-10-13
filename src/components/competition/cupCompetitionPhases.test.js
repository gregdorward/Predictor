import {
  CUP_PHASE_SCOPE_ALL,
  buildCupPhaseRosterTeams,
  buildStandingsViewsFromFixtures,
  collectTeamIdsForRound,
  filterComparisonTeamsByRoster,
  mergeComparisonTeamsForRoster,
  filterTeamsByCupPhase,
  isCupPhaseTablesData,
  parseCupPhasesFromTables,
  pickDefaultPhase,
  trimCupCompetitionFixtures,
  trimCupPhaseTableViewsForClient,
  cupPhaseScopesMatch,
  normalizeCupPhaseScope,
} from "./cupCompetitionPhases";
import { buildCompetitionLeagueTableViews } from "./competitionLeagueTable";

const UCL_TABLES = {
  specific_tables: [
    { round: "1st Qualifying Round", round_id: 124424, table: null, groups: null },
    { round: "2nd Qualifying Round", round_id: 124428, table: null, groups: null },
    { round: "3rd Qualifying Round", round_id: 125187, table: null, groups: null },
    { round: "Play-offs", round_id: 125385, table: null, groups: null },
    { round: "League Stage", round_id: 125877, table: null, groups: null },
  ],
};

const UCL_FIXTURES = [
  {
    roundID: 125877,
    status: "complete",
    homeID: 1,
    awayID: 2,
    home_name: "Alpha",
    away_name: "Beta",
    homeGoalCount: 2,
    awayGoalCount: 1,
    date_unix: 1,
  },
  {
    roundID: 125877,
    status: "complete",
    homeID: 3,
    awayID: 1,
    home_name: "Gamma",
    away_name: "Alpha",
    homeGoalCount: 0,
    awayGoalCount: 0,
    date_unix: 2,
  },
  {
    roundID: 124424,
    status: "complete",
    homeID: 99,
    awayID: 100,
    home_name: "Qualifier A",
    away_name: "Qualifier B",
    homeGoalCount: 1,
    awayGoalCount: 0,
    date_unix: 1,
  },
];

describe("cupCompetitionPhases", () => {
  test("parses tournament rounds from specific_tables", () => {
    const phases = parseCupPhasesFromTables(UCL_TABLES);
    expect(phases).toHaveLength(5);
    expect(phases[4]).toMatchObject({
      roundId: 125877,
      label: "League Stage",
    });
  });

  test("detects cup phase tables and excludes MLS", () => {
    expect(isCupPhaseTablesData(UCL_TABLES, 17128)).toBe(true);
    expect(
      isCupPhaseTablesData(
        { specific_tables: [{ round: "Regular Season", round_id: 1, table: [{}] }] },
        16504
      )
    ).toBe(false);
  });

  test("buildCupPhaseRosterTeams includes fixture sides missing from competition API", () => {
    const fixtures = [
      {
        roundID: 125900,
        homeID: 1,
        awayID: 2,
        home_name: "Alpha FC",
        away_name: "Beta United",
      },
      {
        roundID: 125900,
        homeID: 3,
        awayID: 1,
        home_name: "Gamma Town",
        away_name: "Alpha FC",
      },
    ];
    const competitionTeams = [{ id: 1, name: "Alpha", cleanName: "Alpha FC" }];
    const roster = buildCupPhaseRosterTeams(fixtures, 125900, competitionTeams);
    expect(roster).toHaveLength(3);
    expect(roster.find((t) => t.id === 1).cleanName).toBe("Alpha FC");
    expect(roster.find((t) => t.id === 3).name).toBe("Gamma Town");
  });

  test("collects team ids for a round", () => {
    const ids = collectTeamIdsForRound(UCL_FIXTURES, 125877);
    expect([...ids].sort()).toEqual([1, 2, 3]);
  });

  test("defaults to League Stage when present", () => {
    const phases = parseCupPhasesFromTables(UCL_TABLES);
    expect(pickDefaultPhase(phases, UCL_FIXTURES)).toMatchObject({
      roundId: 125877,
      label: "League Stage",
    });
  });

  test("mergeComparisonTeamsForRoster keeps every roster team", () => {
    const roster = [
      { id: 1, name: "Alpha", cleanName: "Alpha FC" },
      { id: 2, name: "Beta United" },
    ];
    const comparison = [{ name: "Alpha FC", attackingStrength: 0.8 }];
    const merged = mergeComparisonTeamsForRoster(roster, comparison);
    expect(merged).toHaveLength(2);
    expect(merged[0].attackingStrength).toBe(0.8);
    expect(merged[1].name).toBe("Beta United");
  });

  test("filters league comparison teams to the competition roster", () => {
    const comparison = [
      { name: "Alpha FC", attackingStrength: 0.8 },
      { name: "Qualifier B", attackingStrength: 0.2 },
    ];
    const roster = [{ name: "Alpha", cleanName: "Alpha FC" }];
    expect(filterComparisonTeamsByRoster(comparison, roster)).toHaveLength(1);
    expect(filterComparisonTeamsByRoster(comparison, roster)[0].name).toBe(
      "Alpha FC"
    );
  });

  test("filters competition teams by phase roster", () => {
    const ids = collectTeamIdsForRound(UCL_FIXTURES, 125877);
    const teams = [
      { id: 1, name: "Alpha" },
      { id: 99, name: "Qualifier A" },
    ];
    expect(filterTeamsByCupPhase(teams, ids)).toEqual([{ id: 1, name: "Alpha" }]);
  });

  test("builds standings from completed fixtures in a round", () => {
    const views = buildStandingsViewsFromFixtures({
      seasonId: 17128,
      fixtures: UCL_FIXTURES,
      roundId: 125877,
      roundLabel: "League Stage",
    });

    expect(views.mode).toBe("grouped");
    expect(views.teams).toHaveLength(3);
    expect(views.teams[0]).toMatchObject({
      Name: "Alpha",
      Points: 4,
      Played: 2,
      GroupName: "League Stage",
    });
    expect(CUP_PHASE_SCOPE_ALL).toBe("all-teams");
  });

  test("trimCupCompetitionFixtures keeps fields needed for phase tables", () => {
    const trimmed = trimCupCompetitionFixtures(UCL_FIXTURES);
    expect(trimmed).toHaveLength(UCL_FIXTURES.length);
    expect(trimmed[0]).toMatchObject({
      roundID: 125877,
      homeID: 1,
      awayID: 2,
      home_name: "Alpha",
      homeGoalCount: 2,
      awayGoalCount: 1,
    });
    expect(trimmed[0]).not.toHaveProperty("homeTeam");
  });

  test("trimCupPhaseTableViewsForClient strips undefined fields", () => {
    const views = buildCompetitionLeagueTableViews(12933, UCL_TABLES, {
      roundId: 125877,
      fixtures: UCL_FIXTURES,
    });
    const trimmed = trimCupPhaseTableViewsForClient(views);
    expect(trimmed?.teams?.length).toBeGreaterThan(0);
    expect(JSON.stringify(trimmed)).not.toContain("undefined");
  });

  test("normalizeCupPhaseScope coerces round ids", () => {
    expect(normalizeCupPhaseScope("125877")).toBe(125877);
    expect(cupPhaseScopesMatch("125877", 125877)).toBe(true);
  });
});
