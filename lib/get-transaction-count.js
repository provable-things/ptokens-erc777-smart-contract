const { curry } = require('ramda')
const { getProvider } = require('./get-provider')
const { checkEndpoint } = require('./check-endpoint')
const { ENDPOINT_ENV_VAR_KEY } = require('./constants')
const { getEnvironmentVariable } = require('./get-environment-variable')

const getTransactionCountOfAddress = curry((_address, _provider) =>
  console.info(`✔ Getting transaction count for address ${_address}...`) ||
  _provider.send('eth_getTransactionCount', [ _address, 'latest' ])
)

const getTransactionCount = _address =>
  getEnvironmentVariable(ENDPOINT_ENV_VAR_KEY)
    .then(getProvider)
    .then(checkEndpoint)
    .then(getTransactionCountOfAddress(_address))
    .then(_txCount => console.info('✔ Transaction count:', parseInt(_txCount)))

module.exports = { getTransactionCount }
