import { ethers } from "hardhat";

const main = async () => {
  const [owner, randomPerson] = await ethers.getSigners();
  const echoContractFactory = await ethers.getContractFactory('EthEcho');
  const echoContract = await echoContractFactory.deploy();
  const EthEcho = await echoContract.waitForDeployment();

  const deployedContractAddress = await echoContract.getAddress();
  console.log("Contract deployed to:", deployedContractAddress);
  console.log("Contract deployed by:", owner.address);

  await echoContract.getTotalEchoes();

  let echoTxn = await echoContract.writeEcho();
  // ユーザがウォレットでトランザクションを承認するのを待つ
  await echoTxn.wait();

  await echoContract.getTotalEchoes();

  // 他のユーザがオーナーにEchoを送ったシュミレーション
  echoTxn = await echoContract.connect(randomPerson).writeEcho();
  await echoTxn.wait();
  await echoContract.getTotalEchoes();
};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

runMain();