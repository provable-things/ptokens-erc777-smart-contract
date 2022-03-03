const { use, expect } = require('chai')
const { solidity } = require('ethereum-waffle')
const singletons = require('erc1820-ethers-registry')

const {
  TOKEN_NAME,
  TOKEN_SYMBOL,
  ORIGIN_CHAIN_ID,
} = require('./test-constants')

use(solidity)

describe('pToken KEYS', () => {
  let pToken, owner, account1, recipient

  beforeEach(async () => {
    const PToken = await ethers.getContractFactory('PToken')

    const accounts = await ethers.getSigners()
    await singletons.ERC1820Registry(accounts[0])
    owner = accounts[0]
    account1 = accounts[1]
    recipient = accounts[2]

    pToken = await upgrades.deployProxy(
      PToken,
      [TOKEN_NAME, TOKEN_SYMBOL, owner.address, ORIGIN_CHAIN_ID],
      {
        initializer: 'initialize',
      }
    )

    await pToken.grantMinterRole(owner.address)
  })

  it('Should transfer the correct amounts, accounting for fees & emit correct events', async () => {
    const amount = '1000000000000000000000'
    const destAmount = '970000000000000000000' // 97% of the amount (∵ 3% to be taken as fees)
    const fee1Amount = '25500000000000000000' // 85% of the 3% fee
    const fee2Amount = '4500000000000000000' // 15% of the 3% fee

    const addr1 = '0x17c2eb5A7d49de8F93125F9Ea576725648623C3B'
    const addr2 = '0x2FECb47A28e545aB020C5D755483E7d8916A3D07'

    await pToken['mint(address,uint256)'](account1.address, amount)
    await expect(pToken.connect(account1).transfer(recipient.address, amount))
      .to.emit(pToken, 'Transfer')
      .withArgs(account1.address, recipient.address, destAmount)
      .to.emit(pToken, 'Transfer')
      .withArgs(account1.address, addr1, fee1Amount)
      .to.emit(pToken, 'Transfer')
      .withArgs(account1.address, addr2, fee2Amount)
      .to.emit(pToken, 'Sent')
      .withArgs(account1.address, account1.address, recipient.address, destAmount, '0x', '0x')
      .to.emit(pToken, 'Sent')
      .withArgs(account1.address, account1.address, addr1, fee1Amount, '0x', '0x')
      .to.emit(pToken, 'Sent')
      .withArgs(account1.address, account1.address, addr2, fee2Amount, '0x', '0x')
    expect(await pToken.balanceOf(recipient.address)).to.be.equal(destAmount)
    expect(await pToken.balanceOf(addr1)).to.be.equal(fee1Amount)
    expect(await pToken.balanceOf(addr2)).to.be.equal(fee2Amount)
  })
})
