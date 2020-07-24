pragma solidity ^0.5.0;

contract AbstractOwnable {
  /**
   * @dev Returns the address of the current owner.
   */
  function owner() internal view returns (address);

  /**
   * @dev Throws if called by any account other than the owner.
   */
  modifier onlyOwner() {
    require(isOwner(), "Caller is not the owner");
    _;
  }

  /**
   * @dev Returns true if the caller is the current owner.
   */
  function isOwner() internal view returns (bool) {
    return msg.sender == owner();
  }

}
