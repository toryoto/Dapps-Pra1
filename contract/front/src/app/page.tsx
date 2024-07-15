"use client";
import { ethers } from "ethers";
import React, { useEffect, useState } from "react";

import abi from "./utils/EthEcho.json";

/* ボタンのスタイルをまとめた変数 */
const buttonStyle =
  "flex w-full justify-center rounded-md px-3 py-1.5 text-sm font-semibold leading-6 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

/* 履歴の詳細を表示するコンポーネント */
interface EchoDetailsProps {
  title: string;
  //value: string;
}
const EchoDetails: React.FC<EchoDetailsProps> = ({ title }) => (
  <div className="py-3 px-4 block w-full border-gray-200 rounded-lg dark:bg-slate-900 dark:border-gray-700 dark:text-gray-100">
    <div>
      <p className="font-semibold">{title}</p>
      <p>{/*value*/}</p>
    </div>
  </div>
);

export default function Home() {
  /* ユーザーのパブリックウォレットを保存するために使用する状態変数 */
  const [currentAccount, setCurrentAccount] = useState<string>("");
  console.log("currentAccount: ", currentAccount);
  /* ユーザーのメッセージを保存するために使用する状態変数 */
  const [messageValue, setMessageValue] = useState<string>("");
  const contractAddress = "0x760501074aCEed814FAa7cabdaEe788ceE5C89d6";
  const contractABI = abi.abi;

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window as any;
    if (!ethereum) { 
      console.log("Make sure you have MetaMask!");
    } else {
      console.log("We have the etherum object", ethereum);
    }

    // accountsにサイトを訪れたユーザのウォレットアカウントアドレスを格納
    // 複数持っていることを加味している
    const accounts = await ethereum.request({ method: "eth_accounts" });
    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account", account);
      setCurrentAccount(account);
    } else {
      console.log("No authorized account found");
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window as any;
      if (!ethereum) {
        alert("Get MetaMask!");
        return
      }

      // as String[]は型のアサーション
      // 返される値が文字列の配列であることを明示的に指定している
      const accounts = (await ethereum.request({
        method: "eth_requestAccounts",
      })) as string[];
      console.log("Connected: ", accounts[0]);
      setCurrentAccount(accounts[0]);

    } catch (error) {
      console.log(error);
    }
  };

  const writeEcho = async () => {
    try {
      const { ethereum } = window as any;

      if (ethereum) {
        // ProviderはWebアプリがイーサリアムと対話するための手段を提供
        const provider = new ethers.BrowserProvider(ethereum);
        // トランザクションに著名する権限を持つアカウントを取得
        // 通常ユーザの現在のアカウント
        const signer = await provider.getSigner();

        // ABIの参照
        const ethEchoContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        let count = await ethEchoContract.getTotalEchoes();
        console.log("Retrieved total echo count...", count.toNumber);
        console.log("Signer:", signer);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      {/* ヘッダー */}
      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        <h1 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-white-900">
          EthEcho🏔️
        </h1>
        <div className="bio mt-2 mb-8">
          イーサリアムウォレットを接続して、メッセージを作成。あなたのメッセージをチェーンに響かせましょう！
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-lg space-y-6">
        <div>
          {/* メッセージボックス */}
          {currentAccount && (
            <textarea
              placeholder="メッセージはこちら"
              name="messageArea"
              id="message"
              value={messageValue}
              onChange={(e) => setMessageValue(e.target.value)}
              className="py-3 px-4 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-slate-900 dark:border-gray-700 dark:text-gray-400 dark:focus:ring-gray-600"
            />
          )}
        </div>

        {/* ウォレットを接続するボタン */}
        {!currentAccount && (
          <button
            onClick={connectWallet}
            type="button"
            className={`${buttonStyle} bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:outline-indigo-600`}
          >
            Connect Wallet
          </button>
        )}
        {currentAccount && (
          <button
            disabled={true}
            title="Wallet Connected"
            className={`${buttonStyle} bg-indigo-900 text-white cursor-not-allowed`}
          >
            Wallet Connected
          </button>
        )}
        {/* コントラクトに書き込むボタン */}
        {currentAccount && (
          <button
            className={`${buttonStyle} bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:outline-indigo-600`}
            onClick={writeEcho}
          >
            Echo🏔️
          </button>
        )}
        {/* 最新の書き込みを読み込むボタン */}
        {currentAccount && (
          <button
            className={`${buttonStyle} bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:outline-indigo-600 mt-6`}
            //onClick={() => setDisplayedEcho(latestEcho)}
          >
            Load Latest Echo🏔️
          </button>
        )}
        {/* 履歴を表示する */}
        {/* {currentAccount && latestEcho && (
          <div className="py-3 px-4 block w-full border-gray-200 rounded-lg dark:bg-slate-900 dark:border-gray-700 dark:text-gray-100">
            <div>
              <EchoDetails title="Address" value={latestEcho.address} />
              <EchoDetails
                title="Time🦴🐕💨"
                value={latestEcho.timestamp.toString()}
              />
              <EchoDetails title="Message" value={latestEcho.message} />
            </div>
          </div>
        )} */}
      </div>
    </div>
  );
}
