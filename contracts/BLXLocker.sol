//SPDX-License-Identifier: Unlicense

pragma solidity ^0.8.13;

import "./BLXBank.sol";
contract BLXLocker is BLXBank{

function createTheLock(address _assignedAddress,
                       uint32 _startTime, 
                       uint32 _endTime, 
                       bytes32 _symbol,
                       uint _value) external ActiveAccount SufficientFunds(_value){
    require(addressToBankAccount[_assignedAddress].isActive, "Recipient is not active");
    addressToLocks[_assignedAddress].push(Lock(_startTime, _endTime, _value,0,0));

    addressToBankAccount[msg.sender].availableBalance -= _value;
    addressToBankAccount[msg.sender].totalBalance -= _value;
    addressToBankAccount[_assignedAddress].lockedBalance += _value;  
    addressToBankAccount[_assignedAddress].totalBalance += _value; 
    emit LockCreated(msg.sender, _assignedAddress, _symbol, _value, _startTime, _endTime);
    }

function getAllLocksForSender() external view returns(Lock[] memory){
    return addressToLocks[msg.sender];
    }

function getUnlockedAmountForLock(uint numberOfGivenLock) public returns(uint){
    Lock memory lock = addressToLocks[msg.sender][numberOfGivenLock]; 
    if(lock.unlockedValue == 0 && block.timestamp >= lock.endTime){
        addressToLocks[msg.sender][numberOfGivenLock].unlockedValue = lock.lockedValue;
        addressToBankAccount[msg.sender].lockedBalance -= lock.lockedValue;
        addressToLocks[msg.sender][numberOfGivenLock].lockedValue = 0;
        return addressToLocks[msg.sender][numberOfGivenLock].unlockedValue;
        }
    else {
        return addressToLocks[msg.sender][numberOfGivenLock].unlockedValue;
    }
}

function getClaimedAmountForLock(uint numberOfGivenLock) external view returns(uint){
    Lock memory lock = addressToLocks[msg.sender][numberOfGivenLock]; 
       return lock.claimed;
}

function getAllLockedBalance() external view returns(uint){
    return addressToBankAccount[msg.sender].lockedBalance;
}

function claimUnlockedValue(uint _numberOfGivenLock, bytes32 _symbol, uint _amount) external{
    getUnlockedAmountForLock(_numberOfGivenLock);
    if(addressToLocks[msg.sender][_numberOfGivenLock].unlockedValue > 0){
        require(addressToLocks[msg.sender][_numberOfGivenLock].unlockedValue >= _amount, "Insuficcent funds");   
        addressToLocks[msg.sender][_numberOfGivenLock].unlockedValue -= _amount;
        addressToLocks[msg.sender][_numberOfGivenLock].claimed += _amount;
        addressToBankAccount[msg.sender].availableBalance += _amount;
        addressToBankAccount[msg.sender].transactionsCount ++;
        emit ClaimedTokens(msg.sender, _numberOfGivenLock, _symbol, _amount);
    }else revert("Not available yet");
}

}