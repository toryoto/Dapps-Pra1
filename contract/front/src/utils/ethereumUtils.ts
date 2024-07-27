import { ethers } from "ethers";
import abi from "../app/utils/EthEcho.json";
import { ProcessedEcho, RawEcho } from "@/app/types/type";

const contractAddress = "0x3Cd556A69C4908Cd1034d29c10D6250E712F1EB3";
const contractABI = abi.abi;

export const getEthereumObject = () => (window as any).ethereum;

export const connectWallet = async (): Promise<string | null> => {
  try {
    const ethereum = getEthereumObject();
    if (!ethereum) {
      alert("Get MetaMask!");
      return null;
    }

    // as String[]は型のアサーション
    // 返される値が文字列の配列であることを明示的に指定している
    const accounts = await ethereum.request({ method: "eth_requestAccounts" }) as string[];
    return accounts[0];
  } catch (error) {
    console.error("Failed to connect wallet:", error);
    return null;
  }
};

const getEthEchoContract = async () => {
  const ethereum = getEthereumObject();
  if (!ethereum) return null;

  const provider = new ethers.BrowserProvider(ethereum);
  const signer = await provider.getSigner();
  return new ethers.Contract(contractAddress, contractABI, signer);
};

// 読み取り専用のコントラクト
const getReadOnlyContract = async () => {
  const provider = new ethers.JsonRpcProvider("https://eth-sepolia.g.alchemy.com/v2/0f3pgdhbIActNECtmQus8qUy6Gl6HbwT");
    
  // コントラクトのインスタンス化
  return new ethers.Contract(
    contractAddress,
    contractABI,
    provider
  );
}

export const writeEchoContract = async (message: string) => {
  const contract = await getEthEchoContract();
  if (!contract) return null;

  try {
    const res = await fetch('/api/pinata/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });


    if (!res.ok) throw new Error('Failed to upload to Pinata');

    const { cid } = await res.json();

    // CIDをブロックチェーン上に記録
    const echoTxn = await contract.writeEcho(cid, { gasLimit: 300000 });
    console.log("Mining...", echoTxn.hash);
    await echoTxn.wait();
    console.log("Mined -- ", echoTxn.hash);
    
    return { transaction: echoTxn, cid: cid};
  } catch (error) {
    console.error("Failed to write echo with IPFS: ", error);
    return null;
  }
};

export const getAllEchoes = async (): Promise<ProcessedEcho[] | null> => {
  const contract = await getReadOnlyContract();
  if (!contract) return null;

  try {
    // ブロックチェーン上から全てのデータを取得する（以下が送られてくるデータ）
    // struct Echo {
    //   uint256 id;
    //   address echoer;
    //   string cid;
    //   uint256 timestamp;
    // }

    const echoes = await contract.getAllEchoes();

    const processedEchoes: ProcessedEcho[] = await Promise.all(echoes.map(async (echo: RawEcho, index: number) => {
      const res = await fetch(`/api/pinata/getMessage?cid=${echo.cid}`);
      const { message } = await res.json();
      
      return {
        id: Number(echo.id),
        address: echo.echoer,
        timestamp: new Date(Number(echo.timestamp) * 1000).toLocaleDateString('sv-SE'),
        cid: echo.cid,
        message: message,
      };
    }));

    return processedEchoes;
  } catch (error) {
    console.error("Failed to get all echoes:", error);
    return null;
  }
};

export const removeEcho = async (echoId: number): Promise<boolean> => {
  const contract = await getEthEchoContract();
  if (!contract) throw new Error("Failed to get contract");

  try {
    const removeTxn = await contract.removeEcho(echoId, { gasLimit: 300000 });
    console.log("Removing echo...", removeTxn.hash);
    await removeTxn.wait();
    console.log("Echo removed -- ", removeTxn.hash);
    return true;
  } catch (error) {
    console.log("Failed to remove echo: ", error);
    throw error;
  }
}