"use client";
import React, { useEffect, useState } from "react";
import { connectWallet, writeEchoContract, getAllEchoes, setupEchoListener } from "../utils/ethereumUtils";

const buttonStyle =
  "flex w-full justify-center rounded-md px-3 py-1.5 text-sm font-semibold leading-6 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

interface EchoDetailsProps {
  title: string;
  value: string;
}

const EchoDetails: React.FC<EchoDetailsProps> = ({ title, value }) => (
  <div className="py-3 px-4 block w-full border-gray-200 rounded-lg dark:bg-slate-900 dark:border-gray-700 dark:text-gray-100">
    <div>
      <p className="font-semibold">{title}</p>
      <p>{value}</p>
    </div>
  </div>
);

interface ProcessedEcho {
  address: string;
  timestamp: Date;
  cid: string;
  message: string | null;
}

export default function Home() {
  const [currentAccount, setCurrentAccount] = useState<string>("");
  const [messageValue, setMessageValue] = useState<string>("");
  const [allEchoes, setAllEchoes] = useState<ProcessedEcho[]>([]);

  const handleConnectWallet = async () => {
    const account = await connectWallet();
    if (account) setCurrentAccount(account);
  };

  const handleWriteEcho = async () => {
    const result = await writeEchoContract(messageValue);
    if (result) {
      fetchAllEchoes();
    }
  };

  const fetchAllEchoes = async () => {
    const echoes = await getAllEchoes();
    if (echoes) {
      setAllEchoes(echoes);
    }
  };

  useEffect(() => {
    if (currentAccount) {
      fetchAllEchoes();
    }

    const cleanup = setupEchoListener(async (from, timestamp, cid) => {
      fetchAllEchoes();
    });

    return cleanup;
  }, [currentAccount]);

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      {/* Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        <h1 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-white-900">
          EthEcho🏔️
        </h1>
        <div className="bio mt-2 mb-8">
          イーサリアムウォレットを接続して、メッセージをブロックチェーン上に保存。
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-lg space-y-6">
        {/* Message Box */}
        <div>
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

        {/* Connect Wallet Button */}
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
        {/* Write to Contract Button */}
        {currentAccount && (
          <button
            className={`${buttonStyle} bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:outline-indigo-600`}
            onClick={handleWriteEcho}
          >
            Echo🏔️
          </button>
        )}
        {/* Display All Echoes */}
        {currentAccount && allEchoes.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">All Echoes</h2>
            {allEchoes.map((echo, index) => (
              <div key={index} className="py-3 px-4 block w-full border-gray-200 rounded-lg dark:bg-slate-900 dark:border-gray-700 dark:text-gray-100">
                <EchoDetails title="Address" value={echo.address} />
                <EchoDetails title="Time🦴🐕💨" value={echo.timestamp.toString()} />
                <EchoDetails title="CID" value={echo.cid} />
                <EchoDetails title="Message" value={echo.message || "No message"} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}