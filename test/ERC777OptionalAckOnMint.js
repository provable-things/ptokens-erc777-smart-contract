const {
  BN,           // Big Number support
  constants,    // Common constants, like the zero address and largest integers
  singletons,
  expectEvent,  // Assertions for emitted events
  expectRevert, // Assertions for transactions that should fail
  time
} = require('@openzeppelin/test-helpers')

const { expect } = require('chai')

const pToken = artifacts.require('pToken')
const Mock777Recipient = artifacts.require('Mock777Recipient')

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

contract('pToken/ERC777OptionalAckOnMint', function (accounts) {
  const [ owner, inflationOwner, other, ownerAddress, relayerAddress, trustedSigner, feeTarget, adminOperator, other2 ] = accounts

  let target
  beforeEach(async () => {
    target = await pToken.new('Test', 'TST', [], { from: owner })
    await target.mint(owner, 100000, { from: owner })
  })
  it('mint versus an EOA', async function () {
    const tx = await target.mint(other, '12345', { from: owner })
    await expectEvent(tx.receipt, 'Transfer', { value: '12345', from: ZERO_ADDRESS, to: other })
    expect(await target.balanceOf(other)).to.be.bignumber.eq('12345')
  })
  it('mint versus a contract that does not support ERC1820', async function () {
    const recipient = await Mock777Recipient.new()
    const mintTo = recipient.address
    const tx = await target.mint(mintTo, '12345', { from: owner })
    await expectEvent(tx.receipt, 'Transfer', { value: '12345', from: ZERO_ADDRESS, to: mintTo })
    expect(await target.balanceOf(mintTo)).to.be.bignumber.eq('12345')
    expect(await recipient.tokenReceivedCalled()).to.be.false
  })
  it('mint versus a contract that supports ERC1820', async function () {
    const recipient = await Mock777Recipient.new()
    await recipient.initERC1820()
    const mintTo = recipient.address
    const tx = await target.mint(mintTo, '12345', { from: owner })
    await expectEvent(tx.receipt, 'Transfer', { value: '12345', from: ZERO_ADDRESS, to: mintTo })
    // await expectEvent(tx.receipt, 'TokensReceivedCallback', {
    //   operator: owner,
    //   from: ZERO_ADDRESS,
    //   to: mintTo,
    //   amount: '12345',
    //   userData: '0x',
    //   operatorData: '0x'
    // })
    expect(await target.balanceOf(mintTo)).to.be.bignumber.eq('12345')
    expect(await recipient.tokenReceivedCalled()).to.be.true
  })
})


