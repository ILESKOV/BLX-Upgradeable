//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// TODO: Implement IERC20.sol interface and make the token mintable
contract BLXToken is ERC20{


    constructor() ERC20("Bloxify Token","BLX"){
        _mint(msg.sender, 5000);
    }
}
