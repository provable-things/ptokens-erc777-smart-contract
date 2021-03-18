const {
  runRelayer,
  fundRecipient,
  deployRelayHub,
} = require('@openzeppelin/gsn-helpers')
const { expect } = require('chai')
const pTokenArtifact = artifacts.require('PToken')
const { fixSignaturePerEIP155 } = require('./test-utils')
const { GSNDevProvider } = require('@openzeppelin/gsn-provider')
const { deployProxy } = require('@openzeppelin/truffle-upgrades')

contract('pToken/ERC777GSN', ([ owner, other, ownerAddress, relayerAddress, trustedSigner, feeTarget ]) => {
  let relayer
  let pTokenContract

  const getApprovalData = async data => {
    const feeRate = `${1e18}`
    const signature = fixSignaturePerEIP155(await web3.eth.sign(
      web3.utils.soliditySha3(
        feeRate,
        data.relayerAddress,
        data.from,
        data.encodedFunctionCall,
        web3.utils.toBN(data.txFee),
        web3.utils.toBN(data.gasPrice),
        web3.utils.toBN(data.gas),
        web3.utils.toBN(data.nonce),
        data.relayHubAddress,
        data.to
      ),
      trustedSigner
    ))
    return web3.eth.abi.encodeParameters(['uint256', 'bytes'], [feeRate, signature])
  }

  before(async () => {
    await deployRelayHub(web3)
    relayer = await runRelayer(web3, { quiet: true })
  })

  after(() => relayer.kill())

  beforeEach(async () => {
    const pTokenContractTemp = await deployProxy(pTokenArtifact, ['Test', 'TST', [owner]])
    await pTokenContractTemp.mint(owner, '1000000000000000000', { from: owner })
    await pTokenContractTemp.setTrustedSigner(trustedSigner, { from: owner })
    await pTokenContractTemp.setFeeTarget(feeTarget, { from: owner })
    await fundRecipient(web3, { recipient: pTokenContractTemp.address, amount: web3.utils.toWei('1') })
    const gsnProvider = new GSNDevProvider(web3.currentProvider, {
      ownerAddress,
      relayerAddress,
      approveFunction: getApprovalData
    })
    const pToken2 = artifacts.require('PToken.sol')
    pToken2.setProvider(gsnProvider)
    pTokenContract = await pToken2.at(pTokenContractTemp.address)
  })

  it('Should transfer via relayer', async () => {
    const tx = await pTokenContract.transfer(other, 12345, { from: owner, gas: '50000' })
    expect(tx.receipt.from).to.equal(relayerAddress.toLowerCase())
    expect(tx.receipt.to).to.not.equal(pTokenContract.address.toLowerCase())
    expect(await pTokenContract.balanceOf(other)).to.be.bignumber.eq('12345')
  })

  it('When transferring via relay, it should pay fee in token', async () => {
    await pTokenContract.transfer(other, 12345, { from: owner, gasPrice: '1', gas: '50000' })
    expect(await pTokenContract.balanceOf(feeTarget)).to.be.bignumber.greaterThan('150000')
  })
})
