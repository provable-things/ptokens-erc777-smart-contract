pragma solidity ^0.6.2;

import "@openzeppelin/contracts-upgradeable/proxy/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC777/ERC777Upgradeable.sol";
// import "./ERC777GSN.sol";
// import "./ERC777WithAdminOperator.sol";
// import "./ERC777OptionalAckOnMint.sol";



contract PToken is
    Initializable,
    OwnableUpgradeable,
    ERC777Upgradeable
{

    address public pNetwork;

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
        require(
            _msgSender() == pNetwork,
            "Only the pNetwork can mint tokens!"
        );
        require(
            recipient != address(0),
            "pToken: Cannot mint to the zero address!"
        );
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
