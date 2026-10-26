import { useEffect, useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@material-ui/core";
import Collapsable from "./CollapsableElement";
import { apiGetUrl } from "../utils/apiUrl";
import { initTheme } from "../utils/theme";
import {
  GoalsMarketChart,
  ResultSplitChart,
  BttsMarketChart,
  CornerLinesChart,
  CardLinesChart,
  HalfTimeGoalsChart,
  GoalTimingChart,
} from "./competition/competitionCharts";
import CompetitionPlayerLeaders from "./competition/CompetitionPlayerLeaders";
import CompetitionFormChart from "./competition/CompetitionFormChart";
import CompetitionClassicLeagueTable from "./competition/CompetitionClassicLeagueTable";
import CompetitionPositionRaceChart from "./competition/CompetitionPositionRaceChart";
import { fetchAllLeagueFixturesPages } from "../logic/leagueResultsLoader";
import {
  CUP_PHASE_SCOPE_ALL,
  buildCupPhaseRosterTeams,
  collectTeamIdsForRound,
  filterTeamsByCupPhase,
  isCupPhaseCompetition,
  parseCupPhasesFromTables,
  pickDefaultPhase,
  normalizeCupPhaseScope,
  cupPhaseScopesMatch,
} from "./competition/cupCompetitionPhases";
import CompetitionMetricRankings from "./competition/CompetitionMetricRankings";
import CompetitionTeamComparison from "./competition/CompetitionTeamComparison";
import {
  buildCompetitionLeagueTableViews,
  buildTeamConferenceLookup,
  conferenceScopeIsAvailable,
  conferenceScopeLabel,
  CONFERENCE_SCOPE_EAST,
  CONFERENCE_SCOPE_OVERALL,
  CONFERENCE_SCOPE_WEST,
  filterTeamsByConference,
  isMlsSeason,
} from "./competition/competitionLeagueTable";
import {
  getSofaScoreIdForSeason,
  formatPercent,
  formatNumber,
  getTeamsList,
  sortTeamsByField,
  withXgDiff,
} from "./competition/competitionUtils";
import JourneyContentBreak from "./JourneyContentBreak";
import { ADSENSE_SLOTS } from "../constants/adsense";

const competitionAdBreak = (placementId) => ({
  slot: ADSENSE_SLOTS.COMPETITION_PAGE_IN_ARTICLE,
  placementId,
});

function getTablesDateString() {
  return new Date().toISOString().slice(0, 10);
}

function MetricCard({ label, value, sub }) {
  return (
    <div className="Competition__metricCard">
      <span className="Competition__metricLabel">{label}</span>
      <strong className="Competition__metricValue">{value}</strong>
      {sub ? <span className="Competition__metricSub">{sub}</span> : null}
    </div>
  );
}

function TeamRankingTable({
  title,
  teams,
  field,
  format = formatPercent,
  valueLabel = "Rate",
}) {
  if (!teams.length) return null;

  return (
    <div className="Competition__rankingBlock">
      <h3 className="Competition__sectionTitle">{title}</h3>
      <TableContainer component={Paper} className="Competition__table">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Team</TableCell>
              <TableCell align="right">{valueLabel}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {teams.map((team, index) => (
              <TableRow key={`${team.id || team.name}-${index}`}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{team.name || team.english_name}</TableCell>
                <TableCell align="right">{format(team[field])}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="Competition__loading">
      <div className="Competition__skeleton Competition__skeleton--hero" />
      <div className="Competition__skeleton Competition__skeleton--chart" />
    </div>
  );
}

function ScopeToggle({ heading, ariaLabel, options, value, onChange }) {
  return (
    <section className="Competition__section Competition__conferenceScope">
      <div className="Competition__standingsHeader">
        <h2 className="Competition__sectionHeading">{heading}</h2>
        <div
          className="Competition__standingsToggle"
          role="group"
          aria-label={ariaLabel}
        >
          {options.map((option) => {
            const active = value === option.value;
            return (
              <button
                key={option.value}
                type="button"
                className={`Competition__standingsToggleBtn${
                  active ? " Competition__standingsToggleBtn--active" : ""
                }`}
                aria-pressed={active}
                onClick={() => onChange(option.value)}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function buildInitialConferenceViews(seasonId, initialData) {
  if (!isMlsSeason(seasonId) || !initialData) return null;
  return buildCompetitionLeagueTableViews(seasonId, { data: initialData });
}

export default function CompetitionPage({
  seasonId,
  initialData = null,
  skipHero = false,
  initialCupDefaultRoundId = null,
  initialCupTablesData = null,
  initialCupFixtures = null,
  initialCupPhaseTableViews = null,
}) {
  const [data, setData] = useState(initialData);
  const [logoUrl, setLogoUrl] = useState(null);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState(null);
  const [conferenceViews, setConferenceViews] = useState(() =>
    buildInitialConferenceViews(seasonId, initialData)
  );
  const [conferenceScope, setConferenceScope] = useState(
    CONFERENCE_SCOPE_OVERALL
  );
  const [cupTablesData, setCupTablesData] = useState(initialCupTablesData);
  const [cupFixtures, setCupFixtures] = useState(initialCupFixtures);
  const [cupContextLoading, setCupContextLoading] = useState(
    () => Boolean(initialCupDefaultRoundId) && !initialCupFixtures?.length
  );
  const [cupPhases, setCupPhases] = useState(() => {
    if (
      initialCupTablesData &&
      isCupPhaseCompetition(seasonId, initialCupTablesData)
    ) {
      return parseCupPhasesFromTables(initialCupTablesData);
    }
    return [];
  });
  const [cupPhaseScope, setCupPhaseScope] = useState(() =>
    initialCupDefaultRoundId != null
      ? normalizeCupPhaseScope(initialCupDefaultRoundId)
      : CUP_PHASE_SCOPE_ALL
  );

  useEffect(() => {
    initTheme();
  }, []);

  useEffect(() => {
    if (!seasonId) return undefined;
    if (initialData) {
      return undefined;
    }

    let cancelled = false;

    async function fetchCompetition() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(apiGetUrl(`competition/${seasonId}`));
        if (!response.ok) {
          throw new Error("Competition not found");
        }
        const json = await response.json();
        if (!json?.success || !json?.data) {
          throw new Error("Competition data unavailable");
        }
        if (!cancelled) {
          setData(json.data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load competition");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchCompetition();
    return () => {
      cancelled = true;
    };
  }, [seasonId, initialData]);

  useEffect(() => {
    const sofaId = getSofaScoreIdForSeason(Number(seasonId));
    if (!sofaId) {
      setLogoUrl(null);
      return;
    }

    const logoPath = `${process.env.NEXT_PUBLIC_EXPRESS_SERVER}logo/${sofaId}`;
    fetch(logoPath)
      .then((response) => {
        if (response.ok) setLogoUrl(logoPath);
      })
      .catch(() => setLogoUrl(null));
  }, [seasonId]);

  useEffect(() => {
    if (isMlsSeason(seasonId)) {
      let cancelled = false;

      async function fetchConferenceViews() {
        try {
          const dateStr = getTablesDateString();
          const response = await fetch(apiGetUrl(`tables/${seasonId}/${dateStr}`));
          if (!response.ok) {
            return;
          }
          const json = await response.json();
          const views = buildCompetitionLeagueTableViews(seasonId, json);
          if (!cancelled) {
            setConferenceViews(views);
            setConferenceScope(CONFERENCE_SCOPE_OVERALL);
          }
        } catch {}
      }

      fetchConferenceViews();

      return () => {
        cancelled = true;
      };
    }

    setConferenceViews(null);
    setConferenceScope(CONFERENCE_SCOPE_OVERALL);
    return undefined;
  }, [seasonId]);

  useEffect(() => {
    if (isMlsSeason(seasonId)) {
      setCupTablesData(null);
      setCupFixtures(null);
      setCupPhases([]);
      return undefined;
    }

    let cancelled = false;

    async function fetchCupContext() {
      setCupContextLoading(true);

      try {
        const dateStr = getTablesDateString();
        const [tablesResponse, fixtures] = await Promise.all([
          fetch(apiGetUrl(`tables/${seasonId}/${dateStr}`)),
          fetchAllLeagueFixturesPages(seasonId),
        ]);

        if (!tablesResponse.ok || !fixtures?.length) {
          return;
        }

        const tablesJson = await tablesResponse.json();
        const tablesPayload = tablesJson?.data;
        if (!tablesPayload || !isCupPhaseCompetition(seasonId, tablesPayload)) {
          return;
        }

        const phases = parseCupPhasesFromTables(tablesPayload);
        const defaultPhase =
          phases.find((phase) => phase.roundId === initialCupDefaultRoundId) ||
          pickDefaultPhase(phases, fixtures);

        if (!cancelled) {
          setCupTablesData(tablesPayload);
          setCupFixtures(fixtures);
          setCupPhases(phases);
          setCupPhaseScope(
            normalizeCupPhaseScope(
              defaultPhase?.roundId ??
                initialCupDefaultRoundId ??
                CUP_PHASE_SCOPE_ALL
            )
          );
        }
      } catch {
      } finally {
        if (!cancelled) {
          setCupContextLoading(false);
        }
      }
    }

    if (
      initialCupFixtures?.length &&
      initialCupTablesData &&
      isCupPhaseCompetition(seasonId, initialCupTablesData)
    ) {
      return undefined;
    }

    fetchCupContext();

    return () => {
      cancelled = true;
    };
  }, [seasonId, initialCupDefaultRoundId, initialCupFixtures, initialCupTablesData]);

  const teams = getTeamsList(data);
  const isCupPhase = Boolean(
    cupPhases.length > 0 ||
      (cupTablesData && isCupPhaseCompetition(seasonId, cupTablesData))
  );
  const conferenceLookup = useMemo(
    () => buildTeamConferenceLookup(conferenceViews),
    [conferenceViews]
  );
  const hasConferenceSplit =
    isMlsSeason(seasonId) &&
    conferenceScopeIsAvailable(conferenceViews, CONFERENCE_SCOPE_EAST) &&
    conferenceScopeIsAvailable(conferenceViews, CONFERENCE_SCOPE_WEST);
  const activeCupRoundId =
    cupPhaseScope === CUP_PHASE_SCOPE_ALL ? null : cupPhaseScope;
  const phaseTableViews = useMemo(() => {
    if (!isCupPhase || !cupTablesData || activeCupRoundId == null) {
      return null;
    }
    if (cupFixtures?.length) {
      const live = buildCompetitionLeagueTableViews(seasonId, cupTablesData, {
        roundId: activeCupRoundId,
        fixtures: cupFixtures,
      });
      if (live?.teams?.length) {
        return live;
      }
    }
    if (
      initialCupPhaseTableViews?.teams?.length &&
      cupPhaseScopesMatch(initialCupDefaultRoundId, activeCupRoundId)
    ) {
      return initialCupPhaseTableViews;
    }
    return null;
  }, [
    isCupPhase,
    cupTablesData,
    activeCupRoundId,
    cupFixtures,
    seasonId,
    initialCupPhaseTableViews,
    initialCupDefaultRoundId,
  ]);
  const cupScopeLabel = useMemo(() => {
    if (cupPhaseScope === CUP_PHASE_SCOPE_ALL) return "All teams";
    return cupPhases.find((phase) => phase.roundId === cupPhaseScope)?.label || null;
  }, [cupPhaseScope, cupPhases]);
  const scopedTeams = useMemo(() => {
    if (isMlsSeason(seasonId)) {
      return filterTeamsByConference(teams, conferenceScope, conferenceLookup);
    }
    if (isCupPhase && cupPhaseScope !== CUP_PHASE_SCOPE_ALL && cupFixtures) {
      return buildCupPhaseRosterTeams(cupFixtures, cupPhaseScope, teams);
    }
    return teams;
  }, [
    teams,
    seasonId,
    conferenceScope,
    conferenceLookup,
    isCupPhase,
    cupPhaseScope,
    cupFixtures,
  ]);
  const mlsTableViews = isMlsSeason(seasonId) ? conferenceViews : undefined;
  const cupFormTableViews = isCupPhase ? phaseTableViews : undefined;
  const skipCupFormAutoFetch = Boolean(isCupPhase || initialCupDefaultRoundId);
  const pendingCupFormTableViews =
    cupContextLoading && cupPhaseScope !== CUP_PHASE_SCOPE_ALL;

  return (
    <main className="Competition">
      {!skipHero ? (
        <a href="/" className="HomeLink">Home</a>
      ) : null}

        {loading && <LoadingSkeleton />}

        {!loading && error && (
          <div className="Competition__error">
            <h1>Competition unavailable</h1>
            <p>{error}</p>
          </div>
        )}

        {!loading && data && (
          <>
            {!skipHero && (
            <section className="Competition__hero">
              <div className="Competition__heroMain">
                {(logoUrl || data.image) && (
                  <img
                    className="Competition__logo"
                    src={logoUrl || data.image}
                    alt=""
                  />
                )}
                <h1 className="Competition__title">
                  {data.english_name || data.name}
                </h1>
                {[data.country, data.season].filter(Boolean).length > 0 && (
                  <span className="Competition__meta">
                    {[data.country, data.season].filter(Boolean).join(" · ")}
                  </span>
                )}
                <span className="Competition__meta">
                  {data.matchesCompleted ?? "-"} / {data.totalMatches ?? "-"}{" "}
                  matches played
                  {data.game_week != null && data.total_game_week != null
                    ? ` · GW ${data.game_week}/${data.total_game_week}`
                    : ""}
                  {data.progress != null ? ` · ${data.progress}% complete` : ""}
                </span>
              </div>
            </section>
            )}

            <JourneyContentBreak {...competitionAdBreak("competition-hub-after-hero")} />

            {hasConferenceSplit ? (
              <ScopeToggle
                heading="MLS view"
                ariaLabel="MLS conference view"
                value={conferenceScope}
                onChange={setConferenceScope}
                options={[
                  CONFERENCE_SCOPE_OVERALL,
                  CONFERENCE_SCOPE_EAST,
                  CONFERENCE_SCOPE_WEST,
                ].map((option) => ({
                  value: option,
                  label: conferenceScopeLabel(option),
                }))}
              />
            ) : null}

            {isCupPhase && cupPhases.length > 0 ? (
              <ScopeToggle
                heading="Competition phase"
                ariaLabel="Competition phase view"
                value={cupPhaseScope}
                onChange={(value) => setCupPhaseScope(normalizeCupPhaseScope(value))}
                options={[
                  ...cupPhases.map((phase) => ({
                    value: phase.roundId,
                    label: phase.label,
                  })),
                  { value: CUP_PHASE_SCOPE_ALL, label: "All teams" },
                ]}
              />
            ) : null}

            {phaseTableViews?.teams?.length ? (
              <section className="Competition__section">
                <h2 className="Competition__sectionHeading">
                  {cupScopeLabel ? `${cupScopeLabel} standings` : "Standings"}
                </h2>
                <CompetitionClassicLeagueTable teams={phaseTableViews.teams} />
              </section>
            ) : null}

            <CompetitionFormChart
              seasonId={seasonId}
              scope={conferenceScope}
              tableViews={cupFormTableViews ?? mlsTableViews}
              skipAutoFetch={skipCupFormAutoFetch}
              pendingCupTableViews={pendingCupFormTableViews}
            />

            <CompetitionPositionRaceChart
              seasonId={seasonId}
              cupPhaseRoundId={isCupPhase ? activeCupRoundId : null}
              tablesData={cupTablesData}
            />

            <JourneyContentBreak {...competitionAdBreak("competition-hub-after-charts")} />

            <CompetitionTeamComparison
              seasonId={seasonId}
              competitionTeams={scopedTeams}
              conferenceLookup={conferenceLookup}
              scope={conferenceScope}
              rosterScopeLabel={
                isCupPhase && cupPhaseScope !== CUP_PHASE_SCOPE_ALL
                  ? cupScopeLabel
                  : hasConferenceSplit &&
                      conferenceScope !== CONFERENCE_SCOPE_OVERALL
                    ? conferenceScopeLabel(conferenceScope)
                    : null
              }
            />

            <JourneyContentBreak {...competitionAdBreak("competition-hub-after-compare")} />

            <section className="Competition__section">
              <h2 className="Competition__sectionHeading">
                {isMlsSeason(seasonId)
                  ? "Markets - both conferences"
                  : "Markets"}
              </h2>
              {isCupPhase && cupPhaseScope !== CUP_PHASE_SCOPE_ALL ? (
                <p className="Competition__comparisonIntro">
                  Competition-wide market rates (all phases combined). Team
                  rankings below reflect {cupScopeLabel || "the selected phase"}.
                </p>
              ) : null}
              <div className="Competition__chartGrid">
                <GoalsMarketChart data={data} />
                <ResultSplitChart data={data} />
                <BttsMarketChart data={data} />
                <CornerLinesChart data={data} />
                <CardLinesChart data={data} />
                <HalfTimeGoalsChart data={data} />
                <GoalTimingChart data={data} />
              </div>
            </section>

            <CompetitionMetricRankings seasonId={seasonId} />

            <section className="Competition__section">
              <h2 className="Competition__sectionHeading">Home advantage</h2>
              <div className="Competition__advantageGrid">
                <MetricCard
                  label="Attack advantage"
                  value={formatPercent(data.homeAttackAdvantagePercentage)}
                />
                <MetricCard
                  label="Defence advantage"
                  value={formatPercent(data.homeDefenceAdvantagePercentage)}
                />
                <MetricCard
                  label="Overall advantage"
                  value={formatPercent(data.homeOverallAdvantage)}
                />
                <MetricCard
                  label="Home goals avg"
                  value={formatNumber(data.seasonAVG_home)}
                  sub={`Away ${formatNumber(data.seasonAVG_away)}`}
                />
              </div>
            </section>

            {scopedTeams.length > 0 && (
              <>
              <JourneyContentBreak {...competitionAdBreak("competition-hub-before-rankings")} />
              <section className="Competition__section">
                <h2 className="Competition__sectionHeading">Team rankings</h2>
                {hasConferenceSplit && conferenceScope !== CONFERENCE_SCOPE_OVERALL ? (
                  <p className="Competition__comparisonIntro">
                    Showing {conferenceScopeLabel(conferenceScope)} teams only.
                  </p>
                ) : null}
                {isCupPhase &&
                cupPhaseScope !== CUP_PHASE_SCOPE_ALL &&
                cupScopeLabel ? (
                  <p className="Competition__comparisonIntro">
                    Showing {cupScopeLabel} teams only.
                  </p>
                ) : null}
                <div className="Competition__rankingsGrid">
                  <TeamRankingTable
                    title="Highest Over 2.5 rate"
                    teams={sortTeamsByField(scopedTeams, "seasonOver25Percentage_overall")}
                    field="seasonOver25Percentage_overall"
                  />
                  <TeamRankingTable
                    title="Highest BTTS rate"
                    teams={sortTeamsByField(scopedTeams, "seasonBTTSPercentage_overall")}
                    field="seasonBTTSPercentage_overall"
                  />
                  <TeamRankingTable
                    title="Highest Under 2.5 rate"
                    teams={sortTeamsByField(scopedTeams, "seasonUnder25Percentage_overall")}
                    field="seasonUnder25Percentage_overall"
                  />
                  <TeamRankingTable
                    title="Most goals per game"
                    teams={sortTeamsByField(scopedTeams, "seasonAVG_overall")}
                    field="seasonAVG_overall"
                    format={(v) => formatNumber(v)}
                  />
                  <TeamRankingTable
                    title="Best xG difference"
                    teams={sortTeamsByField(withXgDiff(scopedTeams), "xg_diff_overall")}
                    field="xg_diff_overall"
                    format={(v) => formatNumber(v)}
                    valueLabel="xG Diff"
                  />
                  <TeamRankingTable
                    title="Highest clean sheet rate"
                    teams={sortTeamsByField(scopedTeams, "seasonCSPercentage_overall")}
                    field="seasonCSPercentage_overall"
                  />
                </div>
              </section>
              </>
            )}

            <JourneyContentBreak {...competitionAdBreak("competition-hub-before-leaders")} />

            <CompetitionPlayerLeaders data={data} teams={scopedTeams} />

            {(data.foulsAVG_overall != null || data.offsidesAVG_overall != null) && (
              <section className="Competition__section">
                <Collapsable
                  buttonText="Additional markets (fouls & offsides)"
                  element={
                    <div className="Competition__extraStats">
                      {data.foulsAVG_overall != null && (
                        <p>Avg fouls per match: {formatNumber(data.foulsAVG_overall)}</p>
                      )}
                      {data.offsidesAVG_overall != null && (
                        <p>Avg offsides per match: {formatNumber(data.offsidesAVG_overall)}</p>
                      )}
                    </div>
                  }
                />
              </section>
            )}
          </>
        )}
      </main>
  );
}
