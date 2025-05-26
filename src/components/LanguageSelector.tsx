import React, { useState, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { Language } from '../types';
import { fetchSupportedLanguages } from '../utils/api';

interface LanguageSelectorProps {
  selectedLanguage: Language;
  onSelect: (language: Language) => void;
}

const getFlagEmoji = (languageCode: string): string => {
  const flagMap: Record<string, string> = {
    'en': '🇺🇸',
    'es': '🇪🇸',
    'fr': '🇫🇷',
    'de': '🇩🇪',
    'it': '🇮🇹',
    'pt': '🇵🇹',
    'zh': '🇨🇳',
    'ja': '🇯🇵',
    'ko': '🇰🇷',
    'ar': '🇸🇦',
    'hi': '🇮🇳',
    'id': '🇮🇩',
    'ms': '🇲🇾',
    'pl': '🇵🇱',
    'ru': '🇷🇺',
    'tr': '🇹🇷',
    'vi': '🇻🇳',
    'th': '🇹🇭'
  };
  return flagMap[languageCode] || '🌐';
};

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ 
  selectedLanguage, 
  onSelect 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadLanguages = async () => {
      try {
        const supportedLanguages = await fetchSupportedLanguages();
        console.log('Supported Languages:', supportedLanguages); // Debug log
        
        // Check if supportedLanguages is an array and has the expected structure
        if (!Array.isArray(supportedLanguages)) {
          throw new Error('Invalid API response format: expected an array of languages');
        }

        const formattedLanguages = supportedLanguages
          .filter(lang => lang && typeof lang === 'object' && 'language_code' in lang && 'language_name' in lang)
          .map(lang => ({
            code: lang.language_code,
            name: lang.language_name,
            flag: getFlagEmoji(lang.language_code)
          }));

        console.log('Formatted Languages:', formattedLanguages); // Debug log
        
        if (formattedLanguages.length === 0) {
          throw new Error('No valid languages found in API response');
        }

        setLanguages(formattedLanguages);
        setError(null);
      } catch (error) {
        console.error('Failed to load languages:', error);
        setError('Failed to load supported languages');
        // Fallback to default languages if API fails
        setLanguages([
          { code: 'en', name: 'English', flag: '🇺🇸' },
          { code: 'es', name: 'Spanish', flag: '🇪🇸' },
          { code: 'fr', name: 'French', flag: '🇫🇷' },
          { code: 'de', name: 'German', flag: '🇩🇪' },
          { code: 'it', name: 'Italian', flag: '🇮🇹' },
          { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
          { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
          { code: 'ko', name: 'Korean', flag: '🇰🇷' }
        ]);
      }
    };

    loadLanguages();
  }, []);
  
  return (
    <div className="relative">
      <button
        className="w-full flex items-center justify-between px-4 py-2 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center">
          <span className="mr-2 text-xl">{selectedLanguage.flag}</span>
          <span>{selectedLanguage.name}</span>
        </div>
        <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${isOpen ? 'transform rotate-180' : ''}`} />
      </button>
      
      {error && (
        <p className="mt-2 text-sm text-red-500">{error}</p>
      )}
      
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          <ul className="py-1">
            {languages.map((language) => (
              <li key={language.code}>
                <button
                  className={`w-full text-left px-4 py-2 flex items-center hover:bg-slate-50 ${
                    selectedLanguage.code === language.code ? 'bg-blue-50 text-blue-700' : ''
                  }`}
                  onClick={() => {
                    onSelect(language);
                    setIsOpen(false);
                  }}
                >
                  <span className="mr-3 text-xl">{language.flag}</span>
                  <span>{language.name}</span>
                  {selectedLanguage.code === language.code && (
                    <Check className="w-4 h-4 ml-auto text-blue-500" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};