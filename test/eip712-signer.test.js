/* eslint-disable-next-line no-shadow */
const ethers = require('ethers')
const assert = require('assert')
const rewire = require('rewire')
const rewiredMod = rewire('../lib/eip712-signer')
const EIP712_TYPES = rewiredMod.__get__('EIP712_TYPES')
const EIP712_DOMAIN = rewiredMod.__get__('EIP712_DOMAIN')
const getDataToSign = rewiredMod.__get__('getDataToSign')
const signEip712Digest = rewiredMod.__get__('signEip712Digest')

describe('Debug Command Hash Signer', () => {
  const SIGNER_NONCE = 0
  const CORE_TYPE = 'BTC_ON_INT'
  const SIGNER_NAME = 'Some signer name'
  const SIGNER_ADDRESS = '0xfEDFe2616EB3661CB8FEd2782F5F0cC91D59DCaC'
  // NOTE: A `DEBUG_COMMAND_HASH` is the digest of a set of arguments to run a debug function
  // in a ptoken core.
  const DEBUG_COMMAND_HASH = '0xed0568d9281086a914e10ee97eb5526e059683b8d6e4f922648e71d30cd794f1'

  it('Should get typed data digest', () => {
    const dataToSign = getDataToSign(CORE_TYPE, SIGNER_NAME, SIGNER_NONCE, SIGNER_ADDRESS, DEBUG_COMMAND_HASH)
    const result = ethers.utils._TypedDataEncoder.hash(EIP712_DOMAIN, EIP712_TYPES, dataToSign)
    // NOTE: Expected result is from the encoder in the ptokens-core, which use zero address as the signer address.
    const expectedResult = '0xe6dfc2ae5d619ba28e40c0778982d7ffb15bb081053d549372a98fc81c367b21'
    assert.strictEqual(result, expectedResult)
  })

  it('Should sign debug command hash', async () => {
    const privateKey = '0x1a19efff597d68186bf41da2f57a90c550258d4ebfbee5d17f265f1ef89c842f'
    const wallet = new ethers.Wallet(privateKey)
    // NOTE: Expected result is from the ptokens-core.
    const result = await signEip712Digest(wallet, CORE_TYPE, SIGNER_NAME, SIGNER_NONCE, DEBUG_COMMAND_HASH)
    /* eslint-disable-next-line max-len */
    const expectedResult = '0x7ee719e38908f63a26aca7a3957b7573156e01e9a853ada12ae877789d4c95a06334c13f397b050a5318867325cf60ebdcce1145c9f786ca522cb3d9bc9ab5a91b'
    assert.strictEqual(result, expectedResult)
  })
})
