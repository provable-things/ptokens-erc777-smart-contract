const EXISTING_PTOKEN_LOGIC_CONTRACTS = {
  'ethereum': '0xa626ec238a80b5c400e3bf77e046f83a17910786',
  'binance': '0x4fb276defa6c5c7df26e4b8ae53d41223a098886',
  'arbitrum': '0x804999ff1b795296adb3e43ffb27fb137927f679',
  'polygon': '0x1eb02fa1d545cdf8c662996251a3da54209db1ca',
  'ropsten': '0x0f907d6d42222f4193d88dd197191d499f6d5ffb',
  'ambrosTestnet': '0xF246eFee77B634c0B72DE1F64d74feB61F50D971',
}

const showExistingPTokenContractAddresses = _ =>
  Promise.resolve(console.table(EXISTING_PTOKEN_LOGIC_CONTRACTS))

module.exports = { showExistingPTokenContractAddresses }
