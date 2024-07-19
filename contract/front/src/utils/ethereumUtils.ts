import { ethers, isAddress } from "ethers";
import abi from "../app/utils/EthEcho.json";
import { create } from 'kubo-rpc-client';

const contractAddress = "0x874ee0BDd0D98893C9FFC5d8aC15e854Cd801feC";
const contractABI = abi.abi;

const ipfs = create({ url: 'http://localhost:5001' });

// ブロックチェーンから取得する生のEchoデータ（チェーン上に保存）
interface RawEcho {
  echoer: string;
  cid: string;
  timestamp: number;
}

// IPFSからメッセージを取得し、加工後のEchoデータ
interface ProcessedEcho {
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
    const ipfsResult = await ipfs.add(message);
    const cid = ipfsResult.cid.toString();

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

export const getAllEchoes = async (address: string) => {
  const contract = await getEthEchoContract();
  if (!contract) return null;

  try {
    // ブロックチェーン上から全てのcidを取得する
    const echoes = await contract.getAllEchoes();
    // 自分のアドレスのメッセージのみ表示する
    const filteredEchoes = echoes.filter((echo: RawEcho) => {
      echo.echoer.toLowerCase() === address.toLowerCase();
    });

    const processedEchoes = await Promise.all(filteredEchoes.map(async (echo: RawEcho) => {
      const message = await getMessageFromIPFS(echo.cid);
      return {
        address: echo.echoer,
        timestamp: new Date(Number(echo.timestamp) * 1000),
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

// 関数に渡される関数→コールバック関数
// 受け取る関数は引数を3つ取り、戻り値はvoid
export const setupEchoListener = (callback: (from: string, timestamp: number, cid: string) => void) => {
  getEthEchoContract().then(contract => {
    if (contract) {
      // スマートコントラクタからNewEchoが呼ばれるたびにcallbackを実行
      contract.on("NewEcho", callback);
      // イベントリスナーを解除する
      return () => contract.off("NewEcho", callback);
    }
  });
};

// IPFSから特定のCIDのメッセージを取得する関数
export const getMessageFromIPFS = async (cid: string) => {
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
