"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { User } from 'lucide-react';
import { hasProfileOnBlockchain, updateProfileOnBlockchain } from '@/utils/profileContract';
import Image from 'next/image';

interface UserProfile {
  name: string;
  bio: string;
  imageHash?: string;
}

export default function UserProfile({ params }: { params: { address: string } }) {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({ name: 'No Name', bio: 'No Bio' });
  const [message, setMessage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const getProfile = useCallback(async (address: string): Promise<UserProfile | null> => {
    try {
      const res = await fetch(`http://localhost:3000/api/pinata/profile/${address}`);
      if (!res.ok) {
        if (res.status === 404) {
          return null;
        }
        throw new Error('Failed to fetch profile');
      }
      const data = await res.json();
      return {
        name: data.name,
        bio: data.bio,
        imageHash: data.imageHash
      };
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  }, []);

  const fetchProfile = useCallback(async (address: string) => {
    const hasProfile = await hasProfileOnBlockchain(address);
    if (!hasProfile) {
      setProfile({ name: 'No Name', bio: 'No Bio' });
      return;
    }
    const fetchedProfile = await getProfile(address);
    if (fetchedProfile) {
      setProfile(fetchedProfile);
    } else {
      setProfile({ name: 'No Name', bio: 'No Bio' });
    }
  }, [getProfile]);

  useEffect(() => {
    fetchProfile(params.address);
  }, [params.address, fetchProfile]);

  const updateProfile = async (address: string, data: { name: string; bio: string; imageFile?: File | null }) => {
    try {
      const formData = new FormData();
      formData.append('address', address);
      if (data.bio !== undefined) formData.append('bio', data.bio);
      if (data.imageFile) formData.append('image', data.imageFile);

      let detailsCID = null;

      if (data.bio !== undefined || data.imageFile) {
        const res = await fetch('http://localhost:3000/api/pinata/profile/update', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) throw new Error('Failed to update profile');
        const result = await res.json();
        detailsCID = result.detailsCID;
      }

      // ブロックチェーン上にはnameとdetailsCID(bio, imageHash)のみを保存
      const success = await updateProfileOnBlockchain(data.name, detailsCID);

      if (success) {
        setMessage('Profile updated successfully');
        await fetchProfile(address);
      } else {
        setMessage('Failed to update profile on blockchain');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Failed to update profile');
    }
  };

  const handleSave = async () => {
    await updateProfile(params.address, {
      name: profile.name,
      bio: profile.bio,
      imageFile: imageFile
    });
    setIsEditing(false);
    setImageFile(null);
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 relative">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">User Profile</h1>
      {message && <p className="mb-4 p-2 bg-blue-100 text-blue-700 border-blue-400 border rounded">{message}</p>}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Address</label>
          <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{params.address}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
          {isEditing ? (
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          ) : (
            <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{profile.name}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bio</label>
          {isEditing ? (
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          ) : (
            <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{profile.bio}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Profile Image</label>
          {profile.imageHash ? (
            <Image
              src={`https://gateway.pinata.cloud/ipfs/${profile.imageHash}`}
              alt="Profile"
              width={128}
              height={128}
              className="mt-1 object-cover rounded-full"
            />
          ) : (
            <div className="mt-1 w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="h-16 w-16 text-gray-400" />
            </div>
          )}
          {isEditing && (
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          )}
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        {isEditing ? (
          <>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 mr-2"
            >
              Save
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setMessage(null);
                fetchProfile(params.address);
              }}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Edit Profile
          </button>
        )}
      </div>
    </div>
  );
}