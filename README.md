# BLX Bank

## Introduction
Example of Upgradeable Smart Contract


## Environment

### Engines versions
- [Node](https://nodejs.org/en/): **16.X.X** (`node -v`)
- [yarn](https://yarnpkg.com/): (`npm install -g yarn`)

### Scripts
You will need to use [npm](https://www.npmjs.com/) scripts to run and test this application.

#### Environment
This exercise is done in [Solidity](https://docs.soliditylang.org/)**. The development environment to compile, deploy, test and run the code provided by [hardhat](https://hardhat.org/) is already configured.

#### Tools and libraries
The tools and libraries listed below are already set-up for you. 
- [Hardhat](https://hardhat.org/getting-started/): development environment to compile, deploy, test, and debug your Ethereum software
- [Ethers.js](https://docs.ethers.io/v5/): a JavaScript library to interact with Ethereum
- [Waffle](https://getwaffle.io/): a library for testing smart contracts.
- [Chai](https://chaijs.com): a BDD/TDD assertion library
- [Solhint](https://protofire.github.io/solhint/): a Solidity linter

## Tasks
- [x] Feature work as expected
- [x] Tests have been written
- [x] Quality controls are passed

### #1 - BLX Token [easy]

BLXToken.sol is ERC20 token contract with `BLX` symbol, `Bloxify Token` name, and `18` decimals. <br />
Token is transferable and mintable. <br />

### All user stories:

1. User can get meta-information about the token - name, symbol, total supply, and decimals
    - methods: `name()`, `symbol()`, `totalSupply()`, `decimals()`
2. User can get information about the balance of a given address
    - method: `balanceOf(address)`
3. User is able to mint any number of tokens for himself
    - method: `mint(uint256)`
4. User is able to transfer any number of currently owned tokens to any address
    - method: `transfer(address, uint256)`
5. User is able to approve any other address to use the given number of his tokens
    - method: `approve(address, uint256)`
6. User can get information about the allowed number of tokens of one address that can be used by another address
    - method: `allowance(address, address)`
7. As a user that is approved to use other's tokens, user is able to transfer the allowed number
   of tokens from the owner to any other address
    - method: `transferFrom(address, address, uint256)`

### #2 - BLX Bank [moderate]

BLXBank.sol is a Bank contract where users could create their accounts and can store `BLX` token <br/>
The bank store information about the number of user accounts and global BLX balance. <br/>
It's also possible to get public information about any user account - date of creation, balance, and number of transactions (deposits and withdrawals). <br/>
The bank have the owner account that is able to pause and unpause deposits

### All user stories:

1. User can get a global bank balance of `BLX` token
2. User can get the address of the owner of the bank
3. User is able to deposit any number of `BLX` tokens to his bank account
4. User is able to withdraw any number of `BLX` tokens that is available in his account
5. User is able to check that the global bank balance of `BLX` token changes after the deposit or withdrawal
6. User can get information about his account - date of creation, balance, number of transaction if account is active
7. User is able to deactivate his account
8. User is able to transfer funds from his bank account to another existing bank account
9. User is unable to transfer funds from his bank account to an inactive bank account
10. Owner is able to pause and unpause deposits to the bank
11. User is unable to deposit tokens when deposits are paused

### #3 - BLX Locker [moderate+]

BLXLocker is Extended/upgraded Bank contract and allow users to lock funds for other users.<br/>
Locked funds is possible to unlock at a specific date.<br/>

### All user stories:

1. User can create the lock from his bank account balance for the given address
   - User can provide start time of the lock, end time of the lock, locked amount
2. User can get all locks that were created for him
3. User can get the amount of tokens that are unlocked in the given lock
4. User is able to claim the amount of tokens that is available in the given lock
5. User can get the amount of tokens that he already claimed in the given lock
6. User can get the total balance of all locked tokens from all locks that were created for him


---


**Thank you for your time and good luck! 🍀** <br/>
**Powered by [Bloxify](https://www.bloxigy.gg/)**
