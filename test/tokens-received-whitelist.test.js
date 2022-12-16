const {
  TOKEN_NAME,
  ADDRESS_PROP,
  ZERO_ADDRESS,
  TOKEN_SYMBOL,
  ORIGIN_CHAIN_ID,
} = require('./test-constants')
const {
  getRandomEthAddress,
  assertTransferEvent,
} = require('./test-utils')
const { prop } = require('ramda')
const assert = require('assert')
const { BigNumber } = require('ethers')
const { getPtokenContractWithGSN } = require('./test-utils')

describe('Tokens-Received Hook Whitelist Tests', () => {
  const AMOUNT = 12345
  const ERC777_RECIPIENT_CONTRACT_PATH = 'contracts/test-contracts/MockERC777Recipient.sol:MockErc777Recipient'
  let OWNER, NON_OWNER, CONTRACT, OWNER_ADDRESS, NON_OWNER_ADDRESS

  const getErc777RecipientContract = _ =>
    ethers
      .getContractFactory(ERC777_RECIPIENT_CONTRACT_PATH)
      .then(_factory => _factory.deploy())
      .then(_contract => Promise.all([ _contract, _contract.deployTransaction.wait() ]))
      .then(([ _contract ]) => _contract)

  beforeEach(async () => {
    [ OWNER, NON_OWNER ] = await ethers.getSigners()
    OWNER_ADDRESS = prop(ADDRESS_PROP, OWNER)
    NON_OWNER_ADDRESS = prop(ADDRESS_PROP, NON_OWNER)
    CONTRACT = await getPtokenContractWithGSN([
      TOKEN_NAME,
      TOKEN_SYMBOL,
      OWNER_ADDRESS,
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
      assert.strictEqual(result, ADDRESS)
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
      assert.strictEqual(addressBefore, ADDRESS)
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
      assert.strictEqual(addressBefore, ADDRESS)
      try {
        await CONTRACT.connect(NON_OWNER).removeFromTokensReceivedWhitelist(ADDRESS)
        assert.fail('Should not have succeeded!')
      } catch (_err) {
        const expectedErr = 'Caller is not an admin'
        assert(_err.message.includes(expectedErr))
      }
    })
  })

  describe('`tokensReceivedHook` Being Called Tests', () => {
    it('Should mint to an externally owned account', async () => {
      const tx = await CONTRACT['mint(address,uint256)'](NON_OWNER_ADDRESS, AMOUNT)
      const { events } = await tx.wait()
      await assertTransferEvent(events, ZERO_ADDRESS, NON_OWNER_ADDRESS, AMOUNT)
      const contractBalance = await CONTRACT.balanceOf(NON_OWNER_ADDRESS)
      assert(contractBalance.eq(BigNumber.from(AMOUNT)))
    })

    it('Should not mint to a contract that does not support ERC1820 if whitelisted', async () => {
      const mockRecipient = await getErc777RecipientContract()
      const addressToMintTo = mockRecipient.address
      await CONTRACT.addToTokensReceivedWhitelist(addressToMintTo)
      assert.strictEqual(await CONTRACT.tokensReceivedWhitelistContains(addressToMintTo), true)
      try {
        await CONTRACT['mint(address,uint256)'](addressToMintTo, AMOUNT)
        assert.fail('Should not have succeeded!')
      } catch (_err) {
        // NOTE: Fails because whilst whitelisted, the contract - according to ERC1820 - does not support ERC777,
        // and thus doesn't have the hook and thus the attempt to call it fails.
        const expectedErr = 'ERC777: token recipient contract has no implementer for ERC777TokensRecipient'
        assert(_err.message.includes(expectedErr))
      }
    })

    it('Should mint to a contract that does not support ERC1820 if not whitelisted', async () => {
      // ...because the non-existent `tokensReceivedHook` does not get called...
      const mockRecipient = await getErc777RecipientContract()
      const addressToMintTo = mockRecipient.address
      assert.strictEqual(await CONTRACT.tokensReceivedWhitelistContains(addressToMintTo), false)
      await CONTRACT['mint(address,uint256)'](addressToMintTo, AMOUNT)
    })

    it('Should call `tokensReceivedHook` in ERC777-supporting contract if whitelisted', async () => {
      const recipient = await getErc777RecipientContract()
      await recipient.initERC1820()
      const addressToMintTo = recipient.address
      await CONTRACT.addToTokensReceivedWhitelist(addressToMintTo)
      assert.strictEqual(await CONTRACT.tokensReceivedWhitelistContains(addressToMintTo), true)
      const tx = await CONTRACT['mint(address,uint256)'](addressToMintTo, AMOUNT)
      const { events } = await tx.wait()
      await assertTransferEvent(events, ZERO_ADDRESS, addressToMintTo, AMOUNT)
      const pTokenContractBalance = await CONTRACT.balanceOf(addressToMintTo)
      assert(pTokenContractBalance.eq(BigNumber.from(AMOUNT)))
      assert.strictEqual(await recipient.tokenReceivedCalled(), true)
    })

    it('Should not call `tokensReceivedHook` in ERC777-supporting contract if not whitelisted', async () => {
      const recipient = await getErc777RecipientContract()
      await recipient.initERC1820()
      const addressToMintTo = recipient.address
      assert.strictEqual(await CONTRACT.tokensReceivedWhitelistContains(addressToMintTo), false)
      const tx = await CONTRACT['mint(address,uint256)'](addressToMintTo, AMOUNT)
      const { events } = await tx.wait()
      await assertTransferEvent(events, ZERO_ADDRESS, addressToMintTo, AMOUNT)
      const pTokenContractBalance = await CONTRACT.balanceOf(addressToMintTo)
      assert(pTokenContractBalance.eq(BigNumber.from(AMOUNT)))
      assert.strictEqual(await recipient.tokenReceivedCalled(), false)
    })
  })
})
