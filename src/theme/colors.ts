import { ThemeColors, ThemeMode } from './types';

export const oledDark: ThemeColors = {
  name: 'oled-dark',
  canvas: '#000000',
  card: '#0A0A0A',
  cardActive: '#141414',
  border: '#1F1F1F',
  borderSubtle: '#141414',
  text: '#EAEAEA',
  textMuted: '#666666',
  textSecondary: '#888888',
  accent: '#EAEAEA',
  accentText: '#000000',
  strikeThrough: '#444444',
  statusBar: 'light',
  glassBg: 'rgba(12, 12, 12, 0.76)',
  glassBorder: 'rgba(255, 255, 255, 0.12)',
  glassHighlight: 'rgba(255, 255, 255, 0.16)',
};

export const warmPaper: ThemeColors = {
  name: 'warm-paper',
  canvas: '#F7F6F3',
  card: '#FFFFFF',
  cardActive: '#EFECE6',
  border: '#EAEAEA',
  borderSubtle: 'rgba(0, 0, 0, 0.04)',
  text: '#1F1F1F',
  textMuted: '#787774',
  textSecondary: '#555555',
  accent: '#1F1F1F',
  accentText: '#FFFFFF',
  strikeThrough: '#A09F9C',
  statusBar: 'dark',
  glassBg: 'rgba(247, 246, 243, 0.76)',
  glassBorder: 'rgba(0, 0, 0, 0.08)',
  glassHighlight: 'rgba(255, 255, 255, 0.75)',
};

export const cleanLight: ThemeColors = {
  name: 'clean-light',
  canvas: '#FFFFFF',
  card: '#FAFAFA',
  cardActive: '#F0F0F0',
  border: '#EAEAEA',
  borderSubtle: '#F0F0F0',
  text: '#111111',
  textMuted: '#888888',
  textSecondary: '#444444',
  accent: '#111111',
  accentText: '#FFFFFF',
  strikeThrough: '#999999',
  statusBar: 'dark',
  glassBg: 'rgba(255, 255, 255, 0.82)',
  glassBorder: 'rgba(0, 0, 0, 0.06)',
  glassHighlight: 'rgba(255, 255, 255, 0.90)',
};

export const themes: Record<ThemeMode, ThemeColors> = {
  'oled-dark': oledDark,
  'warm-paper': warmPaper,
  'clean-light': cleanLight,
};

export function getTheme(mode: ThemeMode = 'oled-dark'): ThemeColors {
  return themes[mode] || oledDark;
}
