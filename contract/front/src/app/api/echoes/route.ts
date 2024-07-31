import { NextResponse } from "next/server";
import { getMessageFromPinata } from "../pinata/pinataUtils";
import { RawEcho } from "@/app/types/type";
import { getReadOnlyContract } from "@/utils/ethereumUtils";

// 読み取り専用のコントラクトを使用してすべてのEchoを取得する処理
export async function GET(request: Request): Promise<NextResponse> {
  try {
    const contract = await getReadOnlyContract();

    // スマートコントラクトからすべてのエコーのCIDを取得
    // struct Echo {
    //   uint256 id;
    //   address echoer;
    //   string cid;
    //   uint256 timestamp;
    // }
    const echoes = await contract.getAllEchoes();

    if (echoes.length === 0) {
      return NextResponse.json([], { status: 204 }); // No Content
    };

    const processedEchoes = await Promise.all(echoes.map(async (echo: RawEcho) => {
      const message = await getMessageFromPinata(echo.cid)
      
      return {
        id: Number(echo.id),
        address: echo.echoer,
        timestamp: new Date(Number(echo.timestamp) * 1000).toLocaleString(),
        cid: echo.cid,
        message: message,
      };
    }));

    return NextResponse.json(processedEchoes)
  } catch (error) {
    console.error("Failed to create read-only contract instance:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}