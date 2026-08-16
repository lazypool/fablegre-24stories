import { memo, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { addWrongWord, loadWrongWords } from '../data/wrongWords';
import { useTheme } from '../ctx/ThemeContext';
import type { WordRecord } from '../types/word';

type CardButton = {
  label: string;
  onPress: () => void;
};

type WordCardProps = {
  record: WordRecord | null;
  word?: string | null;
  buttons?: CardButton[];
  isAdded?: boolean;
  onAddToWrongWords?: (word: string) => void;
};

function WordCard({ record, word, buttons, isAdded: isAddedProp, onAddToWrongWords }: WordCardProps) {
  const { theme } = useTheme();
  const [internalAdded, setInternalAdded] = useState(false);

  const isAdded = isAddedProp !== undefined ? isAddedProp : internalAdded;

  useEffect(() => {
    if (!record) return;
    if (isAddedProp !== undefined) return;

    let isActive = true;
    void loadWrongWords().then((words) => {
      if (isActive) setInternalAdded(words.includes(record.word));
    });

    return () => {
      isActive = false;
    };
  }, [record, isAddedProp]);

  function handleAdd() {
    if (!record || isAdded) return;
    if (onAddToWrongWords) {
      onAddToWrongWords(record.word);
    } else {
      void addWrongWord(record.word)
        .then(() => setInternalAdded(true))
        .catch(() => {});
    }
  }

  return (
    <View className="rounded-2xl bg-white p-6">
      <Text className="text-3xl font-bold" style={{ color: theme.color }}>
        {record?.word ?? word ?? ''}
      </Text>
      {record ? (
        <>
          <Text className="mt-4 text-base leading-6 text-slate-800">{record.chineseMeaning}</Text>
          <View className="my-4 h-px bg-slate-200" />
          <Text className="text-[15px] leading-6 text-slate-600">{record.englishMeaning}</Text>
          {record.synonyms.length > 0 ? (
            <View className="mt-4 flex-row flex-wrap gap-2">
              {record.synonyms.map((synonym) => (
                <View key={synonym} className="rounded-full bg-slate-100 px-3 py-1">
                  <Text className="text-xs text-slate-600">{synonym}</Text>
                </View>
              ))}
            </View>
          ) : null}
          <View className="mt-6 flex-row gap-3">
            {buttons?.map((btn, i) => (
              <Pressable
                key={i}
                className="flex-1 items-center rounded-xl py-3"
                style={{ backgroundColor: theme.color }}
                onPress={btn.onPress}
              >
                <Text className="text-[15px] font-semibold text-white">{btn.label}</Text>
              </Pressable>
            ))}
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
    </View>
  );
}

export default memo(WordCard);
