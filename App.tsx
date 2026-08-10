import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useState } from 'react';
import { View } from 'react-native';
import { BookIcon, ExamIcon, GraduationCapIcon, NotebookIcon } from './src/components/TabIcons';
import StoryDrawer from './src/components/StoryDrawer';
import ThemeController from './src/components/ThemeController';
import { stories } from './src/data/stories';
import { PageScrollProvider } from './src/navigation/PageScrollContext';
import { StoryProvider, useStory } from './src/navigation/StoryContext';
import { WordProvider } from './src/navigation/WordContext';
import PlaceholderScreen from './src/pages/PlaceholderScreen';
import ReadingScreen from './src/pages/ReadingScreen';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import type { Story } from './src/types/story';

import './global.css';

const Tab = createBottomTabNavigator();

function AppNavigation() {
  const { theme } = useTheme();
  const { selectedStory, selectStory } = useStory();
  const [activeTab, setActiveTab] = useState('Read');

  return (
    <NavigationContainer onStateChange={(state) => setActiveTab(state?.routes[state.index]?.name ?? 'Read')}>
      <StatusBar style="dark" />
      <ThemeController />
      <View className="flex-1">
        <Tab.Navigator screenOptions={{ headerShown: false, tabBarActiveTintColor: theme.color }}>
          <Tab.Screen
            name="Read"
            component={ReadingScreen}
            options={{ title: '读小说', tabBarIcon: ({ color }) => <BookIcon color={color} /> }}
          />
          <Tab.Screen
            name="Words"
            options={{ title: '记单词', tabBarIcon: ({ color }) => <GraduationCapIcon color={color} /> }}
            children={() => <PlaceholderScreen title="记单词" description="词条浏览将在这里开始。" />}
          />
          <Tab.Screen
            name="Quiz"
            options={{ title: '做测试', tabBarIcon: ({ color }) => <ExamIcon color={color} /> }}
            children={() => <PlaceholderScreen title="做测试" description="选择题练习将在这里开始。" />}
          />
          <Tab.Screen
            name="Review"
            options={{ title: '生词本', tabBarIcon: ({ color }) => <NotebookIcon color={color} /> }}
            children={() => <PlaceholderScreen title="生词本" description="需要复习的单词将在这里显示。" />}
          />
        </Tab.Navigator>
        {activeTab !== 'Review' ? (
          <View style={{ bottom: 48, left: 0, pointerEvents: 'box-none', position: 'absolute', right: 0 }}>
            <SharedStoryDrawer selectedStoryId={selectedStory.id} onSelect={selectStory} />
          </View>
        ) : null}
      </View>
    </NavigationContainer>
  );
}

function SharedStoryDrawer({
  selectedStoryId,
  onSelect,
}: {
  selectedStoryId: string;
  onSelect: (story: Story) => void;
}) {
  const [isOpen, setOpen] = useState(false);

  return (
    <StoryDrawer
      isOpen={isOpen}
      selectedStoryId={selectedStoryId}
      stories={stories}
      onSelect={onSelect}
      onToggle={() => setOpen((open) => !open)}
    />
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <PageScrollProvider>
        <StoryProvider>
          <WordProvider>
            <AppNavigation />
          </WordProvider>
        </StoryProvider>
      </PageScrollProvider>
    </ThemeProvider>
  );
}
