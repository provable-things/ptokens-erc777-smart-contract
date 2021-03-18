require('dotenv').config()
const WalletProvider = require('@truffle/hdwallet-provider')

const getEnvironmentVariable = _envVar =>
  process.env[_envVar]
    ? process.env[_envVar]
    : (
      console.error(
        '✘ Cannot migrate!',
        '✘ Please provide an infura api key as and an',
        '✘ account private key as environment variables:',
        '✘ PRIVATE_KEY',
        '✘ INFURA_KEY'
      ),
      process.exit(1)
    )

module.exports = {
  networks: {
    development: {
      host: '127.0.0.1',
      port: 8545,
      network_id: '*',
      websockets: true
    },
    rinkeby: {
      provider: () =>
        new WalletProvider(
          getEnvironmentVariable('PRIVATE_KEY'),
          'http://localhost:8545'
        ),
      network_id: 4,
      gas: 6e6,
      gasPrice: 5e9,
      websockets: true
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
  }
}
