pragma solidity ^0.6.2;

/**
 * @title IPReceiver
 * @author pNetwork
 *
 * @dev Interface for contracts excpecting cross-chain data
 */
interface IPReceiver {
    /*
     * @dev Function called when userData.length > 0 when minting the pToken
     *
     * @param userData
     */
    function receiveUserData(bytes calldata userData) external;
}
