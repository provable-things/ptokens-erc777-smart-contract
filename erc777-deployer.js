#!/usr/bin/env node

require('dotenv').config()
const { docopt } = require('docopt')
const { version } = require('./package.json')


const HELP_ARG = '--help'
const VERSION_ARG = '--version'
const TOOL_NAME = 'erc777-deployer.js'

const USAGE_INFO = `
❍ pTokens ERC777 Deployer ❍

  Copyright Provable Things 2021
  Questions: greg@oraclize.it

❍ Info:

  A tool to aid with deployments of the upgradeable pToken ERC777 logic contract.

❍ Usage:
  ${TOOL_NAME} ${HELP_ARG}
  ${TOOL_NAME} ${VERSION_ARG}

❍ Commands:


❍ Options:
    ${HELP_ARG}              ❍ Show this message.
    ${VERSION_ARG}           ❍ Show version information.
`

const main = _ => {
  const CLI_ARGS = docopt(USAGE_INFO, { version })
}

main()
