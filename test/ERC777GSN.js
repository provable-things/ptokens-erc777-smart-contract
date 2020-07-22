// const { accounts, contract, web3, provider } = require('@openzeppelin/test-environment')

const {
  BN,           // Big Number support
  constants,    // Common constants, like the zero address and largest integers
  singletons,
  expectEvent,  // Assertions for emitted events
  expectRevert, // Assertions for transactions that should fail
  time
} = require('@openzeppelin/test-helpers')

const {
  deployRelayHub,
  runRelayer,
  fundRecipient,
} = require('@openzeppelin/gsn-helpers')

const { GSNDevProvider } = require("@openzeppelin/gsn-provider")

const { expect } = require('chai')

const pToken = artifacts.require('pToken')

// const signer = '0xf2F2a2a92D55772fBF74BE5dA642b5b49aAD4cC9'
// const signKey = '0x80003046efb4c6f752989dedb8a5aaad0668f999d3e21c2ba9005cc8e480e690'

contract('pToken/ERC777GSN', function (accounts) {
  const [ owner, inflationOwner, other, ownerAddress, relayerAddress, trustedSigner, feeTarget, adminOperator, other2 ] = accounts

  describe('Gas Station Network', function() {
    this.timeout(5000)
    let target

    function fixSignature(signature) {
      let v = parseInt(signature.slice(130, 132), 16)
      if (v < 27) {
        v += 27
      }
      const vHex = v.toString(16)
      return signature.slice(0, 130) + vHex
    }

    const getApprovalData = async data => {
      const feeRate = '1000000000000000000' // 1e18
      const signature = fixSignature(await web3.eth.sign(
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
      return web3.eth.abi.encodeParameters(
        ['uint256', 'bytes'],
        [feeRate, signature]
      )
    }

    let relayer
    before(async () => {
      await deployRelayHub(web3)
      relayer = await runRelayer(web3, { quiet: true })
    })
    after(() => {
      relayer.kill()
    })
    beforeEach(async () => {
      // for GNS testing see:
      // https://docs.openzeppelin.com/gsn-helpers/0.2/#using_the_javascript_library
      // https://docs.openzeppelin.com/gsn-provider/0.1/testing-gsn-applications
      // https://forum.openzeppelin.com/t/advanced-gsn-gsnrecipientsignature-sol/1414

      target = await pToken.new('Test', 'TST', [], { from: owner })
      await target.mint(owner, '1000000000000000000', { from: owner })
      await target.setTrustedSigner(trustedSigner, { from: owner })
      await target.setFeeTarget(feeTarget, { from: owner })

      await fundRecipient(web3, { recipient: target.address, amount: web3.utils.toWei('1') })
      // Create gsn provider and plug it into the recipient
      const gsnProvider = new GSNDevProvider(web3.currentProvider, {
        ownerAddress,
        relayerAddress,
        approveFunction: getApprovalData
      })
      const pToken2 = artifacts.require('pToken')
      pToken2.setProvider(gsnProvider)
      target = await pToken2.at(target.address)
    })
    it('should transfer', async () => {
      const tx = await target.transfer(other, 12345, { from: owner, gas: '50000' })
      expect(tx.receipt.from).to.equal(relayerAddress.toLowerCase())
      expect(tx.receipt.to).to.not.equal(target.address.toLowerCase())
      expect(await target.balanceOf(other)).to.be.bignumber.eq('12345')
    })
    it('should pay fee in token', async () => {
      const tx = await target.transfer(other, 12345, { from: owner, gasPrice: '1', gas: '50000' })
      expect(await target.balanceOf(feeTarget)).to.be.bignumber.greaterThan('150000')
    })
  })
})


