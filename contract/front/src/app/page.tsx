"use client";

import React, { useEffect, useState } from "react";
import { connectWallet, writeEchoContract, getAllEchoes, removeEcho } from "../utils/ethereumUtils";
import { ProcessedEcho } from "./types/type";
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
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-12">
            <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-400 mb-4">
              EthEcho🏔️
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              イーサリアムウォレットを接続して、メッセージをブロックチェーン上に保存。
            </p>
          </header>

          <main className="space-y-8">
            <div className="flex justify-center">
              <button
                onClick={handleConnectWallet}
                disabled={!!currentAccount}
                className={`${
                  currentAccount
                    ? "bg-gray-400 opacity-75 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600"
                } text-white font-bold py-3 px-8 rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg`}
              >
                {currentAccount ? "Wallet Connected" : "Connect Wallet"}
              </button>
            </div>

            {currentAccount && (
              <div className="space-y-4">
                <div className="relative">
                  <textarea
                    placeholder="メッセージはこちら"
                    value={messageValue}
                    onChange={(e) => setMessageValue(e.target.value)}
                    className="w-full p-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-32 transition-all duration-300 ease-in-out dark:bg-gray-700 dark:border-gray-600 dark:text-white shadow-inner"
                    maxLength={140}
                  />
                  <span className="absolute bottom-2 right-2 text-gray-400 text-sm">
                    {messageValue.length}/140
                  </span>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={handleWriteEcho}
                    disabled={!messageValue}
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    Write Echo
                  </button>
                </div>
              </div>
            )}

            <div className="mt-12">
              <EchoList 
                allEchoes={allEchoes}
                currentAccount={currentAccount}
                onDeleteEcho={handleDeleteEcho}
              />
            </div>
          </main>
        </div>
      </div>
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
    </div>
  );
}