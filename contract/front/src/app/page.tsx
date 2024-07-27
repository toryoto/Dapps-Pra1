"use client";

import React, { useEffect, useState } from "react";
import { connectWallet, writeEchoContract, getAllEchoes, removeEcho } from "../utils/ethereumUtils";
import { ProcessedEcho } from "./types/type";
import { EchoList } from "./components/EchoList";
import { motion } from "framer-motion";

export default function Home() {
  const [currentAccount, setCurrentAccount] = useState<string>("");
  const [messageValue, setMessageValue] = useState<string>("");
  const [allEchoes, setAllEchoes] = useState<ProcessedEcho[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showEchoList, setShowEchoList] = useState(false);

  const fetchAllEchoes = async () => {
    const echoes: ProcessedEcho[] | null = await getAllEchoes();
    if (echoes) setAllEchoes(echoes.sort((a, b) => b.id - a.id));
  };

  useEffect(() => {
    fetchAllEchoes();
    const timer = setTimeout(() => setShowEchoList(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleConnectWallet = async () => {
    setIsLoading(true);
    try {
      const account = await connectWallet();
      if (account) {
        setCurrentAccount(account);
        //await fetchAllEchoes();
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
          <motion.header 
            className="text-center mb-12"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-400 mb-6">
              EthEcho🏔️
            </h1>
            <motion.p 
              className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <span className="font-semibold text-blue-600 dark:text-blue-400">永遠に残る声を、ブロックチェーンに。</span>
              <br />
              <span className="text-sm mt-2 block opacity-75">あなたのメッセージが、イーサリアムの歴史の一部となる。</span>
            </motion.p>
          </motion.header>

          <motion.main 
            className="space-y-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <motion.div 
              className="flex justify-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
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
            </motion.div>

            {currentAccount && (
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
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
                <motion.div 
                  className="flex justify-end"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <button
                    onClick={handleWriteEcho}
                    disabled={!messageValue}
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    Write Echo
                  </button>
                </motion.div>
              </motion.div>
            )}

            <motion.div 
              className="mt-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: showEchoList ? 1 : 0 }}
              transition={{ duration: 0.5 }}
            >
              <EchoList 
                allEchoes={allEchoes}
                currentAccount={currentAccount}
                onDeleteEcho={handleDeleteEcho}
              />
            </motion.div>
          </motion.main>
        </div>
      </div>
      {isLoading && (
        <motion.div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
        </motion.div>
      )}
    </div>
  );
}