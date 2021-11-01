#!/usr/bin/env node

require('dotenv').config()
const { docopt } = require('docopt')
const { version } = require('./package.json')
const { deployPTokenContract } = require('./lib/deploy-ptoken.js')

const HELP_ARG = '--help'
const VERSION_ARG = '--version'
const TOOL_NAME = 'erc777-deployer.js'
const DEPLOY_PTOKEN_CMD = 'deployPToken'

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

❍ Commands:

  ${DEPLOY_PTOKEN_CMD}          ❍ Deploy the pToken logic contract.

❍ Options:
    ${HELP_ARG}              ❍ Show this message.
    ${VERSION_ARG}           ❍ Show version information.
    ${DEPLOY_PTOKEN_CMD}        ❍ Deploy the pToken logic contract.
`

const main = _ => {
  const CLI_ARGS = docopt(USAGE_INFO, { version })
  if (CLI_ARGS[DEPLOY_PTOKEN_CMD]) return deployPTokenContract()
}

main().catch(_err => console.error('✘', _err.message))
