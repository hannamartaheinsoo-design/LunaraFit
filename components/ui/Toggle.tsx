import React, { useRef, useEffect } from 'react';
import { TouchableWithoutFeedback, Animated, StyleSheet, View } from 'react-native';
import { Colors } from '../../constants/theme';

interface Props {
  value: boolean;
  onChange: (v: boolean) => void;
}

export function Toggle({ value, onChange }: Props) {
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [value]);

  const bg = anim.interpolate({ inputRange: [0, 1], outputRange: [Colors.beige[200], Colors.green[400]] });
  const left = anim.interpolate({ inputRange: [0, 1], outputRange: [3, 22] });

  return (
    <TouchableWithoutFeedback onPress={() => onChange(!value)}>
      <Animated.View style={[styles.track, { backgroundColor: bg }]}>
        <Animated.View style={[styles.thumb, { left }]} />
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  track: { width: 46, height: 27, borderRadius: 14, position: 'relative' },
  thumb: {
    position: 'absolute',
    width: 21,
    height: 21,
    borderRadius: 10.5,
    backgroundColor: '#fff',
    top: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
});
