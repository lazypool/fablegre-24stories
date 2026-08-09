import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, View } from 'react-native';

import { usePageScroll } from '../navigation/PageScrollContext';
import { useTheme } from '../theme/ThemeContext';
import ThemePicker from './ThemePicker';

export default function ThemeController() {
  const [isOpen, setOpen] = useState(false);
  const { theme, setThemeName } = useTheme();
  const { isScrolled, scrollToTop } = usePageScroll();
  const popoverScale = useRef(new Animated.Value(0.8)).current;
  const popoverOpacity = useRef(new Animated.Value(0)).current;
  const buttonOffset = useRef(new Animated.Value(0)).current;
  const [isButtonAnimating, setButtonAnimating] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(popoverScale, { toValue: isOpen ? 1 : 0.8, useNativeDriver: true }),
      Animated.timing(popoverOpacity, { toValue: isOpen ? 1 : 0, duration: 140, useNativeDriver: true }),
    ]).start();
  }, [isOpen, popoverOpacity, popoverScale]);

  useEffect(() => {
    if (isScrolled) setOpen(false);
    setButtonAnimating(true);
    Animated.spring(buttonOffset, {
      damping: 14,
      stiffness: 170,
      toValue: isScrolled ? -28 : 0,
      useNativeDriver: true,
    }).start(() => setButtonAnimating(false));
  }, [buttonOffset, isScrolled]);

  return (
    <Animated.View
      style={{ position: 'absolute', right: 16, top: 14, transform: [{ translateY: buttonOffset }], zIndex: 20 }}
    >
      <Pressable
        accessibilityLabel={isScrolled ? '回到顶部' : '调整主题'}
        disabled={isButtonAnimating}
        onPress={() => {
          if (isButtonAnimating) return;
          if (isScrolled) scrollToTop();
          else setOpen((open) => !open);
        }}
        style={{
          alignItems: 'center',
          backgroundColor: theme.color,
          borderRadius: 14,
          height: 28,
          justifyContent: 'center',
          width: 28,
        }}
      >
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 4, height: 10, width: 10 }} />
      </Pressable>
      {isOpen ? (
        <Pressable
          accessibilityLabel="关闭主题选择器"
          onPress={() => setOpen(false)}
          style={{ bottom: -9999, left: -9999, position: 'absolute', right: -9999, top: 28 }}
        />
      ) : null}
      <Animated.View
        pointerEvents={isOpen ? 'auto' : 'none'}
        style={{
          opacity: popoverOpacity,
          position: 'absolute',
          right: 0,
          top: 36,
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
    </Animated.View>
  );
}
