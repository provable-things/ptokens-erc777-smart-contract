const {
  BN,           // Big Number support
  constants,    // Common constants, like the zero address and largest integers
  singletons,
  expectEvent,  // Assertions for emitted events
  expectRevert, // Assertions for transactions that should fail
  time
} = require('@openzeppelin/test-helpers')

const { expect } = require('chai')

const pToken = artifacts.require('PToken.sol')

contract('pToken/ERC777WithAdminOperator', function (accounts) {
  const [ owner, inflationOwner, other, ownerAddress, relayerAddress, trustedSigner, feeTarget, adminOperator, other2 ] = accounts

  describe('admin operator', () => {
    let target
    beforeEach(async () => {
      target = await pToken.new('Test', 'TST', [], { from: owner })
      await target.mint(owner, 100000, { from: owner })
      await target.setAdminOperator(adminOperator, { from: owner })
    })
    it('owner cannot change the admin operator', async function () {
      await expectRevert(
        target.setAdminOperator(other, { from: owner }),
        'Only the actual admin operator can change the address'
      )
    })
    it('admin operator can change the admin operator address', async function () {
      await target.setAdminOperator(other, { from: adminOperator })
      expect(await target.adminOperator()).to.equal(other)
    })
    it('adminTransfer() should fail if the caller is not the admin operator', async function () {
      await expectRevert(
        target.adminTransfer(owner, other, 1, '0x', '0x', { from: owner }),
        'caller is not the admin operator'
      )
    })
    it('adminTransfer() should transfer tokens', async function () {
      const tx = await target.adminTransfer(owner, other, '12345', '0x', '0x', { from: adminOperator })
      await expectEvent(tx.receipt, 'Transfer', { value: '12345', from: owner, to: other })
      expect(await target.balanceOf(other)).to.be.bignumber.eq('12345')
    })
  })
})


