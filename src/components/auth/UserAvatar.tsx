'use client';

import React from 'react';
import Image from 'next/image';

interface UserAvatarProps {
  avatarUrl?: string | null;
  name?: string | null;
  size?: number;
  className?: string;
}

export function UserAvatar({ avatarUrl, name, size = 40, className = '' }: UserAvatarProps) {
  // If no name is provided, default to user icon
  const fallbackInitial = name ? name.charAt(0).toUpperCase() : '?';

  return (
    <div 
      className={`relative rounded-full overflow-hidden flex items-center justify-center bg-[#60A5FA] text-white font-bold shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      {avatarUrl ? (
        <Image 
          src={avatarUrl} 
          alt={name || 'User avatar'} 
          width={size} 
          height={size}
          className="object-cover"
          unoptimized // often helpful for external Google avatar URLs depending on next.config.js
        />
      ) : (
        <span style={{ fontSize: size * 0.4 }}>{fallbackInitial}</span>
      )}
    </div>
  );
}
