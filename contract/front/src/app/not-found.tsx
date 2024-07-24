import React from 'react';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-8 max-w-md w-full">
        <div className="flex items-center justify-center mb-6">
          <AlertTriangle className="h-12 w-12 text-yellow-500" />
        </div>
        <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-4">
          404 - Page Not Found
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
          Oops! The page you are looking for does not exist or has been moved.
        </p>
        <div className="flex justify-center">
          <Link
            href="/"
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300"
          >
            Go Back Top
          </Link>
        </div>
      </div>
    </div>
  );
}