import { useEffect, useMemo, useState } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';

import { stories } from '../data/stories';
import { useStory } from '../ctx/StoryContext';
import { useStoryTransition } from '../hooks/useStoryTransition';
import { useWordBank } from '../ctx/WordContext';
import { useTheme } from '../ctx/ThemeContext';
import { addWrongWord } from '../data/wrongWords';
import type { WordRecord } from '../types/word';

const OPTION_COUNT = 4;

function buildOptions(correct: WordRecord, words: WordRecord[]) {
  const distractors = words
    .filter((word) => word.word !== correct.word && word.englishMeaning !== correct.englishMeaning)
    .sort(() => Math.random() - 0.5)
    .slice(0, OPTION_COUNT - 1);

  return [...distractors, correct].sort(() => Math.random() - 0.5);
}

export default function QuizScreen() {
  const { selectedStory } = useStory();
  const { displayedStoryId, translateX } = useStoryTransition(selectedStory.id);
  const { getWordRecordsByStory } = useWordBank();
  const { theme } = useTheme();
  const displayedStory = stories.find((story) => story.id === displayedStoryId) ?? selectedStory;
  const words = getWordRecordsByStory(displayedStory.id);
  const [question, setQuestion] = useState<WordRecord | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  useEffect(() => {
    const storyWords = getWordRecordsByStory(displayedStoryId);
    setQuestion(storyWords[Math.floor(Math.random() * storyWords.length)] ?? null);
    setSelectedAnswer(null);
  }, [displayedStoryId, getWordRecordsByStory]);

  const options = useMemo(() => (question ? buildOptions(question, words) : []), [question, words]);

  function selectAnswer(answer: WordRecord) {
    if (selectedAnswer || !question) return;
    setSelectedAnswer(answer.word);
  }

  function nextQuestion() {
    setQuestion(words[Math.floor(Math.random() * words.length)] ?? null);
    setSelectedAnswer(null);
  }

  async function handleAction() {
    if (!question) return;
    if (selectedAnswer === question.word) {
      nextQuestion();
      return;
    }
    await addWrongWord(question.word);
    nextQuestion();
  }

  return (
    <Animated.View className="flex-1 bg-slate-50" style={{ flex: 1, transform: [{ translateX }] }}>
      <View className="px-6 pt-6 pb-2">
        <Text className="text-3xl font-bold tracking-normal text-slate-900">{displayedStory.title}</Text>
      </View>
      <View className="flex-1 px-6 pt-4" key={displayedStory.id}>
        {words.length === 0 ? (
          <Text className="text-base text-slate-500">暂无可测试的单词</Text>
        ) : question ? (
          <View>
            <View className="mt-8 rounded-2xl bg-white p-6">
              <Text className="text-center text-3xl font-bold" style={{ color: theme.color }}>
                {question.word}
              </Text>
              {selectedAnswer ? (
                <Text className="mt-2 text-center text-sm text-slate-400">{question.chineseMeaning}</Text>
              ) : null}
            </View>
            <View className="mt-5 gap-3">
              {options.map((option, index) => {
                const isSelected = selectedAnswer === option.word;
                const isCorrect = option.word === question.word;
                const backgroundColor = !selectedAnswer
                  ? '#FFFFFF'
                  : isCorrect
                    ? '#DCFCE7'
                    : isSelected
                      ? '#FEE2E2'
                      : '#FFFFFF';
                return (
                  <Pressable
                    key={option.word}
                    className="rounded-xl border border-slate-200 px-4 py-4"
                    style={{ backgroundColor }}
                    onPress={() => selectAnswer(option)}
                  >
                    <Text className="text-base text-slate-800">
                      {String.fromCharCode(65 + index)}. {option.englishMeaning}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            {selectedAnswer ? (
              <Pressable
                className="mt-6 items-center rounded-xl py-3"
                style={{ backgroundColor: theme.color }}
                onPress={handleAction}
              >
                <Text className="font-semibold text-white">
                  {selectedAnswer === question.word ? '下一题' : '加入生词本'}
                </Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </View>
    </Animated.View>
  );
}
