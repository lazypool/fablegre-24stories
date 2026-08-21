import { useEffect, useRef, useState } from 'react';
import { Animated, useWindowDimensions } from 'react-native';

const STORY_EXIT_DURATION = 180;
const STORY_ENTER_DURATION = 220;

export function useStoryTransition(storyId: string) {
  const { width } = useWindowDimensions();
  const [displayedStoryId, setDisplayedStoryId] = useState(storyId);
  const translateX = useRef(new Animated.Value(0)).current;
  const isFirstRender = useRef(true);
  const isEnteringRef = useRef(false);
  const widthRef = useRef(width);
  const requestedStoryIdRef = useRef(storyId);

  useEffect(() => {
    widthRef.current = width;
  }, [width]);

  useEffect(() => {
    requestedStoryIdRef.current = storyId;
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (isEnteringRef.current) {
      isEnteringRef.current = false;
      return;
    }
    if (storyId === displayedStoryId) return;

    translateX.stopAnimation();
    Animated.timing(translateX, {
      duration: STORY_EXIT_DURATION,
      toValue: -widthRef.current,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (!finished) return;
      const nextStoryId = requestedStoryIdRef.current;
      isEnteringRef.current = true;
      setDisplayedStoryId(nextStoryId);
      translateX.setValue(widthRef.current);
      Animated.timing(translateX, {
        duration: STORY_ENTER_DURATION,
        toValue: 0,
        useNativeDriver: true,
      }).start();
    });
  }, [displayedStoryId, storyId, translateX]);

  return { displayedStoryId, translateX };
}
