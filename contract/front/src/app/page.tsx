"use client";

import React, { useEffect, useState } from "react";
import { connectWallet, writeEchoContract, getAllEchoes, removeEcho } from "../utils/ethereumUtils";
import { ProcessedEcho } from "./types/type";
import { LoadingOverlay } from "./components/LoadingOverlay";
import { EchoList } from "./components/EchoList";

export default function Home() {
  const [currentAccount, setCurrentAccount] = useState<string>("");
  const [messageValue, setMessageValue] = useState<string>("");
  const [allEchoes, setAllEchoes] = useState<ProcessedEcho[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchAllEchoes = async () => {
    const echoes: ProcessedEcho[] | null = await getAllEchoes();
    if (echoes) setAllEchoes(echoes.sort((a, b) => b.id - a.id));
  };

  useEffect(() => {
    fetchAllEchoes();
  }, []);

  const handleConnectWallet = async () => {
    setIsLoading(true);
    try {
      const account = await connectWallet();
      if (account) {
        setCurrentAccount(account);
        await fetchAllEchoes();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleWriteEcho = async () => {
    if (!currentAccount) return;
    setIsLoading(true);
    try {
      const result = await writeEchoContract(messageValue);
      if (result) {
        setMessageValue("");
        await fetchAllEchoes();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEcho = async (echoId: number) => {
    if (!currentAccount) return;
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

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {isLoading && <LoadingOverlay />}
      <div className="container mx-auto py-12">
        <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-3xl p-8 max-w-3xl mx-auto transition-all duration-300 ease-in-out">
          <header className="text-center mb-12">
            <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
              EthEcho🏔️
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              イーサリアムウォレットを接続して、メッセージをブロックチェーン上に保存。
            </p>
          </header>

          <main className="space-y-8">
            <div className="flex justify-center">
              {!currentAccount ? (
                <button
                  onClick={handleConnectWallet}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg"
                >
                  Connect Wallet
                </button>
              ) : (
                <button
                  disabled
                  className="bg-gray-400 text-white font-bold py-3 px-8 rounded-full opacity-75 cursor-not-allowed transition-all duration-300 ease-in-out shadow-lg"
                >
                  Wallet Connected
                </button>
              )}
            </div>

            {currentAccount && (
              <div className="relative">
                <textarea
                  placeholder="メッセージはこちら"
                  value={messageValue}
                  onChange={(e) => setMessageValue(e.target.value)}
                  className="w-full p-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-32 transition-all duration-300 ease-in-out dark:bg-gray-700 dark:border-gray-600 dark:text-white shadow-inner"
                />
                <span className="absolute bottom-2 right-2 text-gray-400 text-sm">
                  {messageValue.length}/140
                </span>
              </div>
            )}

            {currentAccount && (
              <div className="flex justify-end">
                <button
                  onClick={handleWriteEcho}
                  disabled={!messageValue}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  Write Echo
                </button>
              </div>
            )}

            <div className="mt-12">
              <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-6">
                Recent Echoes
              </h2>
              <EchoList 
                allEchoes={allEchoes}
                currentAccount={currentAccount}
                onDeleteEcho={handleDeleteEcho}
              />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}