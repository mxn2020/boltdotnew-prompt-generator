import React from 'react';
import { useTheme } from '../hooks/useTheme';

interface BoltBadgeProps {
  variant?: 'white' | 'black' | 'auto';
  size?: 'sm' | 'md' | 'lg';
  position?: 'header' | 'footer';
}

export function BoltBadge({ 
  variant = 'auto', 
  size = 'md',
  position = 'header'
}: BoltBadgeProps) {
  const { resolvedTheme } = useTheme();
  
  // Determine which badge to show based on theme and variant
  const badgeVariant = variant === 'auto' 
    ? (resolvedTheme === 'dark' ? 'white' : 'black')
    : variant;
  
  // Size mapping
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };
  
  // Position-specific classes
  const positionClasses = position === 'header' 
    ? 'transition-opacity hover:opacity-80' 
    : 'mx-auto mb-3';

  return (
    <a 
      href="https://bolt.new/" 
      target="_blank" 
      rel="noopener noreferrer"
      className={`block ${positionClasses}`}
      title="Powered by Bolt.new"
    >
      <img
        src={`/${badgeVariant}_circle_360x360.png`}
        alt="Powered by Bolt.new"
        className={`${sizeClasses[size]}`}
      />
    </a>
  );
}