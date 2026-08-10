export type WordChunkId = `chunk_${string}`;

export type WordRecord = {
  word: string;
  meaning: string;
  synonyms: string[];
  chineseMeaning: string;
  englishMeaning: string;
  distractors: string[];
  paragraph: number;
};
