import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

function PortfolioChart({ timeframe, data }) {
  // Use provided data or generate mock data
  const chartData = data && data.labels && data.labels.length > 0 ? {
    labels: data.labels.map(label => {
      const date = new Date(label)
      switch (timeframe) {
        case '24H':
          return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        case '1W':
        case '1M':
          return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
        case '3M':
        case '6M':
        case '1Y':
        case 'All':
          return date.toLocaleDateString([], { month: 'short', year: '2-digit' })
        default:
          return date.toLocaleString()
      }
    }),
    datasets: [
      {
        label: 'Portfolio Value',
        data: data.values,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  } : generateMockData()
  
  // Mock data generator for when no data is available
  function generateMockData() {
    const labels = {
      '24H': Array.from({ length: 24 }, (_, i) => `${i}:00`),
      '1W': ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      '1M': Array.from({ length: 30 }, (_, i) => `${i + 1}`),
      '3M': Array.from({ length: 12 }, (_, i) => `Week ${i + 1}`),
      '6M': Array.from({ length: 6 }, (_, i) => `Month ${i + 1}`),
      '1Y': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      'All': ['2022', '2023', '2024', '2025']
    }

    const values = labels[timeframe].map(() => 
      Math.random() * 0.5 + 2.8 // Random values around $3
    )

    return {
      labels: labels[timeframe],
      datasets: [
        {
          label: 'Portfolio Value',
          data: values,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    }
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: (context) => `$${context.parsed.y.toFixed(2)}`
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: '#9ca3af'
        }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: '#9ca3af',
          callback: (value) => `$${value.toFixed(2)}`
        }
      }
    }
  }

    return (
    <div style={{ height: '300px' }}>
      <Line data={chartData} options={options} />
    </div>
  )
}

export default PortfolioChart