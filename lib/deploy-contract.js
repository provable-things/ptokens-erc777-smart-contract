const { prop } = require('ramda')
const { getProvider } = require('./get-provider')
const { checkEndpoint } = require('./check-endpoint')
const { ENDPOINT_ENV_VAR_KEY } = require('./constants')
const { getEthersWallet } = require('./get-ethers-wallet')
const { deployEthersContract } = require('./deploy-ethers-contract')
const { getPTokenContractFactory } = require('./get-contract-factory')
const { getEnvironmentVariable } = require('./get-environment-variable')

const deployContract = _withoutGSN =>
  console.info('✔ Deploying logic contract...') ||
  getEnvironmentVariable(ENDPOINT_ENV_VAR_KEY)
    .then(getProvider)
    .then(checkEndpoint)
    .then(getEthersWallet)
    .then(getPTokenContractFactory)
    .then(deployEthersContract)
    .then(_contract => _contract.deployTransaction.wait())
    .then(_receipt => console.info(`✔ Tx Mined! Contract address: ${prop('contractAddress', _receipt)}`))

module.exports = { deployContract }
