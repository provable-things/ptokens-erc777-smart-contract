const {
  has,
  curry,
} = require('ramda')
const argv = require('yargs').argv
const { CONSTRUCTOR_ARGUMENTS } = require('./constants')

const normalizeEthereumAddress = curry((_web3, _address) =>
  _address === '0x'
    ? '0x0000000000000000000000000000000000000000'
    : _web3.utils.toChecksumAddress(_address)
)

module.exports.parseConstructorArguments = _web3 =>
  CONSTRUCTOR_ARGUMENTS
    .map(_argName =>
      _argName === 'default-operators' && Array.isArray(argv[_argName])
        ? argv[_argName].map(normalizeEthereumAddress(_web3))
        : _argName === 'default-operators' && !Array.isArray(argv[_argName])
          ? [ normalizeEthereumAddress(_web3, argv[_argName]) ]
          : argv[_argName]
    )

module.exports.checkCliArgs = _ =>
  Promise.all(
    CONSTRUCTOR_ARGUMENTS
      .map(_argName =>
        has(_argName, argv)
          ? Promise.resolve()
          : Promise.reject({ errMsg: '✘ Missing CLI arg: ' + _argName })
      )
  )
