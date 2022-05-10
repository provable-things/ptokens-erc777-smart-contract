const { getPTokenContract } = require('./get-ptoken-contract')
const { callFxnInContractAndAwaitReceipt } = require('./contract-utils')

const setAdminOperator = (_deployedContractAddress, _ethAddress) =>
  console.info('✔ Getting origin chain ID...') ||
  getPTokenContract(_deployedContractAddress)
    .then(callFxnInContractAndAwaitReceipt('setAdminOperator', [ _ethAddress ]))
    .then(console.info)

module.exports = { setAdminOperator }
