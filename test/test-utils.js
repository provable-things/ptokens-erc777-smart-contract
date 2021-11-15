const assert = require('assert')
const { prop } = require('ramda')
const { BigNumber } = require('ethers')

/* eslint-disable no-undef */
module.exports.shortenEthAddress = _ethAddress =>
  `${_ethAddress.slice(0, 6)}...${_ethAddress.slice(-4)}`

module.exports.getTokenBalance = (_address, _contractMethods) =>
  _contractMethods
    .balanceOf(_address)
    .then(parseInt)

module.exports.getContract = (_web3, _artifact, _constructorParams) =>
  new Promise((resolve, reject) =>
    _artifact
      .new(..._constructorParams)
      .then(({ contract: { _jsonInterface, _address } }) =>
        resolve(new _web3.eth.Contract(_jsonInterface, _address))
      )
      .catch(reject)
  )

module.exports.mintTokensToAccounts = (
  _methods,
  _accounts,
  _amount,
  _from,
  _gas
) =>
  Promise.all(
    _accounts
      .map(_account =>
        _methods
          .mint(_account, _amount, { from: _from, gas: _gas })
      )
  )

module.exports.assertTransferEvent = (
  logs,
  _from,
  _to,
  _value
) => {
  const _event = logs.find(log => log.event === 'Transfer')
  assert.strictEqual(_event.args.from, _from)
  assert.strictEqual(_event.args.to, _to)
  assert.strictEqual(parseInt(_event.args.value), _value)
}

module.exports.assertRedeemEvent = (
  logs,
  _redeemer,
  _redeemAmount,
  _assetRecipient,
) => {
  const _event = logs.find(log => log.event === 'Redeem')
  assert.strictEqual(_event.args.redeemer, _redeemer)
  assert.strictEqual(parseInt(_event.args.value), _redeemAmount)
  assert.strictEqual(
    _event.args.underlyingAssetRecipient,
    _assetRecipient
  )
}

module.exports.assertBurnEvent = (
  logs,
  _redeemer,
  _operator,
  _amount,
  _data,
  _operatorData
) => {
  const _event = logs.find(log => log.event === 'Burned')
  assert.strictEqual(_event.args.from, _redeemer)
  assert.strictEqual(_event.args.operator, _operator)
  assert.strictEqual(parseInt(_event.args.amount), _amount)
  assert.strictEqual(_event.args.data, _data)
  assert.strictEqual(_event.args.operatorData, _operatorData)
}

module.exports.assertMintEvent = (
  logs,
  _recipient,
  _operator,
  _amount,
  _data,
  _operatorData,
) => {
  const _event = logs.find(log => log.event === 'Minted')
  assert.strictEqual(_event.args.data, _data)
  assert.strictEqual(_event.args.to, _recipient)
  assert.strictEqual(_event.args.operator, _operator)
  assert.strictEqual(_event.args.operatorData, _operatorData)
  assert.strictEqual(parseInt(_event.args.amount), _amount)
}

module.exports.fixSignaturePerEIP155 = _signature => {
  const bitcoinElectrumWalletMagicNumber = 27
  return _signature.substring(130, 132) === '00'
    ? _signature.substring(0, 130) + bitcoinElectrumWalletMagicNumber.toString(16)
    : _signature.substring(0, 130) + (bitcoinElectrumWalletMagicNumber + 1).toString(16)
}

module.exports.getContractWithAddress = (_web3, _artifact, _constructorParams) =>
  new Promise((resolve, reject) =>
    _artifact
      .new(..._constructorParams)
      .then(({ contract: { _jsonInterface, _address } }) =>
        resolve({ contract: new _web3.eth.Contract(_jsonInterface, _address), address: _address })
      )
      .catch(reject)
  )
/* eslint-disable-next-line no-return-assign */
module.exports.silenceConsoleInfoOutput = _ =>
  /* eslint-disable-next-line no-empty-function */
  console.info = __ => {}

const getTransferEventFromReceipt = _receipt =>
  new Promise((resolve, reject) => {
    const EVENT_NAME = 'Transfer'
    const transferEvents = _receipt.events.filter(_event => _event.event === EVENT_NAME)
    return transferEvents.length <= 0
      ? reject(new Error(`No ${EVENT_NAME} event in receipt!`))
      : resolve(prop(0, transferEvents))
  })

module.exports.assertTransferEvent = (_receipt, _from, _to, _amount) =>
  getTransferEventFromReceipt(_receipt)
    .then(_event => {
      assert.strictEqual(_event.args.from, _from)
      assert.strictEqual(_event.args.to, _to)
      assert(_event.args.value.eq(BigNumber.from(_amount)))
    })
