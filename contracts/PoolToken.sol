// SPDX-License-Identifier: MIT

pragma solidity ^0.4.21;

import "./SafeMath.sol";
import "./Ownable.sol";
import "./Timed.sol";
import "./iPoolToken.sol";

contract PoolToken is iPoolToken, Ownable, Timed {
    using SafeMath for uint256;

    uint8 public decimals;                //How many decimals to show
    address public currentPool;
    uint256 public totalSupply;
    mapping(address => uint256) public balances;

    mapping(address => bool) public participantsMap;
    address[] public participantsArray;

    function PoolToken(uint256 _deadline) public {
        require(_deadline > block.timestamp);
        deadline = _deadline;
        totalSupply = 0;
        currentPool = msg.sender;
        owner = msg.sender;
    }

    function determineNewPool() internal {
        address pool = participantsArray[0];
        uint arrayLength = participantsArray.length;
        for (uint i=1; i < arrayLength; i++) {
            if (balances[pool] < balances[participantsArray[i]]) {
                pool = participantsArray[i];
            }
        }

        if(currentPool != pool) {
            currentPool = pool;
            emit LogNewPool(pool, balances[pool]);
        }
    }

    function addToParticipants(address _address) internal returns (bool success) {
        if(participantsMap[_address]) {
            return false;
        }
        participantsMap[_address] = true;
        participantsArray.push(_address);
        return true;
    }

    function transfer(address _to, uint256 _value) public onlyWhileOpen returns (bool success) {
        if (balances[msg.sender] < _value || balances[_to] + _value <= balances[_to]) {
            return false;
        }
        addToParticipants(_to);
        balances[msg.sender] = balances[msg.sender].sub(_value);
        balances[_to] = balances[_to].add(_value);

        emit LogTransfer(msg.sender, _to, _value);

        determineNewPool();

        return true;
    }

    function issueTokens(address _beneficiary, uint256 _amount) public onlyOwner onlyWhileOpen returns (bool success) {
        if(balances[_beneficiary] + _amount <= balances[_beneficiary]) {
            return false;
        }
        addToParticipants(_beneficiary);
        balances[_beneficiary] = _amount.add(balances[_beneficiary]);
        totalSupply = _amount.add(totalSupply);

        emit LogIssue(_beneficiary, _amount);

        determineNewPool();

        return true;
    }

    function balanceOf(address _owner) public view returns (uint256 balance) {
        return balances[_owner];
    }

    function isPool(address _address) public view returns (bool success) {
        if (currentPool == _address) {
            return true;
        }
        return false;
    }

    function getPool() public view returns (address poolAddress, uint256 poolBalance) {
        return (currentPool, balances[currentPool]);
    }
}
