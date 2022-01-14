const { getPTokenContract } = require('./get-ptoken-contract')
const { callFxnInContractAndAwaitReceipt } = require('./contract-utils')

const changeMinterRole = (_deployedContractAddress, _address, grantRole) => {
  console.info(
    `✔ ${grantRole ? 'Granting' : 'Revoking'} minter role ${grantRole ? 'to' : 'from'} '${_address}'...`
  )
  return getPTokenContract(_deployedContractAddress)
    .then(callFxnInContractAndAwaitReceipt(grantRole ? 'grantMinterRole' : 'revokeMinterRole', [ _address ]))
    .then(_receipt => console.info('✔ Success! Transaction receipt:\n', _receipt))
}

const grantMinterRole = (_deployedContractAddress, _address) =>
  changeMinterRole(_deployedContractAddress, _address, true)

const revokeMinterRole = (_deployedContractAddress, _address) =>
  changeMinterRole(_deployedContractAddress, _address, false)

module.exports = {
  revokeMinterRole,
  grantMinterRole,
}
