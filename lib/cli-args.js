const { has } = require('ramda')
const argv = require('yargs').argv
const { CONSTRUCTOR_ARGUMENTS } = require('./constants')

module.exports.checkCliArgs = _ =>
  Promise.all(
    CONSTRUCTOR_ARGUMENTS
      .map(_argName =>
        has(_argName, argv)
          ? Promise.resolve()
          : Promise.reject(new Error(`✘ Error! Missing CLI arg: ${_argName}`))
      )
  )
