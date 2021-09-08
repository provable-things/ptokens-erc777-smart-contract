const {
  ENDPOINT,
  GAS_PRICE,
  PRIVATE_KEY,
  ETHERSCAN_API_KEY,
} = require('./config')
const WalletProvider = require('@truffle/hdwallet-provider')

const GAS_LIMIT = 6e6
const getProvider = _ => new WalletProvider(PRIVATE_KEY, ENDPOINT)

module.exports = {
  networks: {
    development: {
      port: 8545,
      network_id: '*',
      websockets: true,
      host: '127.0.0.1',
    },
    ethMainnet: {
      network_id: 1,
      confirmations: 1,
      gas: GAS_LIMIT,
      gasPrice: GAS_PRICE,
      provider: _ => getProvider(),
    },
    rinkeby: {
      network_id: 4,
      gas: GAS_LIMIT,
      confirmations: 1,
      websockets: true,
      gasPrice: GAS_PRICE,
      provider: _ => getProvider(),
    },
    ropsten: {
      network_id: 3,
      gas: GAS_LIMIT,
      confirmations: 1,
      websockets: true,
      gasPrice: GAS_PRICE,
      provider: _ => getProvider(),
    },
    bscMainnet: {
      network_id: 56,
      gas: GAS_LIMIT,
      confirmations: 1,
      skipDryRun: true,
      timeoutBlocks: 500,
      gasPrice: GAS_PRICE,
      provider: _ => getProvider(),
    },
    bscTestnet: {
      gas: GAS_LIMIT,
      network_id: 97,
      confirmations: 1,
      skipDryRun: true,
      timeoutBlocks: 500,
      gasPrice: GAS_PRICE,
      provider: _ => getProvider(),
    },
    xDai: {
      gas: GAS_LIMIT,
      network_id: 100,
      confirmations: 1,
      skipDryRun: true,
      timeoutBlocks: 10,
      gasPrice: GAS_PRICE,
      provider: _ => getProvider(),
    },
    polygonMaticMainnet: {
      gas: GAS_LIMIT,
      network_id: 137,
      confirmations: 1,
      timeoutBlocks: 10,
      gasPrice: GAS_PRICE,
      networkCheckTimeout: 10000,
      provider: _ => getProvider(),
    },
  },
  compilers: {
    solc: {
      version: '0.6.2',
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        }
      }
    }
  },
  mocha: {
    enableTimeouts: false
  },
  plugins: [
    'truffle-plugin-verify'
  ],
  api_keys: {
    etherscan: ETHERSCAN_API_KEY,
  },
}
