export interface EchoDetailsProps {
  title: string;
  value: string;
  linkTo?: string;
}

export interface ProcessedEcho {
  id: number;
  address: string;
  timestamp: Date;
  cid: string;
  message: string | null;
}

export interface ProfileDetails {
  bio?: string;
  imageHash?: string;
}