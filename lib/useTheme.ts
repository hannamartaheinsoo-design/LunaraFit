import { useColorScheme } from 'react-native';

export type ThemeTokens = {
  bg: string;
  surface: string;
  surface2: string;
  border: string;
  border2: string;
  text: string;
  textSec: string;
  textMuted: string;
  blushBg: string;
  blushBorder: string;
  skyBg: string;
  skyBorder: string;
  dark: boolean;
};

const light: ThemeTokens = {
  bg:          '#FAFAFA',
  surface:     '#FFFFFF',
  surface2:    '#F5F5F5',
  border:      '#E8E8E8',
  border2:     '#D0D0D0',
  text:        '#1F1F1F',
  textSec:     '#555555',
  textMuted:   '#9A9A9A',
  blushBg:     '#FDF1F2',
  blushBorder: '#F5D4D6',
  skyBg:       '#F0F4F8',
  skyBorder:   '#D2DDE7',
  dark:        false,
};

const dark: ThemeTokens = {
  bg:          '#111111',
  surface:     '#1C1C1C',
  surface2:    '#262626',
  border:      '#333333',
  border2:     '#4A4A4A',
  text:        '#EDEAE5',
  textSec:     '#A09890',
  textMuted:   '#6E6460',
  blushBg:     '#2A191C',
  blushBorder: '#4E2830',
  skyBg:       '#161E2A',
  skyBorder:   '#243040',
  dark:        true,
};

export function useTheme(): ThemeTokens {
  const scheme = useColorScheme();
  return scheme === 'dark' ? dark : light;
}
