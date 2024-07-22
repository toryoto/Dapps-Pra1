import { ethers } from "ethers";
import abi from "../app/utils/EthEcho.json";
import { create } from 'kubo-rpc-client';
import dotenv from 'dotenv';

dotenv.config();

const contractAddress = "0x30F35CbF5Ff0807e2C24AbA190b347984ed5Ea83";
const contractABI = abi.abi;

const ipfs = create({ url: 'http://localhost:5001' });

// ブロックチェーンから取得する生のEchoデータ（チェーン上に保存）
interface RawEcho {
  id: number;
  echoer: string;
  cid: string;
  timestamp: number;
}

// IPFSからメッセージを取得し、加工後のEchoデータ
interface ProcessedEcho {
  id: number;
  address: string;
  timestamp: Date;
  cid: string;
  message: string | null;
}
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

export const getEthEchoContract = async () => {
  const ethereum = getEthereumObject();
  if (!ethereum) return null;

  const provider = new ethers.BrowserProvider(ethereum);
  const signer = await provider.getSigner();
  return new ethers.Contract(contractAddress, contractABI, signer);
};

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
  const contract = await getEthEchoContract();
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

// 関数に渡される関数→コールバック関数
// 受け取る関数は引数を3つ取り、戻り値はvoid
export const setupEchoListener = (callback: (from: string, timestamp: number, cid: string) => void): (() => void) | undefined => {
  getEthEchoContract().then(contract => {
    if (contract) {
      // スマートコントラクタからNewEchoが呼ばれるたびにcallbackを実行
      contract.on("NewEcho", callback);
      // イベントリスナーを解除する
      return () => contract.off("NewEcho", callback);
    }
  });

  return undefined;
};

// DeleteEchoイベントをリッスンし、Echoが削除されたときにコールバック関数を実行
export const setupDeleteEchoListener = (callback: (echoId: number, from: string) => void): (() => void) | undefined => {
  getEthEchoContract().then(contract => {
    if (contract) {
      contract.on("DeleteEcho", callback);
      return () => contract.off("DeleteEcho", callback);
    }
  });

  return undefined;
};

// IPFSから特定のCIDのメッセージを取得する関数
export const getMessageFromIPFS = async (cid: string): Promise<string | null> => {
  try {
    const messageStream = await ipfs.cat(cid);
    let data = new Uint8Array();
    for await (const chunk of messageStream) {
      const chunkArray = new Uint8Array(chunk);
      const newData = new Uint8Array(data.length + chunkArray.length);
      newData.set(data);
      newData.set(chunkArray, data.length);
      data = newData;
    }
    const decoder = new TextDecoder();
    return decoder.decode(data);
  } catch (error) {
    console.error("Failed to get message from IPFS: ", error);
    return null;
  }
};