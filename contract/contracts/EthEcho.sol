// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import "hardhat/console.sol";

contract EthEcho {
  uint256 private _totalEchoes;

  // eventとは、スマートコントラクタで起こったことを外部に通知するもの
  // event イベント名(通知したい値)
  event NewEcho(address indexed from, uint256 timestamp, string cid);

  // Echoの構造体を定義する
  struct Echo {
    address echoer; // Echoを送ったユーザのアドレス
    string cid;
    uint256 timestamp;
  }

  // keyからvalueを参照する
  // int型のidとそのEchoデータをマッピング
  mapping(uint256 => Echo) private _echoesMap;
  uint256[] private _echoIds;

  constructor() {
    console.log("EthEcho contract deployed with IPFS integration");
  }

  function writeEcho(string memory _cid) public {
    _totalEchoes += 1;
    console.log("%s has echoed with CID: ", msg.sender, _cid);

    Echo memory newEcho = Echo(msg.sender, _cid, block.timestamp);
    // 増やしたtotalEchoの場所にnewEchoを結び付ける
    _echoesMap[_totalEchoes] = newEcho;
    _echoIds.push(_totalEchoes);

    // 新しいcidなどを引数にイベントを発火
    emit NewEcho(msg.sender, block.timestamp, _cid);
  }

  function getLatestEcho() public view returns (Echo memory) {
    require(_totalEchoes > 0, "No echoes yet");
    return _echoesMap[_totalEchoes];
  }

  function getTotalEchoes() public view returns (uint256) {
    return _totalEchoes;
  }
}