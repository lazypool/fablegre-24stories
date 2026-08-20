import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const STORIES_DIR = join(__dirname, 'data', 'stories');
const WORDS_DIR = join(__dirname, 'data', 'words');
const OUT_DIR = join(__dirname, 'src', 'data');

type EnglishSegment = { text: string; word: string | null; isItalic: boolean };
type StoryParagraph = { english: string; chinese: string; segments: EnglishSegment[] };
type WordRecord = {
  word: string;
  synonyms: string[];
  chineseMeaning: string;
  englishMeaning: string;
  distractors: string[];
  paragraph: number;
};

function splitEnglish(english: string): EnglishSegment[] {
  return english
    .split(/(\*\*[^*]+\*\*[A-Za-z]*|\*[^*]+\*)/g)
    .filter(Boolean)
    .map((part) => {
      const bold = part.match(/^\*\*([^*]+)\*\*([A-Za-z]*)$/);
      if (bold) {
        const word = bold[1].trim();
        return { text: `${word}${bold[2]}`, word, isItalic: false };
      }
      const italic = part.match(/^\*([^*]+)\*$/);
      return italic
        ? { text: italic[1].trim(), word: null, isItalic: true }
        : { text: part, word: null, isItalic: false };
    });
}

function parseStory(source: string): { paragraphs: StoryParagraph[] } {
  const blocks = source
    .split(/\r?\n\s*\r?\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .filter((block) => !block.startsWith('#'));
  const paragraphs: StoryParagraph[] = [];
  for (let i = 0; i + 1 < blocks.length; i += 2) {
    const english = blocks[i];
    paragraphs.push({ english, chinese: blocks[i + 1], segments: splitEnglish(english) });
  }
  return { paragraphs };
}

const storyFiles = readdirSync(STORIES_DIR)
  .filter((file) => /^story_\d+\.md$/.test(file))
  .sort();
const allStories: Record<string, { paragraphs: StoryParagraph[] }> = {};
const allWords: Record<string, Record<string, WordRecord>> = {};

for (const storyFile of storyFiles) {
  const storyId = storyFile.replace('.md', '');
  const chunkId = storyId.replace('story_', 'chunk_');
  const { paragraphs } = parseStory(readFileSync(join(STORIES_DIR, storyFile), 'utf8'));
  const records = JSON.parse(readFileSync(join(WORDS_DIR, `${chunkId}.words`), 'utf8')) as WordRecord[];
  const wordMap = Object.fromEntries(
    records.map((record) => [
      record.word,
      { ...record, chineseMeaning: record.chineseMeaning.replace(/\\n/g, '\n'), paragraph: 0 },
    ]),
  ) as Record<string, WordRecord>;

  paragraphs.forEach((paragraph, paragraphIndex) => {
    for (const segment of paragraph.segments) {
      if (!segment.word) continue;
      if (!wordMap[segment.word]) {
        throw new Error(`${storyId}: highlighted word "${segment.word}" has no word record`);
      }
      if (wordMap[segment.word].paragraph === 0) wordMap[segment.word].paragraph = paragraphIndex + 1;
    }
  });

  for (const word of Object.keys(wordMap)) {
    if (wordMap[word].paragraph === 0)
      throw new Error(`${storyId}: word record "${word}" is not highlighted in the story`);
  }

  allStories[storyId] = { paragraphs };
  allWords[storyId] = wordMap;
  console.log(`  ${storyId}: ${paragraphs.length} paragraphs, ${records.length} words`);
}

writeFileSync(join(OUT_DIR, 'all-stories.json'), JSON.stringify(allStories));
writeFileSync(join(OUT_DIR, 'all-words.json'), JSON.stringify(allWords));
console.log(`Generated ${storyFiles.length} stories and ${Object.keys(allWords).length} word banks`);
