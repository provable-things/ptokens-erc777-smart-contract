pragma solidity ^0.5.0;

import "@openzeppelin/contracts/ownership/Ownable.sol";

contract MinterRegistry is Ownable {
    mapping(string => address) private minters;

    constructor(
        string memory _allowedMinterName, 
        address _allowedMinterAddress
    ) public {
        minters[_allowedMinterName] = _allowedMinterAddress;
    }

    function addMinterToRegistry(
        string calldata _allowedMinterName, 
        address _allowedMinterAddress
    )
    external
    onlyOwner() {
        minters[_allowedMinterName] = _allowedMinterAddress;
    }

    function deleteMinterFromRegistry(
        string calldata _allowedMinterName
    )
    external
    onlyOwner() {
        require(minters[_allowedMinterName] != address(0), "NON_EXISTENT_MINTER");
        delete minters[_allowedMinterName];
    }

    function getMinterAddress(string calldata _minterName) external view returns(address _minterAddress) {
        return minters[_minterName];
    }
}
