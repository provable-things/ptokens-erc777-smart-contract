const {
  readFile,
  writeFile,
} = require('fs/promises')
const {
  remove,
  identity,
  memoizeWith,
} = require('ramda')
const path = require('path')
const { exec } = require('child_process')
const { FLATTENED_CONTRACT_FILE_NAME } = require('./constants')

const getFullPathToFlattenedFile = memoizeWith(identity, _ =>
  path.resolve(__dirname, `../${FLATTENED_CONTRACT_FILE_NAME}`)
)

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

const removeAllButOneSPDXLicense = _ => {
  const removeLineWithSPDXLicenseRecursively = _lines => {
    const SPDX_LICENSE_SUBSTRING = 'SPDX-License-Identifier'
    const predicateFxn = _line => _line.includes(SPDX_LICENSE_SUBSTRING)
    return _lines.filter(predicateFxn).length > 1
      ? removeLineWithSPDXLicenseRecursively(remove(_lines.findIndex(predicateFxn), 1, _lines))
      : _lines
  }
  const NEWLINE_DELIMITER = '\n'
  console.info('✔ Removing multiple SPDX license identifiers...')
  return readFile(getFullPathToFlattenedFile())
    .then(_buffer => _buffer.toString())
    .then(_file => _file.split(NEWLINE_DELIMITER))
    .then(removeLineWithSPDXLicenseRecursively)
    .then(_lines => _lines.join(NEWLINE_DELIMITER))
    .then(_updatedFile => writeFile(getFullPathToFlattenedFile(), _updatedFile))
}

const flattenContract = _withGSN =>
  console.info('✔ Flattening contract...') ||
  executeCommand(getFlattenCommand(_withGSN))
    .then(_ => removeAllButOneSPDXLicense())
    .then(_ => console.info(`✔ Contract flattened! You can find it here:\n${getFullPathToFlattenedFile()}`))

module.exports = { flattenContract }
