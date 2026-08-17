import { useEffect, useRef, useState } from 'react';
import { Animated, Platform, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../ctx/ThemeContext';
import ThemePicker from './ThemePicker';

const BUTTON_SIZE = 28;

export default function ThemeController({
  activeTab,
  selectedStoryId,
}: {
  activeTab: string;
  selectedStoryId: string;
}) {
  const insets = useSafeAreaInsets();
  const [isOpen, setOpen] = useState(false);
  const { theme, setThemeName } = useTheme();
  const popoverScale = useRef(new Animated.Value(0.8)).current;
  const popoverOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setOpen(false);
  }, [activeTab, selectedStoryId]);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(popoverScale, { toValue: isOpen ? 1 : 0.8, useNativeDriver: Platform.OS !== 'web' }),
      Animated.timing(popoverOpacity, {
        toValue: isOpen ? 1 : 0,
        duration: 140,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();
  }, [isOpen, popoverOpacity, popoverScale]);

  return (
    <View style={{ position: 'absolute', right: 16, top: insets.top + 14, zIndex: 20 }}>
      <Pressable
        accessibilityLabel="调整主题"
        onPress={() => setOpen((open) => !open)}
        style={{
          alignItems: 'center',
          backgroundColor: theme.color,
          borderRadius: BUTTON_SIZE / 2,
          height: BUTTON_SIZE,
          justifyContent: 'center',
          width: BUTTON_SIZE,
        }}
      >
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 4, height: 10, width: 10 }} />
      </Pressable>
      {isOpen ? (
        <Pressable
          accessibilityLabel="关闭主题选择器"
          onPress={() => setOpen(false)}
          style={{ bottom: -9999, left: -9999, position: 'absolute', right: -9999, top: BUTTON_SIZE }}
        />
      ) : null}
      <Animated.View
        style={{
          opacity: popoverOpacity,
          pointerEvents: isOpen ? 'auto' : 'none',
          position: 'absolute',
          right: 0,
          top: BUTTON_SIZE + 8,
          transform: [{ scale: popoverScale }],
        }}
      >
        <ThemePicker
          selectedTheme={theme.name}
          onSelect={(name) => {
            setThemeName(name);
            setOpen(false);
          }}
        />
      </Animated.View>
    </View>
  );
}
