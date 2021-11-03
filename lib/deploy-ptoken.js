const { prop } = require('ramda')
const { getProvider } = require('./get-provider')
const { checkEndpoint } = require('./check-endpoint')
const { deployContract } = require('./deploy-contract')
const { ENDPOINT_ENV_VAR_KEY } = require('./constants')
const { getEthersWallet } = require('./get-ethers-wallet')
const { getPTokenContractFactory } = require('./get-contract-factory')
const { getEnvironmentVariable } = require('./get-environment-variable')

const deployPTokenContract = _ =>
  console.info('✔ Deploying pToken logic contract...') ||
  getEnvironmentVariable(ENDPOINT_ENV_VAR_KEY)
    .then(getProvider)
    .then(checkEndpoint)
    .then(getEthersWallet)
    .then(getPTokenContractFactory)
    .then(deployContract)
    .then(_contract => _contract.deployTransaction.wait())
    .then(_receipt => console.info(`✔ Tx Mined! Contract address: ${prop('contractAddress', _receipt)}`))

module.exports = { deployPTokenContract }
