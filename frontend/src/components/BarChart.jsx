import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const BarChart = ({ chartData }) => {
  const data = {
    labels: chartData.map(d => {
        const [year, month] = d.mes.split('-');
        return new Date(year, month - 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    }),
    datasets: [
      {
        label: 'CEMIG',
        data: chartData.map(d => d.cemig),
        backgroundColor: 'rgba(250, 173, 20, 0.6)', 
        borderColor: 'rgba(250, 173, 20, 1)',
        borderWidth: 1,
      },
      {
        label: 'COPASA',
        data: chartData.map(d => d.copasa),
        backgroundColor: 'rgba(24, 144, 255, 0.6)', // Azul
        borderColor: 'rgba(24, 144, 255, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Gastos Mensais (Últimos 12 Meses)',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return 'R$ ' + value.toLocaleString('pt-BR');
          }
        }
      }
    }
  };

  return <Bar data={data} options={options} />;
};

export default BarChart;