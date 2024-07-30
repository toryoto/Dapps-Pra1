import { ethers } from "ethers";
import abi from "../app/utils/UserProfile.json";

const contractAddress = "0x47e436Da5325fa4403eA39eed9Fb4c1E57624E60";
const contractABI = abi.abi;

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

// サーバーサイドで呼ぶ読み込み専用コントラクトを取得するメソッド
export const getReadOnlyContract = async () => {
  const provider = new ethers.JsonRpcProvider(process.env.ALCHEMY_API_URL);
  const contract = new ethers.Contract(contractAddress, contractABI, provider);
  return contract;
}

// 書き込み可能なコントラクト
const getSignerontract = async () => {
  const ethereum = getEthereumObject();
  if (!ethereum) return null;

  const provider = new ethers.BrowserProvider(ethereum);
  const signer = await provider.getSigner();
  return new ethers.Contract(contractAddress, contractABI, signer);
};

// detailsCIDをスマートコントラクタに送信してオンチェーン保存する処理
export async function updateProfileOnBlockchain(detailsCID: string): Promise<boolean> {
  try {
    const contract = await getSignerontract();
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

export async function getProfile(address: string) {
  try {
    // サーバーサイドでは読み取り専用コントラクトを使用してユーザプロフィールを取得
    const res = await fetch(`/api/users/${address}`);
    if (!res.ok) throw new Error('Failed to fetch profile');
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Failed to get profile:", error);
    return null;
  }
}