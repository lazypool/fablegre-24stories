import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';

import StoryDrawer from '../components/StoryDrawer';
import { loadStory, stories } from '../data/stories';
import { usePageScroll } from '../navigation/PageScrollContext';
import { useTheme } from '../theme/ThemeContext';
import type { StoryParagraph } from '../types/story';

const HIDE_BUTTON_PROGRESS = 0.3;
const SHOW_BUTTON_PROGRESS = 0.1;

export default function ReadingScreen() {
  const [selectedStory, setSelectedStory] = useState(stories[0]);
  const [story, setStory] = useState<StoryParagraph[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [isLoading, setLoading] = useState(true);
  const [readingProgress, setReadingProgress] = useState(0);
  const listRef = useRef<FlatList<StoryParagraph>>(null);
  const viewportHeight = useRef(0);
  const contentHeight = useRef(0);
  const maximumOffset = useRef<number | null>(null);
  const isButtonHidden = useRef(false);
  const { setPageScroll } = usePageScroll();
  const { theme } = useTheme();

  useEffect(() => {
    let isActive = true;
    setStory([]);
    setError(null);
    setReadingProgress(0);
    setLoading(true);
    maximumOffset.current = null;
    isButtonHidden.current = false;
    void loadStory(selectedStory)
      .then((paragraphs) => {
        if (isActive) {
          setStory(paragraphs);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isActive) {
          setError('Unable to load the bundled story.');
          setLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [selectedStory]);

  useEffect(() => {
    return () => setPageScroll(false, () => {});
  }, [setPageScroll]);

  return (
    <View className="flex-1 bg-slate-50">
      <View style={{ backgroundColor: 'transparent', height: 3, width: '100%' }}>
        <View style={{ backgroundColor: theme.color, height: '100%', transform: [{ scaleX: readingProgress }], transformOrigin: 'left', width: '100%' }} />
      </View>
      <FlatList
        ref={listRef}
        style={{ flex: 1 }}
        data={story}
        initialNumToRender={story.length || 1}
        maxToRenderPerBatch={story.length || 1}
        removeClippedSubviews={false}
        keyExtractor={(paragraph, index) => `${selectedStory.id}-${index}-${paragraph.english.slice(0, 24)}`}
        ListEmptyComponent={error ? <Text className="text-[15px] text-red-700">{error}</Text> : <ActivityIndicator color={theme.color} />}
        ListHeaderComponent={<Text className="mb-7 text-3xl font-bold tracking-normal text-slate-900">{selectedStory.title}</Text>}
        contentContainerStyle={{ padding: 24 }}
        scrollEnabled={!isLoading}
        showsVerticalScrollIndicator={false}
        onLayout={(event) => {
          viewportHeight.current = event.nativeEvent.layout.height;
          if (!isLoading && maximumOffset.current === null && contentHeight.current > 0) {
            maximumOffset.current = Math.max(0, contentHeight.current - viewportHeight.current);
          }
        }}
        onContentSizeChange={(_, nextContentHeight) => {
          contentHeight.current = nextContentHeight;
          if (!isLoading && maximumOffset.current === null && viewportHeight.current > 0) {
            maximumOffset.current = Math.max(0, nextContentHeight - viewportHeight.current);
          }
        }}
        onScroll={(event) => {
          if (isLoading) return;

          const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
          const hasReachedEnd = contentOffset.y + layoutMeasurement.height >= contentSize.height - 1;
          if (hasReachedEnd) {
            maximumOffset.current = contentOffset.y;
          }
          const lockedMaximumOffset = maximumOffset.current ?? 0;
          const progress = lockedMaximumOffset > 0 ? Math.min(contentOffset.y / lockedMaximumOffset, 1) : 0;
          const progressThreshold = lockedMaximumOffset > 0 ? contentOffset.y / lockedMaximumOffset : 0;
          if (!isButtonHidden.current && progressThreshold >= HIDE_BUTTON_PROGRESS) {
            isButtonHidden.current = true;
          } else if (isButtonHidden.current && progressThreshold <= SHOW_BUTTON_PROGRESS) {
            isButtonHidden.current = false;
          }
          const isScrolled = isButtonHidden.current;

          setReadingProgress(progress);
          setPageScroll(isScrolled, () => listRef.current?.scrollToOffset({ animated: true, offset: 0 }));
        }}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <View className="mb-4 rounded-lg border border-slate-200 bg-white p-5">
            <Text className="text-lg leading-[30px] text-slate-800">{item.english}</Text>
            <View className="my-5 h-px bg-slate-200" />
            <Text className="text-base leading-7 text-slate-600">{item.chinese}</Text>
          </View>
        )}
      />
      <StoryDrawer
        isOpen={isDrawerOpen}
        selectedStoryId={selectedStory.id}
        stories={stories}
        onSelect={(story) => {
          setSelectedStory(story);
        }}
        onToggle={() => setDrawerOpen((open) => !open)}
      />
    </View>
  );
}
