/* eslint-disable no-unused-expressions */
const { expect } = require('chai')
const pToken = artifacts.require('PToken.sol')
const { expectEvent } = require('@openzeppelin/test-helpers')
const Mock777Recipient = artifacts.require('Mock777Recipient')
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

contract('pToken/ERC777OptionalAckOnMint', ([ OWNER, NON_OWNER ]) => {
  let pTokenContract

  beforeEach(async () => {
    pTokenContract = await pToken.new('Test', 'TST', [], { from: OWNER })
    await pTokenContract.mint(OWNER, 100000, { from: OWNER })
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

  it('Should mint to a contract that does not support ERC1820', async () => {
    const recipient = await Mock777Recipient.new()
    const mintTo = recipient.address
    const tx = await pTokenContract.mint(mintTo, '12345', { from: OWNER })
    await expectEvent(tx.receipt, 'Transfer', { value: '12345', from: ZERO_ADDRESS, to: mintTo })
    expect(await pTokenContract.balanceOf(mintTo)).to.be.bignumber.eq('12345')
    expect(await recipient.tokenReceivedCalled()).to.be.false
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
