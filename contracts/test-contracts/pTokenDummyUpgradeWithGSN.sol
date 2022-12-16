pragma solidity ^0.6.2;

import "../ERC777GSN.sol";
import "../ERC777Upgradeable.sol";
import "../ERC777WithAdminOperatorUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/EnumerableSetUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

contract PTokenDummyUpgradeWithGSN is
    Initializable,
    AccessControlUpgradeable,
    ERC777Upgradeable,
    ERC777GSNUpgradeable,
    ERC777WithAdminOperatorUpgradeable
{
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes4 public ORIGIN_CHAIN_ID;
    EnumerableSetUpgradeable.AddressSet private TOKENS_RECEIVED_HOOK_WHITELIST;
    mapping(bytes4 => bool) public SUPPORTED_DESTINATION_CHAIN_IDS;

    event Redeem(
        address indexed redeemer,
        uint256 value,
        string underlyingAssetRecipient,
        bytes userData
    );

    function initialize(
        string memory tokenName,
        string memory tokenSymbol,
        address defaultAdmin,
        bytes4 originChainId
    )
        public initializer
    {
        address[] memory defaultOperators;
        __AccessControl_init();
        __ERC777_init(tokenName, tokenSymbol, defaultOperators);
        __ERC777GSNUpgradeable_init(defaultAdmin, defaultAdmin);
        __ERC777WithAdminOperatorUpgradeable_init(defaultAdmin);
        _setupRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
        ORIGIN_CHAIN_ID = originChainId;
    }

    function mint(
        address recipient,
        uint256 value
    )
        external
        returns (bool)
    {
        mint(recipient, value, "", "");
        return true;
    }

    function mint(
        address recipient,
        uint256 value,
        bytes memory userData,
        bytes memory operatorData
    )
        public
        returns (bool)
    {
        require(hasRole(MINTER_ROLE, _msgSender()), "Caller is not a minter");
        // NOTE: The last arg disables the `tokensReceived` hook from being called.
        _mint(recipient, value, userData, operatorData, false);
        return true;
    }

    function redeem(
        uint256 amount,
        string calldata underlyingAssetRecipient
    )
        external
        returns (bool)
    {
        redeem(amount, "", underlyingAssetRecipient);
        return true;
    }

    function redeem(
        uint256 amount,
        bytes memory userData,
        string memory underlyingAssetRecipient
    )
        public
    {
        _burn(_msgSender(), amount, userData, "");
        emit Redeem(_msgSender(), amount, underlyingAssetRecipient, userData);
    }

    function operatorRedeem(
        address account,
        uint256 amount,
        bytes calldata userData,
        bytes calldata operatorData,
        string calldata underlyingAssetRecipient
    )
        external
    {
        require(
            isOperatorFor(_msgSender(), account),
            "ERC777: caller is not an operator for holder"
        );
        _burn(account, amount, userData, operatorData);
        emit Redeem(account, amount, underlyingAssetRecipient, userData);
    }

    function grantMinterRole(address _account) external {
        grantRole(MINTER_ROLE, _account);
    }

    function revokeMinterRole(address _account) external {
        revokeRole(MINTER_ROLE, _account);
    }

    function hasMinterRole(address _account) external view returns (bool) {
        return hasRole(MINTER_ROLE, _account);
    }

    function _msgSender() internal view override(ContextUpgradeable, ERC777GSNUpgradeable) returns (address payable) {
        return GSNRecipientUpgradeable._msgSender();
  }

    function _msgData() internal view override(ContextUpgradeable, ERC777GSNUpgradeable) returns (bytes memory) {
        return GSNRecipientUpgradeable._msgData();
    }

    function theMeaningOfLife() external pure returns(uint256) {
        return 42;
    }
}
