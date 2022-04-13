const { curry } = require('ramda')
const { getProvider } = require('./get-provider')
const { checkEndpoint } = require('./check-endpoint')
const { ENDPOINT_ENV_VAR_KEY } = require('./constants')
const { getEnvConfiguration } = require('./get-env-configuration')
const { getEnvironmentVariable } = require('./get-environment-variable')

const sendRawTx = curry((_signedTx, _provider) =>
  _provider.send('eth_sendRawTransaction', [ _signedTx ])
)

const pushRawSignedTx = _signedTx =>
  console.info('✔ Pushing raw signed tx...') ||
  getEnvConfiguration()
    .then(() => getEnvironmentVariable(ENDPOINT_ENV_VAR_KEY))
    .then(getProvider)
    .then(checkEndpoint)
    .then(sendRawTx(_signedTx))
    .then(console.info)

module.exports = { pushRawSignedTx }
