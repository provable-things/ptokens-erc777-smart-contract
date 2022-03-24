const assert = require('assert')
const rewire = require('rewire')
const rewiredMod = rewire('../lib/sign-message')

describe('Message Signer Tests', () => {
  it('Should sign message correctly', async () => {
    const signMessageWithWallet = rewiredMod.__get__('signMessageWithWallet')
    const message = 'message to sign'
    const pk = 'decaff0ffeedecaff0ffeedecaff0ffeedecaff0ffeedecaff0ffeedecaff0ff'
    const wallet = new ethers.Wallet(pk)
    const result = JSON.stringify(await signMessageWithWallet(message, wallet))
    /* eslint-disable-next-line max-len */
    const expectedResult = '{"msg":"message to sign","version":"2","sig":"0x302b8e1992803eb16b57bd2365f5b40b5601144cedc5146121376112538212fc2ff6ab59637a3730476077dd83bbb1789e709e484adeb085376ebba8cd14f4361c","address":"0xe9d4330c9e2E8CEBc4266A83cd53da3A34620a45"}'
    assert.strictEqual(result, expectedResult)
  })
})
