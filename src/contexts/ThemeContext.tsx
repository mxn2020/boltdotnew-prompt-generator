import React, { useEffect, useState } from 'react';
import { useUserPreferences, useUpdatePreferences } from '../hooks/useProfile';
import { ThemeContext, Theme, ThemeContextType } from '../lib/theme-context';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { data: preferences } = useUserPreferences();
  const updatePreferences = useUpdatePreferences();
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  const theme = preferences?.theme || 'system';

  const setTheme = async (newTheme: Theme) => {
    try {
      await updatePreferences.mutateAsync({ theme: newTheme });
    } catch (error) {
      console.error('Failed to update theme:', error);
    }
  };

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
