import axios from 'axios';
import { getAuthToken } from './auth';
import * as fs from 'fs';
import axiosRetry from 'axios-retry';
import {
  VideoFile,
  HeyGenJobStatus,
  ProcessVideoParams,
  HeyGenLanguage,
} from '../types';

const API_URL = 'http://localhost:5000';
const API_BASE_URL = 'https://api.heygen.com/v2';
const API_KEY = 'NTBlNzQ0NjdkMTlhNGY1ZDg3ZGU1ZGM5YmViZmQwNmMtMTc0NzIxMDg3OQ==';


const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    accept: 'application/json',
    'x-api-key': API_KEY,
  },
  timeout: 30000,
});

axiosRetry(axiosInstance, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    return (
      axiosRetry.isNetworkOrIdempotentRequestError(error) ||
      error.code === 'ECONNABORTED' ||
      error.code === 'ETIMEDOUT' ||
      (error.response?.status >= 500 && error.response?.status <= 599) ||
      error.response?.status === 429
    );
  },
});


const api = axios.create({
  baseURL: API_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getVideos = async () => {
  const response = await api.get('/videos');
  return response.data.videos;
};

export const createVideo = async (videoData: any) => {
  const response = await api.post('/videos', videoData);
  return response.data;
};

export const getAvatarGenerations = async () => {
  const response = await api.get('/avatar-generations');
  return response.data.generations;
};

export const createAvatarGeneration = async (generationData: any) => {
  const response = await api.post('/avatar-generations', generationData);
  return response.data;
};

// Keep the existing HeyGen API functions
export { fetchAvatars, fetchVoices } from './heygen-api';

export const getVideoTranslationStatus = async (
  videoId: string
): Promise<any> => {
  try {
    if (!videoId) {
      throw new Error('Video ID is required for status check');
    }

    const response = await axios.get(
      `${API_BASE_URL}/video_translate/${videoId}`,
      {
        headers: {
          accept: 'application/json',
          'x-api-key': API_KEY,
        },
      }
    );

    if (!response.data?.data) {
      console.error('Invalid status response:', response.data);
      throw new Error('Invalid status response format');
    }

    console.log('Translation status:', {
      id: videoId,
      status: response.data.data.status,
      error: response.data.data.error
    });

    return response.data;
  } catch (error: any) {
    console.error('Status check failed:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });

    if (error.response?.status === 404) {
      throw new Error('Translation job not found');
    }

    throw new Error(
      error.response?.data?.message ||
      error.message ||
      'Failed to check translation status'
    );
  }
};

export const uploadVideo1 = async (file: File): Promise<string> => {
  try {
    validateVideoFile(file);

    const response = await axios.post(
      'https://upload.heygen.com/v1/asset',
      file,
      {
        headers: {
          accept: 'application/json, text/plain, */*',
          'x-api-key': API_KEY,
          'Content-Type': 'video/mp4',
        },
      }
    );

    if (!response.data?.data?.url) {
      console.error('Invalid upload response:', response.data);
      throw new Error('Failed to get video URL from upload response');
    }

    return response.data.data.url;
  } catch (error: any) {
    console.error('Video upload failed:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw new Error(
      error.response?.data?.message ||
      error.message ||
      'Failed to upload video'
    );
  }
};

export const video_translate = async (
  videoUrl: string,
  outputLanguage: string,
  title: string
): Promise<string> => {
  try {
    if (!videoUrl || !outputLanguage || !title) {
      throw new Error('Missing required parameters for video translation');
    }

    const payload = {
      video_url: videoUrl,
      output_language: outputLanguage,
      title: title,
    };

    console.log('Translation request payload:', payload);

    const response = await axiosInstance.post('/video_translate', payload, {
      headers: {
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
    });

    console.log('Translation response:', response.data);

    if (!response.data?.data?.video_translate_id) {
      console.error('Invalid translation response:', response.data);
      throw new Error('Failed to get translation ID from response');
    }

    return response.data.data.video_translate_id;
  } catch (error: any) {
    console.error('Translation request failed:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });

    if (error.response?.status === 415) {
      throw new Error(
        'The video format is not supported. Please ensure you are using a valid video URL.'
      );
    }

    if (error.response?.status === 413) {
      throw new Error(
        'Video file is too large or the payload exceeded limits.'
      );
    }

    throw new Error(
      error.response?.data?.message ||
      error.message ||
      'Failed to start video translation'
    );
  }
};

export const fetchSupportedLanguages = async (): Promise<HeyGenLanguage[]> => {
  try {
    const response = await axiosInstance.get(
      '/video_translate/target_languages'
    );

    if (
      !response.data?.data?.languages ||
      !Array.isArray(response.data.data.languages)
    ) {
      console.error('Invalid API response structure:', response.data);
      throw new Error('Invalid API response format');
    }

    return response.data.data.languages.map((languageName: string) => {
      const languageCode = languageName.toLowerCase().replace(/\s+/g, '_');
      return {
        language_code: languageCode,
        language_name: languageName,
      };
    });
  } catch (error: any) {
    console.error('Failed to fetch supported languages:', error);
    throw error;
  }
};