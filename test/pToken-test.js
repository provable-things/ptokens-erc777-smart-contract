/* eslint-disable no-undef */
const {
  keys,
  prop
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
  getContract
} = require('./test-utils')
const { assert } = require('chai')
const PToken = artifacts.require('PToken')

contract('pToken', ([OWNER, ...accounts]) => {
  let methods
  const AMOUNT = 1337
  const GAS_LIMIT = 6e6
  const NON_OWNER = accounts[5]
  const ADDED_MINTER = accounts[4]
  const ASSET_RECIPIENT = 'an address'
  const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

  beforeEach(async () => {
    assert(OWNER !== NON_OWNER)
    methods = await deployProxy(PToken, [ 'pToken', 'pTOK', [ OWNER ] ])
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
      const expectedError = 'ERC777: mint to the zero address'
      assert(_err.reason.includes(expectedError))
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
      const expectedError = 'Caller is not a minter'
      assert(_err.reason.includes(expectedError))
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

  it(`${shortenEthAddress(OWNER)} has 'admin' and 'minter' role`, async () => {
    assert.isTrue(await methods
      .hasRole('0x00', OWNER, {
        from: OWNER,
        gas: GAS_LIMIT,
      }))
    
    assert.isTrue(await methods
      .hasMinterRole(OWNER, {
        from: OWNER,
        gas: GAS_LIMIT,
      }))
  })

  it(`${shortenEthAddress(OWNER)} can grant 'minter' role`, async () => {
    assert.isFalse(await methods
      .hasMinterRole(ADDED_MINTER, {
        from: ADDED_MINTER,
        gas: GAS_LIMIT,
      }))
    await methods
      .grantMinterRole(ADDED_MINTER, {
        from: OWNER,
        gas: GAS_LIMIT,
      })
      assert.isTrue(await methods
        .hasMinterRole(ADDED_MINTER, {
          from: ADDED_MINTER,
          gas: GAS_LIMIT,
        }))
  })

  it(`${shortenEthAddress(OWNER)} can revoke 'minter' role`, async () => {
    await methods
      .grantMinterRole(ADDED_MINTER, {
        from: OWNER,
        gas: GAS_LIMIT,
      })
      assert.isTrue(await methods
        .hasMinterRole(ADDED_MINTER, {
          from: ADDED_MINTER,
          gas: GAS_LIMIT,
        }))

    await methods
      .revokeMinterRole(ADDED_MINTER, {
        from: OWNER,
        gas: GAS_LIMIT,
      })

    assert.isFalse(await methods
      .hasMinterRole(ADDED_MINTER, {
        from: ADDED_MINTER,
        gas: GAS_LIMIT,
      }))
  })

  it('newly added minter should be able to mint tokens & emit correct events', async () => {
    await methods
    .grantMinterRole(ADDED_MINTER, {
      from: OWNER,
      gas: GAS_LIMIT,
    })
    const data = null
    const operatorData = null
    const expectedNumEvents = 2
    const recipient = accounts[0]
    const recipientBalanceBefore = await getTokenBalance(recipient, methods)
    const { receipt: { logs } } = await methods
      .mint(recipient, AMOUNT, {
        from: ADDED_MINTER,
        gas: GAS_LIMIT
      })
    const recipientBalanceAfter = await getTokenBalance(recipient, methods)
    assert.strictEqual(recipientBalanceBefore, 0)
    assert.strictEqual(recipientBalanceAfter, AMOUNT)
    assert.strictEqual(keys(logs).length, expectedNumEvents)
    assertTransferEvent(logs, ZERO_ADDRESS, recipient, AMOUNT)
    assertMintEvent(logs, recipient, ADDED_MINTER, AMOUNT, data, operatorData)
  })

  it('Should get redeem fxn call data correctly', async () => {
  const redeemAddress = '33L5hhKLhcNqN7oHfeW3evYXkr9VxyBRRi'
  const redeemer = accounts[3]
  const recipientBalanceBefore = await getTokenBalance(redeemer, methods)
  assert.strictEqual(recipientBalanceBefore, 0)
  await mintTokensToAccounts(methods, accounts, AMOUNT, OWNER, GAS_LIMIT)
  const recipientBalanceAfter = await getTokenBalance(redeemer, methods)
  assert.strictEqual(recipientBalanceAfter, AMOUNT)
  /**
   * overrides deployProxy to get the method abi
   */
  methods = await getContract(web3, PToken, ['pToken', 'pTOK', [ OWNER ]])
  .then(prop('methods'))
  const result = await methods.redeem(AMOUNT, redeemAddress).encodeABI()
  // eslint-disable-next-line max-len
  const expectedResult = '0x24b76fd500000000000000000000000000000000000000000000000000000000000005390000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000002233334c3568684b4c68634e714e376f4866655733657659586b723956787942525269000000000000000000000000000000000000000000000000000000000000'
  assert.strictEqual(result, expectedResult)
})
})
