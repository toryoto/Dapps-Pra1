// プロフィールの値を受け取り、Pinataに保存、ブロックチェーン上に保存する処理を行う
import { NextRequest, NextResponse } from 'next/server';
import { ProfileDetails } from '@/app/types/type';
import { uploadProfileDetailsToPinata, uploadProfileImageToPinata } from '../../pinata/pinataUtils';

export async function POST(request: NextRequest) {
  try {
    // リクエストにはユーザプロフィールの要素が含まれる
    const formData = await request.formData();
    const address = formData.get('address') as string;
    const name = formData.get('name') as string | null;
    const bio = formData.get('bio') as string | null;
    const imageFile = formData.get('imageFile') as File | null;
    const imageHash = formData.get('imageHash') as string | null;

    if (!address) return NextResponse.json({ error: 'Missing required field: address' }, { status: 400 });

    const profileDetails: ProfileDetails = {};
    if (name && typeof name === 'string') profileDetails.name = name;
    if (bio && typeof bio === 'string') profileDetails.bio = bio;

    // 画像をPinataに保存し、CIDを返す
    if (imageFile) {
      const imageCID = await uploadProfileImageToPinata(imageFile, address);
      profileDetails.imageHash = imageCID
    } else if (imageHash) {
      // 既存のイメージから変更がない場合
      profileDetails.imageHash = imageHash
    }

    let detailsCID = null;
    // 1つでも更新するものがあればPinataに保存
    if (Object.keys(profileDetails).length > 0) {
      detailsCID = await uploadProfileDetailsToPinata(profileDetails, address);
    }

    return NextResponse.json({ message: 'Profile updated successfully', detailsCID });
  } catch (error) {
    console.error('Error in profile update API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}