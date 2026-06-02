import { Tabs } from 'expo-router';
import { Colors, Fonts } from '../../constants/theme';
import { Icon } from '../../components/ui/Icon';
import { useTranslation } from '../../lib/LangContext';

function TabIcon({ name, focused }: { name: any; focused: boolean }) {
  return (
    <Icon name={name} size={22} color={focused ? Colors.beige[800] : Colors.beige[200]} strokeWidth={1.4} />
  );
}

export default function TabLayout() {
  const { t } = useTranslation();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.cream,
          borderTopColor: Colors.beige[100],
          borderTopWidth: 1,
          paddingBottom: 24,
          paddingTop: 10,
          height: 80,
        },
        tabBarActiveTintColor: Colors.beige[800],
        tabBarInactiveTintColor: Colors.beige[200],
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
