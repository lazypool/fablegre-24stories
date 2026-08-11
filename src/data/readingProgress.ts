import AsyncStorage from '@react-native-async-storage/async-storage';

const READING_PROGRESS_KEY = '@reading_progress';

export async function loadReadingProgress(storyId: string): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(READING_PROGRESS_KEY);
    if (!raw) return 0;
    const map = JSON.parse(raw) as Record<string, number>;
    return map[storyId] ?? 0;
  } catch {
    return 0;
  }
}

export async function saveReadingProgress(storyId: string, progress: number): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(READING_PROGRESS_KEY);
    const map = raw ? (JSON.parse(raw) as Record<string, number>) : {};
    map[storyId] = progress;
    await AsyncStorage.setItem(READING_PROGRESS_KEY, JSON.stringify(map));
  } catch {
    // no-op: progress persistence must never block reading.
  }
}
