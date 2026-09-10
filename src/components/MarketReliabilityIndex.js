import { useMemo, useState } from "react";
import SiteHeader from "./SiteHeader";
import ShareableVisual from "./ShareableVisual";
import {
  MRI_METRICS,
  formatCorrectlyPriced,
  formatMriMetricValue,
  isLowSample,
} from "../seo/marketReliabilityData";
import { reliabilityToneForScore } from "../logic/marketReliability";
import { sanitizeImageFilename } from "../utils/captureElementImage";
import { SITE_URL } from "../seo/pageMetaConfig";

const MRI_SHARE_TEXT = `Market Reliability Index — which leagues follow the bookies and which throw upsets: ${SITE_URL}/market-reliability/`;

const LEAGUE_COLUMNS = [
  { key: "name", label: "League", type: "text", priority: "core" },
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
    key: "predictabilityScore",
    label: "Score",
    title: "Predictability score",
    type: "number",
    metric: MRI_METRICS[0],
    priority: "core",
  },
  {
    key: "reliabilityLabel",
    label: "Reliability",
    title: "Reliability band from the predictability score",
    type: "reliability",
    sortKey: "predictabilityScore",
    priority: "secondary",
  },
  {
    key: "favouriteHitRate",
    label: "Fav win %",
    title: "Favourite win rate",
    type: "number",
    metric: MRI_METRICS[1],
    priority: "secondary",
  },
  {
    key: "favouriteUpsetRate",
    label: "Upset %",
    title: "Favourite upset rate",
    type: "number",
    metric: MRI_METRICS[2],
    priority: "secondary",
  },
  {
    key: "favouriteDrawRate",
    label: "Fav draw %",
    title: "Favourite draw rate",
    type: "number",
    metric: MRI_METRICS[3],
    priority: "detail",
  },
  {
    key: "drawRate",
    label: "Draw %",
    title: "Draw rate",
    type: "number",
    metric: MRI_METRICS[4],
    priority: "detail",
  },
  {
    key: "homeFavouriteHitRate",
    label: "Home fav %",
    title: "Home favourite win rate",
    type: "number",
    metric: MRI_METRICS[5],
    priority: "detail",
  },
  {
    key: "awayFavouriteHitRate",
    label: "Away fav %",
    title: "Away favourite win rate",
    type: "number",
    metric: MRI_METRICS[6],
    priority: "detail",
  },
];

const TEAM_COLUMNS = [
  { key: "name", label: "Team", type: "text", priority: "core" },
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
    key: "predictabilityScore",
    label: "Score",
    title: "Predictability score",
    type: "number",
    metric: MRI_METRICS[0],
    priority: "core",
  },
  {
    key: "leagueName",
    label: "League",
    type: "text",
    priority: "secondary",
  },
  {
    key: "favouriteCount",
    label: "As favourite",
    type: "number",
    priority: "secondary",
  },
  {
    key: "oddsReliabilityWin",
    label: "Fav win %",
    title: "Favourite win rate",
    type: "number",
    metric: MRI_METRICS[1],
    priority: "detail",
  },
  {
    key: "oddsReliabilityWinAsUnderdog",
    label: "Underdog win %",
    title: "Underdog win rate",
    type: "number",
    metric: MRI_METRICS[1],
    priority: "detail",
  },
  {
    key: "reliabilityLabel",
    label: "Reliability",
    title: "Reliability band from the predictability score",
    type: "reliability",
    sortKey: "predictabilityScore",
    priority: "detail",
  },
];

function columnClassName(column) {
  if (column.priority === "detail") return "MarketReliability-col--detail";
  if (column.priority === "secondary") return "MarketReliability-col--secondary";
  return undefined;
}

function ReliabilityTone({ label, score }) {
  const tone = reliabilityToneForScore(score);
  const text = label || "Unknown";
  return (
    <span
      className={`MarketReliability-tone MarketReliability-tone--${tone}`}
      title={text}
      aria-label={text}
    />
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
                  return (
                    <td key={column.key} className={className}>
                      {formatMriMetricValue(row[column.key], column.metric) ||
                        "-"}
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
                if (column.type === "reliability") {
                  return (
                    <td key={column.key} className={className}>
                      <ReliabilityTone
                        label={row.reliabilityLabel}
                        score={row.predictabilityScore}
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
  const mostReliableTeams = overview?.mostReliableTeams || [];
  const leastReliableTeams = overview?.leastReliableTeams || [];
  const [leagueSort, setLeagueSort] = useState({
    key: "predictabilityScore",
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
            beaten — you can choose the leagues and teams you trust
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
                      caption="Teams with the highest predictability scores"
                      columns={TEAM_COLUMNS}
                      rows={mostReliableTeams}
                      sort={{ key: "predictabilityScore", direction: "desc" }}
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
                  more often — higher upset / draw noise.
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
                      caption="Teams with the lowest predictability scores"
                      columns={TEAM_COLUMNS}
                      rows={leastReliableTeams}
                      sort={{ key: "predictabilityScore", direction: "asc" }}
                      onSort={() => {}}
                      sortable={false}
                      rowKey={(row) => `${row.leagueSlug}-${row.name}-low`}
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
