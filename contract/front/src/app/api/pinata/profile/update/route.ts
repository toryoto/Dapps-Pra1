// プロフィールの値を受け取り、Pinataに保存、ブロックチェーン上に保存する処理を行う
import { NextRequest, NextResponse } from 'next/server';
import { uploadProfileDetailsToPinata, uploadProfileImageToPinata } from '../../pinataUtils';

export async function POST(request: NextRequest) {
  try {
    // リクエストにはユーザプロフィールの要素が含まれる
    const formData = await request.formData();
    const address = formData.get('address') as string;
    const bio = formData.get('bio') as string | null;
    const imageFile = formData.get('image') as File | null;

    if (!address) {
      return NextResponse.json({ error: 'Missing required field: address' }, { status: 400 });
    }

    let imageCID = '';
    if (imageFile) imageCID = await uploadProfileImageToPinata(imageFile, address);

    // bioとimageHashが空ならIPFS保存をスキップ
    if (!address && !bio) {
      return NextResponse.json({ message: 'No profile details to update', detailsCID: null });
    }

    const profileDetails = {
      ...(bio !== null && { bio }),
      ...(imageCID && { imageHash: imageCID })
    };

    const detailsCID = await uploadProfileDetailsToPinata(profileDetails, address);

    return NextResponse.json({ message: 'Profile updated successfully', detailsCID });
  } catch (error) {
    console.error('Error in profile update API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}