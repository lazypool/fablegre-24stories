import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, Text, View } from 'react-native';

import { addWrongWord, loadWrongWords } from '../data/wrongWords';
import { useTheme } from '../theme/ThemeContext';
import type { WordRecord } from '../types/word';

type WordMeaningCardProps = {
  record: WordRecord | null;
  word: string | null;
  onLocate: () => void;
  onRequestClose: () => void;
};

export default function WordMeaningCard({ record, word, onLocate, onRequestClose }: WordMeaningCardProps) {
  const { theme } = useTheme();
  const [displayRecord, setDisplayRecord] = useState<WordRecord | null>(null);
  const [isAdded, setAdded] = useState(false);

  useEffect(() => {
    if (!record) return;

    setDisplayRecord(record);
    setAdded(false);

    let isActive = true;
    void loadWrongWords().then((words) => {
      if (isActive) setAdded(words.includes(record.word));
    });

    return () => {
      isActive = false;
    };
  }, [record]);

  function handleAdd() {
    if (!displayRecord || isAdded) return;
    void addWrongWord(displayRecord.word)
      .then(() => setAdded(true))
      .catch(() => {});
  }

  return (
    <Modal animationType="fade" transparent visible={record !== null || word !== null} onRequestClose={onRequestClose}>
      <Pressable className="flex-1 items-center justify-center bg-black/40 px-6 py-24" onPress={onRequestClose}>
        <Pressable className="w-full max-w-md rounded-2xl bg-white p-6" accessible={false} onPress={() => {}}>
          <Text className="text-2xl font-bold text-slate-900">{displayRecord?.word ?? word ?? ''}</Text>
          {displayRecord ? (
            <>
              <Text className="mt-3 text-[15px] leading-6 text-slate-800">{displayRecord.chineseMeaning}</Text>
              <View className="my-4 h-px bg-slate-200" />
              <Text className="text-[15px] leading-6 text-slate-600">{displayRecord.englishMeaning}</Text>
              {displayRecord.synonyms.length > 0 ? (
                <View className="mt-4 flex-row flex-wrap gap-2">
                  {displayRecord.synonyms.map((synonym) => (
                    <View key={synonym} className="rounded-full bg-slate-100 px-3 py-1">
                      <Text className="text-xs text-slate-600">{synonym}</Text>
                    </View>
                  ))}
                </View>
              ) : null}
              <View className="mt-6 flex-row gap-3">
                <Pressable
                  className="flex-1 items-center rounded-xl py-3"
                  style={{ backgroundColor: theme.color }}
                  onPress={onLocate}
                >
                  <Text className="text-[15px] font-semibold text-white">定位原文</Text>
                </Pressable>
                <Pressable
                  className="flex-1 items-center rounded-xl py-3"
                  style={{ backgroundColor: isAdded ? '#94A3B8' : theme.color }}
                  disabled={isAdded}
                  onPress={handleAdd}
                >
                  <Text className="text-[15px] font-semibold text-white">{isAdded ? '已加入' : '加入生词本'}</Text>
                </Pressable>
              </View>
            </>
          ) : (
            <View className="mt-8 items-center justify-center py-4">
              <ActivityIndicator color={theme.color} />
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
