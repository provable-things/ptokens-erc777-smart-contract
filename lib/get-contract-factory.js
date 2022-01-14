const {
  getAbi,
  getBytecode,
} = require('./get-contract-artifacts')
/* eslint-disable-next-line no-shadow */
const ethers = require('ethers')
const { curry } = require('ramda')

const getContractFactory = (_abi, _bytecode, _wallet) =>
  Promise.resolve(new ethers.ContractFactory(_abi, _bytecode, _wallet))

const getContractFactoryMaybeWithGSN = curry((_withGSN, _wallet) =>
  console.info(`✔ Getting contract factory with${_withGSN === true ? '' : 'out'} GSN...`) ||
  Promise.all([ getAbi(_withGSN), getBytecode(_withGSN) ])
    .then(([ _abi, _bytecode ]) => getContractFactory(_abi, _bytecode, _wallet))
)

module.exports = { getContractFactoryMaybeWithGSN }
