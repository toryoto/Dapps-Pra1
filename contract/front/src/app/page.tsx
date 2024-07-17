"use client";
import React, { useEffect, useState } from "react";
import { connectWallet, writeEcho, getLatestEcho, setupEchoListener } from "../utils/ethereumUtils";

/* ボタンのスタイルをまとめた変数 */
const buttonStyle =
  "flex w-full justify-center rounded-md px-3 py-1.5 text-sm font-semibold leading-6 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

/* 履歴の詳細を表示するコンポーネント */
interface EchoDetailsProps {
  title: string;
  value: string;
}
const EchoDetails: React.FC<EchoDetailsProps> = ({ title, value }) => (
  <div className="py-3 px-4 block w-full border-gray-200 rounded-lg dark:bg-slate-900 dark:border-gray-700 dark:text-gray-100">
    <div>
      <p className="font-semibold">{title}</p>
      <p>{ value }</p>
    </div>
  </div>
);

export default function Home() {
  /* ユーザーのパブリックウォレットを保存するために使用する状態変数 */
  const [currentAccount, setCurrentAccount] = useState<string>("");
  /* ユーザーのメッセージを保存するために使用する状態変数 */
  const [messageValue, setMessageValue] = useState<string>("");
  const [latestEcho, setLatestEcho] = useState<Echo | null>(null);

  interface Echo {
    address: string;
    timestamp: Date;
    message: string;
  }

  const handleConnectWallet = async () => {
    const account = await connectWallet();
    if (account) setCurrentAccount(account);
  };

  const handleWriteEcho = async () => {
    const result = await writeEcho(messageValue);
    if (result) {
      // Optionally, you can update the UI or fetch the latest echo here
    }
  };

  const handleGetLatestEcho = async () => {
    const echo = await getLatestEcho();
    if (echo) setLatestEcho(echo);
  };

  useEffect(() => {
    const cleanup = setupEchoListener((from, timestamp, message) => {
      // コールバック関数の処理（Echoをセットするのみ→void）
      setLatestEcho({
        address: from,
        timestamp: new Date(timestamp * 1000),
        message: message,
      });
    });

    return cleanup;
  }, []);

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
            onClick={handleConnectWallet}
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
            onClick={handleWriteEcho}
          >
            Echo🏔️
          </button>
        )}
        {/* 最新の書き込みを読み込むボタン */}
        {currentAccount && (
          <button
            className={`${buttonStyle} bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:outline-indigo-600 mt-6`}
            onClick={handleGetLatestEcho}
          >
            Load Latest Echo🏔️
          </button>
        )}
        {/* 履歴を表示する */}
        {currentAccount && latestEcho && (
          <div className="py-3 px-4 block w-full border-gray-200 rounded-lg dark:bg-slate-900 dark:border-gray-700 dark:text-gray-100">
            <div>
              <EchoDetails 
                title="Address"
                value={latestEcho.address}
              />
              <EchoDetails
                title="Time🦴🐕💨"
                value={latestEcho.timestamp.toString()}
              />
              <EchoDetails
                title="Message" 
                value={latestEcho.message}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
