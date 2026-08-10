import { useEffect, useRef, useState } from 'react';
import { Animated, LayoutChangeEvent, Pressable, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { useTheme } from '../theme/ThemeContext';
import type { Story } from '../types/story';

const HANDLE_HEIGHT = 24;

type StoryDrawerProps = {
  isOpen: boolean;
  selectedStoryId: string;
  stories: Story[];
  onSelect: (story: Story) => void;
  onToggle: () => void;
};

export default function StoryDrawer({ isOpen, selectedStoryId, stories, onSelect, onToggle }: StoryDrawerProps) {
  const height = useRef(new Animated.Value(HANDLE_HEIGHT)).current;
  const [contentHeight, setContentHeight] = useState(0);
  const [isMounted, setMounted] = useState(isOpen);
  const { theme } = useTheme();

  useEffect(() => {
    if (isOpen) setMounted(true);

    const animation = Animated.timing(height, {
      toValue: isOpen ? HANDLE_HEIGHT + contentHeight : HANDLE_HEIGHT,
      duration: 220,
      useNativeDriver: false,
    });

    animation.start(({ finished }) => {
      if (finished && !isOpen) setMounted(false);
    });
  }, [contentHeight, height, isOpen]);

  function handleContentLayout(event: LayoutChangeEvent) {
    setContentHeight(event.nativeEvent.layout.height);
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
          width: 54,
        }}
        onPress={onToggle}
      >
        <Svg height={HANDLE_HEIGHT} style={{ position: 'absolute' }} viewBox="0 0 54 24" width={54}>
          {!expanded ? <Path d="M9 0h36l9 24H0Z" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth={1} /> : null}
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
      <View style={{ bottom: 0, left: 0, pointerEvents: 'box-none', position: 'absolute', right: 0 }}>
        <DrawerHandle expanded={false} />
      </View>
    );
  }

  return (
    <Animated.View
      className="rounded-t-[24px] bg-slate-50"
      style={{ backgroundColor: '#F8FAFC', borderTopColor: '#CBD5E1', borderTopWidth: 1, height, overflow: 'hidden' }}
    >
      <DrawerHandle expanded={isOpen} />
      <View onLayout={handleContentLayout} style={{ paddingBottom: 12, paddingHorizontal: 24 }}>
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
  );
}
