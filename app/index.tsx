import { View } from 'react-native';
import { Colors } from '../constants/theme';

// Navigation is handled by NavigationController in _layout.tsx
// This screen just shows a blank cream screen while the app decides where to go
export default function Index() {
  return <View style={{ flex: 1, backgroundColor: Colors.cream }} />;
}
