pragma solidity ^0.6.2;

import "@openzeppelin/contracts-upgradeable/proxy/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC777/ERC777Upgradeable.sol";


contract PToken is
    Initializable,
    AccessControlUpgradeable,
    ERC777Upgradeable
{
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    event Redeem(
        address indexed redeemer,
        uint256 value,
        string underlyingAssetRecipient
    );

    function initialize(
        string memory tokenName,
        string memory tokenSymbol,
        address[] memory defaultOperators
    ) 
        public {
            __ERC777_init(tokenName, tokenSymbol, defaultOperators);
             _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
             grantRole(MINTER_ROLE, msg.sender);
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
        require(hasRole(MINTER_ROLE, msg.sender), "Caller is not a minter");
        _mint(recipient, value, userData, operatorData);
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
        bytes memory data,
        string memory underlyingAssetRecipient
    )
        public
    {
        _burn(_msgSender(), amount, data, "");
        emit Redeem(msg.sender, amount, underlyingAssetRecipient);
    }

    function operatorRedeem(
        address account,
        uint256 amount,
        bytes calldata data,
        bytes calldata operatorData,
        string calldata underlyingAssetRecipient
    )
        external
    {
        require(
            isOperatorFor(_msgSender(), account),
            "ERC777: caller is not an operator for holder"
        );
        _burn(account, amount, data, operatorData);
        emit Redeem(account, amount, underlyingAssetRecipient);
    }
}
