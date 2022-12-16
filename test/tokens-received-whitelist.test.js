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
  /* eslint-disable-next-line max-len */
  const NON_ERC777_RECIPIENT_CONTRACT_PATH = 'contracts/test-contracts/MockNonERC777Recipient.sol:MockNonErc777Recipient'
  let OWNER, NON_OWNER, CONTRACT, OWNER_ADDRESS, NON_OWNER_ADDRESS

  const getReceivingContract = (_erc777Recipient = true) =>
    ethers
      .getContractFactory(_erc777Recipient ? ERC777_RECIPIENT_CONTRACT_PATH : NON_ERC777_RECIPIENT_CONTRACT_PATH)
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
    const ADDRESS = getRandomEthAddress()

    it('Owner can add to tokens received whitelist', async () => {
      assert.strictEqual(await CONTRACT.TOKENS_RECEIVED_HOOK_WHITELIST(ADDRESS), false)
      await CONTRACT.addToTokensReceivedWhitelist(ADDRESS)
      assert.strictEqual(await CONTRACT.TOKENS_RECEIVED_HOOK_WHITELIST(ADDRESS), true)
    })

    it('Non owner cannot add to tokens received whitelist', async () => {
      try {
        await CONTRACT.connect(NON_OWNER).addToTokensReceivedWhitelist(ADDRESS)
        assert.fail('Should not have succeeded!')
      } catch (_err) {
        const expectedErr = 'Caller is not an admin'
        assert(_err.message.includes(expectedErr))
      }
      assert.strictEqual(await CONTRACT.TOKENS_RECEIVED_HOOK_WHITELIST(ADDRESS), false)
    })
  })

  describe('Remove address from tokens-received whitelist', () => {
    const ADDRESS = getRandomEthAddress()

    it('Owner can remove from tokens received whitelist', async () => {
      await CONTRACT.addToTokensReceivedWhitelist(ADDRESS)
      assert.strictEqual(await CONTRACT.TOKENS_RECEIVED_HOOK_WHITELIST(ADDRESS), true)
      await CONTRACT.removeFromTokensReceivedWhitelist(ADDRESS)
      assert.strictEqual(await CONTRACT.TOKENS_RECEIVED_HOOK_WHITELIST(ADDRESS), false)
    })

    it('Non owner cannot remove from tokens received whitelist', async () => {
      await CONTRACT.addToTokensReceivedWhitelist(ADDRESS)
      assert.strictEqual(await CONTRACT.TOKENS_RECEIVED_HOOK_WHITELIST(ADDRESS), true)
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
      const mockRecipient = await getReceivingContract()
      const addressToMintTo = mockRecipient.address
      await CONTRACT.addToTokensReceivedWhitelist(addressToMintTo)
      assert.strictEqual(await CONTRACT.TOKENS_RECEIVED_HOOK_WHITELIST(addressToMintTo), true)
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
      const mockRecipient = await getReceivingContract()
      const addressToMintTo = mockRecipient.address
      assert.strictEqual(await CONTRACT.TOKENS_RECEIVED_HOOK_WHITELIST(addressToMintTo), false)
      await CONTRACT['mint(address,uint256)'](addressToMintTo, AMOUNT)
    })

    it('Should call `tokensReceivedHook` in ERC777-supporting contract if whitelisted', async () => {
      const recipient = await getReceivingContract()
      await recipient.initERC1820()
      const addressToMintTo = recipient.address
      await CONTRACT.addToTokensReceivedWhitelist(addressToMintTo)
      assert.strictEqual(await CONTRACT.TOKENS_RECEIVED_HOOK_WHITELIST(addressToMintTo), true)
      const tx = await CONTRACT['mint(address,uint256)'](addressToMintTo, AMOUNT)
      const { events } = await tx.wait()
      await assertTransferEvent(events, ZERO_ADDRESS, addressToMintTo, AMOUNT)
      const pTokenContractBalance = await CONTRACT.balanceOf(addressToMintTo)
      assert(pTokenContractBalance.eq(BigNumber.from(AMOUNT)))
      assert.strictEqual(await recipient.tokenReceivedCalled(), true)
    })

    it('Should not call `tokensReceivedHook` in ERC777-supporting contract if not whitelisted', async () => {
      const recipient = await getReceivingContract()
      await recipient.initERC1820()
      const addressToMintTo = recipient.address
      assert.strictEqual(await CONTRACT.TOKENS_RECEIVED_HOOK_WHITELIST(addressToMintTo), false)
      const tx = await CONTRACT['mint(address,uint256)'](addressToMintTo, AMOUNT)
      const { events } = await tx.wait()
      await assertTransferEvent(events, ZERO_ADDRESS, addressToMintTo, AMOUNT)
      const pTokenContractBalance = await CONTRACT.balanceOf(addressToMintTo)
      assert(pTokenContractBalance.eq(BigNumber.from(AMOUNT)))
      assert.strictEqual(await recipient.tokenReceivedCalled(), false)
    })

    it('Should call tokens received hook upon transfer if whitelisted', async () => {
      const recipient = await getReceivingContract()
      await recipient.initERC1820()
      const addressToTransferTo = recipient.address
      await CONTRACT.addToTokensReceivedWhitelist(addressToTransferTo)
      assert(await CONTRACT.TOKENS_RECEIVED_HOOK_WHITELIST(addressToTransferTo), true)
      await CONTRACT['mint(address,uint256)'](OWNER_ADDRESS, AMOUNT)
      const recipientBalanceBefore = await CONTRACT.balanceOf(addressToTransferTo)
      assert(recipientBalanceBefore.eq(BigNumber.from(0)))
      CONTRACT.transfer(addressToTransferTo, AMOUNT)
      const recipientBalanceAfter = await CONTRACT.balanceOf(addressToTransferTo)
      assert(recipientBalanceAfter.eq(BigNumber.from(AMOUNT)))
      assert.strictEqual(await recipient.tokenReceivedCalled(), true)
    })

    it('Should not call tokens received hook on transfer if not whitelisted', async () => {
      const recipient = await getReceivingContract()
      await recipient.initERC1820()
      const addressToTransferTo = recipient.address
      assert.strictEqual(await CONTRACT.TOKENS_RECEIVED_HOOK_WHITELIST(addressToTransferTo), false)
      await CONTRACT['mint(address,uint256)'](OWNER_ADDRESS, AMOUNT)
      const recipientBalanceBefore = await CONTRACT.balanceOf(addressToTransferTo)
      assert(recipientBalanceBefore.eq(BigNumber.from(0)))
      CONTRACT.transfer(addressToTransferTo, AMOUNT)
      const recipientBalanceAfter = await CONTRACT.balanceOf(addressToTransferTo)
      assert(recipientBalanceAfter.eq(BigNumber.from(AMOUNT)))
      assert.strictEqual(await recipient.tokenReceivedCalled(), false)
    })

    it('Should transfer successfully if not ERC777 recipient and not whitelisted', async () => {
      const isErc777Recipient = false
      const recipient = await getReceivingContract(isErc777Recipient)
      const addressToTransferTo = recipient.address
      assert.strictEqual(await CONTRACT.TOKENS_RECEIVED_HOOK_WHITELIST(addressToTransferTo), false)
      await CONTRACT['mint(address,uint256)'](OWNER_ADDRESS, AMOUNT)
      const recipientBalanceBefore = await CONTRACT.balanceOf(addressToTransferTo)
      assert(recipientBalanceBefore.eq(BigNumber.from(0)))
      CONTRACT.transfer(addressToTransferTo, AMOUNT)
      const recipientBalanceAfter = await CONTRACT.balanceOf(addressToTransferTo)
      assert(recipientBalanceAfter.eq(BigNumber.from(AMOUNT)))
    })

    it('Should transfer successfully if not ERC777 recipient and is whitelisted', async () => {
      const isErc777Recipient = false
      const recipient = await getReceivingContract(isErc777Recipient)
      const addressToTransferTo = recipient.address
      await CONTRACT.addToTokensReceivedWhitelist(addressToTransferTo)
      assert.strictEqual(await CONTRACT.TOKENS_RECEIVED_HOOK_WHITELIST(addressToTransferTo), true)
      await CONTRACT['mint(address,uint256)'](OWNER_ADDRESS, AMOUNT)
      const recipientBalanceBefore = await CONTRACT.balanceOf(addressToTransferTo)
      assert(recipientBalanceBefore.eq(BigNumber.from(0)))
      CONTRACT.transfer(addressToTransferTo, AMOUNT)
      const recipientBalanceAfter = await CONTRACT.balanceOf(addressToTransferTo)
      assert(recipientBalanceAfter.eq(BigNumber.from(AMOUNT)))
    })
  })
})
