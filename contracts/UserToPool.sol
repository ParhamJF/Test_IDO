pragma solidity ^0.4.24;

import "./whiteList.sol";
import "./PoolToken.sol";

contract UserToPool is PoolToken , Whitelist {

    struct PoolUser {
        address user;
        address poolId;
    }

    mapping(address => PoolUser) users;
    address[] public userAccts;

    function addUserToPool(address _user, address _poolId) public returns (bool success) {
        require(isPool(_poolId));
        require(whitelisted(_user));
        var user = users[_user];
        user.user = _user;
        user.poolId = _poolId;
        userAccts.push(_user) -1;
        return true;
    }

    function removeUserToPool(address _user) public returns (bool success) {
        require(whitelisted(_user));
        delete users[_user];
        return true;
    }

    function getUser(address _user) view public returns (address poolId){
        require(isUserInPool(_user));
        return(users[_user].poolId);
    }

    function isUserInPool(address _user) public returns (bool success) {
        if (users[_user].poolId != address(0)){
            return true;
        }
        else {
            return false;
        }
        
    }

    


}