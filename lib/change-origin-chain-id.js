const { getPTokenContract } = require('./get-ptoken-contract')
const { callFxnInContractAndAwaitReceipt } = require('./contract-utils')

const changeOriginChainId = (_deployedContractAddress, _originChainId, _maybeGasPrice) =>
  console.info(`✔ Changing origin chain ID to ${_originChainId}...`) ||
  getPTokenContract(_deployedContractAddress)
    .then(callFxnInContractAndAwaitReceipt('changeOriginChainId', [ _originChainId ], _maybeGasPrice))
    .then(_receipt => console.info('✔ Success! Transaction receipt:\n', _receipt))

module.exports = { changeOriginChainId }
