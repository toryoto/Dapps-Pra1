// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import "hardhat/console.sol";

contract EthEcho {
    uint256 private _totalEchoes;

    // eventが発火するとブロックチェーン上にデータを保存する
    // フロントエンドは、このイベントをリッスンすることで、リアルタイムでUIを更新できる
    event NewEcho(address indexed from, uint256 indexed echoId, uint256 timestamp, string cid);
    event DeleteEcho(uint256 indexed echoId, address indexed from, uint256 timestamp);

    struct Echo {
        uint256 id;
        address echoer;
        string cid;
        uint256 timestamp;
    }

    // idからEchoを取得するためのマッピング
    mapping(uint256 => Echo) private _echoesMap;
    // 消去されていないEchoのIDを格納するリスト
    uint256[] private _activeEchoIds;

    modifier echoExists(uint256 _echoId) {
        require(_echoesMap[_echoId].echoer != address(0), "Echo does not exist");
        _;
    }

    constructor() {
        console.log("EthEcho contract deployed with mapping and ID list implementation");
    }

    function writeEcho(string memory _cid) public {
        _totalEchoes++;
        console.log("%s has echoed with CID: ", msg.sender, _cid);

        Echo memory newEcho = Echo(_totalEchoes, msg.sender, _cid, block.timestamp);
        // _echoesMapの最後に新しいエコーを追加
        _echoesMap[_totalEchoes] = newEcho;
        // アクティブなエコー配列にintのidを追加
        _activeEchoIds.push(_totalEchoes);

        emit NewEcho(msg.sender, _totalEchoes, block.timestamp, _cid);
    }

    function removeEcho(uint256 _echoId) public echoExists(_echoId) {
        require(_echoesMap[_echoId].echoer == msg.sender, "Only the sender can remove their echo");

        // スワップ・アンド・ポップで削除対象を_activeEchoIdsから消去
        // 配列を詰める作業をなくして、ガス代を節約する
        for (uint256 i = 0; i < _activeEchoIds.length; i++) {
            if (_activeEchoIds[i] == _echoId) {
                // 削除対象の位置にリストの最後のデータを格納する
                _activeEchoIds[i] = _activeEchoIds[_activeEchoIds.length - 1];
                _activeEchoIds.pop();
                break;
            }
        }

        // 変数を初期値にリセットするために使用
        // _echoIdのEcho構造体が空になる→削除されてるように見える
        delete _echoesMap[_echoId];

        // エコーが削除されたことをブロックチェーン上に記録
        emit DeleteEcho(_echoId, msg.sender, block.timestamp);
    }

    function getAllEchoes() public view returns (Echo[] memory) {
        Echo[] memory activeEchoes = new Echo[](_activeEchoIds.length);
        for (uint256 i = 0; i < _activeEchoIds.length; i++) {
            activeEchoes[i] = _echoesMap[_activeEchoIds[i]];
        }
        return activeEchoes;
    }
}