/* eslint-disable  no-shadow */
const fs = require('fs')
const path = require('path')
const ethers = require('ethers')
const { prop } = require('ramda')
const { getKeyFromObj } = require('./utils')
const { getProvider } = require('./get-provider')
const { checkEndpoint } = require('./check-endpoint')
const { ENDPOINT_ENV_VAR_KEY } = require('./constants')
const { getEthersWallet } = require('./get-ethers-wallet')
const { getEnvConfiguration } = require('./get-env-configuration')
const { deployEthersContract } = require('./deploy-ethers-contract')
const { getEnvironmentVariable } = require('./get-environment-variable')

const getWethArtifact = _ =>
  new Promise((resolve, reject) => {
    const artifactPath = path.resolve(__dirname, '../artifacts/contracts/wEth.sol/WETH9.json')
    const exists = fs.existsSync(artifactPath)
    return exists
      ? resolve(require(artifactPath))
      : reject(new Error(
        `Artifact does not exist @ ${artifactPath}! Run 'npx hardhat compile' to compile contracts!`
      ))
  })

const getWethContractFactory = _wallet =>
  getWethArtifact()
    .then(_artifact => Promise.all([
      getKeyFromObj('wETH Artifact', _artifact, 'abi'),
      getKeyFromObj('wETH Artifact', _artifact, 'bytecode')
    ]))
    .then(([ _abi, _bytecode ]) => new ethers.ContractFactory(_abi, _bytecode, _wallet))

const deployWeth = (_maybeGasPrice = null) =>
  console.info('✔ Deploying wETH contract...') ||
  getEnvConfiguration()
    .then(() => getEnvironmentVariable(ENDPOINT_ENV_VAR_KEY))
    .then(getProvider)
    .then(checkEndpoint)
    .then(getEthersWallet)
    .then(getWethContractFactory)
    .then(_contractFactory => deployEthersContract(_contractFactory, [], _maybeGasPrice))
    .then(_contract => _contract.deployTransaction.wait())
    .then(_receipt => console.info(`✔ Tx Mined! Contract address: ${prop('contractAddress', _receipt)}`))

module.exports = { deployWeth }
