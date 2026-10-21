import "./charts/chartSetup";
import { Bar } from "react-chartjs-2";
import ShareableVisual from "./ShareableVisual";
import { sanitizeImageFilename } from "../utils/captureElementImage";
import {
  useChartTheme,
  getChartColors,
  tooltipStyle,
  withAlpha,
} from "./charts/chartTheme";
import { staggeredBars } from "./charts/chartMotion";
import LazyChart from "./charts/LazyChart";

const ASPECT_RATIO = 1.2;
const ROLLING_WINDOW = 3;

export function xgDiffValues(dataArray) {
  return (dataArray || [])
    .map((item) => Number(item?.[0]) - Number(item?.[1]))
    .filter((value) => Number.isFinite(value));
}

/** Symmetric y-range so several xG difference charts share one scale. */
export function sharedXgDiffRange(...dataArrays) {
  const values = dataArrays.flatMap(xgDiffValues);
  const peak = values.length ? Math.max(...values.map(Math.abs)) : 0;
  return Math.max(1.5, Math.ceil((peak + 0.25) * 2) / 2);
}

function rollingAverage(values, window) {
  return values.map((_, index) => {
    if (index < window - 1) return null;
    const slice = values.slice(index - window + 1, index + 1);
    return Number((slice.reduce((sum, v) => sum + v, 0) / window).toFixed(2));
  });
}

function signed(value, decimals = 2) {
  const n = Number(value);
  if (!Number.isFinite(n) || n === 0) return "0.00";
  return `${n > 0 ? "+" : "−"}${Math.abs(n).toFixed(decimals)}`;
}

const MultiTypeChart = ({ dataArray, text, yRange }) => {
  const theme = useChartTheme();
  const colors = getChartColors(theme);
  const { color, gridColor } = colors;

  const positiveColor = colors.home;
  const positiveColorSoft = withAlpha(colors.home, 0.4);
  const negativeColor = colors.away;
  const negativeColorSoft = withAlpha(colors.away, 0.4);

  if (!dataArray?.length) {
    return <div style={{ color, textAlign: "center" }}>No data available for this chart.</div>;
  }

  const labels = dataArray.map((_, index) => `Game ${index + 1}`);
  const barData = dataArray.map((item) => item[0] - item[1]);
  const finiteBars = barData.filter((v) => Number.isFinite(v));
  const mean = finiteBars.length
    ? finiteBars.reduce((sum, v) => sum + v, 0) / finiteBars.length
    : 0;
  const rolling =
    barData.length >= ROLLING_WINDOW + 1
      ? rollingAverage(barData, ROLLING_WINDOW)
      : null;
  const range = yRange || sharedXgDiffRange(dataArray);

  const getBarFillColor = (value) => (value >= 0 ? positiveColor : negativeColor);

  const getBarGradient = (ctx, bar, value) => {
    const x0 = bar.x;
    const y0 = bar.base;
    const x1 = bar.x;
    const y1 = bar.y;

    if (![x0, y0, x1, y1].every(Number.isFinite) || y0 === y1) {
      return getBarFillColor(value);
    }

    const gradient = ctx.createLinearGradient(x0, y0, x1, y1);
    if (value >= 0) {
      gradient.addColorStop(0, positiveColorSoft);
      gradient.addColorStop(1, positiveColor);
    } else {
      gradient.addColorStop(0, negativeColorSoft);
      gradient.addColorStop(1, negativeColor);
    }
    return gradient;
  };

  const datasets = [
    {
      type: "bar",
      label: "XG Difference",
      data: barData,
      borderWidth: 0,
      barPercentage: 0.72,
      categoryPercentage: 0.82,
      order: 2,
      backgroundColor(context) {
        const { chart, dataIndex } = context;
        const value = context.dataset.data[dataIndex];
        const meta = chart.getDatasetMeta(context.datasetIndex);
        const bar = meta.data[dataIndex];

        if (!bar) {
          return getBarFillColor(value);
        }

        return getBarGradient(chart.ctx, bar, value);
      },
      hoverBackgroundColor(context) {
        const value = context.dataset.data[context.dataIndex];
        return getBarFillColor(value);
      },
    },
  ];

  if (rolling) {
    datasets.push({
      type: "line",
      label: `${ROLLING_WINDOW}-game average`,
      data: rolling,
      borderColor: color,
      backgroundColor: color,
      borderWidth: 2,
      tension: 0.35,
      pointRadius: 0,
      pointHoverRadius: 4,
      pointHoverBackgroundColor: color,
      pointHoverBorderColor: colors.surface,
      pointHoverBorderWidth: 2,
      spanGaps: false,
      order: 1,
    });
  }

  const data = { labels, datasets };

  const options = {
    color,
    responsive: true,
    aspectRatio: ASPECT_RATIO,
    maintainAspectRatio: true,
    layout: {
      padding: {
        top: 4,
      },
    },
    ...staggeredBars({ step: 45 }),
    interaction: { mode: "index", intersect: false },
    elements: {
      bar: {
        borderWidth: 0,
        borderRadius: 6,
        borderSkipped: false,
      },
    },
    plugins: {
      title: {
        display: true,
        text,
        color,
        font: { size: 13, weight: 600 },
        padding: {
          bottom: 4,
        },
      },
      subtitle: {
        display: true,
        text: rolling
          ? `xG difference per game. Line shows the ${ROLLING_WINDOW}-game average.`
          : "xG difference per game",
        color,
        font: { size: 11, weight: 400 },
        padding: {
          bottom: 12,
        },
      },
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        ...tooltipStyle(colors),
        filter: (item) => item.raw != null,
        callbacks: {
          title(items) {
            return items[0]?.label ?? "";
          },
          label(context) {
            const value = context.raw;
            if (context.dataset.type === "line") {
              return `${context.dataset.label}: ${signed(value)}`;
            }
            if (value === 0) return "Even";
            return `xG difference: ${signed(value)}`;
          },
        },
      },
      annotation: {
        annotations: {
          zeroLine: {
            type: "line",
            yMin: 0,
            yMax: 0,
            borderColor: colors.reference,
            borderWidth: 1,
          },
          mean: {
            type: "line",
            yMin: mean,
            yMax: mean,
            borderColor: colors.accent,
            borderWidth: 1.5,
            borderDash: [5, 4],
            label: {
              display: true,
              content: `Avg ${signed(mean)}`,
              position: "end",
              backgroundColor: colors.accent,
              color: "#ffffff",
              font: { size: 10, weight: 600 },
              padding: { x: 6, y: 3 },
              borderRadius: 4,
            },
          },
        },
      },
    },
    scales: {
      y: {
        min: -range,
        max: range,
        grid: {
          color: gridColor,
          drawTicks: false,
        },
        border: {
          display: false,
        },
        ticks: {
          color: colors.faint,
          padding: 6,
          font: {
            size: 11,
            weight: 600,
          },
          callback: (value) => (Number(value) === 0 ? "0" : signed(value, 1)),
        },
      },
      x: {
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
        ticks: {
          color: colors.faint,
          maxRotation: 0,
          autoSkip: true,
          font: {
            size: 11,
            weight: 600,
          },
        },
      },
    },
  };

  const shareFilename = sanitizeImageFilename(text || "xg-diff");
  const shareTitle = text || "XG difference chart";

  return (
    <ShareableVisual
      filename={shareFilename}
      shareTitle={shareTitle}
      className="ComparisonBarChart-share"
    >
      <div data-share-capture className="ComparisonBarChart">
        <LazyChart aspectRatio={ASPECT_RATIO}>
          <Bar
            key={theme}
            data={data}
            options={options}
          />
        </LazyChart>
        <div className="ComparisonBarChart-legend">
          <span className="ComparisonBarChart-legendItem">
            <span className="ComparisonBarChart-legendSwatch ComparisonBarChart-legendSwatch--home" />
            Created more xG
          </span>
          <span className="ComparisonBarChart-legendItem">
            <span className="ComparisonBarChart-legendSwatch ComparisonBarChart-legendSwatch--away" />
            Conceded more xG
          </span>
          {rolling ? (
            <span className="ComparisonBarChart-legendItem">
              <span className="ComparisonBarChart-legendSwatch ComparisonBarChart-legendSwatch--line" />
              {ROLLING_WINDOW}-game average
            </span>
          ) : null}
        </div>
      </div>
    </ShareableVisual>
  );
};

export default MultiTypeChart;
