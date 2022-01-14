const { getPTokenContract } = require('./get-ptoken-contract')
const { callFxnInContractAndAwaitReceipt } = require('./contract-utils')
const { checkTokenBalanceIsSufficient } = require('./check-token-balance')

const approve = (_deployedContractAddress, _spender, _amount) =>
  getPTokenContract(_deployedContractAddress)
    .then(checkTokenBalanceIsSufficient(_amount))
    .then(_contract =>
      callFxnInContractAndAwaitReceipt('approve(address,uint256)', [ _spender, _amount ], _contract)
    )
    .then(_receipt => console.info('✔ Success! Transaction receipt:\n', _receipt))

module.exports = { approve }
