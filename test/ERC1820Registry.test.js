/* eslint-disable no-unused-expressions */
const {
  expectEvent,
  expectRevert,
} = require('@openzeppelin/test-helpers')
const assert = require('assert')
const { expect } = require('chai')
const PToken = artifacts.require('PToken.sol')
const Mock777Recipient = artifacts.require('Mock777Recipient')
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
const { deployProxy } = require('@openzeppelin/truffle-upgrades')

contract('PToken/ERC777OptionalAckOnMint', ([ OWNER, NON_OWNER ]) => {
  let pTokenContract
  const GAS_LIMIT = 6e6

  beforeEach(async () => {
    assert(OWNER !== NON_OWNER)
    pTokenContract = await deployProxy(PToken, [ 'TEST', 'TST', OWNER ])
    await pTokenContract.grantMinterRole(OWNER, { from: OWNER, gas: GAS_LIMIT })
  })

  it('Should mint to an externally owned account', async () => {
    const tx = await pTokenContract.mint(NON_OWNER, '12345', { from: OWNER })
    await expectEvent(
      tx.receipt,
      'Transfer',
      { value: '12345', from: ZERO_ADDRESS, to: NON_OWNER }
    )
    expect(await pTokenContract.balanceOf(NON_OWNER)).to.be.bignumber.eq('12345')
  })

  it('Should not mint to a contract that does not support ERC1820', async () => {
    const recipient = await Mock777Recipient.new()
    const mintTo = recipient.address
    await expectRevert(
      pTokenContract.mint(mintTo, '12345', { from: OWNER }),
      /* eslint-disable-next-line max-len */
      'ERC777: token recipient contract has no implementer for ERC777TokensRecipient -- Reason given: ERC777: token recipient contract has no implementer for ERC777TokensRecipient.'
    )
  })

  it('Should mint to a contract that supports ERC1820, and call `tokensReceivedHook`', async () => {
    const recipient = await Mock777Recipient.new()
    await recipient.initERC1820()
    const mintTo = recipient.address
    const tx = await pTokenContract.mint(mintTo, '12345', { from: OWNER })
    await expectEvent(tx.receipt, 'Transfer', { value: '12345', from: ZERO_ADDRESS, to: mintTo })
    expect(await pTokenContract.balanceOf(mintTo)).to.be.bignumber.eq('12345')
    expect(await recipient.tokenReceivedCalled()).to.be.true
  })
})
