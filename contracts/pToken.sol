pragma solidity ^0.5.0;

import "@openzeppelin/contracts/token/ERC777/ERC777.sol";

contract PToken is ERC777 {

    address public pNetwork;

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
        pNetwork = _msgSender();
    }

    function changePNetwork(
        address newPNetwork
    )
        external
    {
        require(
            _msgSender() == pNetwork,
            "Only the pNetwork can change the `pNetwork` account!"
        );
        require(
            newPNetwork != address(0),
            "pNetwork cannot be the zero address!"
        );
        pNetwork = newPNetwork;
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
        _mint(pNetwork, recipient, value, userData, operatorData);
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
