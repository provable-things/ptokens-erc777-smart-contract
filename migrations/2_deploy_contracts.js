const {
  TOKEN_NAME,
  TOKEN_SYMBOL,
  ADMIN_ADDRESS,
} = require('../config')
const { deployProxy } = require('@openzeppelin/truffle-upgrades')
const { singletons } = require('@openzeppelin/test-helpers')
require('@openzeppelin/test-helpers/configure')({
  environment: 'truffle',
  provider: web3.currentProvider,
})
const PToken = artifacts.require('PToken')

module.exports = async (deployer, network, accounts) => {
  if (network.includes('develop')) await singletons.ERC1820Registry(accounts[0])
  const instance = await deployProxy(
    PToken,
    [ TOKEN_NAME, TOKEN_SYMBOL, ADMIN_ADDRESS ],
    { deployer, initializer: 'initialize' }
  )
  console.info(`\nDeployed @ address ${instance.address}\n`)
}
