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
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Radar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  PointElement,
  ArcElement,
  Filler,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export function Chart(props) {
  const options = {
    color: "black",
    responsive: true,
    aspectRatio: 1.2,
    maintainAspectRatio: true,
    layout: {
      padding: 3,
    },
    scales: {
      y: {
        suggestedMin: 0,
        suggestedMax: Math.max(...props.data1) > 3 ? Math.max(...props.data1) : 3,
        grid: {
          borderWidth: 1,
          borderColor: "black",
        },
        ticks: {
            font: {
                size: 12,
            }
        }
      },
      x: {
        title: {
          display: false,
          text: "Last X Games",
          font: {
            size: 10,
        }
        },
        grid: {
          borderWidth: 1,
          borderColor: "black",
        },
        ticks: {
            display: false,
            font: {
                size: 12,
            }
        }
      },
    },
    plugins: {
      legend: {
        position: "top",

        labels: {
          boxHeight: 5
        },
      },
      title: {
        display: true,
        text: props.type,
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
      },
      {
        label: props.team2,
        data: props.data2,
        borderColor: "#970d00",
        borderWidth: 2,
        backgroundColor: "#970d00",
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
      },
    },
  };

  let data = {
    labels: [
      "Attack",
      "Defence",
      "Ball retention",
      "XG For",
      "XG Against",
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