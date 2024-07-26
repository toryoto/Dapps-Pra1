import { ethers } from "hardhat";

async function main() {
  try {
    console.log("Deploying UserProfile contract...");

    // getSignersで取得されるアカウントはhardhat.config.ts内のaccountsで設定したもの
    // 今回は自分のSepoila account
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contract with account:", deployer.address);

    const accountBalance = await deployer.provider.getBalance(deployer.address);
    console.log("Account balance: ", ethers.formatEther(accountBalance));

    const UserProfileFactory = await ethers.getContractFactory("UserProfile");
    const userProfileContract = await UserProfileFactory.deploy();
    const userProfile = await userProfileContract.waitForDeployment();

    console.log("UserProfile deployed to:", await userProfile.getAddress());
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