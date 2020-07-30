const {
  curry,
  assoc,
  append,
} = require('ramda')
const {
  ETH_ZERO_ADDRESS,
  CONSTRUCTOR_ARGUMENTS,
  PARSED_CONSTRUCTOR_ARGUMENTS,
} = require('./constants')
const argv = require('yargs').argv

const getDefaultOperatorsArrayConstructorArg = _ =>
  [ETH_ZERO_ADDRESS]

const parseConstructorArgs = _ =>
  Promise.resolve(CONSTRUCTOR_ARGUMENTS.reduce((_acc, _argName) => append(argv[_argName], _acc), []))

const addDefaultOperatorArgToConstructorArgs = _constructorArgs =>
  append(getDefaultOperatorsArrayConstructorArg(), _constructorArgs)

const putParsedConstructorArgsInState = curry((_state, _constructorArgs) =>
  assoc(PARSED_CONSTRUCTOR_ARGUMENTS, _constructorArgs, _state)
)

module.exports.parseConstructorArgsAndPutInState = _state =>
  parseConstructorArgs()
    .then(addDefaultOperatorArgToConstructorArgs)
    .then(putParsedConstructorArgsInState(_state))
