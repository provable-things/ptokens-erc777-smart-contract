const path = require('path')
const { readFileSync } = require('fs')
const { exec } = require('child_process')
const { checkEthAddress } = require('./utils')
const { ETHERSCAN_ENV_VAR_KEY } = require('./constants')
const { checkEnvironmentVariableExists } = require('./get-environment-variable')

const HARDHAT_CONFIG_FILE_NAME = 'hardhat.config.js'

const getVerificationCommand = (_address, _network, _withGSN = true) => {
  const GSNSuffix = _withGSN ? '' : 'NoGSN'
  console.info(`✔ Getting verification command with${_withGSN ? '' : 'out'} GSN...`)
  return `npx hardhat verify --contract contracts/pToken${
    GSNSuffix
  }.sol:PToken${
    GSNSuffix
  } --network ${_network} ${_address}`
}

const executeVerificationCommand = _cmd =>
  console.info('✔ Executing verification command...') ||
  new Promise((resolve, reject) =>
    exec(_cmd, (_err, _stdout, _stderr) => _err ? reject(_err) : _stderr ? reject(_stderr) : resolve(_stdout))
  )

const getHardhatConfig = _ =>
  new Promise((resolve, reject) => {
    try {
      const config = readFileSync(path.resolve(__dirname, `../${HARDHAT_CONFIG_FILE_NAME}`)).toString()
      return resolve(config)
    } catch (_err) {
      return reject(_err)
    }
  })

const checkNetwork = _network =>
  console.info('✔ Checking network exists in hardhat config...') ||
  getHardhatConfig()
    .then(_configString =>
      _configString.includes(_network)
        ? console.info('✔ Network exists in config!') || _network
        : Promise.reject(new Error(`✘ '${_network}' does NOT exist in '${HARDHAT_CONFIG_FILE_NAME}'!`))
    )

const verifyContract = (_address, _network, _withGSN) =>
  console.info('✔ Verifying contract...') ||
  checkEthAddress(_address)
    .then(_ => checkNetwork(_network))
    .then(_ => checkEnvironmentVariableExists(ETHERSCAN_ENV_VAR_KEY))
    .then(_ => getVerificationCommand(_address, _network, _withGSN))
    .then(executeVerificationCommand)
    .then(console.info)
    .catch(_err =>
      _err.message.includes('etherscan.apiKey.trim is not a function')
        ? Promise.reject(new Error(
          `Please set a valid etherscan API key via the environment variable '${ETHERSCAN_ENV_VAR_KEY}'!`
        ))
        : Promise.reject(_err)
    )

module.exports = { verifyContract }
