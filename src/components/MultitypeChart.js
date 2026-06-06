import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import annotationPlugin from "chartjs-plugin-annotation";
import { useChartTheme, getChartColors } from "./Chart";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  annotationPlugin
);

const MultiTypeChart = ({ dataArray, text }) => {
  const theme = useChartTheme();
  const { color, gridColor, tooltipBackground } = getChartColors(theme);

  const positiveColor = "#01a501";
  const positiveColorSoft = "#01a50166";
  const negativeColor = "#d71200";
  const negativeColorSoft = "#d7120066";

  if (!dataArray?.length) {
    return <div style={{ color, textAlign: "center" }}>No data available for this chart.</div>;
  }

  const labels = dataArray.map((_, index) => `Game ${index + 1}`);
  const barData = dataArray.map((item) => item[0] - item[1]);

  const getBarFillColor = (value) => (value >= 0 ? positiveColor : negativeColor);

  const getBarGradient = (ctx, bar, value) => {
    const x0 = bar.x;
    const y0 = bar.base;
    const x1 = bar.x;
    const y1 = bar.y;

    if (![x0, y0, x1, y1].every(Number.isFinite)) {
      return getBarFillColor(value);
    }

    const gradient = ctx.createLinearGradient(x0, y0, x1, y1);
    if (value >= 0) {
      gradient.addColorStop(0, positiveColorSoft);
      gradient.addColorStop(1, positiveColor);
    } else {
      gradient.addColorStop(0, negativeColor);
      gradient.addColorStop(1, negativeColorSoft);
    }
    return gradient;
  };

  const data = {
    labels,
    datasets: [
      {
        type: "bar",
        label: "XG Difference",
        data: barData,
        borderWidth: 0,
        barPercentage: 0.72,
        categoryPercentage: 0.82,
        backgroundColor(context) {
          const { chart, dataIndex } = context;
          const value = context.dataset.data[dataIndex];
          const meta = chart.getDatasetMeta(0);
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
    ],
  };

  const options = {
    color,
    responsive: true,
    aspectRatio: 1.2,
    maintainAspectRatio: true,
    layout: {
      padding: {
        top: 4,
      },
    },
    animation: {
      duration: 700,
      easing: "easeOutQuart",
    },
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
        font: {
          size: 13,
          weight: "600",
        },
        padding: {
          bottom: 4,
        },
      },
      subtitle: {
        display: true,
        text: "XG difference per game",
        color,
        font: {
          size: 11,
          weight: "400",
        },
        padding: {
          bottom: 12,
        },
      },
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        backgroundColor: tooltipBackground,
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        padding: 10,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          title(items) {
            return items[0]?.label ?? "";
          },
          label(context) {
            const value = context.raw;
            if (value === 0) return "Even";
            const direction = value > 0 ? "Positive" : "Negative";
            return `${direction} XG diff: ${value > 0 ? "+" : ""}${value.toFixed(2)}`;
          },
        },
      },
      annotation: {
        annotations: {
          zeroLine: {
            type: "line",
            yMin: 0,
            yMax: 0,
            borderColor: color,
            borderWidth: 1,
            borderDash: [4, 4],
            opacity: 0.35,
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        suggestedMin: -1.5,
        suggestedMax: 1.5,
        grid: {
          color: gridColor,
          drawTicks: false,
        },
        border: {
          display: false,
        },
        ticks: {
          color,
          font: {
            size: 11,
            weight: "500",
          },
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
          color,
          font: {
            size: 11,
            weight: "500",
          },
        },
      },
    },
  };

  return (
    <div className="ComparisonBarChart">
      <Bar
        key={theme}
        data={data}
        options={options}
      />
      <div className="ComparisonBarChart-legend">
        <span className="ComparisonBarChart-legendItem">
          <span className="ComparisonBarChart-legendSwatch ComparisonBarChart-legendSwatch--home" />
          Positive XG diff
        </span>
        <span className="ComparisonBarChart-legendItem">
          <span className="ComparisonBarChart-legendSwatch ComparisonBarChart-legendSwatch--away" />
          Negative XG diff
        </span>
      </div>
    </div>
  );
};

export default MultiTypeChart;
