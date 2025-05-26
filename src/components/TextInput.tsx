import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

interface TextInputProps {
  text: string;
  onTextChange: (text: string) => void;
  maxLength?: number;
}

const TextInput: React.FC<TextInputProps> = ({ 
  text, 
  onTextChange, 
  maxLength = 500
}) => {
  const [characterCount, setCharacterCount] = useState(0);
  const [isExceeded, setIsExceeded] = useState(false);

  useEffect(() => {
    setCharacterCount(text.length);
    setIsExceeded(text.length > maxLength);
  }, [text, maxLength]);

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label htmlFor="speech-text" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Speech Text
        </label>
        <span className={`text-xs ${isExceeded ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
          {characterCount}/{maxLength} characters
        </span>
      </div>
      
      <textarea
        id="speech-text"
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
        placeholder="Enter the text you want the avatar to speak..."
        rows={5}
        className={`w-full px-4 py-3 rounded-md border ${
          isExceeded 
            ? 'border-red-500 focus:ring-red-500' 
            : 'border-gray-300 dark:border-gray-700 focus:ring-purple-500'
        } focus:outline-none focus:ring-2 focus:border-transparent
        bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 
        transition-all duration-200 resize-none`}
      />
      
      {isExceeded && (
        <div className="flex items-center space-x-2 text-red-500 text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>Text exceeds maximum character limit</span>
        </div>
      )}
      
      <div className="pt-2">
        <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Suggested phrases:</h4>
        <div className="flex flex-wrap gap-2">
          {[
            "Hello, I'm your virtual assistant.",
            "Welcome to our platform!",
            "Let me tell you about our services.",
            "Thank you for your interest."
          ].map((phrase, index) => (
            <button
              key={index}
              onClick={() => onTextChange(phrase)}
              className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 
                       rounded-full hover:bg-purple-100 dark:hover:bg-purple-900 hover:text-purple-700 
                       dark:hover:text-purple-300 transition-colors duration-200"
            >
              {phrase}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TextInput;