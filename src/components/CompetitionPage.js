import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@material-ui/core";
import SiteHeader from "./SiteHeader";
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
import CompetitionStandings from "./competition/CompetitionStandings";
import CompetitionMetricRankings from "./competition/CompetitionMetricRankings";
import SeoPageLinks from "./SeoPageLinks";
import {
  getSofaScoreIdForSeason,
  formatPercent,
  formatNumber,
  getTeamsList,
  sortTeamsByField,
} from "./competition/competitionUtils";

function MetricCard({ label, value, sub }) {
  return (
    <div className="Competition__metricCard">
      <span className="Competition__metricLabel">{label}</span>
      <strong className="Competition__metricValue">{value}</strong>
      {sub ? <span className="Competition__metricSub">{sub}</span> : null}
    </div>
  );
}

function TeamRankingTable({ title, teams, field, format = formatPercent }) {
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
              <TableCell align="right">Rate</TableCell>
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
      <div className="Competition__metricGrid">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="Competition__skeleton Competition__skeleton--card" />
        ))}
      </div>
      <div className="Competition__skeleton Competition__skeleton--chart" />
    </div>
  );
}

export default function CompetitionPage({
  seasonId,
  initialData = null,
  skipHero = false,
  relatedLinks = [],
}) {
  const [data, setData] = useState(initialData);
  const [logoUrl, setLogoUrl] = useState(null);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState(null);

  useEffect(() => {
    initTheme();
  }, []);

  useEffect(() => {
    if (!seasonId) return;
    if (initialData) {
      setData(initialData);
      setLoading(false);
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

  const teams = getTeamsList(data);

  return (
    <SiteHeader
      showThemeToggle
      withFooter
      beforeFooter={<SeoPageLinks relatedLinks={relatedLinks} />}
    >
      <main className="Competition">
        <a href="/" className="HomeLink">Home</a>

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

            <section className="Competition__metricGrid">
              <MetricCard
                label="Avg goals"
                value={formatNumber(data.seasonAVG_overall)}
                sub={`H ${formatNumber(data.seasonAVG_home)} · A ${formatNumber(data.seasonAVG_away)}`}
              />
              <MetricCard
                label="BTTS"
                value={formatPercent(data.seasonBTTSPercentage)}
                sub={
                  data.seasonBTTSPercentage != null
                    ? `BTTS NO ${formatPercent(100 - Number(data.seasonBTTSPercentage))}`
                    : null
                }
              />
              <MetricCard
                label="Over 2.5"
                value={formatPercent(data.seasonOver25Percentage_overall)}
              />
              <MetricCard
                label="Corners avg"
                value={formatNumber(data.cornersAVG_overall)}
              />
              <MetricCard
                label="Cards avg"
                value={formatNumber(data.cardsAVG_overall)}
              />
              <MetricCard
                label="Home / Draw / Away"
                value={`${formatPercent(data.homeWinPercentage)} / ${formatPercent(data.drawPercentage)} / ${formatPercent(data.awayWinPercentage)}`}
              />
            </section>

            <CompetitionStandings seasonId={seasonId} />

            <section className="Competition__section">
              <h2 className="Competition__sectionHeading">Markets</h2>
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

            {teams.length > 0 && (
              <section className="Competition__section">
                <h2 className="Competition__sectionHeading">Team rankings</h2>
                <div className="Competition__rankingsGrid">
                  <TeamRankingTable
                    title="Highest Over 2.5 rate"
                    teams={sortTeamsByField(teams, "seasonOver25Percentage_overall")}
                    field="seasonOver25Percentage_overall"
                  />
                  <TeamRankingTable
                    title="Highest BTTS rate"
                    teams={sortTeamsByField(teams, "seasonBTTSPercentage_overall")}
                    field="seasonBTTSPercentage_overall"
                  />
                  <TeamRankingTable
                    title="Highest Under 2.5 rate"
                    teams={sortTeamsByField(teams, "seasonUnder25Percentage_overall")}
                    field="seasonUnder25Percentage_overall"
                  />
                  <TeamRankingTable
                    title="Most goals per game"
                    teams={sortTeamsByField(teams, "seasonAVG_overall")}
                    field="seasonAVG_overall"
                    format={(v) => formatNumber(v)}
                  />
                  <TeamRankingTable
                    title="Highest clean sheet rate"
                    teams={sortTeamsByField(teams, "seasonCSPercentage_overall")}
                    field="seasonCSPercentage_overall"
                  />
                </div>
              </section>
            )}

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
    </SiteHeader>
  );
}
