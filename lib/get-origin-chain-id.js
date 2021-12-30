const { getPTokenContract } = require('./get-ptoken-contract')
const { callReadOnlyFxnInContract } = require('./contract-utils')

const getOriginChainId = _deployedContractAddress =>
  console.info('✔ Getting origin chain ID...') ||
  getPTokenContract(_deployedContractAddress)
    .then(callReadOnlyFxnInContract('ORIGIN_CHAIN_ID', []))
    .then(console.info)

module.exports = { getOriginChainId }
