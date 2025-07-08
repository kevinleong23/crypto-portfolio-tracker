const User = require('../models/User')
const Portfolio = require('../models/Portfolio')
const Transaction = require('../models/Transaction')
const { decrypt } = require('../utils/encryption')
const { getExchangeBalances } = require('./exchangeService')
const { getWalletBalances } = require('./walletService')
const { CoinGeckoService, symbolToCoinGeckoId } = require('./coinGeckoService')

const coinGecko = new CoinGeckoService(process.env.COINGECKO_API_KEY)

async function syncPortfolio(userId) {
  try {
    // Get user with integrations
    const user = await User.findById(userId)
    if (!user) throw new Error('User not found')
    
    // Get current portfolio
    let portfolio = await Portfolio.findOne({ userId })
    if (!portfolio) {
      portfolio = new Portfolio({ userId, assets: [] })
    }
    
    // Collect all balances
    const allBalances = new Map() // symbol -> { amount, sources }
    
    // Sync exchange balances
    for (const integration of user.integrations) {
      if (integration.type === 'exchange' && integration.isActive) {
        try {
          const apiKey = decrypt(integration.apiKey)
          const apiSecret = decrypt(integration.apiSecret)
          
          const balances = await getExchangeBalances(
            integration.name,
            apiKey,
            apiSecret,
            userId
          )
          
          // Aggregate balances
          for (const balance of balances) {
            if (balance.amount > 0) {
              const existing = allBalances.get(balance.symbol) || { amount: 0, sources: [] }
              existing.amount += balance.amount
              existing.sources.push({
                name: integration.name,
                type: 'exchange',
                amount: balance.amount
              })
              allBalances.set(balance.symbol, existing)
              
              // Store original balance data if it has price info
              if (balance.currentPrice) {
                existing.currentPrice = balance.currentPrice
                existing.totalValue = balance.totalValue
              }
            }
          }
        } catch (error) {
          console.error(`Failed to sync ${integration.name}:`, error)
        }
      } else if (integration.type === 'wallet' && integration.isActive) {
        try {
          const balances = await getWalletBalances(
            integration.name,
            integration.walletAddress
          )
          
          // Aggregate balances
          for (const balance of balances) {
            if (balance.amount > 0) {
              const existing = allBalances.get(balance.symbol) || { amount: 0, sources: [] }
              existing.amount += balance.amount
              existing.sources.push({
                name: integration.name,
                type: 'wallet',
                amount: balance.amount
              })
              allBalances.set(balance.symbol, existing)
            }
          }
        } catch (error) {
          console.error(`Failed to sync ${integration.name} wallet:`, error)
        }
      }
    }
    
    // Get prices for all assets using CoinGecko
    const symbols = Array.from(allBalances.keys())
    const coinGeckoIds = symbols
      .map(s => symbolToCoinGeckoId[s])
      .filter(id => id)
    
    let prices = {}
    try {
      prices = await coinGecko.getPrices(coinGeckoIds)
    } catch (error) {
      console.error('Failed to fetch prices:', error)
    }
    
    // Update portfolio assets
    portfolio.assets = []
    
    for (const [symbol, data] of allBalances) {
      const coinGeckoId = symbolToCoinGeckoId[symbol]
      const priceData = prices[coinGeckoId] || {}
      const currentPrice = priceData.usd || 0
      const change24h = priceData.usd_24h_change || 0
      
      const totalValue = data.amount * currentPrice
      const previousValue = totalValue / (1 + change24h / 100)
      const pnl24h = totalValue - previousValue
      
      // Add to portfolio
      portfolio.assets.push({
        symbol,
        name: symbol, // You might want to maintain a symbol->name mapping
        amount: data.amount,
        source: data.sources[0].name, // Primary source
        sourceType: data.sources[0].type,
        currentPrice,
        totalValue,
        change24h: pnl24h,
        changePercent24h: change24h,
        pnl24h,
        lastUpdated: new Date()
      })
    }
    
    // Update portfolio totals and save
    portfolio.lastSync = new Date()
    await portfolio.save()
    
    // Update user last sync
    user.lastSync = new Date()
    await user.save()
    
    // Add to performance history
    if (portfolio.totalValue > 0) {
      portfolio.performanceHistory.push({
        timestamp: new Date(),
        totalValue: portfolio.totalValue
      })
      
      // Keep only last 365 days of history
      const oneYearAgo = new Date()
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
      portfolio.performanceHistory = portfolio.performanceHistory.filter(
        point => point.timestamp > oneYearAgo
      )
      
      await portfolio.save()
    }
    
    return {
      assetsUpdated: portfolio.assets.length,
      lastSync: portfolio.lastSync
    }
  } catch (error) {
    console.error('Sync portfolio error:', error)
    throw error
  }
}

// Auto-sync job (can be called by a cron job)
async function autoSyncAllPortfolios() {
  try {
    const users = await User.find({ 'integrations.0': { $exists: true } })
    
    for (const user of users) {
      try {
        await syncPortfolio(user._id)
        console.log(`Synced portfolio for user ${user._id}`)
      } catch (error) {
        console.error(`Failed to sync portfolio for user ${user._id}:`, error)
      }
    }
  } catch (error) {
    console.error('Auto sync error:', error)
  }
}

module.exports = {
  syncPortfolio,
  autoSyncAllPortfolios
}