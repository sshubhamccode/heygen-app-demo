import React, { useState } from 'react';
import { X } from 'lucide-react';

interface ProofreadingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  translatedText: string;
  onSave: (editedText: string) => void;
  isProcessing: boolean;
}

export const ProofreadingDialog: React.FC<ProofreadingDialogProps> = ({
  isOpen,
  onClose,
  translatedText,
  onSave,
  isProcessing
}) => {
  const [editedText, setEditedText] = useState(translatedText);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800">Edit Translation</h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Translated Text
            </label>
            <textarea
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              className="w-full h-64 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Edit the translated text..."
            />
          </div>
          
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onSave(editedText)}
              disabled={isProcessing}
              className={`px-4 py-2 text-white rounded-lg transition-colors ${
                isProcessing 
                  ? 'bg-blue-400 cursor-not-allowed' 
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {isProcessing ? 'Processing...' : 'Save & Reprocess'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};