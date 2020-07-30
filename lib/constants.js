const path = require('path')

module.exports = {
  WEB3_STATE_KEY: 'web3',
  ARTIFACT_STATE_KEY: 'artifact',
  TRUFFLE_BUILD_COMMAND: 'npx truffle compile',
  PATH_TO_EXECUTE_FROM: path.resolve(__dirname, './'),
  CONSTRUCTOR_ARGUMENTS: [ 'token-name', 'token-symbol' ],
  PARSED_CONSTRUCTOR_ARGUMENTS: 'parsed-constructor-args',
  RELATIVE_PATH_TO_ARTIFACT: '../build/contracts/PToken.json',
  ETH_ZERO_ADDRESS: '0x0000000000000000000000000000000000000000',
}
