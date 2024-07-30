import { NextRequest, NextResponse } from "next/server";
import { getProfileDetailsFromPinata } from "../../pinata/pinataUtils";
import { getReadOnlyContract } from "@/utils/profileContract";

interface RawProfile {
  0: string;  // detailsCID(name, bio, imageCID)
  1: bigint;  // lastUpdated
}

// 読み取り専用のコントラクトを使用してサーバーサイドでプロフィール詳細を取得して返す処理
export async function GET(request: NextRequest, { params }: { params: { address: string } }): Promise<NextResponse> {
  try {
    // リクエストURLからaddressを取得
    const address = params.address;
    if (!address || !address.startsWith('0x')) return NextResponse.json({ error: 'Invalid address' }, { status: 400 });

    // userProfileContractを読み取り専用で取得
    const contract = await getReadOnlyContract();

    // プロフィールが設定されていなければ、初期値を返す
    const hasProfile = await contract.hasProfile(address);
    if (!hasProfile) return NextResponse.json({
      name: 'No Name',
      bio: 'No Bio'
    });

    // ブロックチェーン上からプロフィールCIDを取得
    const profile: RawProfile = await contract.getProfile(address);
    const processedProfile = {
      detailsCID: profile[0],
      lastUpdated: new Date(Number(profile[1]) * 1000)
    };

    // Pinataからプロフィールデータを取得
    const profileDetails = await getProfileDetailsFromPinata(processedProfile.detailsCID);

    return NextResponse.json({
      ...profileDetails,
      lastUpdated: processedProfile.lastUpdated
    });
  } catch (error) {
    console.error("Failed to create read-only contract instance:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}