const { getPTokenContract } = require('./get-ptoken-contract')
const { callFxnInContractAndAwaitReceipt } = require('./contract-utils')

const setAdminOperator = (_deployedContractAddress, _ethAddress, _maybeGasPrice = null) =>
  console.info('✔ Getting origin chain ID...') ||
  getPTokenContract(_deployedContractAddress)
    .then(callFxnInContractAndAwaitReceipt('setAdminOperator', [ _ethAddress ], _maybeGasPrice))
    .then(console.info)

module.exports = { setAdminOperator }
