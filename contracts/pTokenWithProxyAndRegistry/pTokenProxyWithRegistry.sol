pragma solidity ^0.5.0;

import "@openzeppelin/contracts/token/ERC777/ERC777.sol";
import "@openzeppelin/contracts/access/roles/MinterRole.sol";
import "./interfaces/IMinterRegistry.sol";

contract PTokenERC777ProxyWithRegistry is ERC777, MinterRole {
    IMinterRegistry public minterRegistry;

    constructor(
        string memory _tokenName,
        string memory _tokenSymbol,
        address[] memory _defaultOperators,
        address _minterRegistryAddress
    ) 
     ERC777(_tokenName, _tokenSymbol, _defaultOperators)
     public
    {
        minterRegistry = IMinterRegistry(_minterRegistryAddress);
        require(minterRegistry.getMinterAddress("opium") != address(0));
        addMinter(minterRegistry.getMinterAddress("opium"));
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

    function addMinter(string memory _minterName) public returns(bool) {
        address minterAddress = minterRegistry.getMinterAddress(_minterName);
        require(minterAddress != address(0), "MINTER_NOT_ALLOWED");
        _addMinter(minterAddress);
    }

    function renounceMinter(string memory _minterName) public {
        address minterAddress = minterRegistry.getMinterAddress(_minterName);
        require(minterAddress == address(0), "MINTER_NOT_ALLOWED");
        _removeMinter(msg.sender);
    }
}
