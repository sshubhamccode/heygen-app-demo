import React from 'react';
import { Play, RefreshCw } from 'lucide-react';

interface ControlPanelProps {
  onGenerate: () => void;
  onReset: () => void;
  isGenerating: boolean;
  isFormValid: boolean;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ 
  onGenerate, 
  onReset, 
  isGenerating, 
  isFormValid 
}) => {
  return (
    <div className="flex space-x-3">
      <button
        onClick={onGenerate}
        disabled={isGenerating || !isFormValid}
        className={`flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-md
                  text-white transition-all duration-200 ${
                    isGenerating
                      ? 'bg-purple-400 cursor-not-allowed'
                      : isFormValid
                        ? 'bg-purple-600 hover:bg-purple-700 active:bg-purple-800'
                        : 'bg-gray-400 cursor-not-allowed'
                  }`}
      >
        {isGenerating ? (
          <>
            <RefreshCw className="h-5 w-5 animate-spin" />
            <span>Generating...</span>
          </>
        ) : (
          <>
            <Play className="h-5 w-5" />
            <span>Generate Video</span>
          </>
        )}
      </button>
      
      <button
        onClick={onReset}
        disabled={isGenerating}
        className={`px-4 py-2.5 rounded-md border border-gray-300 dark:border-gray-700
                  text-gray-700 dark:text-gray-300 transition-all duration-200 ${
                    isGenerating
                      ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed'
                      : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
      >
        Reset
      </button>
    </div>
  );
};

export default ControlPanel;