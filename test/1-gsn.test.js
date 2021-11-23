const {
  fixSignaturePerEIP155,
  silenceConsoleInfoOutput,
} = require('./test-utils')
const {
  TOKEN_NAME,
  TOKEN_SYMBOL,
  ORIGIN_CHAIN_ID,
} = require('./test-constants')
const {
  runRelayer,
  fundRecipient,
  deployRelayHub,
} = require('@openzeppelin/gsn-helpers')
const assert = require('assert')
const { BigNumber } = require('ethers')
const Web3Contract = require('web3-eth-contract')
const { getAbi } = require('../lib/get-contract-artifacts')
const { GSNDevProvider } = require('@openzeppelin/gsn-provider')

describe('pToken ERC777GSN Tests', () => {
  silenceConsoleInfoOutput()
  const AMOUNT = 12345
  let relayer,
    otherAddress,
    ownerAddress,
    trustedSigner,
    relayerAddress,
    pTokenContract,
    feeTargetAddress

  before(async () => {
    await deployRelayHub(web3)
    relayer = await runRelayer(web3, { quiet: true })
  })

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

  beforeEach(async () => {
    [ ownerAddress, otherAddress, trustedSigner, feeTargetAddress, relayerAddress ] = await web3.eth.getAccounts()
    const contractFactory = await ethers.getContractFactory('contracts/pToken.sol:PToken')
    const ethersContract = await upgrades.deployProxy(
      contractFactory,
      [TOKEN_NAME, TOKEN_SYMBOL, ownerAddress, ORIGIN_CHAIN_ID],
    )
    pTokenContract = new Web3Contract(await getAbi(), ethersContract.address)
    pTokenContract.setProvider(web3.currentProvider)
    await pTokenContract.methods.grantMinterRole(ownerAddress).send({ from: ownerAddress, gas: 300000 })
    await pTokenContract.methods.mint(ownerAddress, '1000000000000000000').send({ from: ownerAddress })
    await pTokenContract.methods.setTrustedSigner(trustedSigner).send({ from: ownerAddress })
    await pTokenContract.methods.setFeeTarget(feeTargetAddress).send({ from: ownerAddress })
    await fundRecipient(web3, { recipient: pTokenContract._address, amount: web3.utils.toWei('1') })
    const gsnProvider = new GSNDevProvider(
      web3.currentProvider,
      { ownerAddress, relayerAddress, approveFunction: getApprovalData },
    )
    pTokenContract.setProvider(gsnProvider)
  })

  after(() => relayer.kill())

  it('Should transfer via relayer', async () => {
    const tx = await pTokenContract.methods
      .transfer(otherAddress, `${AMOUNT}`)
      .send({ from: ownerAddress, gas: '50000' })
    const contractBalance = await pTokenContract.methods.balanceOf(otherAddress).call()
    assert.strictEqual(contractBalance, `${AMOUNT}`)
    assert.strictEqual(tx.from, relayerAddress.toLowerCase())
    assert.notStrictEqual(tx.to, pTokenContract._address.toLowerCase())
  })

  it('When transferring via relay, it should pay fee in token', async () => {
    await pTokenContract.methods
      .transfer(otherAddress, AMOUNT)
      .send({ from: ownerAddress, gas: '50000' })
    const balance = await pTokenContract.methods.balanceOf(feeTargetAddress).call()
    assert(BigNumber.from(balance).gt(BigNumber.from(15000)))
  })
})
