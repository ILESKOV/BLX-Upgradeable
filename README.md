# BLX Bank

## Introduction
Example of Upgradeable Smart Contract


## Environment

### Engines versions
- [Node](https://nodejs.org/en/): **16.X.X** (`node -v`)
- [yarn](https://yarnpkg.com/): (`npm install -g yarn`)

### Installation
```sh
yarn
```

### Scripts
You will need to use [npm](https://www.npmjs.com/) scripts to run and test this application.

#### Environment
This exercise is done in [Solidity](https://docs.soliditylang.org/)**. The development environment to compile, deploy, test and run the code provided by [hardhat](https://hardhat.org/) is already configured.

#### Tools and libraries
The tools and libraries listed below are already set-up for you. However, feel free to modify the configuration or even the stack to fit your needs.
- [Hardhat](https://hardhat.org/getting-started/): development environment to compile, deploy, test, and debug your Ethereum software
- [Ethers.js](https://docs.ethers.io/v5/): a JavaScript library to interact with Ethereum
- [Waffle](https://getwaffle.io/): a library for testing smart contracts.
- [Chai](https://chaijs.com): a BDD/TDD assertion library
- [Solhint](https://protofire.github.io/solhint/): a Solidity linter
- [Typescript](https://www.typescriptlang.org/): a strongly typed programming language that builds on JavaScript
- [Typechain](https://github.com/dethcrypto/TypeChain): a TypeScript blinders for Ethereum smart contracts

## Tasks
- [x] Feature work as expected
- [x] Tests have been written
- [x] Quality controls are passed

### #1 - BLX Token [easy]

BLXToken.sol is ERC20 token contract with `BLX` symbol, `Bloxify Token` name, and `18` decimals. <br />
Token is transferable and mintable. <br />

### #2 - BLX Bank [moderate]

BLXBank.sol is a Bank contract where users create their accounts and can store `BLX` token <br/>
The bank store information about the number of user accounts and global BLX balance. <br/>
It's also possible to get public information about any user account - date of creation, balance, and number of transactions (deposits and withdrawals). <br/>
The bank have the owner account that is able to pause and unpause deposits

### #3 - BLX Locker [moderate+]

BLXLocker is Extended/upgraded Bank contract and allow users to lock funds for other users.<br/>
Locked funds is possible to unlock at a specific date or linearly over the given time.<br/>
Use the upgradeability concept from OpenZeppelin.


---


**Thank you for your time and good luck! 🍀** <br/>
**Powered by [Bloxify](https://www.bloxigy.gg/)**
