import { NextRequest, NextResponse } from 'next/server';
import { getMessageFromPinata } from '../pinataUtils';

export async function GET(request: NextRequest) {
  // 送られてきたリクエストからcidを取得
  const cid = request.nextUrl.searchParams.get('cid');
  if (!cid) {
    return NextResponse.json({ error: 'CID is required' }, { status: 400 });
  }

  try {
    const message = await getMessageFromPinata(cid);
    if (message === null) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }
    return NextResponse.json({ message });
  } catch (error) {
    console.error('Error in getMessage API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}