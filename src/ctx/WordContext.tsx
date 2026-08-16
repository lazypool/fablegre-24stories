import { createContext, useCallback, useContext, type PropsWithChildren } from 'react';

import { getWordBank, getWordsByStory } from '../data/words';
import { useStory } from './StoryContext';
import type { WordRecord } from '../types/word';

type WordContextValue = {
  lookupWord: (word: string) => WordRecord | null;
  getWordRecordsByStory: (storyId: string) => WordRecord[];
};

const WordContext = createContext<WordContextValue | null>(null);

export function WordProvider({ children }: PropsWithChildren) {
  const { selectedStory } = useStory();

  const lookupWord = useCallback((word: string) => getWordBank(selectedStory.id).get(word) ?? null, [selectedStory]);

  return (
    <WordContext.Provider value={{ lookupWord, getWordRecordsByStory: getWordsByStory }}>
      {children}
    </WordContext.Provider>
  );
}

export function useWordBank() {
  const context = useContext(WordContext);
  if (!context) throw new Error('useWordBank must be used within a WordProvider.');
  return context;
}
