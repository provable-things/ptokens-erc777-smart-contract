const fs = require('fs')
const path = require('path')
const { getKeyFromObj } = require('./utils')

const ARTIFACT_OBJECT_NAME = 'Contract artifact'

const getFullPathToArtifact = _withGSN =>
  path.resolve(
    __dirname,
    `../artifacts/contracts/pToken${_withGSN ? '' : 'NoGSN'}.sol/PToken${_withGSN ? '' : 'NoGSN'}.json`,
  )

const getArtifact = _path =>
  new Promise((resolve, reject) => {
    const exists = fs.existsSync(_path)
    return exists
      ? resolve(require(_path))
      : reject(new Error(`Artifact does not exist @ ${_path}! Run 'npx hardhat compile' to compile contracts!`))
  })

const getKeyFromArtifactObj = (_key, _withGSN) =>
  getArtifact(getFullPathToArtifact(_withGSN))
    .then(_artifact => getKeyFromObj(ARTIFACT_OBJECT_NAME, _artifact, _key))

const getAbi = (_withGSN = true) => {
  const key = 'abi'
  console.info(`✔ Getting ${key} with${_withGSN ? '' : 'out'} GSN...`)
  return getKeyFromArtifactObj(key, _withGSN)
}

const getBytecode = (_withGSN = true) => {
  const key = 'bytecode'
  console.info(`✔ Getting ${key} with${_withGSN ? '' : 'out'} GSN...`)
  return getKeyFromArtifactObj(key, _withGSN)
}

module.exports = {
  getBytecode,
  getAbi,
}
