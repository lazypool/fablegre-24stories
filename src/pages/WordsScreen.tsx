import { useEffect, useRef, useState } from 'react';
import { Animated, PanResponder, Text, useWindowDimensions, View } from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';

import WordCard from '../comps/WordCard';
import { useTheme } from '../ctx/ThemeContext';
import { useWordBank } from '../ctx/WordContext';
import { useStory } from '../ctx/StoryContext';

const VERTICAL_SWIPE_THRESHOLD = 20;
const VERTICAL_EXIT_DURATION = 360;
const HORIZONTAL_SWIPE_THRESHOLD = 60;
const HORIZONTAL_EXIT_DURATION = 120;

export default function WordsScreen() {
  const { theme } = useTheme();
  const { getWordRecordsByStory } = useWordBank();
  const { selectedStory } = useStory();
  const tabBarHeight = useBottomTabBarHeight();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const route = useRoute<RouteProp<Record<string, { targetWord?: string }>>>();
  const navigation = useNavigation();
  const exitDistance = screenWidth + 100;

  const [cardHeight, setCardHeight] = useState(0);
  const cardHeightRef = useRef(0);
  const words = getWordRecordsByStory(selectedStory.id);
  const n = words.length;

  const [frontWord, setFrontWord] = useState(0);
  const [backWord, setBackWord] = useState(1);
  const frontWordRef = useRef(0);
  const backWordRef = useRef(1);
  const nRef = useRef(n);
  const exitDistRef = useRef(exitDistance);

  useEffect(() => {
    cardHeightRef.current = cardHeight;
  }, [cardHeight]);
  useEffect(() => {
    frontWordRef.current = frontWord;
  }, [frontWord]);
  useEffect(() => {
    backWordRef.current = backWord;
  }, [backWord]);
  useEffect(() => {
    nRef.current = n;
  }, [n]);
  useEffect(() => {
    exitDistRef.current = exitDistance;
  }, [exitDistance]);

  const frontX = useRef(new Animated.Value(0)).current;
  const frontY = useRef(new Animated.Value(0)).current;
  const rotate = frontX.interpolate({
    inputRange: [-screenWidth, 0, screenWidth],
    outputRange: ['-15deg', '0deg', '15deg'],
    extrapolate: 'clamp',
  });
  const isAnimating = useRef(false);

  useEffect(() => {
    setFrontWord(0);
    setBackWord(1);
    frontX.setValue(0);
    frontY.setValue(0);
  }, [selectedStory, frontX, frontY]);

  useEffect(() => {
    const target = route.params?.targetWord;
    if (!target || n === 0) return;
    const idx = words.findIndex((w) => w.word === target);
    if (idx < 0) return;
    setFrontWord(idx);
    setBackWord((idx + 1) % n);
    frontX.setValue(0);
    frontY.setValue(0);
  }, [route.params?.targetWord, words, n, frontX, frontY]);

  const gestureStartRef = useRef({ x: 0, y: 0 });
  const prevGestureX = useRef(0);
  const totalHorizontalDistance = useRef(0);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, g) => {
        if (isAnimating.current) return false;
        const adx = Math.abs(g.dx);
        const ady = Math.abs(g.dy);
        if (adx < 10 && ady < 10) return false;
        return true;
      },
      onPanResponderGrant: (_, g) => {
        gestureStartRef.current = { x: g.x0, y: g.y0 };
        prevGestureX.current = g.x0;
        totalHorizontalDistance.current = 0;
      },
      onPanResponderMove: (_, g) => {
        const x = gestureStartRef.current.x + g.dx;
        totalHorizontalDistance.current += Math.abs(x - prevGestureX.current);
        prevGestureX.current = x;
        if (totalHorizontalDistance.current >= 2 * VERTICAL_SWIPE_THRESHOLD) {
          frontX.setValue(g.dx);
        }
      },
      onPanResponderRelease: (_, g) => {
        const adx = Math.abs(g.dx);
        const ady = Math.abs(g.dy);

        const isStraightVertical =
          ady > VERTICAL_SWIPE_THRESHOLD && totalHorizontalDistance.current < 2 * VERTICAL_SWIPE_THRESHOLD;

        if (isStraightVertical) {
          isAnimating.current = true;
          const fw = frontWordRef.current;
          const nn = nRef.current;
          const prevWord = (fw - 1 + nn) % nn;
          setBackWord(fw);
          setTimeout(() => {
            frontY.setValue(screenHeight + cardHeightRef.current);
            setTimeout(() => {
              setFrontWord(prevWord);
              setTimeout(() => {
                Animated.timing(frontY, {
                  toValue: 0,
                  duration: VERTICAL_EXIT_DURATION,
                  useNativeDriver: false,
                }).start(() => {
                  frontY.setValue(0);
                  isAnimating.current = false;
                });
              }, 0);
            }, 0);
          }, 0);
        } else if (adx > HORIZONTAL_SWIPE_THRESHOLD) {
          isAnimating.current = true;
          const dir = g.dx > 0 ? 1 : -1;
          Animated.timing(frontX, {
            toValue: dir * exitDistRef.current,
            duration: HORIZONTAL_EXIT_DURATION,
            useNativeDriver: false,
          }).start(() => {
            const bw = backWordRef.current;
            const nn = nRef.current;
            setFrontWord(bw);
            setTimeout(() => {
              frontX.setValue(0);
              setBackWord((bw + 1) % nn);
              isAnimating.current = false;
            }, 0);
          });
        } else {
          Animated.parallel([
            Animated.spring(frontX, { toValue: 0, useNativeDriver: false }),
            Animated.spring(frontY, { toValue: 0, useNativeDriver: false }),
          ]).start();
        }
      },
    }),
  ).current;

  const containerStyle = {
    height: cardHeight,
    borderRadius: 20,
    borderWidth: 4,
    borderColor: '#f8fafc',
    backgroundColor: theme.color,
    overflow: 'hidden' as const,
    padding: 4,
  };

  return (
    <View className="flex-1 bg-slate-50">
      <View className="px-6 pt-6 pb-2">
        <Text className="text-2xl font-bold text-slate-900">{selectedStory.title}</Text>
        <Text className="mt-2 text-sm text-slate-500">{n > 0 ? `${frontWord + 1} / ${n}` : '暂无单词'}</Text>
      </View>

      <View
        className="flex-1 items-center"
        style={{ paddingHorizontal: 24, paddingTop: 40, paddingBottom: tabBarHeight + 16 }}
      >
        <View
          style={{ width: '100%', flex: 1, borderRadius: 20 }}
          onLayout={(e) => {
            const h = e.nativeEvent.layout.height;
            if (h > 0 && h !== cardHeight) setCardHeight(h);
          }}
        >
          {cardHeight > 0 && words[backWord] && words[frontWord] && (
            <>
              <View style={{ position: 'absolute', left: 0, right: 0, top: 0, zIndex: 0 }}>
                <View style={containerStyle}>
                  <WordCard
                    record={words[backWord]}
                    buttons={[
                      {
                        label: '定位原文',
                        onPress: () => {},
                      },
                    ]}
                  />
                </View>
              </View>

              <Animated.View
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: 0,
                  zIndex: 1,
                  transform: [{ translateX: frontX }, { translateY: frontY }, { rotate }],
                }}
                {...panResponder.panHandlers}
              >
                <View style={containerStyle}>
                  <WordCard
                    record={words[frontWord]}
                    buttons={[
                      {
                        label: '定位原文',
                        onPress: () => {
                          const record = words[frontWord];
                          (navigation as any).navigate('Read', {
                            targetParagraph: record.paragraph - 1,
                            targetWord: record.word,
                          });
                        },
                      },
                    ]}
                  />
                </View>
              </Animated.View>
            </>
          )}
        </View>

        <Text className="mt-6 text-xs text-slate-400">← 左右滑动下一张 · 向上滑动上一张 →</Text>
      </View>
    </View>
  );
}
