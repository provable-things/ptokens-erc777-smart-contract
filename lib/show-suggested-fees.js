const ethers = require('ethers')
const { getProvider } = require('./get-provider')
const { checkEndpoint } = require('./check-endpoint')
const { ENDPOINT_ENV_VAR_KEY } = require('./constants')
const { getEnvironmentVariable } = require('./get-environment-variable')

const getSuggestedFees = _provider =>
  console.info('✔ Getting suggested fees...') ||
  _provider.getFeeData()

const convertToGwei = _bigNumber =>
  ethers.utils.formatUnits(_bigNumber, 'gwei')

const formatForPrinting = _bigNumber =>
  `${parseFloat(convertToGwei(_bigNumber)).toFixed(2)} Gwei`

const parseSuggestedFees = _suggestedFees => ({
  'maxFeePerGas': formatForPrinting(_suggestedFees.maxFeePerGas),
  'maxPriorityFeePerGas': formatForPrinting(_suggestedFees.maxPriorityFeePerGas),
  'gasPrice (Pre EIP1559)': formatForPrinting(_suggestedFees.gasPrice),
})

const showSuggestedFees = _ =>
  getEnvironmentVariable(ENDPOINT_ENV_VAR_KEY)
    .then(getProvider)
    .then(checkEndpoint)
    .then(getSuggestedFees)
    .then(parseSuggestedFees)

module.exports = { showSuggestedFees }
