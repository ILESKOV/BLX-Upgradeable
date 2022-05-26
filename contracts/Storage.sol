//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.13;

contract Storage{
    mapping(string => uint) public _uintStorage;
    mapping(string => address) public _addressStorage;
    mapping(string => bool) public _boolStorage;   
    mapping(string => string) public _stringStorage; 
    mapping(string => bytes32) public _bytesStorage; 


    address public owner;
    bool public _initialized;
    mapping(bytes32 => uint)public globalTokenBalance;
    mapping(bytes32 => address)public whitelistedTokens;
    bool internal _paused;

    event TokensDeposit(address indexed _sender,bytes32 indexed _symbol, uint256  indexed _amount);
    event TokensWithdraw(address indexed _sender,bytes32 indexed _symbol, uint256 indexed _amount);
    event TokensTransfer(address indexed _sender, address indexed _recipient, bytes32 indexed _symbol, uint256 _amount);
    event LockCreated(address indexed _sender, address indexed _recipient, bytes32 indexed _symbol, uint256 _amount, uint32 _startTime, uint32 _endTime);
    event ClaimedTokens(address indexed _sender, uint numberOfGivenLock, bytes32 indexed _symbol, uint _amount);


    struct BankAccount {
           uint256 createdAt;
           uint256 totalBalance;
           uint256 availableBalance;
           uint256 lockedBalance;
           uint256 transactionsCount;
           bool isActive;
           }

    struct Lock {
           uint256 startTime;
           uint256 endTime;
           uint256 lockedValue;
           uint256 unlockedValue;
           uint256 claimed;
          }

    mapping(address => BankAccount) public addressToBankAccount;
    mapping(address => Lock[]) public addressToLocks;

}