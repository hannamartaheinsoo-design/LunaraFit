import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { Colors, Fonts } from '../../constants/theme';
import { Icon } from '../../components/ui/Icon';
import { useTranslation } from '../../lib/LangContext';
import { useTheme } from '../../lib/useTheme';

function TabIcon({ name, focused }: { name: any; focused: boolean }) {
  const T = useTheme();
  return (
    <Icon name={name} size={22} color={focused ? T.text : T.border2} strokeWidth={1.4} />
  );
}

export default function TabLayout() {
  const { t } = useTranslation();
  const T = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: T.surface,
          borderTopColor: T.border,
          borderTopWidth: 1,
          paddingBottom: 24,
          paddingTop: 10,
          height: 80,
          // On web: pin to bottom and add safe-area-style breathing room
          ...(Platform.OS === 'web' ? {
            position: 'fixed' as any,
            bottom: 0,
            left: 0,
            right: 0,
            paddingBottom: 60,
            height: 130,
          } : {}),
        },
        tabBarActiveTintColor: T.text,
        tabBarInactiveTintColor: T.textMuted,
        tabBarLabelStyle: {
          fontFamily: Fonts.sansBold,
          fontSize: 9,
          letterSpacing: 0.6,
          textTransform: 'uppercase',
        },
      }}
    >
      <Tabs.Screen name="home" options={{ title: t('nav.home'), tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} /> }} />
      <Tabs.Screen name="workouts" options={{ title: t('nav.workouts'), tabBarIcon: ({ focused }) => <TabIcon name="barbell" focused={focused} /> }} />
      <Tabs.Screen name="cycle" options={{ title: t('nav.cycle'), tabBarIcon: ({ focused }) => <TabIcon name="moon" focused={focused} /> }} />
      <Tabs.Screen name="insights" options={{ title: t('nav.insights'), tabBarIcon: ({ focused }) => <TabIcon name="spark" focused={focused} /> }} />
      <Tabs.Screen name="profile" options={{ title: t('nav.profile'), tabBarIcon: ({ focused }) => <TabIcon name="person" focused={focused} /> }} />
    </Tabs>
  );
}
