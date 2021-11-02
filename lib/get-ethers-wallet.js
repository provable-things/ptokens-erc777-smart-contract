const {
  curry,
  identity,
  memoizeWith,
} = require('ramda')
const ethers = require('ethers')
const { checkPrivateKey } = require('./check-private-key')
const { PRIVATE_KEY_ENV_VAR_KEY } = require('./constants')
const { getEnvironmentVariable } = require('./get-environment-variable')

const getNewEthersWallet = curry((_provider, _privateKey) => {
  return new ethers.Wallet(_privateKey, _provider)
})

const getEthersWalletMemoized = memoizeWith(identity, (_provider, _privateKey) =>
  console.info('✔ Getting ethers wallet...') ||
  getEnvironmentVariable(PRIVATE_KEY_ENV_VAR_KEY)
    .then(checkPrivateKey)
    .then(getNewEthersWallet(_provider))
    .then(_wallet => console.info('✔ Ethers wallet retrieved!') || _wallet)
    .catch(_err => Promise.reject(new Error(`Error getting wallet from private key: ${_err.message}`)))
)

const getEthersWallet = curry((_privateKey, _provider) =>
  getEthersWalletMemoized(_provider, _privateKey)
)

module.exports = { getEthersWallet }