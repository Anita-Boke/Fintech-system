'use client';

import { useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

export function useThemeEffect() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(resolvedTheme);
    document.documentElement.style.colorScheme = resolvedTheme;
  }, [resolvedTheme]);
}