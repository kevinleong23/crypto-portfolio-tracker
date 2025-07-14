// Gemini 2.5 Pro model version
require('dotenv').config()
const axios = require('axios')
const { ethers } = require('ethers')
const { Connection, PublicKey } = require('@solana/web3.js')

// Ethereum/MetaMask integration
async function getEthereumBalances(address) {
  try {
    const balances = []
    
    // Use public RPC endpoints
    const provider = new ethers.JsonRpcProvider('https://eth.llamarpc.com')
    
    // Get ETH balance
    const ethBalance = await provider.getBalance(address)
    const ethValue = parseFloat(ethers.formatEther(ethBalance))
    
    if (ethValue > 0) {
      balances.push({
        symbol: 'ETH',
        amount: ethValue,
        name: 'Ethereum'
      })
    }
    
    // Get ALL ERC-20 token transfers to find all tokens
    try {
      // Use Etherscan API to get all ERC-20 token transfers
      const etherscanApiKey = process.env.ETHERSCAN_API_KEY || 'YourEtherscanAPIKey'
      const tokenTxResponse = await axios.get(
        `https://api.etherscan.io/api?module=account&action=tokentx&address=${address}&startblock=0&endblock=999999999&sort=desc&apikey=${etherscanApiKey}`
      )
      
      if (tokenTxResponse.data.result && Array.isArray(tokenTxResponse.data.result)) {
        // Create a map of all unique tokens
        const tokenBalanceMap = new Map()
        
        for (const tx of tokenTxResponse.data.result) {
          const symbol = tx.tokenSymbol
          const contractAddress = tx.contractAddress
          const decimals = parseInt(tx.tokenDecimal)
          
          if (!tokenBalanceMap.has(contractAddress)) {
            tokenBalanceMap.set(contractAddress, {
              symbol,
              address: contractAddress,
              decimals,
              name: tx.tokenName
            })
          }
        }
        
        // Now check balance for each unique token
        for (const [contractAddress, tokenInfo] of tokenBalanceMap) {
          try {
            const contract = new ethers.Contract(
              contractAddress,
              ['function balanceOf(address) view returns (uint256)'],
              provider
            )
            
            const balance = await contract.balanceOf(address)
            const value = parseFloat(ethers.formatUnits(balance, tokenInfo.decimals))
            
            if (value > 0) {
              balances.push({
                symbol: tokenInfo.symbol,
                amount: value,
                name: tokenInfo.name || tokenInfo.symbol
              })
            }
          } catch (error) {
            console.log(`Error fetching ${tokenInfo.symbol} balance`)
          }
        }
      }
    } catch (error) {
      console.log('Could not fetch token list from Etherscan:', error.message)
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
    const balances = []
    
    // Use public Solana RPC
    const connection = new Connection(process.env.SOLANA_RPC_URL || 'https://solana-api.projectserum.com', 'confirmed')
    const publicKey = new PublicKey(address)
    
    // Get SOL balance
    const solBalance = await connection.getBalance(publicKey)
    const solValue = solBalance / 1e9 // Convert lamports to SOL
    
    if (solValue > 0) {
      balances.push({
        symbol: 'SOL',
        amount: solValue,
        name: 'Solana'
      })
    }
    
    // Get SPL token accounts
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
      programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
    })
    
    // Common SPL tokens mapping
    const tokenMap = {
      'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': 'USDC',
      'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': 'USDT',
      'So11111111111111111111111111111111111111112': 'wSOL',
      '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs': 'ETH',
      'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So': 'mSOL',
      'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263': 'BONK',
      'J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn': 'JitoSOL',
      'jupSoLaHXQiZZTSfEWMTRRgpnyFm8f6sZdosWBjx93v': 'JupSOL',
      'HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3': 'PYTH',
      'jup6126qz4u4as4Kz8Y8CyYbnY6u9C5HYvFNhzwDqKi': 'JUP'
    }
    
    // Get SPL token accounts (only known tokens)
    for (const { account } of tokenAccounts.value) {
      const parsedInfo = account.data.parsed.info
      const mint = parsedInfo.mint
      const amount = parseFloat(parsedInfo.tokenAmount.uiAmount)
      
      if (amount > 0 && tokenMap[mint]) {
        const symbol = tokenMap[mint]
        balances.push({
          symbol,
          amount,
          name: symbol
        })
      }
    }
    
    return balances
  } catch (error) {
    console.error('Solana balance fetch error:', error)
    return []
  }
}

// Main function to get wallet balances
async function getWalletBalances(walletType, address) {
  try {
    console.log(`Fetching ${walletType} balances for ${address}`)
    
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
      // Using Etherscan API (requires API key for production)
      const etherscanApiKey = process.env.ETHERSCAN_API_KEY || 'YourEtherscanAPIKey'
      
      // Fetch normal transactions (ETH) - only Sent/Received
      const txlistResponse = await axios.get(
        `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${etherscanApiKey}`
      )
      
      if (txlistResponse.data.result && Array.isArray(txlistResponse.data.result)) {
        const txs = txlistResponse.data.result.filter(tx => parseFloat(tx.value) > 0);
        
        for (const tx of txs) {
          const isReceived = tx.to.toLowerCase() === address.toLowerCase()
          const type = isReceived ? 'Received' : 'Sent'
          const amount = parseFloat(tx.value) / 1e18
          
          transactions.push({
            type,
            asset: { symbol: 'ETH', name: 'Ethereum', amount },
            value: 0, // Would need price lookup
            source: 'MetaMask',
            sourceType: 'wallet',
            txHash: tx.hash,
            timestamp: new Date(parseInt(tx.timeStamp) * 1000),
            status: tx.isError === '0' ? 'completed' : 'failed'
          })
        }
      }

      // Add a more substantial delay to reliably avoid API rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Also fetch ERC-20 token transactions - only Sent/Received
      const tokenTxResponse = await axios.get(
        `https://api.etherscan.io/api?module=account&action=tokentx&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${etherscanApiKey}`
      )
      
      if (tokenTxResponse.data.result && Array.isArray(tokenTxResponse.data.result)) {
        const tokenTxs = tokenTxResponse.data.result
        
        for (const tx of tokenTxs) {
          const isReceived = tx.to.toLowerCase() === address.toLowerCase()
          const type = isReceived ? 'Received' : 'Sent'
          const amount = parseFloat(tx.value) / Math.pow(10, parseInt(tx.tokenDecimal))
          
          if (amount > 0) {
            transactions.push({
              type,
              asset: { symbol: tx.tokenSymbol, name: tx.tokenName, amount },
              value: 0, // Token value would need price lookup
              source: 'MetaMask',
              sourceType: 'wallet',
              txHash: tx.hash,
              timestamp: new Date(parseInt(tx.timeStamp) * 1000),
              status: 'completed'
            })
          }
        }
      }
      
      // Sort all transactions by timestamp (newest first) and limit
      return transactions.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);

    } else if (walletType === 'Phantom') {
        const connection = new Connection(process.env.SOLANA_RPC_URL || 'https://solana-api.projectserum.com', 'confirmed');
        const publicKey = new PublicKey(address);
    
        const signatures = await connection.getSignaturesForAddress(publicKey, { limit: limit * 2 });
    
        for (const sig of signatures) {
            await new Promise(resolve => setTimeout(resolve, 100));
            const tx = await connection.getParsedTransaction(sig.signature, { "maxSupportedTransactionVersion": 0 });
            if (!tx || !tx.meta || tx.meta.err) continue;
    
            // Check if this is a simple SOL transfer
            const instructions = tx.transaction.message.instructions;
            const hasSystemTransfer = instructions.some(inst => 
                inst.programId.toBase58() === '11111111111111111111111111111111' &&
                inst.parsed?.type === 'transfer'
            );
    
            if (!hasSystemTransfer) continue; // Skip non-transfer transactions
    
            // Find the transfer instruction
            const transferInstruction = instructions.find(inst => 
                inst.programId.toBase58() === '11111111111111111111111111111111' &&
                inst.parsed?.type === 'transfer'
            );
    
            if (!transferInstruction) continue;
    
            const source = transferInstruction.parsed.info.source;
            const destination = transferInstruction.parsed.info.destination;
            const lamports = transferInstruction.parsed.info.lamports;
            const amount = lamports / 1e9;
    
            // Determine transaction type
            let type;
            if (source === address) {
                type = 'Sent';
            } else if (destination === address) {
                type = 'Received';
            } else {
                continue; // Skip if neither sender nor receiver
            }
    
            transactions.push({
                type,
                asset: { symbol: 'SOL', name: 'Solana', amount },
                value: 0,
                source: 'Phantom',
                sourceType: 'wallet',
                txHash: sig.signature,
                timestamp: new Date(sig.blockTime * 1000),
                status: 'completed',
            });
        }
        return transactions.slice(0, limit);
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