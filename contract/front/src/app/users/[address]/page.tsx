import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { User } from 'lucide-react';

interface PageProps {
  params: {
    address: string
  }
}

const ProfileDetails: React.FC<{ title: string; value: string }> = ({ title, value }) => (
  <div className="mb-2">
    <span className="font-semibold text-gray-700 dark:text-gray-300">{title}: </span>
    <span className="text-gray-600 dark:text-gray-400">{value}</span>
  </div>
);

export default function UserProfile({ params }: PageProps) {
  const { address } = params;

  // この関数は例示用です。実際のアプリケーションでは、
  // この情報はAPIやブロックチェーンから取得することになります。
  const getUserProfile = (address: string) => {
    const users = [
      { address: '0xA7F8Edd724492Da06A6203F729EE6b275e3ae018', name: 'Ryoto', bio: 'Blockchain enthusiast', joined: '2023-01-15' },
      { address: '0x5678...9012', name: 'Bob', bio: 'Smart contract developer', joined: '2023-02-20' },
      { address: '0x9012...3456', name: 'Charlie', bio: 'Crypto trader', joined: '2023-03-25' },
    ];
    return users.find(user => user.address === address);
  };

  const user = getUserProfile(address);

  if (!user) {
    notFound();
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <Link href="/" className="text-blue-500 hover:underline mb-4 inline-block">
        &larr; Back to Top
      </Link>
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 relative">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">User Profile</h1>
        <div className="absolute top-4 right-4 text-gray-400">
          <User className="h-6 w-6" />
        </div>
        <div className="space-y-2">
          <ProfileDetails title="Name" value={user.name} />
          <ProfileDetails title="Address" value={user.address} />
          <ProfileDetails title="Bio" value={user.bio} />
          <ProfileDetails title="Joined" value={user.joined} />
        </div>
      </div>
    </div>
  );
}