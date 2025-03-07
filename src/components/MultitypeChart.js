import React from 'react';
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
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const MultiTypeChart = ({ dataArray, text }) => {
  // 1. Process the Data: Calculate the difference and labels
  const labels = dataArray.map((_, index) => `Game ${index + 1}`); // Create labels like "Index 1", "Index 2", etc.
  const barData = dataArray.map(item => item[0] - item[1]); // Calculate the difference

  // Create an array of colors based on the sign of the bar data
  const backgroundColors = barData.map(value =>
    value >= 0 ? '#030052' : '#970d00'
  );

  // 2. Chart Data Structure:
  const data = {
    labels: labels,
    datasets: [
      {
        type: 'bar',
        label: 'XG Difference',
        data: barData,
        backgroundColor: backgroundColors, // Use the dynamic colors
        borderColor: backgroundColors,      // Match the border color
        borderWidth: 1,
      },
      {
        type: 'line',
        label: 'Trend Line',
        data: barData, // Use the same data for the line to create a trend
        borderColor: 'rgba(255, 99, 132, 1)',   // Red line
        backgroundColor: 'rgba(255, 99, 132, 0.2)',  // Pinkish fill
        pointRadius: 3,                             // Make points visible
        tension: 0.4,                               // Curve the line a bit
      },
    ],
  };

  // 3. Chart Options (customize as needed):
  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: text,
      },
      legend: { // Add this legend configuration
        display: false, // Set display to false to hide the legend
      },
    },
    scales: {
      y: {
        beginAtZero: true, // Start y-axis at 0
      },
    },
  };

  return <Bar data={data} options={options} className='BarChart'/>;
};

export default MultiTypeChart;