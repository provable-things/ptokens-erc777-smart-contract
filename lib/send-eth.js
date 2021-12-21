const { BigNumber } = require('ethers')
const { getProvider } = require('./get-provider')
const { checkEndpoint } = require('./check-endpoint')
const { ENDPOINT_ENV_VAR_KEY } = require('./constants')
const { getEthersWallet } = require('./get-ethers-wallet')
const { getEnvironmentVariable } = require('./get-environment-variable')

const sendEth = (_address, _amount) =>
  console.info(`✔ Sending ${_amount} WEI to ${_address}...`) ||
  getEnvironmentVariable(ENDPOINT_ENV_VAR_KEY)
    .then(getProvider)
    .then(checkEndpoint)
    .then(getEthersWallet)
    .then(_wallet => _wallet.sendTransaction({ to: _address, value: BigNumber.from(_amount) }))
    .then(_tx => console.info('✔ Tx sent, awaiting mining...') || _tx.wait())
    .then(_receipt => console.info('✔ Success! Transaction receipt:\n', _receipt))

module.exports = { sendEth }
