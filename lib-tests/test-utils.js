/* eslint-disable-next-line no-return-assign */
const silenceConsoleInfoOutput = _ =>
  /* eslint-disable-next-line no-empty-function */
  console.info = __ => {}

module.exports = { silenceConsoleInfoOutput }
