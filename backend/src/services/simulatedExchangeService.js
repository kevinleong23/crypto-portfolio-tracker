const { CoinGeckoService, symbolToCoinGeckoId } = require('./coinGeckoService')

// Simulated user portfolios (in production, this would be in database)
const simulatedPortfolios = new Map()

class SimulatedExchangeService {
  constructor() {
    this.coinGecko = new CoinGeckoService(process.env.COINGECKO_API_KEY)
  }

  // Initialize a user's portfolio with some default holdings
  initializeUserPortfolio(userId, exchangeName) {
    const key = `${userId}-${exchangeName}`
    
    if (!simulatedPortfolios.has(key)) {
      // Default portfolio based on exchange
      const defaultPortfolios = {
        'MEXC': {
          'BTC': 0.05,
          'ETH': 0.5,
          'SOL': 10,
          'USDT': 1000
        },
        'Binance': {
          'BTC': 0.1,
          'ETH': 1,
          'BNB': 5,
          'USDT': 2000,
          'ADA': 500
        },
        'Demo': {
          'BTC': 0.25,
          'ETH': 2,
          'SOL': 25,
          'MATIC': 1000,
          'LINK': 50,
          'USDT': 5000,
          'USDC': 2500
        }
      }
      
      simulatedPortfolios.set(key, defaultPortfolios[exchangeName] || defaultPortfolios['Demo'])
    }
    
    return simulatedPortfolios.get(key)
  }

  // Get balances for a specific exchange
  async getSimulatedBalances(userId, exchangeName) {
    try {
      // Get or initialize portfolio
      const portfolio = this.initializeUserPortfolio(userId, exchangeName)
      
      // Get symbols that have balances
      const symbols = Object.keys(portfolio).filter(symbol => portfolio[symbol] > 0)
      
      // Map to CoinGecko IDs
      const coinIds = symbols
        .map(symbol => symbolToCoinGeckoId[symbol])
        .filter(id => id)
      
      // Get real prices from CoinGecko
      const prices = await this.coinGecko.getPrices(coinIds)
      
      // Format balances with real prices
      const balances = []
      
      for (const symbol of symbols) {
        const coinId = symbolToCoinGeckoId[symbol]
        const amount = portfolio[symbol]
        
        if (coinId && prices[coinId]) {
          const price = prices[coinId].usd || 0
          const change24h = prices[coinId].usd_24h_change || 0
          
          balances.push({
            symbol,
            name: symbol, // You could enhance this with full names
            amount,
            free: amount,
            locked: 0,
            currentPrice: price,
            totalValue: amount * price,
            change24h: change24h,
            source: exchangeName
          })
        } else if (symbol === 'USDT' || symbol === 'USDC') {
          // Stablecoins
          balances.push({
            symbol,
            name: symbol,
            amount,
            free: amount,
            locked: 0,
            currentPrice: 1,
            totalValue: amount,
            change24h: 0,
            source: exchangeName
          })
        }
      }
      
      return balances
    } catch (error) {
      console.error('Simulated balance error:', error)
      throw new Error('Failed to get simulated balances')
    }
  }

  // Simulate a trade (for future enhancement)
  async simulateTrade(userId, exchangeName, fromSymbol, toSymbol, amount) {
    const key = `${userId}-${exchangeName}`
    const portfolio = simulatedPortfolios.get(key)
    
    if (!portfolio) {
      throw new Error('Portfolio not found')
    }
    
    if (portfolio[fromSymbol] < amount) {
      throw new Error('Insufficient balance')
    }
    
    // Get prices
    const fromCoinId = symbolToCoinGeckoId[fromSymbol]
    const toCoinId = symbolToCoinGeckoId[toSymbol]
    
    if (!fromCoinId || !toCoinId) {
      throw new Error('Invalid trading pair')
    }
    
    const prices = await this.coinGecko.getPrices([fromCoinId, toCoinId])
    
    const fromPrice = prices[fromCoinId]?.usd || 0
    const toPrice = prices[toCoinId]?.usd || 0
    
    if (fromPrice === 0 || toPrice === 0) {
      throw new Error('Unable to get prices')
    }
    
    // Calculate trade
    const fromValue = amount * fromPrice
    const toAmount = fromValue / toPrice * 0.999 // 0.1% fee
    
    // Update portfolio
    portfolio[fromSymbol] = (portfolio[fromSymbol] || 0) - amount
    portfolio[toSymbol] = (portfolio[toSymbol] || 0) + toAmount
    
    return {
      from: { symbol: fromSymbol, amount, price: fromPrice },
      to: { symbol: toSymbol, amount: toAmount, price: toPrice },
      fee: fromValue * 0.001,
      timestamp: new Date()
    }
  }

  // Get market chart data for portfolio performance
  async getPortfolioHistory(userId, exchangeName, days = 7) {
    try {
      const portfolio = this.initializeUserPortfolio(userId, exchangeName)
      const symbols = Object.keys(portfolio).filter(symbol => portfolio[symbol] > 0)
      
      // For simplicity, just track BTC price movement for portfolio
      // In production, you'd weight by actual holdings
      const btcData = await this.coinGecko.getMarketChart('bitcoin', days)
      
      const history = btcData.prices.map(([timestamp, price]) => {
        // Simple portfolio value calculation
        let totalValue = 0
        for (const symbol of symbols) {
          if (symbol === 'BTC') {
            totalValue += portfolio[symbol] * price
          } else if (symbol === 'USDT' || symbol === 'USDC') {
            totalValue += portfolio[symbol]
          } else {
            // Rough estimation for other coins
            totalValue += portfolio[symbol] * 100 // Placeholder
          }
        }
        
        return {
          timestamp: new Date(timestamp),
          totalValue
        }
      })
      
      return history
    } catch (error) {
      console.error('Portfolio history error:', error)
      return []
    }
  }
}

module.exports = new SimulatedExchangeService()