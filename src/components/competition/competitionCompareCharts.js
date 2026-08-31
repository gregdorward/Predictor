import { useMemo, useState } from "react";
import { Bar, Scatter } from "react-chartjs-2";
import { useChartTheme, getChartColors } from "../Chart";
import ShareableVisual from "../ShareableVisual";
import { sanitizeImageFilename } from "../../utils/captureElementImage";
import {
  averageForMetric,
  CHARTABLE_METRIC_KEYS,
  formatMetricValue,
  getComparisonMetric,
  isLowSample,
  rankByMetric,
} from "../../seo/competitionOverviewData";

const ACCENT = "#f57701";
const LOW_SAMPLE_COLOR = "#9a9a9a";

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

/**
 * Leagues ranked by one market, with the metric switchable so the page needs a
 * single URL rather than one near-duplicate page per metric.
 */
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

/**
 * Goals average against BTTS rate. Two leagues can share a goals average while
 * distributing those goals very differently, which is the whole point of
 * plotting them together and cannot be seen on any single competition page.
 */
function GoalsVersusBttsScatter({ competitions }) {
  const theme = useChartTheme();
  const { color, gridColor, tooltipBackground } = getChartColors(theme);

  const points = useMemo(
    () =>
      (competitions || [])
        .filter((row) => row.avgGoals !== null && row.btts !== null)
        .map((row) => ({
          x: Number(row.avgGoals),
          y: Number(row.btts),
          row,
        })),
    [competitions]
  );

  if (points.length < 4) return null;

  const goalsMetric = getComparisonMetric("avgGoals");
  const bttsMetric = getComparisonMetric("btts");

  const data = {
    datasets: [
      {
        data: points,
        pointRadius: 5,
        pointHoverRadius: 7,
        backgroundColor: points.map((point) =>
          isLowSample(point.row) ? LOW_SAMPLE_COLOR : ACCENT
        ),
      },
    ],
  };

  const options = {
    color,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: {
        backgroundColor: tooltipBackground,
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        displayColors: false,
        callbacks: {
          title(items) {
            return items[0]?.raw?.row?.name ?? "";
          },
          label(context) {
            const { row } = context.raw;
            return [
              `Goals per game: ${formatMetricValue(row.avgGoals, goalsMetric)}`,
              `BTTS: ${formatMetricValue(row.btts, bttsMetric)}`,
              `${row.played} of ${row.total} matches played`,
            ];
          },
        },
      },
    },
    scales: {
      x: {
        title: { display: true, text: "Goals per game", color, font: { size: 11 } },
        ticks: { color, font: { size: 10 } },
        grid: { color: gridColor, drawTicks: false },
        border: { display: false },
      },
      y: {
        title: { display: true, text: "BTTS %", color, font: { size: 11 } },
        ticks: { color, font: { size: 10 } },
        grid: { color: gridColor, drawTicks: false },
        border: { display: false },
      },
    },
  };

  return (
    <ChartCard
      title="Goals per game against BTTS rate"
      subtitle="Leagues to the right score more; leagues higher up spread those goals across both teams more often. A high-goals, low-BTTS league tends to produce one-sided scorelines."
    >
      <ShareableVisual
        className="Competition__shareable"
        filename={sanitizeImageFilename("leagues-goals-per-game-vs-btts")}
        shareTitle="Goals per game against BTTS rate"
      >
        <div data-share-capture className="Competition__shareCapture">
          <p className="Competition__shareCaptureTitle">
            Goals per game against BTTS rate
            <span className="Competition__shareCaptureSub">
              {points.length} leagues
            </span>
          </p>
          <div
            className="CompetitionsCompare-chartScroll"
            style={{ height: "380px" }}
          >
            <Scatter key={theme} data={data} options={options} />
          </div>
        </div>
      </ShareableVisual>
    </ChartCard>
  );
}

export default function CompetitionCompareCharts({ competitions = [] }) {
  if (!competitions.length) return null;

  return (
    <div className="CompetitionsCompare-charts">
      <MetricLeaderboard competitions={competitions} />
      <GoalsVersusBttsScatter competitions={competitions} />
    </div>
  );
}
