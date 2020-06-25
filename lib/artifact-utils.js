const {
  ARTIFACT_STATE_KEY,
  RELATIVE_PATH_TO_ARTIFACT,
} = require('./constants')
const path = require('path')
const { assoc } = require('ramda')
const { existsSync } = require('fs')

const getPathToArtifact = _ => path.resolve(
  __dirname,
  RELATIVE_PATH_TO_ARTIFACT,
)

module.exports.pTokenArtifactExists = _ =>
  existsSync(getPathToArtifact())

module.exports.getArtifactAndPutInState = _state =>
  assoc(ARTIFACT_STATE_KEY, require(getPathToArtifact()), _state)
