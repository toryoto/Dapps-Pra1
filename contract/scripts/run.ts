import { ethers } from "hardhat";

async function main() {
  const [owner, otherAccount] = await ethers.getSigners();

  console.log("Deploying EthEcho contract...");
  const EthEcho = await ethers.getContractFactory("EthEcho");
  const ethEcho = await EthEcho.deploy();
  
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

  const tx3 = await ethEcho.writeEcho("QmTestCID3");
  await tx3.wait();
  console.log("Echo 3 written");

  const tx4 = await ethEcho.connect(otherAccount).writeEcho("QmTestCID4");
  await tx4.wait();
  console.log("Echo 4 written");

  // Test getAllEchoes
  console.log("Testing getAllEchoes...");
  let allEchoes = await ethEcho.getAllEchoes();
  console.log("All echoes:", allEchoes.map(echo => ({
    echoer: echo.echoer,
    cid: echo.cid,
    timestamp: echo.timestamp.toString()
  })));

  // Test removeEcho
  console.log("Testing removeEcho...");
  const removeTx = await ethEcho.removeEcho(1);
  await removeTx.wait();
  console.log("Echo 1 removed");

  console.log("Testing removeEcho...");
  const removeTx3 = await ethEcho.removeEcho(3);
  await removeTx3.wait();
  console.log("Echo 3 removed");

  // Verify echo removal
  console.log("Verifying echo removal...");
  allEchoes = await ethEcho.getAllEchoes();
  console.log("Updated all echoes:", allEchoes.map(echo => ({
    echoer: echo.echoer,
    cid: echo.cid,
    timestamp: echo.timestamp.toString()
  })));

  console.log("Test script completed");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});