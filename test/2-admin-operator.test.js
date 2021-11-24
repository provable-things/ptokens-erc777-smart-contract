const {
  getPTokenContract,
  assertTransferEvent
} = require('./test-utils')
const {
  TOKEN_NAME,
  TOKEN_SYMBOL,
  ORIGIN_CHAIN_ID,
  DESTINATION_CHAIN_ID,
} = require('./test-constants')
const assert = require('assert')
const { BigNumber } = require('ethers')
const { EMPTY_DATA } = require('./test-constants')

describe('Admin Operator Tests', () => {
  let owner, nonOwner, adminOperator, pTokenContract

  beforeEach(async () => {
    [ owner, nonOwner, adminOperator ] = await ethers.getSigners()
    pTokenContract = await getPTokenContract([
      TOKEN_NAME,
      TOKEN_SYMBOL,
      owner.address,
      ORIGIN_CHAIN_ID,
      [ DESTINATION_CHAIN_ID ],
    ])
    await pTokenContract.grantMinterRole(owner.address)
    await pTokenContract['mint(address,uint256)'](owner.address, 100000)
    await pTokenContract.setAdminOperator(adminOperator.address)
  })

  it('Non-owner cannot change the admin operator address', async () => {
    const nonOwnedPTokenContract = pTokenContract.connect(nonOwner)
    try {
      await nonOwnedPTokenContract.setAdminOperator(nonOwner.address)
      assert.fail('Should not have succeeded!')
    } catch (_err) {
      const expectedErr = 'Only the actual admin operator can change the address'
      assert(_err.message.includes(expectedErr))
    }
  })

  it('Admin operator CAN change the admin operator address', async () => {
    const newAddress = nonOwner.address
    const contract = pTokenContract.connect(adminOperator)
    await contract.setAdminOperator(newAddress)
    const adminOperatorAddressInContract = await contract.adminOperator()
    assert.strictEqual(adminOperatorAddressInContract, newAddress)
  })

  it('`adminTransfer()` should fail if the caller is not the admin operator', async () => {
    try {
      await pTokenContract.adminTransfer(owner.address, nonOwner.address, 1, EMPTY_DATA, EMPTY_DATA)
      assert.fail('Should not have succeeded!')
    } catch (_err) {
      const expectedErr = 'caller is not the admin operator'
      assert(_err.message.includes(expectedErr))
    }
  })

  it('`adminTransfer()` should transfer tokens', async () => {
    const amount = '12345'
    const contract = pTokenContract.connect(adminOperator)
    const tx = await contract.adminTransfer(owner.address, nonOwner.address, amount, EMPTY_DATA, EMPTY_DATA)
    const { events } = await tx.wait()
    await assertTransferEvent(events, owner.address, nonOwner.address, amount)
    const balance = await pTokenContract.balanceOf(nonOwner.address)
    assert(balance.eq(BigNumber.from(amount)))
  })
})
