//SPDX-License-Identifier: Unlicense

pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./Storage.sol";

contract BLXBank is Storage{

    modifier onlyOwner(){
        require(msg.sender == owner, "This function is not public");
        _;
    }

    modifier whenNotPaused(){
        require(!_paused, "Paused at this moment");
        _;
    }
  
    modifier whenPaused(){
        require(_paused, "Not Paused at this moment");
        _;
    }

    modifier ActiveAccount(){
        require(addressToBankAccount[msg.sender].isActive, "Account of sender is not active");
        _; 
    }

    modifier SufficientFunds(uint256 _amount){
        require(addressToBankAccount[msg.sender].availableBalance >= _amount); 
        _;
    }

    function pause() public onlyOwner whenNotPaused{
      _paused = true;
    }
  
    function unPause() public onlyOwner whenPaused{
      _paused = false;
    }

    constructor() {
       initialize(msg.sender);
    }

  function initialize(address _owner) public {
    require(!_initialized, "Already initialized");
    owner = _owner;
    _paused = false;
    _initialized = true;
    }


  function whitelistToken(bytes32 _symbol, address _tokenAddress) external onlyOwner{
    whitelistedTokens[_symbol] = _tokenAddress;
  }

    function activateBankAccount() external{
    require(!addressToBankAccount[msg.sender].isActive, "Account is already active");
    if(addressToBankAccount[msg.sender].createdAt == 0){addressToBankAccount[msg.sender].createdAt = block.timestamp;}
    addressToBankAccount[msg.sender].isActive = true;
  }

  function deactivateBankAccount() external ActiveAccount{
    addressToBankAccount[msg.sender].isActive = false;
  }


  function getDataAboutAccount() external view ActiveAccount returns(BankAccount memory){
    return addressToBankAccount[msg.sender];
  }

  function depositTokens(bytes32 _symbol, uint256 _amount) external whenNotPaused ActiveAccount{
    ERC20(whitelistedTokens[_symbol]).transferFrom(msg.sender, address(this), _amount);
    addressToBankAccount[msg.sender].availableBalance += _amount;
    addressToBankAccount[msg.sender].transactionsCount ++;
    globalTokenBalance[_symbol] += _amount;   
    addressToBankAccount[msg.sender].totalBalance += _amount;
    emit TokensDeposit(msg.sender, _symbol, _amount);
  }

  function withdrawTokens(bytes32 _symbol, uint256 _amount) external ActiveAccount SufficientFunds(_amount){
    addressToBankAccount[msg.sender].availableBalance -= _amount;
    addressToBankAccount[msg.sender].transactionsCount ++;
    globalTokenBalance[_symbol] -= _amount; 
    addressToBankAccount[msg.sender].totalBalance -= _amount;
    ERC20(whitelistedTokens[_symbol]).transfer(msg.sender, _amount);
    emit TokensWithdraw(msg.sender, _symbol, _amount);
  }

  function transferToAnotherAccount(address _recipient, bytes32 _symbol, uint _amount) external ActiveAccount SufficientFunds(_amount){
    require(addressToBankAccount[_recipient].isActive, "Recipient is not active");
    addressToBankAccount[msg.sender].availableBalance -= _amount;
    addressToBankAccount[msg.sender].totalBalance -= _amount;
    addressToBankAccount[msg.sender].transactionsCount ++;    
    addressToBankAccount[_recipient].availableBalance += _amount;
    addressToBankAccount[_recipient].totalBalance += _amount;    
    addressToBankAccount[_recipient].transactionsCount ++; 
    emit TokensTransfer(msg.sender, _recipient, _symbol, _amount);   
  }

  function getGlobalBalanceOfTokens(bytes32 _symbol) external view returns(uint){
    return globalTokenBalance[_symbol];   
  }
  
  function getOwnerAddress() external view returns(address){
    return owner;
  }
}
