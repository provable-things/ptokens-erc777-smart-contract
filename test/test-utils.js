const {
  ORIGIN_CHAIN_ID,
  PTOKEN_CONTRACT_PATH,
  DESTINATION_CHAIN_ID,
} = require('./test-constants')
const assert = require('assert')
const { prop } = require('ramda')
const { BigNumber } = require('ethers')

module.exports.getTokenBalance = (_address, _contract) =>
  _contract.balanceOf(_address)

module.exports.mintTokensToAccounts = (_contract, _accounts, _amount) =>
  Promise.all(_accounts.map(prop('address')).map(_address => _contract['mint(address,uint256)'](_address, _amount)))

module.exports.assertTransferEvent = (_logs, _from, _to, _value) => {
  const _event = _logs.find(_log => _log.event === 'Transfer')
  assert.strictEqual(_event.args.from, _from)
  assert.strictEqual(_event.args.to, _to)
  assert.strictEqual(parseInt(_event.args.value), _value)
}

module.exports.assertRedeemEvent = (_events, _redeemer, _redeemAmount, _assetRecipient) => {
  const event = _events.find(_event => _event.event === 'Redeem')
  assert.strictEqual(event.args.redeemer, _redeemer)
  assert.strictEqual(parseInt(event.args.value), _redeemAmount)
  assert.strictEqual(event.args.underlyingAssetRecipient, _assetRecipient)
  assert.strictEqual(event.args.originChainId, ORIGIN_CHAIN_ID)
  assert.strictEqual(event.args.destinationChainId, DESTINATION_CHAIN_ID)
}

module.exports.assertBurnEvent = (_logs, _redeemer, _operator, _amount, _data, _operatorData) => {
  const _event = _logs.find(_log => _log.event === 'Burned')
  assert.strictEqual(_event.args.from, _redeemer)
  assert.strictEqual(_event.args.operator, _operator)
  assert.strictEqual(parseInt(_event.args.amount), _amount)
  assert.strictEqual(_event.args.data, _data)
  assert.strictEqual(_event.args.operatorData, _operatorData)
}

module.exports.assertMintEvent = (_logs, _recipient, _operator, _amount, _data, _operatorData) => {
  const _event = _logs.find(_log => _log.event === 'Minted')
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

/* eslint-disable-next-line no-return-assign */
module.exports.silenceConsoleInfoOutput = _ =>
  /* eslint-disable-next-line no-empty-function */
  console.info = __ => {}

module.exports.assertTransferEvent = (_events, _from, _to, _amount) => {
  const event = _events.find(_event => _event.event === 'Transfer')
  assert.strictEqual(event.args.from, _from)
  assert.strictEqual(event.args.to, _to)
  assert(event.args.value.eq(BigNumber.from(_amount)))
}

module.exports.getPTokenContract = _initArgs =>
  ethers.getContractFactory(PTOKEN_CONTRACT_PATH).then(_factory => upgrades.deployProxy(_factory, _initArgs))
