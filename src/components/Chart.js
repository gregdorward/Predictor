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
    color: "white",
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
          color: "white",
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
        color: "white",
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
          color: "black",
        },
        data: props.data1,
        borderColor: "red",
        borderWidth: 3,
        backgroundColor: "red",
        tension: props.tension,
      },
      {
        label: props.team2,
        data: props.data2,
        borderColor: "yellow",
        borderWidth: 3,
        backgroundColor: "yellow",
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
    color: "white",
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
          color: "white",
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
        color: "white",
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
          color: "black",
        },
        data: props.data1,
        borderColor: "red",
        borderWidth: 3,
        backgroundColor: "red",
        tension: props.tension,
      },
      {
        label: props.team2,
        data: props.data2,
        borderColor: "yellow",
        borderWidth: 3,
        backgroundColor: "yellow",
        tension: props.tension,
      },
      {
        label: `${props.team1} XG Diff`,
        font: {
          color: "white",
        },
        data: props.data3,
        borderColor: "DarkRed",
        borderWidth: 3,
        backgroundColor: "DarkRed",
        tension: props.tension,
        hidden: true,
      },
      {
        label: `${props.team2} XG Diff`,
        font: {
          color: "white",
        },
        data: props.data4,
        borderColor: "orange",
        borderWidth: 3,
        backgroundColor: "orange",
        tension: props.tension,
        hidden: true,
      },
    ],
  };

  return <Line options={options} data={data} />;
}

const createGaugeData = (rank, maxRank = 36) => {
  const value = maxRank - rank + 1; // Invert so rank 1 = full gauge
  return [value, maxRank - value];
};

export const StatGauge = ({ label, rank, maxRank = 36 }) => {
  const data = {
    labels: [],
    datasets: [
      {
        data: createGaugeData(rank, maxRank),
        borderWidth: 0,
        backgroundColor: ["white", "#970d00"],
        hoverOffset: 4,
      },
    ],
  };

  const options = {
    rotation: 270,
    circumference: 180,
    cutout: '75%',
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
    responsive: true,
    maintainAspectRatio: false
  };

  return (
    <div style={{ width: 100, height: 50, textAlign: 'center', margin: "1.2em" }}>
      <Doughnut data={data} options={options} />
      <div style={{ fontSize: '0.8rem', marginTop: '-10px' }}>
        {label}<br />Rank {rank}
      </div>
    </div>
  );
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
          color: "white",
        },
        pointLabels: {
          color: "white",
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
          color: "white",
        },
      },
      title: {
        display: true,
        text: props.title,
        color: "white",
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
        // backgroundColor: "rgba(255, 0, 0, 0.52)",
        borderColor: "red",
        pointBackgroundColor: "red",
        pointBorderColor: "red",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "rgba(255, 99, 133, 0)",
        borderWidth: 2,
      },
      {
        label: props.team2,
        data: props.data2,
        fill: true,
        // backgroundColor: "rgba(253, 240, 0, 0.57)",
        borderColor: "yellow",
        pointBackgroundColor: "yellow",
        pointBorderColor: "yellow",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "yellow",
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
    color: "white",
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
          color: "white",
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
          color: "white",
        },
      },
      title: {
        display: true,
        text: title || "Team Comparison by League Ranking",
        color: "white",
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
  const datasetOne = props.data1;
  const datasetTwo = props.data2;
  const sum = datasetTwo.map(function (num, idx) {
    return num - datasetOne[idx];
  });

  const max = Math.max(...sum);
  const min = Math.min(...sum);

  const largest = findLargestNum(max, min);

  function findLargestNum(numOne, numTwo) {
    const tempArr = [];
    const firstNum = Math.abs(numOne);
    const secondNum = Math.abs(numTwo);
    tempArr.push(firstNum, secondNum);

    return Math.max(...tempArr) + 1;
  }

  const options = {
    color: "white",
    indexAxis: "y",
    // Elements options apply to all of the options unless overridden in a dataset
    // In this case, we are setting the border of each horizontal bar to be 2px wide
    aspectRatio: 1.2,
    elements: {
      bar: {
        borderWidth: 2,
      },
    },
    scales: {
      x: {
        min: -8,
        max: 8,
        ticks: {
          display: false,
        },
      },
      y: {
        ticks: {
          font: {
            size: 10,
          },
          color: "white",
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
        color: "white",
        font: {
          size: 14,
        },
      },
    },
  };

  const labels = [
    "Highest Goals",
    "Fewest Conceeded",
    "PPG",
    "Highest XG",
    "Fewest XG Conceeded",
    "Shots On Target",
    "Dangerous Attacks",
    "Av. Possession",
    "Home/Away Goal Diff",
    "Corners",
  ];

  const data = {
    labels,
    datasets: [
      {
        // label: 'Dataset 1',
        legend: {
          display: false,
        },
        data: sum,
        backgroundColor(context) {
          const index = context.dataIndex;
          const value = context.dataset.data[index];
          return value < 0 ? "red" : "yellow";
        },
      },
    ],
  };

  return <Bar options={options} data={data} />;
}

export function BarChartTwo(props) {
  const dataset = [props.data1, props.data2];

  const options = {
    color: "white",
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
          color: "white",
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
        color: "white",
        font: {
          size: 14,
        },
      },
      subtitle: {
        display: true,
        text: "Green - Improving | Red - Worsening",
        color: "white",
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
