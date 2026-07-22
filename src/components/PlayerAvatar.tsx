import React from 'react';
import { getAvatarData } from '../utils/avatarUtils';

interface PlayerAvatarProps {
  activeSkin: string;
  customPfp?: string;
  variant?: 'passport' | 'token';
  accentColor?: string; // only used for variant='token' default skin dot
}

export const PlayerAvatar: React.FC<PlayerAvatarProps> = ({
  activeSkin,
  customPfp,
  variant = 'passport',
  accentColor = '#0052FF',
}) => {
  const avatarData = getAvatarData(activeSkin, customPfp);

  if (variant === 'passport') {
    if (avatarData.type === 'custom' && avatarData.src) {
      return (
        <div className="w-10 h-10 rounded-full border-2 border-[#0052FF]/50 overflow-hidden bg-slate-800 flex items-center justify-center shrink-0">
          <img
            src={avatarData.src}
            alt="Custom PFP"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
      );
    }

    if (avatarData.type === 'skin' && avatarData.emoji) {
      return (
        <div className="w-10 h-10 rounded-full border border-purple-500/30 bg-purple-500/10 flex items-center justify-center text-lg shadow-inner select-none shrink-0">
          {avatarData.emoji}
        </div>
      );
    }

    // Default skin fallback in passport
    return (
      <div className="w-8 h-8 rounded-lg bg-[#0052FF]/10 border border-[#0052FF]/30 flex items-center justify-center text-xs font-bold font-mono shrink-0 select-none">
        B20
      </div>
    );
  }

  // variant === 'token'
  if (avatarData.type === 'custom' && avatarData.src) {
    return (
      <img
        src={avatarData.src}
        alt="PFP"
        className="w-full h-full object-cover"
        referrerPolicy="no-referrer"
      />
    );
  }

  if (avatarData.type === 'skin' && avatarData.emoji) {
    return (
      <span className="text-[11px] xs:text-[13px] sm:text-[14px] leading-none select-none flex items-center justify-center">
        {avatarData.emoji}
      </span>
    );
  }

  // Default skin fallback in token
  return (
    <div
      className="w-[45%] h-[45%] rounded-full animate-pulse transition-colors duration-300"
      style={{ backgroundColor: accentColor }}
    />
  );
};

export default PlayerAvatar;
