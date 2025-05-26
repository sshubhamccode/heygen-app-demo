import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

// Add auth token to all requests
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const db = {
  async getVideos() {
    const response = await axios.get(`${API_BASE_URL}/videos`);
    return response.data.videos;
  },

  async createVideo(data: {
    name: string;
    original_url: string;
    processed_url: string;
    target_language: string;
    status: string;
  }) {
    const response = await axios.post(`${API_BASE_URL}/videos`, data);
    return response.data;
  },

  async getAvatarGenerations() {
    const response = await axios.get(`${API_BASE_URL}/avatar-generations`);
    return response.data.generations;
  },

  async createAvatarGeneration(data: {
    avatar_id: string;
    voice_id: string;
    text: string;
    video_url?: string;
  }) {
    const response = await axios.post(`${API_BASE_URL}/avatar-generations`, data);
    return response.data;
  }
};