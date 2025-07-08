const axios = require('axios')
const crypto = require('crypto')
const simulatedExchangeService = require('./simulatedExchangeService')

// MEXC API
class MEXCClient {
  constructor(apiKey, apiSecret) {
    this.apiKey = apiKey
    this.apiSecret = apiSecret
    this.baseURL = 'https://api.mexc.com'
  }

  generateSignature(queryString) {
    return crypto.createHmac('sha256', this.apiSecret).update(queryString).digest('hex')
  }

  async getBalance() {
    try {
      const timestamp = Date.now()
      const queryString = `timestamp=${timestamp}`
      const signature = this.generateSignature(queryString)
      
      const response = await axios.get(`${this.baseURL}/api/v3/account?${queryString}&signature=${signature}`, {
        headers: {
          'X-MEXC-APIKEY': this.apiKey
        }
      })
      
      return response.data.balances.filter(b => parseFloat(b.free) > 0 || parseFloat(b.locked) > 0)
    } catch (error) {
      console.error('MEXC API error:', error.response?.data || error.message)
      throw new Error('Failed to fetch MEXC balance')
    }
  }
}

// Binance API
class BinanceClient {
  constructor(apiKey, apiSecret) {
    this.apiKey = apiKey
    this.apiSecret = apiSecret
    this.baseURL = 'https://api.binance.com'
  }

  generateSignature(queryString) {
    return crypto.createHmac('sha256', this.apiSecret).update(queryString).digest('hex')
  }

  async getBalance() {
    try {
      const timestamp = Date.now()
      const queryString = `timestamp=${timestamp}`
      const signature = this.generateSignature(queryString)
      
      const response = await axios.get(`${this.baseURL}/api/v3/account?${queryString}&signature=${signature}`, {
        headers: {
          'X-MBX-APIKEY': this.apiKey
        }
      })
      
      return response.data.balances.filter(b => parseFloat(b.free) > 0 || parseFloat(b.locked) > 0)
    } catch (error) {
      console.error('Binance API error:', error.response?.data || error.message)
      throw new Error('Failed to fetch Binance balance')
    }
  }
}

// Validate exchange API keys
async function validateExchangeKeys(exchange, apiKey, apiSecret) {
  try {
    // For testing without real API keys
    if (apiKey === 'test-api-key' && apiSecret === 'test-api-secret') {
      return true
    }
    
    let client
    
    switch (exchange) {
      case 'MEXC':
        client = new MEXCClient(apiKey, apiSecret)
        break
      case 'Binance':
        client = new BinanceClient(apiKey, apiSecret)
        break
      default:
        return false
    }
    
    // Try to fetch balance to validate keys
    await client.getBalance()
    return true
  } catch (error) {
    console.error('API validation error:', error)
    return false
  }
}

// Get balances from exchange
async function getExchangeBalances(exchange, apiKey, apiSecret, userId = null) {
  // Check if using test keys - use simulated exchange
  if (apiKey === 'test-api-key' && apiSecret === 'test-api-secret') {
    if (!userId) {
      throw new Error('User ID required for simulated mode')
    }
    return await simulatedExchangeService.getSimulatedBalances(userId, exchange)
  }
  
  let client
  
  switch (exchange) {
    case 'MEXC':
      client = new MEXCClient(apiKey, apiSecret)
      break
    case 'Binance':
      client = new BinanceClient(apiKey, apiSecret)
      break
    default:
      throw new Error('Unsupported exchange')
  }
  
  const balances = await client.getBalance()
  
  // Format balances
  return balances.map(balance => ({
    symbol: balance.asset || balance.coin,
    amount: parseFloat(balance.free) + parseFloat(balance.locked),
    free: parseFloat(balance.free),
    locked: parseFloat(balance.locked)
  }))
}

// Get current prices using CoinGecko
async function getPrices(symbols) {
  try {
    const { CoinGeckoService, symbolToCoinGeckoId } = require('./coinGeckoService')
    const coinGecko = new CoinGeckoService(process.env.COINGECKO_API_KEY)
    
    // Map symbols to CoinGecko IDs
    const coinIds = symbols
      .map(symbol => symbolToCoinGeckoId[symbol.toUpperCase()])
      .filter(id => id)
    
    if (coinIds.length === 0) return {}
    
    return await coinGecko.getPrices(coinIds)
  } catch (error) {
    console.error('Price fetch error:', error)
    return {}
  }
}

module.exports = {
  validateExchangeKeys,
  getExchangeBalances,
  getPrices,
  MEXCClient,
  BinanceClient
}