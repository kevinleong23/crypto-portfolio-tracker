const axios = require('axios')

class CoinGeckoService {
  constructor(apiKey = null) {
    this.baseURL = 'https://api.coingecko.com/api/v3'
    this.apiKey = apiKey
    this.headers = apiKey ? { 'x-cg-demo-api-key': apiKey } : {}
  }

  // Get current prices for multiple coins
  async getPrices(coinIds) {
    try {
      const ids = coinIds.join(',')
      const response = await axios.get(`${this.baseURL}/simple/price`, {
        params: {
          ids: ids,
          vs_currencies: 'usd',
          include_24hr_change: true,
          include_market_cap: true,
          include_24hr_vol: true
        },
        headers: this.headers
      })
      
      return response.data
    } catch (error) {
      console.error('CoinGecko price fetch error:', error)
      throw new Error('Failed to fetch prices')
    }
  }

  // Get detailed coin data
  async getCoinData(coinId) {
    try {
      const response = await axios.get(`${this.baseURL}/coins/${coinId}`, {
        params: {
          localization: false,
          tickers: false,
          community_data: false,
          developer_data: false
        },
        headers: this.headers
      })
      
      return response.data
    } catch (error) {
      console.error('CoinGecko coin data error:', error)
      throw new Error('Failed to fetch coin data')
    }
  }

  // Get market chart data
  async getMarketChart(coinId, days = 7) {
    try {
      const response = await axios.get(`${this.baseURL}/coins/${coinId}/market_chart`, {
        params: {
          vs_currency: 'usd',
          days: days
        },
        headers: this.headers
      })
      
      return response.data
    } catch (error) {
      console.error('CoinGecko market chart error:', error)
      throw new Error('Failed to fetch market chart')
    }
  }

  // Get trending coins
  async getTrending() {
    try {
      const response = await axios.get(`${this.baseURL}/search/trending`, {
        headers: this.headers
      })
      
      return response.data
    } catch (error) {
      console.error('CoinGecko trending error:', error)
      throw new Error('Failed to fetch trending coins')
    }
  }
}

// Extended symbol to CoinGecko ID mapping
const symbolToCoinGeckoId = {
  'BTC': 'bitcoin',
  'ETH': 'ethereum',
  'BNB': 'binancecoin',
  'SOL': 'solana',
  'USDT': 'tether',
  'USDC': 'usd-coin',
  'XRP': 'ripple',
  'ADA': 'cardano',
  'DOGE': 'dogecoin',
  'AVAX': 'avalanche-2',
  'SHIB': 'shiba-inu',
  'DOT': 'polkadot',
  'LINK': 'chainlink',
  'MATIC': 'matic-network',
  'UNI': 'uniswap',
  'LTC': 'litecoin',
  'TRX': 'tron',
  'ATOM': 'cosmos',
  'XLM': 'stellar',
  'VET': 'vechain',
  'FIL': 'filecoin',
  'THETA': 'theta-token',
  'FTM': 'fantom',
  'ALGO': 'algorand',
  'XTZ': 'tezos',
  'MANA': 'decentraland',
  'SAND': 'the-sandbox',
  'AXS': 'axie-infinity',
  'AAVE': 'aave',
  'COMP': 'compound-governance-token',
  'SNX': 'synthetix-network-token',
  'CRV': 'curve-dao-token',
  'MKR': 'maker',
  'NEAR': 'near',
  'ETC': 'ethereum-classic',
  'XMR': 'monero',
  'APE': 'apecoin',
  'HBAR': 'hedera',
  'QNT': 'quant-network',
  'CHZ': 'chiliz',
  'FLOW': 'flow',
  'OP': 'optimism',
  'ARB': 'arbitrum',
  'TON': 'the-open-network',
  'ICP': 'internet-computer',
  'IMX': 'immutable-x',
  'APT': 'aptos',
  'GRT': 'the-graph',
  'ENS': 'ethereum-name-service',
  'CFX': 'conflux-token',
  'PEPE': 'pepe',
  'SUI': 'sui',
  'RNDR': 'render-token',
  'WLD': 'worldcoin-wld',
  'SEI': 'sei-network',
  'JUP': 'jupiter-aggregate-bond',
  'PYTH': 'pyth-network',
  'STRK': 'starknet',
  'PIXEL': 'pixels',
  'PORTAL': 'portal-gaming',
  'DYM': 'dymension',
  'MANTA': 'manta-network',
  'ALT': 'altlayer',
  'ZETA': 'zetachain',
  'CYBER': 'cyberconnect',
  'XAI': 'xai-blockchain',
  'ACE': 'ace-token',
  'NFP': 'non-fungible-people',
  'AI': 'sleepless-ai',
  'BOME': 'book-of-meme',
  'ETHFI': 'ether-fi',
  'ENA': 'ethena',
  'W': 'wormhole',
  'OMNI': 'omni-network',
  'TAO': 'bittensor',
  'TNSR': 'tensor',
  'SAGA': 'saga-2',
  'REZ': 'renzo',
  'NOT': 'notcoin',
  'IO': 'io-net',
  'ZK': 'polyhedra-network',
  'LISTA': 'lista',
  'ZRO': 'layerzero',
  'G': 'g-token',
  'BANANA': 'banana-gun',
  'RENDER': 'render-token',
  'TURBO': 'turbo',
  'BLAST': 'blast',
  'AEVO': 'aevo',
  'PONKE': 'ponke',
  'DOG': 'dog-go-to-the-moon',
  'GMX': 'gmx',
  'PENDLE': 'pendle',
  'BLUR': 'blur',
  'SUSHI': 'sushi',
  '1INCH': '1inch',
  'YFI': 'yearn-finance',
  'BAL': 'balancer',
  'LDO': 'lido-dao',
  'ENJ': 'enjincoin',
  'SAND': 'the-sandbox',
  'GALA': 'gala',
  'GMT': 'stepn',
  'GST': 'green-satoshi-token',
  'HIGH': 'highstreet',
  'TLM': 'alien-worlds',
  'ALICE': 'my-neighbor-alice',
  'API3': 'api3',
  'AUDIO': 'audius',
  'BAND': 'band-protocol',
  'BAT': 'basic-attention-token',
  'CELR': 'celer-network',
  'CELO': 'celo',
  'CTSI': 'cartesi',
  'DAR': 'mines-of-dalarnia',
  'DASH': 'dash',
  'DENT': 'dent',
  'DGB': 'digibyte',
  'DODO': 'dodo',
  'DYDX': 'dydx-chain',
  'EGLD': 'elrond-erd-2',
  'ELF': 'aelf',
  'FET': 'fetch-ai',
  'FLOKI': 'floki',
  'FLUX': 'flux',
  'FOR': 'force-protocol',
  'FTT': 'ftx-token',
  'FXS': 'frax-share',
  'GAL': 'project-galaxy',
  'GLMR': 'moonbeam',
  'GNO': 'gnosis',
  'HNT': 'helium',
  'HOT': 'holo',
  'ICX': 'icon',
  'ID': 'space-id',
  'ILV': 'illuvium',
  'INJ': 'injective-protocol',
  'IOST': 'iostoken',
  'IOTA': 'iota',
  'IOTX': 'iotex',
  'JASMY': 'jasmy',
  'JOE': 'joe',
  'KAVA': 'kava',
  'KCS': 'kucoin-shares',
  'KLAY': 'klay-token',
  'KNC': 'kyber-network-crystal',
  'KSM': 'kusama',
  'LEVER': 'lever',
  'LINA': 'linear-finance',
  'LOOKS': 'looksrare',
  'LPT': 'livepeer',
  'LQTY': 'liquity',
  'LRC': 'loopring',
  'LUNA': 'terra-luna-2',
  'LUNC': 'terra-luna',
  'MAGIC': 'magic',
  'MANA': 'decentraland',
  'MASK': 'mask-network',
  'MC': 'merit-circle',
  'MDT': 'measurable-data-token',
  'MINA': 'mina-protocol',
  'MKR': 'maker',
  'MTL': 'metal',
  'MULTI': 'multichain',
  'NEO': 'neo',
  'NEXO': 'nexo',
  'OCEAN': 'ocean-protocol',
  'OGN': 'origin-protocol',
  'OMG': 'omisego',
  'ONE': 'harmony',
  'ONT': 'ontology',
  'OSMO': 'osmosis',
  'OXT': 'orchid-protocol',
  'PAXG': 'pax-gold',
  'PEOPLE': 'constitutiondao',
  'PERP': 'perpetual-protocol',
  'PHA': 'phala',
  'PLG': 'pledge-finance',
  'POLS': 'polkastarter',
  'POLY': 'polymath',
  'POWR': 'power-ledger',
  'PROM': 'prometeus',
  'PROS': 'prosper',
  'PYR': 'vulcan-forged',
  'QI': 'qiswap',
  'QTUM': 'qtum',
  'QUICK': 'quickswap',
  'RAD': 'radicle',
  'RARE': 'superrare',
  'RAY': 'raydium',
  'REEF': 'reef',
  'REN': 'republic-protocol',
  'REQ': 'request-network',
  'RIF': 'rif-token',
  'RLC': 'iexec-rlc',
  'RNDR': 'render-token',
  'ROSE': 'oasis-network',
  'RPL': 'rocket-pool',
  'RSR': 'reserve-rights-token',
  'RUNE': 'thorchain',
  'RVN': 'ravencoin',
  'SAND': 'the-sandbox',
  'SCRT': 'secret',
  'SFP': 'safepal',
  'SHIB': 'shiba-inu',
  'SKL': 'skale',
  'SLP': 'smooth-love-potion',
  'SNX': 'synthetix-network-token',
  'SOL': 'solana',
  'SPELL': 'spell-token',
  'SRM': 'serum',
  'SSV': 'ssv-network',
  'STG': 'stargate-finance',
  'STMX': 'storm',
  'STORJ': 'storj',
  'STX': 'blockstack',
  'SUN': 'sun-token',
  'SUSHI': 'sushi',
  'SXP': 'swipe',
  'SYN': 'synapse-2',
  'SYS': 'syscoin',
  'T': 'threshold-network-token',
  'TFUEL': 'theta-fuel',
  'THETA': 'theta-token',
  'TKO': 'tokocrypto',
  'TLM': 'alien-worlds',
  'TOMO': 'tomochain',
  'TRIBE': 'tribe-2',
  'TRU': 'truefi',
  'TRX': 'tron',
  'TT': 'thunder-token',
  'TVK': 'the-virtua-kolect',
  'TWT': 'trust-wallet-token',
  'UMA': 'uma',
  'UNFI': 'unifi-protocol-dao',
  'UNI': 'uniswap',
  'USDC': 'usd-coin',
  'USDT': 'tether',
  'UTK': 'utrust',
  'VET': 'vechain',
  'VOXEL': 'voxies',
  'VRA': 'verasity',
  'WAVES': 'waves',
  'WAXP': 'wax',
  'WBT': 'whitebit',
  'WIN': 'wink',
  'WOO': 'woo-network',
  'WRX': 'wazirx',
  'XEC': 'ecash',
  'XEM': 'nem',
  'XLM': 'stellar',
  'XMR': 'monero',
  'XNO': 'nano',
  'XRP': 'ripple',
  'XTZ': 'tezos',
  'XVG': 'verge',
  'XVS': 'venus',
  'XYO': 'xyo-network',
  'YFI': 'yearn-finance',
  'YGG': 'yield-guild-games',
  'ZEC': 'zcash',
  'ZEN': 'horizen',
  'ZIL': 'zilliqa',
  'ZRX': '0x',
  'LEVER': 'leverfi',
  'LOKA': 'league-of-kingdoms',
  'METIS': 'metis-token',
  'OG': 'og-fan-token',
  'RAI': 'rai',
  'RDNT': 'radiant-capital',
  'SPA': 'spartacus',
  'SUPER': 'superfarm',
  'TVL': 'terra-virtua-kolect',
  'USTC': 'terrausd',
  'WEMIX': 'wemix-token',
  'XCN': 'chain-2',
  'MSN': 'meson-network',
  'GHX': 'gamercoin',
  'DOP': 'data-ownership-protocol'
}

module.exports = {
  CoinGeckoService,
  symbolToCoinGeckoId
}