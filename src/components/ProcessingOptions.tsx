import React from 'react';
import { LanguageSelector } from './LanguageSelector';
import { Language } from '../types';

interface ProcessingOptionsProps {
  selectedLanguage: Language;
  onLanguageSelect: (language: Language) => void;
  enableLipSync: boolean;
  onLipSyncChange: (enabled: boolean) => void;
  quality: 'standard' | 'high';
  onQualityChange: (quality: 'standard' | 'high') => void;
  onProcess: () => void;
  isProcessing: boolean;
  videoSelected: boolean;
}

export const ProcessingOptions: React.FC<ProcessingOptionsProps> = ({
  selectedLanguage,
  onLanguageSelect,
  enableLipSync,
  onLipSyncChange,
  quality,
  onQualityChange,
  onProcess,
  isProcessing,
  videoSelected
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-6 text-slate-800">Processing Options</h2>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Target Language
          </label>
          <LanguageSelector selectedLanguage={selectedLanguage} onSelect={onLanguageSelect} />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Lip Sync
          </label>
          <div className="flex items-center">
            <label className="flex items-center cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={enableLipSync}
                  onChange={(e) => onLipSyncChange(e.target.checked)}
                />
                <div className={`w-10 h-6 rounded-full transition-colors ${enableLipSync ? 'bg-blue-500' : 'bg-slate-300'}`}></div>
                <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform transform ${enableLipSync ? 'translate-x-4' : ''}`}></div>
              </div>
              <span className="ml-3 text-slate-700">
                {enableLipSync ? 'Enabled' : 'Disabled'}
              </span>
            </label>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Synchronize lip movements with the translated audio
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Output Quality
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="quality"
                className="w-4 h-4 text-blue-500 border-slate-300 focus:ring-blue-500"
                checked={quality === 'standard'}
                onChange={() => onQualityChange('standard')}
              />
              <span className="ml-2 text-slate-700">Standard</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="quality"
                className="w-4 h-4 text-blue-500 border-slate-300 focus:ring-blue-500"
                checked={quality === 'high'}
                onChange={() => onQualityChange('high')}
              />
              <span className="ml-2 text-slate-700">High</span>
            </label>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Higher quality requires more processing time
          </p>
        </div>
      </div>
      
      <div className="mt-8">
        <button
          className={`w-full py-3 px-4 rounded-lg font-medium text-white ${
            videoSelected 
              ? 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-500' 
              : 'bg-slate-400 cursor-not-allowed'
          } transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2`}
          onClick={onProcess}
          disabled={!videoSelected || isProcessing}
        >
          {isProcessing ? 'Processing...' : 'Process Video'}
        </button>
      </div>
    </div>
  );
};