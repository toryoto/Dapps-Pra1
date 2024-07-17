// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import "hardhat/console.sol";

contract EthEcho {
  uint256 private _totalEchoes;

  // eventとは、スマートコントラクタで起こったことを外部に通知するもの
  // event イベント名(通知したい値)
  event NewEcho(address indexed from, uint256 timestamp, string message);

  // Echoの構造体を定義する
  struct Echo {
    address echoer; // Echoを送ったユーザのアドレス
    string message;
    uint256 timestamp;
  }

  Echo private _latestEcho;

  constructor() {
    console.log("Here is my first smart contract");
  }

  function writeEcho(string memory _message) public {
    _totalEchoes += 1;
    console.log("%s has echoed!", msg.sender);

    // 最新のメッセージを保持する変数にメッセージを代入
    _latestEcho = Echo(msg.sender, _message, block.timestamp);

    // emitはeventを発火させ、外部アプリケーションや他のスマートコントラクタに通知を送信
    // 今回は引数の変数をフロントエンドに送信
    emit NewEcho(msg.sender, block.timestamp, _message);
  }

  function getLatestEcho() public view returns (Echo memory) {
    return _latestEcho;
  }

  // viewでは読み取りのみなので、ガス代が表示されない
  function getTotalEchoes() public view returns (uint256) {
    console.log("We have %d total echoes!", _totalEchoes);
    return _totalEchoes;
  }
}