import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Animated, FlatList, Modal, Pressable, Text, View } from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';

import WordCard from '../comps/WordCard';
import { loadStory } from '../data/stories';
import { useStory } from '../ctx/StoryContext';
import { useTabBarHeight } from '../ctx/TabBarHeightContext';
import { useWordBank } from '../ctx/WordContext';
import { useTheme } from '../ctx/ThemeContext';
import type { EnglishSegment, StoryParagraph } from '../types/story';
import type { WordRecord } from '../types/word';

type ParagraphItemProps = {
  segments: EnglishSegment[];
  chinese: string;
  paragraphIndex: number;
  themeColor: string;
  locateTarget: { word: string; paragraphIndex: number } | null;
  flashTextColor: Animated.AnimatedInterpolation<string>;
  onWordPress: (word: string) => void;
  onHeightChange: (index: number, height: number) => void;
};

const ParagraphItem = memo(function ParagraphItem({
  segments,
  chinese,
  paragraphIndex,
  themeColor,
  locateTarget,
  flashTextColor,
  onWordPress,
  onHeightChange,
}: ParagraphItemProps) {
  return (
    <View
      className="mb-4 rounded-lg border border-slate-200 bg-white p-5"
      nativeID={`paragraph-${paragraphIndex}`}
      onLayout={(e) => onHeightChange(paragraphIndex, e.nativeEvent.layout.height)}
    >
      <Text className="text-lg leading-[30px] text-slate-800">
        {segments.map((segment, segmentIndex) => {
          if (!segment.word) {
            return (
              <Text key={segmentIndex} className={segment.isItalic ? 'italic' : undefined}>
                {segment.text}
              </Text>
            );
          }

          const word = segment.word;
          const isLocateTarget =
            locateTarget !== null && locateTarget.word === word && locateTarget.paragraphIndex === paragraphIndex;
          return (
            <Animated.Text
              key={segmentIndex}
              onPress={() => onWordPress(word)}
              style={{ color: isLocateTarget ? flashTextColor : themeColor }}
            >
              {segment.text}
            </Animated.Text>
          );
        })}
      </Text>
      <View className="my-5 h-px bg-slate-200" />
      <Text className="text-base leading-7 text-slate-600">{chinese}</Text>
    </View>
  );
});

export default function ReadingScreen() {
  const [story, setStory] = useState<StoryParagraph[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [readingProgress, setReadingProgress] = useState(0);
  const listRef = useRef<FlatList<StoryParagraph>>(null);
  const viewportHeight = useRef(0);
  const maximumOffset = useRef<number | null>(null);
  const { selectedStory } = useStory();
  const { lookupWord } = useWordBank();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<Record<string, { targetParagraph?: number; targetWord?: string }>>>();
  const { theme } = useTheme();
  const { setTabBarHeight } = useTabBarHeight();
  const [selectedRecord, setSelectedRecord] = useState<WordRecord | null>(null);
  const [loadingWord, setLoadingWord] = useState<string | null>(null);
  const latestWordRef = useRef<string | null>(null);
  const [locateTarget, setLocateTarget] = useState<{ word: string; paragraphIndex: number } | null>(null);
  const flashValue = useRef(new Animated.Value(0)).current;
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tabBarHeight = useBottomTabBarHeight();
  const paragraphHeights = useRef<Map<number, number>>(new Map());
  const realContentHeight = useRef(0);
  const [spacerHeight, setSpacerHeight] = useState(0);

  useEffect(() => {
    setTabBarHeight(tabBarHeight);
  }, [tabBarHeight, setTabBarHeight]);

  function closeCard() {
    setSelectedRecord(null);
    setLoadingWord(null);
  }

  function handleWordPress(word: string) {
    latestWordRef.current = word;
    setSelectedRecord(null);
    setLoadingWord(word);
    const record = lookupWord(word);
    if (latestWordRef.current !== word) return;
    if (record) setSelectedRecord(record);
    setLoadingWord(null);
  }

  const flashTextColor = useMemo(
    () => flashValue.interpolate({ inputRange: [0, 1], outputRange: [theme.color, '#EF4444'] }),
    [flashValue, theme.color],
  );

  const scrollToParagraphByOffset = useCallback((index: number) => {
    let offset = 0;
    for (let i = 0; i < index; i++) {
      offset += paragraphHeights.current.get(i) ?? 200;
    }
    const headerHeight = 80;
    offset += headerHeight;
    offset = Math.max(0, offset - viewportHeight.current * 0.2);
    listRef.current?.scrollToOffset({ animated: true, offset });
  }, []);

  const scrollToParagraph = useCallback(
    (index: number) => {
      scrollToParagraphByOffset(index);
    },
    [scrollToParagraphByOffset],
  );

  const handleScrollToIndexFailed = useCallback(
    (info: { index: number; highestMeasuredFrameIndex: number; averageItemLength: number }) => {
      const offset = info.index * info.averageItemLength;
      listRef.current?.scrollToOffset({ animated: true, offset: Math.max(0, offset - 50) });
    },
    [],
  );

  const flashWord = useCallback(
    (word: string, paragraphIndex: number) => {
      setLocateTarget({ word, paragraphIndex });
      flashValue.stopAnimation();
      flashValue.setValue(0);
      const pulses = Animated.sequence([
        Animated.timing(flashValue, { duration: 160, toValue: 1, useNativeDriver: false }),
        Animated.timing(flashValue, { duration: 160, toValue: 0, useNativeDriver: false }),
        Animated.timing(flashValue, { duration: 160, toValue: 1, useNativeDriver: false }),
        Animated.timing(flashValue, { duration: 160, toValue: 0, useNativeDriver: false }),
      ]);
      pulses.start(({ finished }) => {
        if (finished) setLocateTarget(null);
      });
    },
    [flashValue],
  );

  const handleParagraphHeight = useCallback(
    (index: number, height: number) => {
      const prev = paragraphHeights.current.get(index);
      if (prev === height) return;
      paragraphHeights.current.set(index, height);
      let sum = 0;
      paragraphHeights.current.forEach((h) => (sum += h));
      realContentHeight.current = sum;
      const count = paragraphHeights.current.size;
      const avg = sum / count;
      const newSpacer = Math.max(0, Math.round((story.length - count) * avg));
      setSpacerHeight(newSpacer);
      if (viewportHeight.current > 0) {
        const totalHeight = sum + newSpacer + 48;
        maximumOffset.current = Math.max(0, totalHeight - viewportHeight.current);
      }
    },
    [story.length],
  );

  useEffect(() => {
    let isActive = true;
    setSelectedRecord(null);
    setLoadingWord(null);
    latestWordRef.current = null;
    setLocateTarget(null);
    if (flashTimer.current) clearTimeout(flashTimer.current);
    flashValue.stopAnimation();
    flashValue.setValue(0);
    maximumOffset.current = null;
    paragraphHeights.current.clear();
    realContentHeight.current = 0;
    setSpacerHeight(0);
    setReadingProgress(0);

    requestAnimationFrame(() => {
      listRef.current?.scrollToOffset({ animated: true, offset: 0 });
    });

    const timer = setTimeout(() => {
      try {
        const { paragraphs } = loadStory(selectedStory);
        if (!isActive) return;
        setStory(paragraphs);
        setError(null);
        setLoading(false);
      } catch {
        if (!isActive) return;
        setStory([]);
        setError('Unable to load the bundled story.');
        setLoading(false);
      }
    }, 300);

    return () => {
      isActive = false;
      clearTimeout(timer);
    };
  }, [flashValue, selectedStory]);

  useEffect(() => {
    return () => {
      if (flashTimer.current) clearTimeout(flashTimer.current);
      flashValue.stopAnimation();
    };
  }, [flashValue]);

  useEffect(() => {
    const target = route.params?.targetParagraph;
    const word = route.params?.targetWord;
    if (target === undefined || story.length === 0 || isLoading) return;
    if (target >= 0 && target < story.length) {
      navigation.setParams({ targetParagraph: undefined, targetWord: undefined } as never);
      scrollToParagraph(target);
      if (word) {
        if (flashTimer.current) clearTimeout(flashTimer.current);
        flashTimer.current = setTimeout(() => flashWord(word, target), 100);
      }
    }
  }, [route.params, story, isLoading, navigation, flashWord, scrollToParagraph]);

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
        keyExtractor={(_, index) => String(index)}
        onScrollToIndexFailed={handleScrollToIndexFailed}
        ListEmptyComponent={
          error ? <Text className="text-[15px] text-red-700">{error}</Text> : <ActivityIndicator color={theme.color} />
        }
        ListHeaderComponent={
          <Text className="mb-7 text-3xl font-bold tracking-normal text-slate-900">{selectedStory.title}</Text>
        }
        ListFooterComponent={spacerHeight > 0 ? <View style={{ height: spacerHeight }} /> : null}
        contentContainerStyle={{ padding: 24 }}
        scrollEnabled={!isLoading}
        showsVerticalScrollIndicator={false}
        onLayout={(event) => {
          viewportHeight.current = event.nativeEvent.layout.height;
        }}
        onScroll={(event) => {
          if (isLoading) return;

          const { contentOffset } = event.nativeEvent;
          const lockedMaximumOffset = maximumOffset.current ?? 0;
          const progress = lockedMaximumOffset > 0 ? Math.min(contentOffset.y / lockedMaximumOffset, 1) : 0;
          setReadingProgress(progress);
        }}
        scrollEventThrottle={16}
        renderItem={({ item, index }) => (
          <ParagraphItem
            segments={item.segments}
            chinese={item.chinese}
            paragraphIndex={index}
            themeColor={theme.color}
            locateTarget={locateTarget}
            flashTextColor={flashTextColor}
            onWordPress={handleWordPress}
            onHeightChange={handleParagraphHeight}
          />
        )}
      />
      <Modal
        animationType="fade"
        transparent
        visible={selectedRecord !== null || loadingWord !== null}
        onRequestClose={closeCard}
      >
        <Pressable className="flex-1 items-center justify-center bg-black/40 px-6 py-24" onPress={closeCard}>
          <Pressable className="w-full max-w-md" accessible={false} onPress={() => {}}>
            <WordCard
              record={selectedRecord}
              word={loadingWord}
              buttons={[
                {
                  label: '看单词卡',
                  onPress: () => {
                    closeCard();
                    (navigation as any).navigate('Words', { targetWord: selectedRecord?.word });
                  },
                },
              ]}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
