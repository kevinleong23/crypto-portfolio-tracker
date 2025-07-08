import { useNavigate } from 'react-router-dom'
import AssetTable from '../components/tables/AssetTable'
import PieChart from '../components/charts/PieChart'
import StackedBarChart from '../components/charts/StackedBarChart'
import TransactionTable from '../components/tables/TransactionTable'

function AssetDetails() {
  const navigate = useNavigate()
  
  // Mock data - replace with API calls
  const assets = [
    { name: 'Bitcoin', symbol: 'BTC', amount: 0.0001, change24h: -2.5, price: 43250, total: 4.32, pnl24h: -0.11 },
    { name: 'Ethereum', symbol: 'ETH', amount: 0.001, change24h: -3.2, price: 2280, total: 2.28, pnl24h: -0.07 },
    { name: 'Solana', symbol: 'SOL', amount: 0.05, change24h: -8.1, price: 95.5, total: 4.78, pnl24h: -0.42 },
    { name: 'USDT', symbol: 'USDT', amount: 100, change24h: 0.01, price: 1, total: 100, pnl24h: 0.01 },
    { name: 'USDC', symbol: 'USDC', amount: 50, change24h: 0, price: 1, total: 50, pnl24h: 0 }
  ]

  const transactions = [
    { date: 'February 14, 2025', type: 'Received', asset: '1SOL', amount: 1, value: 19.95, portfolio: 'Exchange/Wallet 1' },
    { date: 'February 13, 2025', type: 'Sent', asset: '0.5ETH', amount: 0.5, value: 1140, portfolio: 'Exchange/Wallet 2' },
    { date: 'February 12, 2025', type: 'Received', asset: '100USDT', amount: 100, value: 100, portfolio: 'Exchange/Wallet 1' },
    { date: 'February 11, 2025', type: 'Sent', asset: '0.0001BTC', amount: 0.0001, value: 4.32, portfolio: 'Exchange/Wallet 3' },
    { date: 'February 10, 2025', type: 'Received', asset: '50USDC', amount: 50, value: 50, portfolio: 'Exchange/Wallet 2' }
  ]

  return (
    <div className="min-h-screen bg-dark-bg p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Asset Details</h1>

        {/* Assets Table */}
        <div className="bg-dark-card p-6 rounded-lg border border-dark-border mb-6">
          <h2 className="text-xl font-semibold mb-4">All Assets</h2>
          <AssetTable assets={assets} />
        </div>

        {/* Charts Row */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Pie Chart */}
          <div className="bg-dark-card p-6 rounded-lg border border-dark-border">
            <h3 className="text-lg font-semibold mb-4">Coin Allocation</h3>
            <PieChart assets={assets} />
          </div>

          {/* Stacked Bar Chart */}
          <div className="bg-dark-card p-6 rounded-lg border border-dark-border">
            <h3 className="text-lg font-semibold mb-4">Asset Allocation</h3>
            <StackedBarChart assets={assets} />
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