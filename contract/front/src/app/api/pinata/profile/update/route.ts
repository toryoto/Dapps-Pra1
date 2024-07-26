// プロフィールの値を受け取り、Pinataに保存、ブロックチェーン上に保存する処理を行う
import { NextRequest, NextResponse } from 'next/server';
import { ProfileDetails } from '@/app/types/type';
import { uploadProfileDetailsToPinata, uploadProfileImageToPinata } from '../../pinataUtils';

export async function POST(request: NextRequest) {
  try {
    // リクエストにはユーザプロフィールの要素が含まれる
    const formData = await request.formData();
    const address = formData.get('address') as string;
    const bio = formData.get('bio') as string | null;
    const imageFile = formData.get('image') as File | null;

    if (!address) return NextResponse.json({ error: 'Missing required field: address' }, { status: 400 });

    // 画像をPinataに保存し、CIDを返す
    let imageCID = '';
    if (imageFile) imageCID = await uploadProfileImageToPinata(imageFile, address);

    const profileDetails: ProfileDetails = {
      bio: bio || '',
    };
    if (imageCID) profileDetails.imageHash = imageCID;

    // bioかimageHashが存在すれば新たにPinataに保存
    let detailsCID = null;
    if (profileDetails.bio || profileDetails.imageHash) {
      detailsCID = await uploadProfileDetailsToPinata(profileDetails, address);
    }

    return NextResponse.json({ message: 'Profile updated successfully', detailsCID });
  } catch (error) {
    console.error('Error in profile update API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}