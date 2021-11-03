const { getPTokenContract } = require('./get-ptoken-contract')
const { callFxnInContractAndAwaitReceipt } = require('./contract-utils')

const grantMinterRole = (_deployedContractAddress, _addressToBeMinter) =>
  console.info(`✔ Granting minter role to '${_addressToBeMinter}'...`) ||
  getPTokenContract(_deployedContractAddress)
    .then(callFxnInContractAndAwaitReceipt('grantMinterRole', [ _addressToBeMinter ]))
    .then(_receipt => console.info('✔ Success! Transaction receipt:\n', _receipt))

module.exports = { grantMinterRole }
