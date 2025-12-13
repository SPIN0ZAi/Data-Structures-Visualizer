import React, { useMemo } from 'react';
import './ProfilePicture.css';

interface ProfilePictureProps {
  src?: string | null;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
}

// Generate a consistent color based on the name
const getColorFromName = (name: string): string => {
  const colors = [
    '#8b7cf6', // Purple
    '#7c9cf6', // Blue
    '#6bcfcf', // Teal
    '#7cc88a', // Green
    '#cfb86b', // Gold
    '#cf8a6b', // Orange
    '#cf6b8a', // Rose
    '#b86bcf', // Magenta
    '#6b8acf', // Indigo
    '#8acf6b', // Lime
  ];
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
};

const getInitials = (name: string): string => {
  if (!name) return '?';
  
  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }
  
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
};

const ProfilePicture: React.FC<ProfilePictureProps> = ({
  src,
  name,
  size = 'md',
  className = '',
  onClick,
}) => {
  const initials = useMemo(() => getInitials(name), [name]);
  const backgroundColor = useMemo(() => getColorFromName(name), [name]);
  
  const hasValidImage = src && src.trim() !== '';

  return (
    <div
      className={`profile-picture profile-picture-${size} ${onClick ? 'clickable' : ''} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      {hasValidImage ? (
        <img
          src={src}
          alt={`${name}'s profile`}
          className="profile-picture-image"
          onError={(e) => {
            // Hide broken image and show initials instead
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      ) : null}
      
      {/* Fallback initials - always rendered but hidden when image loads */}
      <div
        className="profile-picture-initials"
        style={{ backgroundColor }}
        aria-hidden={hasValidImage ? true : undefined}
      >
        {initials}
      </div>
    </div>
  );
};

export default ProfilePicture;
