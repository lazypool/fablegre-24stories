import { Asset } from 'expo-asset';
import { File } from 'expo-file-system';
import { Platform } from 'react-native';

import type { Story, StoryParagraph } from '../types/story';

export const stories: Story[] = [
  ['Fog Harbor', require('../../data/stories/story_001.md')], ['Orbital Misdelivery', require('../../data/stories/story_002.md')],
  ['The Dry Crossing', require('../../data/stories/story_003.md')], ['Orchard Fire', require('../../data/stories/story_004.md')],
  ['Clocktower Inquest', require('../../data/stories/story_005.md')], ['The Glass Vault', require('../../data/stories/story_006.md')],
  ['Winter Frequency', require('../../data/stories/story_007.md')], ['Weather Museum', require('../../data/stories/story_008.md')],
  ['River Election', require('../../data/stories/story_009.md')], ['Observatory Visitor', require('../../data/stories/story_010.md')],
  ['Firewatch Map', require('../../data/stories/story_011.md')], ['Underground Aria', require('../../data/stories/story_012.md')],
  ['Night Express', require('../../data/stories/story_013.md')], ['Conservatory Revolt', require('../../data/stories/story_014.md')],
  ['Lighthouse Debt', require('../../data/stories/story_015.md')], ['Desert Archive', require('../../data/stories/story_016.md')],
  ['Alpine Rescue', require('../../data/stories/story_017.md')], ['Harbor Masquerade', require('../../data/stories/story_018.md')],
  ['Circuit Court', require('../../data/stories/story_019.md')], ['Midnight Orchard', require('../../data/stories/story_020.md')],
  ['Arctic Relay', require('../../data/stories/story_021.md')], ['Silent Picture', require('../../data/stories/story_022.md')],
  ['Embassy Garden', require('../../data/stories/story_023.md')], ['Last Bell', require('../../data/stories/story_024.md')],
].map(([title, asset], index) => ({
  id: `story_${String(index + 1).padStart(3, '0')}`,
  title: title as string,
  asset: asset as number,
}));

function parseStory(source: string): StoryParagraph[] {
  const blocks = source.split(/\r?\n\s*\r?\n/).map((block) => block.trim()).filter(Boolean).filter((block) => !block.startsWith('#'));
  const paragraphs: StoryParagraph[] = [];

  for (let index = 0; index + 1 < blocks.length; index += 2) {
    paragraphs.push({ english: blocks[index], chinese: blocks[index + 1] });
  }

  return paragraphs;
}

export async function loadStory(story: Story): Promise<StoryParagraph[]> {
  const asset = Asset.fromModule(story.asset);
  await asset.downloadAsync();
  const uri = asset.localUri ?? asset.uri;
  const source = Platform.OS === 'web'
    ? await fetch(uri).then(async (response) => {
        if (!response.ok) throw new Error('Story asset request failed.');
        return response.text();
      })
    : await new File(uri).text();
  const paragraphs = parseStory(source);

  if (paragraphs.length === 0) throw new Error('Story could not be parsed.');

  return paragraphs;
}
