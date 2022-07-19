import { light } from "@material-ui/core/styles/createPalette";
import { toBePartiallyChecked } from "@testing-library/jest-dom/dist/matchers";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function Chart(props) {
  const options = {
      color: 'black',
    responsive: true,
    aspectRatio: 1.2,
    maintainAspectRatio: true,
    layout: {
      padding: 3
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 3,
        grid: {
            borderWidth: 1,
            borderColor: 'black'
          }
      },
      x: {
        title: {
          display: true,
          text: "Last X Games",
        },
        grid: {
            borderWidth: 1,
            borderColor: 'black'          }
      },

    },
    plugins: {
      legend: {
        position: "top",

        labels: {
            boxHeight: 10
        }
      },
      title: {
        display: true,
        text: "Rolling average points",
      },
    },
  };

  const labels = ["10", "6", "5", "3"];

  let data = {
    labels,
    datasets: [
      {
        label: props.team1,
        font: {
            color: 'black'
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
