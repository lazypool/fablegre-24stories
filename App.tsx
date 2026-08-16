import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { BookIcon, ExamIcon, GraduationCapIcon, NotebookIcon } from './src/comps/TabIcons';
import StoryDrawer from './src/comps/StoryDrawer';
import ThemeController from './src/comps/ThemeController';
import { stories } from './src/data/stories';
import { StoryProvider, useStory } from './src/ctx/StoryContext';
import { TabBarHeightProvider, useTabBarHeight } from './src/ctx/TabBarHeightContext';
import { WordProvider } from './src/ctx/WordContext';
import PlaceholderScreen from './src/pages/PlaceholderScreen';
import ReadingScreen from './src/pages/ReadingScreen';
import WordsScreen from './src/pages/WordsScreen';
import { ThemeProvider, useTheme } from './src/ctx/ThemeContext';
import type { Story } from './src/types/story';

import './global.css';

const Tab = createBottomTabNavigator();

function AppNavigation() {
  const { theme } = useTheme();
  const { selectedStory, selectStory } = useStory();
  const { tabBarHeight } = useTabBarHeight();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('Read');

  return (
    <NavigationContainer onStateChange={(state) => setActiveTab(state?.routes[state.index]?.name ?? 'Read')}>
      <StatusBar style="dark" />
      <View style={{ paddingTop: insets.top }} className="flex-1">
        <ThemeController activeTab={activeTab} selectedStoryId={selectedStory.id} />
        <Tab.Navigator
          screenOptions={{ headerShown: false, tabBarActiveTintColor: theme.color, tabBarInactiveTintColor: '#94A3B8' }}
        >
          <Tab.Screen
            name="Read"
            component={ReadingScreen}
            options={{ title: '读小说', tabBarIcon: ({ focused }) => <BookIcon focused={focused} /> }}
          />
          <Tab.Screen
            name="Words"
            component={WordsScreen}
            options={{ title: '记单词', tabBarIcon: ({ focused }) => <GraduationCapIcon focused={focused} /> }}
          />
          <Tab.Screen
            name="Quiz"
            options={{ title: '做测试', tabBarIcon: ({ focused }) => <ExamIcon focused={focused} /> }}
            children={() => <PlaceholderScreen title="做测试" description="选择题练习将在这里开始。" />}
          />
          <Tab.Screen
            name="Review"
            options={{ title: '生词本', tabBarIcon: ({ focused }) => <NotebookIcon focused={focused} /> }}
            children={() => <PlaceholderScreen title="生词本" description="需要复习的单词将在这里显示。" />}
          />
        </Tab.Navigator>
        {activeTab !== 'Review' && tabBarHeight > 0 ? (
          <View style={{ bottom: tabBarHeight, left: 0, pointerEvents: 'box-none', position: 'absolute', right: 0 }}>
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
    <SafeAreaProvider>
      <ThemeProvider>
        <StoryProvider>
          <WordProvider>
            <TabBarHeightProvider>
              <AppNavigation />
            </TabBarHeightProvider>
          </WordProvider>
        </StoryProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
