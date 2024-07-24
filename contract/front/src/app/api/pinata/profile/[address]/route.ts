import { NextRequest, NextResponse } from 'next/server';
import { getProfileDetailsFromPinata } from '../../pinataUtils';

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const profile = await getProfileDetailsFromPinata(params.address);
    if (profile) return NextResponse.json(profile);
    else return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  } catch (error) {
    console.error('Error in get profile API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}