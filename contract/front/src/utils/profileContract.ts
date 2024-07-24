import { ethers } from "ethers";
import abi from "../app/utils/UserProfile.json";

const contractAddress = "0x1962Dd439B8F9Ace134F92E0d96684727Fb1890F";
const contractABI = abi.abi;

interface RawProfile {
  name: string;
  detailsCID: string;
  lastUpdated: bigint;
}

interface ProcessedProfile {
  name: string;
  detailsCID: string;
  lastUpdated: Date;
}

export const getEthereumObject = () => (window as any).ethereum;

export const connectWallet = async (): Promise<string | null> => {
  try {
    const ethereum = getEthereumObject();
    if (!ethereum) {
      alert("Get MetaMask!");
      return null;
    }

    const accounts = await ethereum.request({ method: "eth_requestAccounts" }) as string[];
    return accounts[0];
  } catch (error) {
    console.error("Failed to connect wallet:", error);
    return null;
  }
};

export const getProfileContract = async () => {
  const ethereum = getEthereumObject();
  if (!ethereum) return null;

  const provider = new ethers.BrowserProvider(ethereum);
  const signer = await provider.getSigner();
  return new ethers.Contract(contractAddress, contractABI, signer);
};

// nameとCID（bio,imageのCID保存先）をスマートコントラクタに送信してオンチェーン保存する処理
export async function updateProfileOnBlockchain(name: string, detailsCID: string): Promise<boolean> {
  try {
    const contract = await getProfileContract();
    if (!contract) return false;
    // スマートコントラクタに値を送信する処理
    const updateTxn = await contract.updateProfile(name, detailsCID, { gasLimit: 300000 });
    console.log("Updating profile...", updateTxn.hash);
    await updateTxn.wait();
    console.log("Profile updated -- ", updateTxn.hash);
    return true;
  } catch (error) {
    console.error("Failed to update profile: ", error);
    return false;
  }
};

export async function getProfileFromBlockchain(address: string): Promise<ProcessedProfile | null> {
  try {
    const contract = await getProfileContract();
    if (!contract) return null;

    const profile: RawProfile = await contract.getProfile(address);
    return {
      name: profile.name,
      detailsCID: profile.detailsCID,
      lastUpdated: new Date(Number(profile.lastUpdated) * 1000)
    };
  } catch (error) {
    console.error("Failed to get profile:", error);
    return null;
  }
}

export async function getNameFromBlockChain(address: string): Promise<string | null> {
  try {
    const contract = await getProfileContract();
    if (!contract) return null;

    return await contract.getName(address);
  } catch (error) {
    console.error("Failed to get name:", error);
    return null;
  }
}

export async function getDetailsCIDFromBlockchain(address: string): Promise<string | null> {
  try {
    const contract = await getProfileContract();
    if (!contract) return null;

    return await contract.getDetailsCID(address);
  } catch (error) {
    console.error("Failed to get detailsCID:", error);
    return null;
  }
}

export async function hasProfileOnBlockchain(address: string): Promise<boolean> {
  try {
    const contract = await getProfileContract();
    if (!contract) return false;

    return await contract.hasProfile(address);
  } catch (error) {
    console.error("Failed to check if profile exists:", error);
    return false;
  }
}