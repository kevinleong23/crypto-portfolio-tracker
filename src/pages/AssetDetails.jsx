import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AssetTable from '../components/tables/AssetTable'
import PieChart from '../components/charts/PieChart'
import StackedBarChart from '../components/charts/StackedBarChart'
import TransactionTable from '../components/tables/TransactionTable'
import { portfolioAPI, transactionAPI } from '../services/api'
import { useError } from '../App'

function AssetDetails() {
  const navigate = useNavigate()
  const { showError } = useError()
  const [loading, setLoading] = useState(true)
  const [assets, setAssets] = useState([])
  const [transactions, setTransactions] = useState([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch assets
      const assetsResponse = await portfolioAPI.getAssets()
      setAssets(assetsResponse.data.assets || [])

      // Fetch recent transactions
      const transactionsResponse = await transactionAPI.getRecent()
      setTransactions(transactionsResponse.data || [])
    } catch (error) {
      showError('Failed to load asset details')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-xl">Loading asset details...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-bg p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Asset Details</h1>

        {/* Assets Table */}
        <div className="bg-dark-card p-6 rounded-lg border border-dark-border mb-6">
          <h2 className="text-xl font-semibold mb-4">All Assets</h2>
          {assets.length === 0 ? (
            <p className="text-dark-muted text-center py-4">No assets found. Add integrations and sync your portfolio.</p>
          ) : (
            <AssetTable 
              assets={assets.map(asset => ({
                ...asset,
                price: asset.currentPrice || asset.price || 0,
                change24h: asset.changePercent24h || asset.change24h || 0,
                total: asset.totalValue || asset.total || 0,
                pnl24h: asset.pnl24h || 0
              }))} 
            />
          )}
        </div>

        {/* Charts Row */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Pie Chart */}
          <div className="bg-dark-card p-6 rounded-lg border border-dark-border">
            <h3 className="text-lg font-semibold mb-4">Coin Allocation</h3>
            {assets.length > 0 ? (
              <PieChart assets={assets} />
            ) : (
              <p className="text-dark-muted text-center py-20">No data available</p>
            )}
          </div>

          {/* Stacked Bar Chart */}
          <div className="bg-dark-card p-6 rounded-lg border border-dark-border">
            <h3 className="text-lg font-semibold mb-4">Asset Allocation</h3>
            {assets.length > 0 ? (
              <StackedBarChart assets={assets} />
            ) : (
              <p className="text-dark-muted text-center py-20">No data available</p>
            )}
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-dark-card p-6 rounded-lg border border-dark-border">
          <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
          <TransactionTable transactions={transactions} />
        </div>
      </div>
    </div>
  )
}

export default AssetDetails