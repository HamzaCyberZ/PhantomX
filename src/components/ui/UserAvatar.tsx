import React, { useEffect, useState } from 'react';

interface UserAvatarProps {
  src?: string;
  name: string;
  sizeClass?: string;
  textClass?: string;
  roundedClass?: string;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'PX';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  name,
  sizeClass = 'w-9 h-9',
  textClass = 'text-xs',
  roundedClass = 'rounded-full',
}) => {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return (
      <div
        className={`${sizeClass} ${roundedClass} bg-gradient-to-br from-sky-500/25 to-indigo-500/25 border border-[var(--np-border)] flex items-center justify-center font-display font-bold ${textClass} text-[var(--np-text-primary)] select-none shrink-0`}
        aria-label={name}
      >
        {getInitials(name)}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={`${sizeClass} ${roundedClass} object-cover border border-[var(--np-border)] shrink-0`}
    />
  );
};
