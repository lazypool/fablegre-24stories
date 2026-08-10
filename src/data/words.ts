import { Asset } from 'expo-asset';
import { File } from 'expo-file-system';
import { Platform } from 'react-native';

import type { WordChunkId, WordRecord } from '../types/word';
import { wordPartAssets } from './assets';

const PART_SIZE = 50;
const WORD_CACHE_LIMIT = 300;

export function wordChunkIdForStory(storyId: string): WordChunkId {
  return `chunk_${storyId.slice(-3)}`;
}

const wordCache = new Map<string, WordRecord>();
const partInflight = new Map<string, Promise<WordRecord[]>>();

function getCached(word: string): WordRecord | undefined {
  const record = wordCache.get(word);
  if (record) {
    wordCache.delete(word);
    wordCache.set(word, record);
  }
  return record;
}

function putRecords(records: WordRecord[]) {
  for (const record of records) {
    wordCache.delete(record.word);
    wordCache.set(record.word, record);
  }
  while (wordCache.size > WORD_CACHE_LIMIT) {
    wordCache.delete(wordCache.keys().next().value as string);
  }
}

async function loadAssetText(assetId: number): Promise<string> {
  const asset = Asset.fromModule(assetId);
  await asset.downloadAsync();
  const uri = asset.localUri ?? asset.uri;
  return Platform.OS === 'web' ? fetch(uri).then(async (response) => {
    if (!response.ok) throw new Error('Word asset request failed.');
    return response.text();
  }) : new File(uri).text();
}

function loadPart(chunkId: WordChunkId, partIndex: number): Promise<WordRecord[]> {
  const key = `${chunkId}/${partIndex}`;
  const inflight = partInflight.get(key);
  if (inflight) return inflight;

  const task = loadAssetText(wordPartAssets[chunkId][partIndex]).then((source) => {
    const records = JSON.parse(source) as WordRecord[];
    if (!Array.isArray(records) || records.length === 0) throw new Error('Word part is empty.');
    return records.map((record) => ({
      ...record,
      chineseMeaning: record.chineseMeaning.replace(/\\n/g, '\n'),
    }));
  });
  partInflight.set(key, task);
  void task.finally(() => partInflight.delete(key));
  return task;
}

export function prefetchPart(chunkId: WordChunkId, partIndex: number): void {
  if (partIndex < 0 || partIndex >= wordPartAssets[chunkId].length) return;
  void loadPart(chunkId, partIndex).catch(() => {});
}

export function prefetchPartForSequence(chunkId: WordChunkId, sequence: number): void {
  prefetchPart(chunkId, Math.floor(sequence / PART_SIZE));
}

export async function getWordRecord(chunkId: WordChunkId, sequence: number, word: string): Promise<WordRecord | null> {
  const hit = getCached(word);
  if (hit) return hit;

  const partIndex = Math.floor(sequence / PART_SIZE);
  const assetId = wordPartAssets[chunkId][partIndex];
  if (assetId === undefined) return null;

  const records = await loadPart(chunkId, partIndex);
  putRecords(records);
  prefetchPart(chunkId, partIndex + 1);
  return getCached(word) ?? null;
}
