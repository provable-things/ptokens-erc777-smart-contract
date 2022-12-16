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
  DESTINATION_CHAIN_ID,
} = require('./test-constants')
const {
  assertMintEvent,
  assertBurnEvent,
  getTokenBalance,
  assertRedeemEvent,
  getRandomEthAddress,
  assertTransferEvent,
  mintTokensToAccounts,
} = require('./test-utils')
const {
  getPtokenContractWithGSN,
  getPtokenContractWithoutGSN,
} = require('./test-utils')
const assert = require('assert')
const { BigNumber } = require('ethers')

describe('Tokens-Received Hook Whitelist Tests', () => {
  const AMOUNT = 1337
  const ASSET_RECIPIENT = 'an address'
  let OWNER, NON_OWNER, MINTER, OTHERS, CONTRACT

  beforeEach(async () => {
    [ OWNER, NON_OWNER, MINTER, ...OTHERS ] = await ethers.getSigners()
    CONTRACT = await getPtokenContractWithGSN([
      TOKEN_NAME,
      TOKEN_SYMBOL,
      OWNER.address,
      ORIGIN_CHAIN_ID,
    ])
    await CONTRACT.grantMinterRole(OWNER.address)
  })

  describe('Add address to tokens-received whitelist', () => {
    const INDEX = 0
    const ADDRESS = getRandomEthAddress()

    it('Owner can add to tokens received whitelist', async () => {
      await CONTRACT.addToTokensReceivedWhitelist(ADDRESS)
      const result = await CONTRACT.getTokensReceivedWhitelistEntryAt(INDEX)
      assert.strictEqual(result, ADDRESS);
    })

    it('Non owner cannot add to tokens received whitelist', async () => {
      try {
        await CONTRACT.connect(NON_OWNER).addToTokensReceivedWhitelist(ADDRESS)
        assert.fail('Should not have succeeded!')
      } catch (_err) {
        const expectedErr = 'Caller is not an admin'
        assert(_err.message.includes(expectedErr))
      }
      try {
        await CONTRACT.getTokensReceivedWhitelistEntryAt(INDEX)
        assert.fail('Should not have succeeded!')
      } catch (_err) {
        const expectedErr = 'index out of bounds'
        assert(_err.message.includes(expectedErr))
      }
    })
  })

  describe('Remove address from tokens-received whitelist', () => {
    const INDEX = 0
    const ADDRESS = getRandomEthAddress()

    it('Owner can remove from tokens received whitelist', async () => {
      await CONTRACT.addToTokensReceivedWhitelist(ADDRESS)
      const addressBefore = await CONTRACT.getTokensReceivedWhitelistEntryAt(INDEX)
      assert.strictEqual(addressBefore, ADDRESS);
      await CONTRACT.removeFromTokensReceivedWhitelist(ADDRESS)
      try {
        await CONTRACT.getTokensReceivedWhitelistEntryAt(INDEX)
        assert.fail('Should not have succeeded!')
      } catch (_err) {
        const expectedErr = 'index out of bounds'
        assert(_err.message.includes(expectedErr))
      }
    })

    it('Non owner cannot remove from tokens received whitelist', async () => {
      await CONTRACT.addToTokensReceivedWhitelist(ADDRESS)
      const addressBefore = await CONTRACT.getTokensReceivedWhitelistEntryAt(INDEX)
      assert.strictEqual(addressBefore, ADDRESS);
      try {
        await CONTRACT.connect(NON_OWNER).removeFromTokensReceivedWhitelist(ADDRESS)
        assert.fail('Should not have succeeded!')
      } catch (_err) {
        const expectedErr = 'Caller is not an admin'
        assert(_err.message.includes(expectedErr))
      }
    })
  })
})
