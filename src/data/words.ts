import type { WordRecord } from '../types/word';

const allWords = require('./all-words.json') as Record<string, Record<string, WordRecord>>;
const banks = new Map<string, Map<string, WordRecord>>();
const storyWordLists = new Map<string, WordRecord[]>();

export function getWordBank(storyId: string): Map<string, WordRecord> {
  const hit = banks.get(storyId);
  if (hit) return hit;
  const raw = allWords[storyId];
  const bank = raw ? new Map(Object.entries(raw)) : new Map<string, WordRecord>();
  banks.set(storyId, bank);
  return bank;
}

export function getWordsByStory(storyId: string): WordRecord[] {
  const cached = storyWordLists.get(storyId);
  if (cached) return cached;
  const bank = getWordBank(storyId);
  const list = Array.from(bank.values());
  storyWordLists.set(storyId, list);
  return list;
}
