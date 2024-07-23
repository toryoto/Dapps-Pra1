export interface EchoDetailsProps {
  title: string;
  value: string;
}

export interface ProcessedEcho {
  id: number;
  address: string;
  timestamp: Date;
  cid: string;
  message: string | null;
}