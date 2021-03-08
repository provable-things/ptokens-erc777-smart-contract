pragma solidity ^0.5.0;

import "@openzeppelin/contracts/token/ERC777/ERC777.sol";
import "@openzeppelin/contracts/access/roles/MinterRole.sol";

contract PTokenERC777Proxy is ERC777, MinterRole {
    event IsMintedEvent(bool _response);
    // add ACL logic
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

    function getProxyAddress() external view returns(address) {
        return address(this);
    }    
}
