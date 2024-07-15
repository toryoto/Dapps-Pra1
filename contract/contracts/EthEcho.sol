// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import "hardhat/console.sol";

contract EthEcho {
  uint256 private _totalEchoes;

  constructor() {
    console.log("Here is my first smart contract");
  }

  function writeEcho() public {
    _totalEchoes += 1;
    console.log("%s has echoed!", msg.sender);
  }

  // viewでは読み取りのみなので、ガス代が表示されない
  function getTotalEchoes() public view returns (uint256) {
    console.log("We have %d total echoes!", _totalEchoes);
    return _totalEchoes;
  }
}