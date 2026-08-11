import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Animated, FlatList, Pressable, Text, View } from 'react-native';

import WordMeaningCard from '../components/WordMeaningCard';
import { loadReadingProgress, saveReadingProgress } from '../data/readingProgress';
import { loadStory } from '../data/stories';
import { usePageScroll } from '../navigation/PageScrollContext';
import { useStory } from '../navigation/StoryContext';
import { useWordBank } from '../navigation/WordContext';
import { useTheme } from '../theme/ThemeContext';
import type { StoryParagraph } from '../types/story';
import type { WordRecord } from '../types/word';

const HIDE_BUTTON_PROGRESS = 0.3;
const SHOW_BUTTON_PROGRESS = 0.1;

type EnglishSegment = {
  text: string;
  word: string | null;
  isItalic: boolean;
};

function splitEnglish(english: string): EnglishSegment[] {
  return english
    .split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g)
    .filter(Boolean)
    .map((part) => {
      const bold = part.match(/^\*\*([^*]+)\*\*$/);
      if (bold) {
        const word = bold[1].trim();
        return { text: word, word, isItalic: false };
      }

      const italic = part.match(/^\*([^*]+)\*$/);
      return italic
        ? { text: italic[1].trim(), word: null, isItalic: true }
        : { text: part, word: null, isItalic: false };
    });
}

export default function ReadingScreen() {
  const [story, setStory] = useState<StoryParagraph[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [readingProgress, setReadingProgress] = useState(0);
  const listRef = useRef<FlatList<StoryParagraph>>(null);
  const viewportHeight = useRef(0);
  const contentHeight = useRef(0);
  const maximumOffset = useRef<number | null>(null);
  const isButtonHidden = useRef(false);
  const pendingRestore = useRef<number | null>(null);
  const restoreReady = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingSave = useRef<{ storyId: string; progress: number } | null>(null);
  const { setPageScroll } = usePageScroll();
  const { selectedStory } = useStory();
  const { lookupWord, prefetchForParagraph } = useWordBank();
  const { theme } = useTheme();
  const [selectedRecord, setSelectedRecord] = useState<WordRecord | null>(null);
  const [loadingWord, setLoadingWord] = useState<string | null>(null);
  const latestWordRef = useRef<string | null>(null);
  const [locateTarget, setLocateTarget] = useState<{ word: string; paragraphIndex: number } | null>(null);
  const flashValue = useRef(new Animated.Value(0)).current;
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prefetchedParagraph = useRef(-1);

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: { index: number | null }[] }) => {
    const firstVisible = viewableItems[0];
    if (firstVisible?.index == null || firstVisible.index === prefetchedParagraph.current) return;
    prefetchedParagraph.current = firstVisible.index;
    prefetchForParagraph(firstVisible.index);
  }).current;

  function closeCard() {
    setSelectedRecord(null);
    setLoadingWord(null);
  }

  function flushProgressSave() {
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }
    if (pendingSave.current) {
      const { storyId, progress } = pendingSave.current;
      pendingSave.current = null;
      void saveReadingProgress(storyId, progress).catch(() => {});
    }
  }

  function scheduleProgressSave(progress: number) {
    pendingSave.current = { storyId: selectedStory.id, progress };
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(flushProgressSave, 500);
  }

  function restoreScrollPosition() {
    const progress = pendingRestore.current;
    if (progress == null) return;
    const max = maximumOffset.current ?? 0;
    if (max <= 0) return;
    pendingRestore.current = null;
    listRef.current?.scrollToOffset({ animated: false, offset: progress * max });
  }

  function handleWordPress(word: string) {
    latestWordRef.current = word;
    setSelectedRecord(null);
    setLoadingWord(word);
    void lookupWord(word).then((record) => {
      if (latestWordRef.current !== word) return;
      if (record) setSelectedRecord(record);
      setLoadingWord(null);
    });
  }

  const flashBorderColor = useMemo(
    () => flashValue.interpolate({ inputRange: [0, 1], outputRange: ['transparent', theme.color] }),
    [flashValue, theme.color],
  );

  function flashWord(word: string, paragraphIndex: number) {
    setLocateTarget({ word, paragraphIndex });
    flashValue.stopAnimation();
    flashValue.setValue(0);
    const pulses = Animated.sequence([
      Animated.timing(flashValue, { duration: 160, toValue: 1, useNativeDriver: false }),
      Animated.timing(flashValue, { duration: 160, toValue: 0, useNativeDriver: false }),
    ]);
    pulses.start(({ finished }) => {
      if (finished) setLocateTarget(null);
    });
  }

  useEffect(() => {
    let isActive = true;
    flushProgressSave();
    setStory([]);
    setError(null);
    setReadingProgress(0);
    setLoading(true);
    setSelectedRecord(null);
    setLoadingWord(null);
    latestWordRef.current = null;
    setLocateTarget(null);
    if (flashTimer.current) clearTimeout(flashTimer.current);
    flashValue.stopAnimation();
    flashValue.setValue(0);
    maximumOffset.current = null;
    isButtonHidden.current = false;
    prefetchedParagraph.current = -1;
    pendingRestore.current = null;
    restoreReady.current = false;
    void loadStory(selectedStory)
      .then(({ paragraphs }) => {
        if (!isActive) return;
        setStory(paragraphs);
        setLoading(false);
      })
      .catch(() => {
        if (isActive) {
          setError('Unable to load the bundled story.');
          setLoading(false);
        }
      });
    void loadReadingProgress(selectedStory.id).then((progress) => {
      if (!isActive) return;
      pendingRestore.current = progress;
      restoreReady.current = true;
      if (progress > 0) setReadingProgress(progress);
      if (maximumOffset.current != null) restoreScrollPosition();
    });

    return () => {
      isActive = false;
    };
  }, [flashValue, selectedStory]);

  useEffect(() => {
    return () => setPageScroll(false, () => {});
  }, [setPageScroll]);

  useEffect(() => {
    return () => flushProgressSave();
  }, []);

  useEffect(() => {
    return () => {
      if (flashTimer.current) clearTimeout(flashTimer.current);
      flashValue.stopAnimation();
    };
  }, [flashValue]);

  return (
    <View className="flex-1 bg-slate-50">
      <View style={{ backgroundColor: 'transparent', height: 3, width: '100%' }}>
        <View
          style={{
            backgroundColor: theme.color,
            height: '100%',
            transform: [{ scaleX: readingProgress }],
            transformOrigin: 'left',
            width: '100%',
          }}
        />
      </View>
      <FlatList
        ref={listRef}
        style={{ flex: 1 }}
        data={story}
        initialNumToRender={story.length || 1}
        maxToRenderPerBatch={story.length || 1}
        removeClippedSubviews={false}
        keyExtractor={(paragraph, index) => `${selectedStory.id}-${index}-${paragraph.english.slice(0, 24)}`}
        ListEmptyComponent={
          error ? <Text className="text-[15px] text-red-700">{error}</Text> : <ActivityIndicator color={theme.color} />
        }
        ListHeaderComponent={
          <Text className="mb-7 text-3xl font-bold tracking-normal text-slate-900">{selectedStory.title}</Text>
        }
        contentContainerStyle={{ padding: 24 }}
        scrollEnabled={!isLoading}
        showsVerticalScrollIndicator={false}
        onLayout={(event) => {
          viewportHeight.current = event.nativeEvent.layout.height;
          if (!isLoading && maximumOffset.current === null && contentHeight.current > 0) {
            maximumOffset.current = Math.max(0, contentHeight.current - viewportHeight.current);
            if (restoreReady.current) restoreScrollPosition();
          }
        }}
        onContentSizeChange={(_, nextContentHeight) => {
          contentHeight.current = nextContentHeight;
          if (!isLoading && maximumOffset.current === null && viewportHeight.current > 0) {
            maximumOffset.current = Math.max(0, nextContentHeight - viewportHeight.current);
            if (restoreReady.current) restoreScrollPosition();
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
          scheduleProgressSave(progress);
          setPageScroll(isScrolled, () => listRef.current?.scrollToOffset({ animated: true, offset: 0 }));
        }}
        scrollEventThrottle={16}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 1 }}
        renderItem={({ item, index }) => (
          <View className="mb-4 rounded-lg border border-slate-200 bg-white p-5">
            <Text className="text-lg leading-[30px] text-slate-800">
              {splitEnglish(item.english).map((segment, segmentIndex) => {
                if (!segment.word) {
                  return (
                    <Text key={segmentIndex} className={segment.isItalic ? 'italic' : undefined}>
                      {segment.text}
                    </Text>
                  );
                }

                const word = segment.word;
                const isLocateTarget =
                  locateTarget !== null && locateTarget.word === word && locateTarget.paragraphIndex === index;
                return (
                  <Animated.View
                    key={segmentIndex}
                    style={{
                      borderColor: isLocateTarget ? flashBorderColor : 'transparent',
                      borderRadius: 4,
                      borderWidth: 1.5,
                    }}
                  >
                    <Pressable onPress={() => handleWordPress(word)}>
                      <Text style={{ color: theme.color }}>{segment.text}</Text>
                    </Pressable>
                  </Animated.View>
                );
              })}
            </Text>
            <View className="my-5 h-px bg-slate-200" />
            <Text className="text-base leading-7 text-slate-600">{item.chinese}</Text>
          </View>
        )}
      />
      <WordMeaningCard
        record={selectedRecord}
        word={loadingWord}
        onLocate={() => {
          if (!selectedRecord) return;
          const paragraphIndex = selectedRecord.paragraph - 1;
          const word = selectedRecord.word;
          closeCard();
          if (paragraphIndex >= 0 && paragraphIndex < story.length) {
            listRef.current?.scrollToIndex({ animated: true, index: paragraphIndex, viewPosition: 0.2 });
            if (flashTimer.current) clearTimeout(flashTimer.current);
            flashTimer.current = setTimeout(() => flashWord(word, paragraphIndex), 500);
          }
        }}
        onRequestClose={closeCard}
      />
    </View>
  );
}
