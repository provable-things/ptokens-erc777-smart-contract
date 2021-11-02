/* eslint-disable no-shadow */
const {
  TOKEN_NAME,
  TOKEN_SYMBOL,
  PROXY_ADMIN_ADDRESS,
  CONTRACT_ADMIN_ADDRESS,
  LOGIC_CONTRACT_ADDRESS,
} = require('./test-constants')
const Web3 = require('web3')
const assert = require('assert')
const rewire = require('rewire')
const { silenceConsoleInfoOutput } = require('./test-utils')
const rewiredModule = rewire('../lib/get-encoded-init-args')
const { getEncodedInitArgs } = require('../lib/get-encoded-init-args')
const maybeStripHexPrefix = rewiredModule.__get__('maybeStripHexPrefix')
const encodeProxyConstructorArgs = rewiredModule.__get__('encodeProxyConstructorArgs')
const getEncodedProxyConstructorArgs = rewiredModule.__get__('getEncodedProxyConstructorArgs')

describe('Testing Constructor Arg Encoder...', () => {
  silenceConsoleInfoOutput()
  /* eslint-disable-next-line max-len */
  const EXPECTED_ENCODING = '0x0000000000000000000000000f907d6d42222f4193d88dd197191d499f6d5ffb000000000000000000000000edb86cd455ef3ca43f0e227e00469c3bdfa40628000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000e4077f224a000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000fedfe2616eb3661cb8fed2782f5f0cc91d59dcac000000000000000000000000000000000000000000000000000000000000000b70546f6b656e7320544b4e0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003544b4e000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'

  it('Should get encoded pToken init fxn call', async () => {
    /* eslint-disable-next-line max-len */
    const expectedResult = '0x077f224a000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000fedfe2616eb3661cb8fed2782f5f0cc91d59dcac000000000000000000000000000000000000000000000000000000000000000b70546f6b656e7320544b4e0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003544b4e0000000000000000000000000000000000000000000000000000000000'
    const result = await getEncodedInitArgs(TOKEN_NAME, TOKEN_SYMBOL, CONTRACT_ADMIN_ADDRESS)
    assert.strictEqual(result, expectedResult)
  })

  it('Should get encoded proxy constructor args', async () => {
    const web3 = new Web3()
    const pTokenInitFxnCall = await getEncodedInitArgs(
      TOKEN_NAME,
      TOKEN_SYMBOL,
      CONTRACT_ADMIN_ADDRESS
    )
    const result = await encodeProxyConstructorArgs(
      web3,
      LOGIC_CONTRACT_ADDRESS,
      PROXY_ADMIN_ADDRESS,
      pTokenInitFxnCall,
    )
    assert.strictEqual(result, EXPECTED_ENCODING)
  })

  it('Should get encoded constructor args', async () => {
    const result = await getEncodedProxyConstructorArgs(
      TOKEN_NAME,
      TOKEN_SYMBOL,
      LOGIC_CONTRACT_ADDRESS,
      CONTRACT_ADMIN_ADDRESS,
      PROXY_ADMIN_ADDRESS,
    )
    assert.strictEqual(result, maybeStripHexPrefix(EXPECTED_ENCODING))
  })
})
