import { NextRequest, NextResponse } from 'next/server';
import { getProfileDetailsFromPinata } from '../../pinataUtils';
import { getDetailsCIDFromBlockchain, getNameFromBlockChain } from '@/utils/profileContract';
import { N } from 'ethers';
import { ProfileDetails } from '@/app/types/type';

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const name = await getNameFromBlockChain(params.address);
    const detailsCID = await getDetailsCIDFromBlockchain(params.address);
    if (!name || !detailsCID)  return NextResponse.json({ error: 'Profile not found on blockchain' }, { status: 404 });

    let profileDetails: ProfileDetails = { bio: '' };

    if (detailsCID) {
      const fetchedDetails = await getProfileDetailsFromPinata(detailsCID);
      if (fetchedDetails) {
        profileDetails = fetchedDetails;
      }
    }

    const profile = {
      name,
      ...profileDetails
    };

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error in get profile API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}