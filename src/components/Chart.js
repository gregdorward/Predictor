// import { light } from "@material-ui/core/styles/createPalette";
// import { toBePartiallyChecked } from "@testing-library/jest-dom/dist/matchers";
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
import { Line, Radar, Bar, Doughnut, PolarArea } from "react-chartjs-2";

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

);

export function Chart(props) {
  let length;
  let depth;

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
    color: "#fe8c00",
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
          color: "#fe8c00",
        },
      },
      x: {
        title: {
          display: false,
          text: "Last X Games",
          font: {
            size: 14,
          },
        },
        grid: {
          borderWidth: 1,
          borderColor: "black",
        },
        ticks: {
          display: false,
          font: {
            size: 14,
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
        color: "#fe8c00",
        font: {
          size: 14,
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
          color: "#fe8c00",
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
    color: "#fe8c00",
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
          color: "#fe8c00",
        },
      },
      x: {
        title: {
          display: false,
          text: "Last X Games",
          font: {
            size: 14,
          },
        },
        grid: {
          borderWidth: 1,
          borderColor: "black",
        },
        ticks: {
          display: false,
          font: {
            size: 14,
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
        color: "#fe8c00",
        font: {
          size: 14,
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
          color: "#fe8c00",
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
          color: "#fe8c00",
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

export const DoughnutChart = ({ labels, values, colors, label = 'Dataset', chartTitle = ''
}) => {
  const data = {
    labels,
    datasets: [{
      label,
      data: values,
      backgroundColor: colors,
      hoverOffset: 4
    }]
  };

  const options = {
    rotation: 270,
    circumference: 180,
    plugins: {
      legend: {
        position: 'top'
      },
      title: {
        display: !!chartTitle,
        text: chartTitle,
        font: {
          size: 12
        }
      }
    }
  };

  return <Doughnut className="DoughnutChart" data={data} options={options} />;
};



export function RadarChart(props) {
  const options = {
    color: "white",
    scales: {
      r: {
        ticks: {
          stepSize: 20, // Adjust this to space out ticks more (default is 10)
          display: false,
        },
        grid: {
          // circular: true,
          color: "#f57701",
        },
        pointLabels: {
          color: "#f57701",
          font: {
            size: 12
          },
        },
        min: 0,
        max: props.max, // Set this according to your chart's range
      }
    },
    plugins: {
      legend: {
        position: "top",

        labels: {
          boxHeight: 10,
          color: "#f57701",
          font: {
            size: 14
          },
        },
      },
      title: {
        display: true,
        text: props.title,
        color: "#f57701",
        backgroundColor: "black",
        font: {
          size: 14,
        },
      },
    },
  };

  let data = {
    labels: props.labels,
    datasets: [
      {
        label: props.team1,
        data: props.data,
        fill: true,
        backgroundColor: "#01a50141",
        borderColor: "#01a501",
        pointBackgroundColor: "#01a501",
        pointBorderColor: "#01a501",
        pointHoverBackgroundColor: "#01a501",
        pointHoverBorderColor: "#007900ff",
        borderWidth: 2,
      },
      {
        label: props.team2,
        data: props.data2,
        fill: true,
        backgroundColor: "#ae0f0141",
        borderColor: "#ae1001ff",
        pointBackgroundColor: "#ae1001ff",
        pointBorderColor: "#ae1001ff",
        pointHoverBackgroundColor: "#ae1001ff",
        pointHoverBorderColor: "#ae1001ff",
        borderWidth: 2,
      },
    ],
  };

  return <Radar options={options} data={data} />;
}

export function BarChartLeagueStats({
  title,
  teamAData,
  teamBData,
  teamALabel,
  teamBLabel,
  maxRank,
}) {
  const labels = [
    "Avg Rating",
    "Goals Scored",
    "Goals Conceded",
    "Big Chances",
    "Big Chances Missed",
    "Hit Woodwork",
    "Yellow Cards",
    "Red Cards",
    "Possession",
    "Accurate Passes",
    "Long Balls",
    "Crosses",
    "Shots",
    "Shots on Target",
    "Dribbles",
    "Tackles",
    "Interceptions",
    "Clearances",
    "Corners",
    "Fouls",
    "Pen Goals",
    "Pen Goals Conceded",
    "Clean Sheets",
  ];

  const statKeys = Object.keys(teamAData);

  // Invert rank so that a lower rank (1 = best) becomes a higher bar
  const invertRank = (rank) => maxRank - rank + 1;

  // Preprocess data
  const teamAInverted = statKeys.map((key) => invertRank(teamAData[key]));
  const teamBInverted = statKeys.map((key) => invertRank(teamBData[key]));

  const data = {
    labels: statKeys.map((key) =>
      key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())
    ),
    datasets: [
      {
        label: teamALabel,
        data: teamAInverted,
        backgroundColor: "rgba(255, 99, 132, 0.7)",
        borderRadius: 2,
        barThickness: 6,             // Fixed thickness
        categoryPercentage: 0.1,      // Reduce this for more space between rows
        barPercentage: 1.0
      },
      {
        label: teamBLabel,
        data: teamBInverted,
        backgroundColor: "rgba(255, 255, 102, 0.7)",
        borderRadius: 2,
        barThickness: 6,             // Fixed thickness
        categoryPercentage: 0.1,      // Reduce this for more space between rows
        barPercentage: 1.0
      },
    ],
  };

  const options = {
    indexAxis: "y",
    maintainAspectRatio: false,
    scales: {
      x: {
        reverse: true, // ⬅️ This flips the axis direction
        beginAtZero: true,
        title: {
          display: true,
          text: 'Relative Rank (Lower = Better)',
        },
        ticks: {
          stepSize: 5,
        },
      },
      y: {
        ticks: {
          autoSkip: false,
        }
      }
    },
    plugins: {
      legend: {
        position: "top",
        labels: {
          boxWidth: 20,
        },
      },
    },
    layout: {
      padding: {
        top: 10,
        bottom: 10,
      },
    },
  };

  return <Bar data={data} options={options} className="LeagueStatsBar" />;
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
          size: 14,
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
  const { data1, data2 } = props; // Destructure props for easier access
  // --- SOLUTION: Add this check at the top ---
// Ensure the data arrays are not empty/invalid BEFORE calculation
if (!data1 || !data2 || data1.length === 0 || data2.length === 0) {
    return <div style={{ color: "#fe8c00", textAlign: "center" }}>No data available for this chart.</div>;
}

const sum = data2.map(function (num, idx) {
    // 1. Use ?? 0 to turn null/undefined stats into 0
    const val1 = data1[idx] ?? 0; 
    const val2 = num ?? 0;
    
    // 2. Use Number() to ensure any strings (like "396.00") are converted back to numbers
    return Number(val2) - Number(val1);
}).filter(value => !isNaN(value)); // Filter out any values that couldn't be converted

// Add this critical check back
if (sum.length === 0) {
    return <div style={{ color: "#fe8c00", textAlign: "center" }}>Invalid numeric data available for this chart.</div>;
}

  const max = Math.max(...sum);
  const min = Math.min(...sum);

  // This function is fine as is
  function findLargestNum(numOne, numTwo) {
    const tempArr = [Math.abs(numOne), Math.abs(numTwo)];
    return Math.max(...tempArr) + 1;
  }

  const largest = findLargestNum(max, min);

  const options = {
    color: "#fe8c00",
    indexAxis: "y",
    aspectRatio: 1.2,
    elements: {
      bar: {
        borderWidth: 2,
      },
    },
    scales: {
      x: {
        min: -largest, // Now protected from Infinity
        max: largest,  // Now protected from Infinity
        ticks: {
          display: false,
        },
      },
      y: {
        ticks: {
          font: {
            size: 11,
          },
          color: "#fe8c00",
        },
      },
    },
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
      title: {
        display: true,
        text: props.text,
        color: "#fe8c00",
        font: {
          size: 14,
        },
      },
    },
  };

  const data = {
    labels: props.labels, // Assuming you made the change to accept labels as a prop
    datasets: [
      {
        data: sum,
        backgroundColor(context) {
          const index = context.dataIndex;
          const value = context.dataset.data[index];
          return value < 0 ? "#01a501" : "#ae1001ff";
        },
      },
    ],
  };

  return <Bar options={options} data={data} />;
}

export function BarChartTwo(props) {
  const dataset = [props.data1, props.data2];

  const options = {
    color: "#fe8c00",
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
          color: "#fe8c00",
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
        color: "#fe8c00",
        font: {
          size: 14,
        },
      },
      subtitle: {
        display: true,
        text: "Green - Improving | Red - Worsening",
        color: "#fe8c00",
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
