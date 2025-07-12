function AssetTable({ assets, onAssetClick }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-dark-border">
            <th className="text-left py-3 px-4 font-medium text-dark-muted">Asset</th>
            <th className="text-right py-3 px-4 font-medium text-dark-muted">Amount</th>
            <th className="text-right py-3 px-4 font-medium text-dark-muted">24H Change (%)</th>
            <th className="text-right py-3 px-4 font-medium text-dark-muted">Price (Market)</th>
            <th className="text-right py-3 px-4 font-medium text-dark-muted">Total</th>
            <th className="text-right py-3 px-4 font-medium text-dark-muted">P/L (24H)</th>
          </tr>
        </thead>
        <tbody>
          {assets.map((asset) => (
            <tr 
              key={asset.symbol} 
              className="border-b border-dark-border hover:bg-dark-border/20 cursor-pointer transition"
              onClick={() => onAssetClick && onAssetClick(asset)}
            >
              <td className="py-3 px-4">
                <div>
                  <div className="font-medium">{asset.name}</div>
                  <div className="text-sm text-dark-muted">{asset.symbol}</div>
                </div>
              </td>
              <td className="text-right py-3 px-4">{asset.amount}</td>
              <td className={`text-right py-3 px-4 ${asset.change24h < 0 ? 'text-red-500' : 'text-green-500'}`}>
                {asset.change24h > 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
              </td>
              <td className="text-right py-3 px-4">
                ${(() => {
                  const price = asset.price || asset.currentPrice || 0
                  if (price === 0) return '0'
                  if (price < 0.00001) return price.toExponential(2)
                  if (price < 0.01) return price.toFixed(6)
                  if (price < 1) return price.toFixed(4)
                  return price.toLocaleString()
                })()}
              </td>
              <td className="text-right py-3 px-4">${asset.total.toFixed(2)}</td>
              <td className={`text-right py-3 px-4 ${asset.pnl24h < 0 ? 'text-red-500' : 'text-green-500'}`}>
                ${Math.abs(asset.pnl24h).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default AssetTable