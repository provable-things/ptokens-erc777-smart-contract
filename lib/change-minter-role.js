const { getPTokenContract } = require('./get-ptoken-contract')
const { callFxnInContractAndAwaitReceipt } = require('./contract-utils')

const changeMinterRole = (_deployedContractAddress, _address, grantRole, _maybeGasPrice = null) => {
  console.info(
    `✔ ${grantRole ? 'Granting' : 'Revoking'} minter role ${grantRole ? 'to' : 'from'} '${_address}'...`
  )
  return getPTokenContract(_deployedContractAddress)
    .then(_contract =>
      callFxnInContractAndAwaitReceipt(
        grantRole ? 'grantMinterRole' : 'revokeMinterRole',
        [ _address ],
        _maybeGasPrice,
        _contract,
      )
    )
    .then(_receipt => console.info('✔ Success! Transaction receipt:\n', _receipt))
}

const grantMinterRole = (_deployedContractAddress, _address, _maybeGasPrice = null) =>
  changeMinterRole(_deployedContractAddress, _address, true, _maybeGasPrice)

const revokeMinterRole = (_deployedContractAddress, _address, _maybeGasPrice = null) =>
  changeMinterRole(_deployedContractAddress, _address, false, _maybeGasPrice)

module.exports = {
  revokeMinterRole,
  grantMinterRole,
}
