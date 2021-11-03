const { getPTokenContract } = require('./get-ptoken-contract')
const { callReadOnlyFxnInContract } = require('./contract-utils')

const getBalanceOf = (_contract, _address) =>
  callReadOnlyFxnInContract('balanceOf', [ _address ], _contract)
    .then(_balance => console.info('✔ Balance retrieved!') || _balance)

const showBalanceOf = (_deployedContractAddress, _addressToQueryBalanceOf) =>
  console.info(`✔ Querying balance of '${_addressToQueryBalanceOf}'...`) ||
  getPTokenContract(_deployedContractAddress)
    .then(callReadOnlyFxnInContract('balanceOf', [ _addressToQueryBalanceOf ]))
    .then(_bigNumber => console.info('✔ Balance:', _bigNumber.toString()))

module.exports = {
  showBalanceOf,
  getBalanceOf,
}
