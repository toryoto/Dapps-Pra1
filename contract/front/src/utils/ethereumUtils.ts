import { ethers, isAddress } from "ethers";
import abi from "../app/utils/EthEcho.json";

const contractAddress = "0x3D836a8a1706C06eCfBdD40709c53ed92Edb6037";
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

export const getEthEchoContract = async () => {
  const ethereum = getEthereumObject();
  if (!ethereum) return null;

  const provider = new ethers.BrowserProvider(ethereum);
  const signer = await provider.getSigner();
  return new ethers.Contract(contractAddress, contractABI, signer);
};

export const writeEcho = async (message: string) => {
  const contract = await getEthEchoContract();
  if (!contract) return null;

  try {
    const echoTxn = await contract.writeEcho(message, { getLimit: 300000 });
    console.log("Minig...", echoTxn.hash);
    await echoTxn.wait();
    console.log("Mined -- ", echoTxn.hash);
    return echoTxn; 
  } catch (error) {
    console.error("Failed to write echo:", error);
    return null;
  }
};

export const getLatestEcho = async () => {
  const contract = await getEthEchoContract();
  if (!contract) return null;

  try {
    const echo = await contract.getLatestEcho();
    return {
      address: echo.echoer,
      timestamp: new Date(Number(echo.timestamp) * 1000),
      message: echo.message,
    };
  } catch (error) {
    console.error("Failed to get latest echo:", error);
  }
};

// 関数に渡される関数→コールバック関数
export const setupEchoListener = (callback: (from: string, timestamp: number, message: string) => void) => {
  getEthEchoContract().then(contract => {
    if (contract) {
      // スマートコントラクタからNewEchoが呼ばれるたびにcallbackを実行
      contract.on("NewEcho", callback);
      // イベントリスナーを解除する
      return () => contract.off("NewEcho", callback);
    }
  });
};