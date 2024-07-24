"use client";
import React, { useEffect, useState, useCallback } from "react";
import { connectWallet, writeEchoContract, getAllEchoes, setupEchoListener, removeEcho, setupDeleteEchoListener } from "../utils/ethereumUtils";
import { ProcessedEcho } from "./types/type"
import { LoadingOverlay } from "./components/LoadingOverlay";
import { EchoList } from "./components/EchoList";

// デバウンス関数
const debounce = (func: Function, delay: number) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

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
        setMessageValue("");
        // fetchAllEchoes は削除（リスナーが処理します）
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEcho = async (echoId: number) => {
    setIsLoading(true);
    try {
      const result = await removeEcho(echoId);
      if (!result) {
        throw new Error("Failed to remove echo");
      }
      // fetchAllEchoes は削除（リスナーが処理します）
    } finally {
      setIsLoading(false);
    }
  }

  const fetchAllEchoes = useCallback(async () => {
    const echoes: ProcessedEcho[] | null = await getAllEchoes();
    if (echoes) setAllEchoes(echoes?.sort((a, b) => a.id - b.id).reverse());
    console.log(echoes);
  }, []);

  // デバウンスされたfetchAllEchoes
  const debouncedFetchAllEchoes = useCallback(
    debounce(fetchAllEchoes, 500),  // 500ミリ秒のデバウンス
    [fetchAllEchoes]
  );

  useEffect(() => {
    if (currentAccount) {
      fetchAllEchoes();
    }

    const echoCleanup = setupEchoListener(async (from, timestamp, cid) => {
      debouncedFetchAllEchoes();
    });

    const deleteCleanup = setupDeleteEchoListener(async (echoId, from) => {
      debouncedFetchAllEchoes();
    });

    return () => {
      if (echoCleanup) echoCleanup();
      if (deleteCleanup) deleteCleanup();
    };
  }, [currentAccount, debouncedFetchAllEchoes]);

  return (
    <>
      {isLoading && <LoadingOverlay /> }
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
            <EchoList 
              allEchoes={allEchoes}
              currentAccount={currentAccount}
              onDeleteEcho={handleDeleteEcho}
            />
          )}
        </div>
      </div>
    </>
  );
}