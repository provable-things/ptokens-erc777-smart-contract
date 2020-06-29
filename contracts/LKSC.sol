pragma solidity ^0.5.0;

import "@openzeppelin/contracts/token/ERC777/ERC777.sol";

contract LKSC is ERC777 {

    address public owner;

    event Redeem(
        address indexed redeemer,
        uint256 value,
        string underlyingAssetRecipient
    );

    constructor(
        string memory tokenName,
        string memory tokenSymbol,
        address[] memory defaultOperators
    )
        ERC777(tokenName, tokenSymbol, defaultOperators)
        public
    {
        owner = _msgSender();
    }

    function changeOwner(
        address newOwner
    )
        external
    {
        require(
            _msgSender() == owner,
            "Only the owner can change the `owner` account!"
        );
        require(
            _msgSender() != address(0),
            "owner cannot be the zero address!"
        );
        owner = newOwner;
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
            _msgSender() == owner,
            "Only the owner can mint tokens!"
        );
        require(
            recipient != address(0),
            "Cannot mint to the zero address!"
        );
        _mint(owner, recipient, value, userData, operatorData);
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
        _burn(_msgSender(), _msgSender(), amount, data, "");
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
        _burn(_msgSender(), account, amount, data, operatorData);
        emit Redeem(account, amount, underlyingAssetRecipient);
    }
}