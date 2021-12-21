require('dotenv').config()
const {
  ENDPOINT_ENV_VAR_KEY,
  ETHERSCAN_ENV_VAR_KEY
} = require('./lib/constants')
const { assoc } = require('ramda')

require('hardhat-erc1820')
require('@nomiclabs/hardhat-web3')
require('@nomiclabs/hardhat-waffle')
require('@nomiclabs/hardhat-etherscan')
require('@openzeppelin/hardhat-upgrades')

const SUPPORTED_NETWORKS = [
  'rinkeby',
  'ropsten',
  'bscMainnet',
  'ambrosTestnet',
]

const getAllSupportedNetworks = _ =>
  SUPPORTED_NETWORKS.reduce((_acc, _network) =>
    assoc(_network, { url: process.env[ENDPOINT_ENV_VAR_KEY] }, _acc), {}
  )

const addLocalNetwork = _allSupportedNetworks =>
  assoc('localhost', { url: 'http://localhost:8545' }, _allSupportedNetworks)

const getAllNetworks = _ =>
  addLocalNetwork(getAllSupportedNetworks())

module.exports = {
  networks: getAllNetworks(),
  solidity: {
    compilers: [
      {
        version: '0.6.2',
        settings: {
          optimizer: {
            runs: 200,
            enabled: true,
          }
        }
      },
      {
        version: '0.4.18',
        settings: {
          optimizer: {
            runs: 200,
            enabled: true,
          }
        }
      },
    ],
    overrides: {
      'contracts/wEth.sol': {
        version: '0.4.18',
      }
    }
  },
  etherscan: {
    apiKey: process.env[ETHERSCAN_ENV_VAR_KEY]
  },
}
