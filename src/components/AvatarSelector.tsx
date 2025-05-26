import React from 'react';
import { Avatar } from '../types';

interface AvatarSelectorProps {
  avatars: Avatar[];
  selectedAvatarId: string;
  onSelectAvatar: (avatarId: string) => void;
}

const AvatarSelector: React.FC<AvatarSelectorProps> = ({ 
  avatars, 
  selectedAvatarId, 
  onSelectAvatar 
}) => {
  const selectedAvatar = avatars.find(avatar => avatar.id === selectedAvatarId);

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        <label htmlFor="avatar-select" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Select Avatar
        </label>
        <select
          id="avatar-select"
          value={selectedAvatarId}
          onChange={(e) => onSelectAvatar(e.target.value)}
          className="rounded-md border border-gray-300 dark:border-gray-700 py-2 px-4 bg-white dark:bg-gray-800 
                    text-gray-800 dark:text-gray-200 shadow-sm focus:outline-none focus:ring-2 
                    focus:ring-purple-500 focus:border-transparent transition-all duration-200"
        >
          <option value="" disabled>Select an avatar</option>
          {avatars.map((avatar) => (
            <option key={avatar.id} value={avatar.id}>
              {avatar.name}
            </option>
          ))}
        </select>
      </div>

      {selectedAvatar && (
        <div className="flex items-center space-x-4 mt-4">
          <div className="h-16 w-16 overflow-hidden rounded-full ring-2 ring-purple-500 shadow-md">
            <img 
              src={selectedAvatar.imageUrl} 
              alt={selectedAvatar.name} 
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100">{selectedAvatar.name}</h3>
            {selectedAvatar.description && (
              <p className="text-sm text-gray-500 dark:text-gray-400">{selectedAvatar.description}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AvatarSelector;