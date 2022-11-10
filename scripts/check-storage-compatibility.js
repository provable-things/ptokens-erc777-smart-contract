/* eslint-disable-next-line no-shadow */
const { ethers, upgrades } = require('hardhat')

const getContractNameFromCliArgs = _ =>
  new Promise((resolve, reject) => {
    if (process.argv.length <= 2) {
      return reject(new Error('Could not find env arg for contract name!'))
    } else {
      const contractName = process.argv[2]
      console.info(`✔ Finding contract called '${contractName}'...`)
      return resolve(contractName)
    }
  })

// NOTE: This script accepts a contract name (which contract MUST exist in the `./contracts/` dir!)
// passed in via a command line arg. The script then compares that contract to the latest version of
// the pToken contract in this repo to check for storage incompatibilities.
//
// USAGE:
// `npm run checkStorageCompatibility <contractNameWithNoFileTypeExtension>`

const main = _ =>
  getContractNameFromCliArgs()
    .then(_previousContract =>
      Promise.all([
        ethers.getContractFactory(_previousContract),
        ethers.getContractFactory('PToken')
      ])
    )
    .then(([ a, b ]) => {
      console.info('✔ Contracts retreived! Checking compatibility...')
      return upgrades.validateUpgrade(a, b)
    })
    .then(_ => console.info('✔ Storage IS compatible!'))
    .catch(_err => {
      if (_err.message.includes('HH700')) {
        console.info('✘ Could not find contract! Make sure it exists in the `./contracts` dir!')
      }
      return Promise.reject(_err)
    })

main().catch(console.error)
