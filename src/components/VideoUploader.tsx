import React, { useCallback, useState } from 'react';
import { Upload, FileVideo } from 'lucide-react';
import { VideoFile } from '../types';

interface VideoUploaderProps {
  onVideoSelect: (video: VideoFile) => void;
}

export const VideoUploader: React.FC<VideoUploaderProps> = ({ onVideoSelect }) => {
  const [isDragging, setIsDragging] = useState(false);
  
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);
  
  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);
  
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      validateAndSelectFile(file);
    }
  }, []);
  
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      validateAndSelectFile(file);
    }
  }, []);

  const validateAndSelectFile = (file: File) => {
    // Check file extension
    if (!file.name.toLowerCase().endsWith('.mp4')) {
      alert('Please upload an MP4 video file.');
      return;
    }

    // Check MIME type
    if (file.type !== 'video/mp4') {
      alert('Invalid MP4 file. Please ensure the file is a valid MP4 video.');
      return;
    }

    // Check file size (500MB limit)
    const maxSize = 500 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('Video file is too large. Maximum size is 500MB.');
      return;
    }

    handleFileSelect(file);
  };
  
  const handleFileSelect = (file: File) => {
    const previewUrl = URL.createObjectURL(file);
    
    const videoFile: VideoFile = {
      file,
      preview: previewUrl,
      name: file.name,
      size: file.size,
      status: 'idle',
    };
    
    onVideoSelect(videoFile);
  };
  
  return (
    <div 
      className={`relative border-2 border-dashed rounded-lg p-8 transition-all duration-200 flex flex-col items-center justify-center
        ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{ minHeight: '250px' }}
    >
      <FileVideo className={`w-12 h-12 mb-4 ${isDragging ? 'text-blue-500' : 'text-slate-400'}`} />
      <h3 className="text-lg font-medium mb-2">Upload your video</h3>
      <p className="text-slate-500 text-center mb-6 max-w-md">
        Drag and drop your MP4 video file here, or click to browse
      </p>
      
      <label className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors cursor-pointer">
        <input 
          type="file" 
          accept="video/mp4"
          className="hidden" 
          onChange={handleFileChange}
        />
        Select Video
      </label>
      
      <div className="mt-4 text-sm text-slate-500">
        Supported format: MP4 only (max 500MB)
      </div>
      
      {isDragging && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 rounded-lg z-10">
          <div className="text-lg font-medium text-blue-500">Drop your MP4 video here</div>
        </div>
      )}
    </div>
  );
};