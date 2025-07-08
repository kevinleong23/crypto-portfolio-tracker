function TransactionTable({ transactions }) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-dark-border">
              <th className="text-left py-3 px-4 font-medium text-dark-muted">Date</th>
              <th className="text-left py-3 px-4 font-medium text-dark-muted">Type</th>
              <th className="text-left py-3 px-4 font-medium text-dark-muted">Asset, Amount, Value</th>
              <th className="text-left py-3 px-4 font-medium text-dark-muted">Portfolio</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx, index) => (
              <tr key={index} className="border-b border-dark-border hover:bg-dark-border/20 transition">
                <td className="py-3 px-4 text-sm">{tx.date}</td>
                <td className="py-3 px-4">
                  <span className={`inline-flex px-2 py-1 text-xs rounded ${
                    tx.type === 'Received' 
                      ? 'bg-green-900/30 text-green-400' 
                      : 'bg-red-900/30 text-red-400'
                  }`}>
                    {tx.type}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="text-sm">
                    <span className="font-medium">{tx.asset}</span>
                    <span className="text-dark-muted">, ${tx.value.toFixed(2)}</span>
                  </div>
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