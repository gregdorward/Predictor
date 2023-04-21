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
} from "chart.js";
import { Line, Radar, Bar } from "react-chartjs-2";

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
  Legend
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
    color: "black",
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
        },
      },
      x: {
        title: {
          display: false,
          text: "Last X Games",
          font: {
            size: 10,
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
        font: {
          size: 14,
          color: "black",
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
        borderColor: "#030061",
        borderWidth: 2,
        backgroundColor: "#030061",
        tension: props.tension,
      },
      {
        label: props.team2,
        data: props.data2,
        borderColor: "#970d00",
        borderWidth: 2,
        backgroundColor: "#970d00",
        tension: props.tension,
      },
    ],
  };

  return <Line options={options} data={data} />;
}

export function RadarChart(props) {
  const options = {
    color: "black",
    scales: {
      r: {
        angleLines: {
          display: false,
        },
        suggestedMin: 0,
        suggestedMax: 10,
        ticks: {
          precision: 0,
        },
        // grid: {
        //     circular: true,
        //   }
      },
    },
    plugins: {
      legend: {
        position: "top",

        labels: {
          boxHeight: 10,
        },
      },
      title: {
        display: true,
        text: "XG Tipping Strength Ratings",
        font: {
          size: 14,
        },
      },
    },
  };

  let data = {
    labels: ["Attack", "Defence", "Ball retention", "XG For", "XG Against"],
    datasets: [
      {
        label: props.team1,
        data: props.data,
        fill: true,
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        borderColor: "#030061",
        pointBackgroundColor: "#030061",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "rgb(255, 99, 132)",
        borderWidth: 2,
      },
      {
        label: props.team2,
        data: props.data2,
        fill: true,
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        borderColor: "#970d00",
        pointBackgroundColor: "#970d00",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "rgb(54, 162, 235)",
        borderWidth: 2,
      },
    ],
  };

  return <Radar options={options} data={data} />;
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

    return Math.max(...tempArr);
  }

  const options = {
    indexAxis: "y",
    // Elements options apply to all of the options unless overridden in a dataset
    // In this case, we are setting the border of each horizontal bar to be 2px wide
    aspectRatio: 1.3,
    elements: {
      bar: {
        borderWidth: 2,
      },
    },
    scales: {
      x: {
        min: -4,
        max: 4,
        ticks: {
          display: false,
        },
      },
      y: {
        ticks: {
          font: {
            size: 10,
          },
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
        text: "Comparison - Home Team | Away Team ",
      },
    },
  };

  const labels = [
    "Highest Goals",
    "Fewest Conceeded",
    "Last 5 PPG",
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
          return value < 0 ? "#030061" : "#970d00";
        },
      },
    ],
  };

  return <Bar options={options} data={data} />;
}
