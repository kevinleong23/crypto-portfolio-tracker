const axios = require('axios')

// Ethereum/MetaMask integration using Etherscan API
async function getEthereumBalances(address) {
  try {
    // For production, use your own API keys
    const etherscanApiKey = process.env.ETHERSCAN_API_KEY || 'YourEtherscanAPIKey'
    
    // Get ETH balance
    const ethResponse = await axios.get(
      `https://api.etherscan.io/api?module=account&action=balance&address=${address}&tag=latest&apikey=${etherscanApiKey}`
    )
    
    const ethBalance = parseFloat(ethResponse.data.result) / 1e18 // Convert from wei
    
    // Get ERC-20 token balances
    const tokenResponse = await axios.get(
      `https://api.etherscan.io/api?module=account&action=tokentx&address=${address}&startblock=0&endblock=999999999&sort=asc&apikey=${etherscanApiKey}`
    )
    
    // Aggregate token balances
    const tokenBalances = new Map()
    
    if (tokenResponse.data.result && Array.isArray(tokenResponse.data.result)) {
      for (const tx of tokenResponse.data.result) {
        const symbol = tx.tokenSymbol
        const amount = parseFloat(tx.value) / Math.pow(10, parseInt(tx.tokenDecimal))
        
        if (tx.to.toLowerCase() === address.toLowerCase()) {
          // Incoming
          const current = tokenBalances.get(symbol) || 0
          tokenBalances.set(symbol, current + amount)
        } else if (tx.from.toLowerCase() === address.toLowerCase()) {
          // Outgoing
          const current = tokenBalances.get(symbol) || 0
          tokenBalances.set(symbol, current - amount)
        }
      }
    }
    
    // Format balances
    const balances = []
    
    if (ethBalance > 0) {
      balances.push({
        symbol: 'ETH',
        amount: ethBalance
      })
    }
    
    for (const [symbol, amount] of tokenBalances) {
      if (amount > 0) {
        balances.push({ symbol, amount })
      }
    }
    
    return balances
  } catch (error) {
    console.error('Ethereum balance fetch error:', error)
    return []
  }
}

// Solana/Phantom integration
async function getSolanaBalances(address) {
  try {
    // Using public Solana RPC endpoint
    const response = await axios.post('https://api.mainnet-beta.solana.com', {
      jsonrpc: '2.0',
      id: 1,
      method: 'getBalance',
      params: [address]
    })
    
    const solBalance = response.data.result.value / 1e9 // Convert from lamports
    
    const balances = []
    if (solBalance > 0) {
      balances.push({
        symbol: 'SOL',
        amount: solBalance
      })
    }
    
    // For SPL tokens, you would need additional API calls
    // This is a simplified version
    
    return balances
  } catch (error) {
    console.error('Solana balance fetch error:', error)
    return []
  }
}

// Main function to get wallet balances
async function getWalletBalances(walletType, address) {
  try {
    switch (walletType) {
      case 'MetaMask':
        return await getEthereumBalances(address)
      case 'Phantom':
        return await getSolanaBalances(address)
      default:
        throw new Error('Unsupported wallet type')
    }
  } catch (error) {
    console.error('Wallet balance fetch error:', error)
    return []
  }
}

// Get transaction history for wallet
async function getWalletTransactions(walletType, address, limit = 10) {
  try {
    const transactions = []
    
    if (walletType === 'MetaMask') {
      const etherscanApiKey = process.env.ETHERSCAN_API_KEY || 'YourEtherscanAPIKey'
      
      const response = await axios.get(
        `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${etherscanApiKey}`
      )
      
      if (response.data.result && Array.isArray(response.data.result)) {
        const txs = response.data.result.slice(0, limit)
        
        for (const tx of txs) {
          const type = tx.to.toLowerCase() === address.toLowerCase() ? 'Received' : 'Sent'
          const amount = parseFloat(tx.value) / 1e18
          
          if (amount > 0) {
            transactions.push({
              type,
              asset: {
                symbol: 'ETH',
                name: 'Ethereum',
                amount
              },
              value: amount * 2000, // You'd fetch real price here
              source: 'MetaMask',
              sourceType: 'wallet',
              txHash: tx.hash,
              timestamp: new Date(parseInt(tx.timeStamp) * 1000),
              status: tx.isError === '0' ? 'completed' : 'failed'
            })
          }
        }
      }
    } else if (walletType === 'Phantom') {
      // Solana transaction history would be implemented here
      // This requires more complex RPC calls
    }
    
    return transactions
  } catch (error) {
    console.error('Wallet transaction fetch error:', error)
    return []
  }
}

module.exports = {
  getWalletBalances,
  getWalletTransactions,
  getEthereumBalances,
  getSolanaBalances
}