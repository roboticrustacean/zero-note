import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import { ThemeColors, ThemeMode, FontFamilyMode, FontSizeScale, TypeScale } from './types';
import { getTheme } from './colors';
import { getTypeScale, getFontFamily } from './typography';

interface ThemeContextValue {
  theme: ThemeColors;
  themeMode: ThemeMode;
  fontMode: FontFamilyMode;
  fontScale: FontSizeScale;
  fontFamily: string;
  typeScale: TypeScale;
  setThemeMode: (mode: ThemeMode) => void;
  setFontMode: (mode: FontFamilyMode) => void;
  setFontScale: (scale: FontSizeScale) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  initialTheme?: ThemeMode;
  initialFont?: FontFamilyMode;
  initialScale?: FontSizeScale;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  initialTheme = 'oled-dark',
  initialFont = 'mono',
  initialScale = 'standard',
}) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>(initialTheme);
  const [fontMode, setFontMode] = useState<FontFamilyMode>(initialFont);
  const [fontScale, setFontScale] = useState<FontSizeScale>(initialScale);

  const theme = useMemo(() => getTheme(themeMode), [themeMode]);
  const fontFamily = useMemo(() => getFontFamily(fontMode), [fontMode]);
  const typeScale = useMemo(() => getTypeScale(fontScale), [fontScale]);

  const value = useMemo(
    () => ({
      theme,
      themeMode,
      fontMode,
      fontScale,
      fontFamily,
      typeScale,
      setThemeMode,
      setFontMode,
      setFontScale,
    }),
    [theme, themeMode, fontMode, fontScale, fontFamily, typeScale]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
