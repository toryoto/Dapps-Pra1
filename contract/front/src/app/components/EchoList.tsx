import React from "react";
import { Trash2 } from "lucide-react";
import { EchoDetails } from "./EchoDetails";
import { ProcessedEcho } from "../types/type";

interface EchoListProps {
  allEchoes: ProcessedEcho[];
  currentAccount: string;
  onDeleteEcho: (echoId: number) => void;
}

export const EchoList: React.FC<EchoListProps> = ({ allEchoes, currentAccount, onDeleteEcho }) => (
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
            onClick={() => onDeleteEcho(echo.id)}
            className="absolute top-4 right-4 text-red-500 hover:text-red-600 focus:outline-none"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        )}
      </div>
    ))}
  </div>
)