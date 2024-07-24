import axios from 'axios';

const pinataApiKey = process.env.PINATA_API_KEY;
const pinataSecretApiKey = process.env.PINATA_SECRET_API_KEY;

interface ProfileDetails {
  bio: string;
  imageHash?: string;
}

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


// bioとimageのCIDを含むオブジェクトをPinataに保存する
export async function uploadProfileDetailsToPinata(details: ProfileDetails, address: string) {
  const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
  const data = JSON.stringify({
    pinataContent: details,
    pinataMetadata: {
      name: `profile_details_${address.toLowerCase()}`
    }
  });

  try {
    const res = await axios.post(url, data, {
      headers: {
        'Content-Type': 'application/json',
        pinata_api_key: pinataApiKey,
        pinata_secret_api_key: pinataSecretApiKey
      }
    });
    
    return res.data.IpfsHash;
  } catch (error) {
    console.error('Error uploading profile details to Pinata:', error);
    throw error;
  }
}

// 画像をPinataに保存して保存先のHashを変えす
export async function uploadProfileImageToPinata(imageFile: File, address: string) {
  const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;

  // FormDataオブジェクト：keyとvalueのセット。サーバへのデータ送信に使われる
  const formData = new FormData();
  formData.append('file', imageFile);

  formData.append('pinataMetadata', JSON.stringify({
    name: `profile_image_${address.toLowerCase()}_${Date.now()}`,
  }));

  try {
    const res = await axios.post(url, formData, {
      maxBodyLength: Infinity,
      headers: {
        'Content-Type': `multipart/form-data`,
        pinata_api_key: pinataApiKey,
        pinata_secret_api_key: pinataSecretApiKey
      }
    });
    
    return res.data.IpfsHash;
  } catch (error) {
    console.error('Error uploading profile image to Pinata:', error);
    throw error;
  }
}

export async function getProfileDetailsFromPinata(cid: string): Promise<ProfileDetails | null> {
  const url = `https://gateway.pinata.cloud/ipfs/${cid}`;

  try {
    const res = await axios.get(url);
    return res.data as ProfileDetails;
  } catch (error) {
    console.error('Error fetching profile details from Pinata:', error);
    return null;
  }
}