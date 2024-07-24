"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { User, Save, X, AlertCircle } from 'lucide-react';
import { hasProfileOnBlockchain, updateProfileOnBlockchain } from '@/utils/profileContract';

interface UserProfile {
  name: string;
  bio: string;
  imageHash: string;
}

export default function UserProfile({ params }: { params: { address: string } }) {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({ name: 'No Name', bio: 'No Bio', imageHash: '' });
  const [errors, setErrors] = useState<Partial<UserProfile>>({});
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const getProfile = useCallback(async (address: string) => {
    try {
      const res = await fetch(`http://localhost:3000/api/pinata/profile/${address}`);
      if (!res.ok) throw new Error('Failed to fetch profile');

      const data = await res.json();
      return {
        name: data.name || 'No Name',
        bio: data.bio || 'No Bio',
        imageHash: data.imageHash || '' 
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  }, []);

  const fetchProfile = useCallback(async (address: string) => {
    try {
      const hasProfile = await hasProfileOnBlockchain(address);
      if (!hasProfile) {
        console.log("プロフィールが存在しません");
        setProfile({ name: 'No Name', bio: 'No Bio', imageHash: '' });
        return;
      }
      const fetchedProfile = await getProfile(address);
      if (fetchedProfile) setProfile(fetchedProfile);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setMessage({ type: 'error', text: 'Failed to fetch profile' });
    }
  }, [getProfile]);

  useEffect(() => {
    fetchProfile(params.address);
  }, [params.address, fetchProfile]);

  const updateProfile = async (address: string, data: { name: string; bio: string; imageFile?: File | null }) => {
    try {
      const formData = new FormData();
      formData.append('address', address);
      formData.append('name', data.name);
      formData.append('bio', data.bio);
      if (data.imageFile) formData.append('image', data.imageFile);

      // POSTメソッドでは以下の処理が行われる
      // 1. imageをIPFSに保存後、保存先アドレスをbioと一緒にIPFSに保存してそのアドレスを返す
      console.log(111);
      const res = await fetch('http://localhost:3000/api/pinata/profile/update', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Failed to update profile');
      }

      const result = await res.json();

      // nameとbio,imageのIPFS上保存先アドレスをブロックチェーン上に保存
      const success = await updateProfileOnBlockchain(data.name, result.detailsCID);

      if (success) return { success: true, message: 'Profile updated successfully' };
      else return { success: false, message: 'Failed to update profile on blockchain' };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { success: false, message: 'Failed to update profile' };
    }
  };

  const validateProfile = (data: UserProfile): boolean => {
    const newErrors: Partial<UserProfile> = {};
    if (data.name.length < 2) newErrors.name = 'Name must be at least 2 characters';
    if (data.name.length > 50) newErrors.name = 'Name must be less than 50 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateProfile(profile)) return;

    try {
      const result = await updateProfile(params.address, {
        name: profile.name,
        bio: profile.bio,
        imageFile: imageFile
      });

      if (result.success) {
        setIsEditing(false);
        setMessage({ type: 'success', text: 'Profile updated successfully' });
        fetchProfile(params.address); // Refresh profile data
      } else setMessage({ type: 'error', text: result.message });
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'Failed to update profile' });
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 relative transition-all duration-300 ease-in-out">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">User Profile</h1>
      <div className="absolute top-4 right-4 text-gray-400">
        <User className="h-6 w-6" />
      </div>

      {message && (
        <div className={`mb-4 p-2 ${message.type === 'error' ? 'bg-red-100 text-red-700 border-red-400' : 'bg-green-100 text-green-700 border-green-400'} border rounded flex items-center transition-all duration-300 ease-in-out`}>
          <AlertCircle className="h-5 w-5 mr-2" />
          {message.text}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Address</label>
          <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{params.address}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
          {isEditing ? (
            <div>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 transition-all duration-300 ease-in-out text-gray-900 dark:text-white bg-white dark:bg-gray-700"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>
          ) : (
            <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{profile.name}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bio</label>
          {isEditing ? (
            <div>
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 transition-all duration-300 ease-in-out text-gray-900 dark:text-white bg-white dark:bg-gray-700"
              />
              {errors.bio && <p className="mt-1 text-sm text-red-600">{errors.bio}</p>}
            </div>
          ) : (
            <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{profile.bio}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Profile Image</label>
          {profile.imageHash ? (
            <img src={`https://gateway.pinata.cloud/ipfs/${profile.imageHash}`} alt="Profile" className="mt-1 w-32 h-32 object-cover rounded-full" />
          ) : (
            <div className="mt-1 w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="h-16 w-16 text-gray-400" />
            </div>
          )}
          {isEditing && (
            <div className="mt-2">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
          )}
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        {isEditing ? (
          <div className="space-x-2">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 transition-all duration-300 ease-in-out"
            >
              <Save className="h-4 w-4 inline-block mr-1" />
              <span>Save</span>
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setErrors({});
                setMessage(null);
                fetchProfile(params.address); // Reset to original data
              }}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition-all duration-300 ease-in-out"
            >
              <X className="h-4 w-4 inline-block mr-1" /> Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-300 ease-in-out"
          >
            Edit Profile
          </button>
        )}
      </div>
    </div>
  );
}