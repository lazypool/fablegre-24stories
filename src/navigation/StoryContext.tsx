import { createContext, useContext, useState, type PropsWithChildren } from 'react';

import { stories } from '../data/stories';
import type { Story } from '../types/story';

type StoryContextValue = {
  selectedStory: Story;
  selectStory: (story: Story) => void;
};

const StoryContext = createContext<StoryContextValue | null>(null);

export function StoryProvider({ children }: PropsWithChildren) {
  const [selectedStory, setSelectedStory] = useState(stories[0]);

  return (
    <StoryContext.Provider value={{ selectedStory, selectStory: setSelectedStory }}>{children}</StoryContext.Provider>
  );
}

export function useStory() {
  const context = useContext(StoryContext);

  if (!context) {
    throw new Error('useStory must be used within a StoryProvider.');
  }

  return context;
}
