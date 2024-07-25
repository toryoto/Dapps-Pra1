import { NextRequest, NextResponse } from 'next/server';
import { getProfileDetailsFromPinata } from '../../pinataUtils';
import { getDetailsCIDFromBlockchain, getNameFromBlockChain } from '@/utils/profileContract';
import { N } from 'ethers';

interface ProfileDetails {
  bio: string;
  imageHash?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const name = await getNameFromBlockChain(params.address);
    const detailsCID = await getDetailsCIDFromBlockchain(params.address);
    if (!name || !detailsCID)  return NextResponse.json({ error: 'Profile not found on blockchain' }, { status: 404 });

    const profileDetails: ProfileDetails | null = await getProfileDetailsFromPinata(detailsCID);
    if (!profileDetails) return NextResponse.json({ error: 'Profile details not found on IPFS' }, { status: 404 });

    const profile = {
      name,
      bio: profileDetails.bio,
      imageCID: profileDetails.imageHash || ''
    };

    return NextResponse.json(profile)
  } catch (error) {
    console.error('Error in get profile API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}