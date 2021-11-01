#!/usr/bin/env node

require('dotenv').config()
const { docopt } = require('docopt')
const { version } = require('./package.json')
const { deployPTokenContract } = require('./lib/deploy-ptoken.js')
const { verifyPTokenContract } = require('./lib/verify-ptoken.js')

const HELP_ARG = '--help'
const VERSION_ARG = '--version'
const NETWORK_ARG = '<network>'
const TOOL_NAME = 'ptoken-deployer.js'
const DEPLOY_PTOKEN_CMD = 'deployPToken'
const VERIFY_PTOKEN_CMD = 'verifyPToken'
const DEPLOYED_ADDRESS_ARG = '<deployedAddress>'

const USAGE_INFO = `
❍ pTokens ERC777 Deployer ❍

  Copyright Provable Things 2021
  Questions: greg@oraclize.it

❍ Info:

  A tool to aid with deployments of the upgradeable pToken ERC777 logic contract.

❍ Usage:
  ${TOOL_NAME} ${HELP_ARG}
  ${TOOL_NAME} ${VERSION_ARG}
  ${TOOL_NAME} ${DEPLOY_PTOKEN_CMD}
  ${TOOL_NAME} ${VERIFY_PTOKEN_CMD} ${DEPLOYED_ADDRESS_ARG} ${NETWORK_ARG}

❍ Commands:

  ${DEPLOY_PTOKEN_CMD}          ❍ Deploy the pToken logic contract.
  ${VERIFY_PTOKEN_CMD}          ❍ Verify a deployed pToken logic contract.

❍ Options:
    ${HELP_ARG}              ❍ Show this message.
    ${VERSION_ARG}           ❍ Show version information.
    ${DEPLOYED_ADDRESS_ARG}   ❍ The address the pToken is deployed at.
    ${NETWORK_ARG}           ❍ Network the pToken is deployed on. It must exist in the 'hardhat.config.json'.
`

const main = _ => {
  const CLI_ARGS = docopt(USAGE_INFO, { version })
  if (CLI_ARGS[DEPLOY_PTOKEN_CMD])
    return deployPTokenContract()
  else if (CLI_ARGS[VERIFY_PTOKEN_CMD])
    return verifyPTokenContract(CLI_ARGS[DEPLOYED_ADDRESS_ARG], CLI_ARGS[NETWORK_ARG])
}

main().catch(_err => console.error('✘', _err.message))
