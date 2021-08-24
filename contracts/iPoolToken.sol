// SPDX-License-Identifier: MIT

pragma solidity ^0.4.21;

contract iPoolToken {

    function balanceOf(address _owner) public view returns (uint256 balance);

    function transfer(address _to, uint256 _amount) public returns (bool success);

    function issueTokens(address _beneficiary, uint256 _amount) public returns (bool success);

    function getPool() public view returns (address poolAddress, uint256 poolBalance);

    function isPool(address _address) public view returns (bool success);

    /// @notice Event propagated on every executed transaction
    event LogTransfer(address indexed _from, address indexed _to, uint256 _value);

    /// @notice Event propagated when new deposit is made to the pool
    event LogIssue(address indexed _member, uint256 _value);

    /// @notice Event propagated when new address has the most tokens
    event LogNewPool(address indexed _pool, uint256 _value);
}
