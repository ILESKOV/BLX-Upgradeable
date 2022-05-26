//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.13;

import "./Storage.sol";

contract Proxy is Storage{
    address private currentAddress;

    constructor(address _currentAddress){
        currentAddress = _currentAddress;
    }

    function upgrade(address _newAddress)public{
        currentAddress = _newAddress;
    }
    
    //REDIRECT to currentAddress
    fallback() external payable{
        address implementation = currentAddress;
        require(implementation != address(0), "Functional address invalid");
        bytes memory data = msg.data;

        //DELEGATE EVERY FUNCTION CALL
        assembly {
            let result := delegatecall(gas(), implementation, add(data, 0x20), mload(data), 0, 0)
            let size := returndatasize()
            let ptr := mload(0x40)
            returndatacopy(ptr, 0, size)
            switch result
            case 0 {revert(ptr, size)}
            default {return(ptr, size)}
        }
    }

    receive() external payable {
    }
}