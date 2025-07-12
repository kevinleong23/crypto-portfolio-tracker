const Transaction = require('../models/Transaction')
const { getWalletTransactions } = require('./walletService')

async function syncWalletTransactions(userId, integration) {
  try {
    if (integration.type !== 'wallet') return
    
    // Get recent transactions from wallet
    const walletTxs = await getWalletTransactions(
      integration.name,
      integration.walletAddress,
      20 // Get last 20 transactions
    )
    
    // Save new transactions to database
    for (const tx of walletTxs) {
      // Check if transaction already exists
      const existing = await Transaction.findOne({
        userId,
        txHash: tx.txHash
      })
      
      if (!existing && tx.asset.amount > 0) {
        const transaction = new Transaction({
          userId,
          type: tx.type,
          asset: tx.asset,
          value: tx.value,
          source: integration.name,
          sourceType: 'wallet',
          txHash: tx.txHash,
          timestamp: tx.timestamp,
          status: tx.status || 'completed'
        })
        
        await transaction.save()
      }
    }
    
    console.log(`Synced ${walletTxs.length} transactions for ${integration.name}`)
  } catch (error) {
    console.error(`Failed to sync transactions for ${integration.name}:`, error)
  }
}

// Add to sync process
async function syncAllTransactions(userId, integrations) {
  for (const integration of integrations) {
    if (integration.type === 'wallet' && integration.isActive) {
      await syncWalletTransactions(userId, integration)
    }
  }
}

module.exports = {
  syncWalletTransactions,
  syncAllTransactions
}