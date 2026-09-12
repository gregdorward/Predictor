import { useMemo, useState } from "react";
import SiteHeader from "./SiteHeader";
import ShareableVisual from "./ShareableVisual";
import {
  MRI_METRICS,
  formatCorrectlyPriced,
  formatMriMetricValue,
  formatMriProfitTooltip,
  formatWdlRecord,
  isLowSample,
  resolveReliabilityLookup,
  searchLeagueReliability,
  searchTeamReliability,
} from "../seo/marketReliabilityData";
import { reliabilityToneForFavouriteWinRate } from "../logic/marketReliability";
import { sanitizeImageFilename } from "../utils/captureElementImage";
import { SITE_URL } from "../seo/pageMetaConfig";

const MRI_SHARE_TEXT = `Market Reliability Index - which leagues follow the bookies and which throw upsets: ${SITE_URL}/market-reliability/`;

const FAV_WIN_METRIC = MRI_METRICS.find((m) => m.key === "favouriteHitRate");
const FAV_ROI_METRIC = MRI_METRICS.find((m) => m.key === "favouriteRoi");
const UNDERDOG_ROI_METRIC = MRI_METRICS.find((m) => m.key === "underdogRoi");

const LEAGUE_COLUMNS = [
  { key: "name", label: "League", type: "text", priority: "core" },
  {
    key: "reliabilityLabel",
    label: "Reliability",
    title: "Reliability band from favourite win rate",
    type: "reliability",
    sortKey: "favouriteHitRate",
    priority: "core",
  },
  {
    key: "correctlyPriced",
    label: "Priced right",
    title: "Favourite wins out of priced matches (correctly priced / total)",
    type: "fraction",
    sortKey: "favouriteHitRate",
    totalKey: "pricedMatches",
    priority: "core",
  },
  {
    key: "favouriteHitRate",
    label: "Fav win %",
    title: "Share of priced matches where the favourite won",
    type: "number",
    metric: FAV_WIN_METRIC,
    priority: "core",
  },
  {
    key: "favouriteRoi",
    label: "Fav ROI",
    title: "Flat 1u P&L backing the favourite every priced match (net ROI %)",
    type: "roi",
    metric: FAV_ROI_METRIC,
    profitKey: "favouriteProfit",
    betsKey: "pricedMatches",
    priority: "core",
  },
  {
    key: "favouriteUpsetRate",
    label: "Upset %",
    title: "Favourite upset rate",
    type: "number",
    metric: MRI_METRICS[1],
    priority: "secondary",
  },
  {
    key: "favouriteDrawRate",
    label: "Fav draw %",
    title: "Favourite draw rate",
    type: "number",
    metric: MRI_METRICS[2],
    priority: "detail",
  },
  {
    key: "drawRate",
    label: "Draw %",
    title: "Draw rate",
    type: "number",
    metric: MRI_METRICS[3],
    priority: "detail",
  },
  {
    key: "homeFavouriteHitRate",
    label: "Home fav %",
    title: "Home favourite win rate",
    type: "number",
    metric: MRI_METRICS[4],
    priority: "detail",
  },
  {
    key: "awayFavouriteHitRate",
    label: "Away fav %",
    title: "Away favourite win rate",
    type: "number",
    metric: MRI_METRICS[5],
    priority: "detail",
  },
];

const TEAM_COLUMNS = [
  { key: "name", label: "Team", type: "text", priority: "core" },
  {
    key: "reliabilityLabel",
    label: "Reliability",
    title: "Reliability band from favourite win rate",
    type: "reliability",
    sortKey: "oddsReliabilityWin",
    priority: "core",
  },
  {
    key: "correctlyPriced",
    label: "Priced right",
    title: "Wins as favourite out of favourite appearances",
    type: "fraction",
    sortKey: "oddsReliabilityWin",
    totalKey: "favouriteCount",
    priority: "core",
  },
  {
    key: "oddsReliabilityWin",
    label: "Fav win %",
    title: "Wins as favourite out of favourite appearances",
    type: "number",
    metric: FAV_WIN_METRIC,
    priority: "core",
  },
  {
    key: "favouriteWdl",
    label: "W/D/L",
    title: "Record as favourite (wins / draws / losses)",
    type: "wdl",
    winKey: "winningFavouriteCount",
    drawKey: "drawingFavouriteCount",
    lossKey: "beatenFavouriteCount",
    sortKey: "winningFavouriteCount",
    priority: "core",
  },
  {
    key: "favouriteRoi",
    label: "Fav ROI",
    title: "Flat 1u P&L when backing this team as favourite (net ROI %)",
    type: "roi",
    metric: FAV_ROI_METRIC,
    profitKey: "favouriteProfit",
    betsKey: "favouriteCount",
    priority: "core",
  },
  {
    key: "leagueName",
    label: "League",
    type: "text",
    priority: "secondary",
  },
  {
    key: "oddsReliabilityWinAsUnderdog",
    label: "Underdog win %",
    title: "Underdog win rate",
    type: "number",
    metric: FAV_WIN_METRIC,
    priority: "detail",
  },
];

const UNDERDOG_COLUMNS = [
  { key: "name", label: "Team", type: "text", priority: "core" },
  {
    key: "winningUnderdogCount",
    label: "Underdog record",
    title: "Wins as underdog out of underdog appearances",
    type: "fraction",
    sortKey: "oddsReliabilityWinAsUnderdog",
    totalKey: "underdogCount",
    priority: "core",
  },
  {
    key: "underdogWdl",
    label: "W/D/L",
    title: "Record as underdog (wins / draws / losses)",
    type: "wdl",
    winKey: "winningUnderdogCount",
    drawKey: "drawingUnderdogCount",
    lossKey: "beatenUnderdogCount",
    sortKey: "winningUnderdogCount",
    priority: "core",
  },
  {
    key: "oddsReliabilityWinAsUnderdog",
    label: "Underdog win %",
    title: "Wins as underdog out of underdog appearances",
    type: "number",
    metric: FAV_WIN_METRIC,
    priority: "core",
  },
  {
    key: "underdogPoints",
    label: "Underdog pts",
    title: "Points earned as underdog (win = 3, draw = 1)",
    type: "number",
    priority: "core",
  },
  {
    key: "underdogRoi",
    label: "ROI",
    title: "Flat 1u P&L backing this team as underdog (net ROI %)",
    type: "roi",
    metric: UNDERDOG_ROI_METRIC,
    profitKey: "underdogProfit",
    betsKey: "underdogCount",
    priority: "core",
  },
  {
    key: "leagueName",
    label: "League",
    type: "text",
    priority: "secondary",
  },
];

function columnClassName(column) {
  if (column.priority === "detail") return "MarketReliability-col--detail";
  if (column.priority === "secondary") return "MarketReliability-col--secondary";
  return undefined;
}

function favouriteWinRateForRow(row) {
  return row.favouriteHitRate ?? row.oddsReliabilityWin ?? null;
}

function ReliabilityTone({ label, percent }) {
  const tone = reliabilityToneForFavouriteWinRate(percent);
  const text = label || "Unknown";
  return (
    <span
      className={`MarketReliability-tone MarketReliability-tone--${tone}`}
      title={text}
      aria-label={text}
    />
  );
}

function TeamLookup({ teams, minFavourites = 3 }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [resultKind, setResultKind] = useState(null);
  const [resultLabel, setResultLabel] = useState(null);
  const [searched, setSearched] = useState(false);

  const leagueSuggestions = useMemo(
    () => searchLeagueReliability(teams, query, { limit: 3 }),
    [teams, query]
  );
  const teamSuggestions = useMemo(
    () => searchTeamReliability(teams, query, { limit: 6 }),
    [teams, query]
  );

  function chooseTeam(team) {
    setResults([team]);
    setResultKind("team");
    setResultLabel(team?.name || null);
    setQuery(team?.name || "");
    setSearched(true);
  }

  function chooseLeague(league) {
    setResults(league?.teams || []);
    setResultKind("league");
    setResultLabel(league?.leagueName || null);
    setQuery(league?.leagueName || "");
    setSearched(true);
  }

  function onSubmit(event) {
    event.preventDefault();
    const resolved = resolveReliabilityLookup(teams, query);
    setResults(resolved.rows);
    setResultKind(resolved.kind);
    setResultLabel(resolved.label);
    setSearched(true);
    if (resolved.label) setQuery(resolved.label);
  }

  if (!teams?.length) return null;

  const hasSuggestions =
    query.trim().length >= 2 &&
    !searched &&
    (leagueSuggestions.length > 0 || teamSuggestions.length > 0);

  return (
    <section className="MarketReliability-tableSection" aria-labelledby="team-lookup">
      <h2 id="team-lookup">Look up a team or league</h2>
      <p className="MarketReliability-tableHint">
        Search any team with at least {minFavourites} favourite appearances this
        season, or search a league name to list every qualifying team in that
        competition.
      </p>
      <form className="MarketReliability-lookup" onSubmit={onSubmit}>
        <label className="MarketReliability-lookupLabel" htmlFor="mri-team-search">
          Team or league
        </label>
        <div className="MarketReliability-lookupRow">
          <input
            id="mri-team-search"
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setSearched(false);
              setResults([]);
              setResultKind(null);
              setResultLabel(null);
            }}
            placeholder="e.g. Celtic, Premier League, Serie A"
            autoComplete="off"
            spellCheck="false"
          />
          <button type="submit" className="SecondaryButton">
            Search
          </button>
        </div>
        {hasSuggestions ? (
          <ul className="MarketReliability-suggestions" role="listbox">
            {leagueSuggestions.map((league) => (
              <li key={`league-${league.leagueSlug || league.leagueName}`}>
                <button
                  type="button"
                  onClick={() => chooseLeague(league)}
                  role="option"
                >
                  <span>{league.leagueName}</span>
                  <span className="MarketReliability-suggestionLeague">
                    All teams ({league.teams.length})
                  </span>
                </button>
              </li>
            ))}
            {teamSuggestions.map((team) => (
              <li key={`${team.leagueSlug}-${team.name}`}>
                <button
                  type="button"
                  onClick={() => chooseTeam(team)}
                  role="option"
                >
                  <span>{team.name}</span>
                  <span className="MarketReliability-suggestionLeague">
                    {team.leagueName}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </form>

      {searched && results.length > 0 ? (
        <SortableTable
          caption={
            resultKind === "league"
              ? `Reliability for teams in ${resultLabel}`
              : `Reliability for ${resultLabel}`
          }
          columns={TEAM_COLUMNS}
          rows={results}
          sort={{ key: "oddsReliabilityWin", direction: "desc" }}
          onSort={() => {}}
          sortable={false}
          rowKey={(row) => `${row.leagueSlug}-${row.name}-lookup`}
          renderNameCell={(row) => row.name}
        />
      ) : null}

      {searched && results.length === 0 ? (
        <p className="MarketReliability-lookupEmpty" role="status">
          No team or league matched &ldquo;{query.trim()}&rdquo;. Try a fuller
          club or competition name.
        </p>
      ) : null}
    </section>
  );
}

function formatUpdated(generatedAt) {
  if (!generatedAt) return null;
  const date = new Date(generatedAt);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function compareRows(a, b, column, direction) {
  const factor = direction === "asc" ? 1 : -1;

  if (column.type === "text") {
    return (
      String(a[column.key] || "").localeCompare(String(b[column.key] || "")) *
      factor
    );
  }

  const valueKey = column.sortKey || column.key;
  const aValue = a[valueKey];
  const bValue = b[valueKey];
  if (aValue === null || aValue === undefined) return 1;
  if (bValue === null || bValue === undefined) return -1;
  return (Number(aValue) - Number(bValue)) * factor;
}

function SortableTable({
  caption,
  columns,
  rows,
  sort,
  onSort,
  rowKey,
  renderNameCell,
  sortable = true,
}) {
  return (
    <div className="MarketReliability-tableScroll SubpageTableScroll">
      <table className="MarketReliability-table">
        <caption className="MarketReliability-tableCaption">{caption}</caption>
        <thead>
          <tr>
            {columns.map((column) => {
              const active = sort.key === column.key;
              return (
                <th
                  key={column.key}
                  scope="col"
                  className={columnClassName(column)}
                  aria-sort={
                    sortable && active
                      ? sort.direction === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                >
                  {sortable ? (
                    <button
                      type="button"
                      onClick={() => onSort(column)}
                      title={column.title || column.label}
                      className={`MarketReliability-sortButton${
                        active ? " is-active" : ""
                      }`}
                    >
                      {column.label}
                      {active ? (
                        <span aria-hidden="true">
                          {sort.direction === "asc" ? " ▲" : " ▼"}
                        </span>
                      ) : null}
                    </button>
                  ) : (
                    <span title={column.title || column.label}>{column.label}</span>
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)}>
              {columns.map((column, index) => {
                const className = columnClassName(column);
                if (index === 0) {
                  return (
                    <th
                      scope="row"
                      key={column.key}
                      className={`MarketReliability-nameCell${
                        className ? ` ${className}` : ""
                      }`}
                    >
                      {renderNameCell ? renderNameCell(row) : row[column.key]}
                    </th>
                  );
                }
                if (column.metric) {
                  const formatted =
                    formatMriMetricValue(row[column.key], column.metric) || "-";
                  const tooltip =
                    column.type === "roi"
                      ? formatMriProfitTooltip(
                          row[column.profitKey],
                          row[column.betsKey]
                        )
                      : null;
                  return (
                    <td key={column.key} className={className} title={tooltip || undefined}>
                      {formatted}
                    </td>
                  );
                }
                if (column.type === "fraction") {
                  const hits =
                    row[column.key] ??
                    row.favouriteWins ??
                    row.winningFavouriteCount;
                  const total =
                    row[column.totalKey] ??
                    row.pricedMatches ??
                    row.favouriteCount;
                  return (
                    <td key={column.key} className={className}>
                      {formatCorrectlyPriced(hits, total) || "-"}
                    </td>
                  );
                }
                if (column.type === "wdl") {
                  return (
                    <td key={column.key} className={className}>
                      {formatWdlRecord(
                        row[column.winKey],
                        row[column.drawKey],
                        row[column.lossKey]
                      ) || "-"}
                    </td>
                  );
                }
                if (column.type === "reliability") {
                  return (
                    <td key={column.key} className={className}>
                      <ReliabilityTone
                        label={row.reliabilityLabel}
                        percent={favouriteWinRateForRow(row)}
                      />
                    </td>
                  );
                }
                return (
                  <td key={column.key} className={className}>
                    {row[column.key] ?? "-"}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function MarketReliabilityIndex({ overview }) {
  const leagues = overview?.leagues || [];
  // Prefer the full searchable set; fall back to extremes until the next cron.
  const teams =
    overview?.teams?.length > 0
      ? overview.teams
      : [
          ...(overview?.mostReliableTeams || []),
          ...(overview?.leastReliableTeams || []),
        ];
  const mostReliableTeams = overview?.mostReliableTeams || [];
  const leastReliableTeams = useMemo(
    () =>
      [...(overview?.leastReliableTeams || [])].sort(
        (a, b) =>
          (a.oddsReliabilityWin ?? Infinity) -
            (b.oddsReliabilityWin ?? Infinity) ||
          a.name.localeCompare(b.name)
      ),
    [overview?.leastReliableTeams]
  );
  const mostEffectiveUnderdogs = useMemo(
    () =>
      [...(overview?.mostEffectiveUnderdogs || [])].sort(
        (a, b) =>
          (b.oddsReliabilityWinAsUnderdog ?? -Infinity) -
            (a.oddsReliabilityWinAsUnderdog ?? -Infinity) ||
          (b.underdogPoints ?? 0) - (a.underdogPoints ?? 0) ||
          a.name.localeCompare(b.name)
      ),
    [overview?.mostEffectiveUnderdogs]
  );
  const [leagueSort, setLeagueSort] = useState({
    key: "favouriteHitRate",
    direction: "desc",
  });

  const sortedLeagues = useMemo(() => {
    const column = LEAGUE_COLUMNS.find((entry) => entry.key === leagueSort.key);
    if (!column) return leagues;
    return [...leagues].sort((a, b) =>
      compareRows(a, b, column, leagueSort.direction)
    );
  }, [leagues, leagueSort]);

  const updated = formatUpdated(overview?.generatedAt);

  function toggleLeagueSort(column) {
    setLeagueSort((current) =>
      current.key === column.key
        ? {
            key: column.key,
            direction: current.direction === "desc" ? "asc" : "desc",
          }
        : {
            key: column.key,
            direction: column.type === "text" ? "asc" : "desc",
          }
    );
  }

  return (
    <SiteHeader showThemeToggle withFooter>
      <main className="StaticPage MarketReliability" id="ssh-content">
        <header className="MarketReliability-header">
          <nav className="MarketReliability-breadcrumb" aria-label="Breadcrumb">
            <a href="/">Home</a>
            <span aria-hidden="true"> / </span>
            <a href="/competitions/">Competitions</a>
            <span aria-hidden="true"> / </span>
            <span>Market Reliability</span>
          </nav>
          <h1>Market Reliability Index</h1>
          <p className="MarketReliability-intro">
            Which leagues tend to follow the bookies&apos; prices and which throw
            up the most upsets? Ranked by how often favourites win, draw or get
            beaten - you can choose the leagues and teams you trust
          </p>
        </header>

        {leagues.length === 0 ? (
          <p className="MarketReliability-empty">
            The reliability dataset is refreshing. Please check back shortly, or
            browse <a href="/competitions/">all competitions</a> in the meantime.
          </p>
        ) : (
          <>
            {updated ? (
              <section
                className="MarketReliability-notes"
                aria-label="Data freshness"
              >
                <p className="MarketReliability-updated">
                  Data updated {updated}.
                </p>
              </section>
            ) : null}

            <section className="MarketReliability-tableSection">
              <h2 id="leagues">Leagues ranked by price reliability</h2>
              <p className="MarketReliability-tableHint">
                Select any column heading to re-sort. On smaller screens swipe
                sideways to see every column; the league name stays pinned.
                Small-sample leagues are flagged when fewer than{" "}
                {overview?.lowSampleMatches || 30} priced matches have been
                played. Use the share buttons to download or post the table.
              </p>
              <ShareableVisual
                className="MarketReliability-shareable"
                filename={sanitizeImageFilename("market-reliability-leagues")}
                shareTitle="Market Reliability Index"
                shareText={MRI_SHARE_TEXT}
              >
                <div
                  data-share-capture
                  className="MarketReliability-shareCapture"
                >
                  <p className="MarketReliability-shareCaptureTitle">
                    Market Reliability Index
                    <span className="MarketReliability-shareCaptureSub">
                      {sortedLeagues.length} leagues
                      {updated ? ` · updated ${updated}` : ""}
                    </span>
                  </p>
                  <SortableTable
                    caption={`Favourite/underdog reliability for ${leagues.length} leagues${
                      updated ? `, updated ${updated}` : ""
                    }`}
                    columns={LEAGUE_COLUMNS}
                    rows={sortedLeagues}
                    sort={leagueSort}
                    onSort={toggleLeagueSort}
                    rowKey={(row) => row.slug}
                    renderNameCell={(row) => (
                      <>
                        <a href={`/competition/${row.slug}/`}>{row.name}</a>
                        {isLowSample(row) ? (
                          <span
                            className="MarketReliability-lowSample"
                            title={`Only ${row.pricedMatches} priced matches so far`}
                          >
                            small sample
                          </span>
                        ) : null}
                      </>
                    )}
                  />
                </div>
              </ShareableVisual>
            </section>

            <TeamLookup
              teams={teams}
              minFavourites={overview?.teamSearchMinFavourites || 3}
            />

            {mostReliableTeams.length > 0 ? (
              <section className="MarketReliability-tableSection">
                <h2 id="reliable-teams">Most price-reliable teams</h2>
                <p className="MarketReliability-tableHint">
                  Teams whose results as favourites and underdogs most often
                  matched the market hierarchy this season.
                </p>
                <ShareableVisual
                  className="MarketReliability-shareable"
                  filename={sanitizeImageFilename(
                    "market-reliability-most-reliable-teams"
                  )}
                  shareTitle="Most price-reliable teams"
                  shareText={MRI_SHARE_TEXT}
                >
                  <div
                    data-share-capture
                    className="MarketReliability-shareCapture"
                  >
                    <p className="MarketReliability-shareCaptureTitle">
                      Most price-reliable teams
                      <span className="MarketReliability-shareCaptureSub">
                        Favourites that hold up this season
                      </span>
                    </p>
                    <SortableTable
                      caption="Teams with the highest favourite win rates"
                      columns={TEAM_COLUMNS}
                      rows={mostReliableTeams}
                      sort={{ key: "oddsReliabilityWin", direction: "desc" }}
                      onSort={() => {}}
                      sortable={false}
                      rowKey={(row) => `${row.leagueSlug}-${row.name}-high`}
                      renderNameCell={(row) => row.name}
                    />
                  </div>
                </ShareableVisual>
              </section>
            ) : null}

            {leastReliableTeams.length > 0 ? (
              <section className="MarketReliability-tableSection">
                <h2 id="unreliable-teams">Least price-reliable teams</h2>
                <p className="MarketReliability-tableHint">
                  Teams that beat the price as underdogs or fail as favourites
                  more often - higher upset / draw noise.
                </p>
                <ShareableVisual
                  className="MarketReliability-shareable"
                  filename={sanitizeImageFilename(
                    "market-reliability-least-reliable-teams"
                  )}
                  shareTitle="Least price-reliable teams"
                  shareText={MRI_SHARE_TEXT}
                >
                  <div
                    data-share-capture
                    className="MarketReliability-shareCapture"
                  >
                    <p className="MarketReliability-shareCaptureTitle">
                      Least price-reliable teams
                      <span className="MarketReliability-shareCaptureSub">
                        Upset and draw noise this season
                      </span>
                    </p>
                    <SortableTable
                      caption="Teams with the lowest favourite win rates"
                      columns={TEAM_COLUMNS}
                      rows={leastReliableTeams}
                      sort={{ key: "oddsReliabilityWin", direction: "asc" }}
                      onSort={() => {}}
                      sortable={false}
                      rowKey={(row) => `${row.leagueSlug}-${row.name}-low`}
                      renderNameCell={(row) => row.name}
                    />
                  </div>
                </ShareableVisual>
              </section>
            ) : null}

            {mostEffectiveUnderdogs.length > 0 ? (
              <section className="MarketReliability-tableSection">
                <h2 id="effective-underdogs">Most effective underdogs</h2>
                <p className="MarketReliability-tableHint">
                  Teams with the highest win rate when priced as the longer
                  side (minimum underdog appearances apply). Underdog profit is
                  calculated on a flat 1 unit placed on them in each of those
                  games.
                </p>
                <ShareableVisual
                  className="MarketReliability-shareable"
                  filename={sanitizeImageFilename(
                    "market-reliability-effective-underdogs"
                  )}
                  shareTitle="Most effective underdogs"
                  shareText={MRI_SHARE_TEXT}
                >
                  <div
                    data-share-capture
                    className="MarketReliability-shareCapture"
                  >
                    <p className="MarketReliability-shareCaptureTitle">
                      Most effective underdogs
                      <span className="MarketReliability-shareCaptureSub">
                        Highest underdog win rates this season
                      </span>
                    </p>
                    <SortableTable
                      caption="Teams ranked by underdog win rate"
                      columns={UNDERDOG_COLUMNS}
                      rows={mostEffectiveUnderdogs}
                      sort={{
                        key: "oddsReliabilityWinAsUnderdog",
                        direction: "desc",
                      }}
                      onSort={() => {}}
                      sortable={false}
                      rowKey={(row) => `${row.leagueSlug}-${row.name}-dog`}
                      renderNameCell={(row) => row.name}
                    />
                  </div>
                </ShareableVisual>
              </section>
            ) : null}

            <nav className="MarketReliability-related" aria-label="Related pages">
              <a href="/competitions/compare/">Compare leagues</a>
              <a href="/competitions/">All competitions</a>
              <a href="/methodology/">Methodology</a>
            </nav>
          </>
        )}
      </main>
    </SiteHeader>
  );
}
