pragma solidity ^0.5.0;

interface IMinterRegistry {
    function getMinterAddress(string calldata _minterName) external view returns(address _minterAddress);
}