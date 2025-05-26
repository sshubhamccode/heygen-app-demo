import React, { useState, useEffect } from 'react';
import { VideoUploader } from './VideoUploader';
import { VideoPreview } from './VideoPreview';
import { ProcessingOptions } from './ProcessingOptions';
import { ProofreadingDialog } from './ProofreadingDialog';
import { VideoFile, Language, ProcessVideoParams } from '../types';
import {
  uploadVideo,
  uploadVideo1,
  processVideo,
  getJobStatus,
  uploadVideoAndGetUrl,
  video_translate,
  getVideoTranslationStatus,
} from '../utils/api';

let globalVideoId: string | null = null;

export const VideoProcessor: React.FC = () => {
  const [video, setVideo] = useState<VideoFile | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>({
    code: 'en',
    name: 'English',
    flag: '🇺🇸',
  });
  const [enableLipSync, setEnableLipSync] = useState(true);
  const [quality, setQuality] = useState<'standard' | 'high'>('high');
  const [isProcessing, setIsProcessing] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [isProofreadingOpen, setIsProofreadingOpen] = useState(false);

  const handleVideoSelect = (videoFile: VideoFile) => {
    setVideo(videoFile);
  };

  const handleRemoveVideo = () => {
    if (video?.preview) {
      URL.revokeObjectURL(video.preview);
    }
    setVideo(null);
    setJobId(null);
  };

  const handleEditTranslation = async () => {
    if (typeof globalVideoId !== 'string' || globalVideoId.trim() === '') {
      console.warn('video id not fetched or is empty');
      return;
    }

    try {
      const res = await fetch(
        `https://api.heygen.com/v2/video_translate/caption?video_translate_id=${globalVideoId}&caption_type=vtt`,
        {
          method: 'GET',
          headers: {
            accept: 'application/json',
            'x-api-key':
              'NTBlNzQ0NjdkMTlhNGY1ZDg3ZGU1ZGM5YmViZmQwNmMtMTc0NzIxMDg3OQ==',
          },
        }
      );

      const result = await res.json();

      if (!result?.data?.caption_url) {
        throw new Error('Caption URL not found.');
      }

      const captionRes = await fetch(result.data.caption_url);
      const vttText = await captionRes.text();

      const subtitleText = vttText
        .split('\n')
        .filter(
          (line) =>
            !line.includes('-->') &&
            !line.includes('WEBVTT') &&
            line.trim() !== ''
        )
        .join(' ')
        .trim();

      setVideo((prev) =>
        prev ? { ...prev, translatedText: subtitleText } : null
      );
      setIsProofreadingOpen(true);
    } catch (error) {
      console.error('Failed to fetch or parse captions:', error);
      alert('Failed to load translation for proofreading.');
    }
  };

  const handleSaveTranslation = async (editedText: string) => {
    if (!video) return;

    try {
      setIsProcessing(true);
      setIsProofreadingOpen(false);

      const updatedVideo = {
        ...video,
        translatedText: editedText,
        status: 'processing',
        progress: 0,
      };
      setVideo(updatedVideo);

      const videoUrl = await uploadVideo1(video.file);
      console.log('Video uploaded successfully:', videoUrl);

      const videoId = await video_translate(
        videoUrl,
        selectedLanguage.name,
        `Translated_${video.name}`
      );
      globalVideoId = videoId;

      let videoTranslationResponse = await getVideoTranslationStatus(videoId);
      let status = videoTranslationResponse.data.status;

      while (status !== 'success' && status !== 'failed') {
        videoTranslationResponse = await getVideoTranslationStatus(videoId);
        status = videoTranslationResponse.data.status;

        if (status === 'pending') {
          setVideo((prev) =>
            prev
              ? {
                  ...prev,
                  id: videoId,
                  status: 'processing',
                  progress: 60,
                }
              : null
          );
          await new Promise((resolve) => setTimeout(resolve, 10000));
        } else if (status === 'running') {
          setVideo((prev) =>
            prev
              ? {
                  ...prev,
                  id: videoId,
                  status: 'processing',
                  progress: 80,
                }
              : null
          );
          await new Promise((resolve) => setTimeout(resolve, 20000));
        }
      }

      if (status === 'success') {
        const videoTranslatedUri = videoTranslationResponse.data.url.split('?')[0];

        setVideo((prev) =>
          prev
            ? {
                ...prev,
                status: 'completed',
                id: videoId,
                progress: 100,
                outputUrl: videoTranslatedUri,
                translatedText: editedText,
              }
            : null
        );
      } else {
        const errorMessage =
          videoTranslationResponse.data.error || 'Video processing failed';
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error('Failed to update translation:', error);
      setVideo((prev) =>
        prev
          ? {
              ...prev,
              status: 'error',
              error: error.message || 'Failed to update translation',
            }
          : null
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProcess = async () => {
    if (!video) return;

    try {
      setIsProcessing(true);

      setVideo((prev) =>
        prev
          ? {
              ...prev,
              status: 'uploading',
              progress: 0,
            }
          : null
      );

      const videoUrl = await uploadVideo1(video.file);
      console.log('Video uploaded successfully:', videoUrl);

      const videoId = await video_translate(
        videoUrl,
        selectedLanguage.name,
        `Translated_${video.name}`
      );
      console.log('Translation started with ID:', videoId);
      globalVideoId = videoId;

      let videoTranslationResponse = await getVideoTranslationStatus(videoId);
      let status = videoTranslationResponse.data.status;

      setVideo((prev) =>
        prev
          ? {
              ...prev,
              id: videoId,
              status: 'processing',
              progress: 30,
            }
          : null
      );

      while (status !== 'success' && status !== 'failed') {
        videoTranslationResponse = await getVideoTranslationStatus(videoId);
        status = videoTranslationResponse.data.status;

        if (status === 'pending') {
          setVideo((prev) =>
            prev
              ? {
                  ...prev,
                  id: videoId,
                  status: 'processing',
                  progress: 60,
                }
              : null
          );
          await new Promise((resolve) => setTimeout(resolve, 10000));
        } else if (status === 'running') {
          setVideo((prev) =>
            prev
              ? {
                  ...prev,
                  id: videoId,
                  status: 'processing',
                  progress: 80,
                }
              : null
          );
          await new Promise((resolve) => setTimeout(resolve, 20000));
        }
      }

      if (status === 'success') {
        const videoTranslatedUri = videoTranslationResponse.data.url.split('?')[0];

        setVideo((prev) =>
          prev
            ? {
                ...prev,
                status: 'completed',
                id: videoId,
                progress: 100,
                outputUrl: videoTranslatedUri,
                translatedText: videoTranslationResponse.data.translated_text,
              }
            : null
        );
      } else {
        const errorMessage =
          videoTranslationResponse.data.error || 'Video processing failed';
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error('Processing failed:', error);
      setVideo((prev) =>
        prev
          ? {
              ...prev,
              status: 'error',
              error: error.message || 'Failed to process video',
            }
          : null
      );
    } finally {
      setIsProcessing(false);
      setJobId(null);
    }
  };

  return (
    <div className="mb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">
          Video Language Converter
        </h1>
        <p className="text-slate-600">
          Upload your video, select a language, and we'll convert it with
          perfect lip sync.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {!video && <VideoUploader onVideoSelect={handleVideoSelect} />}

          {video && (
            <VideoPreview
              video={video}
              onRemove={handleRemoveVideo}
              onEdit={handleEditTranslation}
            />
          )}

          <div className="bg-white p-6 rounded-lg shadow-md border border-slate-100">
            <h2 className="text-xl font-semibold mb-4 text-slate-800">
              How It Works
            </h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold shrink-0 mt-0.5">
                  1
                </div>
                <div className="ml-4">
                  <h3 className="font-medium text-slate-800">
                    Upload your video
                  </h3>
                  <p className="text-slate-600 text-sm">
                    Select or drag & drop your video file
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold shrink-0 mt-0.5">
                  2
                </div>
                <div className="ml-4">
                  <h3 className="font-medium text-slate-800">
                    Choose language options
                  </h3>
                  <p className="text-slate-600 text-sm">
                    Select target language and processing options
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold shrink-0 mt-0.5">
                  3
                </div>
                <div className="ml-4">
                  <h3 className="font-medium text-slate-800">
                    Process your video
                  </h3>
                  <p className="text-slate-600 text-sm">
                    Our AI converts speech and syncs lips to match
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold shrink-0 mt-0.5">
                  4
                </div>
                <div className="ml-4">
                  <h3 className="font-medium text-slate-800">
                    Review and edit
                  </h3>
                  <p className="text-slate-600 text-sm">
                    Proofread and adjust the translation if needed
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold shrink-0 mt-0.5">
                  5
                </div>
                <div className="ml-4">
                  <h3 className="font-medium text-slate-800">
                    Download and share
                  </h3>
                  <p className="text-slate-600 text-sm">
                    Get your video in the new language
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <ProcessingOptions
            selectedLanguage={selectedLanguage}
            onLanguageSelect={setSelectedLanguage}
            enableLipSync={enableLipSync}
            onLipSyncChange={setEnableLipSync}
            quality={quality}
            onQualityChange={setQuality}
            onProcess={handleProcess}
            isProcessing={isProcessing}
            videoSelected={!!video}
          />

          <div className="mt-6 bg-white p-6 rounded-lg shadow-md border border-slate-100">
            <h2 className="text-xl font-semibold mb-4 text-slate-800">
              Processing Tips
            </h2>
            <ul className="space-y-2 text-slate-700">
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span>Use high-quality original videos</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span>Ensure clear speech in the original</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span>Processing time depends on video length</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span>High quality mode produces better results</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {isProofreadingOpen && video && (
        <ProofreadingDialog
          isOpen={isProofreadingOpen}
          onClose={() => setIsProofreadingOpen(false)}
          translatedText={video.translatedText || ''}
          onSave={handleSaveTranslation}
          isProcessing={isProcessing}
        />
      )}
    </div>
  );
};