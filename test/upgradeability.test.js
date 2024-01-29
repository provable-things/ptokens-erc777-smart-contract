const { exec } = require('node:child_process')
const { platform } = require('process')
/* eslint-disable-next-line no-shadow */
const { ethers, upgrades } = require('hardhat')
const { rmSync, unlinkSync, existsSync } = require('fs')

const TEMP_DIR_NAME = 'temp'
const TEMP_DIR_PATH = `./${TEMP_DIR_NAME}`
const CONTRACT_FROM_MASTER_NAME = 'pTokenMaster.sol'
const CONTRACT_FROM_MASTER_PATH = `./contracts/${CONTRACT_FROM_MASTER_NAME}`

const getFlattenedContractFromMasterBranch = _ => {
  // NOTE This giant, unwieldy command might not work if dependencies change in a branch,
  // because we speed up the clone by not coping the `node_modules` dir.
  const cmd = `mkdir ${TEMP_DIR_PATH} && \
  rsync -ax --rsync-path=${TEMP_DIR_PATH} \
  --exclude 'node_modules' --exclude '${TEMP_DIR_NAME}' \
  ./ ${TEMP_DIR_PATH} && \
  cd ${TEMP_DIR_NAME} && \
  ln -sf ../node_modules ./ && \
  git stash && \
  git checkout master && \
  node cli.js flattenContract && \
  mv ./flattened.sol .${CONTRACT_FROM_MASTER_PATH} && \
  sed -i ${platform === 'darwin' ? ' \'\' -e' : ''} 's/contract PToken is/contract \
  PTokenMaster is/g' .${CONTRACT_FROM_MASTER_PATH} && \
  cd ../ && \
  npm run compile && \
  sleep 1`

  return new Promise((resolve, reject) =>
    exec(cmd, { cwd: './' }, (_err, _stdout, _stderr) => _err ? reject(_err) : resolve(_stdout))
  )
}

const maybeCleanupTempDir = _ => {
  if (existsSync(TEMP_DIR_PATH)) {
    console.info('✔ Cleaning up temp dir') ||
    rmSync(TEMP_DIR_PATH, { recursive: true, force: true })
  }
}

const maybeCleanupContractFromMaster = _ => {
  if (existsSync(CONTRACT_FROM_MASTER_PATH)) {
    console.info('✔ Cleaning up contract from master')
    unlinkSync(CONTRACT_FROM_MASTER_PATH)
  }
}

const cleanUp = _ => {
  maybeCleanupTempDir()
  maybeCleanupContractFromMaster()
}

const checkContractIsUpgradeSafeFromMaster = _ =>
  Promise.all([ ethers.getContractFactory('PTokenMaster'), ethers.getContractFactory('PToken') ])
    .then(([ a, b ]) => upgrades.validateUpgrade(a, b))

describe('Testing PToken Contract Upgradeability', () => {
  afterEach(() => cleanUp())

  it('pToken contract should be upgradeable from one in master branch', async () => {
    cleanUp()
    await getFlattenedContractFromMasterBranch()
    await checkContractIsUpgradeSafeFromMaster()
  })
})
