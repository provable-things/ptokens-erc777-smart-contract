/* eslint-disable no-undef */
module.exports.shortenEthAddress = _ethAddress =>
  `${_ethAddress.slice(0, 6)}...${_ethAddress.slice(-4)}`

module.exports.getTokenBalance = (_address, _contractMethods) =>
  _contractMethods
    .balanceOf(_address)
    .call()
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
          .mint(_account, _amount)
          .send({ from: _from, gas: _gas })
      )
  )

module.exports.assertTransferEvent = (
  _event,
  _from,
  _to,
  _value
) => {
  assert.strictEqual(_event.returnValues.from, _from)
  assert.strictEqual(_event.returnValues.to, _to)
  assert.strictEqual(parseInt(_event.returnValues.value), _value)
}

module.exports.assertRedeemEvent = (
  _event,
  _redeemer,
  _redeemAmount,
  _assetRecipient,
) => {
  assert.strictEqual(_event.returnValues.redeemer, _redeemer)
  assert.strictEqual(parseInt(_event.returnValues.value), _redeemAmount)
  assert.strictEqual(
    _event.returnValues.underlyingAssetRecipient,
    _assetRecipient
  )
}

module.exports.assertBurnEvent = (
  _event,
  _redeemer,
  _operator,
  _amount,
  _data,
  _operatorData
) => {
  assert.strictEqual(_event.returnValues.from, _redeemer)
  assert.strictEqual(_event.returnValues.operator, _operator)
  assert.strictEqual(parseInt(_event.returnValues.amount), _amount)
  assert.strictEqual(_event.returnValues.data, _data)
  assert.strictEqual(_event.returnValues.operatorData, _operatorData)
}

module.exports.assertMintEvent = (
  _event,
  _recipient,
  _operator,
  _amount,
  _data,
  _operatorData,
) => {
  assert.strictEqual(_event.returnValues.data, _data)
  assert.strictEqual(_event.returnValues.to, _recipient)
  assert.strictEqual(_event.returnValues.operator, _operator)
  assert.strictEqual(_event.returnValues.operatorData, _operatorData)
  assert.strictEqual(parseInt(_event.returnValues.amount), _amount)
}
