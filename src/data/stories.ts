import type { Story, StoryParagraph } from '../types/story';

export { stories } from './assets';

export type ParsedStory = { paragraphs: StoryParagraph[] };

const allStories = require('./all-stories.json') as Record<string, ParsedStory>;
const storyCache = new Map<string, ParsedStory>();

export function loadStory(story: Story): ParsedStory {
  const hit = storyCache.get(story.id);
  if (hit) return hit;
  const data = allStories[story.id];
  if (!data) throw new Error('Story not found');
  storyCache.set(story.id, data);
  return data;
}
