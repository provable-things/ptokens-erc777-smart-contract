require('dotenv').config()
const {
  ENDPOINT_ENV_VAR_KEY,
  ETHERSCAN_ENV_VAR_KEY
} = require('./lib/constants')

require('@nomiclabs/hardhat-etherscan')

module.exports = {
  networks: {
    localhost: {
      url: 'http://localhost:8545'
    },
    ropsten: {
      url: process.env[ENDPOINT_ENV_VAR_KEY]
    },
  },
  solidity: {
    version: '0.6.2',
    settings: {
      optimizer: {
        runs: 200,
        enabled: true,
      }
    }
  },
  etherscan: {
    apiKey: process.env[ETHERSCAN_ENV_VAR_KEY]
  },
}
