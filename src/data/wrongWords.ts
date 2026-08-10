import AsyncStorage from '@react-native-async-storage/async-storage';

const WRONG_WORDS_KEY = '@wrong_words';

export async function loadWrongWords(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(WRONG_WORDS_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export async function addWrongWord(word: string): Promise<boolean> {
  const words = await loadWrongWords();
  if (words.includes(word)) return false;
  words.push(word);
  await AsyncStorage.setItem(WRONG_WORDS_KEY, JSON.stringify(words));
  return true;
}
