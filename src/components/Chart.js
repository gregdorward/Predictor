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
import { Line, Radar, Bar, Doughnut } from "react-chartjs-2";

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
  SubTitle
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
    color: "#030061",
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
        color: "#030061",
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
        borderColor: "#030061",
        borderWidth: 3,
        backgroundColor: "#030061",
        tension: props.tension,
      },
      {
        label: props.team2,
        data: props.data2,
        borderColor: "#970d00",
        borderWidth: 3,
        backgroundColor: "#970d00",
        tension: props.tension,
      }
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
    color: "#030061",
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
        color: "#030061",
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
        borderColor: "#030061",
        borderWidth: 3,
        backgroundColor: "#030061",
        tension: props.tension,
      },
      {
        label: props.team2,
        data: props.data2,
        borderColor: "#970d00",
        borderWidth: 3,
        backgroundColor: "#970d00",
        tension: props.tension,
      },
      {
        label: `${props.team1} XG Diff`,
        font: {
          color: "black",
        },
        data: props.data3,
        borderColor: "#0600d6",
        borderWidth: 3,
        backgroundColor: "#0600d6",
        tension: props.tension,
        hidden: true,
      },
      {
        label: `${props.team2} XG Diff`,
        font: {
          color: "black",
        },
        data: props.data4,
        borderColor: "#be1000",
        borderWidth: 3,
        backgroundColor: "#be1000",
        tension: props.tension,
        hidden: true,
      },
    ],
  };

  return <Line options={options} data={data} />;
}


export function DoughnutChart(props) {
  const options = {
    color: "#030061",

    plugins: {
      legend: {
        position: "top",

        labels: {
          boxHeight: 10,
          color: "#030061",
        },
      },
      title: {
        display: true,
        text: "Soccer Stats Hub Form Comparison",
        color: "#030061",
        font: {
          size: 14,
        },
      },
    },
  };

  const data = {
    labels: [props.homeTeam, props.awayTeam],
    datasets: [
      {
        data: props.data,
        backgroundColor: ["#030061", "#970d00"],
        rotation: 270,
        hoverOffset: 4,
        cutout: "75%",
        circumference: 180,
      },
    ],
  };

  const config = {
    type: "doughnut",
    data: data,
  };

  return <Doughnut options={options} data={data} />;
}

export function RadarChart(props) {
  const options = {
    color: "#030061",
    scales: {
      r: {
        angleLines: {
          display: false,
        },
        suggestedMin: 0,
        suggestedMax: 1,
        ticks: {
          precision: 0,
          display: false,
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
          color: "#030061",
        },
      },
      title: {
        display: true,
        text: props.title,
        color: "#030061",
        font: {
          size: 14,
        },
      },
    },
  };

  let data = {
    labels: [
      "Attack rating",
      "Defence rating",
      "Ball retention",
      "XG For",
      "XG Against",
      "Directness",
      "Attacking precision",
    ],
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

    return Math.max(...tempArr) + 1;
  }

  const options = {
    color: "#030061",
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
        color: "#030061",
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
          return value < 0 ? "#030061" : "#970d00";
        },
      },
    ],
  };

  return <Bar options={options} data={data} />;
}

export function BarChartTwo(props) {
  const dataset = [props.data1, props.data2]

  const options = {
    color: "#030061",
    indexAxis: "x",
    // Elements options apply to all of the options unless overridden in a dataset
    // In this case, we are setting the border of each horizontal bar to be 2px wide
    aspectRatio: 1.3,
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
        color: "#030061",
        font: {
          size: 14,
        },
      },
      subtitle: {
        display: true,
        text: "Green - Improving | Red - Worsening",
        color: "#030061",
        font: {
          size: 12,
        },
        padding: {
          bottom: 10,
        },
      },
    },
  };

  const labels = [
    props.homeTeam,
    props.awayTeam,
  ];

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
