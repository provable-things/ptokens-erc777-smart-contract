const { getPTokenContract } = require('./get-ptoken-contract')
const { callReadOnlyFxnInContract } = require('./contract-utils')

const getTotalSupply = (_deployedContractAddress, _addressToQueryBalanceOf) =>
  console.info(`✔ Querying balance of '${_addressToQueryBalanceOf}'...`) ||
  getPTokenContract(_deployedContractAddress)
    .then(callReadOnlyFxnInContract('totalSupply', []))
    .then(_bigNumber => console.info('✔ Total Supply:', _bigNumber.toString()))

module.exports = {
  getTotalSupply,
}
