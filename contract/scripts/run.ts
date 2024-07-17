import { ethers } from "hardhat";

const main = async () => {
  // const [owner, randomPerson] = await ethers.getSigners();
  const echoContractFactory = await ethers.getContractFactory('EthEcho');
  const echoContract = await echoContractFactory.deploy();
  // const EthEcho = await echoContract.waitForDeployment();

  const deployedContractAddress = await echoContract.getAddress();
  console.log("Contract added to: ", deployedContractAddress);

  let echoTxn = await echoContract.writeEcho("A first message!");
  let latestEcho = await echoContract.getLatestEcho();
  // ユーザがウォレットでトランザクションを承認するのを待つ
  await echoTxn.wait();
  console.log(latestEcho);

  // 別のユーザでEchoを呼び出す
  const [_, randomPerson] = await ethers.getSigners();
  echoTxn = await echoContract.connect(randomPerson).writeEcho("Another message!");
  await echoTxn.wait();

  latestEcho = await echoContract.getLatestEcho();
  console.log(latestEcho);
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