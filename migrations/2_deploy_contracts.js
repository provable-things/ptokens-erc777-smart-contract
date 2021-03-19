const { deployProxy } = require('@openzeppelin/truffle-upgrades')
const { singletons } = require('@openzeppelin/test-helpers')
require('@openzeppelin/test-helpers/configure')({
  environment: 'truffle',
  provider: web3.currentProvider,
})
const PToken = artifacts.require('PToken')

module.exports = async (deployer, network, accounts) => {
  if (network.includes('develop'))
    await singletons.ERC1820Registry(accounts[0])
  const instance = await deployProxy(
    PToken,
    [ 'pToken', 'pTOK', accounts[0] ],
    { deployer, initializer: 'initialize' }
  )
  console.info('Deployed', instance.address)
}
