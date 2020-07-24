const {
  expectEvent,
  expectRevert,
} = require('@openzeppelin/test-helpers')
const { expect } = require('chai')
const pToken = artifacts.require('PToken.sol')

contract('pToken/ERC777WithAdminOperator', ([ OWNER, NON_OWNER, ADMIN_OPERATOR ]) => {
  let pTokenContract

  beforeEach(async () => {
    pTokenContract = await pToken.new('Test', 'TST', [], { from: OWNER })
    await pTokenContract.mint(OWNER, 100000, { from: OWNER })
    await pTokenContract.setAdminOperator(ADMIN_OPERATOR, { from: OWNER })
  })

  it('OWNER cannot change the admin operator', async () => {
    await expectRevert(
      pTokenContract.setAdminOperator(NON_OWNER, { from: OWNER }),
      'Only the actual admin operator can change the address'
    )
  })

  it('Admin operator can change the admin operator address', async () => {
    await pTokenContract.setAdminOperator(NON_OWNER, { from: ADMIN_OPERATOR })
    expect(await pTokenContract.adminOperator()).to.equal(NON_OWNER)
  })

  it('adminTransfer() should fail if the caller is not the admin operator', async () => {
    await expectRevert(
      pTokenContract.adminTransfer(OWNER, NON_OWNER, 1, '0x', '0x', { from: OWNER }),
      'caller is not the admin operator'
    )
  })

  it('adminTransfer() should transfer tokens', async () => {
    const tx = await pTokenContract.adminTransfer(OWNER, NON_OWNER, '12345', '0x', '0x', { from: ADMIN_OPERATOR })
    await expectEvent(tx.receipt, 'Transfer', { value: '12345', from: OWNER, to: NON_OWNER })
    expect(await pTokenContract.balanceOf(NON_OWNER)).to.be.bignumber.eq('12345')
  })
})
