#!/usr/bin/env node
const { checkCliArgs } = require('./lib/cli-args')
const { getByteCode } = require('./lib/bytecode-utils')
const { getWeb3AndPutInState } = require('./lib/get-web3')
const { getArtifactAndPutInState } = require('./lib/artifact-utils')
const { runTruffleCompileAndReturnState } = require('./lib/run-truffle-compile')
const { parseConstructorArgsAndPutInState } = require('./lib/parse-constructor-args')

const main = _ =>
  checkCliArgs()
    .then(getWeb3AndPutInState)
    .then(parseConstructorArgsAndPutInState)
    .then(runTruffleCompileAndReturnState)
    .then(getArtifactAndPutInState)
    .then(getByteCode)
    .then(console.info)
    .catch(_err => console.error(_err.message) || process.exit(1))

main()
