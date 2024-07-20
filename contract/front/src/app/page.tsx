"use client";
import React, { useEffect, useState } from "react";
import { connectWallet, writeEchoContract, getAllEchoes, setupEchoListener, removeEcho, setupDeleteEchoListener } from "../utils/ethereumUtils";
import { Loader2, Trash2 } from "lucide-react";

interface EchoDetailsProps {
  title: string;
  value: string;
}

const EchoDetails: React.FC<EchoDetailsProps> = ({ title, value }) => (
  <div className="space-y-1">
    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
    <p className="text-sm text-gray-900 dark:text-gray-100">{value}</p>
  </div>
);

interface ProcessedEcho {
  id: number;
  address: string;
  timestamp: Date;
  cid: string;
  message: string | null;
}

export default function Home() {
  const [currentAccount, setCurrentAccount] = useState<string>("");
  const [messageValue, setMessageValue] = useState<string>("");
  const [allEchoes, setAllEchoes] = useState<ProcessedEcho[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleConnectWallet = async () => {
    setIsLoading(true);
    try {
      const account = await connectWallet();
      if (account) setCurrentAccount(account);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWriteEcho = async () => {
    setIsLoading(true);
    try {
      const result = await writeEchoContract(messageValue);
      if (result) {
        await fetchAllEchoes();
        setMessageValue("");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEcho = async (echoId: number) => {
    setIsLoading(true);
    try {
      const result = await removeEcho(echoId);
      if (result) {
        await fetchAllEchoes();
      } else {
        throw new Error("Failed to remove echo");
      }
    } finally {
      setIsLoading(false);
    }
  }

  const fetchAllEchoes = async () => {
    const echoes: ProcessedEcho[] | null = await getAllEchoes();
    if (echoes) setAllEchoes(echoes?.sort((a, b) => a.id - b.id).reverse());
    console.log(echoes);
  };

  useEffect(() => {
    if (currentAccount) {
      fetchAllEchoes();
    }

    const echoCleanup = setupEchoListener(async (from, timestamp, cid) => {
      fetchAllEchoes();
    });

    const deleteCleanup = setupDeleteEchoListener(async (echoId, from) => {
      fetchAllEchoes();
    });

    return () => {
      if (echoCleanup) echoCleanup();
      if (deleteCleanup) deleteCleanup();
    };
  }, [currentAccount]);

  return (
    <>
      {isLoading && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl flex items-center space-x-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <p className="text-lg font-semibold text-gray-900 dark:text-white">Loading...</p>
          </div>
        </div>
      )}
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-900 dark:text-white">EthEcho🏔️</h1>
        <p className="text-center mb-8 text-gray-600 dark:text-gray-300">
          イーサリアムウォレットを接続して、メッセージをブロックチェーン上に保存。
        </p>

        <div className="space-y-6">
          {currentAccount && (
            <textarea
              placeholder="メッセージはこちら"
              value={messageValue}
              onChange={(e) => setMessageValue(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          )}

          <div className="flex space-x-4">
            {!currentAccount ? (
              <button
                onClick={handleConnectWallet}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Connect Wallet
              </button>
            ) : (
              <>
                <button
                  disabled
                  className="w-1/2 bg-gray-500 text-white font-bold py-2 px-4 rounded opacity-50 cursor-not-allowed"
                >
                  Wallet Connected
                </button>
                <button
                  onClick={handleWriteEcho}
                  disabled={!messageValue}
                  className="w-1/2 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
                >
                  Write Echo
                </button>
              </>
            )}
          </div>

          {currentAccount && allEchoes.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">All Echoes</h2>
              {allEchoes.map((echo) => (
                <div key={echo.id} className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 relative">
                  <h3 className="text-lg font-semibold mb-4 pr-8">Echo #{echo.id}</h3>
                  <div className="space-y-2">
                    <EchoDetails title="Address" value={echo.address} />
                    <EchoDetails title="Date🦴🐕💨" value={echo.timestamp.toString()} />
                    <EchoDetails title="CID" value={echo.cid} />
                    <EchoDetails title="Message" value={echo.message || "No message"} />
                  </div>
                  {echo.address.toLowerCase() === currentAccount.toLowerCase() && (
                    <button
                      onClick={() => handleDeleteEcho(echo.id)}
                      className="absolute top-4 right-4 text-red-500 hover:text-red-600 focus:outline-none"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}