const { exec } = require('node:child_process')
const { rmSync, unlinkSync, existsSync } = require('fs')

const TEMP_DIR_NAME = 'temp'
const TEMP_DIR_PATH = `./${TEMP_DIR_NAME}`
const FLATTENED_CONTRACT_PATH = './contracts/flattened.sol'

const getFlattenedContractFromMasterBranch = _ =>
  new Promise((resolve, reject) => {
    // NOTE: It's a bit unweildly I know...
    const command =
      `mkdir ${TEMP_DIR_PATH} && \
      rsync -ax --rsync-path=${TEMP_DIR_PATH} \
      --exclude 'node_modules' --exclude '${TEMP_DIR_NAME}' \
      ./ ${TEMP_DIR_PATH} && \
      cd temp && \
      ln -sf ../node_modules ./ && \
      git checkout master && \
      node cli.js flattenContract && \
      mv ./flattened.sol ../contracts && \
      sed -i 's/contract PToken is/contract PTokenMaster is/g' ../contracts/flattened.sol`

    return exec(command, { cwd: './' }, (_err, _stdout, _stderr) => {
      return _err ? reject(_err) : resolve(_stdout)
    })
  })

const maybeCleanupTempDir = _ => {
  if (existsSync(FLATTENED_CONTRACT_PATH)) {
    console.info('✔ Cleaning up flattened contract!')
    unlinkSync(FLATTENED_CONTRACT_PATH)
  }
  return
}

const maybeCleanupFlattenedContract = _ => {
  if (existsSync(TEMP_DIR_PATH)) {
    console.info('✔ Cleaning up temp dir') ||
    rmSync(TEMP_DIR_PATH, { recursive: true, force: true })
  }
  return
}

const cleanUp = _ => {
  maybeCleanupTempDir()
  maybeCleanupFlattenedContract()
}

describe('Testing Upgradeability', () => {
  it.only('Contract should be upgradeable from one in master branch', async () => {
    cleanUp()

    // NOTE Might not work if dependencies change in a branch
    await getFlattenedContractFromMasterBranch()

    cleanUp()
  })
})
