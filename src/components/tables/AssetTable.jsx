function AssetTable({ assets, onAssetClick }) {
  const formatNumber = (num) => {
    if (num === 0) return '0';
    // Use a higher precision for very small numbers to avoid scientific notation
    if (num > 0 && num < 0.001) return parseFloat(num.toFixed(8)).toString();
    if (num < 1) return parseFloat(num.toFixed(4)).toString();
    return num.toLocaleString('en-US', { maximumFractionDigits: 3 });
  };

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
              className={`border-b border-dark-border transition ${onAssetClick ? 'hover:bg-dark-border/20 cursor-pointer' : ''}`}
              onClick={() => onAssetClick && onAssetClick(asset)}
            >
              <td className="py-3 px-4">
                <div>
                  <div className="font-medium">{asset.name}</div>
                  <div className="text-sm text-dark-muted">{asset.symbol}</div>
                </div>
              </td>
              <td className="text-right py-3 px-4">{formatNumber(asset.amount)}</td>
              <td className={`text-right py-3 px-4 ${asset.change24h < 0 ? 'text-red-500' : 'text-green-500'}`}>
                {asset.change24h > 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
              </td>
              <td className="text-right py-3 px-4">
                ${formatNumber(asset.price || asset.currentPrice || 0)}
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
  );
}

export default AssetTable