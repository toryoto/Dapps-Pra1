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
    const detailsCID = "QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o";

    await userProfile.connect(owner).updateProfile(detailsCID);

    const [retrievedCID, lastUpdated] = await userProfile.getProfile(owner.address);

    expect(retrievedCID).to.equal(detailsCID);
    expect(lastUpdated).to.be.gt(0);
  });

  it("Should get lastUpdated correctly", async function () {
    const detailsCID = "QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o";

    const tx = await userProfile.connect(owner).updateProfile(detailsCID);
    const receipt = await tx.wait();
    const block = await ethers.provider.getBlock(receipt.blockNumber);

    const [, lastUpdated] = await userProfile.getProfile(owner.address);

    expect(lastUpdated).to.equal(block.timestamp);
  });

  it("Should return empty profile for non-existent user", async function () {
    const zeroAddress = "0x0000000000000000000000000000000000000000";
    const [detailsCID, lastUpdated] = await userProfile.getProfile(zeroAddress);

    expect(detailsCID).to.equal("");
    expect(lastUpdated).to.equal(0);
  });

  it("Should allow multiple users to have profiles", async function () {
    const detailsCID1 = "QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o";
    const detailsCID2 = "QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn";

    await userProfile.connect(owner).updateProfile(detailsCID1);
    await userProfile.connect(addr1).updateProfile(detailsCID2);

    const [retrievedCID1] = await userProfile.getProfile(owner.address);
    const [retrievedCID2] = await userProfile.getProfile(addr1.address);

    expect(retrievedCID1).to.equal(detailsCID1);
    expect(retrievedCID2).to.equal(detailsCID2);
  });

  it("Should emit ProfileUpdated event", async function () {
    const detailsCID = "QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o";

    await expect(userProfile.connect(owner).updateProfile(detailsCID))
      .to.emit(userProfile, "ProfileUpdated")
      .withArgs(owner.address, detailsCID);
  });

  it("Should return true for hasProfile after profile creation", async function () {
    const detailsCID = "QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o";

    expect(await userProfile.hasProfile(owner.address)).to.be.false;

    await userProfile.connect(owner).updateProfile(detailsCID);

    expect(await userProfile.hasProfile(owner.address)).to.be.true;
  });
});