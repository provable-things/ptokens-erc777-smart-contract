pragma solidity ^0.5.0;

import "@openzeppelin/contracts/token/ERC777/ERC777.sol";
import "@openzeppelin/contracts/access/roles/MinterRole.sol";

contract PTokenERC777Proxy is ERC777, MinterRole {

    event ProxyRedeem(
        address indexed redeemer,
        uint256 value,
        string underlyingAssetRecipient
    );

    constructor(
        string memory _tokenName,
        string memory _tokenSymbol,
        address[] memory _defaultOperators
    ) 
     ERC777(_tokenName, _tokenSymbol, _defaultOperators)
     public
    {
        /**
            hardcoded: to be changed
         */
        addMinter(0xFFcf8FDEE72ac11b5c542428B35EEF5769C409f0);
    }

    function proxyMint(
        address recipient,
        uint256 value,
        bytes memory userData,
        bytes memory operatorData
    )
        public
        onlyMinter()
        returns (bool)
    {
        _mint(
        msg.sender,    
        recipient,
        value,
        userData,
        operatorData
        );
        return true;
    }

    function proxyMint(
        address recipient,
        uint256 value
    )
        external
        returns (bool)
    {
        proxyMint(recipient, value, "", "");
        return true;
    }


   function proxyRedeem(
        uint256 amount,
        string calldata underlyingAssetRecipient
    )
        external
        onlyMinter()
        returns (bool)
    {
        proxyRedeem(amount, "", underlyingAssetRecipient);
        return true;
    }

    function proxyRedeem(
        uint256 amount,
        bytes memory data,
        string memory underlyingAssetRecipient
    )
        onlyMinter()
        public
    {
        _burn(_msgSender(), _msgSender(), amount, data, "");
        emit ProxyRedeem(msg.sender, amount, underlyingAssetRecipient);
    }

    function getProxyAddress() external view returns(address) {
        return address(this);
    }    
}
