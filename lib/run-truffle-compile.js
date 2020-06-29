const {
  PATH_TO_EXECUTE_FROM,
  TRUFFLE_BUILD_COMMAND,
} = require('./constants')
const { has } = require('ramda')
const { exec } = require('child_process')
const { pTokenArtifactExists } = require('./artifact-utils')

const runTruffleCompile = (_command, _pathToExecuteFrom) =>
  new Promise((resolve, reject) => {
    exec(
      _command,
      { cwd: _pathToExecuteFrom },
      (err, stdout, stderr) => {
        if (!err) {
          return resolve(stdout)
        } else if (!has(err.code)) {
          return reject({
            errMsg:
              '✘ Error running command: ' + err +
              '\n✘ No error code came with the error' +
              '\n✘ Command output: ' + stdout
          })
        } else {
          return reject({
            errMsg:
              '✘ Error running command: ' + err +
              '\n✘ Error code: ' + err.code +
              '\n✘ Command output: ' + stdout
          })
        }
      })
  })

module.exports.maybeRunTruffleCompile = _state =>
  pTokenArtifactExists()
    ? Promise.resolve(_state)
    : console.error('✘ LKSC artifact does not exist, compiling it now...') ||
      runTruffleCompile(TRUFFLE_BUILD_COMMAND, PATH_TO_EXECUTE_FROM)
        .then(_ => _state)
