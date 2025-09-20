import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

const MonthlyPatientsChart = ({ monthlyData }) => {
  // Default data if no data provided
  const defaultData = {
    January: 12,
    February: 19,
    March: 15,
    April: 22,
    May: 18,
    June: 25,
    July: 30,
    August: 28,
    September: 32,
    October: 35,
    November: 40,
    December: 38
  };

  const data = monthlyData || defaultData;

  const chartData = {
    labels: Object.keys(data),
    datasets: [
      {
        label: 'Number of Patients',
        data: Object.values(data),
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        borderRadius: 6,
        hoverBackgroundColor: 'rgba(59, 130, 246, 0.8)',
        hoverBorderColor: 'rgba(59, 130, 246, 1)',
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: '#374151',
          font: {
            size: 12,
            weight: '500'
          }
        }
      },
      title: {
        display: true,
        text: 'Monthly Patient Statistics',
        color: '#1f2937',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1f2937',
        bodyColor: '#374151',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 6,
        displayColors: true,
        callbacks: {
          label: function(context) {
            return `Patients: ${context.raw}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: false
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 11,
            weight: '500'
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(229, 231, 235, 0.5)',
          drawBorder: false
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 11,
            weight: '500'
          },
          stepSize: 5
        }
      }
    },
    animation: {
      duration: 2000,
      easing: 'easeOutQuart'
    }
  };

  return (
    <div className="chart-container">
      <div className="chart-header">
        <h3>Monthly Patient Statistics</h3>
        <div className="chart-actions">
          <button className="chart-btn active">Monthly</button>
          <button className="chart-btn">Quarterly</button>
          <button className="chart-btn">Yearly</button>
        </div>
      </div>
      
      <div className="chart-wrapper">
        <Bar data={chartData} options={options} />
      </div>
      
      <div className="chart-footer">
        <div className="chart-stats">
          <div className="stat-item">
            <span className="stat-label">Total This Year:</span>
            <span className="stat-value">
              {Object.values(data).reduce((sum, value) => sum + value, 0)}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Monthly Average:</span>
            <span className="stat-value">
              {Math.round(Object.values(data).reduce((sum, value) => sum + value, 0) / Object.values(data).length)}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Growth Rate:</span>
            <span className="stat-value positive">+15%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyPatientsChart;