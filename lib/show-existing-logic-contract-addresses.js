const EXISTING_PTOKEN_LOGIC_CONTRACTS = [
  { 'version': 'v1', 'chain': 'ethereum', 'address': '0x70b2c1b8f364da3e721554be34b8988a0584d0c1' },
  { 'version': 'v1', 'chain': 'binance', 'address': '0x4fb276defa6c5c7df26e4b8ae53d41223a098886' },
  { 'version': 'v1', 'chain': 'arbitrum', 'address': '0x804999ff1b795296adb3e43ffb27fb137927f679' },
  { 'version': 'v1', 'chain': 'polygon', 'address': '0x1eb02fa1d545cdf8c662996251a3da54209db1ca' },
  { 'version': 'v1', 'chain': 'ropsten', 'address': '0x0f907d6d42222f4193d88dd197191d499f6d5ffb' },
  { 'version': 'v1', 'chain': 'ambrosTestnet', 'address': '0xF246eFee77B634c0B72DE1F64d74feB61F50D971' },
]

const showExistingPTokenContractAddresses = _ =>
  Promise.resolve(console.table(EXISTING_PTOKEN_LOGIC_CONTRACTS))

module.exports = { showExistingPTokenContractAddresses }
