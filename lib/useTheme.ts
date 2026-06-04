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
  bg:          '#141414',
  surface:     '#1F1F1F',
  surface2:    '#282828',
  border:      '#323232',
  border2:     '#484848',
  text:        '#F0EDE8',
  textSec:     '#B0A89E',
  textMuted:   '#6A6260',
  blushBg:     '#251518',
  blushBorder: '#4A2428',
  skyBg:       '#141C22',
  skyBorder:   '#1E2E3A',
  dark:        true,
};

export function useTheme(): ThemeTokens {
  const scheme = useColorScheme();
  return scheme === 'dark' ? dark : light;
}
