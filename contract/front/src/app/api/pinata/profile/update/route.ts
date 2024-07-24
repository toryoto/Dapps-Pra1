// プロフィールの値を受け取り、Pinataに保存、ブロックチェーン上に保存する処理を行う
import { NextRequest, NextResponse } from 'next/server';
import { uploadProfileDetailsToPinata, uploadProfileImageToPinata } from '../../pinataUtils';

export async function POST(request: NextRequest) {
  try {
    // リクエストにはユーザプロフィールの要素が含まれる
    const formData = await request.formData();
    const address = formData.get('address') as string;
    const name = formData.get('name') as string;
    const bio = formData.get('bio') as string;
    const imageFile = formData.get('image') as File | null;

    // リクエストに値が含まれていなければエラー
    if (!address || !name || !bio) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // imageをPinataに保存してCIDを取得する処理
    let imageCID = formData.get('currentImageCID') as string || '';
    if (imageFile) imageCID = await uploadProfileImageToPinata(imageFile, address);

    const profileDetails = {
      bio,
      imageCID
    };

    const detailsCID = await uploadProfileDetailsToPinata(profileDetails, address);

    return NextResponse.json({ message: 'Profile updated successfully', detailsCID });
  } catch (error) {
    console.error('Error in profile update API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}