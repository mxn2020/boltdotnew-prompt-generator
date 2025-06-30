import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { useUserPreferences, useUpdatePreferences } from '../hooks/useProfile';
import { ThemeContext, Theme, ThemeContextType } from '../lib/theme-context';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { data: preferences } = useUserPreferences();
  const updatePreferences = useUpdatePreferences();
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');
  const [guestTheme, setGuestTheme] = useState<Theme>('system');

  // For guests, use localStorage directly; for users, use preferences
  const theme = user ? (preferences?.theme || 'system') : guestTheme;

  const setTheme = async (newTheme: Theme) => {
    if (user) {
      // For authenticated users, save to preferences
      try {
        await updatePreferences.mutateAsync({ theme: newTheme });
      } catch (error) {
        console.error('Failed to update theme:', error);
      }
    } else {
      // For guests, save to localStorage and update state
      try {
        localStorage.setItem('guest_theme', newTheme);
        setGuestTheme(newTheme);
      } catch (error) {
        console.error('Failed to save guest theme:', error);
      }
    }
  };

  // Initialize guest theme from localStorage
  useEffect(() => {
    if (!user) {
      const storedTheme = localStorage.getItem('guest_theme') as Theme;
      if (storedTheme && ['light', 'dark', 'system'].includes(storedTheme)) {
        setGuestTheme(storedTheme);
      }
    }
  }, [user]);

  // Function to get system theme preference
  const getSystemTheme = (): 'light' | 'dark' => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  };

  // Resolve the actual theme (light or dark) based on the current theme setting
  useEffect(() => {
    const actualTheme = theme === 'system' ? getSystemTheme() : theme;
    setResolvedTheme(actualTheme as 'light' | 'dark');

    // Apply theme to document root
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(actualTheme);
  }, [theme]);

  // Listen for system theme changes when theme is 'system'
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      const systemTheme = e.matches ? 'dark' : 'light';
      setResolvedTheme(systemTheme);
      
      // Apply theme to document root
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(systemTheme);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const value: ThemeContextType = {
    theme,
    resolvedTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
