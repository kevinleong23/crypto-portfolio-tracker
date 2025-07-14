const express = require('express')
const User = require('../models/User')
const Transaction = require('../models/Transaction') // Import Transaction model
const authMiddleware = require('../middleware/auth')
const { encrypt, decrypt } = require('../utils/encryption')
const { validateExchangeKeys } = require('../services/exchangeService')

const router = express.Router()

// Get all integrations
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('integrations')

    // Don't send encrypted keys to frontend
    const integrations = user.integrations.map(integration => {
        const sameTypeIntegrations = user.integrations.filter(i => i.name === integration.name && i.type === integration.type);
        const sameTypeIndex = sameTypeIntegrations.findIndex(i => i._id.toString() === integration._id.toString());
        const count = sameTypeIndex + 1;

        return {
            id: integration._id,
            type: integration.type,
            name: integration.name,
            displayName: integration.displayName || `${integration.name} ${integration.type === 'wallet' ? 'Wallet' : 'Exchange'} ${count}`,
            walletAddress: integration.walletAddress,
            isActive: integration.isActive,
            addedAt: integration.addedAt
        }
    })
    
    res.json(integrations)
  } catch (error) {
    console.error('Get integrations error:', error)
    res.status(500).json({ message: 'Failed to fetch integrations' })
  }
})

// Add exchange integration
router.post('/exchange', authMiddleware, async (req, res) => {
  try {
    const { exchange, apiKey, apiSecret } = req.body
    
    // Validate required fields
    if (!exchange || !apiKey || !apiSecret) {
      return res.status(400).json({ message: 'All fields are required' })
    }
    
    // Validate exchange name
    const supportedExchanges = ['MEXC', 'Binance']
    if (!supportedExchanges.includes(exchange)) {
      return res.status(400).json({ message: 'Unsupported exchange' })
    }
    
    // Check if already connected
    const existingIntegration = req.user.integrations.find(
      int => int.name === exchange && int.type === 'exchange'
    )
    if (existingIntegration) {
      return res.status(400).json({ message: 'Exchange already connected' })
    }
    
    // Validate API keys (implement in exchangeService)
    const isValid = await validateExchangeKeys(exchange, apiKey, apiSecret)
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid API keys. Please ensure they are read-only.' })
    }
    
    // Encrypt and save
    const encryptedKey = encrypt(apiKey)
    const encryptedSecret = encrypt(apiSecret)
    
    req.user.integrations.push({
      type: 'exchange',
      name: exchange,
      apiKey: encryptedKey,
      apiSecret: encryptedSecret,
      isActive: true
    })
    
    await req.user.save()
    
    res.json({ 
      message: 'Exchange connected successfully',
      integration: {
        id: req.user.integrations[req.user.integrations.length - 1]._id,
        type: 'exchange',
        name: exchange,
        isActive: true,
        addedAt: new Date()
      }
    })
  } catch (error) {
    console.error('Add exchange error:', error)
    res.status(500).json({ message: 'Failed to connect exchange' })
  }
})

// Add wallet integration
router.post('/wallet', authMiddleware, async (req, res) => {
  try {
    const { walletType, address } = req.body
    
    // Validate required fields
    if (!walletType || !address) {
      return res.status(400).json({ message: 'Wallet type and address are required' })
    }
    
    // Validate wallet type
    const supportedWallets = ['MetaMask', 'Phantom']
    if (!supportedWallets.includes(walletType)) {
      return res.status(400).json({ message: 'Unsupported wallet' })
    }
    
    // Check if already connected
    const existingWallet = req.user.integrations.find(
      int => int.walletAddress === address
    )
    if (existingWallet) {
      return res.status(400).json({ message: 'Wallet already connected' })
    }
    
    // Save wallet
    req.user.integrations.push({
      type: 'wallet',
      name: walletType,
      walletAddress: address,
      isActive: true
    })
    
    await req.user.save()
    
    res.json({ 
      message: 'Wallet connected successfully',
      integration: {
        id: req.user.integrations[req.user.integrations.length - 1]._id,
        type: 'wallet',
        name: walletType,
        walletAddress: address,
        isActive: true,
        addedAt: new Date()
      }
    })
  } catch (error) {
    console.error('Add wallet error:', error)
    res.status(500).json({ message: 'Failed to connect wallet' })
  }
})

// Remove integration
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    
    // Find integration index
    const integrationIndex = req.user.integrations.findIndex(
      int => int._id.toString() === id
    )
    
    if (integrationIndex === -1) {
      return res.status(404).json({ message: 'Integration not found' })
    }
    
    // Remove the integration from the user's integrations array
    req.user.integrations.splice(integrationIndex, 1)
    await req.user.save()
    
    // Also remove all transactions associated with this integration
    await Transaction.deleteMany({ userId: req.user._id, integrationId: id })
    
    res.json({ message: 'Integration and associated transactions removed successfully' })
  } catch (error) {
    console.error('Remove integration error:', error)
    res.status(500).json({ message: 'Failed to remove integration' })
  }
})

// Update integration display name
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    const { displayName } = req.body
    
    // Find integration
    const integration = req.user.integrations.find(
      int => int._id.toString() === id
    )
    
    if (!integration) {
      return res.status(404).json({ message: 'Integration not found' })
    }
    
    // Update display name
    integration.displayName = displayName
    await req.user.save()
    
    res.json({ 
      message: 'Integration updated successfully',
      integration: {
        id: integration._id,
        displayName: integration.displayName
      }
    })
  } catch (error) {
    console.error('Update integration error:', error)
    res.status(500).json({ message: 'Failed to update integration' })
  }
})

module.exports = router