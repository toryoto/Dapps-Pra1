import { ethers } from "hardhat";

async function main() {
  try {
    console.log("Deploying EthEcho contract...");

    const [deployer] = await ethers.getSigners();
    console.log("Deploying contract with account:", deployer.address);

    const accountBalance = await deployer.provider.getBalance(deployer.address);
    console.log("Account balance: ", accountBalance.toString())

    const echoContractFactory = await ethers.getContractFactory("EthEcho");
    const echoContract = await echoContractFactory.deploy();
    const ethEcho = await echoContract.waitForDeployment();

    console.log("EthEcho deployed to:", await ethEcho.getAddress());
    console.log("Deployment completed successfully!");
  } catch (error) {
    console.error("Error during deployment:", error);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});