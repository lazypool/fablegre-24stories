import { useEffect, useRef, useState } from 'react';
import { Animated, LayoutChangeEvent, Pressable, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { useTheme } from '../ctx/ThemeContext';
import type { Story } from '../types/story';

const HANDLE_HEIGHT = 24;
const HANDLE_WIDTH = 54;
const DRAWER_COLOR = '#F8FAFC';
const DRAWER_BORDER_COLOR = '#CBD5E1';

type StoryDrawerProps = {
  isOpen: boolean;
  selectedStoryId: string;
  stories: Story[];
  onSelect: (story: Story) => void;
  onToggle: () => void;
};

export default function StoryDrawer({ isOpen, selectedStoryId, stories, onSelect, onToggle }: StoryDrawerProps) {
  const [contentHeight, setContentHeight] = useState(0);
  const translateY = useRef(new Animated.Value(0)).current;
  const [isMounted, setMounted] = useState(isOpen);
  const { theme } = useTheme();

  useEffect(() => {
    if (isOpen) setMounted(true);

    const animation = Animated.timing(translateY, {
      toValue: isOpen ? 0 : contentHeight,
      duration: 220,
      useNativeDriver: true,
    });

    animation.start(({ finished }) => {
      if (finished && !isOpen) setMounted(false);
    });
  }, [contentHeight, translateY, isOpen]);

  function handleContentLayout(event: LayoutChangeEvent) {
    const h = event.nativeEvent.layout.height;
    if (!isOpen || contentHeight === 0) translateY.setValue(h);
    setContentHeight(h);
  }

  function DrawerHandle({ expanded }: { expanded: boolean }) {
    return (
      <Pressable
        accessibilityLabel="切换小说"
        style={{
          alignItems: 'center',
          alignSelf: 'center',
          height: HANDLE_HEIGHT,
          justifyContent: 'center',
          width: HANDLE_WIDTH,
        }}
        onPress={onToggle}
      >
        <Svg height={HANDLE_HEIGHT} style={{ position: 'absolute' }} viewBox="0 0 54 24" width={HANDLE_WIDTH}>
          <Path d="M0 24 9 0h36l9 24" fill={DRAWER_COLOR} stroke={DRAWER_BORDER_COLOR} strokeWidth={1} />
          <Path
            d={expanded ? 'm21 9 6 7 6-7' : 'm21 15 6-7 6 7'}
            fill="none"
            stroke="#334155"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
          />
        </Svg>
      </Pressable>
    );
  }

  if (!isMounted) {
    return (
      <View
        style={{ bottom: 0, left: 0, overflow: 'visible', pointerEvents: 'box-none', position: 'absolute', right: 0 }}
      >
        <DrawerHandle expanded={false} />
      </View>
    );
  }

  return (
    <View
      style={{
        height: contentHeight > 0 ? contentHeight + HANDLE_HEIGHT : undefined,
        overflow: 'hidden',
      }}
    >
      <Animated.View
        style={{
          bottom: contentHeight > 0 ? 0 : undefined,
          left: contentHeight > 0 ? 0 : undefined,
          opacity: contentHeight > 0 ? 1 : 0,
          position: contentHeight > 0 ? 'absolute' : 'relative',
          right: contentHeight > 0 ? 0 : undefined,
          transform: [{ translateY }],
        }}
      >
        <View
          pointerEvents="box-none"
          style={{
            alignItems: 'center',
            left: 0,
            position: 'absolute',
            right: 0,
            top: -HANDLE_HEIGHT,
            zIndex: 1,
          }}
        >
          <DrawerHandle expanded={isOpen} />
        </View>
        <View
          className="rounded-t-[24px] bg-slate-50"
          onLayout={handleContentLayout}
          style={{
            backgroundColor: DRAWER_COLOR,
            borderColor: DRAWER_BORDER_COLOR,
            borderWidth: 1,
            paddingBottom: 12,
            paddingHorizontal: 24,
          }}
        >
          <View
            pointerEvents="none"
            style={{
              alignSelf: 'center',
              backgroundColor: DRAWER_COLOR,
              height: 1,
              position: 'absolute',
              top: -1,
              width: HANDLE_WIDTH,
            }}
          />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {stories.map((story, index) => (
              <View key={story.id} style={{ aspectRatio: 1, overflow: 'hidden', padding: 5, width: '12.5%' }}>
                <Pressable
                  className="flex-1 items-center justify-center rounded-xl"
                  style={{
                    alignItems: 'center',
                    backgroundColor: story.id === selectedStoryId ? theme.color : '#E2E8F0',
                    borderRadius: 12,
                    borderWidth: 0,
                    justifyContent: 'center',
                  }}
                  onPress={() => onSelect(story)}
                >
                  <Text className="text-sm font-bold" style={{ color: '#FFFFFF' }}>
                    {String(index + 1).padStart(2, '0')}
                  </Text>
                </Pressable>
              </View>
            ))}
          </View>
        </View>
      </Animated.View>
    </View>
  );
}
