import React, { useState, useEffect } from 'react';
import AvatarSelector from './AvatarSelector';
import VoiceSelector from './VoiceSelector';
import TextInput from './TextInput';
import PreviewPanel from './PreviewPanel';
import ControlPanel from './ControlPanel';
import { fetchAvatars, fetchVoices } from '../utils/heygen-api';
import { Avatar, Voice } from '../types';
import axios from 'axios';

const API_KEY = 'NTBlNzQ0NjdkMTlhNGY1ZDg3ZGU1ZGM5YmViZmQwNmMtMTc0NzIxMDg3OQ==';

const HeygenAvatar: React.FC = () => {
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>('');
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>('');
  const [speechText, setSpeechText] = useState<string>('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [avatarsData, voicesData] = await Promise.all([
          fetchAvatars(),
          fetchVoices()
        ]);

        const mappedAvatars = avatarsData.map((avatar: any) => ({
          id: avatar.avatar_id,
          name: avatar.avatar_name,
          imageUrl: avatar.preview_image_url || 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
          description: `Gender: ${avatar.gender}, Type: ${avatar.type || 'Standard'}`
        }));

        const mappedVoices = voicesData.map((voice: any) => ({
          id: voice.voice_id,
          name: voice.name,
          gender: voice.gender,
          language: voice.language,
          previewUrl: voice.preview_audio
        }));

        setAvatars(mappedAvatars);
        setVoices(mappedVoices);

        if (mappedAvatars.length > 0) {
          setSelectedAvatarId(mappedAvatars[0].id);
        }
        if (mappedVoices.length > 0) {
          setSelectedVoiceId(mappedVoices[0].id);
        }
      } catch (err) {
        console.error('Failed to load data:', err);
        setError('Failed to load avatars and voices. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const isFormValid = 
    selectedAvatarId !== '' && 
    selectedVoiceId !== '' && 
    speechText.trim() !== '' && 
    speechText.length <= 500;

  const handleReset = () => {
    setSelectedAvatarId('');
    setSelectedVoiceId('');
    setSpeechText('');
    setVideoUrl(null);
    setError(null);
  };

  const checkVideoStatus = async (videoId: string): Promise<string> => {
    const response = await axios.get(`https://api.heygen.com/v1/video_status.get?video_id=${videoId}`, {
      headers: {
        'X-Api-Key': API_KEY,
        'Accept': 'application/json'
      }
    });

    const status = response.data.data.status;
    const videoUrl = response.data.data.video_url;

    if (status === 'completed' && videoUrl) {
      return videoUrl;
    } else if (status === 'failed') {
      throw new Error('Video generation failed');
    }
    throw new Error('pending');
  };

  const handleGenerate = async () => {
    if (!isFormValid || isGenerating) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await axios.post('https://api.heygen.com/v2/video/generate', 
        {
          video_inputs: [
            {
              character: {
                type: "avatar",
                avatar_id: selectedAvatarId,
                avatar_style: "normal"
              },
              voice: {
                type: "text",
                input_text: speechText,
                voice_id: selectedVoiceId
              },
              background: {
                type: "color",
                value: "#FFFFFF"
              }
            }
          ],
          dimension: {
            width: 1280,
            height: 720
          }
        },
        {
          headers: {
            'X-Api-Key': API_KEY,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      const videoId = response.data.data.video_id;
      
      let attempts = 0;
      const maxAttempts = 60;
      
      while (attempts < maxAttempts) {
        try {
          const finalVideoUrl = await checkVideoStatus(videoId);
          setVideoUrl(finalVideoUrl);
          break;
        } catch (error) {
          if (error instanceof Error && error.message === 'pending') {
            await new Promise(resolve => setTimeout(resolve, 3000));
            attempts++;
          } else {
            throw error;
          }
        }
      }
      
      if (attempts >= maxAttempts) {
        throw new Error('Video generation timed out');
      }
    } catch (err) {
      console.error('Error generating video:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate video');
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Heygen Avatar Generator
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Select an avatar and voice, then enter text to create a video with your virtual presenter.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6 space-y-8">
            <AvatarSelector 
              avatars={avatars}
              selectedAvatarId={selectedAvatarId}
              onSelectAvatar={setSelectedAvatarId}
            />
            
            <VoiceSelector 
              voices={voices}
              selectedVoiceId={selectedVoiceId}
              onSelectVoice={setSelectedVoiceId}
            />
            
            <TextInput 
              text={speechText}
              onTextChange={setSpeechText}
              maxLength={500}
            />
            
            <ControlPanel 
              onGenerate={handleGenerate}
              onReset={handleReset}
              isGenerating={isGenerating}
              isFormValid={isFormValid}
            />
          </div>
        </div>
        
        <div className="lg:col-span-3">
          <PreviewPanel 
            videoUrl={videoUrl}
            isLoading={isGenerating}
            error={error}
          />
        </div>
      </div>
    </div>
  );
};

export default HeygenAvatar;