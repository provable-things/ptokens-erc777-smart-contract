const Web3 = require('web3')
const { curry } = require('ramda')

const maybeStripHexPrefix = _hex =>
  _hex.startsWith('0x') ? _hex.slice(2) : _hex

const PTOKEN_INIT_ABI = {
  name: 'initialize',
  signature: '0x077f224a',
  inputs: [
    { internalType: 'string', name: 'tokenName', type: 'string' },
    { internalType: 'string', name: 'tokenSymbol', type: 'string' },
    { internalType: 'address', name: 'defaultAdmin', type: 'address' }
  ],
}

const getEncodedInitArgs = (_tokenName, _tokenSymbol, _contractAdminAddress) =>
  console.info('✔ Encoding pToken initialization arguments...') ||
  new Promise((resolve, reject) => {
    const web3 = new Web3()
    try {
      return resolve(
        web3.eth.abi.encodeFunctionCall(
          PTOKEN_INIT_ABI,
          [ _tokenName, _tokenSymbol, _contractAdminAddress ]
        )
      )
    } catch (_err) {
      return reject(_err)
    }
  })

const encodeProxyConstructorArgs = curry((
  _web3,
  _logicContractAddress,
  _proxyAdminAddress,
  _encodedPTokenInitFxnCall
) =>
  new Promise((resolve, reject) => {
    try {
      return resolve(
        _web3.eth.abi.encodeParameters(
          ['address', 'address', 'bytes'],
          [ _logicContractAddress, _proxyAdminAddress, _encodedPTokenInitFxnCall ]
        )
      )
    } catch (_err) {
      return reject(_err)
    }
  })
)

// NOTE: Because we may want this in future or if we have to manually verify a pToken.
/* eslint-disable-next-line no-unused-vars */
const getEncodedProxyConstructorArgs = (
  _tokenName,
  _tokenSymbol,
  _logicContractAddress,
  _contractAdminAddress,
  _proxyAdmin,
) => {
  const web3 = new Web3()
  return getEncodedInitArgs(_tokenName, _tokenSymbol, _contractAdminAddress)
    .then(encodeProxyConstructorArgs(web3, _logicContractAddress, _proxyAdmin))
    .then(maybeStripHexPrefix)
}

module.exports = { getEncodedInitArgs }
