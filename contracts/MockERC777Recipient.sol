pragma solidity ^0.5.0;

import "@openzeppelin/contracts/token/ERC777/IERC777.sol";
import "@openzeppelin/contracts/introspection/IERC1820Registry.sol";
import "@openzeppelin/contracts/token/ERC777/IERC777Recipient.sol";

contract Mock777Recipient is IERC777Recipient {
  IERC1820Registry private _erc1820 = IERC1820Registry(0x1820a4B7618BdE71Dce8cdc73aAB6C95905faD24);
  bytes32 constant private TOKENS_RECIPIENT_INTERFACE_HASH = keccak256("ERC777TokensRecipient");

  event TokensReceivedCallback(address operator, address from, address to, uint256 amount, bytes userData, bytes operatorData);

  bool public tokenReceivedCalled;

  function initERC1820() public {
    _erc1820.setInterfaceImplementer(address(this), TOKENS_RECIPIENT_INTERFACE_HASH, address(this));
  }

  function tokensReceived(
    address operator,
    address from,
    address to,
    uint256 amount,
    bytes calldata userData,
    bytes calldata operatorData
  ) external {
    emit TokensReceivedCallback(operator, from, to, amount, userData, operatorData);
    tokenReceivedCalled = true;
  }
}
