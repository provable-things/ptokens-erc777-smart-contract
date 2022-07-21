const { curry } = require('ramda')

const callFxnInContract = (_fxnName, _fxnArgs, _contract, _maybeGasPrice = null) =>
  _contract[_fxnName](..._fxnArgs, _maybeGasPrice === null ? {} : { gasPrice: _maybeGasPrice })

const callFxnInContractAndAwaitReceipt = curry((_fxnName, _fxnArgs, _maybeGasPrice, _contract) =>
  console.info(
    `✔ Calling '${
      _fxnName
    }' function in contract${
      _maybeGasPrice && ` with gas price of ${_maybeGasPrice} gwei`
    } & awaiting mining for the receipt...`
  ) ||
  callFxnInContract(_fxnName, _fxnArgs, _contract, _maybeGasPrice).then(_tx => _tx.wait())
)

const callReadOnlyFxnInContract = curry((_fxnName, _fxnArgs, _contract) =>
  console.info(`✔ Calling '${_fxnName}' function in contract...`) ||
  callFxnInContract(_fxnName, _fxnArgs, _contract)
)

module.exports = {
  callFxnInContractAndAwaitReceipt,
  callReadOnlyFxnInContract,
}
