import { Asset } from 'expo-asset';
import { File } from 'expo-file-system';
import { Platform } from 'react-native';

import type { Story, StoryParagraph } from '../types/story';

export { stories } from './assets';

type ParsedStory = {
  paragraphs: StoryParagraph[];
  wordSequence: Map<string, number>;
  paragraphSequences: number[];
};

const storyCache = new Map<string, Promise<ParsedStory>>();

function parseStory(source: string): ParsedStory {
  const blocks = source.split(/\r?\n\s*\r?\n/).map((block) => block.trim()).filter(Boolean).filter((block) => !block.startsWith('#'));
  const paragraphs: StoryParagraph[] = [];
  const wordSequence = new Map<string, number>();
  const paragraphSequences: number[] = [];

  for (let index = 0; index + 1 < blocks.length; index += 2) {
    paragraphSequences.push(wordSequence.size);
    paragraphs.push({ english: blocks[index], chinese: blocks[index + 1] });
    for (const match of blocks[index].matchAll(/\*\*([^*]+)\*\*/g)) {
      const word = match[1].trim();
      if (!wordSequence.has(word)) wordSequence.set(word, wordSequence.size);
    }
  }

  return { paragraphs, wordSequence, paragraphSequences };
}

export function loadStory(story: Story): Promise<ParsedStory> {
  const cached = storyCache.get(story.id);
  if (cached) return cached;

  const task = (async () => {
    const asset = Asset.fromModule(story.asset);
    await asset.downloadAsync();
    const uri = asset.localUri ?? asset.uri;
    const source = Platform.OS === 'web'
      ? await fetch(uri).then(async (response) => {
          if (!response.ok) throw new Error('Story asset request failed.');
          return response.text();
        })
      : await new File(uri).text();
    const parsed = parseStory(source);

    if (parsed.paragraphs.length === 0) throw new Error('Story could not be parsed.');

    return parsed;
  })();

  storyCache.set(story.id, task);
  return task;
}
