// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import "hardhat/console.sol";

contract UserProfile {
  struct Profile {
    string name; // 一度設定したらあまり変更しない名前はオンチェーン
    string detailsCID; // 頻繁に更新される自己紹介やプロフィール画像保存先CID
    uint256 lastUpdated;
  }

  // Metamaskアドレスとプロフィール構造体を紐づける
  mapping(address => Profile) public profiles;

  // プロフィール変更をオンチェーンに記録するイベント
  // indexedを付けたパラメータはEthereumScanなどで検索できるようになる
  event ProfileUpdated(address indexed user, string name, string detailsCID);

  //  memoryは関数の実行中にのみ存在する一時的なデータで関数の実行が終わると消える。
  function updateProfile(string memory _name, string memory _detailsCID) public {
    profiles[msg.sender] = Profile(_name, _detailsCID, block.timestamp);
    emit ProfileUpdated(msg.sender, _name, _detailsCID);
  }

  function getProfile(address _user) public view returns (string memory, string memory, uint256) {
    Profile memory user_profile = profiles[_user];
    return (user_profile.name, user_profile.detailsCID, user_profile.lastUpdated);
  }

  function getName(address _user) public view returns (string memory) {
    return profiles[_user].name;
  }

  function getDetailsCID(address _user) public view returns (string memory) {
    return profiles[_user].detailsCID;
  }

  function hasProfile(address _user) public view returns (bool) {
    return bytes(profiles[_user].name).length > 0;
  }
}