module.exports = {
  networks: {
    development: {
      port: 8545,
      network_id: '*',
      websockets: true,
      host: '127.0.0.1',
    },
  },
  compilers: {
    solc: {
      version: '0.6.2',
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        }
      }
    }
  }
}
