import axios from 'axios';

const pinataApiKey = process.env.PINATA_API_KEY;
const pinataSecretApiKey = process.env.PINATA_SECRET_API_KEY;

export async function uploadToPinata(message: string) {
  const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
  const data = JSON.stringify({
    pinataContent: { message: message }
  });

  try {
    const res= await axios.post(url, data, {
      headers: {
        'Content-Type': 'application/json',
        pinata_api_key: pinataApiKey,
        pinata_secret_api_key: pinataSecretApiKey
      }
    });
    
    // データ取得先のCIDを返す
    return res.data.IpfsHash
  } catch (error) {
    console.error('Error uploading to Pinata:', error);
    throw error;
  }
}

export async function getMessageFromPinata(cid: string) {
  const url = `https://gateway.pinata.cloud/ipfs/${cid}`;

  try {
    const res = await axios.get(url);
    
    return res.data.message
  } catch (error) {
    console.error('Error fetching message from Pinata', error);
    return null;
  }
}