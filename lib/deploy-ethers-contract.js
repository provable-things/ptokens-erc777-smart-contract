const deployEthersContract = (_contractFactory, _constructorArgs = [], _maybeGasPrice = null) =>
  console.info(
    `✔ Deployment tx sent${_maybeGasPrice && ` using gas price ${_maybeGasPrice} gwei`}, awaiting mining...`
  ) ||
  _contractFactory
    .deploy(..._constructorArgs, _maybeGasPrice === null ? {} : { gasPrice: _maybeGasPrice })
    .catch(_err => Promise.reject(new Error(`${_err.message}\n✘ Deployment failed! See above for more info.`)))

module.exports = { deployEthersContract }
