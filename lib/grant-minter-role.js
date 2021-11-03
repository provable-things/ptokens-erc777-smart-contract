const { getPTokenContract } = require('./get-ptoken-contract')

const grantMinterRole = (_deployedContractAddress, _addressToBeMinter) =>
  console.info(`✔ Granting minter role to '${_addressToBeMinter}'...`) ||
  getPTokenContract(_deployedContractAddress, _addressToBeMinter)
    .then(_contract => _contract.grantMinterRole(_addressToBeMinter))
    .then(_transactionResponse => console.info('✔ Tx sent, awaiting mining...') || _transactionResponse.wait())
    .then(_receipt => console.info('✔ Success! Transaction receipt:\n', _receipt))

module.exports = { grantMinterRole }
