import { ethers } from "hardhat";

async function main() {
  const [owner, otherAccount] = await ethers.getSigners();

  console.log("Deploying EthEcho contract...");
  const EthEcho = await ethers.getContractFactory("EthEcho");
  const ethEcho = await EthEcho.deploy();
  
  // 新しいデプロイ待機方法
  await ethEcho.deploymentTransaction().wait();
  
  console.log("EthEcho deployed to:", await ethEcho.getAddress());

  // Test writeEcho
  console.log("Testing writeEcho...");
  const tx1 = await ethEcho.writeEcho("QmTestCID1");
  await tx1.wait();
  console.log("Echo 1 written");

  const tx2 = await ethEcho.connect(otherAccount).writeEcho("QmTestCID2");
  await tx2.wait();
  console.log("Echo 2 written");

  // Test getAllEchoes
  console.log("Testing getAllEchoes...");
  const allEchoes = await ethEcho.getAllEchoes();
  console.log("All echoes:", allEchoes);

  // Test getEcho
  console.log("Testing getEcho...");
  const echo1 = await ethEcho.getEcho(1);
  console.log("Echo 1:", echo1);

  // Test removeEcho
  console.log("Testing removeEcho...");
  const removeTx = await ethEcho.removeEcho(1);
  await removeTx.wait();
  console.log("Echo 1 removed");

  // Verify echo removal
  console.log("Verifying echo removal...");
  const updatedAllEchoes = await ethEcho.getAllEchoes();
  console.log("Updated all echoes:", updatedAllEchoes);

  console.log("Test script completed");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});