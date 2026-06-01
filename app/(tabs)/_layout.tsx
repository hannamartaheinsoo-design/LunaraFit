import { Tabs } from 'expo-router';
import { Colors, Fonts } from '../../constants/theme';
import { Icon } from '../../components/ui/Icon';

function TabIcon({ name, focused }: { name: any; focused: boolean }) {
  return (
    <Icon
      name={name}
      size={22}
      color={focused ? Colors.beige[800] : Colors.beige[200]}
      strokeWidth={1.4}
    />
  );
}

export default function TabLayout() {
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
      <Tabs.Screen
        name="home"
        options={{
          title: 'Avaleht',
          tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="workouts"
        options={{
          title: 'Treeningud',
          tabBarIcon: ({ focused }) => <TabIcon name="barbell" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="cycle"
        options={{
          title: 'Tsükkel',
          tabBarIcon: ({ focused }) => <TabIcon name="moon" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: 'Ülevaated',
          tabBarIcon: ({ focused }) => <TabIcon name="spark" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profiil',
          tabBarIcon: ({ focused }) => <TabIcon name="person" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
