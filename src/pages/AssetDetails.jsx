import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AssetTable from '../components/tables/AssetTable'
import PieChart from '../components/charts/PieChart'
import StackedBarChart from '../components/charts/StackedBarChart'
import TransactionTable from '../components/tables/TransactionTable'
import { portfolioAPI, transactionAPI, integrationAPI } from '../services/api'
import { useError } from '../App'

function AssetDetails() {
  const navigate = useNavigate()
  const { showError } = useError()
  const [loading, setLoading] = useState(true)
  const [assets, setAssets] = useState([])
  const [transactions, setTransactions] = useState([])
  const [wallets, setWallets] = useState([])
  const [selectedWalletId, setSelectedWalletId] = useState('')
  const [loadingTransactions, setLoadingTransactions] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (selectedWalletId && wallets.length > 0) {
      fetchTransactions()
      // Save selection to localStorage
      localStorage.setItem('selectedWalletId', selectedWalletId)
    }
  }, [selectedWalletId])

  const fetchData = async () => {
    try {
      // Fetch assets
      const assetsResponse = await portfolioAPI.getAssets()
      setAssets(assetsResponse.data.assets || [])

      // Fetch wallets for dropdown
      const integrationsResponse = await integrationAPI.getAll()
      const walletIntegrations = integrationsResponse.data.filter(
        integration => integration.type === 'wallet'
      )
      setWallets(walletIntegrations)

      // Set initial wallet selection
      if (walletIntegrations.length > 0) {
        const savedWalletId = localStorage.getItem('selectedWalletId')
        const savedWalletExists = walletIntegrations.find(w => w.id === savedWalletId)
        
        // Use saved wallet if it exists, otherwise use first wallet
        const initialWalletId = savedWalletExists ? savedWalletId : walletIntegrations[0].id
        setSelectedWalletId(initialWalletId)
      }
    } catch (error) {
      showError('Failed to load asset details')
    } finally {
      setLoading(false)
    }
  }

  const fetchTransactions = async () => {
    if (!selectedWalletId) return
    
    setLoadingTransactions(true)
    try {
      const response = await transactionAPI.getRecentByWallet(selectedWalletId)
      setTransactions(response.data || [])
    } catch (error) {
      console.error('Failed to load transactions:', error)
      setTransactions([])
    } finally {
      setLoadingTransactions(false)
    }
  }

  const handleWalletChange = (walletId) => {
    setSelectedWalletId(walletId)
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
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Transactions</h2>
            
            {/* Wallet Dropdown */}
            {wallets.length > 0 && (
              <div className="flex items-center gap-2">
                <label className="text-sm text-dark-muted">Wallet:</label>
                <select
                  value={selectedWalletId}
                  onChange={(e) => handleWalletChange(e.target.value)}
                  className="px-3 py-1 bg-dark-bg border border-dark-border rounded focus:outline-none focus:border-blue-500 text-sm"
                >
                  {wallets.map((wallet) => (
                    <option key={wallet.id} value={wallet.id}>
                      {wallet.displayName}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {wallets.length === 0 ? (
            <div className="text-center py-8 text-dark-muted">
              <p>No wallets connected. Connect a wallet to view transactions.</p>
              <button
                onClick={() => navigate('/integration')}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
              >
                Add Wallet
              </button>
            </div>
          ) : loadingTransactions ? (
            <div className="text-center py-8 text-dark-muted">
              Loading transactions...
            </div>
          ) : (
            <TransactionTable transactions={transactions} />
          )}
        </div>
      </div>
    </div>
  )
}

export default AssetDetails