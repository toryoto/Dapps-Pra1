import React from "react";
import { Loader2 } from "lucide-react";

export const LoadingOverlay: React.FC = () => (
  <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl flex items-center space-x-4">
      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      <p className="text-lg font-semibold text-gray-900 dark:text-white">Loading...</p>
    </div>
  </div>
);