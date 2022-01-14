const { getPTokenContract } = require('./get-ptoken-contract')
const { callFxnInContractAndAwaitReceipt } = require('./contract-utils')
const { checkTokenBalanceIsSufficient } = require('./check-token-balance')

const transferToken = (_deployedContractAddress, _recipient, _amount) =>
  getPTokenContract(_deployedContractAddress)
    .then(checkTokenBalanceIsSufficient(_amount))
    .then(_contract =>
      callFxnInContractAndAwaitReceipt('transfer(address,uint256)', [ _recipient, _amount ], _contract)
    )
    .then(_receipt => console.info('✔ Success! Transaction receipt:\n', _receipt))

module.exports = { transferToken }
