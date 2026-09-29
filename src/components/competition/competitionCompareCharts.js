import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  BarElement,
  Tooltip,
  Legend,
  ScatterController,
} from "chart.js";
import { Bar, Scatter } from "react-chartjs-2";
import { useChartTheme, getChartColors } from "../Chart";
import ShareableVisual from "../ShareableVisual";
import { sanitizeImageFilename } from "../../utils/captureElementImage";
import JourneyContentBreak from "../JourneyContentBreak";
import { requestJourneyContentRefresh } from "../../utils/journeyContentRefresh";
import { uniqueTeamAbbreviations } from "../../utils/competitionTeamLabels";
import { getSofaScoreIdForSeason } from "./competitionUtils";
import {
  MetricPicker,
  buildScatterTooltipOptions,
  comparisonMetricToAxisMeta,
  computeAxisRange,
  createScatterMarkerPlugin,
  formatScatterAxisValue,
  markersSignature,
  ScatterBadgeLayer,
  ScatterAxisFrame,
  StyleMapLegend,
  StyleMapLeagueSelectionBar,
  SCATTER_CHART_INTERACTION,
  SCATTER_EXTERNAL_AXIS_LAYOUT_PADDING,
  scatterBadgeHitRadius,
  scatterPlotCountBadgeSize,
} from "./scatterStyleMap";
import {
  averageForMetric,
  CHARTABLE_METRIC_KEYS,
  COMPARISON_METRICS,
  formatMetricValue,
  getComparisonMetric,
  getDefaultStyleMapSlugs,
  isLowSample,
  rankByMetric,
} from "../../seo/competitionOverviewData";

ChartJS.register(
  LinearScale,
  PointElement,
  BarElement,
  Tooltip,
  Legend,
  ScatterController
);

const ACCENT = "#f57701";
const LOW_SAMPLE_COLOR = "#9a9a9a";
const LEAGUE_POINT_FILL = "rgba(1, 165, 1, 0.8)";
const LEAGUE_POINT_BORDER = "#01a501";

function ChartCard({ title, subtitle, children, controls }) {
  return (
    <div className="CompetitionsCompare-chartCard">
      <div className="CompetitionsCompare-chartCardHeader">
        <div>
          <h3 className="CompetitionsCompare-chartCardTitle">{title}</h3>
          {subtitle ? (
            <p className="CompetitionsCompare-chartCardSubtitle">{subtitle}</p>
          ) : null}
        </div>
        {controls}
      </div>
      <div className="CompetitionsCompare-chartCardBody">{children}</div>
    </div>
  );
}

function resolveLeagueLogoUrl(seasonId) {
  const sofaId = getSofaScoreIdForSeason(Number(seasonId));
  if (!sofaId || !process.env.NEXT_PUBLIC_EXPRESS_SERVER) return null;
  return `${process.env.NEXT_PUBLIC_EXPRESS_SERVER}logo/${sofaId}`;
}

function MetricLeaderboard({ competitions }) {
  const theme = useChartTheme();
  const { color, gridColor, tooltipBackground } = getChartColors(theme);
  const [metricKey, setMetricKey] = useState("avgGoals");

  const metric = getComparisonMetric(metricKey);
  const ranked = useMemo(
    () => rankByMetric(competitions, metricKey),
    [competitions, metricKey]
  );
  const mean = useMemo(
    () => averageForMetric(competitions, metricKey),
    [competitions, metricKey]
  );

  if (!metric || ranked.length === 0) return null;

  const values = ranked.map((row) => Number(row[metricKey]));

  const data = {
    labels: ranked.map((row) => row.name),
    datasets: [
      {
        data: values,
        borderWidth: 0,
        borderRadius: 3,
        backgroundColor: ranked.map((row) =>
          isLowSample(row) ? LOW_SAMPLE_COLOR : ACCENT
        ),
      },
    ],
  };

  const options = {
    color,
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 400 },
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: {
        backgroundColor: tooltipBackground,
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        displayColors: false,
        callbacks: {
          label(context) {
            const row = ranked[context.dataIndex];
            const lines = [
              `${metric.label}: ${formatMetricValue(context.raw, metric)}`,
              `${row.played} of ${row.total} matches played`,
            ];
            if (isLowSample(row)) lines.push("Small sample so far this season");
            return lines;
          },
        },
      },
    },
    scales: {
      y: {
        ticks: { color, font: { size: 10 }, autoSkip: false },
        grid: { display: false },
        border: { display: false },
      },
      x: {
        beginAtZero: true,
        ticks: { color, font: { size: 10 } },
        grid: { color: gridColor, drawTicks: false },
        border: { display: false },
      },
    },
  };

  const controls = (
    <div
      className="CompetitionsCompare-metricToggle"
      role="group"
      aria-label="Choose a metric to rank leagues by"
    >
      {CHARTABLE_METRIC_KEYS.map((key) => {
        const option = getComparisonMetric(key);
        if (!option) return null;
        const active = key === metricKey;
        return (
          <button
            key={key}
            type="button"
            onClick={() => setMetricKey(key)}
            aria-pressed={active}
            className={`CompetitionsCompare-metricToggleButton${
              active ? " is-active" : ""
            }`}
          >
            {option.short}
          </button>
        );
      })}
    </div>
  );

  return (
    <ChartCard
      title={`Leagues ranked by ${metric.label.toLowerCase()}`}
      subtitle={
        mean === null
          ? null
          : `Average across the ${ranked.length} leagues shown: ${formatMetricValue(
              mean,
              metric
            )}. Grey bars are leagues with a small sample so far.`
      }
      controls={controls}
    >
      <ShareableVisual
        className="Competition__shareable"
        filename={sanitizeImageFilename(`leagues-ranked-by-${metric.label}`)}
        shareTitle={`Leagues ranked by ${metric.label.toLowerCase()}`}
      >
        <div data-share-capture className="Competition__shareCapture">
          <p className="Competition__shareCaptureTitle">
            Leagues ranked by {metric.label.toLowerCase()}
            <span className="Competition__shareCaptureSub">
              {ranked.length} leagues
              {mean === null
                ? null
                : ` · average ${formatMetricValue(mean, metric)}`}
            </span>
          </p>
          <div
            className="CompetitionsCompare-chartScroll"
            style={{ height: `${Math.max(260, ranked.length * 22)}px` }}
          >
            <Bar key={`${theme}-${metricKey}`} data={data} options={options} />
          </div>
        </div>
      </ShareableVisual>
    </ChartCard>
  );
}

function LeagueStyleMap({ competitions }) {
  const theme = useChartTheme();
  const { color, gridColor, tooltipBackground } = getChartColors(theme);
  const [scatterXKey, setScatterXKey] = useState("avgGoals");
  const [scatterYKey, setScatterYKey] = useState("btts");
  const [scatterMarkers, setScatterMarkers] = useState([]);
  const scatterMarkerSignatureRef = useRef("");
  const [selectedSlugs, setSelectedSlugs] = useState(() => new Set());
  const [highlightedSlug, setHighlightedSlug] = useState(null);

  const availableMetrics = useMemo(() => {
    return COMPARISON_METRICS.filter((metric) =>
      (competitions || []).some((row) => {
        const value = row?.[metric.key];
        return value !== null && value !== undefined && value !== "";
      })
    );
  }, [competitions]);

  useEffect(() => {
    if (!availableMetrics.length) return;
    const keys = new Set(availableMetrics.map((m) => m.key));
    if (!keys.has(scatterXKey)) {
      setScatterXKey(availableMetrics[0].key);
    }
    if (!keys.has(scatterYKey)) {
      setScatterYKey(
        availableMetrics[1]?.key || availableMetrics[0].key
      );
    }
  }, [availableMetrics, scatterXKey, scatterYKey]);

  const scatterXMeta = useMemo(
    () => comparisonMetricToAxisMeta(getComparisonMetric(scatterXKey)),
    [scatterXKey]
  );
  const scatterYMeta = useMemo(
    () => comparisonMetricToAxisMeta(getComparisonMetric(scatterYKey)),
    [scatterYKey]
  );

  const metricPickerOptions = useMemo(
    () =>
      availableMetrics.map((metric) => ({
        key: metric.key,
        label: metric.label,
      })),
    [availableMetrics]
  );

  const leagueRows = useMemo(
    () =>
      (competitions || []).filter((row) => {
        const x = Number(row?.[scatterXKey]);
        const y = Number(row?.[scatterYKey]);
        return Number.isFinite(x) && Number.isFinite(y);
      }),
    [competitions, scatterXKey, scatterYKey]
  );

  const leagueSlugKey = useMemo(
    () =>
      leagueRows
        .map((row) => row.slug)
        .filter(Boolean)
        .sort()
        .join("|"),
    [leagueRows]
  );

  useEffect(() => {
    const defaults = getDefaultStyleMapSlugs(leagueRows, 10);
    const initial =
      defaults.length > 0
        ? defaults
        : leagueRows.map((row) => row.slug).filter(Boolean);
    setSelectedSlugs(new Set(initial));
  }, [leagueSlugKey]);

  const plottedLeagueRows = useMemo(
    () => leagueRows.filter((row) => selectedSlugs.has(row.slug)),
    [leagueRows, selectedSlugs]
  );

  const leagueAbbreviations = useMemo(
    () => uniqueTeamAbbreviations(plottedLeagueRows.map((row) => row.name)),
    [plottedLeagueRows]
  );

  const toggleLeagueSlug = useCallback((slug) => {
    setSelectedSlugs((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) {
        if (next.size <= 1) return prev;
        next.delete(slug);
      } else {
        next.add(slug);
      }
      return next;
    });
  }, []);

  const selectTopTenLeagues = useCallback(() => {
    const defaults = getDefaultStyleMapSlugs(leagueRows, 10);
    setSelectedSlugs(
      new Set(
        defaults.length > 0
          ? defaults
          : leagueRows.map((row) => row.slug).filter(Boolean)
      )
    );
  }, [leagueRows]);

  const selectAllLeagues = useCallback(() => {
    setSelectedSlugs(
      new Set(leagueRows.map((row) => row.slug).filter(Boolean))
    );
  }, [leagueRows]);

  const handleScatterPositions = useCallback((nextMarkers) => {
    const signature = markersSignature(nextMarkers);
    if (signature === scatterMarkerSignatureRef.current) return;
    scatterMarkerSignatureRef.current = signature;
    setScatterMarkers(nextMarkers);
  }, []);

  const scatterMarkerPlugin = useMemo(
    () =>
      createScatterMarkerPlugin({
        labelColor: color,
        onPositions: handleScatterPositions,
        pluginId: "compareLeagueStyleMapMarkers",
      }),
    [color, handleScatterPositions]
  );

  const scatterBadgeSize = scatterPlotCountBadgeSize(plottedLeagueRows.length);
  const scatterHitRadius = scatterBadgeHitRadius(scatterBadgeSize);
  const scatterDense = plottedLeagueRows.length > 12;

  const styleMapLegendItems = useMemo(() => {
    const items = leagueRows.map((row) => ({
      slug: row.slug,
      name: row.name,
      badgeUrl: resolveLeagueLogoUrl(row.id),
    }));
    items.sort((a, b) => a.name.localeCompare(b.name));
    return items;
  }, [leagueRows]);

  const shareLegendItems = useMemo(
    () => styleMapLegendItems.filter((item) => selectedSlugs.has(item.slug)),
    [styleMapLegendItems, selectedSlugs]
  );

  const scatterSelectionKey = useMemo(
    () => [...selectedSlugs].sort().join(","),
    [selectedSlugs]
  );

  useEffect(() => {
    setHighlightedSlug(null);
  }, [scatterSelectionKey, scatterXKey, scatterYKey]);

  const scatterData = useMemo(() => {
    const points = plottedLeagueRows
      .map((entity) => {
        const x = Number(entity[scatterXKey]);
        const y = Number(entity[scatterYKey]);
        if (!Number.isFinite(x) || !Number.isFinite(y)) return null;

        const name = entity.name;
        const badgeUrl = resolveLeagueLogoUrl(entity.id);

        return {
          x,
          y,
          slug: entity.slug,
          markerId: name,
          team: name,
          name,
          row: entity,
          abbr: leagueAbbreviations.get(name) || "",
          badgeUrl,
        };
      })
      .filter(Boolean);

    return {
      datasets: [
        {
          label: "Leagues",
          data: points,
          backgroundColor: points.map((point) =>
            isLowSample(point.row) ? LOW_SAMPLE_COLOR : LEAGUE_POINT_FILL
          ),
          borderColor: points.map((point) =>
            isLowSample(point.row) ? LOW_SAMPLE_COLOR : LEAGUE_POINT_BORDER
          ),
          borderWidth: 1,
          pointRadius: points.map((point) => (point.badgeUrl ? 0 : 4)),
          pointHoverRadius: points.map((point) => (point.badgeUrl ? 0 : 6)),
          pointHitRadius: scatterHitRadius,
        },
      ],
    };
  }, [
    plottedLeagueRows,
    scatterXKey,
    scatterYKey,
    leagueAbbreviations,
    scatterHitRadius,
  ]);

  const scatterAxisRanges = useMemo(() => {
    const leaguePoints = plottedLeagueRows.map((row) => ({
      x: Number(row[scatterXKey]),
      y: Number(row[scatterYKey]),
    }));
    return {
      x: computeAxisRange(
        leaguePoints.map((p) => p.x),
        scatterXMeta
      ),
      y: computeAxisRange(
        leaguePoints.map((p) => p.y),
        scatterYMeta
      ),
    };
  }, [plottedLeagueRows, scatterXKey, scatterYKey, scatterXMeta, scatterYMeta]);

  const scatterOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: SCATTER_CHART_INTERACTION,
      plugins: {
        legend: { display: false },
        tooltip: buildScatterTooltipOptions(tooltipBackground, {
          title(items) {
            return items[0]?.raw?.name || "";
          },
          label(context) {
            const { x, y, row } = context.raw || {};
            const line = `${scatterXMeta.label} ${formatScatterAxisValue(x, scatterXMeta)} · ${scatterYMeta.label} ${formatScatterAxisValue(y, scatterYMeta)}`;
            const lines = [line];
            if (row?.played != null && row?.total != null) {
              lines.push(`${row.played} of ${row.total} matches played`);
            }
            if (row && isLowSample(row)) {
              lines.push("Small sample so far this season");
            }
            return lines;
          },
        }),
      },
      layout: {
        padding: SCATTER_EXTERNAL_AXIS_LAYOUT_PADDING,
      },
      scales: {
        x: {
          title: { display: false },
          ticks: {
            color,
            font: { size: 10 },
            stepSize: scatterAxisRanges.x.stepSize,
            padding: 2,
          },
          grid: { color: gridColor, drawTicks: false },
          border: { display: false },
          min: scatterAxisRanges.x.min,
          max: scatterAxisRanges.x.max,
        },
        y: {
          title: { display: false },
          ticks: {
            color,
            font: { size: 10 },
            stepSize: scatterAxisRanges.y.stepSize,
            padding: 2,
          },
          grid: { color: gridColor, drawTicks: false },
          border: { display: false },
          min: scatterAxisRanges.y.min,
          max: scatterAxisRanges.y.max,
        },
      },
    }),
    [
      color,
      gridColor,
      tooltipBackground,
      scatterXMeta,
      scatterYMeta,
      scatterAxisRanges,
    ]
  );

  if (leagueRows.length < 4 || !scatterXMeta || !scatterYMeta) return null;

  const plottedCount = plottedLeagueRows.length;

  return (
    <ChartCard
      title="Style map"
      subtitle="Pick any two metrics to compare leagues. Use Choose leagues to add or remove sides on the chart (top 10 shown by default). The table below has every league and flags small samples."
    >
      <div className="Competition__comparisonAxisPickers Competition__comparisonAxisPickers--scatter">
        <MetricPicker
          label="X axis"
          value={scatterXKey}
          options={metricPickerOptions}
          onChange={setScatterXKey}
        />
        <MetricPicker
          label="Y axis"
          value={scatterYKey}
          options={metricPickerOptions}
          onChange={setScatterYKey}
        />
      </div>
      <StyleMapLeagueSelectionBar
        plottedCount={plottedCount}
        totalCount={leagueRows.length}
        leagues={styleMapLegendItems}
        selectedSlugs={selectedSlugs}
        onToggle={toggleLeagueSlug}
        onSelectTopTen={selectTopTenLeagues}
        onSelectAll={selectAllLeagues}
      />
      <ShareableVisual
        className="Competition__shareable"
        filename={sanitizeImageFilename(
          `style-map-${scatterXMeta.label}-vs-${scatterYMeta.label}`
        )}
        shareTitle={`Style map: ${scatterXMeta.label} vs ${scatterYMeta.label}`}
      >
        <div data-share-capture className="Competition__shareCapture">
          <p className="Competition__shareCaptureTitle">
            Style map
            <span className="Competition__shareCaptureSub">
              {scatterXMeta.label} vs {scatterYMeta.label} · {plottedCount} of{" "}
              {leagueRows.length} leagues
            </span>
          </p>
          <ScatterAxisFrame
            xLabel={scatterXMeta.label}
            yLabel={scatterYMeta.label}
          >
            <div
              className={`Competition__comparisonScatterWrap CompetitionsCompare-chartScroll${
                scatterDense ? " Competition__comparisonScatterWrap--dense" : ""
              }`}
            >
              <Scatter
                key={`${theme}-${scatterXKey}-${scatterYKey}-${scatterSelectionKey}`}
                data={scatterData}
                options={scatterOptions}
                plugins={[scatterMarkerPlugin]}
              />
              <ScatterBadgeLayer
                markers={scatterMarkers}
                size={scatterBadgeSize}
                highlightedSlug={highlightedSlug}
              />
            </div>
          </ScatterAxisFrame>
          <StyleMapLegend
            items={shareLegendItems}
            className="Competition__radarLegend--shareCompact"
            highlightedSlug={highlightedSlug}
            onHighlightSlug={setHighlightedSlug}
          />
        </div>
      </ShareableVisual>
    </ChartCard>
  );
}

export default function CompetitionCompareCharts({ competitions = [] }) {
  useEffect(() => {
    if (!competitions.length || process.env.NODE_ENV !== "production") return;
    requestJourneyContentRefresh();
  }, [competitions.length]);

  if (!competitions.length) return null;

  return (
    <div className="CompetitionsCompare-charts">
      <MetricLeaderboard competitions={competitions} />
      <JourneyContentBreak>
        Switch axes on the style map to compare scoring, discipline and
        home-advantage profiles across leagues.
      </JourneyContentBreak>
      <LeagueStyleMap competitions={competitions} />
    </div>
  );
}
