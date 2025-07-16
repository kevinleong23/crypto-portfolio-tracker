import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { integrationAPI } from '../services/api'
import { useError } from '../App'

function Integration() {
  const navigate = useNavigate()
  const { showError, showSuccess } = useError()
  const [showApiForm, setShowApiForm] = useState(false)
  const [selectedExchange, setSelectedExchange] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [apiSecret, setApiSecret] = useState('')
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [editingName, setEditingName] = useState('')
  
  const [connections, setConnections] = useState([])

  const exchanges = ['MEXC', 'Binance']
  const wallets = ['MetaMask', 'Phantom']

  useEffect(() => {
    fetchIntegrations()
  }, [])

  const fetchIntegrations = async () => {
    try {
      const response = await integrationAPI.getAll()
      setConnections(response.data)
    } catch (error) {
      showError('Failed to load integrations')
    } finally {
      setLoading(false)
    }
  }

  const handleConnectExchange = async () => {
    if (apiKey && apiSecret && selectedExchange) {
      try {
        const response = await integrationAPI.addExchange(selectedExchange, apiKey, apiSecret)
        await fetchIntegrations()
        setShowApiForm(false)
        setApiKey('')
        setApiSecret('')
        setSelectedExchange('')
        showSuccess(response.data.message)
      } catch (error) {
        showError(error.response?.data?.message || 'Failed to connect exchange')
      }
    }
  }

  const handleConnectWallet = async (walletType) => {
    try {
      let address
      
      if (walletType === 'MetaMask') {
        if (window.ethereum) {
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
          address = accounts[0]
        } else {
          showError('Please install MetaMask extension')
          return
        }
      } else if (walletType === 'Phantom') {
        if (window.solana) {
          const resp = await window.solana.connect()
          address = resp.publicKey.toString()
        } else {
          showError('Please install Phantom wallet extension')
          return
        }
      }

      const response = await integrationAPI.addWallet(walletType, address)
      await fetchIntegrations()
      showSuccess(response.data.message)
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to connect wallet')
    }
  }

  const handleEditName = (id, currentName) => {
    setEditingId(id)
    setEditingName(currentName)
  }

  const handleSaveName = async (id) => {
    try {
      await integrationAPI.updateName(id, editingName)
      await fetchIntegrations()
      setEditingId(null)
      showSuccess('Name updated successfully')
    } catch (error) {
      showError('Failed to update name')
    }
  }

  const handleDisconnect = async (id) => {
    try {
      await integrationAPI.remove(id)
      await fetchIntegrations()
      showSuccess('Integration removed successfully')
    } catch (error) {
      showError('Failed to remove integration')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-xl">Loading integrations...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-bg p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Integrations</h1>

        {/* Connected Accounts */}
        <div className="bg-dark-card p-6 rounded-lg border border-dark-border mb-6">
          <h2 className="text-xl font-semibold mb-4">Connected Accounts</h2>
          {connections.length === 0 ? (
            <p className="text-dark-muted">No accounts connected yet.</p>
          ) : (
            <div className="space-y-3">
              {connections.map((conn) => (
                <div key={conn.id} className="flex justify-between items-center p-3 bg-dark-bg rounded border border-dark-border">
                  <div className="flex items-center gap-2">
                    {editingId === conn.id ? (
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onBlur={() => handleSaveName(conn.id)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSaveName(conn.id)}
                        className="px-2 py-1 bg-dark-card border border-dark-border rounded focus:outline-none focus:border-blue-500"
                        autoFocus
                      />
                    ) : (
                      <span 
                        className="font-medium cursor-pointer hover:text-blue-400"
                        onClick={() => handleEditName(conn.id, conn.displayName)}
                      >
                        {conn.displayName}
                      </span>
                    )}
                    {conn.walletAddress && (
                      <span className="text-sm text-dark-muted">
                        ({conn.walletAddress.slice(0, 6)}...{conn.walletAddress.slice(-4)})
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleDisconnect(conn.id)}
                    className="text-red-500 hover:text-red-400 text-sm"
                  >
                    Disconnect
                  </button>
                </div>
              ))}

              {/* Show helpful hint */}
              {connections.length > 0 && (
                <p className="text-sm text-dark-muted mt-2">
                  Click on a name to edit it
                </p>
              )}
            </div>
          )}
        </div>

        {/* Add Exchange */}
        <div className="bg-dark-card p-6 rounded-lg border border-dark-border mb-6">
          <h2 className="text-xl font-semibold mb-4">Add Exchange</h2>
          {!showApiForm ? (
            <div className="grid grid-cols-2 gap-4">
              {exchanges.map((exchange) => (
                <button
                  key={exchange}
                  onClick={() => {
                    setSelectedExchange(exchange)
                    setShowApiForm(true)
                  }}
                  className="p-4 bg-dark-bg hover:bg-gray-700 border border-dark-border rounded transition"
                >
                  {exchange}
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg">Connect {selectedExchange}</h3>
              <input
                type="text"
                placeholder="API Key (Read-only)"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded focus:outline-none focus:border-blue-500"
              />
              <input
                type="password"
                placeholder="API Secret"
                value={apiSecret}
                onChange={(e) => setApiSecret(e.target.value)}
                className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded focus:outline-none focus:border-blue-500"
              />
              <div className="flex gap-4">
                <button
                  onClick={handleConnectExchange}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
                >
                  Connect Exchange
                </button>
                <button
                  onClick={() => {
                    setShowApiForm(false)
                    setSelectedExchange('')
                    setApiKey('')
                    setApiSecret('')
                  }}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Add Wallet */}
        <div className="bg-dark-card p-6 rounded-lg border border-dark-border">
          <h2 className="text-xl font-semibold mb-4">Add Wallet</h2>
          <div className="grid grid-cols-2 gap-4">
            {wallets.map((wallet) => (
              <button
                key={wallet}
                onClick={() => handleConnectWallet(wallet)}
                className="p-4 bg-dark-bg hover:bg-gray-700 border border-dark-border rounded transition"
              >
                {wallet}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Integration