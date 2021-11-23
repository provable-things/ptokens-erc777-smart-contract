const {
  has,
  keys,
} = require('ramda')
const {
  EMPTY_DATA,
  TOKEN_NAME,
  ZERO_ADDRESS,
  TOKEN_SYMBOL,
  ORIGIN_CHAIN_ID,
} = require('./test-constants')
const {
  assertMintEvent,
  assertBurnEvent,
  getTokenBalance,
  assertRedeemEvent,
  assertTransferEvent,
  mintTokensToAccounts,
} = require('./test-utils')
const assert = require('assert')
const { BigNumber } = require('ethers')
const { getPTokenContract } = require('./test-utils')

describe('pToken Tests', () => {
  const AMOUNT = 1337
  const ASSET_RECIPIENT = 'an address'
  let OWNER, NON_OWNER, MINTER, OTHERS, CONTRACT

  beforeEach(async () => {
    [ OWNER, NON_OWNER, MINTER, ...OTHERS ] = await ethers.getSigners()
    CONTRACT = await getPTokenContract([ TOKEN_NAME, TOKEN_SYMBOL, OWNER.address, ORIGIN_CHAIN_ID ])
    await CONTRACT.grantMinterRole(OWNER.address)
  })

  describe('Roles Tests', () => {
    it('Owner has \'admin\' and \'minter\' role', async () => {
      assert(await CONTRACT.hasMinterRole(OWNER.address))
      assert.strictEqual(await CONTRACT.owner(), OWNER.address)
    })

    it('Owner can grant `minter` role', async () => {
      assert(!await CONTRACT.hasMinterRole(MINTER.address))
      await CONTRACT.grantMinterRole(MINTER.address)
      assert(await CONTRACT.hasMinterRole(MINTER.address))
    })

    it('Owner can revoke `minter` role', async () => {
      await CONTRACT.grantMinterRole(MINTER.address)
      assert(await CONTRACT.hasMinterRole(MINTER.address))
      await CONTRACT.revokeMinterRole(MINTER.address)
      assert(!await CONTRACT.hasMinterRole(MINTER.address))
    })

    it('Newly added minter should be able to mint tokens & emit correct events', async () => {
      await CONTRACT.grantMinterRole(MINTER.address)
      const expectedNumEvents = 2
      const recipient = OTHERS[0].address
      const recipientBalanceBefore = await getTokenBalance(recipient, CONTRACT)
      const tx = await CONTRACT.connect(MINTER)['mint(address,uint256)'](recipient, AMOUNT)
      const { events } = await tx.wait()
      const recipientBalanceAfter = await getTokenBalance(recipient, CONTRACT)
      assert(recipientBalanceBefore.eq(BigNumber.from(0)))
      assert(recipientBalanceAfter.eq(BigNumber.from(AMOUNT)))
      assert.strictEqual(events.length, expectedNumEvents)
      assertTransferEvent(events, ZERO_ADDRESS, recipient, AMOUNT)
      assertMintEvent(events, recipient, MINTER.address, AMOUNT, EMPTY_DATA, EMPTY_DATA)
    })

    it('Should grant minter role to EOA', async () => {
      const role = ethers.utils.solidityKeccak256(['string'], [ 'MINTER_ROLE' ])
      const address = '0xedB86cd455ef3ca43f0e227e00469C3bDFA40628'
      const hasRoleBefore = await CONTRACT.hasRole(role, address)
      assert(!hasRoleBefore)
      await CONTRACT.grantRole(role, address)
      const hasRoleAfter = await CONTRACT.hasRole(role, address)
      assert(hasRoleAfter)
    })
  })

  describe('Mint Tests', () => {
    it('`mint()` w/out data should mint tokens & emit correct events', async () => {
      const expectedNumEvents = 2
      const recipient = OTHERS[5].address
      const recipientBalanceBefore = await getTokenBalance(recipient, CONTRACT)
      const tx = await CONTRACT['mint(address,uint256)'](recipient, AMOUNT)
      const { events } = await tx.wait()
      const recipientBalanceAfter = await getTokenBalance(recipient, CONTRACT)
      assert(recipientBalanceBefore.eq(BigNumber.from(0)))
      assert(recipientBalanceAfter.eq(BigNumber.from(AMOUNT)))
      assert.strictEqual(events.length, expectedNumEvents)
      assertTransferEvent(events, ZERO_ADDRESS, recipient, AMOUNT)
      assertMintEvent(events, recipient, OWNER.address, AMOUNT, EMPTY_DATA, EMPTY_DATA)
    })

    it('`mint()` w/out data should return true if successful', async () => {
      const recipient = OTHERS[0].address
      await CONTRACT['mint(address,uint256)'](recipient, AMOUNT)
    })

    it('`mint()` cannot mint to zero address', async () => {
      const recipient = ZERO_ADDRESS
      const recipientBalanceBefore = await getTokenBalance(recipient, CONTRACT)
      assert(recipientBalanceBefore.eq(BigNumber.from(0)))
      try {
        await CONTRACT['mint(address,uint256)'](recipient, AMOUNT)
        assert.fail('Should not have succeeded!')
      } catch (_err) {
        const expectedError = 'ERC777: mint to the zero address'
        assert(_err.message.includes(expectedError))
      }
    })

    it('`mint()` only owner can mint', async () => {
      const recipient = ZERO_ADDRESS
      const recipientBalanceBefore = await getTokenBalance(recipient, CONTRACT)
      assert(recipientBalanceBefore.eq(BigNumber.from(0)))
      try {
        await CONTRACT.connect(NON_OWNER)['mint(address,uint256)'](recipient, AMOUNT)
        assert.fail('Should not have succeeded!')
      } catch (_err) {
        const expectedError = 'Caller is not a minter'
        assert(_err.message.includes(expectedError))
      }
    })

    it('`mint()` w/ data should mint tokens & emit correct events', async () => {
      const data = '0xdead'
      const expectedNumEvents = 2
      const operatorData = '0xb33f'
      const recipient = OTHERS[0].address
      const recipientBalanceBefore = await getTokenBalance(recipient, CONTRACT)
      const tx = await CONTRACT['mint(address,uint256,bytes,bytes)'](recipient, AMOUNT, data, operatorData)
      const { events } = await tx.wait()
      const recipientBalanceAfter = await getTokenBalance(recipient, CONTRACT)
      assert(recipientBalanceBefore.eq(BigNumber.from(0)))
      assert(recipientBalanceAfter.eq(BigNumber.from(AMOUNT)))
      assert.strictEqual(events.length, expectedNumEvents)
      assertTransferEvent(events, ZERO_ADDRESS, recipient, AMOUNT)
      assertMintEvent(events, recipient, OWNER.address, AMOUNT, data, operatorData)
    })

    it('Should revert when minting tokens with the contract address as the recipient', async () => {
      const recipient = CONTRACT.address
      try {
        await CONTRACT['mint(address,uint256)'](recipient, AMOUNT)
        assert.fail('Should not succeed!')
      } catch (_err) {
        const expectedErr = 'Recipient cannot be the token contract address!'
        assert(_err.message.includes(expectedErr))
      }
    })
  })

  describe('Redeem Tests', () => {
    it('`redeem()` function should burn tokens & emit correct events', async () => {
      const redeemAmount = 666
      const expectedNumEvents = 3
      const redeemer = OTHERS[3]
      const operator = redeemer.address
      const recipientBalanceBefore = await getTokenBalance(redeemer.address, CONTRACT)
      assert(recipientBalanceBefore.eq(BigNumber.from(0)))
      await mintTokensToAccounts(CONTRACT, [ OWNER, ...OTHERS ], AMOUNT, OWNER)
      const recipientBalanceAfter = await getTokenBalance(redeemer.address, CONTRACT)
      assert(recipientBalanceAfter.eq(BigNumber.from(AMOUNT)))
      const tx = await CONTRACT.connect(redeemer)['redeem(uint256,string)'](redeemAmount, ASSET_RECIPIENT)
      const { events } = await tx.wait()
      const recipientBalanceAfterRedeem = await getTokenBalance(redeemer.address, CONTRACT)
      assert.strictEqual(parseInt(recipientBalanceAfterRedeem), AMOUNT - redeemAmount)
      assert(keys(events).length === expectedNumEvents)
      assertRedeemEvent(events, redeemer.address, redeemAmount, ASSET_RECIPIENT)
      assertTransferEvent(events, redeemer.address, ZERO_ADDRESS, redeemAmount)
      assertBurnEvent(events, redeemer.address, operator, redeemAmount, EMPTY_DATA, EMPTY_DATA)
    })

    it('Should get redeem fxn call data correctly', () => {
      const redeemAddress = '33L5hhKLhcNqN7oHfeW3evYXkr9VxyBRRi'
      const result = new ethers.utils
        .Interface(CONTRACT.interface.fragments)
        .encodeFunctionData('redeem(uint256,string)', [ AMOUNT, redeemAddress ])
      /* eslint-disable-next-line max-len */
      const expectedResult = '0x24b76fd500000000000000000000000000000000000000000000000000000000000005390000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000002233334c3568684b4c68634e714e376f4866655733657659586b723956787942525269000000000000000000000000000000000000000000000000000000000000'
      assert.strictEqual(result, expectedResult)
    })
  })

  describe('Contract Upgrades Tests', () => {
    const UPGRADED_CONTRACT_PATH = 'contracts/pTokenDummyUpgrade.sol:PTokenDummyUpgrade'
    const NEW_FXN_NAME = 'theMeaningOfLife'
    const getUpgradedContract = _address =>
      ethers.getContractFactory(UPGRADED_CONTRACT_PATH).then(_factory => upgrades.upgradeProxy(_address, _factory))

    it('Should upgrade contract', async () => {
      assert(!has(NEW_FXN_NAME, CONTRACT))
      const upgradedContract = await getUpgradedContract(CONTRACT.address)
      assert(has(NEW_FXN_NAME, upgradedContract))
      const expectedResult = 42
      const result = await upgradedContract[NEW_FXN_NAME]()
      assert(result.eq(BigNumber.from(expectedResult)))
    })

    it('User balance should remain after contract upgrade', async () => {
      const recipient = OTHERS[7].address
      const recipientBalanceBefore = await getTokenBalance(recipient, CONTRACT)
      await CONTRACT['mint(address,uint256)'](recipient, AMOUNT)
      const recipientBalanceAfter = await getTokenBalance(recipient, CONTRACT)
      assert(recipientBalanceBefore.eq(BigNumber.from(0)))
      assert(recipientBalanceAfter.eq(BigNumber.from(AMOUNT)))
      const upgradedContract = await getUpgradedContract(CONTRACT.address)
      const recipientBalanceAfterUpgrade = await getTokenBalance(recipient, upgradedContract)
      assert(recipientBalanceAfterUpgrade.eq(BigNumber.from(AMOUNT)))
    })
  })
})
