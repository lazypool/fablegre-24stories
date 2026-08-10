import { createContext, useCallback, useContext, useEffect, type PropsWithChildren } from 'react';

import { loadStory } from '../data/stories';
import { getWordRecord, prefetchPart, prefetchPartForSequence, wordChunkIdForStory } from '../data/words';
import { useStory } from './StoryContext';
import type { WordRecord } from '../types/word';

type WordContextValue = {
  lookupWord: (word: string) => Promise<WordRecord | null>;
  prefetchForParagraph: (paragraphIndex: number) => void;
};

const WordContext = createContext<WordContextValue | null>(null);

export function WordProvider({ children }: PropsWithChildren) {
  const { selectedStory } = useStory();

  useEffect(() => {
    void loadStory(selectedStory)
      .then(() => prefetchPart(wordChunkIdForStory(selectedStory.id), 0))
      .catch(() => {});
  }, [selectedStory]);

  const lookupWord = useCallback(
    (word: string) =>
      loadStory(selectedStory)
        .then(({ wordSequence }) => {
          const sequence = wordSequence.get(word);
          if (sequence === undefined) return null;
          return getWordRecord(wordChunkIdForStory(selectedStory.id), sequence, word);
        })
        .catch(() => null),
    [selectedStory],
  );

  const prefetchForParagraph = useCallback(
    (paragraphIndex: number) => {
      void loadStory(selectedStory)
        .then(({ paragraphSequences }) => {
          const sequence = paragraphSequences[paragraphIndex];
          if (sequence !== undefined) prefetchPartForSequence(wordChunkIdForStory(selectedStory.id), sequence);
        })
        .catch(() => {});
    },
    [selectedStory],
  );

  return <WordContext.Provider value={{ lookupWord, prefetchForParagraph }}>{children}</WordContext.Provider>;
}

export function useWordBank() {
  const context = useContext(WordContext);

  if (!context) {
    throw new Error('useWordBank must be used within a WordProvider.');
  }

  return context;
}
