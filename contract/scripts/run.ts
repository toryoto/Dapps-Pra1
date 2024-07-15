import { ethers } from "hardhat";

const main = async () => {
  const echoContractFactory = await ethers.getContractFactory('EthEcho');
  const echoContract = await echoContractFactory.deploy();
  const EthEcho = await echoContract.waitForDeployment();
  const deployedContractAddress = await echoContract.getAddress();
  console.log("Contract added to:", deployedContractAddress);
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