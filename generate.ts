import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const STORIES_DIR = join(__dirname, 'data', 'stories');
const WORDS_DIR = join(__dirname, 'data', 'words');
const OUT_DIR = join(__dirname, 'src', 'data');

type EnglishSegment = { text: string; word: string | null; isItalic: boolean };
type StoryParagraph = { english: string; chinese: string; segments: EnglishSegment[] };
type WordRecord = {
  word: string;
  meaning: string;
  synonyms: string[];
  chineseMeaning: string;
  englishMeaning: string;
  distractors: string[];
  paragraph: number;
};

// ── Parse stories ──

function splitEnglish(english: string): EnglishSegment[] {
  return english
    .split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g)
    .filter(Boolean)
    .map((part) => {
      const bold = part.match(/^\*\*([^*]+)\*\*$/);
      if (bold) {
        const word = bold[1].trim();
        return { text: word, word, isItalic: false };
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
    .map((b) => b.trim())
    .filter(Boolean)
    .filter((b) => !b.startsWith('#'));
  const paragraphs: StoryParagraph[] = [];
  for (let i = 0; i + 1 < blocks.length; i += 2) {
    const english = blocks[i];
    paragraphs.push({ english, chinese: blocks[i + 1], segments: splitEnglish(english) });
  }
  return { paragraphs };
}

const storyFiles = readdirSync(STORIES_DIR).filter((f) => f.endsWith('.md'));
const allStories: Record<string, { paragraphs: StoryParagraph[] }> = {};

for (const file of storyFiles) {
  const storyId = file.replace('.md', '');
  const source = readFileSync(join(STORIES_DIR, file), 'utf8');
  allStories[storyId] = parseStory(source);
  console.log(`  story: ${storyId} (${allStories[storyId].paragraphs.length} paragraphs)`);
}

writeFileSync(join(OUT_DIR, 'all-stories.json'), JSON.stringify(allStories));
console.log(`✓ all-stories.json (${storyFiles.length} stories)`);

// ── Parse words ──

const chunkDirs = readdirSync(WORDS_DIR).filter((d) => d.startsWith('chunk_'));
const allWords: Record<string, Record<string, WordRecord>> = {};

for (const chunkDir of chunkDirs) {
  const storyId = `story_${chunkDir.slice(-3)}`;
  const partFiles = readdirSync(join(WORDS_DIR, chunkDir))
    .filter((f) => f.endsWith('.words'))
    .sort();
  const wordMap: Record<string, WordRecord> = {};

  for (const partFile of partFiles) {
    const records = JSON.parse(readFileSync(join(WORDS_DIR, chunkDir, partFile), 'utf8')) as WordRecord[];
    for (const record of records) {
      wordMap[record.word] = { ...record, chineseMeaning: record.chineseMeaning.replace(/\\n/g, '\n') };
    }
  }

  allWords[storyId] = wordMap;
  console.log(`  words: ${storyId} (${Object.keys(wordMap).length} words)`);
}

writeFileSync(join(OUT_DIR, 'all-words.json'), JSON.stringify(allWords));
console.log(`✓ all-words.json (${chunkDirs.length} chunks)`);
