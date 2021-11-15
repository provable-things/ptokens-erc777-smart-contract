const assert = require('assert')
const { BigNumber } = require('ethers')

describe('pToken ERC777OptionalAckOnMint Tests', () => {
  let pTokenContract, ownerAddress, nonOwnerAddress
  const AMOUNT = 12345
  const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
  const ERC777_RECIPIENT_CONTRACT_PATH = 'contracts/MockERC777Recipient.sol:MockErc777Recipient'

  const getTransferEventFromReceipt = _receipts =>
    _receipts.events.filter(_receipt => _receipt.event === 'Transfer')[0]

  const assertTransferEvent = (_event, _from, _to, _amount) => {
    assert.strictEqual(_event.args.from, _from)
    assert.strictEqual(_event.args.to, _to)
    assert(_event.args.value.eq(BigNumber.from(_amount)))
  }

  beforeEach(async () => {
    [ ownerAddress, nonOwnerAddress ] = await web3.eth.getAccounts()
    const contractFactory = await ethers.getContractFactory('contracts/pToken.sol:PToken')
    pTokenContract = await upgrades.deployProxy(contractFactory, ['Test', 'TST', ownerAddress])
    await pTokenContract.grantMinterRole(ownerAddress)
  })

  it('Should mint to an externally owned account', async () => {
    const tx = await pTokenContract['mint(address,uint256)'](nonOwnerAddress, AMOUNT)
    const receipt = await tx.wait()
    assertTransferEvent(getTransferEventFromReceipt(receipt), ZERO_ADDRESS, nonOwnerAddress, AMOUNT)
    const contractBalance = await pTokenContract.balanceOf(nonOwnerAddress)
    assert(contractBalance.eq(BigNumber.from(AMOUNT)))
  })

  const getErc777RecipientContract = _ =>
    ethers
      .getContractFactory(ERC777_RECIPIENT_CONTRACT_PATH)
      .then(_factory => _factory.deploy())
      .then(_contract => Promise.all([ _contract, _contract.deployTransaction.wait() ]))
      .then(([ _contract ]) => _contract)

  it('Should not mint to a contract that does not support ERC1820', async () => {
    const mockRecipient = await getErc777RecipientContract()
    const addressToMintTo = mockRecipient.address
    try {
      await pTokenContract['mint(address,uint256)'](addressToMintTo, AMOUNT)
      assert.fail('Should not have succeeded!')
    } catch (_err) {
      const expectedErr = 'ERC777: token recipient contract has no implementer for ERC777TokensRecipient'
      assert(_err.message.includes(expectedErr))
    }
  })

  it('Should mint to a contract that supports ERC1820, and call `tokensReceivedHook`', async () => {
    const recipient = await getErc777RecipientContract()
    await recipient.initERC1820()
    const addressToMintTo = recipient.address
    const tx = await pTokenContract['mint(address,uint256)'](addressToMintTo, AMOUNT)
    const receipt = await tx.wait()
    assertTransferEvent(getTransferEventFromReceipt(receipt), ZERO_ADDRESS, addressToMintTo, AMOUNT)
    const pTokenContractBalance = await pTokenContract.balanceOf(addressToMintTo)
    assert(pTokenContractBalance.eq(BigNumber.from(AMOUNT)))
    assert.strictEqual(await recipient.tokenReceivedCalled(), true)
  })
})
