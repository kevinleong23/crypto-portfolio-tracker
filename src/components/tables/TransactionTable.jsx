function TransactionTable({ transactions }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-dark-border">
            <th className="text-left py-3 px-4 font-medium text-dark-muted">Date</th>
            <th className="text-left py-3 px-4 font-medium text-dark-muted">Type</th>
            <th className="text-left py-3 px-4 font-medium text-dark-muted">Asset(s)</th>
            <th className="text-left py-3 px-4 font-medium text-dark-muted">Portfolio</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx, index) => (
            <tr key={tx.id || index} className="border-b border-dark-border hover:bg-dark-border/20 transition">
              <td className="py-3 px-4 text-sm">{formatDate(tx.date || tx.timestamp)}</td>
              <td className="py-3 px-4">
                <span className={`inline-flex px-2 py-1 text-xs rounded ${
                  tx.type === 'Received' || tx.type === 'Buy'
                    ? 'bg-green-900/30 text-green-400' 
                    : tx.type === 'Sent' || tx.type === 'Sell'
                    ? 'bg-red-900/30 text-red-400'
                    : 'bg-blue-900/30 text-blue-400'
                }`}>
                  {tx.type}
                </span>
              </td>
              <td className="py-3 px-4 text-sm font-medium">
                {tx.asset}
              </td>
              <td className="py-3 px-4 text-sm text-dark-muted">{tx.portfolio}</td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {transactions.length === 0 && (
        <div className="text-center py-8 text-dark-muted">
          No transactions found
        </div>
      )}
    </div>
  )
}

export default TransactionTable