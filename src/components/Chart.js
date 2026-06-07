import { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  PointElement,
  ArcElement,
  LineElement,
  Filler,
  BarElement,
  Title,
  Tooltip,
  Legend,
  SubTitle,
} from "chart.js";
import { Line, Radar, Bar, Doughnut, PolarArea, Pie } from "react-chartjs-2";
import annotationPlugin from 'chartjs-plugin-annotation';

ChartJS.register(
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  PointElement,
  ArcElement,
  Filler,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  SubTitle,
  annotationPlugin
);

function resolveChartTheme() {
  return document.body.classList.contains("dark-mode") ? "dark" : "light";
}

function useChartTheme() {
  const [theme, setTheme] = useState(resolveChartTheme);

  useEffect(() => {
    const syncTheme = () => setTheme(resolveChartTheme());
    const observer = new MutationObserver(syncTheme);
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return theme;
}

function getChartColors(theme) {
  if (theme === "dark") {
    return {
      color: "#ffffff",
      gridColor: "rgba(255, 255, 255, 0.08)",
      tooltipBackground: "#1f1f1f",
    };
  }

  return {
    color: "#020029",
    gridColor: "rgba(2, 0, 41, 0.08)",
    tooltipBackground: "#020029",
  };
}

const valueLabelPlugin = {
  id: "valueLabelPlugin",
  afterDatasetsDraw(chart, args, pluginOptions) {
    const { ctx } = chart;

    const dataset = chart.data.datasets[0];
    const total = dataset.data.reduce((a, b) => a + b, 0);

    chart.getDatasetMeta(0).data.forEach((arc, index) => {
      const value = dataset.data[index];
      const percentage = ((value / total) * 100).toFixed(1) + "%";

      // Correct position inside the slice
      const { x, y } = arc.tooltipPosition();

      ctx.save();
      // ctx.fillStyle = "white";
      // ctx.font = "bold 18px";
      // ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(percentage, x, y);
      ctx.restore();
    });
  }
};


export function VotePieChart({ pollData, theme }) {
  let color;
  let background;
  const home = Number(pollData.vote1);
  const away = Number(pollData.vote2);
  const draw = Number(pollData.voteX);
  const total = home + away + draw;

  if (theme === 'light') {
    color = "#020029";
    background = '#ffffff'
  } else if (theme === 'dark') {
    color = "#ffffff";
    background = "#020029";
  } else {
    color = "#f57701";
    background = "#020029";
  }

  // Labels with line breaks for key, percentage, and vote count
  const labelsWithDetails = [
    `Home\n${((home / total) * 100).toFixed(1)}%\n(${home} votes)`,
    `Away\n${((away / total) * 100).toFixed(1)}%\n(${away} votes)`,
    `Draw\n${((draw / total) * 100).toFixed(1)}%\n(${draw} votes)`
  ];

  const chartOptions = {
    layout: { padding: { top: 5, bottom: 5 } },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          // padding: 15,
          font: { size: 14 },
          color: color,
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.label.replace(/\n/g, ' ')}: ${ctx.raw}`, // tooltip shows in one line
        },
      },
      title: {
        display: true,
        text: "Who will win?",
        color: color,
        font: { size: 14 },
      },
    },
    animation: { duration: 600 },
  };

  const data = {
    labels: labelsWithDetails,
    datasets: [
      {
        data: [home, away, draw],
        backgroundColor: ['#01a501', '#ae1001', '#f57701'],
        borderColor: background,
        borderWidth: 2,
      },
    ],
  };

  return <Pie data={data} options={chartOptions} className="Pie" />;
}



export function BTTSPieChart({ pollData, theme }) {
  let color;
  let background
  const yes = Number(pollData.voteYes);
  const no = Number(pollData.voteNo);
  const total = yes + no;

  if (theme === 'light') {
    color = "#020029";
    background = '#ffffff'
  } else if (theme === 'dark') {
    color = "#ffffff";
    background = "#020029";
  } else {
    color = "#f57701";
    background = "#020029";
  }

  // Labels with line breaks for key, percentage, and vote count
  const labelsWithDetails = [
    `Yes\n${((yes / total) * 100).toFixed(1)}%\n(${yes} votes)`,
    `No\n${((no / total) * 100).toFixed(1)}%\n(${no} votes)`
  ];

  const chartOptions = {
    layout: { padding: { top: 5, bottom: 5 } },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          // padding: 15,
          font: { size: 14 },
          color: color,
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.label.replace(/\n/g, ' ')}: ${ctx.raw}`, // tooltip in one line
        },
      },
      title: {
        display: true,
        text: "Will both teams score?",
        color: color,
        font: { size: 14 },
      },
    },
    animation: { duration: 600 },
  };

  const data = {
    labels: labelsWithDetails,
    datasets: [
      {
        data: [yes, no],
        backgroundColor: ['#01a501', '#ae1001ff'],
        borderColor: background,
        borderWidth: 2,
      },
    ],
  };

  return <Pie data={data} options={chartOptions} className="Pie" />;
}



export function Chart(props) {
  let length;
  let depth;
  let color;

  if (props.theme === 'light') {
    color = "#020029"
  } else if (props.theme === 'dark') {
    color = "#ffffff"
  } else {
    color = "#f57701"
  }

  if (props.type === "Points over time") {
    length = props.data1.length * 3;
    depth = 0;
  } else if (props.type === "Rolling average points over last 10") {
    length = Math.abs(props.height);
    depth = 0;
  } else if (Math.abs(props.height) > Math.abs(props.depth)) {
    length = Math.abs(props.height);
    depth = -Math.abs(props.height);
  } else if (Math.abs(props.height) < Math.abs(props.depth)) {
    length = Math.abs(props.depth);
    depth = -Math.abs(props.depth);
  } else {
    length = Math.abs(props.depth);
    depth = -Math.abs(props.depth);
  }

  const options = {
    color: color,
    responsive: true,
    aspectRatio: 1.2,
    maintainAspectRatio: true,
    layout: {
      padding: 3,
    },
    elements: {
      point: {
        radius: 0,
      },
    },
    scales: {
      y: {
        suggestedMin: depth,
        suggestedMax: length,
        // suggestedMax: Math.max(...props.data1) > 3 ? Math.max(...props.data1) : 3,
        grid: {
          borderWidth: 1,
          borderColor: "black",
        },
        ticks: {
          font: {
            size: 12,
          },
          color: color,
        },
      },
      x: {
        title: {
          display: false,
          text: "Last X Games",
          font: {
            size: 12,
          },
        },
        grid: {
          borderWidth: 1,
          borderColor: "black",
        },
        ticks: {
          display: false,
          font: {
            size: 12,
          },
        },
      },
    },
    plugins: {
      legend: {
        position: "top",

        labels: {
          boxHeight: 5,
        },
      },
      title: {
        display: true,
        text: props.type,
        color: color,
        font: {
          size: 12,
        },
      },
    },
  };

  const labels = Array.from(props.data1.keys());

  let data = {
    labels,
    datasets: [
      {
        label: props.team1,
        font: {
          color: color,
        },
        data: props.data1,
        borderColor: "#01a501",
        borderWidth: 3,
        backgroundColor: "#01a501",
        tension: props.tension,
      },
      {
        label: props.team2,
        data: props.data2,
        borderColor: "#ae1001ff",
        borderWidth: 3,
        backgroundColor: "#ae1001ff",
        tension: props.tension,
      },
    ],
  };

  return <Line options={options} data={data} />;
}

export function MultilineChart(props) {
  let length;
  let depth;
  let color;

  if (props.theme === 'light') {
    color = "#020029"
  } else if (props.theme === 'dark') {
    color = "#ffffff"
  } else {
    color = "#f57701"
  }

  if (props.type === "Points over time") {
    length = props.data1.length * 3;
    depth = 0;
  } else if (props.type === "Rolling average points over last 10") {
    length = Math.abs(props.height);
    depth = 0;
  } else if (Math.abs(props.height) > Math.abs(props.depth)) {
    length = Math.abs(props.height);
    depth = -Math.abs(props.height);
  } else if (Math.abs(props.height) < Math.abs(props.depth)) {
    length = Math.abs(props.depth);
    depth = -Math.abs(props.depth);
  } else {
    length = Math.abs(props.depth);
    depth = -Math.abs(props.depth);
  }

  const options = {
    color: color,
    responsive: true,
    aspectRatio: 1.2,
    maintainAspectRatio: true,
    layout: {
      padding: 3,
    },
    elements: {
      point: {
        radius: 0,
      },
    },
    scales: {
      y: {
        suggestedMin: depth,
        suggestedMax: length,
        // suggestedMax: Math.max(...props.data1) > 3 ? Math.max(...props.data1) : 3,
        grid: {
          borderWidth: 1,
          borderColor: "black",
        },
        ticks: {
          font: {
            size: 12,
          },
          color: color,
        },
      },
      x: {
        title: {
          display: false,
          text: "Last X Games",
          font: {
            size: 12,
          },
        },
        grid: {
          borderWidth: 1,
          borderColor: "black",
        },
        ticks: {
          display: false,
          font: {
            size: 12,
          },
        },
      },
    },
    plugins: {
      legend: {
        position: "top",

        labels: {
          boxHeight: 5,
        },
      },
      title: {
        display: true,
        text: props.type,
        color: color,
        font: {
          size: 12,
        },
      },
    },
  };

  const labels = Array.from(props.data1.keys());

  let data = {
    labels,
    datasets: [
      {
        label: props.team1,
        font: {
          color: color,
        },
        data: props.data1,
        borderColor: "#01a501",
        borderWidth: 3,
        backgroundColor: "#01a501",
        tension: props.tension,
      },
      {
        label: props.team2,
        data: props.data2,
        borderColor: "#ae1001ff",
        borderWidth: 3,
        backgroundColor: "#ae1001ff",
        tension: props.tension,
      },
      {
        label: `${props.team1} XG Diff`,
        font: {
          color: "white",
        },
        data: props.data3,
        borderColor: "#01a50182",
        borderWidth: 3,
        backgroundColor: "#01a50182",
        tension: props.tension,
        hidden: true,
      },
      {
        label: `${props.team2} XG Diff`,
        font: {
          color: color,
        },
        data: props.data4,
        borderColor: "#ae0f018d",
        borderWidth: 3,
        backgroundColor: "#ae0f018d",
        tension: props.tension,
        hidden: true,
      },
    ],
  };

  return <Line options={options} data={data} />;
}

function index(score) {
  if (score < -4) return 0;       // Deep Red
  if (score < -1) return 1;       // Orange
  if (score < 1) return 2;       // Yellow
  if (score < 4) return 3;       // Light Green
  return 4;                          // Dark Green
}

export const DoughnutChart = ({ pointsTotal, predictedPoints, deltaPTS, theme, label, chartTitle }) => {
  const MAX_CHART_SIZE = 15;
  let color, secondaryColor;

  if (theme === 'light') {
    color = "#020029"
    secondaryColor = "#b8b8b8ff"

  } else if (theme === 'dark') {
    color = "#ffffff"
    secondaryColor = "#b8b8b8ff"
  } else {
    color = "#f57701"
  }

  const predicted = Math.min(predictedPoints, MAX_CHART_SIZE);
  const actual = Math.min(pointsTotal, MAX_CHART_SIZE);

  // Overlay colors
  const COLORS = ['#bf1000', '#e07800ff', '#fff700d8', '#8be800e7', '#01a501'];
  // const overlayColors = deltaValue >= 0
  //   ? ['rgba(0,0,0,0)', COLORS[index(deltaPTS)], 'rgba(0,0,0,0)'] // forward delta
  //   : ['rgba(0,0,0,0)', '#F44336', 'rgba(0,0,0,0)'];            // backward delta

  const data = {
    labels: [
      `Predicted Points: ${predicted.toFixed(0)}`,
    ],
    datasets: [
      {
        label: `Predicted Points: ${predictedPoints.toFixed(1)}`,
        data: [predicted, MAX_CHART_SIZE - predicted],
        backgroundColor: [color, secondaryColor], // filled, remainder
        cutout: '50%',
        rotation: 270,
        circumference: 180,
        borderWidth: 0,
      },
      {
        label: `Actual Points: ${pointsTotal.toFixed(0)}`,
        data: [actual, MAX_CHART_SIZE - actual],
        backgroundColor: [COLORS[index(deltaPTS)], 'rgba(0,0,0,0)'],
        cutout: '50%',
        rotation: 270,
        circumference: 180,
        borderWidth: 0
      }
    ]
  };

  // Central annotation
  const annotation = {
    type: 'doughnutLabel',
    content: () => [
      ` ${deltaPTS >= 0 ? '+' : ''}${deltaPTS.toFixed(1)} pts`,
      ` ${deltaPTS >= 0 ? 'overachieving' : 'underachieving'}`
    ],
    drawTime: 'beforeDraw',
    position: { y: '-50%' },
    font: [{ size: 60, weight: 'bold' }, { size: 40 }],
    color: color,
  };

  const options = {
    rotation: 270,
    circumference: 180,

    plugins: {
      tooltip: {
        enabled: true
      },
      legend: {
        display: true,
        position: 'top',
        labels: {
          font: {
            size: 12
          },
          color: '#FF0000', // fallback for when not using custom generator
          generateLabels: (chart) =>
            chart.data.datasets.map((ds) => ({
              text: ds.label,
              fillStyle: Array.isArray(ds.backgroundColor)
                ? ds.backgroundColor[0]
                : ds.backgroundColor,
              strokeStyle: '#000', // border around color box
              lineWidth: 1,
              fontColor: color, // ✅ custom text color here
              hidden: false,
              datasetIndex: chart.data.datasets.indexOf(ds)
            })),
        },
      },
      annotation: { annotations: { annotation } }

    }

  };

  return <Doughnut data={data} options={options} className="DoughnutChart" />;
};


export function RadarChart(props) {
  const { title, labels, data, data2, team1, team2, max = 1 } = props;
  const theme = useChartTheme();
  const { color, gridColor, tooltipBackground } = getChartColors(theme);

  const homeColor = "#01a501";
  const homeFill = "#01a50133";
  const awayColor = "#d71200";
  const awayFill = "#d7120033";

  const radarLabelAbbreviations = {
    Attack: "Atk",
    Defence: "Def",
    Possession: "Poss",
    Directness: "Dir",
    Precision: "Prec",
    "Attack rating": "Atk",
    "Defence rating": "Def",
    "Ball retention": "Poss",
    "XG For": "XGF",
    "XG Against": "XGA",
    "Attacking precision": "Prec",
  };

  const abbreviateRadarLabel = (label) => {
    if (radarLabelAbbreviations[label]) {
      return radarLabelAbbreviations[label];
    }

    const words = label.trim().split(/\s+/);
    if (words.length > 1) {
      return words.map((word) => word[0]?.toUpperCase() ?? "").join("");
    }

    return label.length > 5 ? label.slice(0, 4) : label;
  };

  const displayLabels = labels.map(abbreviateRadarLabel);

  const options = {
    color,
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 1,
    layout: {
      padding: 4,
    },
    animation: {
      duration: 700,
      easing: "easeOutQuart",
    },
    scales: {
      r: {
        min: 0,
        max,
        ticks: {
          stepSize: 0.25,
          display: false,
          backdropColor: "transparent",
        },
        grid: {
          circular: true,
          color: gridColor,
          lineWidth: 1,
        },
        angleLines: {
          color: gridColor,
          lineWidth: 1,
        },
        pointLabels: {
          color,
          font: {
            size: 9,
            weight: "500",
          },
          padding: 4,
        },
      },
    },
    plugins: {
      legend: {
        position: "top",
        labels: {
          boxWidth: 12,
          boxHeight: 12,
          useBorderRadius: true,
          borderRadius: 3,
          color,
          font: {
            size: 11,
            weight: "500",
          },
          padding: 12,
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: tooltipBackground,
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          title(items) {
            const index = items[0]?.dataIndex;
            return labels[index] ?? items[0]?.label ?? "";
          },
          label(context) {
            return `${context.dataset.label}: ${Number(context.raw).toFixed(2)}`;
          },
        },
      },
      title: {
        display: true,
        text: title,
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
        text: "Higher values indicate stronger ratings",
        color,
        font: {
          size: 11,
          weight: "400",
        },
        padding: {
          bottom: 12,
        },
      },
    },
  };

  const chartData = {
    labels: displayLabels,
    datasets: [
      {
        label: team1,
        data,
        fill: true,
        backgroundColor: homeFill,
        borderColor: homeColor,
        pointBackgroundColor: homeColor,
        pointBorderColor: theme === "dark" ? "#1f1f1f" : "#ffffff",
        pointHoverBackgroundColor: homeColor,
        pointHoverBorderColor: theme === "dark" ? "#ffffff" : "#020029",
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 2.5,
      },
      {
        label: team2,
        data: data2,
        fill: true,
        backgroundColor: awayFill,
        borderColor: awayColor,
        pointBackgroundColor: awayColor,
        pointBorderColor: theme === "dark" ? "#1f1f1f" : "#ffffff",
        pointHoverBackgroundColor: awayColor,
        pointHoverBorderColor: theme === "dark" ? "#ffffff" : "#020029",
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 2.5,
      },
    ],
  };

  return (
    <div className="ComparisonBarChart ComparisonRadarChart">
      <Radar key={theme} options={options} data={chartData} />
    </div>
  );
}

export function RadarChartLeagueStats({
  title,
  teamAData,
  teamBData,
  teamALabel = "Team A",
  teamBLabel = "Team B",
  maxRank = 30,
}) {
  const labels = Object.keys(teamAData).map((key) =>
    key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())
  );

  const teamAValues = Object.values(teamAData).map(Number);
  const teamBValues = Object.values(teamBData).map(Number);

  const chartData = {
    labels,
    datasets: [
      {
        label: teamALabel,
        data: teamAValues,
        fill: true,
        borderColor: "red",
        pointBackgroundColor: "red",
        pointBorderColor: "red",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "rgba(255, 99, 133, 0)",
        borderWidth: 1,
      },
      // {
      //   label: teamBLabel,
      //   data: teamBValues,
      //   fill: true,
      //   borderColor: "yellow",
      //   pointBackgroundColor: "yellow",
      //   pointBorderColor: "yellow",
      //   pointHoverBackgroundColor: "#fff",
      //   pointHoverBorderColor: "yellow",
      //   borderWidth: 2,
      // },
    ],
  };

  const options = {
    responsive: true,
    color: "#fe8c00",
    maintainAspectRatio: true,
    scales: {
      r: {
        min: 1,
        max: maxRank,
        reverse: true,
        angleLines: {
          display: true,
        },
        grid: {
          circular: true,
          // color: "transparent", // or use a solid border color if you want the lines only
        },
        ticks: {
          display: true,
          backdropColor: "transparent",
        },
        pointLabels: {
          color: "#fe8c00",
          font: {
            size: 10,
          },
        },
      },
    },
    plugins: {
      legend: {
        position: "top",
        labels: {
          boxHeight: 10,
          color: "#fe8c00",
        },
      },
      title: {
        display: true,
        text: title || "Team Comparison by League Ranking",
        color: "#fe8c00",
        font: {
          size: 12,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: Rank ${context.formattedValue}`;
          },
        },
      },
    },
  };

  return (
    <PolarArea className="LeagueStatsRadar" data={chartData} options={options} />
  );
}

export function BarChart(props) {
  const { data1, data2, displayDeltas, team1 = "Home", team2 = "Away" } = props;
  const theme = useChartTheme();
  const { color, gridColor, tooltipBackground } = getChartColors(theme);

  const homeColor = "#01a501";
  const homeColorSoft = "#01a50166";
  const awayColor = "#d71200";
  const awayColorSoft = "#d7120066";

  if (!data1 || !data2 || data1.length === 0 || data2.length === 0) {
    return <div style={{ color: color, textAlign: "center" }}>No data available for this chart.</div>;
  }

  const sum = data2.map(function (num, idx) {
    const val1 = data1[idx] ?? 0;
    const val2 = num ?? 0;
    return Number(val2) - Number(val1);
  }).filter(value => !isNaN(value));

  if (sum.length === 0) {
    return <div style={{ color: color, textAlign: "center" }}>Invalid numeric data available for this chart.</div>;
  }

  const max = Math.max(...sum);
  const min = Math.min(...sum);

  function findLargestNum(numOne, numTwo) {
    const tempArr = [Math.abs(numOne), Math.abs(numTwo)];
    return Math.max(...tempArr) + 1;
  }

  const largest = findLargestNum(max, min);

  const getBarFillColor = (value) => (value < 0 ? homeColor : awayColor);

  const getBarGradient = (ctx, bar, value) => {
    const x0 = bar.base;
    const y0 = bar.y;
    const x1 = bar.x;
    const y1 = bar.y;

    if (![x0, y0, x1, y1].every(Number.isFinite)) {
      return getBarFillColor(value);
    }

    const gradient = ctx.createLinearGradient(x0, y0, x1, y1);
    if (value < 0) {
      gradient.addColorStop(0, homeColorSoft);
      gradient.addColorStop(1, homeColor);
    } else {
      gradient.addColorStop(0, awayColorSoft);
      gradient.addColorStop(1, awayColor);
    }
    return gradient;
  };

  const barDeltaLabelPlugin = {
    id: "barDeltaLabelPlugin",
    afterDatasetsDraw(chart) {
      const { ctx } = chart;
      const dataset = chart.data.datasets[0];
      const meta = chart.getDatasetMeta(0);

      meta.data.forEach((bar, index) => {
        const value = dataset.data[index];
        if (!value || !Number.isFinite(bar.x) || !Number.isFinite(bar.y)) return;

        const labelValue =
          displayDeltas && displayDeltas[index] !== undefined
            ? displayDeltas[index]
            : value;
        const absLabel = Math.abs(Number(labelValue));
        const fixed = absLabel.toFixed(2);
        const display =
          fixed.endsWith(".00") ? String(Math.round(absLabel)) : fixed;
        const label = `+${display}`;
        ctx.save();
        ctx.fillStyle = color;
        ctx.font = "600 10px 'Open Sans', sans-serif";
        ctx.textAlign = value < 0 ? "right" : "left";
        ctx.textBaseline = "middle";

        const padding = 8;
        const x = value < 0 ? bar.x - padding : bar.x + padding;
        ctx.fillText(label, x, bar.y);
        ctx.restore();
      });
    },
  };

  const options = {
    color: color,
    indexAxis: "y",
    aspectRatio: 1.2,
    layout: {
      padding: {
        left: 0,
        right: 12,
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
    scales: {
      x: {
        min: -largest,
        max: largest,
        grid: {
          display: true,
          color: gridColor,
          drawTicks: false,
        },
        ticks: {
          display: false,
        },
        border: {
          display: false,
        },
      },
      y: {
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
        afterFit(scale) {
          scale.width = Math.min(scale.width, 100);
        },
        ticks: {
          font: {
            size: 9,
            weight: "500",
          },
          color: color,
          padding: 2,
          autoSkip: false,
        },
      },
    },
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
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
            const leader = value < 0 ? team1 : value > 0 ? team2 : "Even";
            const magnitude = Math.abs(value).toFixed(1);
            return value === 0 ? "Even" : `${leader} +${magnitude}`;
          },
        },
      },
      title: {
        display: true,
        text: props.text,
        color: color,
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
        text: `Bars show which team leads each metric`,
        color: color,
        font: {
          size: 11,
          weight: "400",
        },
        padding: {
          bottom: 12,
        },
      },
      annotation: {
        annotations: {
          zeroLine: {
            type: "line",
            xMin: 0,
            xMax: 0,
            borderColor: color,
            borderWidth: 1,
            borderDash: [4, 4],
            opacity: 0.35,
          },
        },
      },
    },
  };

  const data = {
    labels: props.labels,
    datasets: [
      {
        data: sum,
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

  return (
    <div className="ComparisonBarChart">
      <Bar key={theme} options={options} data={data} plugins={[barDeltaLabelPlugin]} />
      <div className="ComparisonBarChart-legend">
        <span className="ComparisonBarChart-legendItem">
          <span className="ComparisonBarChart-legendSwatch ComparisonBarChart-legendSwatch--home" />
          {team1}
        </span>
        <span className="ComparisonBarChart-legendItem">
          <span className="ComparisonBarChart-legendSwatch ComparisonBarChart-legendSwatch--away" />
          {team2}
        </span>
      </div>
    </div>
  );
}

export function BarChartTwo(props) {
  const dataset = [props.data1, props.data2];
  let color;

  if (props.theme === 'light') {
    color = "#020029"
  } else if (props.theme === 'dark') {
    color = "#ffffff"
  } else {
    color = "#f57701"
  }

  const options = {
    color: color,
    indexAxis: "x",
    // Elements options apply to all of the options unless overridden in a dataset
    // In this case, we are setting the border of each horizontal bar to be 2px wide
    aspectRatio: 1.2,
    elements: {
      bar: {
        borderWidth: 2,
      },
    },
    scales: {
      y: {
        min: -0.8,
        max: 0.8,
        ticks: {
          display: true,
          font: {
            size: 10,
          },
          color: color,
        },
      },
      // y: {
      //   suggestedMin: -0.8,
      //   suggestedMax: 0.8,
      //   ticks: {
      //     font: {
      //       size: 10,
      //     },
      //   },
      // },
    },
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
      },
      title: {
        display: true,
        text: [props.text],
        color: color,
        font: {
          size: 12,
        },
      },
      subtitle: {
        display: true,
        text: "Green - Improving | Red - Worsening",
        color: color,
        font: {
          size: 12,
        },
        padding: {
          bottom: 10,
        },
      },
    },
  };

  const labels = [props.homeTeam, props.awayTeam];

  const data = {
    labels: labels,
    datasets: [
      {
        legend: {
          display: false,
        },
        // label: "XG Recent Swing",
        data: dataset,
        ticks: {
          font: {
            size: 14,
          },
        },
        barThickness: 120,
        backgroundColor(context) {
          const index = context.dataIndex;
          const value = context.dataset.data[index];
          return value < 0 ? "#730a00" : "#016001";
        },
      },
    ],
  };

  return <Bar options={options} data={data} />;
}

export { useChartTheme, getChartColors };
