import { Pie } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

function PieChart({ assets }) {
  // Filter out stablecoins for coin allocation
  const nonStableAssets = assets.filter(asset => 
    !['USDT', 'USDC', 'BUSD', 'DAI'].includes(asset.symbol)
  )

  // Only show chart if there's data
  if (nonStableAssets.length === 0) {
    return <div className="text-center py-20 text-dark-muted">No non-stable assets found</div>
  }

  const data = {
    labels: nonStableAssets.map(asset => asset.symbol),
    datasets: [
      {
        data: nonStableAssets.map(asset => asset.totalValue || asset.total || 0),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',   // Blue
          'rgba(147, 51, 234, 0.8)',   // Purple
          'rgba(236, 72, 153, 0.8)',   // Pink
          'rgba(34, 197, 94, 0.8)',    // Green
          'rgba(251, 146, 60, 0.8)',   // Orange
          'rgba(250, 204, 21, 0.8)',   // Yellow
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(147, 51, 234, 1)',
          'rgba(236, 72, 153, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(251, 146, 60, 1)',
          'rgba(250, 204, 21, 1)',
        ],
        borderWidth: 1
      }
    ]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#e0e0e0',
          padding: 15,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const total = context.dataset.data.reduce((a, b) => a + b, 0)
            const percentage = ((context.parsed / total) * 100).toFixed(1)
            return `${context.label}: $${context.parsed.toFixed(2)} (${percentage}%)`
          }
        }
      }
    }
  }

  return (
    <div style={{ height: '300px' }}>
      <Pie data={data} options={options} />
    </div>
  )
}

export default PieChart