import React, { useState } from 'react';
import { Shield } from 'lucide-react';

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackLabel?: string;
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  className = '',
  fallbackLabel,
}) => {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-[var(--np-surface-elevated)] border border-[var(--np-border)] text-[var(--np-text-secondary)] ${className}`}
        role="img"
        aria-label={alt}
      >
        <Shield className="w-7 h-7 text-[var(--np-accent)] mb-1.5" />
        {fallbackLabel && (
          <span className="text-xs font-medium tracking-tight">{fallbackLabel}</span>
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
};
