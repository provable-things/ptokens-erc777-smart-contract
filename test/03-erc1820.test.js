const {
  assertTransferEvent,
  getPtokenContractWithGSN,
  getPtokenContractWithoutGSN,
} = require('./test-utils')
const {
  TOKEN_NAME,
  TOKEN_SYMBOL,
  ZERO_ADDRESS,
  ADDRESS_PROP,
  ORIGIN_CHAIN_ID,
} = require('./test-constants')
const assert = require('assert')
const { prop } = require('ramda')
const { BigNumber } = require('ethers')

const USE_GSN = [ true, false ]

USE_GSN.map(_useGSN =>
  describe(`pToken ERC1820 Tests WITH${_useGSN ? '' : 'OUT'} GSN`, () => {
    const AMOUNT = 12345
    let PTOKEN_CONTRACT, OWNER_ADDRESS, NON_OWNER_ADDRESS
    const ERC777_RECIPIENT_CONTRACT_PATH = 'contracts/test-contracts/MockERC777Recipient.sol:MockErc777Recipient'

    const getErc777RecipientContract = _ =>
      ethers
        .getContractFactory(ERC777_RECIPIENT_CONTRACT_PATH)
        .then(_factory => _factory.deploy())
        .then(_contract => Promise.all([ _contract, _contract.deployTransaction.wait() ]))
        .then(([ _contract ]) => _contract)

    beforeEach(async () => {
      const [ OWNER, NON_OWNER ] = await ethers.getSigners()
      OWNER_ADDRESS = prop(ADDRESS_PROP, OWNER)
      NON_OWNER_ADDRESS = prop(ADDRESS_PROP, NON_OWNER)
      const contractGetterFxn = _useGSN ? getPtokenContractWithGSN : getPtokenContractWithoutGSN
      PTOKEN_CONTRACT = await contractGetterFxn([
        TOKEN_NAME,
        TOKEN_SYMBOL,
        OWNER_ADDRESS,
        ORIGIN_CHAIN_ID,
      ])
      await PTOKEN_CONTRACT.grantMinterRole(OWNER_ADDRESS)
    })

    it('Should mint to an externally owned account', async () => {
      const tx = await PTOKEN_CONTRACT['mint(address,uint256)'](NON_OWNER_ADDRESS, AMOUNT)
      const { events } = await tx.wait()
      await assertTransferEvent(events, ZERO_ADDRESS, NON_OWNER_ADDRESS, AMOUNT)
      const contractBalance = await PTOKEN_CONTRACT.balanceOf(NON_OWNER_ADDRESS)
      assert(contractBalance.eq(BigNumber.from(AMOUNT)))
    })

    it.skip('Should not mint to a contract that does not support ERC1820', async () => {
      const mockRecipient = await getErc777RecipientContract()
      const addressToMintTo = mockRecipient.address
      try {
        await PTOKEN_CONTRACT['mint(address,uint256)'](addressToMintTo, AMOUNT)
        assert.fail('Should not have succeeded!')
      } catch (_err) {
        const expectedErr = 'ERC777: token recipient contract has no implementer for ERC777TokensRecipient'
        assert(_err.message.includes(expectedErr))
      }
    })

    it.skip('Should mint to a contract that supports ERC1820, and call `tokensReceivedHook`', async () => {
      const recipient = await getErc777RecipientContract()
      await recipient.initERC1820()
      const addressToMintTo = recipient.address
      const tx = await PTOKEN_CONTRACT['mint(address,uint256)'](addressToMintTo, AMOUNT)
      const { events } = await tx.wait()
      await assertTransferEvent(events, ZERO_ADDRESS, addressToMintTo, AMOUNT)
      const pTokenContractBalance = await PTOKEN_CONTRACT.balanceOf(addressToMintTo)
      assert(pTokenContractBalance.eq(BigNumber.from(AMOUNT)))
      assert.strictEqual(await recipient.tokenReceivedCalled(), true)
    })
  })
)
