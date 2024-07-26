const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("UserProfile", function() {
  let userProfile;
  let owner;
  let addr1;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();

    const UserProfileFactory = await ethers.getContractFactory("UserProfile");
    userProfile = await UserProfileFactory.deploy();
  });

  it("Should update profile correctly", async function () {
    const name = "Ryoto";
    const detailsCID = "QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o";

    await userProfile.connect(owner).updateProfile(name, detailsCID);

    const [retrievedName, retrievedCID, lastUpdated] = await userProfile.getProfile(owner.address);

    expect(retrievedName).to.equal(name);
    expect(retrievedCID).to.equal(detailsCID);
    expect(lastUpdated).to.be.gt(0);
  });

  it("Should execute getters correctly", async function () {
    const name = "Ryoto";
    const detailsCID = "QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o";

    await userProfile.connect(owner).updateProfile(name, detailsCID);

    const retrievedName = await userProfile.getName(owner.address);
    const retrievedCID = await userProfile.getDetailsCID(owner.address);

    expect(retrievedName).to.equal(name);
    expect(retrievedCID).to.equal(detailsCID);
  });

  it("Should get lastUpdated correctly", async function () {
    const name = "Ryoto";
    const detailsCID = "QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o";

    const tx = await userProfile.connect(owner).updateProfile(name, detailsCID);
    const receipt = await tx.wait();
    const block = await ethers.provider.getBlock(receipt.blockNumber);

    const [, , lastUpdated] = await userProfile.getProfile(owner.address);

    expect(lastUpdated).to.equal(block.timestamp);
  });

  it("Should return empty profile for non-existent user", async function () {
    const zeroAddress = "0x0000000000000000000000000000000000000000";
    const [name, detailsCID, lastUpdated] = await userProfile.getProfile(zeroAddress);

    expect(name).to.equal("");
    expect(detailsCID).to.equal("");
    expect(lastUpdated).to.equal(0);
  });

  it("Should allow multiple users to have profiles", async function () {
    const name1 = "Ryoto";
    const detailsCID1 = "QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o";
    const name2 = "Taga";
    const detailsCID2 = "QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn";

    await userProfile.connect(owner).updateProfile(name1, detailsCID1);
    await userProfile.connect(addr1).updateProfile(name2, detailsCID2);

    const [retrievedName1, retrievedCID1] = await userProfile.getProfile(owner.address);
    const [retrievedName2, retrievedCID2] = await userProfile.getProfile(addr1.address);

    expect(retrievedName1).to.equal(name1);
    expect(retrievedCID1).to.equal(detailsCID1);
    expect(retrievedName2).to.equal(name2);
    expect(retrievedCID2).to.equal(detailsCID2);
  });
});