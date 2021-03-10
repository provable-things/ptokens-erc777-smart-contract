const { deployProxy } = require('@openzeppelin/truffle-upgrades');
const { singletons } = require('@openzeppelin/test-helpers')
require('@openzeppelin/test-helpers/configure')({
  environment: 'truffle',
  provider: web3.currentProvider,
})

module.exports = async (deployer, network, accounts) => {
  if (network.includes('develop'))
    await deployProxy(singletons.ERC1820Registry(accounts[0]), {deployer, initializer: 'initialize'})
  await deployer.deploy(
    artifacts.require('PToken'),
    'pToken',
    'pTOK',
    [accounts[0]]
  )
}
