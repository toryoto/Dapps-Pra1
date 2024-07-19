import { ethers } from "hardhat";

async function main() {
  const [owner, otherAccount] = await ethers.getSigners();

  console.log("Deploying EthEcho contract...");
  const EthEcho = await ethers.getContractFactory("EthEcho");
  const ethEcho = await EthEcho.deploy();
  
  await ethEcho.deploymentTransaction().wait();
  
  console.log("EthEcho deployed to:", await ethEcho.getAddress());

  // Test: Initial total echoes should be 0
  const initialTotalEchoes = Number(await ethEcho.getTotalEchoes());
  console.log("Initial total echoes:", initialTotalEchoes);
  if (initialTotalEchoes !== 0) {
    throw new Error("Initial total echoes should be 0");
  }

  // Test: Write an echo
  const cid = "Qm123456789";
  const tx = await ethEcho.writeEcho(cid);
  await tx.wait();
  console.log("Echo written with CID:", cid);

  // Test: Get latest echo
  const latestEcho = await ethEcho.getLatestEcho();
  console.log("Latest echo:", latestEcho);
  if (latestEcho.cid !== cid) {
    throw new Error("Latest echo CID does not match");
  }

  // Test: Total echoes should now be 1
  const newTotalEchoes = Number(await ethEcho.getTotalEchoes());
  console.log("New total echoes:", newTotalEchoes);
  if (newTotalEchoes !== 1) {
    throw new Error("Total echoes should be 1");
  }

  // Test: Write another echo from a different account
  const otherCid = "Qm987654321";
  const tx2 = await ethEcho.connect(otherAccount).writeEcho(otherCid);
  await tx2.wait();
  console.log("Another echo written with CID:", otherCid);

  // Test: Get all echoes
  const allEchoes = await ethEcho.getAllEchoes();
  console.log("All echoes:", allEchoes);
  if (allEchoes.length !== 2) {
    throw new Error("Should have 2 echoes");
  }

  console.log("All tests passed!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });