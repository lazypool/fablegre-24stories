import { Animated, Text, View } from 'react-native';
import { stories } from '../data/stories';
import { useStory } from '../ctx/StoryContext';
import { useStoryTransition } from '../hooks/useStoryTransition';

type PlaceholderScreenProps = {
  title: string;
  description: string;
};

export default function PlaceholderScreen({ title, description }: PlaceholderScreenProps) {
  const { selectedStory } = useStory();
  const { displayedStoryId, translateX } = useStoryTransition(selectedStory.id);
  const displayedStory = stories.find((story) => story.id === displayedStoryId) ?? selectedStory;

  return (
    <Animated.View className="flex-1 bg-slate-50" style={{ flex: 1, transform: [{ translateX }] }}>
      <View className="px-6 pt-6 pb-2">
        <Text className="text-3xl font-bold tracking-normal text-slate-900">{displayedStory.title}</Text>
      </View>
      <View className="px-6 pt-4">
        <Text className="text-base font-semibold text-slate-700">{title}</Text>
        <Text className="mt-2 text-base leading-6 text-slate-500">{description}</Text>
      </View>
    </Animated.View>
  );
}
