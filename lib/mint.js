const { getPTokenContract } = require('./get-ptoken-contract')
const { callFxnInContractAndAwaitReceipt } = require('./contract-utils')

const mint = (_deployedContractAddress, _recipient, _value, _maybeGasPrice = null) =>
  console.info(`✔ Minting ${_value} to ${_recipient}...`) ||
  getPTokenContract(_deployedContractAddress)
    .then(callFxnInContractAndAwaitReceipt('mint(address,uint256)', [ _recipient, _value ], _maybeGasPrice))
    .then(console.info)

module.exports = { mint }
