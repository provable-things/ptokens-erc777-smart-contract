pragma solidity ^0.5.0;

import "@openzeppelin/contracts/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/GSN/GSNRecipient.sol";
import "@openzeppelin/contracts/token/ERC777/ERC777.sol";
import "./AbstractOwnable.sol";

contract ERC777GSN is AbstractOwnable, GSNRecipient, ERC777 {
  using ECDSA for bytes32;
  uint256 constant GSN_RATE_UNIT = 10**18;

  enum GSNErrorCodes {
    INVALID_SIGNER,
    INSUFFICIENT_BALANCE
  }

  address public gsnTrustedSigner;
  address public gsnFeeTarget;
  uint256 public gsnExtraGas = 40000; // the gas cost of _postRelayedCall()

  constructor(
    address _gsnTrustedSigner,
    address _gsnFeeTarget
  )
    public
  {
    require(_gsnTrustedSigner != address(0), "trusted signer is the zero address");
    gsnTrustedSigner = _gsnTrustedSigner;
    require(_gsnFeeTarget != address(0), "fee target is the zero address");
    gsnFeeTarget = _gsnFeeTarget;
  }

  function _msgSender() internal view returns (address payable) {
    return GSNRecipient._msgSender();
  }

  function _msgData() internal view returns (bytes memory) {
    return GSNRecipient._msgData();
  }


  function setTrustedSigner(address _gsnTrustedSigner) public onlyOwner {
    require(_gsnTrustedSigner != address(0), "trusted signer is the zero address");
    gsnTrustedSigner = _gsnTrustedSigner;
  }

  function setFeeTarget(address _gsnFeeTarget) public onlyOwner {
    require(_gsnFeeTarget != address(0), "fee target is the zero address");
    gsnFeeTarget = _gsnFeeTarget;
  }

  function setGSNExtraGas(uint _gsnExtraGas) public onlyOwner {
    gsnExtraGas = _gsnExtraGas;
  }


  /**
 * @dev Ensures that only transactions with a trusted signature can be relayed through the GSN.
 */
  function acceptRelayedCall(
    address relay,
    address from,
    bytes memory encodedFunction,
    uint256 transactionFee,
    uint256 gasPrice,
    uint256 gasLimit,
    uint256 nonce,
    bytes memory approvalData,
    uint256 /* maxPossibleCharge */
  )
    public
    view
    returns (uint256, bytes memory)
  {
    (uint256 feeRate, bytes memory signature) = abi.decode(approvalData, (uint, bytes));
    bytes memory blob = abi.encodePacked(
      feeRate,
      relay,
      from,
      encodedFunction,
      transactionFee,
      gasPrice,
      gasLimit,
      nonce, // Prevents replays on RelayHub
      getHubAddr(), // Prevents replays in multiple RelayHubs
      address(this) // Prevents replays in multiple recipients
    );
    if (keccak256(blob).toEthSignedMessageHash().recover(signature) == gsnTrustedSigner) {
      return _approveRelayedCall(abi.encode(feeRate, from, transactionFee, gasPrice));
    } else {
      return _rejectRelayedCall(uint256(GSNErrorCodes.INVALID_SIGNER));
    }
  }

  function _preRelayedCall(bytes memory context) internal returns (bytes32) {}

  function _postRelayedCall(bytes memory context, bool, uint256 actualCharge, bytes32) internal {
    (uint256 feeRate, address from, uint256 transactionFee, uint256 gasPrice) =
      abi.decode(context, (uint256, address, uint256, uint256));

    // actualCharge is an _estimated_ charge, which assumes postRelayedCall will use all available gas.
    // This implementation's gas cost can be roughly estimated as 10k gas, for the two SSTORE operations in an
    // ERC20 transfer.
    uint256 overestimation = _computeCharge(POST_RELAYED_CALL_MAX_GAS.sub(gsnExtraGas), gasPrice, transactionFee);
    uint fee = actualCharge.sub(overestimation).mul(feeRate).div(GSN_RATE_UNIT);

    if (fee > 0) {
      _send(_msgSender(), from, gsnFeeTarget, fee, "", "", false);
    }
  }
}
