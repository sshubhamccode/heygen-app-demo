import React from 'react';
import { Play, Download, Share2, AlertCircle } from 'lucide-react';

interface PreviewPanelProps {
  videoUrl: string | null;
  isLoading: boolean;
  error: string | null;
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({ 
  videoUrl, 
  isLoading, 
  error 
}) => {
  const handleDownload = async () => {
    if (!videoUrl) return;

    try {
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const filename = `heygen-video-${Date.now()}.mp4`;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading video:', err);
      alert('Failed to download video. Please try again.');
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden shadow-md">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-medium text-gray-900 dark:text-gray-100">Preview</h3>
      </div>
      
      <div className="aspect-video bg-black relative">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <AlertCircle className="h-10 w-10 text-red-500 mb-2" />
            <p className="text-sm text-red-500">{error}</p>
          </div>
        ) : videoUrl ? (
          <video 
            src={videoUrl} 
            controls 
            className="w-full h-full object-contain"
          >
            Your browser does not support the video tag.
          </video>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <Play className="h-10 w-10 text-gray-400 dark:text-gray-600 mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Generated video will appear here
            </p>
          </div>
        )}
      </div>
      
      {videoUrl && (
        <div className="p-4 flex justify-end space-x-3">
          <button 
            onClick={handleDownload}
            className="flex items-center space-x-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 
                      text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 
                      dark:hover:bg-gray-600 transition-colors duration-200"
          >
            <Download className="h-4 w-4" />
            <span>Download</span>
          </button>
          <button 
            className="flex items-center space-x-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 
                      text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 
                      dark:hover:bg-gray-600 transition-colors duration-200"
          >
            <Share2 className="h-4 w-4" />
            <span>Share</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default PreviewPanel;