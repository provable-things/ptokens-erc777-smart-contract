pragma solidity ^0.6.2;

import {IPReceiver} from "../interfaces/IPReceiver.sol";

contract PReceiver is IPReceiver {
    event UserData(bytes data);

    function receiveUserData(bytes calldata userData) external override {
        emit UserData(userData);
    }
}
