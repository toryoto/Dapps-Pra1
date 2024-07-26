import { NextRequest, NextResponse } from 'next/server';
import { uploadToPinata } from '../pinataUtils';

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    console.log('Uploading message to Pinata:', message);

    const cid = await uploadToPinata(message);
    
    if (!cid) {
      console.error('Failed to get CID from Pinata');
      return NextResponse.json({ error: 'Failed to upload to Pinata' }, { status: 500 });
    }

    console.log('Successfully uploaded to Pinata. CID:', cid);

    return NextResponse.json({ cid });
  } catch (error) {
    console.error('Error in upload API:', error);
    
    // エラーオブジェクトの詳細をログに出力
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}