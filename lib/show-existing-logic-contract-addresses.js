/* eslint-disable no-dupe-keys */
const EXISTING_PTOKEN_LOGIC_CONTRACTS = {
  ethereum: {
    'version': 'v1',
    'address': '0x70b2c1b8f364da3e721554be34b8988a0584d0c1',
  },
  bscMainnet: {
    'version': 'v1',
    'address': '0x4fb276defa6c5c7df26e4b8ae53d41223a098886',
  },
  bscMainnet: {
    'version': 'v2',
    'address': '0x7b4111CbE43959369831B232818bF418D5Ff8C90',
  },
  arbitrum: {
    'version': 'v1',
    'address': '0x804999ff1b795296adb3e43ffb27fb137927f679',
  },
  polygon: {
    'version': 'v1',
    'address': '0x1eb02fa1d545cdf8c662996251a3da54209db1ca',
  },
  ropsten: {
    'version': 'v1',
    'address': '0x0f907d6d42222f4193d88dd197191d499f6d5ffb',
  },
  ambrosTestnet: {
    'version': 'v1',
    'address': '0xF246eFee77B634c0B72DE1F64d74feB61F50D971',
  },
  ropsten: {
    'version': 'v2',
    'address': '0xD444180E7746E88eabb6045685e0c1255e57d921',
  },
  interim: {
    'version': 'v2',
    'address': '0xBb2A649538e8d4cC757ff7C4179bbcEDAfb9dAb7',
  },
  arbitrum: {
    'version': 'v2',
    'address': '0x41f86C0a3CeD5b9A28091e65F55cA281e93178E',
  },
}

const showExistingPTokenContractAddresses = _ =>
  Promise.resolve(console.table(EXISTING_PTOKEN_LOGIC_CONTRACTS))

module.exports = { showExistingPTokenContractAddresses }
