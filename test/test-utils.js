const {
  prop,
  curry,
} = require('ramda')
const {
  ORIGIN_CHAIN_ID,
  DESTINATION_CHAIN_ID,
  PTOKEN_WITH_GSN_CONTRACT_PATH,
  PTOKEN_WITHOUT_GSN_CONTRACT_PATH,
} = require('./test-constants')
const assert = require('assert')
const { BigNumber } = require('ethers')

const getTokenBalance = (_address, _contract) =>
  _contract.balanceOf(_address)

const mintTokensToAccounts = (_contract, _accounts, _amount) =>
  Promise.all(_accounts.map(prop('address')).map(_address => _contract['mint(address,uint256)'](_address, _amount)))

const assertRedeemEvent = (_events, _redeemer, _redeemAmount, _assetRecipient) => {
  const event = _events.find(_event => _event.event === 'Redeem')
  assert.strictEqual(event.args.redeemer, _redeemer)
  assert.strictEqual(parseInt(event.args.value), _redeemAmount)
  assert.strictEqual(event.args.underlyingAssetRecipient, _assetRecipient)
  assert.strictEqual(event.args.originChainId, ORIGIN_CHAIN_ID)
  assert.strictEqual(event.args.destinationChainId, DESTINATION_CHAIN_ID)
}

const assertBurnEvent = (_logs, _redeemer, _operator, _amount, _data, _operatorData) => {
  const _event = _logs.find(_log => _log.event === 'Burned')
  assert.strictEqual(_event.args.from, _redeemer)
  assert.strictEqual(_event.args.operator, _operator)
  assert.strictEqual(parseInt(_event.args.amount), _amount)
  assert.strictEqual(_event.args.data, _data)
  assert.strictEqual(_event.args.operatorData, _operatorData)
}

const assertMintEvent = (_logs, _recipient, _operator, _amount, _data, _operatorData) => {
  const _event = _logs.find(_log => _log.event === 'Minted')
  assert.strictEqual(_event.args.data, _data)
  assert.strictEqual(_event.args.to, _recipient)
  assert.strictEqual(_event.args.operator, _operator)
  assert.strictEqual(_event.args.operatorData, _operatorData)
  assert.strictEqual(parseInt(_event.args.amount), _amount)
}

const fixSignaturePerEIP155 = _signature => {
  const bitcoinElectrumWalletMagicNumber = 27
  return _signature.substring(130, 132) === '00'
    ? _signature.substring(0, 130) + bitcoinElectrumWalletMagicNumber.toString(16)
    : _signature.substring(0, 130) + (bitcoinElectrumWalletMagicNumber + 1).toString(16)
}

/* eslint-disable-next-line no-return-assign */
const silenceConsoleInfoOutput = _ =>
  /* eslint-disable-next-line no-empty-function */
  console.info = __ => {}

const assertTransferEvent = (_events, _from, _to, _amount) => {
  const event = _events.find(_event => _event.event === 'Transfer')
  assert.strictEqual(event.args.from, _from)
  assert.strictEqual(event.args.to, _to)
  assert(event.args.value.eq(BigNumber.from(_amount)))
}

const getPTokenContract = curry((_withGSN, _initArgs) =>
  ethers
    .getContractFactory(_withGSN ? PTOKEN_WITH_GSN_CONTRACT_PATH : PTOKEN_WITHOUT_GSN_CONTRACT_PATH)
    .then(_factory => upgrades.deployProxy(_factory, _initArgs))
)

const getPtokenContractWithGSN = getPTokenContract(true)

const getPtokenContractWithoutGSN = getPTokenContract(false)

const getRandomEthAddress = _ => {
  /* eslint-disable-next-line new-cap */
  const wallet = new ethers.Wallet.createRandom()
  return prop('address', wallet)
}

module.exports = {
  getTokenBalance,
  assertBurnEvent,
  assertMintEvent,
  assertRedeemEvent,
  assertTransferEvent,
  getRandomEthAddress,
  mintTokensToAccounts,
  fixSignaturePerEIP155,
  getPtokenContractWithGSN,
  silenceConsoleInfoOutput,
  getPtokenContractWithoutGSN,
}
