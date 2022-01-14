const { getPTokenContract } = require('./get-ptoken-contract')
const { callReadOnlyFxnInContract } = require('./contract-utils')

const hasMinterRole = (_deployedContractAddress, _ethAddress) =>
  console.info(`✔ Checking if ${_ethAddress} has minter role...`) ||
  getPTokenContract(_deployedContractAddress)
    .then(callReadOnlyFxnInContract('hasMinterRole', [ _ethAddress ]))
    .then(console.info)

module.exports = { hasMinterRole }
