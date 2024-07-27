"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from "next/link";
import { User, Edit2, Save, X, ArrowLeft  } from 'lucide-react';
import {
  getProfileFromBlockchain,
  updateProfileOnBlockchain,
  hasProfileOnBlockchain,
  connectWallet
} from '@/utils/profileContract';
import { getProfileDetailsFromPinata } from '@/app/api/pinata/pinataUtils';
interface UserProfile {
  name: string;
  bio: string;
  imageHash?: string;
}

export default function UserProfile({ params }: { params: { address: string } }) {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({ name: '', bio: '', imageHash: '' });
  const [originalProfile, setOriginalProfile] = useState<UserProfile>({ name: '', bio: '', imageHash: '' });
  const [message, setMessage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function fetchProfile(address: string) {
    setIsLoading(true);
    try {
      const hasProfile = await hasProfileOnBlockchain(address);
      if (!hasProfile) {
        setProfile({ name: 'No Name', bio: 'No Bio', imageHash: '' });
        return;
      }

      // ブロックチェーン上からdetailsCIDを取得
      const blockchainProfile = await getProfileFromBlockchain(address);
      if (!blockchainProfile) {
        throw new Error('Failed to fetch profile from blockchain');
      }

      // detailsCIDをもとにして、Pinataからプロフィールの値を取得
      const profileDetails = await getProfileDetailsFromPinata(blockchainProfile.detailsCID);
      const updatedProfile = {
        name: profileDetails?.name || 'No name',
        bio: profileDetails?.bio || 'No Bio',
        imageHash: profileDetails?.imageHash
      };
      setProfile(updatedProfile);
      setOriginalProfile(updatedProfile);
      setMessage(null);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setMessage('Failed to fetch profile');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    setIsLoading(true);
    fetchProfile(params.address);
    setIsLoading(false);
  }, [params.address]);

  async function handleUpdateProfile() {
    setIsLoading(true);

    const account = await connectWallet();
    if (!account) {
      setMessage('Please connect your wallet');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('address', params.address);
      formData.append('name', profile.name);
      formData.append('bio', profile.bio);
      if (imageFile) formData.append('imageFile', imageFile)
      else if (profile.imageHash) formData.append('imageHash', profile.imageHash)
    
      const res = await fetch('/api/pinata/profile/update', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Failed to upload to Pinata');

      const data = await res.json();
      const detailsCID = data.detailsCID;

      
      if (detailsCID) {
        const success = await updateProfileOnBlockchain(detailsCID);
        if (success) {
          setMessage('Profile updated successfully');
          await fetchProfile(params.address);
        } else {
          throw new Error('Failed to update profile on blockchain');
        }
      } else {
        setMessage('No changes to update');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Failed to update profile');
    } finally {
      setIsEditing(false);
      setImageFile(null);
      setIsLoading(false);
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-3xl p-8 max-w-3xl mx-auto transition-all duration-300 ease-in-out">
      <Link href="/" className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline mb-6 transition-all duration-300 ease-in-out">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Home
      </Link>
      <div className="flex flex-col items-center mb-8">
        <div className="relative mb-4">
          {profile.imageHash ? (
            <Image
              src={`https://gateway.pinata.cloud/ipfs/${profile.imageHash}`}
              alt="Profile"
              width={150}
              height={150}
              className="rounded-full object-cover transition-all duration-300 ease-in-out hover:scale-105 shadow-lg"
            />
          ) : (
            <div className="w-40 h-40 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center transition-all duration-300 ease-in-out hover:scale-105 shadow-lg">
              <User className="h-20 w-20 text-white" />
            </div>
          )}
          {isEditing && (
            <label htmlFor="profile-image-upload" className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-2 cursor-pointer hover:bg-blue-600 transition-colors duration-200">
              <Edit2 className="h-5 w-5 text-white" />
              <input
                id="profile-image-upload"
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="hidden"
              />
            </label>
          )}
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">{profile.name}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">{params.address}</p>
      </div>

      {message && (
        <div className="mb-6 p-4 bg-blue-100 text-blue-700 border-blue-400 border rounded-md transition-all duration-300 ease-in-out animate-fade-in">
          {message}
        </div>
      )}

      <div className="space-y-6">
        <div className="transition-all duration-300 ease-in-out">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Name</label>
          {isEditing ? (
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white transition-all duration-300 ease-in-out focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          ) : (
            <p className="text-gray-900 dark:text-gray-100 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">{profile.name}</p>
          )}
        </div>
        <div className="transition-all duration-300 ease-in-out">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Bio</label>
          {isEditing ? (
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white transition-all duration-300 ease-in-out focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32 resize-none"
            />
          ) : (
            <p className="text-gray-900 dark:text-gray-100 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg min-h-[8rem]">{profile.bio}</p>
          )}
        </div>
      </div>

      <div className="mt-8 flex justify-end space-x-4">
        {isEditing ? (
          <>
            <button
              onClick={handleUpdateProfile}
              className="px-6 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-all duration-300 ease-in-out transform hover:scale-105 flex items-center"
            >
              <Save className="mr-2 h-5 w-5" /> Save
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setMessage(null);
                fetchProfile(params.address);
              }}
              className="px-6 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition-all duration-300 ease-in-out transform hover:scale-105 flex items-center"
            >
              <X className="mr-2 h-5 w-5" /> Cancel
            </button>
          </>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-300 ease-in-out transform hover:scale-105 flex items-center"
          >
            <Edit2 className="mr-2 h-5 w-5" /> Edit Profile
          </button>
        )}
      </div>
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
    </div>
  );
}