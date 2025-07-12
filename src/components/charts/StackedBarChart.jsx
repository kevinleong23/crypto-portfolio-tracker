import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

function StackedBarChart({ assets }) {
  // Calculate tokens vs stablecoins
  const stablecoins = ['USDT', 'USDC', 'BUSD', 'DAI']
  
  const tokensTotal = assets
    .filter(asset => !stablecoins.includes(asset.symbol))
    .reduce((sum, asset) => sum + (asset.totalValue || asset.total || 0), 0)
  
  const stablecoinTotal = assets
    .filter(asset => stablecoins.includes(asset.symbol))
    .reduce((sum, asset) => sum + (asset.totalValue || asset.total || 0), 0)

  // Only show chart if there's data
  if (tokensTotal === 0 && stablecoinTotal === 0) {
    return <div className="text-center py-20 text-dark-muted">No assets found</div>
  }

  const data = {
    labels: ['Asset Allocation'],
    datasets: [
      {
        label: 'Tokens',
        data: [tokensTotal],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1
      },
      {
        label: 'Stablecoins',
        data: [stablecoinTotal],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1
      }
    ]
  }

  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#e0e0e0',
          padding: 15
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const total = tokensTotal + stablecoinTotal
            const percentage = ((context.parsed.x / total) * 100).toFixed(1)
            return `${context.dataset.label}: $${context.parsed.x.toFixed(2)} (${percentage}%)`
          }
        }
      }
    },
    scales: {
      x: {
        stacked: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: '#9ca3af',
          callback: (value) => `$${value}`
        }
      },
      y: {
        stacked: true,
        grid: {
          display: false
        },
        ticks: {
          color: '#9ca3af'
        }
      }
    }
  }

  return (
    <div style={{ height: '300px' }}>
      <Bar data={data} options={options} />
    </div>
  )
}

export default StackedBarChart