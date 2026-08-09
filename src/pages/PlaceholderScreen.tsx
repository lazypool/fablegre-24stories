import { SafeAreaView, Text, View } from 'react-native';

type PlaceholderScreenProps = {
  title: string;
  description: string;
};

export default function PlaceholderScreen({ title, description }: PlaceholderScreenProps) {
  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="flex-1 justify-center p-6">
        <Text className="text-[28px] font-bold tracking-normal text-slate-900">{title}</Text>
        <Text className="mt-2 text-base leading-6 text-slate-500">{description}</Text>
      </View>
    </SafeAreaView>
  );
}
