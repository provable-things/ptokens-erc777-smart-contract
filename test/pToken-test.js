/* eslint-disable no-undef */
const {
  keys,
  prop
} = require('ramda')
const {
  getContract,
  assertMintEvent,
  assertBurnEvent,
  getTokenBalance,
  assertRedeemEvent,
  shortenEthAddress,
  assertTransferEvent,
  mintTokensToAccounts,
} = require('./test-utils')
const pTokenArtifact = artifacts.require('PToken.sol')

contract('pToken', ([OWNER, ...accounts]) => {
  let methods
  const AMOUNT = 1337
  const GAS_LIMIT = 6e6
  const NON_OWNER = accounts[5]
  const ASSET_RECIPIENT = 'an address'
  const CONSTRUCTOR_PARAMS = [ 'pToken', 'pTOK', [ OWNER ] ]
  const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

  beforeEach(async () => {
    assert(OWNER !== NON_OWNER)
    methods = await getContract(web3, pTokenArtifact, CONSTRUCTOR_PARAMS)
      .then(prop('methods'))
  })

  it('`redeem()` function should burn tokens & emit correct events', async () => {
    const redeemAmount = 666
    const expectedNumEvents = 3
    const redeemer = accounts[3]
    const operator = redeemer
    const recipientBalanceBefore = await getTokenBalance(redeemer, methods)
    assert.strictEqual(recipientBalanceBefore, 0)
    await mintTokensToAccounts(methods, accounts, AMOUNT, OWNER, GAS_LIMIT)
    const recipientBalanceAfter = await getTokenBalance(redeemer, methods)
    assert.strictEqual(recipientBalanceAfter, AMOUNT)
    const { events } = await methods
      .redeem(redeemAmount, ASSET_RECIPIENT)
      .send({ from: redeemer, gas: GAS_LIMIT })
    const recipientBalanceAfterRedeem = await getTokenBalance(
      redeemer,
      methods
    )
    assert.strictEqual(
      parseInt(recipientBalanceAfterRedeem),
      AMOUNT - redeemAmount
    )
    assert(keys(events).length === expectedNumEvents)
    assertRedeemEvent(events.Redeem, redeemer, redeemAmount, ASSET_RECIPIENT)
    assertTransferEvent(events.Transfer, redeemer, ZERO_ADDRESS, redeemAmount)
    assertBurnEvent(
      events.Burned,
      redeemer,
      operator,
      redeemAmount,
      null,
      null,
    )
  })

  it('`operatorRedeem()` should burn tokens & emit correct events', async () => {
    const operator = OWNER
    const redeemAmount = 666
    const data = '0xdead'
    const expectedNumEvents = 3
    const redeemer = accounts[3]
    const operatorData = '0xbeef'
    const isOperatorForRedeemer = await methods
      .isOperatorFor(operator, redeemer)
      .call()
    assert(isOperatorForRedeemer)
    const recipientBalanceBefore = await getTokenBalance(redeemer, methods)
    assert.strictEqual(recipientBalanceBefore, 0)
    await mintTokensToAccounts(methods, accounts, AMOUNT, OWNER, GAS_LIMIT)
    const recipientBalanceAfter = await getTokenBalance(redeemer, methods)
    assert.strictEqual(recipientBalanceAfter, AMOUNT)
    const { events } = await methods
      .operatorRedeem(
        redeemer,
        redeemAmount,
        data,
        operatorData,
        ASSET_RECIPIENT
      )
      .send({ from: operator, gas: GAS_LIMIT })
    const recipientBalanceAfterRedeem = await getTokenBalance(
      redeemer,
      methods
    )
    assert.strictEqual(
      parseInt(recipientBalanceAfterRedeem),
      AMOUNT - redeemAmount
    )
    assert.strictEqual(keys(events).length, expectedNumEvents)
    assertTransferEvent(events.Transfer, redeemer, ZERO_ADDRESS, redeemAmount)
    assertRedeemEvent(events.Redeem, redeemer, redeemAmount, ASSET_RECIPIENT)
    assertBurnEvent(
      events.Burned,
      redeemer,
      operator,
      redeemAmount,
      data,
      operatorData,
    )
  })

  it('`mint()` w/out data should mint tokens & emit correct events', async () => {
    const data = null
    const operatorData = null
    const expectedNumEvents = 2
    const recipient = accounts[0]
    const recipientBalanceBefore = await getTokenBalance(recipient, methods)
    const { events } = await methods
      .mint(recipient, AMOUNT)
      .send({
        from: OWNER,
        gas: GAS_LIMIT
      })
    const recipientBalanceAfter = await getTokenBalance(recipient, methods)
    assert.strictEqual(recipientBalanceBefore, 0)
    assert.strictEqual(recipientBalanceAfter, AMOUNT)
    assert.strictEqual(keys(events).length, expectedNumEvents)
    assertTransferEvent(events.Transfer, ZERO_ADDRESS, recipient, AMOUNT)
    assertMintEvent(events.Minted, recipient, OWNER, AMOUNT, data, operatorData)
  })

  it('`mint()` w/out data should return true if successful', async () => {
    const recipient = accounts[0]
    const tx = await methods
      .mint(recipient, AMOUNT)
      .call()
    assert.strictEqual(tx, true)
  })

  it('`mint()` cannot mint to zero address', async () => {
    const recipient = ZERO_ADDRESS
    const recipientBalanceBefore = await getTokenBalance(recipient, methods)
    assert.strictEqual(recipientBalanceBefore, 0)
    try {
      await methods
        .mint(recipient, AMOUNT)
        .send({
          from: OWNER,
          gas: GAS_LIMIT
        })
    } catch (_err) {
      const expectedError = 'Cannot mint to the zero address!'
      assert(_err.message.includes(expectedError))
    }
  })

  it(`'mint()' only ${shortenEthAddress(OWNER)} can mint`, async () => {
    const recipient = ZERO_ADDRESS
    const recipientBalanceBefore = await getTokenBalance(recipient, methods)
    assert.strictEqual(recipientBalanceBefore, 0)
    try {
      await methods
        .mint(recipient, AMOUNT)
        .send({ from: NON_OWNER, gas: GAS_LIMIT })
    } catch (_err) {
      const expectedError = 'Only the pNetwork can mint tokens'
      assert(_err.message.includes(expectedError))
    }
  })

  it('`mint()` w/ data should mint tokens & emit correct events', async () => {
    const data = '0xdead'
    const expectedNumEvents = 2
    const operatorData = '0xb33f'
    const recipient = accounts[0]
    const recipientBalanceBefore = await getTokenBalance(recipient, methods)
    const { events } = await methods
      .mint(recipient, AMOUNT, data, operatorData)
      .send({
        from: OWNER,
        gas: GAS_LIMIT,
      })
    const recipientBalanceAfter = await getTokenBalance(recipient, methods)
    assert.strictEqual(recipientBalanceBefore, 0)
    assert.strictEqual(recipientBalanceAfter, AMOUNT)
    assert.strictEqual(keys(events).length, expectedNumEvents)
    assertTransferEvent(events.Transfer, ZERO_ADDRESS, recipient, AMOUNT)
    assertMintEvent(events.Minted, recipient, OWNER, AMOUNT, data, operatorData)
  })

  it(`${shortenEthAddress(OWNER)} can change 'pNetwork'`, async () => {
    const newPNetwork = accounts[0]
    const pNetworkBefore = await methods
      .pNetwork()
      .call()
    assert.strictEqual(pNetworkBefore, OWNER)
    await methods
      .changePNetwork(newPNetwork)
      .send({ from: OWNER, gas: GAS_LIMIT })
    const pNetworkAfter = await methods
      .pNetwork()
      .call()
    assert(pNetworkAfter !== pNetworkBefore)
    assert.strictEqual(pNetworkAfter, newPNetwork)
  })

  it(`Only ${shortenEthAddress(OWNER)} can change 'pNetwork'`, async () => {
    const newPNetwork = accounts[0]
    const pNetworkBefore = await methods
      .pNetwork()
      .call()
    assert.strictEqual(pNetworkBefore, OWNER)
    const expectedError = 'Only the pNetwork can change the `pNetwork` account!'
    try {
      await methods
        .changePNetwork(newPNetwork)
        .send({ from: NON_OWNER, gas: GAS_LIMIT })
    } catch (_err) {
      assert(_err.message.includes(expectedError))
    }
  })

  it('pNetwork cannot be the zero address', async () => {
    let expectedError = 'pNetwork cannot be the zero address!'
    const pNetworkBefore = await methods
      .pNetwork()
      .call()
    assert.strictEqual(pNetworkBefore, OWNER)
    try {
      await methods
        .changePNetwork(ZERO_ADDRESS)
        .send({ from: OWNER, gas: GAS_LIMIT })
    } catch (_err) {
      assert(_err.message.contains(expectedError))
      const pNetworkAfter = await methods
        .pNetwork()
        .call()
      assert.strictEqual(pNetworkAfter !== ZERO_ADDRESS)
      assert.strictEqual(pNetworkAfter, pNetworkBefore)
    }
  })
})
