import { cn } from '@/lib/utils';
import { useTheme } from '../hooks/useTheme';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Logo({ size = 'md', className }: LogoProps) {
  const { resolvedTheme } = useTheme();
  
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-16 h-16'
  };
  
  // Ensure we have a valid theme value
  const currentTheme = resolvedTheme || 'light';
  
  const logoSrc = currentTheme === 'dark' 
    ? '/images/logo-dark.png' 
    : '/images/logo-light.png';

  return (
    <img 
      src={logoSrc} 
      alt="PromptVerse Logo" 
      className={cn(sizeClasses[size], className)}
    />
  );
}