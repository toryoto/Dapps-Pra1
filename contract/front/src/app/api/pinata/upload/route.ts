import { NextRequest, NextResponse } from 'next/server';
import { uploadToPinata } from '../pinataUtils';

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const cid = await uploadToPinata(message);
    return NextResponse.json({ cid });
  } catch (error) {
    console.error('Error in upload API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}