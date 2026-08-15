export type ThemeMode = 'oled-dark' | 'warm-paper' | 'clean-light';
export type FontFamilyMode = 'mono' | 'sans' | 'serif';
export type FontSizeScale = 'compact' | 'standard' | 'large';

export interface ThemeColors {
  name: ThemeMode;
  canvas: string;
  card: string;
  cardActive: string;
  border: string;
  borderSubtle: string;
  text: string;
  textMuted: string;
  textSecondary: string;
  accent: string;
  accentText: string;
  strikeThrough: string;
  statusBar: 'light' | 'dark';
}

export interface FontDefinition {
  family: string;
  letterSpacing: number;
  lineHeightMultiplier: number;
}

export interface TypeScale {
  editor: number;
  headerTitle: number;
  subhead: number;
  body: number;
  caption: number;
}
