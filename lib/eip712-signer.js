const { getProvider } = require('./get-provider')
const { checkEndpoint } = require('./check-endpoint')
const { ENDPOINT_ENV_VAR_KEY } = require('./constants')
const { getEthersWallet } = require('./get-ethers-wallet')
const { getEnvConfiguration } = require('./get-env-configuration')
const { getEnvironmentVariable } = require('./get-environment-variable')

const EIP712_DOMAIN = {
  name: 'PTokens Debug Signatory',
  version: '1',
  chainId: 1,
  verifyingContract: '0x0000000000000000000000000000000000000000'
}

const EIP712_TYPES = {
  DebugSignatory: [
    { name: 'coreType', type: 'string' },
    { name: 'signerNonce', type: 'uint256' },
    { name: 'signerName', type: 'string' },
    { name: 'signerAddress', type: 'address' },
    { name: 'debugCmdHash', type: 'bytes32' }
  ]
}

const getDataToSign = (_coreType, _signerName, _signerNonce, _address, _debugCommandHash) => ({
  coreType: _coreType,
  signerNonce: _signerNonce,
  signerName: _signerName,
  debugCmdHash: _debugCommandHash,
  signerAddress: _address.toLowerCase(),
})

const signEip712Digest = (_wallet, _coreType, _signerName, _signerNonce, _debugCommandHash) =>
  _wallet._signTypedData(
    EIP712_DOMAIN,
    EIP712_TYPES,
    getDataToSign(_coreType, _signerName, _signerNonce, _wallet.address, _debugCommandHash),
  )

const signDebugCommandHash = (_coreType, _signerName, _signerNonce, _debugCommandHash) =>
  getEnvConfiguration()
    .then(_ => getEnvironmentVariable(ENDPOINT_ENV_VAR_KEY))
    .then(getProvider)
    .then(checkEndpoint)
    .then(getEthersWallet)
    .then(_wallet => signEip712Digest(_wallet, _coreType, _signerName, _signerNonce, _debugCommandHash))
    .then(console.info)

module.exports = { signDebugCommandHash }
