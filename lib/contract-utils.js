const { curry } = require('ramda')

const callFxnInContractAndAwaitReceipt = curry((_fxnName, _fxnArgs, _contract) =>
  console.info(`✔ Calling '${_fxnName}' function in contract & awaiting mining for the receipt...`) ||
  _contract[_fxnName](..._fxnArgs).then(_tx => _tx.wait())
)

module.exports = { callFxnInContractAndAwaitReceipt }
