import Svg, { Path } from 'react-native-svg';

import { useTheme } from '../ctx/ThemeContext';

type IconProps = { focused: boolean };

function resolveColor(focused: boolean, themeColor: string) {
  return focused ? themeColor : '#94A3B8';
}

export function BookIcon({ focused }: IconProps) {
  const { theme } = useTheme();
  const color = resolveColor(focused, theme.color);
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3.5 7.5c2.8-.8 5.5-.2 8.5 1.8v10c-3-2-5.7-2.6-8.5-1.8v-10Z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M20.5 7.5c-2.8-.8-5.5-.2-8.5 1.8v10c3-2 5.7-2.6 8.5-1.8v-10Z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M12 9.3v10" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

export function GraduationCapIcon({ focused }: IconProps) {
  const { theme } = useTheme();
  const color = resolveColor(focused, theme.color);
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="m3 9 9-5 9 5-9 5-9-5Z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
      <Path d="M7 11.2V16c2.7 2 7.3 2 10 0v-4.8M21 9v6" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

export function ExamIcon({ focused }: IconProps) {
  const { theme } = useTheme();
  const color = resolveColor(focused, theme.color);
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="m14.5 14.5 5 5" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13Z" stroke={color} strokeWidth={1.8} />
    </Svg>
  );
}

export function NotebookIcon({ focused }: IconProps) {
  const { theme } = useTheme();
  const color = resolveColor(focused, theme.color);
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 3.5h9l3 3V20.5H6a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2Z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      <Path
        d="M15 3.5v4h3M8 12h8M8 16h6"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
