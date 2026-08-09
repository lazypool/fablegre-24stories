import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BookIcon, ExamIcon, GraduationCapIcon, NotebookIcon } from './src/components/TabIcons';
import ThemeController from './src/components/ThemeController';
import { PageScrollProvider } from './src/navigation/PageScrollContext';
import PlaceholderScreen from './src/pages/PlaceholderScreen';
import ReadingScreen from './src/pages/ReadingScreen';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';

import './global.css';

const Tab = createBottomTabNavigator();

function AppNavigation() {
  const { theme } = useTheme();

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <ThemeController />
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
    </NavigationContainer>
  );
}

export default function App() {
  return <ThemeProvider><PageScrollProvider><AppNavigation /></PageScrollProvider></ThemeProvider>;
}
