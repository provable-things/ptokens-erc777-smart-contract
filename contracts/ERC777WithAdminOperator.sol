pragma solidity ^0.5.0;

import "@openzeppelin/contracts/token/ERC777/ERC777.sol";

contract ERC777WithAdminOperator is ERC777 {

  address public adminOperator;

  event AdminOperatorChange(address oldOperator, address newOperator);
  event AdminTransferInvoked(address operator);

  constructor(address _adminOperator) public {
    adminOperator = _adminOperator;
  }

  /**
 * @dev Similar to {IERC777-operatorSend}.
 *
 * Emits {Sent} and {IERC20-Transfer} events.
 */
  function adminTransfer(
    address sender,
    address recipient,
    uint256 amount,
    bytes memory data,
    bytes memory operatorData
  )
  public
  {
    require(_msgSender() == adminOperator, "caller is not the admin operator");
    _send(adminOperator, sender, recipient, amount, data, operatorData, false);
    emit AdminTransferInvoked(adminOperator);
  }

  /**
   * @dev Only the actual admin operator can change the address
   */
  function setAdminOperator(address adminOperator_) public {
    require(msg.sender == adminOperator, "Only the actual admin operator can change the address");
    emit AdminOperatorChange(adminOperator, adminOperator_);
    adminOperator = adminOperator_;
  }


}
