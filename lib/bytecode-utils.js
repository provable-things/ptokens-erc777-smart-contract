const {
  WEB3_STATE_KEY,
  ARTIFACT_STATE_KEY,
  PARSED_CONSTRUCTOR_ARGUMENTS,
} = require('./constants')

module.exports.getByteCode = _state =>
  new _state[WEB3_STATE_KEY]
    .eth
    .Contract(_state[ARTIFACT_STATE_KEY].abi)
    .deploy({ data: _state[ARTIFACT_STATE_KEY].bytecode, arguments: [..._state[PARSED_CONSTRUCTOR_ARGUMENTS]] })
    .encodeABI()
    .slice(2)
