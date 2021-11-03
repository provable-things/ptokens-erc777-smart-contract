const { curry } = require('ramda')
const { BigNumber } = require('ethers')
const { checkIsHex } = require('./utils')
const { getBalanceOf } = require('./get-balance-of')
const { getPTokenContract } = require('./get-ptoken-contract')
const { callFxnInContractAndAwaitReceipt } = require('./contract-utils')

const checkBalanceIsSufficient = curry((_amount, _contract) =>
  console.info('✔ Checking balance is sufficient...') ||
  getBalanceOf(_contract, _contract.signer.address)
    .then(_balance => {
      if (BigNumber.from(_amount).gt(BigNumber.from(_balance)))
        return Promise.reject(new Error(`Cannot peg out ${_amount} ∵ balance is only ${_balance.toString()}!`))
    })
    .then(_ => console.info('✔ Balance is sufficient!') || _contract)
)

const pegOut = (_deployedContractAddress, _amount, _recipient, _userData) =>
  checkIsHex(_userData)
    .then(_ => getPTokenContract(_deployedContractAddress))
    .then(checkBalanceIsSufficient(_amount))
    .then(_contract =>
      callFxnInContractAndAwaitReceipt(
        'redeem(uint256,bytes,string)',
        [ _amount, _userData, _recipient ],
        _contract
      )
    )
    .then(_receipt => console.info('✔ Success! Transaction receipt:\n', _receipt))

module.exports = { pegOut }
