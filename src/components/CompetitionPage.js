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
import CompetitionPositionRaceChart from "./competition/CompetitionPositionRaceChart";
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
import { requestJourneyContentRefresh } from "../utils/journeyContentRefresh";

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

function ConferenceScopeToggle({ value, onChange }) {
  const options = [
    CONFERENCE_SCOPE_OVERALL,
    CONFERENCE_SCOPE_EAST,
    CONFERENCE_SCOPE_WEST,
  ];

  return (
    <section className="Competition__section Competition__conferenceScope">
      <div className="Competition__standingsHeader">
        <h2 className="Competition__sectionHeading">MLS view</h2>
        <div
          className="Competition__standingsToggle"
          role="group"
          aria-label="MLS conference view"
        >
          {options.map((option) => {
            const active = value === option;
            return (
              <button
                key={option}
                type="button"
                className={`Competition__standingsToggleBtn${
                  active ? " Competition__standingsToggleBtn--active" : ""
                }`}
                aria-pressed={active}
                onClick={() => onChange(option)}
              >
                {conferenceScopeLabel(option)}
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

  useEffect(() => {
    initTheme();
  }, []);

  useEffect(() => {
    if (!data || process.env.NODE_ENV !== "production") return undefined;
    requestJourneyContentRefresh();
    return undefined;
  }, [data]);

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
    if (!isMlsSeason(seasonId)) {
      setConferenceViews(null);
      setConferenceScope(CONFERENCE_SCOPE_OVERALL);
      return undefined;
    }

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
  }, [seasonId]);

  const teams = getTeamsList(data);
  const conferenceLookup = useMemo(
    () => buildTeamConferenceLookup(conferenceViews),
    [conferenceViews]
  );
  const hasConferenceSplit =
    isMlsSeason(seasonId) &&
    conferenceScopeIsAvailable(conferenceViews, CONFERENCE_SCOPE_EAST) &&
    conferenceScopeIsAvailable(conferenceViews, CONFERENCE_SCOPE_WEST);
  const scopedTeams = useMemo(
    () => filterTeamsByConference(teams, conferenceScope, conferenceLookup),
    [teams, conferenceScope, conferenceLookup]
  );

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

            <JourneyContentBreak />

            {hasConferenceSplit ? (
              <ConferenceScopeToggle
                value={conferenceScope}
                onChange={setConferenceScope}
              />
            ) : null}

            <CompetitionFormChart
              seasonId={seasonId}
              scope={conferenceScope}
              tableViews={isMlsSeason(seasonId) ? conferenceViews : undefined}
            />

            <CompetitionPositionRaceChart seasonId={seasonId} />

            <JourneyContentBreak />

            <CompetitionTeamComparison
              seasonId={seasonId}
              competitionTeams={teams}
              conferenceLookup={conferenceLookup}
              scope={conferenceScope}
            />

            <JourneyContentBreak />

            <section className="Competition__section">
              <h2 className="Competition__sectionHeading">
                {isMlsSeason(seasonId)
                  ? "Markets - both conferences"
                  : "Markets"}
              </h2>
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
              <JourneyContentBreak />
              <section className="Competition__section">
                <h2 className="Competition__sectionHeading">Team rankings</h2>
                {hasConferenceSplit && conferenceScope !== CONFERENCE_SCOPE_OVERALL ? (
                  <p className="Competition__comparisonIntro">
                    Showing {conferenceScopeLabel(conferenceScope)} teams only.
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

            <JourneyContentBreak />

            <CompetitionPlayerLeaders data={data} teams={teams} />

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
