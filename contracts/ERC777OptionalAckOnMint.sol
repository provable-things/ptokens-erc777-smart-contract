pragma solidity ^0.5.0;

import "@openzeppelin/contracts/token/ERC777/ERC777.sol";

contract ERC777OptionalAckOnMint is ERC777 {
  bytes32 constant private TOKENS_RECIPIENT_INTERFACE_HASH =
    0xb281fc8c12954d22544db45de3159a39272895b169a852b314f9cc762e44c53b;

  /**
 * @dev Call to.tokensReceived() if the interface is registered. Reverts if the recipient is a contract but
 * tokensReceived() was not registered for the recipient
 * @param operator address operator requesting the transfer
 * @param from address token holder address
 * @param to address recipient address
 * @param amount uint256 amount of tokens to transfer
 * @param userData bytes extra information provided by the token holder (if any)
 * @param operatorData bytes extra information provided by the operator (if any)
 * @param requireReceptionAck if true, contract recipients are required to implement ERC777TokensRecipient
 */
  function _callTokensReceived(
    address operator,
    address from,
    address to,
    uint256 amount,
    bytes memory userData,
    bytes memory operatorData,
    bool requireReceptionAck
  )
    internal
  {
    address implementer = ERC1820_REGISTRY.getInterfaceImplementer(to, TOKENS_RECIPIENT_INTERFACE_HASH);
    if (implementer != address(0)) {
      IERC777Recipient(implementer).tokensReceived(operator, from, to, amount, userData, operatorData);
    } else if (requireReceptionAck && from != address(0)) {
      require(!to.isContract(), "ERC777: token recipient contract has no implementer for ERC777TokensRecipient");
    }
  }
}
