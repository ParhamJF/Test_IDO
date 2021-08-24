// SPDX-License-Identifier: MIT

pragma solidity ^0.4.21;

import "./Pool.sol";
import "./Ownable.sol";
import "./iPoolApp.sol";

contract PoolApp is iPoolApp {

    function PoolApp() public {
    }

    function createPool(string _name, uint256 _rate, uint256 _deadline) external returns (bool success) {
        address newPoolAddress = new Pool(_name, _rate, _deadline);

        emit LogPoolCreated(newPoolAddress, msg.sender, _name, _rate, _deadline);
        return true;
    }
}
