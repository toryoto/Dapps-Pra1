export interface EchoDetailsProps {
  title: string;
  value: string;
  linkTo?: string;
}

// ブロックチェーンから取得する生のEchoデータ（チェーン上に保存）
export interface RawEcho {
  id: number;
  echoer: string;
  cid: string;
  timestamp: number;
}

export interface ProcessedEcho {
  id: number;
  address: string;
  timestamp: Date;
  cid: string;
  message: string | null;
}

export interface ProfileDetails {
  name?: string;
  bio?: string;
  imageHash?: string;
}