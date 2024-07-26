import { ethers } from "ethers";
import abi from "../app/utils/UserProfile.json";

const contractAddress = "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853";
const contractABI = abi.abi;

interface RawProfile {
  0: string;  // detailsCID(name, bio, imageCID)
  1: bigint;  // lastUpdated
}

interface ProcessedProfile {
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

// detailsCIDをスマートコントラクタに送信してオンチェーン保存する処理
export async function updateProfileOnBlockchain(detailsCID: string): Promise<boolean> {
  try {
    const contract = await getProfileContract();
    if (!contract) return false;

    // スマートコントラクタに値を送信する処理
    const updateTxn = await contract.updateProfile(detailsCID, { gasLimit: 300000 });
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
      detailsCID: profile[0],
      lastUpdated: new Date(Number(profile[1]) * 1000)
    };
  } catch (error) {
    console.error("Failed to get profile:", error);
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