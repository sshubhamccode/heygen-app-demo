import React from 'react';
import { Voice } from '../types';
import { Volume2 } from 'lucide-react';

interface VoiceSelectorProps {
  voices: Voice[];
  selectedVoiceId: string;
  onSelectVoice: (voiceId: string) => void;
}

const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  voices,
  selectedVoiceId,
  onSelectVoice
}) => {
  const selectedVoice = voices.find(voice => voice.id === selectedVoiceId);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const handlePlayPreview = () => {
    if (!selectedVoice?.previewUrl) return;

    if (!audioRef.current) {
      audioRef.current = new Audio(selectedVoice.previewUrl);
      audioRef.current.onended = () => setIsPlaying(false);
    }

    if (isPlaying) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  React.useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        <label htmlFor="voice-select" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Select Voice
        </label>
        <select
          id="voice-select"
          value={selectedVoiceId}
          onChange={(e) => onSelectVoice(e.target.value)}
          className="rounded-md border border-gray-300 dark:border-gray-700 py-2 px-4 bg-white dark:bg-gray-800 
                    text-gray-800 dark:text-gray-200 shadow-sm focus:outline-none focus:ring-2 
                    focus:ring-purple-500 focus:border-transparent transition-all duration-200"
        >
          <option value="" disabled>Select a voice</option>
          {voices.map((voice) => (
            <option key={voice.id} value={voice.id}>
              {voice.name} ({voice.language})
            </option>
          ))}
        </select>
      </div>

      {selectedVoice && (
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
          <div>
            <p className="font-medium text-gray-900 dark:text-gray-100">{selectedVoice.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {selectedVoice.gender} • {selectedVoice.language}
            </p>
          </div>
          
          {selectedVoice.previewUrl && (
            <button
              onClick={handlePlayPreview}
              className={`p-2 rounded-full transition-colors duration-200 ${
                isPlaying
                  ? 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900'
              }`}
            >
              <Volume2 className="w-5 h-5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default VoiceSelector;