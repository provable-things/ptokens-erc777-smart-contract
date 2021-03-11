const { deployProxy } = require('@openzeppelin/truffle-upgrades')

const PToken = artifacts.require('PToken')

module.exports = async (deployer, network, accounts) => {
  const instance = await deployProxy(PToken, [ 'pToken', 'pTOK', [ accounts[0] ] ], { deployer })
  // eslint-disable-next-line no-console
  console.log('Deployed', instance.address)
}
