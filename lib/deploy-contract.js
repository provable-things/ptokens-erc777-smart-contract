const { prop } = require('ramda')
const { getProvider } = require('./get-provider')
const { checkEndpoint } = require('./check-endpoint')
const { ENDPOINT_ENV_VAR_KEY } = require('./constants')
const { getEthersWallet } = require('./get-ethers-wallet')
const { getEnvConfiguration } = require('./get-env-configuration')
const { deployEthersContract } = require('./deploy-ethers-contract')
const { getEnvironmentVariable } = require('./get-environment-variable')
const { getContractFactoryMaybeWithGSN } = require('./get-contract-factory')

const deployContract = (_withGSN, _maybeGasPrice = null) =>
  console.info('✔ Deploying logic contract...') ||
  getEnvConfiguration()
    .then(() => getEnvironmentVariable(ENDPOINT_ENV_VAR_KEY))
    .then(getProvider)
    .then(checkEndpoint)
    .then(getEthersWallet)
    .then(getContractFactoryMaybeWithGSN(_withGSN))
    .then(_contractFactory => deployEthersContract(_contractFactory, [], _maybeGasPrice))
    .then(_contract => _contract.deployTransaction.wait())
    .then(_receipt => console.info(`✔ Tx Mined! Contract address: ${prop('contractAddress', _receipt)}`))

module.exports = { deployContract }
