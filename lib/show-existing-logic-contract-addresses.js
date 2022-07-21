/* eslint-disable no-dupe-keys */
const EXISTING_PTOKEN_LOGIC_CONTRACTS = [
  {
    'chain': 'ethMainnet',
    'version': 'v1',
    'address': '0x70b2c1b8f364da3e721554be34b8988a0584d0c1',
  },
  {
    'chain': 'ethMainnet',
    'version': 'v2',
    'address': '0xA990A66bC8Db3Bd07Eb1b1d73C5c3009739c4505',
  },
  {
    'chain': 'bscMainnet',
    'version': 'v1',
    'address': '0x4fb276defa6c5c7df26e4b8ae53d41223a098886',
  },
  {
    'chain': 'bscMainnet',
    'version': 'v2',
    'address': '0x7b4111CbE43959369831B232818bF418D5Ff8C90',
  },
  {
    'chain': 'arbitrum',
    'version': 'v1',
    'address': '0x804999ff1b795296adb3e43ffb27fb137927f679',
  },
  {
    'chain': 'polygon',
    'version': 'v1',
    'address': '0x1eb02fa1d545cdf8c662996251a3da54209db1ca',
  },
  {
    'chain': 'ropsten',
    'version': 'v1',
    'address': '0x0f907d6d42222f4193d88dd197191d499f6d5ffb',
  },
  {
    'chain': 'ambrosTestnet',
    'version': 'v1',
    'address': '0xF246eFee77B634c0B72DE1F64d74feB61F50D971',
  },
  {
    'chain': 'ropsten',
    'version': 'v2',
    'address': '0xD444180E7746E88eabb6045685e0c1255e57d921',
  },
  {
    'chain': 'interim',
    'version': 'v2',
    'address': '0xBb2A649538e8d4cC757ff7C4179bbcEDAfb9dAb7',
  },
  {
    'chain': 'arbitrum',
    'version': 'v2',
    'address': '0x41f86C0a3CeD5b9A28091e65F55cA281e93178E',
  },
  {
    'chain': 'polygon',
    'version': 'v2',
    'address': '0x63D07f504D548e041b38cDBf267eFc595E4933c3',
  },
  {
    'chain': 'fantom',
    'version': 'v2',
    'address': '0x46204f9F5F21DC65E37dc7bE3AD8F72E324876bd',
  },
]

const showExistingPTokenContractAddresses = _ =>
  Promise.resolve(console.table(EXISTING_PTOKEN_LOGIC_CONTRACTS))

module.exports = { showExistingPTokenContractAddresses }
