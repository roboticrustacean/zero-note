import { Platform } from 'react-native';
import { FontFamilyMode, FontSizeScale, TypeScale } from './types';

export const fontFamilies: Record<FontFamilyMode, string> = {
  mono: Platform.select({
    ios: 'Menlo',
    android: 'monospace',
    default: 'Courier, monospace',
  }),
  sans: Platform.select({
    ios: 'System',
    android: 'sans-serif',
    default: 'sans-serif',
  }),
  serif: Platform.select({
    ios: 'Georgia',
    android: 'serif',
    default: 'Georgia, serif',
  }),
};

export const typeScales: Record<FontSizeScale, TypeScale> = {
  compact: {
    editor: 15,
    headerTitle: 16,
    subhead: 14,
    body: 14,
    caption: 12,
  },
  standard: {
    editor: 17,
    headerTitle: 18,
    subhead: 15,
    body: 16,
    caption: 13,
  },
  large: {
    editor: 20,
    headerTitle: 21,
    subhead: 17,
    body: 18,
    caption: 14,
  },
};

export function getTypeScale(scale: FontSizeScale = 'standard'): TypeScale {
  return typeScales[scale] || typeScales.standard;
}

export function getFontFamily(mode: FontFamilyMode = 'mono'): string {
  return fontFamilies[mode] || fontFamilies.mono;
}
