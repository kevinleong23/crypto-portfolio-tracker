import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PortfolioChart from '../components/charts/PortfolioChart'
import AssetTable from '../components/tables/AssetTable'
import { portfolioAPI } from '../services/api'
import { useApp } from '../App'

function Dashboard() {
  const navigate = useNavigate()
  const { showError, showSuccess } = useApp()
  const [timeframe, setTimeframe] = useState('24H')
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [portfolioData, setPortfolioData] = useState({
    totalValue: 0,
    totalChange24h: 0,
    totalChangePercent24h: 0,
    assets: [],
    lastSync: null
  })
  const [performanceData, setPerformanceData] = useState({ labels: [], values: [] })

  useEffect(() => {
    fetchPortfolioData()
  }, [])

  useEffect(() => {
    fetchPerformanceData()
  }, [timeframe])

  const fetchPortfolioData = async () => {
    try {
      const response = await portfolioAPI.getSummary()
      setPortfolioData(response.data)
    } catch (error) {
      showError('Failed to load portfolio data')
    } finally {
      setLoading(false)
    }
  }

  const fetchPerformanceData = async () => {
    try {
      const response = await portfolioAPI.getPerformance(timeframe)
      setPerformanceData(response.data)
    } catch (error) {
      console.error('Failed to load performance data', error)
    }
  }

  const handleSync = async () => {
    setSyncing(true)
    try {
      await portfolioAPI.sync()
      await fetchPortfolioData()
      showSuccess('Portfolio synced successfully')
    } catch (error) {
      showError(error.response?.data?.message || 'Sync failed. Please try again.')
    } finally {
      setSyncing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-xl">Loading portfolio...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-bg p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/integration')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
            >
              Add Exchange/Wallet
            </button>
            <button
              onClick={handleSync}
              disabled={syncing}
              className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-white px-4 py-2 rounded transition"
            >
              {syncing ? 'Syncing...' : 'Sync'}
            </button>
          </div>
        </div>

        {/* Portfolio Summary */}
        <div className="bg-dark-card p-6 rounded-lg border border-dark-border mb-6">
          <h2 className="text-xl font-semibold mb-2">Total Portfolio Value</h2>
          <div className="flex items-baseline gap-4">
            <span className="text-3xl font-bold">${portfolioData.totalValue.toFixed(2)}</span>
            <span className={`text-lg ${portfolioData.totalChange24h < 0 ? 'text-red-500' : 'text-green-500'}`}>
              ${Math.abs(portfolioData.totalChange24h).toFixed(2)} | {portfolioData.totalChangePercent24h > 0 ? '+' : ''}{portfolioData.totalChangePercent24h.toFixed(2)}%
            </span>
          </div>
          {portfolioData.lastSync && (
            <p className="text-sm text-dark-muted mt-2">
              Last sync: {new Date(portfolioData.lastSync).toLocaleString()}
            </p>
          )}
        </div>

        {/* Chart */}
        <div className="bg-dark-card p-6 rounded-lg border border-dark-border mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Portfolio Performance</h3>
            <div className="flex gap-2">
              {['24H', '1W', '1M', '3M', '6M', '1Y', 'All'].map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-1 rounded text-sm transition ${
                    timeframe === tf 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-dark-bg hover:bg-gray-700'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>
          <PortfolioChart timeframe={timeframe} data={performanceData} />
        </div>

        {/* Assets Table */}
        <div className="bg-dark-card p-6 rounded-lg border border-dark-border">
          <h3 className="text-lg font-semibold mb-4">Your Assets</h3>
          {portfolioData.assets.length === 0 ? (
            <div className="text-center py-8 text-dark-muted">
              <p>No assets found. Add an exchange or wallet to get started.</p>
              <button
                onClick={() => navigate('/integration')}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
              >
                Add Integration
              </button>
            </div>
          ) : (
            <AssetTable 
              assets={portfolioData.assets.map(asset => ({
                ...asset,
                price: asset.currentPrice || asset.price || 0,
                change24h: asset.changePercent24h || asset.change24h || 0,
                total: asset.totalValue || asset.total || 0,
                pnl24h: asset.pnl24h || 0
              }))} 
              onAssetClick={() => navigate('/assets')} 
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard