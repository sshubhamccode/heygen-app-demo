import axios from 'axios';

const API_KEY = 'NTBlNzQ0NjdkMTlhNGY1ZDg3ZGU1ZGM5YmViZmQwNmMtMTc0NzIxMDg3OQ==';

const heygenApi = axios.create({
  baseURL: 'https://api.heygen.com/v2',
  headers: {
    'X-Api-Key': API_KEY,
    'Accept': 'application/json'
  }
});

export const fetchAvatars = async () => {
  try {
    const response = await heygenApi.get('/avatars');
    return response.data.data.avatars || [];
  } catch (error) {
    console.error('Error fetching avatars:', error);
    throw error;
  }
};

export const fetchVoices = async () => {
  try {
    const response = await heygenApi.get('/voices');
    return response.data.data.voices || [];
  } catch (error) {
    console.error('Error fetching voices:', error);
    throw error;
  }
};