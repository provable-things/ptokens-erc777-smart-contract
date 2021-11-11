const path = require('path')
const { exec } = require('child_process')
const { FLATTENED_CONTRACT_FILE_NAME } = require('./constants')

const getFullPathToFlattenedFile = _ =>
  path.resolve(__dirname, `../${FLATTENED_CONTRACT_FILE_NAME}`)

const getFlattenCommand = _withGSN =>
  console.info(`✔ Getting flatten command for contract with${_withGSN ? '' : 'out'} GSN...`) ||
  `truffle-flattener ${
    path.resolve(__dirname, `../contracts/pToken${_withGSN ? '' : 'NoGSN'}.sol`)
  } > ${
    getFullPathToFlattenedFile()
  }`

const executeCommand = _cmd =>
  console.info('✔ Executing flatten command...') ||
  new Promise((resolve, reject) => exec(_cmd, (_err, _stdout) => _err ? reject(_err) : resolve(_stdout)))

const flattenContract = _withGSN =>
  console.info('✔ Flattening contract...') ||
  executeCommand(getFlattenCommand(_withGSN))
    .then(_ => console.info(`✔ Contract flattened! You can find it here:\n${getFullPathToFlattenedFile()}`))

module.exports = { flattenContract }
