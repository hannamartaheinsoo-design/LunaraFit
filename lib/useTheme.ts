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
  bg:          '#0C0C0C',
  surface:     '#181818',
  surface2:    '#222222',
  border:      '#2C2C2C',
  border2:     '#383838',
  text:        '#EFEFEF',
  textSec:     '#AAAAAA',
  textMuted:   '#666666',
  blushBg:     '#1D1112',
  blushBorder: '#3D2022',
  skyBg:       '#0F1619',
  skyBorder:   '#1A2730',
  dark:        true,
};

export function useTheme(): ThemeTokens {
  const scheme = useColorScheme();
  return scheme === 'dark' ? dark : light;
}
