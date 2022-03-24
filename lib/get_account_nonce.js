const { curry } = require('ramda')
const { getProvider } = require('./get-provider')
const { checkEndpoint } = require('./check-endpoint')
const { ENDPOINT_ENV_VAR_KEY } = require('./constants')
const { getEnvironmentVariable } = require('./get-environment-variable')

const getAccountNonceOfAddress = curry((_address, _provider) =>
  _provider.send('eth_getTransactionCount', [ _address, 'latest' ]).then(parseInt)
)

const getAccountNonce = _address =>
  console.info('✔ Showing wallet details...') ||
  getEnvironmentVariable(ENDPOINT_ENV_VAR_KEY)
    .then(getProvider)
    .then(checkEndpoint)
    .then(getAccountNonceOfAddress(_address))
    .then(console.info)

module.exports = { getAccountNonce }
