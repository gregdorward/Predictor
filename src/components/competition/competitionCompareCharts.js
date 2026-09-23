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
  buildCrossLeagueAveragePoint,
  comparisonMetricToAxisMeta,
  computeAxisRange,
  createScatterMarkerPlugin,
  formatScatterAxisValue,
  markersSignature,
  ScatterBadgeLayer,
  SCATTER_AVERAGE_ABBR,
  SCATTER_AVERAGE_COLOR,
  SCATTER_AVERAGE_FILL,
} from "./scatterStyleMap";
import {
  averageForMetric,
  CHARTABLE_METRIC_KEYS,
  COMPARISON_METRICS,
  formatMetricValue,
  getComparisonMetric,
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

  const crossLeagueAverage = useMemo(
    () => buildCrossLeagueAveragePoint(competitions, scatterXKey, scatterYKey),
    [competitions, scatterXKey, scatterYKey]
  );

  const plottedEntities = useMemo(() => {
    const list = [...leagueRows];
    if (crossLeagueAverage) list.push(crossLeagueAverage);
    return list;
  }, [leagueRows, crossLeagueAverage]);

  const leagueAbbreviations = useMemo(
    () => uniqueTeamAbbreviations(leagueRows.map((row) => row.name)),
    [leagueRows]
  );

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

  const scatterBadgeSize = 18;

  const scatterData = useMemo(() => {
    const points = plottedEntities
      .map((entity) => {
        const x = Number(entity[scatterXKey]);
        const y = Number(entity[scatterYKey]);
        if (!Number.isFinite(x) || !Number.isFinite(y)) return null;

        const isAverage = Boolean(entity.isLeagueAverage);
        const name = entity.name;
        const badgeUrl = isAverage ? null : resolveLeagueLogoUrl(entity.id);

        return {
          x,
          y,
          markerId: name,
          team: name,
          name,
          row: isAverage ? null : entity,
          abbr: isAverage
            ? SCATTER_AVERAGE_ABBR
            : leagueAbbreviations.get(name) || "",
          badgeUrl,
          isLeagueAverage: isAverage,
        };
      })
      .filter(Boolean);

    return {
      datasets: [
        {
          label: "Leagues",
          data: points,
          backgroundColor: points.map((point) => {
            if (point.isLeagueAverage) return SCATTER_AVERAGE_FILL;
            return isLowSample(point.row) ? LOW_SAMPLE_COLOR : LEAGUE_POINT_FILL;
          }),
          borderColor: points.map((point) => {
            if (point.isLeagueAverage) return SCATTER_AVERAGE_COLOR;
            return isLowSample(point.row) ? LOW_SAMPLE_COLOR : LEAGUE_POINT_BORDER;
          }),
          borderWidth: 1,
          pointRadius: points.map((point) => (point.badgeUrl ? 0 : 4)),
          pointHoverRadius: points.map((point) =>
            point.badgeUrl ? scatterBadgeSize * 0.9375 + 2 : 6
          ),
          pointHitRadius: scatterBadgeSize * 0.9375 + 4,
        },
      ],
    };
  }, [
    plottedEntities,
    scatterXKey,
    scatterYKey,
    leagueAbbreviations,
    scatterBadgeSize,
  ]);

  const scatterAxisRanges = useMemo(() => {
    const leaguePoints = leagueRows.map((row) => ({
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
  }, [leagueRows, scatterXKey, scatterYKey, scatterXMeta, scatterYMeta]);

  const scatterOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: tooltipBackground,
          titleColor: "#ffffff",
          bodyColor: "#ffffff",
          callbacks: {
            title(items) {
              return items[0]?.raw?.name || "";
            },
            label(context) {
              const { x, y, abbr, row, isLeagueAverage } = context.raw || {};
              const line = `${scatterXMeta.label} ${formatScatterAxisValue(x, scatterXMeta)} · ${scatterYMeta.label} ${formatScatterAxisValue(y, scatterYMeta)}`;
              if (isLeagueAverage) {
                return ["Unweighted mean across leagues shown", line];
              }
              const lines = abbr ? [`${abbr}`, line] : [line];
              if (row?.played != null && row?.total != null) {
                lines.push(`${row.played} of ${row.total} matches played`);
              }
              if (row && isLowSample(row)) {
                lines.push("Small sample so far this season");
              }
              return lines;
            },
          },
        },
      },
      layout: {
        padding: { top: 14, right: 28, bottom: 12, left: 12 },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: scatterXMeta?.label || "",
            color,
            font: { size: 12, weight: "600" },
            padding: { top: 4, bottom: 2 },
          },
          ticks: {
            color,
            font: { size: 10 },
            stepSize: scatterAxisRanges.x.stepSize,
            padding: 4,
          },
          grid: { color: gridColor, drawTicks: false },
          border: { display: false },
          min: scatterAxisRanges.x.min,
          max: scatterAxisRanges.x.max,
        },
        y: {
          title: {
            display: true,
            text: scatterYMeta?.label || "",
            color,
            font: { size: 12, weight: "600" },
            padding: { top: 2, bottom: 4 },
          },
          ticks: {
            color,
            font: { size: 10 },
            stepSize: scatterAxisRanges.y.stepSize,
            padding: 4,
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

  return (
    <ChartCard
      title="Style map"
      subtitle="Pick any two metrics to see how each league measures up. The yellow point is the unweighted mean across leagues shown; grey leagues have a small sample so far."
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
              {scatterXMeta.label} vs {scatterYMeta.label} · {leagueRows.length}{" "}
              leagues
            </span>
          </p>
          <div className="Competition__comparisonScatterWrap CompetitionsCompare-chartScroll">
            <Scatter
              key={`${theme}-${scatterXKey}-${scatterYKey}`}
              data={scatterData}
              options={scatterOptions}
              plugins={[scatterMarkerPlugin]}
            />
            <ScatterBadgeLayer
              markers={scatterMarkers}
              size={scatterBadgeSize}
            />
          </div>
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
