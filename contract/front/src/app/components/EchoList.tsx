import React from "react";
import { Trash2 } from "lucide-react";
import { EchoDetails } from "./EchoDetails";
import { ProcessedEcho } from "../types/type";

interface EchoListProps {
  allEchoes: ProcessedEcho[];
  currentAccount: string;
  onDeleteEcho: (echoId: number) => void;
}

const truncateString = (str: string, startChars: number, endChars: number) => {
  if (str.length <= startChars + endChars) return str;
  return `${str.slice(0, startChars)}...${str.slice(-endChars)}`;
};

const formatDate = (timestamp: string): string => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours().toString().padStart(2, '0');
  const minute = date.getMinutes().toString().padStart(2, '0');

  return `${year}/${month}/${day} ${hour}:${minute}`;
};

export const EchoList: React.FC<EchoListProps> = ({ allEchoes, currentAccount, onDeleteEcho }) => (
  <div className="space-y-4">
    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">All Echoes</h2>
    {allEchoes.map((echo) => (
      <div key={echo.id} className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 sm:p-6 relative">
        <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-4 pr-8">Echo #{echo.id}</h3>
        <div className="space-y-2">
          <div className="sm:hidden">
            <EchoDetails 
              title="Address" 
              value={truncateString(echo.address, 6, 4)} 
              linkTo={`/users/${echo.address}`}
            />
          </div>
          <div className="hidden sm:block">
            <EchoDetails 
              title="Address" 
              value={echo.address} 
              linkTo={`/users/${echo.address}`}
            />
          </div>
          <EchoDetails 
            title="Date" 
            value={ formatDate(echo.timestamp) } 
          />
          <div className="sm:hidden">
            <EchoDetails 
              title="CID" 
              value={truncateString(echo.cid, 6, 4)} 
            />
          </div>
          <div className="hidden sm:block">
            <EchoDetails 
              title="CID" 
              value={echo.cid} 
            />
          </div>
          <EchoDetails 
            title="Message" 
            value={echo.message || "No message"} 
          />
        </div>
        {echo.address.toLowerCase() === currentAccount.toLowerCase() && (
          <button
            onClick={() => onDeleteEcho(echo.id)}
            className="absolute top-2 right-2 sm:top-4 sm:right-4 text-red-500 hover:text-red-600 focus:outline-none"
          >
            <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        )}
      </div>
    ))}
  </div>
);