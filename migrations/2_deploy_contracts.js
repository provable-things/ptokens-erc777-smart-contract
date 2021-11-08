const { deployProxy } = require('@openzeppelin/truffle-upgrades')
const { singletons } = require('@openzeppelin/test-helpers')
require('@openzeppelin/test-helpers/configure')({
  environment: 'truffle',
  provider: web3.currentProvider,
})
const PToken = artifacts.require('PToken')

module.exports = async (deployer, network, accounts) => {
  if (network.includes('develop')) await singletons.ERC1820Registry(accounts[0])
  await deployProxy(
    PToken,
    [ 'tokenName', 'tokenSymbol', '0xea674fdde714fd979de3edf0f56aa9716b898ec8' ],
    { deployer, initializer: 'initialize' }
  )
}
