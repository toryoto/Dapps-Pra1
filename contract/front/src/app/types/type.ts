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
  name?: string;
  bio?: string;
  imageHash?: string;
}