// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import "hardhat/console.sol";

contract EthEcho {
  uint256 private _totalEchoes;

  // eventとは、スマートコントラクタで起こったことを外部に通知するもの
  // event イベント名(通知したい値)
  event NewEcho(address indexed from, uint256 indexed echoId, uint256 timestamp, string cid);
  event DeleteEcho(uint256 indexed echoId, address indexed from);

  // Echoの構造体を定義する
  struct Echo {
    address echoer; // Echoを送ったユーザのアドレス
    string cid;
    uint256 timestamp;
  }

  // keyからvalueを参照する
  // int型のidとそのEchoデータをマッピング
  mapping(uint256 => Echo) private _echoesMap;
  mapping(uint256 => bool) private _echoExists;
  uint256[] private _activeEchoIds;

  modifier echoExists(uint256 _echoId) {
    require(_echoExists[_echoId], "Echo does not exist");
    _;
  }

  constructor() {
    console.log("EthEcho contract deployed with IPFS integration and improved delete functionality");
  }

  function writeEcho(string memory _cid) public {
    _totalEchoes += 1;
    console.log("%s has echoed with CID: ", msg.sender, _cid);

    Echo memory newEcho = Echo(msg.sender, _cid, block.timestamp);
    // 増やしたtotalEchoの場所にnewEchoを結び付ける
    _echoesMap[_totalEchoes] = newEcho;
    _activeEchoIds.push(_totalEchoes);
    _echoExists[_totalEchoes] = true;

    // 新しいcidなどを引数にイベントを発火
    emit NewEcho(msg.sender, _totalEchoes, block.timestamp, _cid);
  }

  function removeEcho(uint256 _echoId) public echoExists(_echoId) {
    require(_echoesMap[_echoId].echoer == msg.sender, "Only the sender can remove their echo");

    _echoExists[_echoId] = false;

    // スワップ・アンド・ポップで削除対象を_activeEchoIdsから消去
    for (uint i = 0; i < _activeEchoIds.length; i++) {
      if (_activeEchoIds[i] == _echoId) {
        _activeEchoIds[i] = _activeEchoIds[_activeEchoIds.length - 1];
        _activeEchoIds.pop();
        break;
      }
    }

    emit DeleteEcho(_echoId, msg.sender);
}

  function getEcho(uint256 _echoId) public view echoExists(_echoId) returns (Echo memory) {
    return _echoesMap[_echoId];
  }

  function getAllEchoes() public view returns (Echo[] memory) {
    // 削除されていないEchoリストの長さ分のリストを作成
    Echo[] memory allEchoes = new Echo[](_activeEchoIds.length);

    for (uint256 i = 0; i < _activeEchoIds.length; i++) {
      // 削除されていないエコーのリストからidを取得
      uint256 targetId = _activeEchoIds[i];
      // 削除判定のmappingがtrueならば戻り値に格納
      if (_echoExists[targetId]) {
        allEchoes[i] = _echoesMap[targetId];
      }
    }
    return allEchoes;
  }
}

