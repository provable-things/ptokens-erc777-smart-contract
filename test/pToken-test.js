/* eslint-disable no-undef */
const {
  keys,
} = require('ramda')
const { deployProxy } = require('@openzeppelin/truffle-upgrades')
const {
  assertMintEvent,
  assertBurnEvent,
  getTokenBalance,
  assertRedeemEvent,
  shortenEthAddress,
  assertTransferEvent,
  mintTokensToAccounts,
} = require('./test-utils')
const PToken = artifacts.require('PToken')

contract('pToken', ([OWNER, ...accounts]) => {
  let methods
  const AMOUNT = 1337
  const GAS_LIMIT = 6e6
  const NON_OWNER = accounts[5]
  const ASSET_RECIPIENT = 'an address'
  const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

  beforeEach(async () => {
    assert(OWNER !== NON_OWNER)
    const instance = await deployProxy(PToken, [ 'pToken', 'pTOK', [ OWNER ] ])
    methods = instance
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
    const { receipt: { logs } } = await methods
      .redeem(redeemAmount, ASSET_RECIPIENT, { from: redeemer, gas: GAS_LIMIT })
    const recipientBalanceAfterRedeem = await getTokenBalance(
      redeemer,
      methods
    )
    assert.strictEqual(
      parseInt(recipientBalanceAfterRedeem),
      AMOUNT - redeemAmount
    )
    assert(keys(logs).length === expectedNumEvents)
    assertRedeemEvent(logs, redeemer, redeemAmount, ASSET_RECIPIENT)
    assertTransferEvent(logs, redeemer, ZERO_ADDRESS, redeemAmount)
    assertBurnEvent(
      logs,
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
    assert(isOperatorForRedeemer)
    const recipientBalanceBefore = await getTokenBalance(redeemer, methods)
    assert.strictEqual(recipientBalanceBefore, 0)
    await mintTokensToAccounts(methods, accounts, AMOUNT, OWNER, GAS_LIMIT)
    const recipientBalanceAfter = await getTokenBalance(redeemer, methods)
    assert.strictEqual(recipientBalanceAfter, AMOUNT)
    const { receipt: { logs } } = await methods
      .operatorRedeem(
        redeemer,
        redeemAmount,
        data,
        operatorData,
        ASSET_RECIPIENT,
        { from: operator, gas: GAS_LIMIT }
      )
    const recipientBalanceAfterRedeem = await getTokenBalance(
      redeemer,
      methods
    )
    assert.strictEqual(
      parseInt(recipientBalanceAfterRedeem),
      AMOUNT - redeemAmount
    )
    assert.strictEqual(keys(logs).length, expectedNumEvents)
    assertTransferEvent(logs, redeemer, ZERO_ADDRESS, redeemAmount)
    assertRedeemEvent(logs, redeemer, redeemAmount, ASSET_RECIPIENT)
    assertBurnEvent(
      logs,
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
    const { receipt: { logs } } = await methods
      .mint(recipient, AMOUNT, {
        from: OWNER,
        gas: GAS_LIMIT
      })
    const recipientBalanceAfter = await getTokenBalance(recipient, methods)
    assert.strictEqual(recipientBalanceBefore, 0)
    assert.strictEqual(recipientBalanceAfter, AMOUNT)
    assert.strictEqual(keys(logs).length, expectedNumEvents)
    assertTransferEvent(logs, ZERO_ADDRESS, recipient, AMOUNT)
    assertMintEvent(logs, recipient, OWNER, AMOUNT, data, operatorData)
  })

  it('`mint()` w/out data should return true if successful', async () => {
    const recipient = accounts[0]
    await methods
      .mint(recipient, AMOUNT)
    // Test will pass if function works
  })

  it('`mint()` cannot mint to zero address', async () => {
    const recipient = ZERO_ADDRESS
    const recipientBalanceBefore = await getTokenBalance(recipient, methods)
    assert.strictEqual(recipientBalanceBefore, 0)
    try {
      await methods
        .mint(recipient, AMOUNT, {
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
        .mint(recipient, AMOUNT, { from: NON_OWNER, gas: GAS_LIMIT })
    } catch (_err) {
      const expectedError = 'Ownable: caller is not the owner'
      assert(_err.message.includes(expectedError))
    }
  })

  it('`mint()` w/ data should mint tokens & emit correct events', async () => {
    const data = '0xdead'
    const expectedNumEvents = 2
    const operatorData = '0xb33f'
    const recipient = accounts[0]
    const recipientBalanceBefore = await getTokenBalance(recipient, methods)
    const { receipt: { logs } } = await methods
      .methods['mint(address,uint256,bytes,bytes)'](recipient, AMOUNT, data, operatorData, {
        from: OWNER,
        gas: GAS_LIMIT,
      })
    const recipientBalanceAfter = await getTokenBalance(recipient, methods)
    assert.strictEqual(recipientBalanceBefore, 0)
    assert.strictEqual(recipientBalanceAfter, AMOUNT)
    assert.strictEqual(keys(logs).length, expectedNumEvents)
    assertTransferEvent(logs, ZERO_ADDRESS, recipient, AMOUNT)
    assertMintEvent(logs, recipient, OWNER, AMOUNT, data, operatorData)
  })

  it(`${shortenEthAddress(OWNER)} can change 'pNetwork'`, async () => {
    const newPNetwork = accounts[0]
    const pNetworkBefore = await methods
      .owner()
    assert.strictEqual(pNetworkBefore, OWNER)
    await methods
      .transferOwnership(newPNetwork, { from: OWNER, gas: GAS_LIMIT })
    const pNetworkAfter = await methods
      .owner()
    assert(pNetworkAfter !== pNetworkBefore)
    assert.strictEqual(pNetworkAfter, newPNetwork)
  })

  it(`Only ${shortenEthAddress(OWNER)} can change 'pNetwork'`, async () => {
    const newPNetwork = accounts[0]
    const pNetworkBefore = await methods
      .owner()
    assert.strictEqual(pNetworkBefore, OWNER)
    const expectedError = 'Ownable: caller is not the owner'
    try {
      await methods
        .transferOwnership(newPNetwork, { from: NON_OWNER, gas: GAS_LIMIT })
    } catch (_err) {
      assert(_err.message.includes(expectedError))
    }
  })

  it('pNetwork cannot be the zero address', async () => {
    let expectedError = 'Ownable: new owner is the zero address'
    const pNetworkBefore = await methods
      .owner()
    assert.strictEqual(pNetworkBefore, OWNER)
    try {
      await methods
        .transferOwnership(ZERO_ADDRESS, { from: OWNER, gas: GAS_LIMIT })
    } catch (_err) {
      assert(_err.message.includes(expectedError))
      const pNetworkAfter = await methods
        .owner()
      assert(pNetworkAfter !== ZERO_ADDRESS)
      assert.strictEqual(pNetworkAfter, pNetworkBefore)
    }
  })

  it('Should get redeem fxn call data correctly', async () => {
    const redeemAddress = '33L5hhKLhcNqN7oHfeW3evYXkr9VxyBRRi'
    const redeemer = accounts[3]
    const recipientBalanceBefore = await getTokenBalance(redeemer, methods)
    assert.strictEqual(recipientBalanceBefore, 0)
    await mintTokensToAccounts(methods, accounts, AMOUNT, OWNER, GAS_LIMIT)
    const recipientBalanceAfter = await getTokenBalance(redeemer, methods)
    assert.strictEqual(recipientBalanceAfter, AMOUNT)
    const result = await methods.methods['redeem(uint256,string)'](AMOUNT, redeemAddress).encodeABI()
    // eslint-disable-next-line max-len
    const expectedResult = '0x24b76fd500000000000000000000000000000000000000000000000000000000000005390000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000002233334c3568684b4c68634e714e376f4866655733657659586b723956787942525269000000000000000000000000000000000000000000000000000000000000'
    assert.strictEqual(result, expectedResult)
  })
})
