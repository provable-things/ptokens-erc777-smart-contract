const { has } = require('ramda')
const { checkCliArgs } = require('./lib/cli-args')
const { getByteCode } = require('./lib/bytecode-utils')
const { getWeb3AndPutInState } = require('./lib/get-web3')
const { getArtifactAndPutInState } = require('./lib/artifact-utils')
const { maybeRunTruffleCompile } = require('./lib/run-truffle-compile')

const main = _ =>
  checkCliArgs()
    .then(getWeb3AndPutInState)
    .then(maybeRunTruffleCompile)
    .then(getArtifactAndPutInState)
    .then(getByteCode)
    .then(console.info)
    .catch(_err =>
      has('errMsg', _err)
        ? console.error(_err.errMsg)
        : console.error('✘ Unexpected error: ' + _err)
    )

main()
