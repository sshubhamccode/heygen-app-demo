import React, { useRef, useEffect } from 'react';
import { Play, RefreshCw, Download, Trash2, AlertCircle, Edit2 } from 'lucide-react';
import { VideoFile } from '../types';

interface VideoPreviewProps {
  video: VideoFile;
  onRemove: () => void;
  onEdit?: () => void;
}

export const VideoPreview: React.FC<VideoPreviewProps> = ({ video, onRemove, onEdit }) => {
  const originalVideoRef = useRef<HTMLVideoElement>(null);
  const processedVideoRef = useRef<HTMLVideoElement>(null);

  const downloadVideo = () => {
    if (video.outputUrl) {
      const a = document.createElement('a');
      a.href = video.outputUrl;
      a.download = `processed-${video.name}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
    else return (bytes / 1048576).toFixed(2) + ' MB';
  };

  useEffect(() => {
    if (originalVideoRef.current) {
      originalVideoRef.current.src = video.preview;
      originalVideoRef.current.load();
    }

    if (processedVideoRef.current && video.outputUrl) {
      processedVideoRef.current.src = video.outputUrl;
      processedVideoRef.current.load();
    }
  }, [video.preview, video.outputUrl]);

  const renderProgress = () => {
    if (video.status === 'uploading' || video.status === 'processing') {
      return (
        <div className="w-full bg-slate-200 rounded-full h-2 mt-4">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${video.progress || 0}%` }}
          ></div>
        </div>
      );
    }
    return null;
  };

  const renderStatusMessage = () => {
    switch (video.status) {
      case 'uploading':
        return (
          <div className="flex items-center text-blue-500 mt-2">
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            <span>Uploading video... {video.progress ? `${Math.round(video.progress)}%` : ''}</span>
          </div>
        );
      case 'processing':
        return (
          <div className="flex items-center text-amber-500 mt-2">
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            <span>Processing video... {video.progress ? `${Math.round(video.progress)}%` : ''}</span>
          </div>
        );
      case 'completed':
        return (
          <div className="flex items-center text-green-500 mt-2">
            <Play className="w-4 h-4 mr-2" />
            <span>Processing complete!</span>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center text-red-500 mt-2">
            <AlertCircle className="w-4 h-4 mr-2" />
            <span>{video.error || 'An error occurred'}</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center text-slate-500 mt-2">
            <Play className="w-4 h-4 mr-2" />
            <span>Ready to process</span>
          </div>
        );
    }
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-md overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        <div>
          <h3 className="font-medium text-slate-800 mb-2">Original Video</h3>
          <div className="relative aspect-video bg-slate-900 rounded-lg overflow-hidden">
            <video
              ref={originalVideoRef}
              className="w-full h-full object-contain"
              controls
              playsInline
              preload="auto"
            />
          </div>
        </div>

        {video.status === 'completed' && video.outputUrl && (
          <div>
            <h3 className="font-medium text-slate-800 mb-2">Processed Video</h3>
            <div className="relative aspect-video bg-slate-900 rounded-lg overflow-hidden">
              <video
                ref={processedVideoRef}
                className="w-full h-full object-contain"
                controls
                playsInline
                preload="auto"
              />
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-100">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-slate-800 truncate" title={video.name}>
              {video.name}
            </h3>
            <p className="text-sm text-slate-500">{formatSize(video.size)}</p>
          </div>

          <div className="flex gap-2">
            {video.status === 'completed' && video.outputUrl && (
              <>
                <button
                  onClick={onEdit}
                  className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                  title="Edit translation"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={downloadVideo}
                  className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                  title="Download processed video"
                >
                  <Download className="w-5 h-5" />
                </button>
              </>
            )}
            <button
              onClick={onRemove}
              className="p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-colors"
              title="Remove video"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {renderProgress()}
        {renderStatusMessage()}
      </div>
    </div>
  );
};